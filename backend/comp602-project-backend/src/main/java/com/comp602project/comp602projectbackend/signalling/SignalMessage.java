package com.comp602project.comp602projectbackend.signalling;

public class SignalMessage {
    
    private String type;
    private int senderId;
    private int receiverId;
    private Object payload;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public int getReceiverId() { return receiverId; }
    public void setReceiverId(int receiverId) { this.receiverId = receiverId; }

    public Object getPayload() { return payload; }
    public void setPayload(Object payload) { this.payload = payload; }

}
