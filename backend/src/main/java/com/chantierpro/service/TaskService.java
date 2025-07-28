package com.chantierpro.service;

import com.chantierpro.entity.*;
import com.chantierpro.repository.TaskRepository;
import com.chantierpro.repository.CategoryRepository;
import com.chantierpro.repository.VillaRepository;
import com.chantierpro.repository.TeamRepository;
import com.chantierpro.repository.TaskTemplateRepository;
import com.chantierpro.repository.TeamTaskTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    
    @Autowired
    private TaskTemplateRepository taskTemplateRepository;
    
    @Autowired
    private TeamTaskTemplateRepository teamTaskTemplateRepository;
    
    @Autowired
    private TaskTemplateService taskTemplateService;

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
    
    public List<Task> getTasksByCategoryIdAndVillaId(Long categoryId, Long villaId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        if (villaId == null) {
            throw new IllegalArgumentException("Villa ID cannot be null");
        }
        
        // Verify that the category and villa exist
        boolean categoryExists = categoryRepository.existsById(categoryId);
        boolean villaExists = villaRepository.existsById(villaId);
        
        if (!categoryExists) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }
        
        if (!villaExists) {
            throw new RuntimeException("Villa not found with ID: " + villaId);
        }
        
        System.out.println("Service: Fetching tasks for category ID: " + categoryId + " and villa ID: " + villaId);
        List<Task> tasks = taskRepository.findByCategoryIdAndVillaId(categoryId, villaId);
        System.out.println("Service: Found " + tasks.size() + " tasks");
        
        return tasks;
    }
    
    @Transactional
    public Task createTaskForTeam(Long teamId, Task task) {
        System.out.println("Creating task for team ID: " + teamId);
        System.out.println("Task details: " + task.getName() + ", " + task.getDescription());
        
        try {
            // Find the team
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
            System.out.println("Found team: " + team.getName() + " (ID: " + team.getId() + ")");
            
            // Set the team for the task
            task.setTeam(team);
            
            // If villa is not set, find a default villa
            if (task.getVilla() == null) {
                List<Villa> villas = villaRepository.findAll();
                System.out.println("Found " + villas.size() + " villas in the database");
                
                if (villas.isEmpty()) {
                    throw new RuntimeException("No villas found in the database");
                }
                
                Villa defaultVilla = villas.get(0);
                task.setVilla(defaultVilla);
                System.out.println("Set default villa: " + defaultVilla.getId());
            }
            
            // If category is not set, find a default category
            if (task.getCategory() == null) {
                List<Category> categories = categoryRepository.findAll();
                System.out.println("Found " + categories.size() + " categories in the database");
                
                if (categories.isEmpty()) {
                    throw new RuntimeException("No categories found in the database");
                }
                
                Category defaultCategory = categories.get(0);
                task.setCategory(defaultCategory);
                System.out.println("Set default category: " + defaultCategory.getId());
            }
            
            // Set dates if not provided
            if (task.getStartDate() == null) {
                task.setStartDate(java.time.LocalDate.now());
                System.out.println("Set default start date: " + task.getStartDate());
            }
            
            if (task.getEndDate() == null) {
                task.setEndDate(java.time.LocalDate.now().plusDays(7));
                System.out.println("Set default end date: " + task.getEndDate());
            }
            
            if (task.getPlannedStartDate() == null) {
                task.setPlannedStartDate(java.time.LocalDate.now());
                System.out.println("Set default planned start date: " + task.getPlannedStartDate());
            }
            
            if (task.getPlannedEndDate() == null) {
                task.setPlannedEndDate(java.time.LocalDate.now().plusDays(7));
                System.out.println("Set default planned end date: " + task.getPlannedEndDate());
            }
            
            // Save and return the task
            Task savedTask = taskRepository.save(task);
            System.out.println("Task created successfully with ID: " + savedTask.getId() + " for team ID: " + teamId);
            return savedTask;
        } catch (Exception e) {
            System.err.println("Error creating task for team: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Generate tasks from all templates associated with a team
     * @param teamId The team ID
     * @return List of created tasks
     */
    @Transactional
    public List<Task> generateTasksFromTemplates(Long teamId) {
        System.out.println("Generating tasks from templates for team ID: " + teamId);
        
        // Find the team
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
        System.out.println("Found team: " + team.getName());
        
        // Find all task templates associated with this team
        List<TeamTaskTemplate> teamTaskTemplates = teamTaskTemplateRepository.findByTeamId(teamId);
        System.out.println("Found " + teamTaskTemplates.size() + " task templates for team");
        
        if (teamTaskTemplates.isEmpty()) {
            throw new RuntimeException("No task templates found for team with id: " + teamId);
        }
        
        // Find a default villa and category (required for tasks)
        Villa defaultVilla = villaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No villas found in the database"));
        System.out.println("Using default villa ID: " + defaultVilla.getId());
        
        Category defaultCategory = categoryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No categories found in the database"));
        System.out.println("Using default category ID: " + defaultCategory.getId());
        
        List<Task> createdTasks = new ArrayList<>();
        
        // Create tasks from each template
        for (TeamTaskTemplate teamTaskTemplate : teamTaskTemplates) {
            TaskTemplate template = teamTaskTemplate.getTaskTemplate();
            System.out.println("Creating task from template: " + template.getName());
            
            Task task = new Task();
            task.setName(template.getName());
            task.setDescription(template.getDescription());
            task.setTeam(team);
            task.setVilla(defaultVilla);
            task.setCategory(defaultCategory);
            task.setAmount(template.getDefaultAmount());
            
            // Set dates
            LocalDate now = LocalDate.now();
            task.setStartDate(now);
            task.setEndDate(now.plusDays(template.getDurationDays()));
            task.setPlannedStartDate(now);
            task.setPlannedEndDate(now.plusDays(template.getDurationDays()));
            
            // Set status fields
            task.setStatus(Task.TaskStatus.PENDING);
            task.setProgress(0);
            task.setProgressStatus(Task.ProgressStatus.ON_SCHEDULE);
            task.setIsReceived(false);
            task.setIsPaid(false);
            
            // Set template reference
            task.setTemplate(template);
            
            // Set timestamps
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
            
            try {
                Task savedTask = taskRepository.save(task);
                System.out.println("Created task with ID: " + savedTask.getId() + ", Name: " + savedTask.getName());
                createdTasks.add(savedTask);
            } catch (Exception e) {
                System.err.println("Error creating task from template: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Successfully created " + createdTasks.size() + " tasks for team ID: " + teamId);
        return createdTasks;
    }
    
    /**
     * Create tasks from a task template for a specific category, villa, and team
     * @param templateId The task template ID
     * @param categoryId The category ID
     * @param villaId The villa ID
     * @param teamId The team ID (optional)
     * @return The created task
     */
    public Task createTaskFromTemplate(Long templateId, Long categoryId, Long villaId, Long teamId) {
        TaskTemplate template = taskTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Task template not found with id: " + templateId));
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        
        Villa villa = villaRepository.findById(villaId)
                .orElseThrow(() -> new RuntimeException("Villa not found with id: " + villaId));
        
        Task task = new Task();
        task.setTemplate(template);
        task.setCategory(category);
        task.setVilla(villa);
        task.setName(template.getName());
        task.setDescription(template.getDescription());
        task.setAmount(template.getDefaultAmount());
        
        // Set default status
        task.setStatus(Task.TaskStatus.PENDING);
        task.setProgress(0);
        task.setProgressStatus(Task.ProgressStatus.ON_SCHEDULE);
        task.setIsReceived(false);
        task.setIsPaid(false);
        
        // Set team if provided
        if (teamId != null) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
            task.setTeam(team);
        }
        
        return createTask(task);
    }
    
    /**
     * Get tasks by template ID
     * @param templateId The task template ID
     * @return List of tasks using the specified template
     */
    public List<Task> getTasksByTemplateId(Long templateId) {
        return taskRepository.findByTemplateId(templateId);
    }
    
    /**
     * Get tasks by template ID and status
     * @param templateId The task template ID
     * @param status The task status
     * @return List of tasks using the specified template and having the specified status
     */
    public List<Task> getTasksByTemplateIdAndStatus(Long templateId, Task.TaskStatus status) {
        return taskRepository.findByTemplateIdAndStatus(templateId, status);
    }
    
    /**
     * Get tasks by template ID and team ID
     * @param templateId The task template ID
     * @param teamId The team ID
     * @return List of tasks using the specified template and assigned to the specified team
     */
    public List<Task> getTasksByTemplateIdAndTeamId(Long templateId, Long teamId) {
        return taskRepository.findByTemplateIdAndTeamId(templateId, teamId);
    }
    
    /**
     * Count tasks by template ID
     * @param templateId The task template ID
     * @return Number of tasks using the specified template
     */
    public Long countByTemplateId(Long templateId) {
        return taskRepository.countByTemplateId(templateId);
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
        
        // Set task template if provided
        if (task.getTemplate() != null && task.getTemplate().getId() != null) {
            TaskTemplate template = taskTemplateRepository.findById(task.getTemplate().getId())
                    .orElseThrow(() -> new RuntimeException("Task template not found"));
            task.setTemplate(template);
            
            // If template is provided, copy default values if not already set
            if (task.getName() == null || task.getName().isEmpty()) {
                task.setName(template.getName());
            }
            if (task.getDescription() == null || task.getDescription().isEmpty()) {
                task.setDescription(template.getDescription());
            }
            if (task.getAmount() == null && template.getDefaultAmount() != null) {
                task.setAmount(template.getDefaultAmount());
            }
        }
        
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

        // Update task template if provided
        if (taskDetails.getTemplate() != null && taskDetails.getTemplate().getId() != null) {
            TaskTemplate template = taskTemplateRepository.findById(taskDetails.getTemplate().getId())
                    .orElseThrow(() -> new RuntimeException("Task template not found"));
            task.setTemplate(template);
        }

        // Update category if provided
        if (taskDetails.getCategory() != null && taskDetails.getCategory().getId() != null) {
            Category category = categoryRepository.findById(taskDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            task.setCategory(category);
        }

        // Update villa if provided
        if (taskDetails.getVilla() != null && taskDetails.getVilla().getId() != null) {
            Villa villa = villaRepository.findById(taskDetails.getVilla().getId())
                    .orElseThrow(() -> new RuntimeException("Villa not found"));
            task.setVilla(villa);
        }

        // Update team if provided
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