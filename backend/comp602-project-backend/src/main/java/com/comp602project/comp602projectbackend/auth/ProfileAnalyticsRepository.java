package com.comp602project.comp602projectbackend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileAnalyticsRepository extends JpaRepository<ProfileAnalyticsDatabase, Integer> {

    // Retrieves analytics data for a specific user
    Optional<ProfileAnalyticsDatabase> findByUser_UserId(int userId);
}