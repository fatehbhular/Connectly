package com.comp602project.comp602projectbackend.auth;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.mindrot.jbcrypt.BCrypt;

import com.comp602project.comp602projectbackend.matching.DistanceScorer;

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
        user.setOtpEnabled(row.isOtpEnabled());
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
        row.setOtpEnabled(user.isOtpEnabled());
        return row;
    }



    public User login(String username, String password) {                   // Find a user by username and verify their password. Returns User or Null

        // Find the row in Supabase by username
        UserDatabase row = db.findByUsername(username).orElse(null);
        if (row == null) return null;

        User user = toUser(row);                                            // Convert the database entires into a User Object

        // Check password - supports both BCrypt hashed and legacy plain text passwords
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

    public User getById(int id) {                                           // Get a User Object by thier ID
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

    public void save(User user)   { db.save(toDatabase(user)); }            // Save a brand new user to the database
    public void update(User user) { db.save(toDatabase(user)); }            // Update an existing user in the database.
    public void delete(int id) { db.deleteById(id); }                       // Delete a user by id
    public void logout() { signedInUser = null; }

    public User toggleOtp(String email, boolean enable){
        UserDatabase row = db.findByEmail(email).orElse(null);         // Get the email 
        if (row == null) return null; 
        row.setOtpEnabled(enable);                                           // Enable Otp if row != null
        db.save(row);                                                        // Save to database
        User user = toUser(row);
        if (signedInUser != null && signedInUser.getEmail().equals(email)) {
            signedInUser.setOtpEnabled(enable);
        }
        return user;
    }

    public User findByEmail(String email){
        UserDatabase row = db.findByEmail(email).orElse(null);          //  Get the email 
        return toUser(row);
    }

    public void resetPassword(String email, String newPassword){
        UserDatabase row = db.findByEmail(email).orElse(null);
        if(row == null) return;
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

    public void deleteByEmail(String email){                                   //  Delete a user by email
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