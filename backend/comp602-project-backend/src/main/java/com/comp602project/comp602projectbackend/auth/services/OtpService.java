package com.comp602project.comp602projectbackend.auth.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.OtpToken;
import com.comp602project.comp602projectbackend.auth.OtpTokenJpaRepository;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;

import jakarta.transaction.Transactional;

@Service
public class OtpService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;

    @Value("${resend.api.key}")
    private String resendApiKey;

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
            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions params = CreateEmailOptions.builder()
                .from("Connectly <onboarding@yourdomain.com>") // replace with your verified Resend domain
                .to(email)
                .subject("Your Connectly Login Code")
                .html("""
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #F0EDE6; border-radius: 16px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 4px;">Connectly</h1>
                        <p style="color: #B0A99F; font-size: 13px; margin-top: 0;">Account Security</p>
                        <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 24px 0;">
                        <div style="text-align: center; margin: 32px 0;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #ffffff; background: #E8845A; padding: 16px 32px; border-radius: 12px;">%s</span>
                        </div>
                        <p style="color: #B0A99F; font-size: 13px; text-align: center;">
                            This code expires in <strong>10 minutes</strong>.
                        </p>
                    </div>
                """.formatted(code))
                .build();

            resend.emails().send(params);

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