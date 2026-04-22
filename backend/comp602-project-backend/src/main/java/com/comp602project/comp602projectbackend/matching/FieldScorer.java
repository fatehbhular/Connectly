package com.comp602project.comp602projectbackend.matching;

import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.matching.servicies.SuperCategoryMapping;

@Service
public class FieldScorer implements IScorer {

    private final SuperCategoryMapping superCategoryMapping;

    public FieldScorer(SuperCategoryMapping superCategoryMapping) {
        this.superCategoryMapping = superCategoryMapping;
    }

    // This method scores the compatibility of two users based on their categories
    @Override
    public float score(ScoreContext context) {

        // Get the super categories for both users
        String user1Super = superCategoryMapping.getSuperCategory(context.user1Category);
        String user2Super = superCategoryMapping.getSuperCategory(context.user2Category);

        //Checks if the categories are the same as the second user, (highest score)
        if (context.user1Category.equals(context.user2Category)) return 10f;

        //Checks if the super categories are the same as the second user (medium score)
        if (user1Super.equals(user2Super)) return 7f;

        //Not related in category or super category (lowest score)
        return 2f;
    }
}
