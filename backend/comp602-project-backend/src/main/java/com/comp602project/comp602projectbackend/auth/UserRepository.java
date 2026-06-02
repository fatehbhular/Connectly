package com.comp602project.comp602projectbackend.auth;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.mindrot.jbcrypt.BCrypt;

import com.comp602project.comp602projectbackend.matching.DistanceScorer;

@Service
public class UserRepository {

    private User signedInUser;

    @Autowired
    private UserJpaRepository db;

    @Autowired
    private JdbcTemplate jdbc;

    /** Copy any existing per-platform links into the single social_url column once. */
    @PostConstruct
    public void migrateLegacySocialUrls() {
        try {
            jdbc.update("""
                UPDATE users
                SET social_url = COALESCE(
                    NULLIF(TRIM(linkedin_url), ''),
                    NULLIF(TRIM(github_url), ''),
                    NULLIF(TRIM(instagram_url), '')
                )
                WHERE (social_url IS NULL OR TRIM(social_url) = '')
                  AND (
                    (linkedin_url IS NOT NULL AND TRIM(linkedin_url) <> '')
                    OR (github_url IS NOT NULL AND TRIM(github_url) <> '')
                    OR (instagram_url IS NOT NULL AND TRIM(instagram_url) <> '')
                  )
                """);
        } catch (Exception ignored) {
            // Legacy columns may not exist on fresh databases.
        }
    }

    private User toUser(UserDatabase row) {
        if (row == null) return null;
        User user = new User();
        user.setUserId(row.getUserId());
        user.setUsername(row.getUsername());
        user.setPassword(row.getPassword());
        user.setEmail(row.getEmail());
        user.setLatitude(row.getLatitude());
        user.setLongitude(row.getLongitude());
        user.setLocation(row.getLocation());
        user.setDisplayName(row.getDisplayName());
        user.setBio(row.getBio());
        user.setSkills(row.getSkills());
        user.setIndustry(row.getIndustry());
        user.setPortfolioUrl(row.getPortfolioUrl());
        user.setDmKeys(row.getDmKeys());
        user.setConnectionKeys(row.getConnectionKeys());
        user.setProfileComplete(row.isProfileComplete());
        user.setRequestedUsers(row.getRequestedUsers());
        user.setOtpEnabled(row.isOtpEnabled());
        user.setSocialUrl(row.getSocialUrl());
        user.setBlockedUsers(row.getBlockedUsers());
        return user;
    }

    private UserDatabase toDatabase(User user) {
        if (user == null) return null;
        UserDatabase row = new UserDatabase();
        row.setUserId(user.getUserId());
        row.setUsername(user.getUsername());
        row.setPassword(user.getPassword());
        row.setEmail(user.getEmail());
        row.setLatitude(user.getLatitude());
        row.setLongitude(user.getLongitude());
        row.setLocation(user.getLocation());
        row.setDisplayName(user.getDisplayName());
        row.setBio(user.getBio());
        row.setSkills(user.getSkills());
        row.setIndustry(user.getIndustry());
        row.setPortfolioUrl(user.getPortfolioUrl());
        row.setDmKeys(user.getDmKeys());
        row.setConnectionKeys(user.getConnectionKeys());
        row.setProfileComplete(user.isProfileComplete());
        row.setRequestedUsers(user.getRequestedUsers());
        row.setOtpEnabled(user.isOtpEnabled());
        row.setSocialUrl(user.getSocialUrl());
        row.setBlockedUsers(user.getBlockedUsers());
        return row;
    }

    public User login(String username, String password) {
        UserDatabase row = db.findByUsername(username).orElse(null);
        if (row == null) return null;
        User user = toUser(row);
        boolean passwordValid;
        try {
            passwordValid = BCrypt.checkpw(password, user.getPassword());
        } catch (Exception e) {
            passwordValid = false;
        }
        if (!passwordValid) return null;
        this.signedInUser = user;
        signedInUser.setConnections(getConnections());
        return user;
    }

    public User getSignedInUser() { return signedInUser; }

