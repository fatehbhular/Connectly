package com.comp602project.comp602projectbackend.messaging;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/*
    Maps the group_chats table in Supabase.
    Stores a group chat with its name and the list of member user IDs.
*/
@Entity
@Table(name = "group_chats")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "name", nullable = false)
    private String name;                                                    // display name of the group

    @Column(name = "member_ids", columnDefinition = "INT[]")
    private List<Integer> memberIds = new ArrayList<>();                    // user IDs of all members

    @Column(name = "created_at")
    private Instant createdAt;

    public Group() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    // SETTERS AND GETTERS

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Integer> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Integer> memberIds) { this.memberIds = memberIds; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}