package com.comp602project.comp602projectbackend.auth;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileAnalyticsController {

    private final ProfileAnalyticsRepository analyticsRepository;
    private final UserJpaRepository userRepository;

    public ProfileAnalyticsController(
            ProfileAnalyticsRepository analyticsRepository,
            UserJpaRepository userRepository
    ) {
        this.analyticsRepository = analyticsRepository;
        this.userRepository = userRepository;
    }

    // API endpoint used to retrieve analytics data for a user
    @GetMapping("/{userId}")
    public Map<String, Integer> getAnalytics(@PathVariable int userId) {
        ProfileAnalyticsDatabase analytics = getOrCreateAnalytics(userId);

        return Map.of(
                "rightSwipes", analytics.getRightSwipes(),
                "leftSwipes", analytics.getLeftSwipes(),
                "matches", analytics.getMatches()
        );
    }

    // API endpoint used to record when another user swipes on this user's profile
    @PostMapping("/{userId}/swipe")
    public Map<String, Integer> recordSwipe(
            @PathVariable int userId,
            @RequestParam String direction
    ) {
        ProfileAnalyticsDatabase analytics = getOrCreateAnalytics(userId);

        if (direction.equalsIgnoreCase("right")) {
            analytics.setRightSwipes(analytics.getRightSwipes() + 1);
        } else if (direction.equalsIgnoreCase("left")) {
            analytics.setLeftSwipes(analytics.getLeftSwipes() + 1);
        }

        analyticsRepository.save(analytics);

        return Map.of(
                "rightSwipes", analytics.getRightSwipes(),
                "leftSwipes", analytics.getLeftSwipes(),
                "matches", analytics.getMatches()
        );
    }

    // Creates an analytics row if the user does not already have one
    private ProfileAnalyticsDatabase getOrCreateAnalytics(int userId) {
        return analyticsRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    UserDatabase user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    ProfileAnalyticsDatabase analytics = new ProfileAnalyticsDatabase();
                    analytics.setUser(user);

                    return analyticsRepository.save(analytics);
                });
    }
}