    public User getById(int id) {
        return getAll().stream()
                   .filter(u -> u.getUserId() == id)
                   .findFirst()
                   .orElse(null);
    }

    public List<User> getAll() {
        return db.findAll()
                        .stream()
                        .map(this::toUser)
                        .collect(Collectors.toList());
    }

    public List<List<User>> getDMList() {
        if (signedInUser == null) return List.of();
        if (signedInUser.getDmKeys() == null) return List.of();
        List<List<User>> result = new ArrayList<>();
        for (String key : signedInUser.getDmKeys()) {
            List<User> participants = new ArrayList<>();
            for (String id : key.split("_")) {
                User participant = getById(Integer.parseInt(id));
                if (participant != null) participants.add(participant);
            }
            result.add(participants);
        }
        return result;
    }

    public List<User> getConnections() {
        if (signedInUser == null) return List.of();
        if (signedInUser.getConnectionKeys() == null) return List.of();
        List<User> result = new ArrayList<>();
        for (int id : signedInUser.getConnectionKeys()) {
            User other = getById(id);
            if (other != null) result.add(other);
        }
        return result;
    }

    public void updateUserLongitudeLatitude() throws Exception {
        final DistanceScorer distanceScorer = new DistanceScorer();
        float[] LonLat = distanceScorer.getUserLongitudeLatitude(signedInUser.getLocation());
        signedInUser.setLongitude((double)LonLat[0]);
        signedInUser.setLatitude((double)LonLat[1]);
        toDatabase(signedInUser);
    }

    public void addConnection(User other) {
        if (signedInUser == null) return;
        signedInUser.getConnectionKeys().add(other.getUserId());
        other.getConnectionKeys().add(signedInUser.getUserId());
        update(signedInUser);
        update(other);
    }

    // Block a user
    public User blockUser(int currentUserId, int targetUserId) {
        User currentUser = getById(currentUserId);
        if (currentUser == null) return null;
        List<Integer> blocked = currentUser.getBlockedUsers();
        if (blocked == null) blocked = new ArrayList<>();
        if (!blocked.contains(targetUserId)) {
            blocked.add(targetUserId);
            currentUser.setBlockedUsers(blocked);
            update(currentUser);
            if (signedInUser != null && signedInUser.getUserId() == currentUserId) {
                signedInUser.setBlockedUsers(blocked);
            }
        }
        return currentUser;
    }

    public void save(User user)   { db.save(toDatabase(user)); }
    public void update(User user) { db.save(toDatabase(user)); }
    public void delete(int id) { db.deleteById(id); }
    public void logout() { signedInUser = null; }

    public User toggleOtp(String email, boolean enable) {
        UserDatabase row = db.findByEmail(email).orElse(null);
        if (row == null) return null;
        row.setOtpEnabled(enable);
        db.save(row);
        User user = toUser(row);
        if (signedInUser != null && signedInUser.getEmail().equals(email)) {
            signedInUser.setOtpEnabled(enable);
        }
        return user;
    }

    public User findByEmail(String email) {
        UserDatabase row = db.findByEmail(email).orElse(null);
        return toUser(row);
    }

    public void resetPassword(String email, String newPassword) {
        UserDatabase row = db.findByEmail(email).orElse(null);
        if (row == null) return;
        row.setPassword(newPassword);
        db.save(row);
    }

    public boolean updatePasswordByUserId(int userId, String hashedPassword) {
        User user = getById(userId);
        if (user == null) return false;
        user.setPassword(hashedPassword);
        update(user);
        if (signedInUser != null && signedInUser.getUserId() == userId) {
            signedInUser.setPassword(hashedPassword);
        }
        return true;
    }

    public void deleteByEmail(String email) {
        db.deleteByEmail(email);
    }

    public User changeEmail(int userId, String newEmail) {
        User user = getById(userId);
        if (user == null) return null;
        user.setEmail(newEmail);
        update(user);
        if (signedInUser != null && signedInUser.getUserId() == userId) {
            signedInUser.setEmail(newEmail);
        }
        return user;
    }
}