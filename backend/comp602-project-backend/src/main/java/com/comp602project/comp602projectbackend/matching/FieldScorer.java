package com.comp602project.comp602projectbackend.matching;

import org.springframework.stereotype.Service;
import com.comp602project.comp602projectbackend.matching.services.GroqAPI;

@Service
public class FieldScorer implements IScorer {

    private final GroqAPI groqAPI;

    public FieldScorer(GroqAPI groqAPI) {
        this.groqAPI = groqAPI;
    }

    //This method gets 2 different users industry field and returns a score, from prompting GroqAPI
    @Override
    public float score(ScoreContext context) {
        try {
            String industry1 = context.getUser1Industry();
            String industry2 = context.getUser2Industry();

            //Categorise each industry
            String category1 = categoriseIndustry(industry1);
            String category2 = categoriseIndustry(industry2);

            //Compare the two categories and get a score
            float score = compareCategories(category1, category2);

            return score;

        } 
        catch (Exception e) {
            e.printStackTrace();
            return 0.0f;
        }
    }

    //This method creates a prompt for GroqApi to return a category
    private String categoriseIndustry(String industry) throws Exception {
        String prompt = """
                Categorise the following industry into a broad industry category.
                Return only the category name, nothing else. No explanation.
                
                Industry: %s
                """.formatted(industry);

        return groqAPI.generateContent(prompt).trim();
    }

    //This methods compares the category produced by the categoriseIndustry function to return a score
    private float compareCategories(String category1, String category2) throws Exception {
        String prompt = """
                Compare these two industry categories and return a similarity score from 0 to 100.
                0 means completely unrelated, 100 means identical or extremely related.
                Return only the number, nothing else. No explanation.
                
                Category 1: %s
                Category 2: %s
                """.formatted(category1, category2);

        String result = groqAPI.generateContent(prompt).trim();

        return Float.parseFloat(result);
    }
}