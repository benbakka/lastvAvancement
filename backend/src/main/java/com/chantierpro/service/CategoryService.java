package com.chantierpro.service;

import com.chantierpro.dto.CategoryDTO;
import com.chantierpro.entity.Category;
import com.chantierpro.entity.Villa;
import com.chantierpro.entity.Team;
import com.chantierpro.repository.CategoryRepository;
import com.chantierpro.repository.VillaRepository;
import com.chantierpro.repository.TeamRepository;
import com.chantierpro.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VillaRepository villaRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private VillaService villaService;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getCategoriesByVillaId(Long villaId) {
        return categoryRepository.findByVilla_Id(villaId);
    }

    public List<Category> getCategoriesByProjectId(Long projectId) {
        return categoryRepository.findByProjectId(projectId);
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        Villa villa = villaRepository.findById(category.getVilla().getId())
                .orElseThrow(() -> new RuntimeException("Villa not found"));
        
        category.setVilla(villa);
        
        // Team assignment removed as per requirement - teams are now only assigned at task level
        
        Category savedCategory = categoryRepository.save(category);
        
        // Update villa stats
        villaService.updateVillaStats(villa.getId());
        
        return savedCategory;
    }
    
    public Category createCategoryFromDTO(@Valid CategoryDTO categoryDTO) {
        try {
            System.out.println("Processing CategoryDTO: villaId=" + categoryDTO.getVillaId() + ", name=" + categoryDTO.getName() + ", startDate=" + categoryDTO.getStartDate() + ", endDate=" + categoryDTO.getEndDate());
            
            // Find the villa
            Villa villa = villaRepository.findById(categoryDTO.getVillaId())
                    .orElseThrow(() -> new RuntimeException("Villa not found with id: " + categoryDTO.getVillaId()));
            System.out.println("Found villa: " + villa.getName());
            
            // Create new category
            Category category = new Category();
            category.setVilla(villa);
            category.setName(categoryDTO.getName());
            category.setStartDate(categoryDTO.getStartDate());
            category.setEndDate(categoryDTO.getEndDate());
            
            // Team assignment removed as per requirement - teams are now only assigned at task level
            
            Category savedCategory = categoryRepository.save(category);
            System.out.println("Category saved successfully with id: " + savedCategory.getId());
            
            // Update villa stats
            villaService.updateVillaStats(villa.getId());
            
            return savedCategory;
        } catch (Exception e) {
            System.err.println("Error in createCategoryFromDTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        category.setName(categoryDetails.getName());
        category.setStartDate(categoryDetails.getStartDate());
        category.setEndDate(categoryDetails.getEndDate());
        category.setProgress(categoryDetails.getProgress());
        category.setStatus(categoryDetails.getStatus());

        // Team assignment removed as per requirement - teams are now only assigned at task level

        Category savedCategory = categoryRepository.save(category);
        
        // Update villa stats
        villaService.updateVillaStats(category.getVilla().getId());
        
        return savedCategory;
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        Long villaId = category.getVilla().getId();
        categoryRepository.delete(category);
        
        // Update villa stats
        villaService.updateVillaStats(villaId);
    }

    // Method removed as team is no longer assigned at category level
    // public List<Category> getCategoriesByTeamId(Long teamId) {
    //     return categoryRepository.findByTeamId(teamId);
    // }

    public List<Category> getCategoriesByStatus(Category.CategoryStatus status) {
        return categoryRepository.findByStatus(status);
    }

    @Transactional
    public void updateCategoryStats(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        // Update tasks count
        Long tasksCount = taskRepository.countByCategoryId(categoryId);
        category.setTasksCount(tasksCount.intValue());

        // Update completed tasks count
        Long completedTasks = taskRepository.countCompletedByCategoryId(categoryId);
        category.setCompletedTasks(completedTasks.intValue());

        // Calculate progress
        if (tasksCount > 0) {
            int progress = (int) ((completedTasks * 100) / tasksCount);
            category.setProgress(progress);
            
            // Update status based on progress
            if (progress == 100) {
                category.setStatus(Category.CategoryStatus.ON_SCHEDULE);
            } else if (progress > 75) {
                category.setStatus(Category.CategoryStatus.IN_PROGRESS);
            } else if (progress > 50) {
                category.setStatus(Category.CategoryStatus.WARNING);
            } else {
                category.setStatus(Category.CategoryStatus.DELAYED);
            }
        }

        categoryRepository.save(category);
        
        // Update villa stats
        villaService.updateVillaStats(category.getVilla().getId());
    }
}