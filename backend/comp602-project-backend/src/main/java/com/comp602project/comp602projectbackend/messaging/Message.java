package com.comp602project.comp602projectbackend.messaging;

import java.time.Instant;

public class Message {
    private String id;
    private String senderId;
    private String content;
    private Instant timestamp;
    private String conversationKey;

    public Message(String id, String conversationKey, String senderId, String content, Instant timestamp) {             //Main constructor for Message objects
        this.id = id;
        this.conversationKey = conversationKey;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }                                                                                //Getter methods for Message variables
    public String getConversationKey() { return conversationKey; }
    public String getSenderId() { return senderId; }
    public String getContent() { return content; }
    public Instant getTimestamp() { return timestamp; }

    public boolean isFromUser(String userId) {                                                                          //Returns boolean depending if the message is from the inputted user
        boolean fromUser = senderId.equals(userId);
        return fromUser;
    }

    public String getFormattedTimestamp(Instant timestamp) {                                                            //Returns the string format of the timestamp
        return timestamp.toString();
    }
}
