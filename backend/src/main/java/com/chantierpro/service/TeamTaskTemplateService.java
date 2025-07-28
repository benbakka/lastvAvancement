package com.chantierpro.service;

import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.entity.TeamTaskTemplate;
import java.util.List;

/**
 * Service interface for managing team-task template assignments.
 */
public interface TeamTaskTemplateService {
    
    /**
     * Assign a task template to a team.
     * 
     * @param teamTaskTemplate The team-task template association
     * @return The saved team-task template association
     */
    TeamTaskTemplate assignTaskTemplateToTeam(TeamTaskTemplate teamTaskTemplate);
    
    /**
     * Remove a task template from a team.
     * 
     * @param teamId The team ID
     * @param templateId The task template ID
     */
    void removeTaskTemplateFromTeam(Long teamId, Long templateId);
    
    /**
     * Check if a task template is assigned to a team.
     * 
     * @param teamId The team ID
     * @param templateId The task template ID
     * @return true if the task template is assigned to the team, false otherwise
     */
    boolean isTaskTemplateAssignedToTeam(Long teamId, Long templateId);
    
    /**
     * Get all task templates assigned to a team.
     * 
     * @param teamId The team ID
     * @return List of task templates assigned to the team
     */
    List<TaskTemplate> getTaskTemplatesByTeamId(Long teamId);
}
