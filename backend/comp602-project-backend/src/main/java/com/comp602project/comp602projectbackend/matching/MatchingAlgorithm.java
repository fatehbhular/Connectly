package com.comp602project.comp602projectbackend.matching;

public class MatchingAlgorithm {
        private final DistanceScorer distanceScorer;
        private final FieldScorer fieldScorer;
    
        public MatchingAlgorithm(DistanceScorer distanceScorer, FieldScorer fieldScorer) {
            this.distanceScorer = distanceScorer;
            this.fieldScorer = fieldScorer;
        }
    
        //This method calculates the overall score across all the different score types
        public float calculateMatchScore(ScoreContext context) throws Exception {
            float distanceScore = distanceScorer.calculateDistance(context.getUser1Location(), context.getUser2Location());
            float fieldScore = fieldScorer.score(context);
            
            // Combine the scores with weights (you can adjust these weights as needed)
            return 0.4f * distanceScore + 0.6f * fieldScore;
        }
}
