package com.comp602project.comp602projectbackend.auth;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class User {

    private int userId;                                                         // Private key of users
    private String username;

    @JsonIgnore
    private String password;
    private String email;
 
    private Double latitude;
    private Double longitude;
    private String location;                                                    // CITY OWNLY
 
    private String displayName;
    private String bio;
    private String[] skills;                                                    // "Java", "React"
    private String industry;
    private String portfolioUrl;
    private String linkedinUrl;
    private String githubUrl;
 
    // (for easy database storing)
    private List<String> dmKeys;                                                    // "userId_userId_userId..."
                                                                                // Each Key is one conversation, MAKE SURE THE KEYS ARE ALWAYS SORTED NUMERICALLY
    private List<Integer> connectionKeys = new ArrayList<>();                   // [12,124,45,325,63]
 
    // List of users generated at runtime, not stored in database
    
    @JsonIgnore
    private List<List<User>> dmUsers = new ArrayList<>();

    @JsonIgnore
    private List<User> connections = new ArrayList<>();

    private Boolean profileComplete = false;

    private List<Integer> requestedUsers = new ArrayList<>(); 

    private Boolean otpEnabled = false;                                        // Added by Shawn

    public User() {}

    public User(int userId, String username, String password) {                 // Use this when the user first signs in
        this.userId = userId;
        this.username = username;
        this.password = password;
    }
    
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
    public void setIndustry(String industry) {  this.industry = industry; }

    public String getPortfolioUrl() { return portfolioUrl; }
public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

public String getLinkedinUrl() {
    return linkedinUrl;
}

public void setLinkedinUrl(String linkedinUrl) {
    this.linkedinUrl = linkedinUrl;
}

public String getGithubUrl() {
    return githubUrl;
}

public void setGithubUrl(String githubUrl) {
    this.githubUrl = githubUrl;
}

public List<String> getDmKeys() { return dmKeys; }
    public void setDmKeys(List<String> dmKeys) { this.dmKeys = dmKeys; }

    public List<Integer> getConnectionKeys() { return connectionKeys; }
    public void setConnectionKeys(List<Integer> keys) { this.connectionKeys = keys; }

    public List<List<User>> getDmUsers() { return dmUsers; }
    public void setDmUsers(List<List<User>> dmUsers) { this.dmUsers = dmUsers; }

    public List<User> getConnections() { return connections; }
    public void setConnections(List<User> c) { this.connections = c; }

    public Boolean isProfileComplete() { return profileComplete; }
    public void    setProfileComplete(Boolean complete) { this.profileComplete = complete; }

    public List<Integer> getRequestedUsers() { return requestedUsers; }
    public void setRequestedUsers(List<Integer> keys) { this.requestedUsers = keys; }

    public Boolean isOtpEnabled() { return otpEnabled; }                                        //Added by Shawn
    public void setOtpEnabled(Boolean otpEnabled) { this.otpEnabled = otpEnabled; }
}
