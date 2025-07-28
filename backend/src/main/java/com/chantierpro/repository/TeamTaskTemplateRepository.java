package com.chantierpro.repository;

import com.chantierpro.entity.TeamTaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TeamTaskTemplate entity.
 */
@Repository
public interface TeamTaskTemplateRepository extends JpaRepository<TeamTaskTemplate, Long> {
    
    /**
     * Find a team-task template association by team ID and task template ID.
     * 
     * @param teamId The team ID
     * @param taskTemplateId The task template ID
     * @return The team-task template association, or null if not found
     */
    TeamTaskTemplate findByTeamIdAndTaskTemplateId(Long teamId, Long taskTemplateId);
    
    /**
     * Find all team-task template associations by team ID.
     * 
     * @param teamId The team ID
     * @return List of team-task template associations
     */
    List<TeamTaskTemplate> findByTeamId(Long teamId);
    
    /**
     * Delete a team-task template association by team ID and task template ID.
     * 
     * @param teamId The team ID
     * @param taskTemplateId The task template ID
     */
    void deleteByTeamIdAndTaskTemplateId(Long teamId, Long taskTemplateId);
}
