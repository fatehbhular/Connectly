package com.comp602project.comp602projectbackend.auth;

import java.util.ArrayList;
import java.util.List;

public class User {

    private int userId;                                                         // Private key of users
    private String username;
    private String password;
    private String email;
 
    private Double latitude;
    private Double longitude;
 
    private String displayName;
    private String bio;
    private String[] skills;                                                    // "Java", "React"
    private String industry;
    private String portfolioUrl;
 
    // (for easy database storing)
    private String[] dmKeys;                                                    // "userId_userId_userId..."
                                                                                // Each Key is one conversation, MAKE SURE THE KEYS ARE ALWAYS SORTED NUMERICALLY
    private List<Integer> connectionKeys = new ArrayList<>();                   // [12,124,45,325,63]
 
    // List of users generated at runtime, not stored in database
    private List<List<User>> dmUsers = new ArrayList<>();
    private List<User> connections = new ArrayList<>();

    public User() {}

    public User(int userId, String username, String password) {                 // Use this when the user first signs in
        this.userId = userId;
        this.username = username;
        this.password = password;
    }



    public boolean checkPassword(String plainPassword) {                        // Check if plaintext password matches with the stored password
        return this.password.equals(plainPassword);
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

    public String[] getDmKeys() { return dmKeys; }
    public void setDmKeys(String[] dmKeys) { this.dmKeys = dmKeys; }

    public List<Integer> getConnectionKeys() { return connectionKeys; }
    public void setConnectionKeys(List<Integer> keys) { this.connectionKeys = keys; }

    public List<List<User>> getDmUsers() { return dmUsers; }
    public void setDmUsers(List<List<User>> dmUsers) { this.dmUsers = dmUsers; }

    public List<User> getConnections() { return connections; }
    public void setConnections(List<User> c) { this.connections = c; }
}
