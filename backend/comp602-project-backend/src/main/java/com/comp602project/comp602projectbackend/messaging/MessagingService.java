package com.comp602project.comp602projectbackend.messaging;

import org.springframework.stereotype.Service;
import com.comp602project.comp602projectbackend.auth.User;

import java.util.List;
import java.util.Objects;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;

/**
 * Service layer for messaging feature - sits between the Controller and Repository
 * 
 * Responsible for business logic -> validating messages, generating conversationKey, handing over persistence to {@link MessagingRepository}.
 */
@Service
public class MessagingService {
    
    private final MessagingRepository messagingRepository;
    private final MessageValidator messageValidator;

    /**
     * Constructor injection - Spring wires the beans required.
     * 
     * @param messagingRepository -> handles raw database operations for messages
     * @param messageValidator -> enforces rules for the message content before it is persisted
     */
    public MessagingService(MessagingRepository messagingRepository, MessageValidator messageValidator) {
        this.messagingRepository = messagingRepository;
        this.messageValidator = messageValidator;
    }
   
    /**
     * Sends a message from a sender to one or more participants.
     * 
     * Flow:
     * 1. Validate message content (throw exception if invalid)
     * 2. Calculate a stable conversation key from all user IDs.
     * 3. Persist the message via the repository
     * 
     * @param sender -> the {@link User} who is sending the message
     * @param participants -> the other {@link User}s in the conversation (excluding the sender)
     * @param content -> text contained within message
     * @param timestamp -> exact moment the message was created
     */
    public void sendMessage(User sender, List<User> participants, String content, Instant timestamp) {
        /*
            This is the shield -> Reject messages that are invalid before it is sent to database
        */
        messageValidator.validateMessage(content);
        /*
            Convert timestamp -> string for storage
        */
        String timestampToString = timestamp.toString();
        int senderId = sender.getUserId();
        
        /*
            Construct a conversation key using generateConversationKey()
        */
        String conversationKey = generateConversationKey(senderId, participants);
        /*
            Actual insertion of message is done by repository
        */
        messagingRepository.saveMessageToDatabase(conversationKey, senderId, content, timestampToString);
    }

    /**
     * Generates a stable conversation key by sorting all participant userIDs (including the sender's) and joining them together using "_".
     * 
     * Example -> sender=3, participants=[1,10], sorted=[1,3,10], conversationKey="1_3_10"
     * 
     * Sorting ensures the same group of users do not create another conversation with the exact same users.
     * 
     * Example -> If a conversation key is created from the action of one user -> sender=1, participant=10, meaning key is "1_10". If the participant sends a message, it SHOULD NOT CREATE A NEW CONVERSATION WITH KEY="10_1".
     * 
     * @param senderId -> ID of the user who sent the message
     * @param participants -> ID of the user/s receiving the message
     * @return a "_"-joined string of all sorted userIDs, e.g. "1_3_10" 
     */
    private String generateConversationKey(Integer senderId, List<User> participants) {
        List<Integer> userIds = new ArrayList<>();
        userIds.add(senderId); // sender is included in conversationKey

        /** Bunch all participant IDs into list */
        for (User u : participants) {
            userIds.add(u.getUserId());
        }

        /** Defensive: remove any null IDs to prevent NullPointerException during sorting */
        userIds.removeIf(Objects::isNull);
        /** Sort in ascending order so key is always same when different user in conversation sends a message. */
        Collections.sort(userIds);

        /** Builds the concatenated string joined by "_" */
        StringBuilder conversationKey = new StringBuilder();                                            
        for (int i = 0; i < userIds.size(); i++) {
            if (i > 0) conversationKey.append("_");
            conversationKey.append(userIds.get(i));
        }

        return conversationKey.toString();
    }

    public List<String> getDMList(Integer userId) {
        return messagingRepository.getConversationKeysByUserId(userId);
    }

    public List<Message> getConversation(String conversationKey, Integer userId) {
        boolean isMemberOfConversation = List.of(conversationKey.split("_")).contains(String.valueOf(userId));

        if (!isMemberOfConversation) throw new IllegalArgumentException("User " + userId + " is not part of this conversation.");

        return messagingRepository.getMessageByConversationKey(conversationKey);
    }

}
