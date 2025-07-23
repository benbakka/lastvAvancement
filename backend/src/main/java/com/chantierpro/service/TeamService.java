package com.chantierpro.service;

import com.chantierpro.entity.Team;
import com.chantierpro.repository.TeamRepository;
import com.chantierpro.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}