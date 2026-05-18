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
import org.mindrot.jbcrypt.BCrypt;

import com.comp602project.comp602projectbackend.auth.services.OtpService;

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
@CrossOrigin(origins = "*")                                                             // Allows React (on port 5173) to call these endpoints
public class AuthController {   
 
    @Autowired                                                                          // Spring automatically plugs in the UserRepository instance here
    private UserRepository userRepository;
 
    @Autowired
    private OtpService otpService;

    @PostMapping("/auth/login")                                                         // Call this method when the user tries to login (POST request)
    public ResponseEntity<User> login(@RequestBody Map<String, String> body) {          // @RequestBody reads the JSON React sent and converts it into a Map
        String email = body.get("email").toLowerCase().trim();
        String password = body.get("password");
 
        User user = userRepository.login(email, password);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();              // 404, send back nothing
        }

        if (Boolean.TRUE.equals(user.isOtpEnabled())) { //Only happend if user enables 2 factor authentication
            if(email == null){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();           // 400, malformed request syntax
            }

            otpService.sendOtp(email);                                                  //Send Otp to user email

        }
        return ResponseEntity.ok(user);                                                 // 200, send back User object as JSON
    }

    
 
    @PostMapping("/auth/signup")                                                        // Call this method when the user tries to sign up
    public ResponseEntity<User> signup(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();
        String password = body.get("password");
 
        if (email == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
 
        User newUser = new User();
        for(int i = 0; i < email.length(); i++){
            if(email.charAt(i) == '@'){
                newUser.setUsername(email.substring(0, i));                 // Set username to the part of the email before the @ symbol
                break;
            }
        } 
        newUser.setEmail(email);
        newUser.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));                 // Hash password before saving
 
        try {
            userRepository.save(newUser);                                               // save the new user to Supabase
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); 
        }
 
        User loggedIn = userRepository.login(email, password);                          // Log them in automatically after signing up
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
 

    @PostMapping("/auth/otp/toggle")
    public ResponseEntity<User> toggleOtp(@RequestBody Map<String, String> body) {      // runs when React sends a Post request to "/auth/otp/toggle"                                                                                     //Returns email and 
        String email = body.get("email");                                          // fetch users email and otp boolean value
        boolean enable = Boolean.parseBoolean(body.get("enable"));

        User user = userRepository.toggleOtp(email, enable);
        return ResponseEntity.ok(user);
    }


    @PostMapping("/auth/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) { // runs when React sends a Post request to "/auth/verify-otp"    
        String email = body.get("email");                                                    // fetch users input of their email and code to verify
        String code = body.get("code");

        boolean valid = otpService.verifyOtp(email, code);

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid or expired code"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    @PostMapping("/auth/forgot-password")                                                  
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> body) {           // Called when user input their email to reset password in login page
        String email = body.get("email");                                                    // fetch users email to send the OTP to
        if (email == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        User user = userRepository.findByEmail(email); // check email exists
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        otpService.sendOtp(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody Map<String, String> body) {           // Called when user submits the code and new password in the forgot password page
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("password");

        if (email == null || code == null || newPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        boolean valid = otpService.verifyOtp(email, code);
        if (!valid) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        userRepository.resetPassword(email, BCrypt.hashpw(newPassword, BCrypt.gensalt())); // hash new password
        return ResponseEntity.ok().build();
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