package com.comp602project.comp602projectbackend.messaging;

import com.comp602project.comp602projectbackend.auth.User;

import java.time.Instant;
import java.util.List;

/**
 * A context object that bundles a fixed message object:
 * - who is sending
 * - who the recepients are
 * so that {@code send()} can be called with just the messageContent
 * 
 * NOTE: This class is not a Spring bean (@Component/@Service) - It is instantiased manually by the caller. At this time the per-request context (sender, participants, timestamp) is supplied at construction time.
 */
public class MessageSender {
    
    /** Delegates to the service layer for validation and persistence */
    private final MessagingService messagingService;
    /** Authenticated user who is sending the message */
    private final User sender;
    /** Other users in the conversation who will receive the message */
    private final List<User> participants;
    /** The moment this sending context was created, this is stamped onto every message sent */
    private final Instant timestamp;

    /**
     * Constructs a MessageSender with a sending context.
     * 
     * All fields are required, there is no valid state where any of these are missing. This is the reason why everything is captured here rather than on each {@link #send} call.
     * 
     * @param messagingService -> the service that owns send logic and validation
     * @param sender -> the user sending the message
     * @param participants -> the users receiving the message (excluding sender)
     * @param timestamp -> the time to stamp of any message sent through this instance
     */
    public MessageSender(MessagingService messagingService, User sender, List<User> participants, Instant timestamp) {
        this.messagingService = messagingService;
        this.sender = sender;
        this.participants = participants;
        this.timestamp = timestamp;
    }

    /**
     * Sends a message using the context establised at construction time.
     * 
     * Delegates entirely to {@link MessagingServce#sendMessage}, keeping this class small -> ONLY RESPONSIBILITY: Holding context and fowarding the call.
     * 
     * @param content -> text contained within message to send
     */
    public void send(String content) {
        messagingService.sendMessage(sender, participants, content, timestamp); 
    }

}
