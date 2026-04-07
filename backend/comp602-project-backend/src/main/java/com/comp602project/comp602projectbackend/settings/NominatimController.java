package com.comp602project.comp602projectbackend.settings;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comp602project.comp602projectbackend.matching.DistanceScorer;

@RestController
public class NominatimController {

    private final HttpClient client;

    public NominatimController() {
        client = HttpClient.newHttpClient();
    }


    @GetMapping("/nominatim/search")
    public String search(String q) throws Exception {
    
        //Converts the characters to URL safe versions
        String query = URLEncoder.encode(q, StandardCharsets.UTF_8);
        //Set the url query, the format and the limit
        String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";

        //Call Nominatim
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Connectly (yzshawnlee@gmail.com)")
                .GET()
                .build(); //What the request is

        // 3. Return the response
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    //Testing purposes
    @GetMapping("/test-distance")
    public String testDistance() throws Exception {
        DistanceScorer scorer = new DistanceScorer(new NominatimController());
        float[] coords = scorer.getLangitude_Logitude("Auckland");
        return "Lat: " + coords[0] + " Lon: " + coords[1];
    }
}
