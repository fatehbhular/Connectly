package com.comp602project.comp602projectbackend.auth;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileAnalyticsController {

    private final ProfileAnalyticsRepository analyticsRepository;

    public ProfileAnalyticsController(ProfileAnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    // API endpoint used to retrieve analytics data for a user
    @GetMapping("/{userId}")
    public Map<String, Integer> getAnalytics(@PathVariable int userId) {
        ProfileAnalyticsDatabase analytics = analyticsRepository
                .findByUser_UserId(userId)
                .orElse(null);

        // If the user has no analytics row yet, return empty stats
        if (analytics == null) {
            return Map.of(
                    "views", 0,
                    "likes", 0,
                    "matches", 0
            );
        }

        // Return analytics values in a simple format for the frontend
        return Map.of(
                "views", analytics.getProfileViews(),
                "likes", analytics.getLikes(),
                "matches", analytics.getSuccessfulMatches()
        );
    }
}