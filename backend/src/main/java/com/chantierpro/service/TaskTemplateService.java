package com.chantierpro.service;

import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.repository.TaskTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskTemplateService {

    @Autowired
    private TaskTemplateRepository taskTemplateRepository;

    public List<TaskTemplate> getAllTaskTemplates() {
        return taskTemplateRepository.findAll();
    }

    public List<TaskTemplate> getRecentTaskTemplates() {
        return taskTemplateRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<TaskTemplate> searchTaskTemplates(String query) {
        return taskTemplateRepository.findByNameContainingIgnoreCase(query);
    }

    public Optional<TaskTemplate> getTaskTemplateById(Long id) {
        return taskTemplateRepository.findById(id);
    }

    public TaskTemplate createTaskTemplate(TaskTemplate taskTemplate) {
        return taskTemplateRepository.save(taskTemplate);
    }

    public TaskTemplate updateTaskTemplate(Long id, TaskTemplate taskTemplateDetails) {
        TaskTemplate taskTemplate = taskTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task template not found with id: " + id));

        taskTemplate.setName(taskTemplateDetails.getName());
        taskTemplate.setDescription(taskTemplateDetails.getDescription());
        taskTemplate.setDurationDays(taskTemplateDetails.getDurationDays());
        taskTemplate.setDefaultAmount(taskTemplateDetails.getDefaultAmount());

        return taskTemplateRepository.save(taskTemplate);
    }

    public void deleteTaskTemplate(Long id) {
        TaskTemplate taskTemplate = taskTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task template not found with id: " + id));
        
        taskTemplateRepository.delete(taskTemplate);
    }
}
