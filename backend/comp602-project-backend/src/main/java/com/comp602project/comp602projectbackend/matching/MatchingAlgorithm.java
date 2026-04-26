package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.auth.UserRepository;

public class MatchingAlgorithm {
        private final DistanceScorer distanceScorer;
        private final FieldScorer fieldScorer;
        private final UserRepository userRepository;
    
        public MatchingAlgorithm(DistanceScorer distanceScorer, FieldScorer fieldScorer, UserRepository userRepository) {
            this.distanceScorer = distanceScorer;
            this.fieldScorer = fieldScorer;
            this.userRepository = userRepository;
        }

        //This method calculates the overall score across all the different score types
        public float calculateMatchScore(ScoreContext context) throws Exception {
            float distanceScore = distanceScorer.calculateDistance(context.getUser1Location(), context.getUser2Location());
            float fieldScore = fieldScorer.score(context);
            
            // Combine the scores with weights (you can adjust these weights as needed)
            return 0.4f * distanceScore + 0.6f * fieldScore;
        }
}
