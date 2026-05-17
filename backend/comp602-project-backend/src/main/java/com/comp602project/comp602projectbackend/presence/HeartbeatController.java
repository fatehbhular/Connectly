package com.comp602project.comp602projectbackend.presence;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/presence")
public class HeartbeatController {
    private final PresenceService presenceService;

    public HeartbeatController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    /**
     * Receives a heartbeat ping and updates the user's last_seen timestamp.
     * 
     * @param userId -> ID of the user sending the ping.
     * @return 200 OK
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(@RequestParam int userId) {
        presenceService.recordHeartbeat(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Returns if the selected user is currently online.
     * 
     * @param userId -> ID of the user who is being checked.
     * @return boolean if the user is online or not.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Boolean> isOnline(@PathVariable int userId) {
        return ResponseEntity.ok(presenceService.isOnline(userId));
    }
}
