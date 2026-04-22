package com.comp602project.comp602projectbackend.matching.servicies;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NominatimController {

    private final NominatimService service;

    public NominatimController(NominatimService service) {
        this.service = service;
    }

    @GetMapping("/nominatim/search")
    public String search(@RequestParam String q) throws Exception {
        return service.search(q);
    }
}