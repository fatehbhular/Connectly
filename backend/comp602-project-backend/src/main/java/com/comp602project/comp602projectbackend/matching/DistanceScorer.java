package com.comp602project.comp602projectbackend.matching;

import org.json.JSONArray;
import org.springframework.stereotype.Service;
import com.comp602project.comp602projectbackend.settings.NominatimController;

@Service
public class DistanceScorer {

    private float maxDIstKm;
    private NominatimController controller;

    public DistanceScorer(NominatimController controller){
        this.controller = controller;
        maxDIstKm = 0;
    }

    public float score(float ul, float u2){
    
        return 2.00f;
    }


    public float[] getLangitude_Logitude(String location) throws Exception{
        String jsonOutput = controller.search(location);

        JSONArray array = new JSONArray(jsonOutput);
        
        float Longitude = array.getJSONObject(0).getFloat("lon");
        float Latitude = array.getJSONObject(0).getFloat("lat");

        float lon_lat[] = {Longitude, Latitude};
        System.out.println("Lat: " + Latitude + " Lon: " + Longitude);
        return lon_lat;
    }


    public float calcDist(float user1,float user2){

        return 2.00f;
    }
}
