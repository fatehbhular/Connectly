package com.comp602project.comp602projectbackend.matching.servicies;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class SuperCategoryMapping {

    private final Map<String, String> superCategoryMapping;

    public SuperCategoryMapping() {
        superCategoryMapping = new HashMap<>();
        // Engineering & Technology
        putAll(superCategoryMapping, "Engineering & Technology",
        "Software Engineering", "Data Science", "Energy and Utilities");

        // Business & Management
        putAll(superCategoryMapping, "Business & Management",
        "Marketing", "Finance", "Sales", "Human Resources", "Project Management", "Consulting", "Real Estate");

        // Creative & Media
        putAll(superCategoryMapping, "Creative & Media", 
        "Design", "Arts and Entertainment", "Media and Communication");

        // Healthcare & Social Services
        putAll(superCategoryMapping, "Healthcare & Social Services",
        "Healthcare", "Nonprofit and Social Services", "Personal Services and Care");

        // Education & Research
        putAll(superCategoryMapping, "Education & Research",
        "Education", "Science and Research");

        // Operations & Logistics
        putAll(superCategoryMapping, "Operations & Logistics",
            "Operations", "Transportation and Logistics");

        // Public & Legal Services
        putAll(superCategoryMapping, "Public & Legal Services",
            "Legal", "Government and Public Service");

        // Primary & Industrial
        putAll(superCategoryMapping, "Primary & Industrial",
            "Manufacturing", "Agriculture");

        // Hospitality & Personal Services
        putAll(superCategoryMapping, "Hospitality & Services",
            "Hospitality and Tourism", "Customer Service","Sports and Recreation");
    }

    // Helper method to put multiple categories under the same super category
    private static void putAll(Map<String, String> map, String superCategory, String... categories) {
        for (String category : categories) {
            map.put(category, superCategory);
        }
    }

    // Method to get the super category for a given category
    public String getSuperCategory(String category) {
        if(superCategoryMapping.containsKey(category)) {
            return superCategoryMapping.get(category);
        }
        else{
            return "Other";
        }
    }
}
