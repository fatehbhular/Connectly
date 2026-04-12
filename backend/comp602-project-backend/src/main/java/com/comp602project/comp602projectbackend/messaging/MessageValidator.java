package com.comp602project.comp602projectbackend.messaging;

import org.springframework.stereotype.Component;

@Component
public class MessageValidator {

    public void validateMessage(String content) {

        if (content == null) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (content.length() > 350) {
            throw new IllegalArgumentException("Message cannot be longer than 350 characters.");
        }
        
    }

}
