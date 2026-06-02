package com.comp602project.comp602projectbackend.messaging;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class GroupSchemaMigration {

    @Autowired
    private JdbcTemplate jdbc;

    @PostConstruct
    public void ensureCreatedAtColumn() {
        try {
            jdbc.execute("ALTER TABLE group_chats ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ");
        } catch (Exception ignored) {
            // Table may not exist yet in local dev.
        }
    }
}
