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

    // Number of right swipes received on this user's profile
    @Column(name = "right_swipes")
    private int rightSwipes = 0;

    // Number of left swipes received on this user's profile
    @Column(name = "left_swipes")
    private int leftSwipes = 0;

    // Number of successful matches from swipes
    @Column(name = "matches")
    private int matches = 0;

    public int getAnalyticsId() {
        return analyticsId;
    }

    public void setAnalyticsId(int analyticsId) {
        this.analyticsId = analyticsId;
    }

    public UserDatabase getUser() {
        return user;
    }

    public void setUser(UserDatabase user) {
        this.user = user;
    }

    public int getRightSwipes() {
        return rightSwipes;
    }

    public void setRightSwipes(int rightSwipes) {
        this.rightSwipes = rightSwipes;
    }

    public int getLeftSwipes() {
        return leftSwipes;
    }

    public void setLeftSwipes(int leftSwipes) {
        this.leftSwipes = leftSwipes;
    }

    public int getMatches() {
        return matches;
    }

    public void setMatches(int matches) {
        this.matches = matches;
    }
}