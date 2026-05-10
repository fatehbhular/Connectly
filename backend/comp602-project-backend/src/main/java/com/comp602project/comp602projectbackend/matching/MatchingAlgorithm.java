package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * MatchingAlgorithm scores and ranks all users for the signed in user.
 *
 * Loosely coupled via IScorer; able to add a new scoring algorithm in the future,
 * just create a new class that implements IScorer and add it to the scorers list.
 * This class never needs to change.
 *
 * getQueue() -> getAll() from Supabase -> score each user -> sort by score -> return
 */

@Service
public class MatchingAlgorithm {

    @Autowired
    private UserRepository userRepository;                                  // used to fetch all users from Supabase

    // Spring automatically finds every class that implements IScorer and injects them here
    private final List<IScorer> scorers;

    // Cache: userId -> ranked queue. Call invalidateCache(userId) when profile or connections change.
    private final Map<Integer, List<User>> cache = new ConcurrentHashMap<>();

    @Autowired
    public MatchingAlgorithm(List<IScorer> scorers) {
        this.scorers = scorers;
    }

    private static final Map<Class<? extends IScorer>, Double> WEIGHTS = new HashMap<>();
    static {
        WEIGHTS.put(FieldScorer.class, 50.0);
        WEIGHTS.put(DistanceScorer.class, 30.0);
        WEIGHTS.put(MutualScorer.class, 20.0);
    }

    public void invalidateCache(int userId) {
        cache.remove(userId);
    }

    // Score a single user compared to the signed in user using all the scorers
    public double scoreUser(User signedInUser, User candidate) {
        double total = 0;
        for (IScorer scorer : scorers) {
            double weight = WEIGHTS.getOrDefault(scorer.getClass(), 1.0);
            total += scorer.score(signedInUser, candidate) * weight;
        }
        return total;                                                       // total wieght of all scorers
    }

    // Fetch every user from Supabase, score them against the signed in user, and return the list sorted from highest score to lowest.
    public List<User> getQueue(User signedInUser) {

        // return cached result if available
        if (cache.containsKey(signedInUser.getUserId())) {
            return cache.get(signedInUser.getUserId());
        }

        List<User> allUsers = userRepository.getAll();                      // fetch everyone from Supabase

        Map<Integer, User> userMap = new HashMap<>();                       // Build a lookup map for O(1) access
        for (User u : allUsers) userMap.put(u.getUserId(), u);
        
        List<User> connections = new ArrayList<>();
        Set<Integer> connectedIds = new HashSet<>();

        if (signedInUser.getConnectionKeys() != null) {
            for (Integer id : signedInUser.getConnectionKeys()) {
                connectedIds.add(id);
                User u = userMap.get(id);
                if (u != null) connections.add(u);
            }
        }
        signedInUser.setConnections(connections);

        Set<Integer> requestedIds = new HashSet<>(
            signedInUser.getRequestedUsers() != null 
                ? signedInUser.getRequestedUsers() 
                : new ArrayList<>()
        );

        List<User> result = allUsers.stream()
            .filter(u -> u.getUserId() != signedInUser.getUserId())         // exclude signed in user from results
            .filter(u -> !connectedIds.contains(u.getUserId()))             // remove already connected users
            .filter(u -> !requestedIds.contains(u.getUserId()))             // remove already request users
            .sorted(Comparator.comparingDouble(
                (User u) -> scoreUser(signedInUser, u)).reversed())         // highest score first
            .collect(Collectors.toList());

        cache.put(signedInUser.getUserId(), result);
        return result;
    }
}