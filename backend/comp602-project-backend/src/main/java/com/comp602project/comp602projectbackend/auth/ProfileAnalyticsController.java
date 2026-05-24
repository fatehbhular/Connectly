package com.comp602project.comp602projectbackend.auth;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileAnalyticsController {

    private final ProfileAnalyticsRepository analyticsRepository;
    private final UserJpaRepository userRepository;

    // Stores active SSE connections for connected users
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

    public ProfileAnalyticsController(
            ProfileAnalyticsRepository analyticsRepository,
            UserJpaRepository userRepository
    ) {
        this.analyticsRepository = analyticsRepository;
        this.userRepository = userRepository;
    }

    // Retrieves analytics data for a specific user
    @GetMapping("/{userId}")
    public Map<String, Integer> getAnalytics(@PathVariable int userId) {
        ProfileAnalyticsDatabase analytics = getOrCreateAnalytics(userId);
        return Map.of(
                "rightSwipes", analytics.getRightSwipes(),
                "leftSwipes", analytics.getLeftSwipes(),
                "matches", analytics.getMatches()
        );
    }

    // Frontend subscribes here for live analytics updates
    @GetMapping("/{userId}/stream")
    public SseEmitter streamAnalytics(@PathVariable int userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        // Send current stats immediately on connect so frontend loads data right away
        try {
            ProfileAnalyticsDatabase analytics = getOrCreateAnalytics(userId);
            emitter.send(Map.of(
                    "rightSwipes", analytics.getRightSwipes(),
                    "leftSwipes", analytics.getLeftSwipes(),
                    "matches", analytics.getMatches()
            ));
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    // Records swipe interactions for a user's profile
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

        Map<String, Integer> updatedData = Map.of(
                "rightSwipes", analytics.getRightSwipes(),
                "leftSwipes", analytics.getLeftSwipes(),
                "matches", analytics.getMatches()
        );

        // Sends updated analytics to connected frontend clients
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(updatedData);
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }

        return updatedData;
    }

    // Creates analytics data if the user does not already have a record
    private ProfileAnalyticsDatabase getOrCreateAnalytics(int userId) {
        return analyticsRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    UserDatabase user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));
                    ProfileAnalyticsDatabase analytics = new ProfileAnalyticsDatabase();
                    analytics.setUser(user);
                    return analyticsRepository.save(analytics);
                });
    }
}
