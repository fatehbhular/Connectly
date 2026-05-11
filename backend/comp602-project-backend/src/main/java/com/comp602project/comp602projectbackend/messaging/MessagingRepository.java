package com.comp602project.comp602projectbackend.messaging;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.time.Instant;

/**
    Repository layer for messaging feature

    Owns all database interactions related to messaging and conversations
    - No business logic is allowed here
    - Only persistence and retrieval

    {@code @Repository} tells Spring to manage this class as a bean so it can be injected into service layer. Handles SQL query errors.
*/

@Repository
public class MessagingRepository {

    /*
        Spring tool that handles opening connections, running statements and closing connections safely.
        - No need for us to manage boilerplate manually
    */
    private final JdbcTemplate jdbcTemplate; 


    /**
        Injects JdbcTemplate into Repository -> Spring wires the {@link JDbcTemplate} bean here.
    */
    public MessagingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
        Persists a message to the database

        Flow:
        1. Checks if conversation row exists, if it doesn't -> creates new conversation so the message can be stored in (Avoids having separate createConversation()).
        2. Insert the message by linking it to the conversation above.

        @param conversationKey -> sorted userID string identifying the conversation
        @param senderId -> ID of the user who sent the message
        @param content -> text in the message
        @param timestamp -> string representation of when message was created
    */
    public void saveMessageToDatabase(String conversationKey, int senderId, String content, String timestamp) {
        /*
            Upsert the conversation -> create if it doesn't already exist, otherwise leave it untouched.
            ON CONFLICT DO NOTHING prevents duplicate key error for when the conversation already exists
        */
        String checkConversation = "INSERT INTO conversations (conversation_key) VALUES (?) ON CONFLICT (conversation_key) DO NOTHING";
        jdbcTemplate.update(checkConversation, conversationKey);

        /*
            Inputs the message into the messages database associated with conversationKey.
        */
        String insertMessage = "INSERT INTO messages (conversation_key, sender_id, content, timestamp) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertMessage, conversationKey, senderId, content, timestamp);
    }

    public void createConversation(String conversationKey) {

        String checkConversation = "INSERT INTO conversations (conversation_key) VALUES (?) ON CONFLICT (conversation_key) DO NOTHING";
        jdbcTemplate.update(checkConversation, conversationKey);
    }

    /**
     * Retrieves all messages belonging to the given conversation, in the order stored in the database.
     * 
     * Uses {@link #mapToMessage} to convert each SQL row into a {@link Message} object.
     * 
     * @param conversationKey -> the conversation to fetch messages from.
     * @return a {@link List} of {@link Message} objects -> empty list if none found.
     */
    public List<Message> getMessageByConversationKey(String conversationKey) {
        String sql = "SELECT * FROM messages WHERE conversation_key = ?";
        /*
            query() does the following:
            1. runs the SQL binds conversationKey as "?" parameter
            2. calls mapToMessage() once per row to build the result list
        */
        return jdbcTemplate.query(sql, this::mapToMessage, conversationKey);
    }

    /**
     * Row mapper: converts a single {@link ResultSet} row to a {@link Message} instance.
     *
     * Called automatically by {@link JdbcTemplate#query} for each row returned.
     *
     * @param rs -> current row from SQL result set
     * @param rowNumber -> zero-based index of this row
     * @return a fully construction {@link Message} object
     * @throws SQLException if any column cannot be read from the result set.
     */
    private Message mapToMessage(ResultSet rs, int rowNumber) throws SQLException {
        String rawTimestamp = rs.getString("timestamp");
        Instant sentAt = Instant.parse(rawTimestamp); // parses ISO 8601 like "2026-04-22T05:54:32.585010Z"

        return new Message(
            rs.getInt("id"),
            rs.getString("conversation_key"),
            rs.getInt("sender_id"),
            rs.getString("content"),
            sentAt
        );
    }

    /**
     * Retrieves all conversation keys associated with a user.
     *
     * @param userId -> the user whose conversation keys to fetch.
     * @return a {@link List} of conversation key strings.
     */
    public List<String> getConversationKeysByUserId(int userId) {
        String sql = "SELECT unnest(dm_keys) FROM users WHERE user_id = ?";
        return jdbcTemplate.queryForList(sql, String.class, userId);
    }

    /**
     * Retrieves the most recent message in a conversation.
     * 
     * @param conversationKey - the conversation to fetch last message from
     * @return the most recent {@link Message} object, or null if none found
     */
    public Message getLastMessage(String conversationKey) {
        String sql = "SELECT * FROM messages WHERE conversation_key = ? ORDER BY timestamp DESC LIMIT 1";
        List<Message> results = jdbcTemplate.query(sql, this::mapToMessage, conversationKey);
        return results.isEmpty() ? null : results.get(0);
    }
}
