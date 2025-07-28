package com.chantierpro.controller;

import com.chantierpro.dto.TeamWithTasksDTO;
import com.chantierpro.entity.Team;
import com.chantierpro.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = "http://localhost:3000")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        List<Team> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        return teamService.getTeamById(id)
                .map(team -> ResponseEntity.ok().body(team))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@Valid @RequestBody Team team) {
        Team createdTeam = teamService.createTeam(team);
        return ResponseEntity.ok(createdTeam);
    }

    @PostMapping("/with-default-tasks")
    public ResponseEntity<?> createTeamWithDefaultTasks(@Valid @RequestBody TeamWithTasksDTO teamWithTasksDTO) {
        try {
            System.out.println("TeamController: Received request to create team with default tasks");
            System.out.println("Team name: " + teamWithTasksDTO.getTeam().getName());
            System.out.println("Default tasks count: " + 
                             (teamWithTasksDTO.getDefaultTasks() != null ? teamWithTasksDTO.getDefaultTasks().size() : 0));
            
            Team createdTeam = teamService.createTeamWithDefaultTasks(teamWithTasksDTO);
            System.out.println("TeamController: Team created successfully with ID: " + createdTeam.getId());
            return ResponseEntity.ok(createdTeam);
        } catch (Exception e) {
            System.err.println("TeamController: Error creating team with default tasks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable Long id, @Valid @RequestBody Team teamDetails) {
        try {
            Team updatedTeam = teamService.updateTeam(id, teamDetails);
            return ResponseEntity.ok(updatedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
        try {
            teamService.deleteTeam(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Team>> searchTeams(@RequestParam String q) {
        List<Team> teams = teamService.searchTeams(q);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Team>> getTeamsBySpecialty(@PathVariable String specialty) {
        List<Team> teams = teamService.getTeamsBySpecialty(specialty);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Team>> getActiveTeams() {
        List<Team> teams = teamService.getActiveTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/performance")
    public ResponseEntity<List<Team>> getTeamsOrderedByPerformance() {
        List<Team> teams = teamService.getTeamsOrderedByPerformance();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/stats/performance")
    public ResponseEntity<Map<String, Double>> getPerformanceStats() {
        Double averagePerformance = teamService.getAveragePerformance();
        Map<String, Double> stats = Map.of(
            "averagePerformance", averagePerformance != null ? averagePerformance : 0.0
        );
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/stats")
    public ResponseEntity<?> updateTeamStats(@PathVariable Long id) {
        try {
            teamService.updateTeamStats(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/activity")
    public ResponseEntity<Team> updateTeamActivity(@PathVariable Long id) {
        try {
            Team updatedTeam = teamService.updateTeamActivity(id);
            return ResponseEntity.ok(updatedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}