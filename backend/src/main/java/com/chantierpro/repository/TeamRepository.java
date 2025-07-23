package com.chantierpro.repository;

import com.chantierpro.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    List<Team> findBySpecialtyContainingIgnoreCase(String specialty);
    
    List<Team> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT t FROM Team t WHERE t.name LIKE %?1% OR t.specialty LIKE %?1%")
    List<Team> findByNameOrSpecialtyContaining(String searchTerm);
    
    @Query("SELECT t FROM Team t WHERE t.activeTasks > 0")
    List<Team> findActiveTeams();
    
    @Query("SELECT t FROM Team t ORDER BY t.performance DESC")
    List<Team> findAllOrderByPerformanceDesc();
    
    @Query("SELECT AVG(t.performance) FROM Team t")
    Double getAveragePerformance();
}