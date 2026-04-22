package com.comp602project.comp602projectbackend.matching.services;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;

@Service
public class NominatimService {

    public String search(String q) throws Exception {
            // Convert the query to URL-encoded format
            String query = URLEncoder.encode(q, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";

            //Create a request to Nominatim
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Connectly")
                    .GET()
                    .build();

            // Send the request and get the response
            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
    }


}
