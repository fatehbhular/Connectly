package com.comp602project.comp602projectbackend.auth.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.OtpToken;
import com.comp602project.comp602projectbackend.auth.OtpTokenJpaRepository;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;

import jakarta.transaction.Transactional;

@Service
public class OtpService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;

    @Value("${sendgrid.api.key}")
    private String sendgridApiKey;

    private final OtpTokenJpaRepository otpTokenJpaRepository;

    public OtpService(OtpTokenJpaRepository otpTokenRepository) {
        this.otpTokenJpaRepository = otpTokenRepository;
    }

    public String generateCode() {
        Random rand = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            int randomNum = rand.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(randomNum));
        }
        return code.toString();
    }

    @Async
    @Transactional
    public void sendOtp(String email) {
        otpTokenJpaRepository.deleteByEmail(email);

        String code = generateCode();

        OtpToken otpToken = new OtpToken();
        otpToken.setEmail(email);
        otpToken.setCode(code);
        otpToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpTokenJpaRepository.save(otpToken);

        try {
            String body = "{\"personalizations\":[{\"to\":[{\"email\":\"" + email + "\"}]}],"
                + "\"from\":{\"email\":\"connectlyapp.noreply@gmail.com\"},"
                + "\"subject\":\"Your Connectly Login Code\","
                + "\"content\":[{\"type\":\"text/plain\",\"value\":\"Your Connectly login code is: " + code + ". It expires in 10 minutes.\"}]}";

            SendGrid sg = new SendGrid(sendgridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(body);
            sg.api(request);

        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
    }

    @Transactional
    public boolean verifyOtp(String email, String code) {
        Optional<OtpToken> token = otpTokenJpaRepository.findByEmailAndCode(email, code);

        if (token.isEmpty()) return false;

        if (token.get().expiresAt().isBefore(LocalDateTime.now())) {
            otpTokenJpaRepository.deleteByEmail(email);
            return false;
        }

        otpTokenJpaRepository.deleteByEmail(email);
        return true;
    }

    public boolean isExpired(String email) {
        Optional<OtpToken> token = otpTokenJpaRepository.findByEmail(email);
        if (token.isEmpty()) return true;
        return token.get().expiresAt().isBefore(LocalDateTime.now());
    }
}