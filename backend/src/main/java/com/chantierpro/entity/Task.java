package com.chantierpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @JsonIgnoreProperties({"tasks", "hibernateLazyInitializer", "handler"})
    private TaskTemplate template;

    @NotNull(message = "Category is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private Category category;
    
    @Transient
    public Long getCategoryId() {
        return category != null ? category.getId() : null;
    }

    @NotNull(message = "Villa is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "villa_id", nullable = false)
    @JsonIgnoreProperties({"categories", "tasks", "project", "hibernateLazyInitializer", "handler"})
    private Villa villa;
    
    @Transient
    public Long getVillaId() {
        return villa != null ? villa.getId() : null;
    }

    @NotBlank(message = "Task name is required")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"tasks", "hibernateLazyInitializer", "handler"})
    private Team team;
    
    @Transient
    public Long getTeamId() {
        return team != null ? team.getId() : null;
    }

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull(message = "Planned start date is required")
    @Column(name = "planned_start_date", nullable = false)
    private LocalDate plannedStartDate;

    @NotNull(message = "Planned end date is required")
    @Column(name = "planned_end_date", nullable = false)
    private LocalDate plannedEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(nullable = false)
    private Integer progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_status", nullable = false)
    private ProgressStatus progressStatus = ProgressStatus.ON_SCHEDULE;

    @Column(name = "is_received", nullable = false)
    private Boolean isReceived = false;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @ElementCollection
    @CollectionTable(name = "task_photos", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TaskStatus {
        PENDING, IN_PROGRESS, COMPLETED, DELAYED
    }

    public enum ProgressStatus {
        ON_SCHEDULE, AHEAD, BEHIND, AT_RISK
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
    public Task() {}

    public Task(Category category, Villa villa, String name, LocalDate startDate, LocalDate endDate) {
        this.category = category;
        this.villa = villa;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.plannedStartDate = startDate;
        this.plannedEndDate = endDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public TaskTemplate getTemplate() { return template; }
    public void setTemplate(TaskTemplate template) { this.template = template; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Villa getVilla() { return villa; }
    public void setVilla(Villa villa) { this.villa = villa; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getPlannedStartDate() { return plannedStartDate; }
    public void setPlannedStartDate(LocalDate plannedStartDate) { this.plannedStartDate = plannedStartDate; }

    public LocalDate getPlannedEndDate() { return plannedEndDate; }
    public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public ProgressStatus getProgressStatus() { return progressStatus; }
    public void setProgressStatus(ProgressStatus progressStatus) { this.progressStatus = progressStatus; }

    public Boolean getIsReceived() { return isReceived; }
    public void setIsReceived(Boolean isReceived) { this.isReceived = isReceived; }

    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}