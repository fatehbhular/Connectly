package com.comp602project.comp602projectbackend;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.messaging.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class Comp602ProjectBackendApplication {

    public static void main(String[] args) {
        // This line starts the entire Spring context and reads application.properties
        SpringApplication.run(Comp602ProjectBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner runTest(MessagingService messagingService) {
        return args -> {
            // Setup dummy data
            User sender = new User("Fateh");
            sender.setUserId("123");
            User participant = new User("Leo");
            participant.setUserId("456");
            List<User> participants = Arrays.asList(participant);

            // Send the message using the service directly
            try {
                messagingService.sendMessage(sender, participants, "Test after pulling from main.", Instant.now());
                System.out.println("Final message test before ending coding session.");
            } catch (Exception e) {
                System.err.println("Failed: " + e.getMessage());
            }
        };
    }
}