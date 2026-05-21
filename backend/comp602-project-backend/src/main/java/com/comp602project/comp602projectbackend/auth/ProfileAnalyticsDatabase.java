package com.comp602project.comp602projectbackend.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "profile_analytics")
public class ProfileAnalyticsDatabase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analytics_id")
    private int analyticsId;

    // Creates a one-to-one relationship between analytics and a user
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private UserDatabase user;

    // Stores how many times the user's profile has been viewed
    @Column(name = "profile_views")
    private int profileViews = 0;

    // Stores how many likes the user's profile has received
    @Column(name = "likes")
    private int likes = 0;

    // Stores how many successful matches the user has received
    @Column(name = "successful_matches")
    private int successfulMatches = 0;

    public int getAnalyticsId() { return analyticsId; }
    public void setAnalyticsId(int analyticsId) { this.analyticsId = analyticsId; }

    public UserDatabase getUser() { return user; }
    public void setUser(UserDatabase user) { this.user = user; }

    public int getProfileViews() { return profileViews; }
    public void setProfileViews(int profileViews) { this.profileViews = profileViews; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public int getSuccessfulMatches() { return successfulMatches; }
    public void setSuccessfulMatches(int successfulMatches) {
        this.successfulMatches = successfulMatches;
    }
}