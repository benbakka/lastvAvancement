package com.chantierpro.dto;

import com.chantierpro.entity.Team;
import java.util.List;

/**
 * DTO for creating a team with its default task templates in a single operation.
 */
public class TeamWithTasksDTO {
    
    private Team team;
    private List<TaskTemplateDTO> defaultTasks;
    
    // Getters and setters
    public Team getTeam() {
        return team;
    }
    
    public void setTeam(Team team) {
        this.team = team;
    }
    
    public List<TaskTemplateDTO> getDefaultTasks() {
        return defaultTasks;
    }
    
    public void setDefaultTasks(List<TaskTemplateDTO> defaultTasks) {
        this.defaultTasks = defaultTasks;
    }
}
