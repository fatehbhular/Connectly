package com.comp602project.comp602projectbackend;

import java.util.ArrayList;
import java.util.List;
import java.time.Instant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.comp602project.comp602projectbackend.messaging.MessagingService;
import com.comp602project.comp602projectbackend.messaging.MessagingRepository;
import com.comp602project.comp602projectbackend.messaging.Message;
import com.comp602project.comp602projectbackend.messaging.MessageSender;
import com.comp602project.comp602projectbackend.messaging.MessageValidator;
import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.auth.UserRepository;

/*
NOTE TO WINDOWS: ".\gradlew.bat bootRun" ALWAYS RUNS THIS FILE
NOTE TO MAC: "./gradlew bootRun" ALWAYS RUNS THIS FILE

Spring Boot looks for the annotation "@SpringBootApplication" to know where to start
*/

@SpringBootApplication
public class Comp602ProjectBackendApplication {

    public static void main(String[] args) {

        ConfigurableApplicationContext context = SpringApplication.run(
            Comp602ProjectBackendApplication.class, args
        );

        // Get all beans from Spring — never use new for @Component/@Service/@Repository classes
        UserRepository up = context.getBean(UserRepository.class);
        MessagingRepository repo = context.getBean(MessagingRepository.class);
        MessagingService messagingService = context.getBean(MessagingService.class);

        User user = up.getById(10);
        User user2 = up.getById(11);
        List<User> participants = new ArrayList<>();
        participants.add(user2);
        Instant timeNow = Instant.now();

        MessageValidator messageValidator = new MessageValidator();
        MessageSender messageSender = new MessageSender(messagingService, user, participants, timeNow);
        messageSender.send("this is a test");

        List<Message> messageRetrieval = repo.getMessageByConversationKey("10_11");
        System.out.println("Messages retrieved: " + messageRetrieval.size());
        for (Message m : messageRetrieval) {
            System.out.println(m);
        }
    }
}