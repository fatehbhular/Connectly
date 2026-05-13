package com.comp602project.comp602projectbackend.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/*
    Maps the opt_tokens table in Supabase, 
    Temporary store a 6 digit code sent to a specific email address,
    The code is deleted after a certain period of time
    OtpRepository read and writes on this
*/

@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "Id")
    private Long id;

    @Column(name = "Email", nullable = false)
    private String email;

    @Column(name = "Code", nullable = false)
    private String code; //6 digit code

    @Column(name = "Expires_At", nullable = false)
    private LocalDateTime expiresAt; //Stores date when the code expires e.g in 5 minutes from creation


    //Set and Get methods of the required fields
    public Long getId() {return this.id;}
    public String getEmail(){return this.email;}
    public void setEmail( String email){this.email = email;}
    public String code(){return this.code;}
    public void setCode( String code){this.code = code;}
    public LocalDateTime expiresAt(){return this.expiresAt;}
    public void setExpiresAt( LocalDateTime expiresAt){this.expiresAt = expiresAt;}


}
