package com.comp602project.comp602projectbackend.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.comp602project.comp602projectbackend.matching.services.LocationService;
import com.comp602project.comp602projectbackend.matching.services.NominatimService;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    private final LocationService locationService = new LocationService(new NominatimService());

    @PostMapping("/users/profile")
    public ResponseEntity<User> updateProfile(@RequestHeader("userId") int userId, @RequestBody Map<String, String> body) {

        User user = userRepository.getById(userId);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        String displayName  = body.get("displayName");
        String industry     = body.get("industry");
        String city         = body.get("city");
        String bio          = body.get("bio");
        String skills       = body.get("skills");
        String email        = body.get("email");
        String socialUrl    = body.get("socialUrl");
        String linkedinUrl  = body.get("linkedinUrl");
        String githubUrl    = body.get("githubUrl");
        String portfolioUrl = body.get("portfolioUrl");

        if (displayName != null && !displayName.isBlank()) user.setDisplayName(displayName.trim());
        if (industry != null && !industry.isBlank()) user.setIndustry(industry.trim());
        if (bio != null) user.setBio(bio.trim());
        if (email != null && !email.isBlank()) user.setEmail(email.trim());
        if (skills != null && !skills.isBlank()) {
            String[] skillArray = skills.split(",");
            for (int i = 0; i < skillArray.length; i++)
                skillArray[i] = skillArray[i].trim();
            user.setSkills(skillArray);
        }

        // Social link — one of LinkedIn, GitHub, or Instagram
        if (socialUrl != null) {
            if (socialUrl.isBlank()) {
                user.setLinkedinUrl("");
                user.setGithubUrl("");
                user.setInstagramUrl("");
            } else {
                SocialUrlValidator.ValidatedSocial validated = SocialUrlValidator.validate(socialUrl);
                if (validated == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                }
                user.setLinkedinUrl("");
                user.setGithubUrl("");
                user.setInstagramUrl("");
                switch (validated.platform()) {
                    case LINKEDIN -> user.setLinkedinUrl(validated.url());
                    case GITHUB -> user.setGithubUrl(validated.url());
                    case INSTAGRAM -> user.setInstagramUrl(validated.url());
                }
            }
        } else {
            // Legacy fields — still validate when non-blank
            if (linkedinUrl != null) {
                if (linkedinUrl.isBlank()) user.setLinkedinUrl("");
                else {
                    SocialUrlValidator.ValidatedSocial v = SocialUrlValidator.validate(linkedinUrl);
                    if (v == null || v.platform() != SocialUrlValidator.Platform.LINKEDIN) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                    }
                    user.setLinkedinUrl(v.url());
                }
            }
            if (githubUrl != null) {
                if (githubUrl.isBlank()) user.setGithubUrl("");
                else {
                    SocialUrlValidator.ValidatedSocial v = SocialUrlValidator.validate(githubUrl);
                    if (v == null || v.platform() != SocialUrlValidator.Platform.GITHUB) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                    }
                    user.setGithubUrl(v.url());
                }
            }
        }
        if (portfolioUrl != null) user.setPortfolioUrl(portfolioUrl.trim());

        if (city != null && !city.isBlank()) {
            try {
                float[] coords = locationService.getLongitudeLatitude(city.trim());
                user.setLocation(city.trim());
                user.setLongitude((double) coords[0]);
                user.setLatitude((double) coords[1]);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        }

        boolean complete = user.getDisplayName() != null && !user.getDisplayName().isBlank()
                        && user.getIndustry() != null && !user.getIndustry().isBlank()
                        && user.getLatitude() != null
                        && user.getLongitude() != null;

        user.setProfileComplete(complete);
        userRepository.update(user);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("userId") int userId) {
        User user = userRepository.getById(userId);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(user);
    }
}