package com.comp602project.comp602projectbackend.messaging;

import java.time.Instant;

public class Message {
    private int id;
    private int senderId;
    private String content;
    private Instant timestamp;
    private String conversationKey;

    public Message(int id, String conversationKey, int senderId, String content, Instant timestamp) {             //Main constructor for Message objects
        this.id = id;
        this.conversationKey = conversationKey;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
    }

    public int getId() { return id; }                                                                                //Getter methods for Message variables
    public String getConversationKey() { return conversationKey; }
    public int getSenderId() { return senderId; }
    public String getContent() { return content; }
    public Instant getTimestamp() { return timestamp; }

    public boolean isFromUser(int userId) {                                                                          //Returns boolean depending if the message is from the inputted user
        return senderId == userId;
    }

    public String getFormattedTimestamp(Instant timestamp) {                                                            //Returns the string format of the timestamp
        return timestamp.toString();
    }
}
