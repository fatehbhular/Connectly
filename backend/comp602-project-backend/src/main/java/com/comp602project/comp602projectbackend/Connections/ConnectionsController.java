package com.comp602project.comp602projectbackend.connections;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;
import com.comp602project.comp602projectbackend.matching.MatchingAlgorithm;
import com.comp602project.comp602projectbackend.messaging.MessagingRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/connections")
public class ConnectionsController {

    @Autowired
    private UserRepository userRepository;                                      // Spring injects this automatically

    @Autowired
    private MatchingAlgorithm matchingAlgorithm;

    @Autowired
    private MessagingRepository messagingRepository;

    @GetMapping("/users")
    public List<User> getAllUsers(@RequestHeader("userId") int userId) {
        User signedInUser = userRepository.getById(userId);                     // Get the signed in user from the database
        if (signedInUser == null) return List.of();
        return matchingAlgorithm.getQueue(signedInUser);
    }

    @PostMapping("/connectUser")
    public ResponseEntity<User> getConnected(@RequestHeader("signedInUserId") int signedInUserId, @RequestHeader("requestedUserId") int requestedUserId) {

        User requestedUser = userRepository.getById(requestedUserId);
        User signedInUser = userRepository.getById(signedInUserId);
        List<Integer> requestedUsersRequests = requestedUser.getRequestedUsers();
        if (requestedUsersRequests == null) requestedUsersRequests = new ArrayList<>();

        if (requestedUsersRequests.contains(signedInUserId)) {                  // Check if the requested user already requested you

            // Create a dm key
            String conversationKey = signedInUserId > requestedUserId ? requestedUserId + "_" + signedInUserId : signedInUserId + "_" + requestedUserId;
            
            messagingRepository.createConversation(conversationKey);            // Create a new conversation

            requestedUsersRequests.remove(Integer.valueOf(signedInUserId));     // Remove the request for the other user
            requestedUser.setRequestedUsers(requestedUsersRequests);


            // Add the connections for the two users
            List<Integer> signedInUserIdConnectionKeys = signedInUser.getConnectionKeys();
            if (signedInUserIdConnectionKeys == null) signedInUserIdConnectionKeys = new ArrayList<>();
            signedInUserIdConnectionKeys.add(requestedUserId);
            signedInUser.setConnectionKeys(signedInUserIdConnectionKeys);

            List<Integer> requestedUserIdConnectionKeys = requestedUser.getConnectionKeys();
            if (requestedUserIdConnectionKeys == null) requestedUserIdConnectionKeys = new ArrayList<>();
            requestedUserIdConnectionKeys.add(signedInUserId);
            requestedUser.setConnectionKeys(requestedUserIdConnectionKeys);

            // Add the new dm keys for the two users
            List<String> signedInUserIdDmKeys = signedInUser.getDmKeys();
            if (signedInUserIdDmKeys == null) signedInUserIdDmKeys = new ArrayList<>();
            signedInUserIdDmKeys.add(conversationKey);
            signedInUser.setDmKeys(signedInUserIdDmKeys);

            List<String> requestedUserDmKeys = requestedUser.getDmKeys();
            if (requestedUserDmKeys == null) requestedUserDmKeys = new ArrayList<>();
            requestedUserDmKeys.add(conversationKey);
            requestedUser.setDmKeys(requestedUserDmKeys);

            userRepository.update(signedInUser);
            userRepository.update(requestedUser);

            return ResponseEntity.ok(requestedUser);

        } else {

            List<Integer> signedInUserRequestedUsers = signedInUser.getRequestedUsers();
            if (signedInUserRequestedUsers == null) signedInUserRequestedUsers = new ArrayList<>();
            signedInUserRequestedUsers.add(requestedUserId);
            signedInUser.setRequestedUsers(signedInUserRequestedUsers);

            userRepository.update(signedInUser);
            
            return ResponseEntity.ok(requestedUser);
        }
    }

}