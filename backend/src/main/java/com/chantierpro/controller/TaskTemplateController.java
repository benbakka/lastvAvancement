package com.chantierpro.controller;

import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.service.TaskTemplateService;
import com.chantierpro.service.TeamTaskTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/task-templates")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskTemplateController {

    @Autowired
    private TaskTemplateService taskTemplateService;
    
    @Autowired
    private TeamTaskTemplateService teamTaskTemplateService;

    @GetMapping
    public ResponseEntity<List<TaskTemplate>> getAllTaskTemplates(
            @RequestParam(required = false) String search) {
        List<TaskTemplate> templates;
        if (search != null && !search.isEmpty()) {
            templates = taskTemplateService.searchTaskTemplates(search);
        } else {
            templates = taskTemplateService.getAllTaskTemplates();
        }
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TaskTemplate>> getRecentTaskTemplates() {
        List<TaskTemplate> templates = taskTemplateService.getRecentTaskTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTemplate> getTaskTemplateById(@PathVariable Long id) {
        return taskTemplateService.getTaskTemplateById(id)
                .map(template -> ResponseEntity.ok().body(template))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaskTemplate> createTaskTemplate(@Valid @RequestBody TaskTemplate taskTemplate) {
        try {
            TaskTemplate createdTemplate = taskTemplateService.createTaskTemplate(taskTemplate);
            return ResponseEntity.ok(createdTemplate);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskTemplate> updateTaskTemplate(
            @PathVariable Long id, 
            @Valid @RequestBody TaskTemplate taskTemplateDetails) {
        try {
            TaskTemplate updatedTemplate = taskTemplateService.updateTaskTemplate(id, taskTemplateDetails);
            return ResponseEntity.ok(updatedTemplate);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTaskTemplate(@PathVariable Long id) {
        try {
            taskTemplateService.deleteTaskTemplate(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TaskTemplate>> getTaskTemplatesByTeamId(@PathVariable Long teamId) {
        List<TaskTemplate> templates = teamTaskTemplateService.getTaskTemplatesByTeamId(teamId);
        return ResponseEntity.ok(templates);
    }
}
