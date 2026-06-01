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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.matching.services.IndustryTaxonomy;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PortfolioSuggestionService {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.1-8b-instant";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${groq.api.key:}")
    private String groqApiKey;

    public PortfolioSuggestionsResponse suggest(User user) {
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                PortfolioSuggestionsResponse ai = callGroq(user);
                if (ai != null) return ai;
            } catch (Exception ignored) {
                // fall through to curated suggestions
            }
        }
        return curatedSuggestions(user);
    }

    private PortfolioSuggestionsResponse callGroq(User user) throws Exception {
        String prompt = buildPrompt(user);
        Map<String, Object> body = Map.of(
                "model", MODEL,
                "temperature", 0.6,
                "max_tokens", 900,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You help professionals grow their portfolio. Reply with JSON only, no markdown."),
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
            return null;
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").path(0).path("message").path("content").asText("");
        return parseAiResponse(content);
    }

    private String buildPrompt(User user) {
        String skills = user.getSkills() != null
                ? String.join(", ", user.getSkills())
                : "none listed";
        String bio = user.getBio() != null && !user.getBio().isBlank() ? user.getBio() : "none";
        String industry = user.getIndustry() != null ? user.getIndustry() : "general professional";

        return """
                Suggest portfolio improvements for this Connectly networking app user.
                Industry: %s
                Current skills: %s
                Bio: %s
                Location: %s

                Return ONLY valid JSON in this exact shape:
                {"skills":["skill1","skill2","skill3"],"projects":[{"title":"...","description":"one sentence","skillsUsed":["...","..."]}]}

                Rules:
                - Suggest 3 skills they do NOT already have (short names, portfolio-relevant).
                - Suggest 2 small portfolio projects they could realistically finish in a few weeks.
                - Keep descriptions practical and specific to their industry.
                """.formatted(
                industry,
                skills,
                bio,
                user.getLocation() != null ? user.getLocation() : "unknown"
        );
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

    private PortfolioSuggestionsResponse curatedSuggestions(User user) {
        Set<String> existing = normalizeSkills(user.getSkills());
        String industry = user.getIndustry() != null ? user.getIndustry().toLowerCase(Locale.ROOT) : "";
        String category = IndustryTaxonomy.INDUSTRY_CATEGORY.getOrDefault(industry, "general");

        List<String> pool = skillPoolForCategory(category);
        List<String> skills = pool.stream()
                .filter(s -> !existing.contains(normalize(s)))
                .limit(3)
                .collect(Collectors.toList());

        if (skills.size() < 3) {
            for (String extra : List.of("Public Speaking", "Technical Writing", "Project Management")) {
                if (skills.size() >= 3) break;
                if (!existing.contains(normalize(extra)) && !skills.contains(extra)) {
                    skills.add(extra);
                }
            }
        }

        List<ProjectSuggestion> projects = projectPoolForCategory(category, skills, industry);
        return new PortfolioSuggestionsResponse(skills, projects, "curated");
    }

    private List<String> skillPoolForCategory(String category) {
        return switch (category) {
            case "tech" -> List.of(
                    "TypeScript", "Docker", "CI/CD", "System Design", "PostgreSQL",
                    "React", "REST APIs", "GitHub Actions", "Cloud Deployment", "Testing"
            );
            case "design" -> List.of(
                    "Figma", "Design Systems", "Prototyping", "User Research",
                    "Accessibility", "Motion Design", "Brand Strategy", "Wireframing"
            );
            case "business" -> List.of(
                    "Data Analysis", "Stakeholder Management", "SQL", "Presentation Design",
                    "Market Research", "Agile", "Financial Modelling", "CRM Tools"
            );
            default -> List.of(
                    "Communication", "LinkedIn Branding", "Networking", "Portfolio Building",
                    "Content Creation", "Personal Branding", "Collaboration Tools"
            );
        };
    }

    private List<ProjectSuggestion> projectPoolForCategory(String category, List<String> skills, String industry) {
        String label = industry.isBlank() ? "your field" : industry;
        return switch (category) {
            case "tech" -> List.of(
                    new ProjectSuggestion(
                            "Build a portfolio case study site",
                            "Create a one-page site showcasing 2–3 projects with problem, stack, and outcome — easy for connections to skim.",
                            List.of(skills.isEmpty() ? "React" : skills.get(0), "GitHub")
                    ),
                    new ProjectSuggestion(
                            "Ship a small API + frontend tool",
                            "Pick a real annoyance in " + label + ", build a minimal full-stack tool, and document it on your profile bio.",
                            List.of(skills.size() > 1 ? skills.get(1) : "REST APIs", "Documentation")
                    )
            );
            case "design" -> List.of(
                    new ProjectSuggestion(
                            "Redesign a local business flow",
                            "Document a before/after UX case study with wireframes and a short Loom walkthrough.",
                            List.of("Figma", "User Research")
                    ),
                    new ProjectSuggestion(
                            "Publish a mini design system",
                            "Define colours, type, and 5 components for a fictional product — shows systems thinking.",
                            List.of("Design Systems", "Prototyping")
                    )
            );
            default -> List.of(
                    new ProjectSuggestion(
                            "Write a portfolio spotlight post",
                            "Publish a short piece on a project you are proud of and link it from your Connectly bio.",
                            List.of("Communication", "Personal Branding")
                    ),
                    new ProjectSuggestion(
                            "Run a 2-week skill sprint",
                            "Pick one skill below, complete a tiny deliverable, add it to your profile skills, and mention it when connecting.",
                            skills.isEmpty() ? List.of("Portfolio Building") : skills.subList(0, Math.min(2, skills.size()))
                    )
            );
        };
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
