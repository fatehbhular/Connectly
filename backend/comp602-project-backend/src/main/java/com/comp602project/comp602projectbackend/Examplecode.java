package com.comp602project.comp602projectbackend;

/**
 * SPRING CORE ANNOTATIONS (used to classify the class by its role in the application)
 *
 * @SpringBootApplication = starts the Spring Boot application (main entry point)
 * @Component = general class Spring manages (no specific role)
 * @Controller = handles browser/web page requests (returns HTML pages)
 * @RestController = handles API requests (returns data like JSON)
 * @Service = contains business logic (main rules and processing)
 * @Repository = handles database work (saving, reading, deleting data)
 */

/**
 * DEPENDENCY INJECTION ANNOTATIONS
 *
 * @Autowired = tells Spring to inject a dependency automatically
 * Constructor injection = preferred way (no annotation need    ed in most cases)
 */

/**
 * REQUEST MAPPING ANNOTATIONS (connecting URLs to methods)
 *
 * @RequestMapping = general URL mapping (can handle all HTTP methods)
 * @GetMapping = get/read data
 * @PostMapping = create data
 * @PutMapping = update full data
 * @PatchMapping = update partial data
 * @DeleteMapping = delete data
 */

/**
 * DATABASE / JPA ANNOTATIONS
 *
 * @Entity = marks a class as a database table
 * @Id = primary key of a table
 * @GeneratedValue = automatically generates ID values
 * @Column = maps a field to a database column
 */


import org.springframework.web.bind.annotation.CrossOrigin;                 // Lets React talk to this backend
import org.springframework.web.bind.annotation.GetMapping;                  // Lets you connect a URL to a method
import org.springframework.web.bind.annotation.RestController;              // "this class is part of a web backend that sends data back"

@RestController                                                             // Tells Spring "this class handles HTTP requests from React" (like visiting a URL)
                                                                            // “This class is a web controller that handles HTTP requests and returns data.”
                                                                            // It labels the class as part of the web layer; something that responds to urls

@CrossOrigin(origins = "http://localhost:5173")                             // Lets React app run on localhost:5173 and still access this backend

public class Examplecode {

    @GetMapping("/api/test")                                                // When someone visits /api/test, run the method below
    public String testConnection() {                                        // This method runs when /api/test is visited
        return "Backend is talking to React!";                              // This is the message sent back to the browser/React
    }
}