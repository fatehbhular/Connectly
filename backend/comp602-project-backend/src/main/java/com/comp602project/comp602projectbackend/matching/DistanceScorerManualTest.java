package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.matching.services.LocationService;
import com.comp602project.comp602projectbackend.matching.services.NominatimService;


public class DistanceScorerManualTest {

    public static void main(String[] args) {
        try {
            LocationService locationService = new LocationService(new NominatimService());
            DistanceScorer distanceScorer = new DistanceScorer(locationService);
            String location = args.length > 0 ? args[0] : "Auckland";

            float[] lonLat = locationService.getLongitudeLatitude(location);

            System.out.println("API result for " + location + ":");
            System.out.println("Longitude = " + lonLat[0]);
            System.out.println("Latitude = " + lonLat[1]);

            if (args.length > 1) {
                String secondLocation = args[1];
                float distance = distanceScorer.calculateDistance(location, secondLocation);
                System.out.println("Distance between " + location + " and " + secondLocation + " = " + distance + " km");

                ScoreContext context = new ScoreContext();
                context.setUser1Location(location);
                context.setUser2Location(secondLocation);

                float score = distanceScorer.score(context);
                System.out.println("Distance score between " + location + " and " + secondLocation + " = " + score);
    
            }
        } 
        catch (Exception e) {
            System.err.println("Manual API test failed:");
            e.printStackTrace();
            System.exit(1);
        }
    }
}