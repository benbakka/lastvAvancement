package com.chantierpro.service;

import com.chantierpro.entity.Category;
import com.chantierpro.entity.Villa;
import com.chantierpro.entity.Team;
import com.chantierpro.repository.CategoryRepository;
import com.chantierpro.repository.VillaRepository;
import com.chantierpro.repository.TeamRepository;
import com.chantierpro.repository.TaskRepository;
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
        return categoryRepository.findByVillaId(villaId);
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
        
        if (category.getTeam() != null && category.getTeam().getId() != null) {
            Team team = teamRepository.findById(category.getTeam().getId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            category.setTeam(team);
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        // Update villa stats
        villaService.updateVillaStats(villa.getId());
        
        return savedCategory;
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        category.setName(categoryDetails.getName());
        category.setStartDate(categoryDetails.getStartDate());
        category.setEndDate(categoryDetails.getEndDate());
        category.setProgress(categoryDetails.getProgress());
        category.setStatus(categoryDetails.getStatus());

        if (categoryDetails.getTeam() != null && categoryDetails.getTeam().getId() != null) {
            Team team = teamRepository.findById(categoryDetails.getTeam().getId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            category.setTeam(team);
        }

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

    public List<Category> getCategoriesByTeamId(Long teamId) {
        return categoryRepository.findByTeamId(teamId);
    }

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