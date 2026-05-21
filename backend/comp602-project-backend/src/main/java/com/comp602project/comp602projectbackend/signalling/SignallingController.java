package com.comp602project.comp602projectbackend.signalling;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignallingController {
    
    private final SimpMessagingTemplate messagingTemplate;

    public SignallingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void handleSignal(SignalMessage message) {
        messagingTemplate.convertAndSend(
            "/topic/signal/" + message.getReceiverId(), message
        );
    }
}