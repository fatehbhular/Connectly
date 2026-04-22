/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.comp602project.comp602projectbackend.matching.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class CategoryMapping {

    private final Map<String, List<String>> categoryKeywords;

    public CategoryMapping() {
        categoryKeywords = new HashMap<>();
        //Software Engineeing
        putAll(categoryKeywords, "Software Engineering", "Software", "Developer", "Development");
        //Data Science
        putAll(categoryKeywords, "Data Science", "Data", "Scientist", "Analytics", "Analyst");
        //Design
        putAll(categoryKeywords, "Design", "Designer", "UX", "UI", "Graphic", "Visual");
        //Marketing
        putAll(categoryKeywords, "Marketing", "Marketer", "SEO", "Content", "Social Media");
        //Finance
        putAll(categoryKeywords, "Finance", "Financial", "Accountant", "Accounting", "Investment", "Banking");
        //Healthcare
        putAll(categoryKeywords, "Healthcare", "Health", "Medical", "Doctor", "Nurse", "Therapist");
        //Education
        putAll(categoryKeywords, "Education", "Teacher", "Professor", "Educator", "Tutor");
        //Sales
        putAll(categoryKeywords, "Sales", "Salesperson", "Salesman", "Sales Representative", "Account Executive");
        //Customer Service
        putAll(categoryKeywords, "Customer Service", "Customer Support", "Support", "Service", "Help Desk");
        //Human Resources
        putAll(categoryKeywords, "Human Resources", "HR", "Recruiter", "Talent Acquisition", "Human Resource Management");
        //Operations
        putAll(categoryKeywords, "Operations", "Operator", "Operations Manager", "Logistics", "Supply Chain");
        //Legal
        putAll(categoryKeywords, "Legal", "Lawyer", "Attorney", "Legal Counsel", "Paralegal");
        //Project Management
        putAll(categoryKeywords, "Project Management", "Project Manager", "PM", "Program Manager", "Project Coordinator");
        //Consulting
        putAll(categoryKeywords, "Consulting", "Consultant", "Advisor", "Strategy Consultant", "Management Consultant");
        //Arts and Entertainment
        putAll(categoryKeywords, "Arts and Entertainment", "Artist", "Musician", "Actor", "Entertainer", "Performer");
        //Science and Research
        putAll(categoryKeywords, "Science and Research", "Scientist", "Researcher", "Research Assistant", "Lab Technician");
        //Manufacturing
        putAll(categoryKeywords, "Manufacturing", "Manufacturing Engineer", "Production Manager", "Factory Worker", "Assembly Line Worker");
        //Transportation and Logistics
        putAll(categoryKeywords, "Transportation and Logistics", "Driver", "Logistics Coordinator", "Transportation Manager", "Warehouse Worker");
        //Agriculture
        putAll(categoryKeywords, "Agriculture", "Farmer", "Agricultural Worker", "Agronomist", "Farm Manager");
        //Energy and Utilities
        putAll(categoryKeywords, "Energy and Utilities", "Energy Engineer", "Utility Worker", "Renewable Energy Specialist", "Power Plant Operator");
        //Government and Public Service
        putAll(categoryKeywords, "Government and Public Service", "Government Worker", "Public Servant", "Policy Analyst", "Civil Servant");
        //Nonprofit and Social Services
        putAll(categoryKeywords, "Nonprofit and Social Services", "Nonprofit Worker", "Social Worker", "Charity Worker", "Community Organizer");
        //Real Estate
        putAll(categoryKeywords, "Real Estate", "Real Estate Agent", "Realtor", "Property Manager", "Real Estate Broker");
        //Media and Communication
        putAll(categoryKeywords, "Media and Communication", "Journalist", "Reporter", "Communications Specialist", "Public Relations", "PR");
        //Sports and Recreation
        putAll(categoryKeywords, "Sports and Recreation", "Athlete", "Coach", "Sports Manager", "Recreation Worker");
        //Hospitality and Tourism
        putAll(categoryKeywords, "Hospitality and Tourism", "Hotel Worker", "Tour Guide", "Event Planner", "Restaurant Worker");
        //Personal Services and Care
        putAll(categoryKeywords, "Personal Services and Care", "Personal Care Aide", "Childcare Worker", "Elderly Caregiver", "Personal Trainer");
    }

    //Helper method to add keywords to the category mapping
    private static void putAll(Map<String, List<String>> map, String category, String... keywords) {
    
        List<String> categoryList = map.computeIfAbsent(category, ignored -> new ArrayList<>());

        //Add all keywords to the category list in lowercase for case-insensitive matching
        for (String keyword : keywords) {
            categoryList.add(keyword.toLowerCase());
        }
    }

    //This method counts how many keywords from the list are present in the input string
    private int countMatches(String input, List<String> keywords) {
        int matches = 0;

        //Check if each keyword is present in the input string (case-insensitive)
        for (String keyword : keywords) {
            if (input.contains(keyword)) {
                matches++;
            }
        }

        return matches;
    }

    //This method takes an input string and returns the category that has the most keyword matches with the input string. If no keywords match, it returns "Other"
    public String mapToCategory(String input) {
        input = input.toLowerCase();

        String bestCategory = "Other";
        int bestMatchCount = 0;

        //Iterate through each category and its associated keywords, count the matches, and keep track of the category with the most matches    
        for (Map.Entry<String, List<String>> entry : categoryKeywords.entrySet()) {
            int matchCount = countMatches(input, entry.getValue());

            //If this category has more matches than the best one found so far, update the best category and match count
            if (matchCount > bestMatchCount) {
                bestMatchCount = matchCount;
                bestCategory = entry.getKey();
            }
        }

        return bestCategory;
    }

}
