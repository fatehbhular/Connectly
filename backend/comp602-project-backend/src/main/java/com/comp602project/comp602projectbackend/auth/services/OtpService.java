package com.comp602project.comp602projectbackend.auth.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;


//Interface is the primary tool for sending emails, allow html
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.comp602project.comp602projectbackend.auth.OtpToken;
import com.comp602project.comp602projectbackend.auth.OtpTokenJpaRepository;

import jakarta.transaction.Transactional;


@Service
public class OtpService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;

    private final OtpTokenJpaRepository otpTokenJpaRepository;
    private final JavaMailSender mailSender;

    public OtpService(OtpTokenJpaRepository otpTokenRepository, JavaMailSender mailSender) {
        this.otpTokenJpaRepository = otpTokenRepository;
        this.mailSender = mailSender;
    }

    //This method generates the 6 character code (includes Characters and numbers)
    public String generateCode(){
        Random rand = new Random();
        StringBuilder code = new StringBuilder();


        for(int i = 0; i < CODE_LENGTH; i++){ //For loop to generate 6 random characters
            int randomNum = rand.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(randomNum));
        }

        return code.toString();
    }
    
    //Saves the code to the Otp_Token table and sends one time pad code to the email set
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


        //This is the email content that is sent 
        try {                                    
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Your Connectly Login Code");
            helper.setText("""
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
                    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 24px 0;">
                    <p style="color: #B0A99F; font-size: 12px; text-align: center;">
                        If you did not request this code, you can safely ignore this email.
                    </p>
                </div>
            """.formatted(code), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
    }

    //This method verfies the code by: 
    //First checking the database to see if the email address exist and code
    //Than check if the current time is after the expire time
    //Lastly deletes the selected email row to remove the token
    @Transactional
    public boolean verifyOtp(String email, String code) {
        Optional<OtpToken> token = otpTokenJpaRepository.findByEmailAndCode(email, code);

        if (token.isEmpty()) {
            return false;
        }
        if (token.get().expiresAt().isBefore(LocalDateTime.now())) {
            otpTokenJpaRepository.deleteByEmail(email);
            return false;
        }

        otpTokenJpaRepository.deleteByEmail(email);
        return true;
    }

    public boolean isExpired(String email) {
        Optional<OtpToken> token = otpTokenJpaRepository.findByEmail(email);
        if (token.isEmpty()) return true; // no token = treat as expired
        return token.get().expiresAt().isBefore(LocalDateTime.now());
    }
}
