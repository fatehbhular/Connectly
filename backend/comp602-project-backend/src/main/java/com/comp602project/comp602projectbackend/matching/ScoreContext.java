package com.comp602project.comp602projectbackend.matching;

public class ScoreContext {
    private String user1Location;
    private String user2Location;
    private String user1Industry;
    private String user2Industry;

    // Getters
    public String getUser1Location() { return user1Location; }
    public String getUser2Location() { return user2Location; }
    public String getUser1Industry() { return user1Industry; }
    public String getUser2Industry() { return user2Industry; }

    // Setters
    public void setUser1Location(String user1Location) { this.user1Location = user1Location; }
    public void setUser2Location(String user2Location) { this.user2Location = user2Location; }
    public void setUser1Industry(String user1Industry) { this.user1Industry = user1Industry; }
    public void setUser2Industry(String user2Industry) { this.user2Industry = user2Industry; }
}