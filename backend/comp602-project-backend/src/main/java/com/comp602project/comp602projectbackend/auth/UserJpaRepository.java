package com.comp602project.comp602projectbackend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

import java.util.Optional;


/**
 * UserJpaRepository goes to Supabase and fetches raw data.
 * UserRepository is the only class that uses this. Nothing else touches it.
 *      Supabase → UserJpaRepository → raw UserDatabase row → UserRepository processes it → User class instance
 * 
 * Spring writes and runs all that SQL automatically. You get all of that for free just by extending JpaRepository.
 *      db.findByUsername("leo")  // SELECT * FROM users WHERE username = 'leo'
 */

/*

JpaRepository (parent) has already built in functions:
    findById()
    findAll()
    save() 
    deleteById()

UserJpaRepository (interface that extends parent) has custon methods
    findByUsername()
*/

@Repository                                                                 // Tells Spring this is the class that directly talks to the database
public interface UserJpaRepository extends JpaRepository<UserDatabase, Integer> {

    // Spring sees "findByUsername" and automatically generates: SELECT * FROM users WHERE username = ?
    Optional<UserDatabase> findByUsername(String username);

    // Select * from users from email
    Optional<UserDatabase> findByEmail(String email);

    @Transactional
    public void deleteByEmail(String email);
}