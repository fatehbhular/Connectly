package com.comp602project.comp602projectbackend.matching;

import java.util.List;

import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.User;

@Service
public class MutualScorer implements IScorer {

    // MUTUAL IS A BOOLEAN; 1 IS MUTUAL, 0 IS NOT MUTUAL
    public double score(User signedinUser, User otherUser) {

        int otherUserId = otherUser.getUserId();

        for (User connection : signedinUser.getConnections()) {
            
            List<Integer> mutualsID = connection.getConnectionKeys();
            
            for (Integer mutualID : mutualsID) {
                if (mutualID.intValue() == otherUserId) { return 1.00;}
            }
        }

        return 0;
    }
}

