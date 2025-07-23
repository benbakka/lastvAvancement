package com.chantierpro.service;

import com.chantierpro.entity.Task;
import com.chantierpro.entity.Category;
import com.chantierpro.entity.Villa;
import com.chantierpro.entity.Team;
import com.chantierpro.repository.TaskRepository;
import com.chantierpro.repository.CategoryRepository;
import com.chantierpro.repository.VillaRepository;
import com.chantierpro.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VillaRepository villaRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private CategoryService categoryService;

    public List<Task> getAllTasks() {
        return taskRepository.findAllOrderByUpdatedAtDesc();
    }

    public List<Task> getTasksByCategoryId(Long categoryId) {
        return taskRepository.findByCategoryId(categoryId);
    }

    public List<Task> getTasksByVillaId(Long villaId) {
        return taskRepository.findByVillaId(villaId);
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByTeamId(Long teamId) {
        return taskRepository.findByTeamId(teamId);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        Category category = categoryRepository.findById(task.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Villa villa = villaRepository.findById(task.getVilla().getId())
                .orElseThrow(() -> new RuntimeException("Villa not found"));
        
        task.setCategory(category);
        task.setVilla(villa);
        
        if (task.getTeam() != null && task.getTeam().getId() != null) {
            Team team = teamRepository.findById(task.getTeam().getId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            task.setTeam(team);
        }
        
        Task savedTask = taskRepository.save(task);
        
        // Update category stats
        categoryService.updateCategoryStats(category.getId());
        
        return savedTask;
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setName(taskDetails.getName());
        task.setDescription(taskDetails.getDescription());
        task.setStartDate(taskDetails.getStartDate());
        task.setEndDate(taskDetails.getEndDate());
        task.setPlannedStartDate(taskDetails.getPlannedStartDate());
        task.setPlannedEndDate(taskDetails.getPlannedEndDate());
        task.setStatus(taskDetails.getStatus());
        task.setProgress(taskDetails.getProgress());
        task.setProgressStatus(taskDetails.getProgressStatus());
        task.setIsReceived(taskDetails.getIsReceived());
        task.setIsPaid(taskDetails.getIsPaid());
        task.setAmount(taskDetails.getAmount());
        task.setRemarks(taskDetails.getRemarks());

        if (taskDetails.getTeam() != null && taskDetails.getTeam().getId() != null) {
            Team team = teamRepository.findById(taskDetails.getTeam().getId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            task.setTeam(team);
        }

        Task savedTask = taskRepository.save(task);
        
        // Update category stats
        categoryService.updateCategoryStats(task.getCategory().getId());
        
        return savedTask;
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        Long categoryId = task.getCategory().getId();
        taskRepository.delete(task);
        
        // Update category stats
        categoryService.updateCategoryStats(categoryId);
    }

    public List<Task> getTasksByStatus(Task.TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksByProgressStatus(Task.ProgressStatus progressStatus) {
        return taskRepository.findByProgressStatus(progressStatus);
    }

    public List<Task> getUnreceivedCompletedTasks() {
        return taskRepository.findByIsReceivedFalseAndStatus(Task.TaskStatus.COMPLETED);
    }

    public List<Task> getUnpaidTasks() {
        return taskRepository.findByIsPaidFalse();
    }

    public Double getTotalAmountByProjectId(Long projectId) {
        return taskRepository.getTotalAmountByProjectId(projectId);
    }

    public Double getPaidAmountByProjectId(Long projectId) {
        return taskRepository.getPaidAmountByProjectId(projectId);
    }

    @Transactional
    public Task updateTaskProgress(Long id, Integer progress) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setProgress(progress);
        
        // Auto-update status based on progress
        if (progress == 100) {
            task.setStatus(Task.TaskStatus.COMPLETED);
        } else if (progress > 0) {
            task.setStatus(Task.TaskStatus.IN_PROGRESS);
        }

        Task savedTask = taskRepository.save(task);
        
        // Update category stats
        categoryService.updateCategoryStats(task.getCategory().getId());
        
        return savedTask;
    }

    @Transactional
    public Task markTaskAsReceived(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setIsReceived(true);
        return taskRepository.save(task);
    }

    @Transactional
    public Task markTaskAsPaid(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setIsPaid(true);
        return taskRepository.save(task);
    }
}