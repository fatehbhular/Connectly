package com.comp602project.comp602projectbackend.auth;
 
import java.util.List;
import java.util.Map;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
        String username = body.get("username").toLowerCase().trim();
        String password = body.get("password");
 
        User user = userRepository.login(username, password);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();              // 404, send back nothing
        }

        if (Boolean.TRUE.equals(user.isOtpEnabled())) {                                // Only happens if user enables 2 factor authentication
            String email = user.getEmail();
            if(email == null){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();           // 400, malformed request syntax
            }
            otpService.sendOtp(email);                                                  // Send Otp to user email
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
        newUser.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));                 // Hash password before saving
 
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
 

    @PostMapping("/auth/otp/toggle")
    public ResponseEntity<User> toggleOtp(@RequestBody Map<String, String> body) {      // runs when React sends a Post request to "/auth/otp/toggle"
        String email = body.get("email");                                               // fetch users email and otp boolean value
        boolean enable = Boolean.parseBoolean(body.get("enable"));

        User user = userRepository.toggleOtp(email, enable);
        return ResponseEntity.ok(user);
    }


    @PostMapping("/auth/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) { // runs when React sends a Post request to "/auth/verify-otp"    
        String email = body.get("email");                                                    // fetch users input of their email and code to verify
        String code = body.get("code");
        String context = body.get("context");

        boolean valid = otpService.verifyOtp(email, code);

        if (!valid) {
            if ("signup".equals(context) && otpService.isExpired(email)) {              // if expired during signup, delete the unverified user
                userRepository.deleteByEmail(email);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid or expired code"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    @PostMapping("/auth/send-verification")
    public ResponseEntity<Void> sendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        if (userRepository.findByEmail(email) != null) {                        // email already in use
            return ResponseEntity.status(HttpStatus.CONFLICT).build();          // 409
        }
        otpService.sendOtp(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/forgot-password")                                                  
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> body) {           // Called when user input their email to reset password in login page
        String email = body.get("email");                                                    // fetch users email to send the OTP to
        if (email == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        User user = userRepository.findByEmail(email);                                      // check email exists
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

    @PostMapping("/auth/update-password")
    public ResponseEntity<Void> updatePassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("password");
        if (email == null || newPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        userRepository.resetPassword(email, BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/change-email/initiate")
    public ResponseEntity<Map<String, String>> changeEmailInitiate(
            @RequestHeader("userId") int userId,
            @RequestBody Map<String, String> body) {
        String newEmail = body.get("newEmail");
        if (newEmail == null || newEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "New email is required."));
        }
        newEmail = newEmail.toLowerCase().trim();

        User user = userRepository.getById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }
        if (userRepository.findByEmail(newEmail) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "That email is already in use."));
        }

        boolean hasCurrentEmail = user.getEmail() != null && !user.getEmail().isBlank();
        if (!hasCurrentEmail) {
            otpService.sendOtp(newEmail);
            return ResponseEntity.ok(Map.of(
                    "step", "verify-new",
                    "message", "Verification code sent to your email."));
        }

        if (newEmail.equals(user.getEmail().toLowerCase().trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "That is already your current email."));
        }

        otpService.sendOtp(user.getEmail());
        return ResponseEntity.ok(Map.of(
                "step", "verify-current",
                "message", "Verification code sent to your current email."));
    }

    @PostMapping("/auth/settings/update-password")
    public ResponseEntity<Map<String, String>> settingsUpdatePassword(
            @RequestHeader("userId") int userId,
            @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Password is required."));
        }

        User user = userRepository.getById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }

        boolean hasEmail = user.getEmail() != null && !user.getEmail().isBlank();
        if (hasEmail) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Use email verification to change your password."));
        }

        userRepository.updatePasswordByUserId(userId, BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        return ResponseEntity.ok(Map.of("message", "Password updated."));
    }

    @PostMapping("/auth/change-email/verify-current")
    public ResponseEntity<Map<String, String>> changeEmailVerifyCurrent(
            @RequestHeader("userId") int userId,
            @RequestBody Map<String, String> body) {
        String newEmail = body.get("newEmail");
        String code = body.get("code");
        if (newEmail == null || newEmail.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "New email and verification code are required."));
        }
        newEmail = newEmail.toLowerCase().trim();
        code = code.trim().toUpperCase();

        User user = userRepository.getById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }
        if (userRepository.findByEmail(newEmail) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "That email is already in use."));
        }
        if (!otpService.verifyOtp(user.getEmail(), code)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired code."));
        }

        otpService.sendOtp(newEmail);
        return ResponseEntity.ok(Map.of("message", "Code sent to your new email."));
    }

    @PostMapping("/auth/change-email/confirm")
    public ResponseEntity<?> changeEmailConfirm(
            @RequestHeader("userId") int userId,
            @RequestBody Map<String, String> body) {
        String newEmail = body.get("newEmail");
        String code = body.get("code");
        if (newEmail == null || newEmail.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "New email and verification code are required."));
        }
        newEmail = newEmail.toLowerCase().trim();
        code = code.trim().toUpperCase();

        User user = userRepository.getById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }
        if (userRepository.findByEmail(newEmail) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "That email is already in use."));
        }
        if (!otpService.verifyOtp(newEmail, code)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired code."));
        }

        User updated = userRepository.changeEmail(userId, newEmail);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }
        return ResponseEntity.ok(updated);
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

    @GetMapping("/users/connections")
    public ResponseEntity<List<Integer>> getConnectionKeys(@RequestHeader("userId") int userId) {
        User user = userRepository.getById(userId);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(user.getConnectionKeys());
    }

@PostMapping("/users/block")
public ResponseEntity<User> blockUser(
        @RequestHeader("userId") int userId,
        @RequestBody Map<String, Integer> body) {
    int targetId = body.get("targetUserId");
    User updated = userRepository.blockUser(userId, targetId);
    if (updated == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    return ResponseEntity.ok(updated);
}



}



