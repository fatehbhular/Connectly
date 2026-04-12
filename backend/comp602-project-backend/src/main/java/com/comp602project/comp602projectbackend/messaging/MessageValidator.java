package com.comp602project.comp602projectbackend.messaging;

import org.springframework.stereotype.Component;

@Component
public class MessageValidator {

    public void validateMessage(String content) {                                                    //Checks if the message is valid

        if (content == null) {                                                                       //Throws error if message is empty
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (content.length() > 350) {                                                                //Throws error if message is above 350 characters
            throw new IllegalArgumentException("Message cannot be longer than 350 characters.");
        }
        
    }

}
