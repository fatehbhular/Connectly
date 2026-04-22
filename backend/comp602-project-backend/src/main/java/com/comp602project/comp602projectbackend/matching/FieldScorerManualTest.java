package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.matching.services.CategoryMapping;

public class FieldScorerManualTest {
        public static void main(String[] args) {
        CategoryMapping mapper = new CategoryMapping();

        System.out.println(mapper.mapToCategory("Ux design"));
        System.out.println(mapper.mapToCategory("data analyst and AI engineer"));
        System.out.println(mapper.mapToCategory("civil construction worker"));
    }
}

