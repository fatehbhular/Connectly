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
        SpringApplication.run(Comp602ProjectBackendApplication.class, args);       // This line starts the entire Spring context and reads application.properties
    }

    @Bean
    public CommandLineRunner runTest(MessagingService messagingService) {
        return args -> {

            User sender = new User();                                                           // Setup the dummy data for the message tests
            sender.setUserId(1);
            sender.setUsername("Fateh");

            User participant = new User();
            participant.setUserId(2);
            participant.setUsername("Leo");


            List<User> participants = Arrays.asList(participant);

            
            try {                                                                                // Send the message using the service directly
                messagingService.sendMessage(sender, participants, "Test after pulling from main.", Instant.now());
                System.out.println("Final message test before ending coding session.");
            } catch (Exception e) {
                System.err.println("Failed: " + e.getMessage());
            }
        };
    }
}