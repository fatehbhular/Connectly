package com.comp602project.comp602projectbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

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
    }
}