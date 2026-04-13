package com.comp602project.comp602projectbackend.messaging;

import org.springframework.stereotype.Service;
import com.comp602project.comp602projectbackend.auth.User;

import java.util.List;
import java.util.Objects;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;

@Service                                                                                  //This class is reposible for the "heavy lifting" of touching the database. Thinks, makes decisions, and enforces rules.
public class MessagingService {
    
    private final MessagingRepository messagingRepository;
    private final MessageValidator messageValidator;

    public MessagingService(MessagingRepository messagingRepository, MessageValidator messageValidator) {
        this.messagingRepository = messagingRepository;
        this.messageValidator = messageValidator;
    }

    public void sendMessage(User sender, List<User> participants, String content, Instant timestamp) {             //Logic for sending a message
        messageValidator.validateMessage(content);                                                                 //Checks to see if message is valid
        String timestampToString = timestamp.toString();
        int senderId = sender.getUserId();

        String conversationKey = generateConversationKey(senderId, participants);                                  //Creates the conversationKey value for the message object.
        messagingRepository.saveMessageToDatabase(conversationKey, senderId, content, timestampToString);          //Saves the message to the database
    }

    private String generateConversationKey(int senderId, List<User> participants) {                             //Generates a conversation key using the sender's and participants' userIds.
        List<Integer> userIds = new ArrayList<>();
        userIds.add(senderId);                                                                                     //Adds sender's userId to the List of strings first

        for (User u : participants) {                                                                              //Adds userIds of all participants into a List of strings
            userIds.add(u.getUserId());
        }
        userIds.removeIf(Objects::isNull);
        Collections.sort(userIds);

        // Join all userIds with "_" to create the conversation key; "1_3_10"
        StringBuilder conversationKey = new StringBuilder();                                            
        for (int i = 0; i < userIds.size(); i++) {
            if (i > 0) conversationKey.append("_");
            conversationKey.append(userIds.get(i));
        }
        return conversationKey.toString();

    }

}
