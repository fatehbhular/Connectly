package com.comp602project.comp602projectbackend.messaging;

import org.springframework.stereotype.Component;

/**
 * Validation component for messages going out.
 * 
 * This class is focused on message validation, instead of letting the {@link MessagingService} handle it -> Keeps the service focused on the orchestration, and makes it easy to add or remove rules in this class.
 * 
 * {@code @Component} registers this class as a Spring-managed bean so it can be injected wherever validation is needed
 */
@Component
public class MessageValidator {
    /**
     * Asserts that a message's content meets all the required rules before it is persisted into the database.
     * 
     * Rules enforced:
     * - Content must not be null
     * - Content must not exceed 350 characters
     * 
     * @param content -> the message text to validate
     * @throws IllegalArgumentException if content is null or exceeds the character limit.
     */
    public void validateMessage(String content) {
        if (content == null) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (content.length() > 350) {
            throw new IllegalArgumentException("Message cannot be longer than 350 characters.");
        }
    }
}
