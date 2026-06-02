
package com.comp602project.comp602projectbackend.auth;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;                                               // standard API used in Java for working with databases using objects instead of raw SQL.

/**
 * This class is pretty much the same as the User class, but instead it tells Spring how to map each field to a Supabase column.
 * ONLY UserRepository READS AND WRITES FROM THIS, NOTHING ELSE TOUCHES IT
 * When springboot runs for first time, it will do the SQL automatically; CREATE TABLE users
 */

@Entity                                                                     // Tells Spring this class maps to a database table
@Table(name = "users")                                                      // The table name in Supabase
public class UserDatabase {

    @Id                                                                     // THIS IS THE PRIMARY KEY. it defines the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)                     // This defines how the primary key should be generated auto, this case is increments
    @Column(name = "user_id")
    private int userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Column(columnDefinition = "DOUBLE PRECISION")                          // Postgres type for decimal numbers
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
    private String linkedinUrl;
    private String githubUrl;

    @Column(name = "dm_keys", columnDefinition = "TEXT[]")                  // Each entry is a "1_2_3" key string
    private List<String> dmKeys = new ArrayList<>();

    @Column(name = "connection_keys", columnDefinition = "INT[]")           // Each entry is just a userId number
    private List<Integer> connectionKeys = new ArrayList<>();

    @Column(name = "profile_complete")
    private Boolean profileComplete = false;    
    
    @Column(name = "requested_user", columnDefinition = "INT[]")            // Each entry is just a userId number
    private List<Integer> requestedUsers = new ArrayList<>();

    @Column(name = "otp_enabled")
    private Boolean otpEnabled = false;                                     // Enables the 2 factor authetication for user - Added by Shawn

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

    public Boolean isProfileComplete() { return profileComplete; }
    public void    setProfileComplete(Boolean complete) { this.profileComplete = complete; }

    public List<Integer> getRequestedUsers() { return requestedUsers; }
    public void setRequestedUsers(List<Integer> keys) { this.requestedUsers = keys; }

    public Boolean isOtpEnabled() { return otpEnabled; }
    public void setOtpEnabled(Boolean otpEnabled) { this.otpEnabled = otpEnabled; }          //Set and Get method for OtpEnabled - Added by Shawn
}