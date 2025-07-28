package com.chantierpro.service;

import com.chantierpro.dto.TaskTemplateDTO;
import com.chantierpro.dto.TeamWithTasksDTO;
import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.entity.Team;
import com.chantierpro.entity.TeamTaskTemplate;
import com.chantierpro.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private VillaRepository villaRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private TaskTemplateRepository taskTemplateRepository;
    
    @Autowired
    private TeamTaskTemplateRepository teamTaskTemplateRepository;
    
    @Autowired
    private TaskTemplateService taskTemplateService;
    
    @Autowired
    private TeamTaskTemplateService teamTaskTemplateService;

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }

    public Team createTeam(Team team) {
        // Fix for bidirectional relationship - ensure each task has reference to its team
        if (team.getTasks() != null) {
            team.getTasks().forEach(task -> task.setTeam(team));
        }
        return teamRepository.save(team);
    }

    public Team updateTeam(Long id, Team teamDetails) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));

        team.setName(teamDetails.getName());
        team.setSpecialty(teamDetails.getSpecialty());
        team.setMembersCount(teamDetails.getMembersCount());
        team.setPerformance(teamDetails.getPerformance());

        return teamRepository.save(team);
    }

    public void deleteTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));
        teamRepository.delete(team);
    }

    public List<Team> searchTeams(String searchTerm) {
        return teamRepository.findByNameOrSpecialtyContaining(searchTerm);
    }

    public List<Team> getTeamsBySpecialty(String specialty) {
        return teamRepository.findBySpecialtyContainingIgnoreCase(specialty);
    }

    public List<Team> getActiveTeams() {
        return teamRepository.findActiveTeams();
    }

    public List<Team> getTeamsOrderedByPerformance() {
        return teamRepository.findAllOrderByPerformanceDesc();
    }

    public Double getAveragePerformance() {
        return teamRepository.getAveragePerformance();
    }

    @Transactional
    public void updateTeamStats(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Count active tasks for this team
        List<com.chantierpro.entity.Task> activeTasks = taskRepository.findByTeamId(teamId);
        long activeTasksCount = activeTasks.stream()
                .filter(task -> task.getStatus() == com.chantierpro.entity.Task.TaskStatus.IN_PROGRESS ||
                               task.getStatus() == com.chantierpro.entity.Task.TaskStatus.PENDING)
                .count();

        team.setActiveTasks((int) activeTasksCount);
        team.setLastActivity(LocalDateTime.now());

        // Calculate performance based on completed tasks vs total tasks
        long completedTasks = activeTasks.stream()
                .filter(task -> task.getStatus() == com.chantierpro.entity.Task.TaskStatus.COMPLETED)
                .count();

        if (!activeTasks.isEmpty()) {
            int performance = (int) ((completedTasks * 100) / activeTasks.size());
            team.setPerformance(performance);
        }

        teamRepository.save(team);
    }

    @Transactional
    public Team updateTeamActivity(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        team.setLastActivity(LocalDateTime.now());
        return teamRepository.save(team);
    }
    
    @Transactional
    public Team createTeamWithDefaultTasks(TeamWithTasksDTO teamWithTasksDTO) {
        System.out.println("Creating team with default tasks: " + teamWithTasksDTO.getTeam().getName());
        
        // Create the team first
        Team team = teamWithTasksDTO.getTeam();
        Team savedTeam = createTeam(team);
        System.out.println("Team created with ID: " + savedTeam.getId());
        
        // Create task templates and associate them with the team
        if (teamWithTasksDTO.getDefaultTasks() != null && !teamWithTasksDTO.getDefaultTasks().isEmpty()) {
            for (TaskTemplateDTO taskTemplateDTO : teamWithTasksDTO.getDefaultTasks()) {
                // Convert DTO to entity
                TaskTemplate taskTemplate = new TaskTemplate();
                taskTemplate.setName(taskTemplateDTO.getName());
                taskTemplate.setDescription(taskTemplateDTO.getDescription());
                taskTemplate.setDurationDays(taskTemplateDTO.getDurationDays());
                taskTemplate.setDefaultAmount(taskTemplateDTO.getDefaultAmount());
                taskTemplate.setCreatedAt(LocalDateTime.now());
                taskTemplate.setUpdatedAt(LocalDateTime.now());
                
                TaskTemplate savedTemplate = taskTemplateService.createTaskTemplate(taskTemplate);
                
                // Create the association between team and task template
                TeamTaskTemplate teamTaskTemplate = new TeamTaskTemplate();
                teamTaskTemplate.setTeam(savedTeam);
                teamTaskTemplate.setTaskTemplate(savedTemplate);
                teamTaskTemplateService.assignTaskTemplateToTeam(teamTaskTemplate);
                
                // We need to find a default villa and category to assign to the task
                // For testing purposes, let's get the first villa and category from the database
                com.chantierpro.entity.Villa defaultVilla = villaRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No villas found in the database"));
                
                com.chantierpro.entity.Category defaultCategory = categoryRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No categories found in the database"));
                
                // Create an actual Task instance from the template
                com.chantierpro.entity.Task task = new com.chantierpro.entity.Task();
                task.setName(savedTemplate.getName());
                task.setDescription(savedTemplate.getDescription());
                task.setTeam(savedTeam);
                task.setTemplate(savedTemplate); // Set the template relationship
                task.setVilla(defaultVilla); // Set a default villa
                task.setCategory(defaultCategory); // Set a default category
                
                // Set required dates
                LocalDate today = LocalDate.now();
                LocalDate endDate = today.plusDays(taskTemplateDTO.getDurationDays() != null ? taskTemplateDTO.getDurationDays() : 7);
                
                task.setStartDate(today);
                task.setEndDate(endDate);
                task.setPlannedStartDate(today);
                task.setPlannedEndDate(endDate);
                
                // Set other required fields
                task.setStatus(com.chantierpro.entity.Task.TaskStatus.PENDING); // Set initial status
                task.setProgress(0); // Set initial progress
                task.setProgressStatus(com.chantierpro.entity.Task.ProgressStatus.ON_SCHEDULE);
                task.setIsReceived(false);
                task.setIsPaid(false);
                task.setAmount(taskTemplateDTO.getDefaultAmount());
                task.setCreatedAt(LocalDateTime.now());
                task.setUpdatedAt(LocalDateTime.now());
                
                // Save the task instance
                try {
                    com.chantierpro.entity.Task savedTask = taskRepository.save(task);
                    System.out.println("Task created successfully with ID: " + savedTask.getId() + 
                                     ", Name: " + savedTask.getName() + 
                                     ", Team ID: " + savedTask.getTeam().getId());
                } catch (Exception e) {
                    System.err.println("Error creating task: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
        
        // Update team stats to reflect the new tasks
        updateTeamStats(savedTeam.getId());
        
        return savedTeam;
    }
}