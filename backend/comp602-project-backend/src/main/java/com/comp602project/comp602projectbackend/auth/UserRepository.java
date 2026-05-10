package com.comp602project.comp602projectbackend.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.matching.DistanceScorer;

import jakarta.annotation.PostConstruct;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * THIS IS THE ONLY CLASS THAT TALKS TO THE DATABASE. so nothing outside this class ever sees the UserDatabase
 * React never calls this class directly, needs controller: React -> Controller -> UserRepository -> Supabase (UserDatabase)
 *
 * There are 3 main purposes for this class:
 *  1. Converts UserDatabase entires into User classes
 *  2. Hold the signed in user for the session
 *  3. Some methods for convinience
 */

@Service                                                                    // Tells Spring this is a service, so it can be injected anywhere with @Autowired
                                                                            // makes one instance of it and keep it ready
public class UserRepository {

    private User signedInUser;                                              // Holds the currently logged in user for the session

    @Autowired
    private UserJpaRepository db;                                           // Spring injects this automatically, this is the actaul repository talking to the database

    @PostConstruct
    public void warmCache() { getAll(); }                                   // populates allUsersCache on startup

    private User toUser(UserDatabase row) {
        if (row == null) return null;                                       // If nothing came back from Supabase, return null
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
        return user;
    }

    private UserDatabase toDatabase(User user) {                            // This method converts a User Object into a UserDatabase row for saving
        if (user == null) return null;                                      // Called every time we write to the DB.
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
        return row;
    }



    public User login(String username, String password) {                   // Find a user by username and verify their password. Returns User or Null

        // Find the row in Supabase by username
        UserDatabase row = db.findByUsername(username).orElse(null);
        if (row == null) return null;

        User user = toUser(row);                                            // Convert the database entires into a User Object
        if (!user.checkPassword(password)) return null;

        this.signedInUser = user;
        signedInUser.setConnections(getConnections());
        return user;
    }



    public User getSignedInUser() { return signedInUser; }

    public User getById(int id) {                                           // Get a User Object by thier ID
        return getAll().stream()
                   .filter(u -> u.getUserId() == id)
                   .findFirst()
                   .orElse(null);
    }

    // Cache all users; invalidate when any user updates
    private List<User> allUsersCache = null;
    public void invalidateAllUsersCache() { allUsersCache = null; }

    public List<User> getAll() {
        if (allUsersCache != null) return allUsersCache;
        allUsersCache = db.findAll()
                        .stream()
                        .map(this::toUser)
                        .collect(Collectors.toList());
        return allUsersCache;
    }


    // It might lowky be better to use the String[] dmKeys instead of calling this method for finding dm databases
    public List<List<User>> getDMList() {                                   // Returns a full list of DM conversations for the signed in user
        if (signedInUser == null) return List.of();
        if (signedInUser.getDmKeys() == null) return List.of();
 
        List<List<User>> result = new ArrayList<>();
        for (String key : signedInUser.getDmKeys()) {                       // go through each dm key: "1_2", "1_32_92"
            List<User> participants = new ArrayList<>();
            for (String id : key.split("_")) {
                User participant = getById(Integer.parseInt(id));           // fetch each participant from Supabase by their ID
                if (participant != null) participants.add(participant);
            }
            result.add(participants);
        }
        return result;
    }
  
    
    public List<User> getConnections() {                                    // Returns the full list of connections for the logged in user as User objects
        if (signedInUser == null) return List.of();
        if (signedInUser.getConnectionKeys() == null) return List.of();
 
        List<User> result = new ArrayList<>();
        for (int id : signedInUser.getConnectionKeys()) {
            User other = getById(id);                                       // fetch each connection from Supabase by their ID
            if (other != null) result.add(other);
        }
        return result;
    }
  
    public void updateUserLongitudeLatitude() throws Exception {
        final  DistanceScorer distanceScorer = new DistanceScorer();
        float[] LonLat = distanceScorer.getUserLongitudeLatitude(signedInUser.getLocation());

        signedInUser.setLongitude((double)LonLat[0]);
        signedInUser.setLatitude((double)LonLat[1]);

        toDatabase(signedInUser);
    }
  
  

    // ONLY CALL THIS IF BOTH USERS CONNECT WITH EACHOTHER (figure out later lol)
    public void addConnection(User other) {
        if (signedInUser == null) return;
 
        signedInUser.getConnectionKeys().add(other.getUserId());            // add other users id to signed in users list
        other.getConnectionKeys().add(signedInUser.getUserId());            // add signed in users ID to other users list
 
        update(signedInUser);
        update(other);
    }

    public void save(User user)   { db.save(toDatabase(user)); invalidateAllUsersCache(); }     // Save a brand new user to the database
    public void update(User user) {                                                             // Update an existing user in the database.
        db.save(toDatabase(user));
        if (allUsersCache != null) {
            allUsersCache.replaceAll(u -> u.getUserId() == user.getUserId() ? user : u);
        }
    }
    public void delete(int id) { db.deleteById(id); }                       // Delete a user by id
    public void logout() { signedInUser = null; }
}