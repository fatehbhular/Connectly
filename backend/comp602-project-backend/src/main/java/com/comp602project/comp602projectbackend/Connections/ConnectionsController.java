package com.comp602project.comp602projectbackend.connections;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;
import com.comp602project.comp602projectbackend.matching.MatchingAlgorithm;
import com.comp602project.comp602projectbackend.messaging.MessagingRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/connections")
public class ConnectionsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchingAlgorithm matchingAlgorithm;

    @Autowired
    private MessagingRepository messagingRepository;

    // Returns the recommended user queue, with optional filters for skill, industry, and location.
    // All params are optional — if none are provided it just returns the full queue as before.
    @GetMapping("/users")
    public List<User> getAllUsers(
            @RequestHeader("userId") int userId,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String location
    ) {
        User signedInUser = userRepository.getById(userId);
        if (signedInUser == null) return List.of();

        List<User> queue = matchingAlgorithm.getQueue(signedInUser);

        // filter by skill — partial case-insensitive match against the user's skills array
        if (skill != null && !skill.isBlank()) {
            String s = skill.toLowerCase();
            queue = queue.stream()
                    .filter(u -> u.getSkills() != null &&
                            Arrays.stream(u.getSkills()).anyMatch(sk -> sk.toLowerCase().contains(s)))
                    .collect(Collectors.toList());
        }

        // filter by industry
        if (industry != null && !industry.isBlank()) {
            String ind = industry.toLowerCase();
            queue = queue.stream()
                    .filter(u -> u.getIndustry() != null && u.getIndustry().toLowerCase().contains(ind))
                    .collect(Collectors.toList());
        }

        // filter by location
        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase();
            queue = queue.stream()
                    .filter(u -> u.getLocation() != null && u.getLocation().toLowerCase().contains(loc))
                    .collect(Collectors.toList());
        }

        return queue;
    }

    @PostMapping("/connectUser")
    public ResponseEntity<User> getConnected(
            @RequestHeader("signedInUserId") int signedInUserId,
            @RequestHeader("requestedUserId") int requestedUserId
    ) {
        User requestedUser = userRepository.getById(requestedUserId);
        User signedInUser = userRepository.getById(signedInUserId);

        List<Integer> requestedUsersRequests = requestedUser.getRequestedUsers();
        if (requestedUsersRequests == null) requestedUsersRequests = new ArrayList<>();

        if (requestedUsersRequests.contains(signedInUserId)) {
            // both users want to connect — create the conversation and add each other as connections
            String conversationKey = signedInUserId > requestedUserId
                    ? requestedUserId + "_" + signedInUserId
                    : signedInUserId + "_" + requestedUserId;

            messagingRepository.createConversation(conversationKey);

            requestedUsersRequests.remove(Integer.valueOf(signedInUserId));
            requestedUser.setRequestedUsers(requestedUsersRequests);

            List<Integer> signedInUserIdConnectionKeys = signedInUser.getConnectionKeys();
            if (signedInUserIdConnectionKeys == null) signedInUserIdConnectionKeys = new ArrayList<>();
            signedInUserIdConnectionKeys.add(requestedUserId);
            signedInUser.setConnectionKeys(signedInUserIdConnectionKeys);

            List<Integer> requestedUserIdConnectionKeys = requestedUser.getConnectionKeys();
            if (requestedUserIdConnectionKeys == null) requestedUserIdConnectionKeys = new ArrayList<>();
            requestedUserIdConnectionKeys.add(signedInUserId);
            requestedUser.setConnectionKeys(requestedUserIdConnectionKeys);

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
            // one-sided — just store the request for now
            List<Integer> signedInUserRequestedUsers = signedInUser.getRequestedUsers();
            if (signedInUserRequestedUsers == null) signedInUserRequestedUsers = new ArrayList<>();
            signedInUserRequestedUsers.add(requestedUserId);
            signedInUser.setRequestedUsers(signedInUserRequestedUsers);

            userRepository.update(signedInUser);

            return ResponseEntity.ok(requestedUser);
        }
    }
}
