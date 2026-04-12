package com.comp602project.comp602projectbackend.messaging;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class MessagingRepository {
    
    private final JdbcTemplate jdbcTemplate;

    public MessagingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void saveMessageToDatabase(String conversationKey, String senderId, String content, String timestamp) {
        String checkConversation = "INSERT INTO conversations (conversation_key) VALUES (?) ON CONFLICT (conversation_key) DO NOTHING";
        jdbcTemplate.update(checkConversation, conversationKey);

        String insertMessage = "INSERT INTO messages (conversation_key, sender_id, content, timestamp) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertMessage, conversationKey, senderId, content, timestamp);
    }

    public List<Message> getMessageByConversationKey(String conversationKey) {
        String sql = "SELECT * FROM messages WHERE conversationKey = ?";
        return jdbcTemplate.query(sql, this::mapToMessage, conversationKey);
    }

    private Message mapToMessage(ResultSet rs, int rowNumber) throws SQLException {
        return new Message(
            rs.getString("id"),
            rs.getString("conversation_key"),
            rs.getString("sender_id"),
            rs.getString("content"),
            rs.getTimestamp("timestamp").toInstant()
        );
    }
}
