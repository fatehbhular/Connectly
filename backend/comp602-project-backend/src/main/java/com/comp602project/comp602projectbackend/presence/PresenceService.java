package com.comp602project.comp602projectbackend.presence;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {
    private final PresenceRepository presenceRepository;

    public PresenceService(PresenceRepository presenceRepository) {
        this.presenceRepository = presenceRepository;
    }

    /**
     * Records a heartbeat for the selected user.
     * 
     * @param userId -> ID of the active user.
     */
    public void recordHeartbeat(int userId) {
        presenceRepository.upsertPresence(userId);
    }

    /**
     * Runs every 30 seconds and marks any user offline if their
     * last hearbeat was more than 90 seconds ago.
     * 
     * @Scheduled -> Runs method every <fixedDelay> inputted.
     */
    @Scheduled(fixedDelay = 30000)
    public void cleanUpAbsentUsers() {
        presenceRepository.markAbsentUsersOffline();
    }

    /**
     * Checks if the selected user is currently online.
     * 
     * @param userId -> ID of the user who is being checked.
     * @return boolean if the user is online or not.
     */
    public boolean isOnline(int userId) {
        return presenceRepository.isOnline(userId);
    }
}
