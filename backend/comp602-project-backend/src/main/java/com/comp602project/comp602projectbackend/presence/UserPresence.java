package com.comp602project.comp602projectbackend.presence;

import java.time.OffsetDateTime;


/**
 * Represents the presence of a user, if they are currently online or not.
 */
public class UserPresence {
    private int userId;
    private OffsetDateTime lastSeenOnline;
    private boolean isOnline;

    public UserPresence(int userId, OffsetDateTime lastSeenOnline, boolean isOnline) {
        this.userId = userId;
        this.lastSeenOnline = lastSeenOnline;
        this.isOnline = isOnline;
    }

    public int getUserId() { return userId; }
    public OffsetDateTime getLastSeenOnline() { return lastSeenOnline; }
    public boolean getIsOnline() { return isOnline; }
}
