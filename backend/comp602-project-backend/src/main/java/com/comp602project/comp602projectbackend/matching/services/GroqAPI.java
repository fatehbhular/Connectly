package com.comp602project.comp602projectbackend.matching.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GroqAPI {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    // The AI model to use for generating responses
    private final String model = "llama-3.3-70b-versatile";

    // The Groq API endpoint URL that we send requests to
    private final String groqUrl = "https://api.groq.com/openai/v1/chat/completions";

    public GroqAPI(@Value("${groq.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    //This function sends a prompt to Groq and returns the AI's response as a plain String
    public String generateContent(String prompt) throws Exception {


        // Groq expects messages in the format: { "role": "user", "content": "your prompt" }
        java.util.Map<String, Object> message = new java.util.HashMap<>();
        message.put("role", "user");  
        message.put("content", prompt);   

        // Wraps the message in the full request format Groq expects
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("model", model);       
        body.put("messages", java.util.List.of(message)); 

        //Convert the Java Map to a JSON string safely
        String jsonBody = objectMapper.writeValueAsString(body);

        //Send a POST request
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(groqUrl))                       
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody)) 
            .header("Content-Type", "application/json")  
            .header("Authorization", "Bearer " + apiKey)   
            .build();

        // Step 5: Send the request and get the response
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        // Groq returns a large JSON object, we navigate through it to get just the text
        //Retunrn the final content text from the response, trimming any extra whitespace
        JsonNode json = objectMapper.readTree(response.body());
        return json.get("choices")  
                   .get(0)        
                   .get("message") 
                   .get("content")
                   .asText()   
                   .trim();  
    }
}