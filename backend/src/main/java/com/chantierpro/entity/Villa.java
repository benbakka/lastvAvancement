package com.chantierpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "villas")
public class Villa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Project is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @NotBlank(message = "Villa name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Villa type is required")
    @Column(nullable = false)
    private String type;

    @Positive(message = "Surface must be positive")
    @Column(nullable = false)
    private Integer surface;

    @Column(nullable = false)
    private Integer progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VillaStatus status = VillaStatus.NOT_STARTED;

    @Column(name = "categories_count", nullable = false)
    private Integer categoriesCount = 0;

    @Column(name = "tasks_count", nullable = false)
    private Integer tasksCount = 0;

    @Column(name = "last_modified", nullable = false)
    private LocalDateTime lastModified;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "villa", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Category> categories;

    public enum VillaStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModified = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModified = LocalDateTime.now();
    }

    // Constructors
    public Villa() {}

    public Villa(Project project, String name, String type, Integer surface) {
        this.project = project;
        this.name = name;
        this.type = type;
        this.surface = surface;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getSurface() { return surface; }
    public void setSurface(Integer surface) { this.surface = surface; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public VillaStatus getStatus() { return status; }
    public void setStatus(VillaStatus status) { this.status = status; }

    public Integer getCategoriesCount() { return categoriesCount; }
    public void setCategoriesCount(Integer categoriesCount) { this.categoriesCount = categoriesCount; }

    public Integer getTasksCount() { return tasksCount; }
    public void setTasksCount(Integer tasksCount) { this.tasksCount = tasksCount; }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Category> getCategories() { return categories; }
    public void setCategories(List<Category> categories) { this.categories = categories; }
}