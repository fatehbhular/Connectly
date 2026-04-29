package com.comp602project.comp602projectbackend.matching;

import com.comp602project.comp602projectbackend.auth.User;

public interface IScorer {

    public double score(User signedinUser, User otherUser);
}
