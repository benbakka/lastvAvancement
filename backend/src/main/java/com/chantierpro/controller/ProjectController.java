package com.chantierpro.controller;

import com.chantierpro.entity.Project;
import com.chantierpro.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "false", maxAge = 3600)
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(project -> ResponseEntity.ok().body(project))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        Project createdProject = projectService.createProject(project);
        return ResponseEntity.ok(createdProject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @Valid @RequestBody Project projectDetails) {
        try {
            Project updatedProject = projectService.updateProject(id, projectDetails);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Project>> searchProjects(@RequestParam String q) {
        List<Project> projects = projectService.searchProjects(q);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Project>> getProjectsByStatus(@PathVariable Project.ProjectStatus status) {
        List<Project> projects = projectService.getProjectsByStatus(status);
        return ResponseEntity.ok(projects);
    }

    @PutMapping("/{id}/stats")
    public ResponseEntity<?> updateProjectStats(@PathVariable Long id) {
        try {
            projectService.updateProjectStats(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}