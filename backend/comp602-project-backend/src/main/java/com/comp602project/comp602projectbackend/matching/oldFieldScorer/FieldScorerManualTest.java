package com.comp602project.comp602projectbackend.matching.oldFieldScorer;

import com.comp602project.comp602projectbackend.matching.oldFieldScorer.CategoryMapping;

public class FieldScorerManualTest {
        public static void main(String[] args) {
        CategoryMapping mapper = new CategoryMapping();

        System.out.println(mapper.mapToCategory("Ux design"));
        System.out.println(mapper.mapToCategory("data analyst and AI engineer"));
        System.out.println(mapper.mapToCategory("civil construction worker"));
    }
}

