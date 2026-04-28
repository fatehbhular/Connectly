package com.comp602project.comp602projectbackend.Connections;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/connections")
public class ConnectionsController {

    @Autowired
    private UserRepository userRepository;  // Spring injects this automatically

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.getAll();     // calls getAll() from UserRepository
    }

}