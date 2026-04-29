package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired
    public MatchingAlgorithm(List<IScorer> scorers) {
        this.scorers = scorers;
    }

    // Score a single user compared to the signed in user using all the scorers
    public double scoreUser(User signedInUser, User candidate) {
        double total = 0;
        for (IScorer scorer : scorers) {
            total += scorer.score(signedInUser, candidate);                 // each scorer returns 0.0 - 1.0
        }
        return total;                                                       // total wieght of all scorers

        // REPLACE WITH WEIGHTED SUM IN THE FUTURE
    }

    // Fetch every user from Supabase, score them against the signed in user, and return the list sorted from highest score to lowest.
    public List<User> getQueue(User signedInUser) {
        List<User> allUsers = userRepository.getAll();                      // fetch everyone from Supabase

        List<Integer> connectedIds = signedInUser.getConnectionKeys();

        return allUsers.stream()
            .filter(u -> u.getUserId() != signedInUser.getUserId())         // exclude signed in user from results
            .filter(u -> !connectedIds.contains(u.getUserId()))             // remove already connected users
            .sorted(Comparator.comparingDouble(
                (User u) -> scoreUser(signedInUser, u)).reversed())         // highest score first
            .collect(Collectors.toList());
    }
}