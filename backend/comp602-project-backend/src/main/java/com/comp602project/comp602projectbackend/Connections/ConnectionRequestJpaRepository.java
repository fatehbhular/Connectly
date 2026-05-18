package com.comp602project.comp602projectbackend.connections;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConnectionRequestJpaRepository extends JpaRepository<ConnectionRequest, Integer> {
    List<ConnectionRequest> findByReceiverId(int receiverId);               // get all pending requests where this user is the receiver
    boolean existsBySenderIdAndReceiverId(int senderId, int receiverId);    // check if a request already exists to avoid duplicates
}