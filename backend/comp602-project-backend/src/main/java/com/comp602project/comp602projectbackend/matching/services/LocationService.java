package com.comp602project.comp602projectbackend.matching.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class LocationService {

    private final NominatimService service;

    public LocationService(NominatimService service) {
        this.service = service;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LocationResponse {
        public String lat;
        public String lon;
    }

    //Gets the output from the NominatimService and than return longitude and lattidue
    public float[] getLongitudeLatitude(String location) throws Exception {
        String output = service.search(location);

        ObjectMapper mapper = new ObjectMapper();
        List<LocationResponse> list = mapper.readValue(output, new TypeReference<List<LocationResponse>>() {});

        if (list.isEmpty()) {
            throw new Exception("No location found for: " + location);
        }

        float latitude = Float.parseFloat(list.get(0).lat);
        float longitude = Float.parseFloat(list.get(0).lon);

        return new float[] { longitude, latitude };
    }
}