package com.comp602project.comp602projectbackend.matching;

import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.matching.services.LocationService;
import com.comp602project.comp602projectbackend.matching.services.NominatimService;

@Service
public class DistanceScorer implements IScorer {

    private final LocationService locationService = new LocationService(new NominatimService());

    public DistanceScorer() {}

    public float[] getUserLongitudeLatitude(String location) throws Exception {
        float[] LonLat = locationService.getLongitudeLatitude(location);

        return LonLat; 
    }


    //(Haversine formula implementation) This method calculates the distance in km between two points given their latitude and longitude
    public double calculateDistance(User user1, User user2) {

        if (user1.getLatitude() == null || user1.getLongitude() == null ||
            user2.getLatitude() == null || user2.getLongitude() == null) {
            return Double.MAX_VALUE;                                            // treat unknown location as infinitely far away
        }

        final int R = 6371; // Earth radius in km

        double dLat = Math.toRadians(user2.getLatitude() - user1.getLatitude());
        double dLon = Math.toRadians(user2.getLongitude() - user1.getLongitude());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(user1.getLatitude()))
                * Math.cos(Math.toRadians(user2.getLatitude()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (float) (R * c);
    }

    @Override
    //This method converts the distance in km to a score between 0 and 100 using an exponential decay function
    public double score(User signedinUser, User otherUser) {
        double distance;

        try {
            distance = calculateDistance(signedinUser, otherUser);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate distance score", e);
        }

        float maxScore = 1f;

        float score = (float) (maxScore * Math.exp(-(Math.exp(distance / 12000)))*Math.exp(1));
        return score;
    }
}