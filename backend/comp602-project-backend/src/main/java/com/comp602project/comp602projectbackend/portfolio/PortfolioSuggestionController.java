package com.comp602project.comp602projectbackend.portfolio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioSuggestionController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioSuggestionService suggestionService;

    @GetMapping("/suggestions")
    public ResponseEntity<PortfolioSuggestionsResponse> getSuggestions(@RequestHeader("userId") int userId) {
        User user = userRepository.getById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(suggestionService.suggest(user));
    }
}
