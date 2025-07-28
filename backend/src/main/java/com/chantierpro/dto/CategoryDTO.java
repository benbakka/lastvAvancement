package com.chantierpro.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CategoryDTO {
    private Long id;
    
    @NotNull(message = "Villa ID is required")
    private Long villaId;
    
    @NotBlank(message = "Category name is required")
    private String name;
    
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    // teamId field removed as per requirement - teams are now only assigned at task level
    
    // Constructors
    public CategoryDTO() {}
    
    public CategoryDTO(Long villaId, String name, LocalDate startDate, LocalDate endDate) {
        this.villaId = villaId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getVillaId() {
        return villaId;
    }
    
    public void setVillaId(Long villaId) {
        this.villaId = villaId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    // teamId getters and setters removed as per requirement - teams are now only assigned at task level
}
