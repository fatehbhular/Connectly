package com.comp602project.comp602projectbackend.messaging;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class MessagingRepository {
    
    private final JdbcTemplate jdbcTemplate;                             //Spring tool that handles opening connections, running statements and closing connections safely.

    public MessagingRepository(JdbcTemplate jdbcTemplate) {                  
        this.jdbcTemplate = jdbcTemplate;
    }

    public void saveMessageToDatabase(String conversationKey, String senderId, String content, String timestamp) {        //Saves the message into supabase (messaging database).
        String checkConversation = "INSERT INTO conversations (conversation_key) VALUES (?) ON CONFLICT (conversation_key) DO NOTHING";  //Checks if the conversation already exists in the conversation database, if not then creates the new instance with the conversationkey.
        jdbcTemplate.update(checkConversation, conversationKey);

        String insertMessage = "INSERT INTO messages (conversation_key, sender_id, content, timestamp) VALUES (?, ?, ?, ?)";  //Inputs the message into the messages database with the conversationKey, senderId, etc.
        jdbcTemplate.update(insertMessage, conversationKey, senderId, content, timestamp);
    }

    public List<Message> getMessageByConversationKey(String conversationKey) {                                             //Returns all messages with the selected conversationkey.
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
