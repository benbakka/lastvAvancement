package com.chantierpro.repository;

import com.chantierpro.entity.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {
    
    // Find templates by name containing the search term (case insensitive)
    List<TaskTemplate> findByNameContainingIgnoreCase(String name);
    
    // Find templates ordered by most recently updated
    List<TaskTemplate> findAllByOrderByUpdatedAtDesc();
}
