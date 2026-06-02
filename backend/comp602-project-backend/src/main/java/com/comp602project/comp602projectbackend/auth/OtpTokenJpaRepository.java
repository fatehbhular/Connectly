package com.comp602project.comp602projectbackend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

import java.util.Optional;

/**
    This is the ONLY class that talks to the otp_tokens table
    Spring Boot automatically implements all the database operations for us
 */


@Repository
public interface OtpTokenJpaRepository extends JpaRepository<OtpToken, Long>{


    //Find row where Both email and code matches, used to verfiy the code user typed
    Optional<OtpToken> findByEmailAndCode(String email, String code);

    //Delete the code row depending on the email, used before sending a new code and cleaning up
    @Transactional
    void deleteByEmail(String email);

    //Find row where email matches, used to check if code is expired or not
    Optional<OtpToken> findByEmail(String email);

}
