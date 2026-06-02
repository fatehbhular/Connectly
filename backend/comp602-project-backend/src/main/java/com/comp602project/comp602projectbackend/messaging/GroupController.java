package com.comp602project.comp602projectbackend.messaging;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupJpaRepository groupRepository;

    @Autowired
    private MessagingRepository messagingRepository;

    @PostMapping("/create")                                                 // called when a user creates a new group chat
    public ResponseEntity<Group> createGroup(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        @SuppressWarnings("unchecked")
        List<Integer> memberIds = (List<Integer>) body.get("memberIds");

        if (name == null || name.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        if (memberIds == null || memberIds.isEmpty()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        Group group = new Group();
        group.setName(name.trim());
        group.setMemberIds(memberIds);
        group.setCreatedAt(Instant.now());
        Group saved = groupRepository.save(group);

        String conversationKey = "group_" + saved.getId();
        messagingRepository.createConversation(conversationKey);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{groupId}/addMember")                                    // called when a member adds someone new to the group
    public ResponseEntity<Group> addMember(@PathVariable int groupId, @RequestBody Map<String, Object> body) {
        int userId = (int) body.get("userId");

        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        List<Integer> members = group.getMemberIds();
        if (members == null) members = new ArrayList<>();
        if (!members.contains(userId)) {
            members.add(userId);
            group.setMemberIds(members);
            groupRepository.save(group);
        }

        return ResponseEntity.ok(group);
    }

    @PostMapping("/{groupId}/removeMember")                                 // called when a member is removed from the group
    public ResponseEntity<Group> removeMember(@PathVariable int groupId, @RequestBody Map<String, Object> body) {
        int userId = (int) body.get("userId");

        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        List<Integer> members = group.getMemberIds();
        if (members != null) {
            members.remove(Integer.valueOf(userId));
            group.setMemberIds(members);
            groupRepository.save(group);
        }

        return ResponseEntity.ok(group);
    }

    @GetMapping("/{groupId}/name")                                          // returns the group name
    public ResponseEntity<String> getGroupName(@PathVariable int groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(group.getName());
    }

    @GetMapping("/{groupId}/members")                                       // returns the member IDs of a group
    public ResponseEntity<List<Integer>> getGroupMembers(@PathVariable int groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(group.getMemberIds());
    }

    @GetMapping("/{groupId}/createdAt")                                     // epoch millis when the group was created (for DM list sorting)
    public ResponseEntity<Long> getGroupCreatedAt(@PathVariable int groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null || group.getCreatedAt() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(group.getCreatedAt().toEpochMilli());
    }
}