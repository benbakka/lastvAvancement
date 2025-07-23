package com.chantierpro.controller;

import com.chantierpro.entity.Task;
import com.chantierpro.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(@RequestParam(required = false) Long categoryId) {
        List<Task> tasks;
        if (categoryId != null) {
            tasks = taskService.getTasksByCategoryId(categoryId);
        } else {
            tasks = taskService.getAllTasks();
        }
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(task -> ResponseEntity.ok().body(task))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        try {
            Task createdTask = taskService.createTask(task);
            return ResponseEntity.ok(createdTask);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task taskDetails) {
        try {
            Task updatedTask = taskService.updateTask(id, taskDetails);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/villa/{villaId}")
    public ResponseEntity<List<Task>> getTasksByVillaId(@PathVariable Long villaId) {
        List<Task> tasks = taskService.getTasksByVillaId(villaId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable Long projectId) {
        List<Task> tasks = taskService.getTasksByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Task>> getTasksByTeamId(@PathVariable Long teamId) {
        List<Task> tasks = taskService.getTasksByTeamId(teamId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable Task.TaskStatus status) {
        List<Task> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/progress-status/{progressStatus}")
    public ResponseEntity<List<Task>> getTasksByProgressStatus(@PathVariable Task.ProgressStatus progressStatus) {
        List<Task> tasks = taskService.getTasksByProgressStatus(progressStatus);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/unreceived")
    public ResponseEntity<List<Task>> getUnreceivedCompletedTasks() {
        List<Task> tasks = taskService.getUnreceivedCompletedTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<Task>> getUnpaidTasks() {
        List<Task> tasks = taskService.getUnpaidTasks();
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Task> updateTaskProgress(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer progress = request.get("progress");
            Task updatedTask = taskService.updateTaskProgress(id, progress);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<Task> markTaskAsReceived(@PathVariable Long id) {
        try {
            Task updatedTask = taskService.markTaskAsReceived(id);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Task> markTaskAsPaid(@PathVariable Long id) {
        try {
            Task updatedTask = taskService.markTaskAsPaid(id);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/project/{projectId}/amounts")
    public ResponseEntity<Map<String, Double>> getProjectAmounts(@PathVariable Long projectId) {
        Double totalAmount = taskService.getTotalAmountByProjectId(projectId);
        Double paidAmount = taskService.getPaidAmountByProjectId(projectId);
        
        Map<String, Double> amounts = Map.of(
            "totalAmount", totalAmount != null ? totalAmount : 0.0,
            "paidAmount", paidAmount != null ? paidAmount : 0.0
        );
        
        return ResponseEntity.ok(amounts);
    }
}