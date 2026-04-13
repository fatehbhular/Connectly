package com.comp602project.comp602projectbackend.auth;

/*
React                           Spring Boot
────────────────────────────────────────────────────────────────
fetch("/api/users/login")  ->   @RestController (AuthController)
                                    v  
                                calls UserRepository.login()
                                    v  
                                calls UserJpaRepository (db)
                                    v  
                                Supabase
*/

public class AuthController {

}
