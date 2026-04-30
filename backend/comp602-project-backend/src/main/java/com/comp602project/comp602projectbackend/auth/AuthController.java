package com.comp602project.comp602projectbackend.auth;
 
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/*
React                           Spring Boot
────────────────────────────────────────────────────────────────
fetch("/api/users/method")  ->  @RestController (AuthController)
                                    v  
                                calls UserRepository.method()
                                    v  
                                calls UserJpaRepository (db)
                                    v  
                                Supabase
*/

/**
 * AuthController handles HTTP requests from React when it comes to UserRepository methods
 * React never calls UserRepository directly, it will need to call the methods trhough this class.
 */

@RestController                                                                         // Tells Spring this class handles HTTP requests and sends back JSON
@CrossOrigin(origins = "http://localhost:5173")                                         // Allows React (on port 5173) to call these endpoints
public class AuthController {   
 
    @Autowired                                                                          // Spring automatically plugs in the UserRepository instance here
    private UserRepository userRepository;
 


    @PostMapping("/auth/login")                                                         // Call this method when the user tries to login (POST request)
    public ResponseEntity<User> login(@RequestBody Map<String, String> body) {          // @RequestBody reads the JSON React sent and converts it into a Map
        String username = body.get("username").toLowerCase().trim();
        String password = body.get("password");
 
        User user = userRepository.login(username, password);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();              // 404, send back nothing
        }
        return ResponseEntity.ok(user);                                                 // 200, send back User object as JSON
    }

    
 
    @PostMapping("/auth/signup")                                                        // Call this method when the user tries to sign up
    public ResponseEntity<User> signup(@RequestBody Map<String, String> body) {
        String username = body.get("username").toLowerCase().trim();
        String password = body.get("password");
 
        if (username == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
 
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password);
 
        try {
            userRepository.save(newUser);                                               // save the new user to Supabase
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); 
        }
 
        User loggedIn = userRepository.login(username, password);                       // Log them in automatically after signing up
        return ResponseEntity.ok(loggedIn);
    }
 

    @PostMapping("/auth/logout")                                                        // runs when React sends a POST request to "/auth/logout"
    public ResponseEntity<Void> logout() {
        userRepository.logout();
        return ResponseEntity.ok().build();
    }
 

    @GetMapping("/users")                                                               // runs when React sends a GET request to "/users", returns all the users
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.getAll());                              // fetch all users from Supabase and send them back as JSON
    }
 

    @GetMapping("/users/me")                                                            // runs when React sends a GET request to "/users/me"
    public ResponseEntity<User> getSignedInUser() { 
        User user = userRepository.getSignedInUser();                                   // get the currently logged in user from UserRepository
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/selectedUserDisplayName")                                       // runs when React sends a GET request to "/users/selectedUserDisplayName"
    public ResponseEntity<String> getUserDisplayName(@RequestParam("id") int id) {
        User user = userRepository.getById(id);                                         // get the user from UserRepository with the inputted ID 
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        String displayName = user.getDisplayName();
        return ResponseEntity.ok(displayName);
    }
}