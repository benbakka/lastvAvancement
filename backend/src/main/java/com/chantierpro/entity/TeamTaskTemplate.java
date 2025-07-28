package com.chantierpro.entity;

import jakarta.persistence.*;
import java.io.Serializable;

/**
 * Entity representing the many-to-many relationship between teams and task templates.
 * This allows each team to have its own set of default task templates.
 */
@Entity
@Table(name = "team_task_template")
public class TeamTaskTemplate implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "task_template_id", nullable = false)
    private TaskTemplate taskTemplate;
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Team getTeam() {
        return team;
    }
    
    public void setTeam(Team team) {
        this.team = team;
    }
    
    public TaskTemplate getTaskTemplate() {
        return taskTemplate;
    }
    
    public void setTaskTemplate(TaskTemplate taskTemplate) {
        this.taskTemplate = taskTemplate;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        TeamTaskTemplate that = (TeamTaskTemplate) o;
        
        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        if (team != null ? !team.equals(that.team) : that.team != null) return false;
        return taskTemplate != null ? taskTemplate.equals(that.taskTemplate) : that.taskTemplate == null;
    }
    
    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (team != null ? team.hashCode() : 0);
        result = 31 * result + (taskTemplate != null ? taskTemplate.hashCode() : 0);
        return result;
    }
}
