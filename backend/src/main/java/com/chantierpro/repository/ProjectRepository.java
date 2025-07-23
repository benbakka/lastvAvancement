package com.chantierpro.repository;

import com.chantierpro.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByStatus(Project.ProjectStatus status);
    
    List<Project> findByNameContainingIgnoreCase(String name);
    
    List<Project> findByLocationContainingIgnoreCase(String location);
    
    @Query("SELECT p FROM Project p WHERE p.name LIKE %?1% OR p.location LIKE %?1%")
    List<Project> findByNameOrLocationContaining(String searchTerm);
    
    @Query("SELECT p FROM Project p ORDER BY p.createdAt DESC")
    List<Project> findAllOrderByCreatedAtDesc();
}