package com.comp602project.comp602projectbackend.auth;

import com.comp602project.comp602projectbackend.matching.services.LocationService;
import com.comp602project.comp602projectbackend.matching.services.NominatimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;                                              // Spring automatically plugs in the UserRepository instance here

    // Used to convert city name to long and lat
    private final LocationService locationService = new LocationService(new NominatimService());

    // React sends displayName, industry, city, bio, skills in the request body
    // Saves the profile data, converts city to lat/lng, and updates profileComplete

    @PostMapping("/users/profile")
    public ResponseEntity<User> updateProfile(@RequestHeader("userId") int userId, @RequestBody Map<String, String> body) {

        User user = userRepository.getById(userId);

        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();   // 404; user doesnt exist

        String displayName = body.get("displayName");
        String industry = body.get("industry");
        String city = body.get("city");
        String bio = body.get("bio");
        String skills = body.get("skills");

        // Update each field in the user profile
        if (displayName != null && !displayName.isBlank()) user.setDisplayName(displayName.trim());
        if (industry != null && !industry.isBlank()) user.setIndustry(industry.trim());
        if (bio != null) user.setBio(bio.trim());
        if (skills != null && !skills.isBlank()) {                                      // Convert the comma seperated string into a list
            String[] skillArray = skills.split(",");
            for (int i = 0; i < skillArray.length; i++)
                skillArray[i] = skillArray[i].trim();
            user.setSkills(skillArray);
        }

        // Try to convert the city name to longitude and latitude
        if (city != null && !city.isBlank()) {
            try {
                float[] coords = locationService.getLongitudeLatitude(city.trim());
                user.setLocation(city.trim());                                          // save the city name, long and lat
                user.setLongitude((double) coords[0]);                                  
                user.setLatitude((double) coords[1]);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();           // 400; city not found
            }
        }

        // profileComplete is true only when all three required fields are filled, this controls if the user can access the rest of the app
        boolean complete = user.getDisplayName() != null && !user.getDisplayName().isBlank()
                        && user.getIndustry() != null && !user.getIndustry().isBlank()
                        && user.getLatitude() != null
                        && user.getLongitude() != null;

        user.setProfileComplete(complete);

        userRepository.update(user);                                                    // save all the changes to Supabase

        return ResponseEntity.ok(user);
    }

    // Returns the users current profile data
    @GetMapping("/users/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("userId") int userId) {
        User user = userRepository.getById(userId);
        if (user == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(user);
    }
}