package com.comp602project.comp602projectbackend.auth;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

/**
 * This class is pretty much the same as the User class, but instead it tells Spring how to map each field to a Supabase column.
 * ONLY UserRepository READS AND WRITES FROM THIS, NOTHING ELSE TOUCHES IT
 * When springboot runs for first time, it will do the SQL automatically; CREATE TABLE users
 */

@Entity
@Table(name = "users")
public class UserDatabase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double latitude;

    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double longitude;

    private String location;
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT[]")
    private String[] skills;

    private String industry;
    private String portfolioUrl;

    @Column(name = "social_url")
    private String socialUrl;

    @Column(name = "dm_keys", columnDefinition = "TEXT[]")
    private List<String> dmKeys = new ArrayList<>();

    @Column(name = "connection_keys", columnDefinition = "INT[]")
    private List<Integer> connectionKeys = new ArrayList<>();

    @Column(name = "profile_complete")
    private Boolean profileComplete = false;

    @Column(name = "requested_user", columnDefinition = "INT[]")
    private List<Integer> requestedUsers = new ArrayList<>();

    @Column(name = "otp_enabled")
    private Boolean otpEnabled = false;

    // Blocked users list
    @Column(name = "blocked_users", columnDefinition = "INT[]")
    private List<Integer> blockedUsers = new ArrayList<>();

    // SETTERS AND GETTERS

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String[] getSkills() { return skills; }
    public void setSkills(String[] skills) { this.skills = skills; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getSocialUrl() { return socialUrl; }
    public void setSocialUrl(String socialUrl) { this.socialUrl = socialUrl; }

    public List<String> getDmKeys() { return dmKeys; }
    public void setDmKeys(List<String> dmKeys) { this.dmKeys = dmKeys; }

    public List<Integer> getConnectionKeys() { return connectionKeys; }
    public void setConnectionKeys(List<Integer> keys) { this.connectionKeys = keys; }

    public Boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(Boolean complete) { this.profileComplete = complete; }

    public List<Integer> getRequestedUsers() { return requestedUsers; }
    public void setRequestedUsers(List<Integer> keys) { this.requestedUsers = keys; }

    public Boolean isOtpEnabled() { return otpEnabled; }
    public void setOtpEnabled(Boolean otpEnabled) { this.otpEnabled = otpEnabled; }

    // For blocked users
    public List<Integer> getBlockedUsers() { return blockedUsers; }
    public void setBlockedUsers(List<Integer> blockedUsers) { this.blockedUsers = blockedUsers; }
}