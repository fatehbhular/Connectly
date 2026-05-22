package com.comp602project.comp602projectbackend.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/*
    Talks directly to the group_chats table in Supabase.
    Spring Boot automatically implements all the database operations for us.
    ONLY GroupController and MessagingService read and write from this.
*/
@Repository
public interface GroupJpaRepository extends JpaRepository<Group, Integer> {

    // Returns all groups where the given userId appears in the member_ids array
    @Query(value = "SELECT * FROM group_chats WHERE :userId = ANY(member_ids)", nativeQuery = true)
    List<Group> findByMemberIdsContaining(@Param("userId") int userId);
}