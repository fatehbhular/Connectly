package com.comp602project.comp602projectbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/*
NOTE TO WINDOWS: ".\gradlew.bat bootRun" ALWAYS RUNS THIS FILE
NOTE TO MAC: "./gradlew bootRun" ALWAYS RUNS THIS FILE

Spring Boot looks for the annotation "@SpringBootApplication" to know where to start
*/

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class Comp602ProjectBackendApplication {

    public static void main(String[] args) {
        // This line starts the entire Spring context and reads application.properties
        SpringApplication.run(Comp602ProjectBackendApplication.class, args);       
    }
}