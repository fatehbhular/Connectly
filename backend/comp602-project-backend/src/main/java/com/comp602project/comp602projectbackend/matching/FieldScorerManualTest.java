package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.matching.services.GroqAPI;

public class FieldScorerManualTest {
    public static void main(String[] args) throws Exception {
        // Load from env variable instead of hardcoding
        String apiKey = System.getenv("GROQ_API_KEY");
        
        GroqAPI api = new GroqAPI(apiKey);
        FieldScorer scorer = new FieldScorer(api);

        ScoreContext c1 = new ScoreContext();
        c1.setUser1Industry("Project Managers");
        c1.setUser2Industry("Data Scientist");
        System.out.println("Similar: " + scorer.score(c1));
    }
}