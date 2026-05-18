package com.comp602project.comp602projectbackend.connections;

import jakarta.persistence.*;

/*
    Maps the connection_requests table in Supabase.
    Stores a pending connection request from one user to another,
    along with the intro message from the sender.
    Deleted once the request is accepted or declined.
*/
@Entity
@Table(name = "connection_requests")
public class ConnectionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "sender_id", nullable = false)
    private int senderId;

    @Column(name = "receiver_id", nullable = false)
    private int receiverId;

    @Column(name = "sender_message", nullable = false, columnDefinition = "TEXT")
    private String senderMessage;                                           // intro message written by the sender when swiping right

    public ConnectionRequest() {}

    // SETTERS AND GETTERS

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public int getReceiverId() { return receiverId; }
    public void setReceiverId(int receiverId) { this.receiverId = receiverId; }

    public String getSenderMessage() { return senderMessage; }
    public void setSenderMessage(String senderMessage) { this.senderMessage = senderMessage; }
}