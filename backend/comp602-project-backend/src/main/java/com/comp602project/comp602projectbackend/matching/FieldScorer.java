package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.auth.User;
import com.comp602project.comp602projectbackend.matching.services.IndustryTaxonomy;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * FieldScorer scores two users based on how similar thier industry and skills are.
 * Industry carries 70% of the score, skills 30%.
 *
 * Industry scoring uses a taxonomy:
 *   - Same industry string gives 1.0
 *   - Same category gives 0.9 (SWE vs Computer Science)
 *   - Adjacent categories gives 0.4 (SWE vs UX Design)
 *   - Unknown gives 0.15
 *   - Unrelated gives 0.05
 */

@Service
public class FieldScorer implements IScorer {

    @Override
    public double score(User signedInUser, User otherUser) {
        double industryScore = scoreIndustry(signedInUser.getIndustry(), otherUser.getIndustry());
        double skillsScore   = scoreSkills(signedInUser.getSkills(), otherUser.getSkills());
        return (industryScore * 0.7) + (skillsScore * 0.3);
    }

    private double scoreIndustry(String a, String b) {
        if (a == null || b == null) return 0;
        a = a.toLowerCase().trim();
        b = b.toLowerCase().trim();

        if (a.equals(b)) return 1.0;

        String catA = getCategory(a);
        String catB = getCategory(b);

        if (catA == null || catB == null) return 0.05;                          // at least one unknown
        if (catA.equals(catB))            return 0.9;                           // same category
        if (IndustryTaxonomy.ADJACENT_CATEGORIES
                .getOrDefault(catA, Set.of()).contains(catB))    return 0.4;    // adjacent
        return 0.05;                                                            // unrelated
    }

    private String getCategory(String input) {
        
        String cat = IndustryTaxonomy.INDUSTRY_CATEGORY.get(input);             // exact key lookup first
        if (cat != null) return cat;

        for (var entry : IndustryTaxonomy.INDUSTRY_CATEGORY.entrySet()) {
            if (input.contains(entry.getKey()) || entry.getKey().contains(input)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private double scoreSkills(String[] a, String[] b) {                        // Use the Jaccard similarity to score: 
        if (a == null || b == null || a.length == 0 || b.length == 0) return 0;

        Set<String> setA = new HashSet<>();
        for (String s : a) setA.add(s.toLowerCase().trim());

        Set<String> setB = new HashSet<>();
        for (String s : b) setB.add(s.toLowerCase().trim());

        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        return (double) intersection.size() / union.size();
    }
}