package com.chantierpro.dto;

import java.math.BigDecimal;

/**
 * DTO for task template creation when creating a team with default tasks.
 */
public class TaskTemplateDTO {
    
    private String name;
    private String description;
    private Integer durationDays;
    private BigDecimal defaultAmount;
    
    // Getters and setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getDurationDays() {
        return durationDays;
    }
    
    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }
    
    public BigDecimal getDefaultAmount() {
        return defaultAmount;
    }
    
    public void setDefaultAmount(BigDecimal defaultAmount) {
        this.defaultAmount = defaultAmount;
    }
}
