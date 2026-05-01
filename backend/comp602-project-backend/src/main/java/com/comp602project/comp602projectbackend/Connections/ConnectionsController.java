package com.comp602project.comp602projectbackend.connections;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;
import com.comp602project.comp602projectbackend.matching.MatchingAlgorithm;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/connections")
public class ConnectionsController {

    @Autowired
    private UserRepository userRepository;                                      // Spring injects this automatically

    @Autowired
    private MatchingAlgorithm matchingAlgorithm;

    @GetMapping("/users")
    public List<User> getAllUsers(@RequestHeader("userId") int userId) {
        User signedInUser = userRepository.getById(userId);                     // Get the signed in user from the database
        if (signedInUser == null) return List.of();
        return matchingAlgorithm.getQueue(signedInUser);
    }

}