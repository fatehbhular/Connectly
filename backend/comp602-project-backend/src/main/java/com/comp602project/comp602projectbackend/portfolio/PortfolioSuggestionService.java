package com.comp602project.comp602projectbackend.portfolio;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PortfolioSuggestionService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioSuggestionService.class);

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.1-8b-instant";

    private static final String UNAVAILABLE =
            "AI suggestions are temporarily unavailable. Please try again in a moment.";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${groq.api.key:}")
    private String groqApiKey;

    public PortfolioSuggestionsResponse suggest(User user) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("Portfolio suggestions requested but GROQ_API_KEY is not set");
            throw new PortfolioSuggestionException(UNAVAILABLE);
        }

        try {
            PortfolioSuggestionsResponse ai = callGroq(user);
            if (ai != null) return ai;
            log.warn("Groq returned no usable suggestions for user {}", user.getUserId());
            throw new PortfolioSuggestionException(UNAVAILABLE);
        } catch (PortfolioSuggestionException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Groq suggestion failed for user {}: {}", user.getUserId(), e.getMessage());
            throw new PortfolioSuggestionException(UNAVAILABLE);
        }
    }

    private PortfolioSuggestionsResponse callGroq(User user) throws Exception {
        String prompt = buildPrompt(user);
        Map<String, Object> body = Map.of(
                "model", MODEL,
                "temperature", 0.45,
                "max_tokens", 1400,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_URL))
                .timeout(Duration.ofSeconds(25))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("Groq HTTP {}: {}", response.statusCode(), response.body());
            return null;
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").path(0).path("message").path("content").asText("");
        PortfolioSuggestionsResponse parsed = parseAiResponse(content);
        return parsed != null ? filterForUser(parsed, user) : null;
    }

    private static final String SYSTEM_PROMPT = """
            You are an expert career coach and portfolio strategist for Connectly, a professional \
            networking app where users swipe to connect, message, and showcase skills and projects.

            Your job is to read one user's profile and output ONLY valid JSON — no markdown, no code fences, \
            no explanation before or after the JSON object.

            Every suggestion must feel written for that specific person: reference their industry, city, bio, \
            and skill gaps. Never give generic advice that could apply to anyone.

            Output must match this schema exactly:
            {"skills":["...","...","..."],"projects":[{"title":"...","description":"...","skillsUsed":["..."]}]}
            """;

    private String buildPrompt(User user) {
        String displayName = blankTo(user.getDisplayName(), user.getUsername());
        String industry = blankTo(user.getIndustry(), "general professional");
        String city = blankTo(user.getLocation(), "unknown location");
        String bio = blankTo(user.getBio(), "No bio yet");
        String portfolioUrl = blankTo(user.getPortfolioUrl(), "none");
        String skills = user.getSkills() != null && user.getSkills().length > 0
                ? String.join(", ", user.getSkills())
                : "none listed";
        int connectionCount = user.getConnectionKeys() != null ? user.getConnectionKeys().size() : 0;

        return """
                Analyse this Connectly user and generate personalised portfolio suggestions they can act on \
                within the next 2–4 weeks.

                === USER PROFILE ===
                Display name: %s
                Industry: %s
                City: %s
                Bio: %s
                Portfolio URL: %s
                Current skills (never repeat or rephrase any of these): %s
                Connections on Connectly: %d

                === SKILLS TO SUGGEST (exactly 3) ===
                - Each skill name must be 1–3 words (e.g. "Docker", "User Research", "Financial Modelling").
                - Pick skills that fill clear gaps relative to their industry and current list.
                - Prefer skills that make them more discoverable and credible to peers in %s.
                - Skills should be learnable and demonstrable — not vague traits like "Leadership" unless \
                industry-appropriate and specific.
                - Do NOT duplicate anything in their current skills list (case-insensitive).

                === PROJECT IDEAS (exactly 2) ===
                For each project:
                - title: specific and concrete (not "Build a portfolio" — name the actual deliverable).
                - description: exactly ONE sentence, 18–28 words, starting with a verb. Say what to build/write/ship, \
                who it helps, and what to add to their Connectly profile when done.
                - skillsUsed: array of 2–4 skill names (mix of their current skills and your 3 suggested skills where \
                relevant).

                Project constraints:
                - Scoped for a student or early-career professional with limited time.
                - Tie at least one project to their city, industry, or bio when possible.
                - Projects should produce something they can mention in intro messages when connecting on Connectly.
                - Avoid enterprise-scale ideas (no "build a SaaS platform" — think case study, tool, write-up, or demo).

                === OUTPUT ===
                Return ONLY this JSON object (no other text):
                {"skills":["skill1","skill2","skill3"],"projects":[{"title":"...","description":"...","skillsUsed":["...","..."]},{"title":"...","description":"...","skillsUsed":["...","..."]}]}
                """.formatted(
                displayName,
                industry,
                city,
                bio,
                portfolioUrl,
                skills,
                connectionCount,
                industry
        );
    }

    private PortfolioSuggestionsResponse filterForUser(PortfolioSuggestionsResponse response, User user) {
        Set<String> existing = normalizeSkills(user.getSkills());

        List<String> skills = response.getSkills().stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .filter(s -> !existing.contains(normalize(s)))
                .distinct()
                .limit(3)
                .collect(Collectors.toList());

        List<ProjectSuggestion> projects = response.getProjects().stream()
                .filter(p -> p.getTitle() != null && !p.getTitle().isBlank())
                .limit(2)
                .collect(Collectors.toList());

        if (skills.isEmpty() && projects.isEmpty()) return null;
        return new PortfolioSuggestionsResponse(skills, projects, "ai");
    }

    private static String blankTo(String value, String fallback) {
        return value != null && !value.isBlank() ? value.trim() : fallback;
    }

    private PortfolioSuggestionsResponse parseAiResponse(String raw) throws Exception {
        String json = raw.trim();
        if (json.startsWith("```")) {
            json = json.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "").trim();
        }
        int start = json.indexOf('{');
        int end = json.lastIndexOf('}');
        if (start < 0 || end <= start) return null;

        JsonNode node = objectMapper.readTree(json.substring(start, end + 1));
        List<String> skills = new ArrayList<>();
        node.path("skills").forEach(s -> {
            if (s.isTextual()) skills.add(s.asText().trim());
        });

        List<ProjectSuggestion> projects = new ArrayList<>();
        node.path("projects").forEach(p -> {
            String title = p.path("title").asText("").trim();
            String description = p.path("description").asText("").trim();
            if (title.isEmpty()) return;
            List<String> used = new ArrayList<>();
            p.path("skillsUsed").forEach(u -> {
                if (u.isTextual()) used.add(u.asText().trim());
            });
            projects.add(new ProjectSuggestion(title, description, used));
        });

        if (skills.isEmpty() && projects.isEmpty()) return null;
        return new PortfolioSuggestionsResponse(skills, projects, "ai");
    }

    private Set<String> normalizeSkills(String[] skills) {
        if (skills == null) return Set.of();
        return Arrays.stream(skills)
                .filter(s -> s != null && !s.isBlank())
                .map(this::normalize)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private String normalize(String skill) {
        return skill.trim().toLowerCase(Locale.ROOT);
    }
}
