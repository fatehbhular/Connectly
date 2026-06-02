package com.comp602project.comp602projectbackend.connections;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;
import com.comp602project.comp602projectbackend.messaging.MessagingRepository;

/**
 * Handles the intro request flow.
 *
 * When a user swipes right for the first time, they write an intro message.
 * The receiver sees it in their queue and can accept (with a reply) or decline.
 * Accepting creates the connection and saves both messages as the first DMs.
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/connections")
public class ConnectionRequestController {

    @Autowired
    private ConnectionRequestJpaRepository requestRepository;               // talks to connection_requests table

    @Autowired
    private UserRepository userRepository;                                  // talks to users table

    @Autowired
    private MessagingRepository messagingRepository;                        // talks to messages and conversations tables

    @PostMapping("/request")                                                // called when a user swipes right and submits their intro message
    public ResponseEntity<Void> sendRequest(@RequestBody Map<String, Object> body) {
        int senderId   = (int) body.get("senderId");
        int receiverId = (int) body.get("receiverId");
        String message = (String) body.get("message");

        if (requestRepository.existsBySenderIdAndReceiverId(senderId, receiverId) ||
            requestRepository.existsBySenderIdAndReceiverId(receiverId, senderId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Save the intro request to the database
        ConnectionRequest request = new ConnectionRequest();
        request.setSenderId(senderId);
        request.setReceiverId(receiverId);
        request.setSenderMessage(message);
        requestRepository.save(request);

        // Add receiver to senders requestedUsers so the matching algorithm filters them out of the senders queue
        User sender = userRepository.getById(senderId);
        List<Integer> senderRequested = sender.getRequestedUsers();
        if (senderRequested == null) senderRequested = new ArrayList<>();
        if (!senderRequested.contains(receiverId)) {
            senderRequested.add(receiverId);
            sender.setRequestedUsers(senderRequested);
            userRepository.update(sender);
        }

        // Add sender to receivers requestedUsers so the matching algorithm filters them out of the receivers normal queue
        User receiver = userRepository.getById(receiverId);
        List<Integer> receiverRequested = receiver.getRequestedUsers();
        if (receiverRequested == null) receiverRequested = new ArrayList<>();
        if (!receiverRequested.contains(senderId)) {
            receiverRequested.add(senderId);
            receiver.setRequestedUsers(receiverRequested);
            userRepository.update(receiver);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests/pending")                                        // returns all pending requests where the signed-in user is the receiver
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(@RequestHeader("userId") int userId) {
        List<ConnectionRequest> requests = requestRepository.findByReceiverId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ConnectionRequest req : requests) {
            User sender = userRepository.getById(req.getSenderId());
            if (sender == null) continue;                                   // skip if the sender no longer exists

            Map<String, Object> entry = new HashMap<>();
            entry.put("requestId", req.getId());
            entry.put("senderMessage", req.getSenderMessage());
            entry.put("sender", sender);
            result.add(entry);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/request/accept")                                         // called when the receiver accepts and writes a reply message
    public ResponseEntity<Void> acceptRequest(@RequestBody Map<String, Object> body) {
        int requestId       = (int) body.get("requestId");
        String replyMessage = (String) body.get("replyMessage");

        ConnectionRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        int senderId   = request.getSenderId();
        int receiverId = request.getReceiverId();

        User sender   = userRepository.getById(senderId);
        User receiver = userRepository.getById(receiverId);

        // If already connected, this request was already processed - clean up and return early
        if (sender.getConnectionKeys() != null && sender.getConnectionKeys().contains(receiverId)) {
            requestRepository.deleteById(requestId);
            return ResponseEntity.ok().build();
        }

        // Create the conversation key - always sorted numerically so both users share the same key
        String conversationKey = senderId > receiverId
            ? receiverId + "_" + senderId
            : senderId + "_" + receiverId;

        messagingRepository.createConversation(conversationKey);

        // Save both intro messages as the first DMs in the conversation, flagged as intro
        String now = Instant.now().toString();
        messagingRepository.saveIntroMessage(conversationKey, senderId, request.getSenderMessage(), now);
        messagingRepository.saveIntroMessage(conversationKey, receiverId, replyMessage, now);

        // Add connection keys for both users
        List<Integer> senderConnections = sender.getConnectionKeys();
        if (senderConnections == null) senderConnections = new ArrayList<>();
        senderConnections.add(receiverId);
        sender.setConnectionKeys(senderConnections);

        List<Integer> receiverConnections = receiver.getConnectionKeys();
        if (receiverConnections == null) receiverConnections = new ArrayList<>();
        receiverConnections.add(senderId);
        receiver.setConnectionKeys(receiverConnections);

        // Add dm keys for both users
        List<String> senderDmKeys = sender.getDmKeys();
        if (senderDmKeys == null) senderDmKeys = new ArrayList<>();
        senderDmKeys.add(conversationKey);
        sender.setDmKeys(senderDmKeys);

        List<String> receiverDmKeys = receiver.getDmKeys();
        if (receiverDmKeys == null) receiverDmKeys = new ArrayList<>();
        receiverDmKeys.add(conversationKey);
        receiver.setDmKeys(receiverDmKeys);

        // Remove receiver from senders requestedUsers now that the connection is made
        List<Integer> senderRequested = sender.getRequestedUsers();
        if (senderRequested != null) {
            senderRequested.remove(Integer.valueOf(receiverId));
            sender.setRequestedUsers(senderRequested);
        }

        // Remove sender from receivers requestedUsers now that the connection is made
        List<Integer> receiverRequested = receiver.getRequestedUsers();
        if (receiverRequested != null) {
            receiverRequested.remove(Integer.valueOf(senderId));
            receiver.setRequestedUsers(receiverRequested);
        }

        userRepository.update(sender);
        userRepository.update(receiver);

        requestRepository.deleteById(requestId);                            // clean up the request now that it has been accepted

        return ResponseEntity.ok().build();
    }

    @PostMapping("/request/decline")                                        // called when the receiver declines a request
    public ResponseEntity<Void> declineRequest(@RequestBody Map<String, Object> body) {
        int requestId = (int) body.get("requestId");

        ConnectionRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        int senderId   = request.getSenderId();
        int receiverId = request.getReceiverId();

        // Remove receiver from senders requestedUsers so the sender can request again in the future
        User sender = userRepository.getById(senderId);
        if (sender != null) {
            List<Integer> senderRequested = sender.getRequestedUsers();
            if (senderRequested != null) {
                senderRequested.remove(Integer.valueOf(receiverId));
                sender.setRequestedUsers(senderRequested);
                userRepository.update(sender);
            }
        }

        // Remove sender from receivers requestedUsers so sender reappears in receivers normal queue
        User receiver = userRepository.getById(receiverId);
        if (receiver != null) {
            List<Integer> receiverRequested = receiver.getRequestedUsers();
            if (receiverRequested != null) {
                receiverRequested.remove(Integer.valueOf(senderId));
                receiver.setRequestedUsers(receiverRequested);
                userRepository.update(receiver);
            }
        }

        requestRepository.deleteById(requestId);                            // delete the request

        return ResponseEntity.ok().build();
    }
}