package com.comp602project.comp602projectbackend.messaging;

import java.time.Instant;

/**
 * Immutable value object that represents a single message in a conversation.
 * 
 * Stores everything needed to identify, display and modify a message by -> who sent it, what it says, who its sent to, when it was send, and which conversation it belongs to.
 * 
 * This is a plain java object (no Spring annotations) -> just carries data, no business logic or database communications.
 */
public class Message {
    /** Primary id of the message */
    private int id;
    /** ID of the user sending the message */
    private int senderId;
    /** Text contained within the message */
    private String content;
    /** Time the message was created */
    private Instant timestamp;
    /** Conversation to which this message belogns to */
    private String conversationKey;
    /** True if this message is part of a connection request intro - saved when a request is accepted */
    private boolean isIntro = false;

    /**
     * Constructs a message -> called by {@link MessagingRepository#mapToMessage} when retrieving a row from the database and turning it into a Java object.
     * 
     * @param id -> Primary key of the message instance
     * @param conversationKey -> conversation this message belongs to
     * @param senderId -> ID of the user who sent this message
     * @param content -> Text contained in this message
     * @param timestamp -> Time the message was created
     */
    public Message(int id, String conversationKey, int senderId, String content, Instant timestamp) {
        this.id = id;
        this.conversationKey = conversationKey;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
    }

    /** 
     * Getters -> Fields are private, so this is the only way to read data outside this class.  
    */
    public int getId() { return id; }
    public String getConversationKey() { return conversationKey; }
    public int getSenderId() { return senderId; }
    public String getContent() { return content; }
    public Instant getTimestamp() { return timestamp; }
    public boolean isIntro() { return isIntro; }
    public void setIsIntro(boolean isIntro) { this.isIntro = isIntro; }

    /**
     * Checks whether this message was sent by a given user.
     * 
     * Useful for UI logic -> Aligning your own messages to the right, while everyone else's are to the left. 
     * 
     * Also useful for access control -> E.g. Only the sender can delete their message.
     * 
     * @param userId -> ID of the user to check against
     * @return {@code true} if this message's sender matches {@code userId}, otherwise {@code false}.
     */
    public boolean isFromUser(int userId) {
        return senderId == userId;
    }

    /**
     * Returns the timestamp as a string.
     * 
     * Used when the timestamp needs to be stored in the database, or sent in a JSON response.
     * 
     * Example output: {@code "2025-09-01T10:15:30Z"}
     * 
     * @param timestamp -> the {@link Instant} to format
     * @return the string representation of the given timestamp
     */
    public String getFormattedTimestamp(Instant timestamp) {
        return timestamp.toString();
    }

    @Override
    public String toString() {
        return "Message{id=" + id + ", conversationKey=" + conversationKey + ", senderId=" + senderId + ", content=" + content + ", timestamp=" + timestamp + "}";
    }
}
