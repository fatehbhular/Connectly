package com.comp602project.comp602projectbackend.messaging;

import com.comp602project.comp602projectbackend.auth.User;

import java.time.Instant;
import java.util.List;

public class MessageSender {
    
    private final MessagingService messagingService;
    private final User sender;
    private final List<User> participants;
    private final Instant timestamp;

    public MessageSender(MessagingService messagingService, User sender, List<User> participants, Instant timestamp) {
        this.messagingService = messagingService;
        this.sender = sender;
        this.participants = participants;
        this.timestamp = timestamp;
    }

    public void send(String content) {                                                           //Method to "send a message", uses the messagingService class.
        messagingService.sendMessage(sender, participants, content, timestamp); 
    }

}
