package com.comp602project.comp602projectbackend.messaging;

import org.springframework.stereotype.Service;
import com.comp602project.comp602projectbackend.auth.User;

import java.util.List;
import java.util.Objects;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;

@Service
public class MessagingService {
    
    private final MessagingRepository messagingRepository;
    private final MessageValidator messageValidator;

    public MessagingService(MessagingRepository messagingRepository, MessageValidator messageValidator) {
        this.messagingRepository = messagingRepository;
        this.messageValidator = messageValidator;
    }

    public void sendMessage(User sender, List<User> participants, String content, Instant timestamp) {
        messageValidator.validateMessage(content);
        String timestampToString = timestamp.toString();
        String senderId = sender.getUserId();

        String conversationKey = generateConversationKey(senderId, participants);
        messagingRepository.saveMessageToDatabase(conversationKey, senderId, content, timestampToString);
    }

    private String generateConversationKey(String senderId, List<User> participants) {
        List<String> userIds = new ArrayList<>();
        userIds.add(senderId);

        for (User u : participants) {
            userIds.add(u.getUserId());
        }
        userIds.removeIf(Objects::isNull);
        Collections.sort(userIds);

        String conversationKey = String.join("", userIds);
        return conversationKey;

    }

}
