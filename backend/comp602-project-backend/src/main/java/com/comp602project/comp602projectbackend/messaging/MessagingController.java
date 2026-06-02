package com.comp602project.comp602projectbackend.messaging;

import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;

/**
 * Controller layer for messaging feature
 * 
 * Response for handling all HTTP requests relating to the messaging feature.
 * - No business logic is allowed here
 * - Only receiving requests, and returning responses
 * 
 * {@code @RestController} tells Spring this class handles HTTP requests and returns JSON automatically.
 * {@code @RequestMapping} prefixes all routes in this class with /messaging.
 * {@code @CrossOrigin} whitelists frontend origin so browser can allow requests across ports.
 */

@RestController
@RequestMapping("/messaging")
@CrossOrigin(origins = "*")
public class MessagingController {
    
    /**
     * Service layer that contains all business logic for messaging. Controller never handles logic itself.
     */
    private final MessagingService messagingService;

    /**
     * UserRepository for accessing user data. Used to fetch User objects by ID.
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Injects MessagingService into Controller -> Spring wires {@link MessagingService} bean here.
     */
    @Autowired
    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    /**
     * Returns a list of conversations belonging to the user — both DMs and group chats.
     * 
     * Flow:
     * 1. Pulls the userId from request header to identify who is asking.
     * 2. Uses MessagingService to retrieve their conversations.
     * 3. Returns 200 OK with the list, or 400 Bad Request if something breaks.
     * 
     * @param userId -> Id of the user whose conversations list is being requested.
     * @return {@link ResponseEntity} containing list on success, or error message on failure.
     */
    @GetMapping("/dms")
    public ResponseEntity<?> getDMList(@RequestHeader("userId") Integer userId) {
        try {
            List<?> dms = messagingService.getDMList(userId);

            return ResponseEntity.ok(dms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Returns all messages belonging to a specific conversation.
     * 
     * Flow:
     * 1. Pulls the conversationKey from the URL path to identify which conversation to pull from.
     * 2. Pulls the userId from request header to identify who is asking.
     * 3. Uses MessagingService to retrieve the messages.
     * 4. Returns 200 OK with the list, or 400 Bad Request if something breaks.
     * 
     * @param conversationKey -> sorted userId string identifying conversation -> pulled from URL path.
     * @param userId -> Id of the user requesting the conversation -> pulled from the request header.
     * @return {@link ResponseEntity} containing the messages on success, or an error message on failure.
     */
    @GetMapping("/conversation/{conversationKey}")
    public ResponseEntity<?> getConversation(@PathVariable("conversationKey") String conversationKey, @RequestHeader("userId") Integer userId) {
        try {
            List<?> messages = messagingService.getConversation(conversationKey, userId);

            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Sends a message to all participants in the conversation.
     * 
     * Flow:
     * 1. Pulls the senderId from the request header to identify who is sending the message.
     * 2. Extracts recipientId, content and timestamp from the JSON request body.
     * 3. Uses MessagingService to save the message.
     * 4. Returns 200 OK with the list, or 400 Bad Request if something breaks.
     * 
     * @param senderId -> Id of the user sending the message -> pulled from HTTP request header.
     * @param payload -> JSON request body containing recipientId, content, and timestamp.
     * @return {@link ResponseEntity} confirming success, or an error message on failure.
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestHeader("userId") Integer senderId, @RequestBody Map<String, Object> payload) {
        try {
            Integer recipientId = Integer.valueOf(payload.get("recipientId").toString());
            String content = (String) payload.get("content");
            Long timestampMillis = ((Number) payload.get("timestamp")).longValue();
            Instant timestamp = Instant.ofEpochMilli(timestampMillis);
            
            // Create USER objects from senderId, and recipientId.
            User sender = userRepository.getById(senderId);
            User recipient = userRepository.getById(recipientId);

            List<User> recipients = new ArrayList<User>();
            recipients.add(recipient);

            messagingService.sendMessage(sender, recipients, content, timestamp);

            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Sends a message to a group conversation.
     *
     * @param senderId -> ID of the user sending the message -> pulled from request header.
     * @param payload -> JSON body containing groupId, content, and timestamp.
     * @return {@link ResponseEntity} confirming success, or an error message on failure.
     */
    @PostMapping("/send-group")                                             // called when a user sends a message in a group chat
    public ResponseEntity<?> sendGroupMessage(@RequestHeader("userId") Integer senderId, @RequestBody Map<String, Object> payload) {
        try {
            int groupId = Integer.parseInt(payload.get("groupId").toString());
            String content = (String) payload.get("content");
            Long timestampMillis = ((Number) payload.get("timestamp")).longValue();
            Instant timestamp = Instant.ofEpochMilli(timestampMillis);

            messagingService.sendGroupMessage(senderId, groupId, content, timestamp);

            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Returns the last message in a conversation
     * 
     * @param conversationKey - conversation key from the URL path
     * @param userId - ID of the signed-in user from the request header
     * @return {@link ResponseEntity} containing the last message, or error on failure
     */
    @GetMapping("/lastMessage/{conversationKey}")
    public ResponseEntity<?> getLastMessage(@PathVariable("conversationKey") String conversationKey, @RequestHeader("userId") Integer userId) {
        try {
            Message lastMessage = messagingService.getLastMessage(conversationKey, userId);
            return ResponseEntity.ok(lastMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}