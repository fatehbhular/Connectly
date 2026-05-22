package com.comp602project.comp602projectbackend.messaging;

import jakarta.persistence.*;
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

    public Group() {}

    // SETTERS AND GETTERS

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Integer> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Integer> memberIds) { this.memberIds = memberIds; }
}