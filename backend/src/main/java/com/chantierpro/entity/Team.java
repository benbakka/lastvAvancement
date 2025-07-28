package com.chantierpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Team name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Specialty is required")
    @Column(nullable = false)
    private String specialty;

    @Positive(message = "Members count must be positive")
    @Column(name = "members_count", nullable = false)
    private Integer membersCount;

    @Column(name = "active_tasks", nullable = false)
    private Integer activeTasks = 0;

    @Column(nullable = false)
    private Integer performance = 0;

    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Categories collection removed as per requirement - team assignment is now only at task level

    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastActivity = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Team() {}

    public Team(String name, String specialty, Integer membersCount) {
        this.name = name;
        this.specialty = specialty;
        this.membersCount = membersCount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public Integer getMembersCount() { return membersCount; }
    public void setMembersCount(Integer membersCount) { this.membersCount = membersCount; }

    public Integer getActiveTasks() { return activeTasks; }
    public void setActiveTasks(Integer activeTasks) { this.activeTasks = activeTasks; }

    public Integer getPerformance() { return performance; }
    public void setPerformance(Integer performance) { this.performance = performance; }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Category getters/setters removed as per requirement - team assignment is now only at task level

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}