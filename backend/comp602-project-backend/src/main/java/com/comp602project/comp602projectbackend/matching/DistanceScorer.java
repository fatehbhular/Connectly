package com.comp602project.comp602projectbackend.matching;

import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.matching.services.LocationService;

@Service
public class DistanceScorer implements IScorer {

    private final LocationService locationService;

    public DistanceScorer(LocationService locationService) {
        this.locationService = locationService;
    }

    //This method calculates the distance between two locations given their names by first getting their longitude and latitude using the LocationService and then applying the Haversine formula
    public float calculateDistance(String location1, String location2) throws Exception {
        float[] location1LonLat = locationService.getLongitudeLatitude(location1);
        float[] location2LonLat = locationService.getLongitudeLatitude(location2);

        return calcDist(
                location1LonLat[1], location1LonLat[0],
                location2LonLat[1], location2LonLat[0]);
    }

    //(Haversine formula implementation) This method calculates the distance in km between two points given their latitude and longitude
    public float calcDist(float lat1, float lon1, float lat2, float lon2) {

        final int R = 6371; // Earth radius in km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (float) (R * c);
    }

    @Override
    //This method converts the distance in km to a score between 0 and 100 using an exponential decay function
    public float score(ScoreContext context) {
        float distance;

        try {
            distance = calculateDistance(context.getUser1Location(), context.getUser2Location());
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate distance score", e);
        }

        float maxScore = 1f;

        float score = (float) (maxScore * Math.exp(-(Math.exp(distance / 12000)))*Math.exp(1));
        return score;
    }
}