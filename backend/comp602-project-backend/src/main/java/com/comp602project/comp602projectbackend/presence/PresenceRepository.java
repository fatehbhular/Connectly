package com.comp602project.comp602projectbackend.presence;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PresenceRepository {
    
    private final JdbcTemplate jdbc;

    public PresenceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Upserts the user's lastSeenOnline timestamp, and sets their status as online.
     * If the user has no row, it inserts one.
     * 
     * @param userId -> ID of the user sending a heartbeat
     */
    public void upsertPresence(int userId) {
        String sql = """
            INSERT INTO user_presence (user_id, last_seen, is_online)
            VALUES (?, NOW(), TRUE)
            ON CONFLICT (user_id)
            DO UPDATE SET last_seen = NOW(), is_online = true
        """;

        jdbc.update(sql, userId);
    }

    /**
     * Marks all users who haven't sent a heartbeat in 90 seconds as offline.
     * Called by cleanup job in PresenceService.
     */
    public void markAbsentUsersOffline() {
        String sql = """
            UPDATE user_presence
            SET is_online = FALSE
            WHERE last_seen < NOW() - INTERVAL '90 seconds'
            AND is_online = TRUE
        """;
        jdbc.update(sql);
    }

    /**
     * Checks if the selected user is currently online.
     * 
     * @param userId -> ID of the user who is being checked.
     * @return boolean if the user is online or not.
     */
    public boolean isOnline(int userId) {
        String sql = """
            SELECT is_online FROM user_presence WHERE user_id = ?
        """;
        try {
            Boolean result = jdbc.queryForObject(sql, Boolean.class, userId);
            return Boolean.TRUE.equals(result);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return false; // If user has never sent a heartbeat
        }
    }
}
