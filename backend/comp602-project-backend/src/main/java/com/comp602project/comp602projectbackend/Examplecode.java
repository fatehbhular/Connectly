package com.comp602project.comp602projectbackend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class Examplecode {

    @GetMapping("/api/test")
    public String testConnection() {
        return "Backend is talking to React!";
    }
}