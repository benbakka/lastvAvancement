package com.chantierpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Villa is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "villa_id", nullable = false)
    @JsonBackReference
    private Villa villa;
    
    // Add a getter for villaId to expose it in JSON response
    @Transient
    public Long getVillaId() {
        return villa != null ? villa.getId() : null;
    }

    @NotBlank(message = "Category name is required")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryStatus status = CategoryStatus.ON_SCHEDULE;

    // Team field removed as per requirement - teams are now only assigned at task level

    @Column(name = "tasks_count", nullable = false)
    private Integer tasksCount = 0;

    @Column(name = "completed_tasks", nullable = false)
    private Integer completedTasks = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Task> tasks;

    public enum CategoryStatus {
        ON_SCHEDULE, IN_PROGRESS, WARNING, DELAYED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Category() {}

    public Category(Villa villa, String name, LocalDate startDate, LocalDate endDate) {
        this.villa = villa;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Villa getVilla() { return villa; }
    public void setVilla(Villa villa) { this.villa = villa; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public CategoryStatus getStatus() { return status; }
    public void setStatus(CategoryStatus status) { this.status = status; }

    // Team getters and setters removed as per requirement - teams are now only assigned at task level

    public Integer getTasksCount() { return tasksCount; }
    public void setTasksCount(Integer tasksCount) { this.tasksCount = tasksCount; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}