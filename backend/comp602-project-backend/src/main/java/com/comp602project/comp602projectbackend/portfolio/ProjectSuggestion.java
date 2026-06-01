package com.comp602project.comp602projectbackend.portfolio;

import java.util.List;

public class ProjectSuggestion {

    private String title;
    private String description;
    private List<String> skillsUsed;

    public ProjectSuggestion() {}

    public ProjectSuggestion(String title, String description, List<String> skillsUsed) {
        this.title = title;
        this.description = description;
        this.skillsUsed = skillsUsed;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSkillsUsed() { return skillsUsed; }
    public void setSkillsUsed(List<String> skillsUsed) { this.skillsUsed = skillsUsed; }
}
