package com.chantierpro.migration;

import com.chantierpro.entity.Task;
import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.repository.TaskRepository;
import com.chantierpro.repository.TaskTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Migration script to convert existing tasks into the new template-based structure.
 * This will identify common task patterns and create templates for them.
 */
@Configuration
public class TaskTemplateMigration {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskTemplateRepository taskTemplateRepository;

    /**
     * This bean will run only when the 'migration' profile is active.
     * To run the migration: mvn spring-boot:run -Dspring-boot.run.profiles=migration
     */
    @Bean
    @Profile("migration")
    public CommandLineRunner migrateTasksToTemplates() {
        return args -> {
            System.out.println("Starting task template migration...");
            migrateExistingTasks();
            System.out.println("Task template migration completed successfully.");
        };
    }

    @Transactional
    public void migrateExistingTasks() {
        // Get all tasks
        List<Task> allTasks = taskRepository.findAll();
        System.out.println("Found " + allTasks.size() + " tasks to process");

        // Group tasks by name and description to identify potential templates
        Map<String, List<Task>> taskGroups = allTasks.stream()
                .collect(Collectors.groupingBy(task -> task.getName() + "|" + task.getDescription()));

        System.out.println("Identified " + taskGroups.size() + " potential task templates");

        // Process each group to create templates
        for (Map.Entry<String, List<Task>> entry : taskGroups.entrySet()) {
            List<Task> tasks = entry.getValue();
            
            // Skip if there's only one task in the group (not worth templating)
            if (tasks.size() < 2) {
                continue;
            }

            // Use the first task as a reference for creating the template
            Task referenceTask = tasks.get(0);
            
            // Create new template
            TaskTemplate template = new TaskTemplate();
            template.setName(referenceTask.getName());
            template.setDescription(referenceTask.getDescription());
            
            // Calculate average duration in days based on planned start/end dates
            OptionalDouble avgDuration = tasks.stream()
                .filter(t -> t.getPlannedStartDate() != null && t.getPlannedEndDate() != null)
                .mapToLong(t -> ChronoUnit.DAYS.between(t.getPlannedStartDate(), t.getPlannedEndDate()))
                .average();
            
            template.setDurationDays(avgDuration.isPresent() ? (int) Math.round(avgDuration.getAsDouble()) : null);
            
            // Calculate average amount
            OptionalDouble avgAmount = tasks.stream()
                    .filter(t -> t.getAmount() != null)
                    .mapToDouble(t -> t.getAmount().doubleValue())
                    .average();
            
            template.setDefaultAmount(avgAmount.isPresent() 
                ? BigDecimal.valueOf(avgAmount.getAsDouble()) 
                : null);
            
            // Save the template
            TaskTemplate savedTemplate = taskTemplateRepository.save(template);
            System.out.println("Created template: " + savedTemplate.getName() + " (ID: " + savedTemplate.getId() + ")");
            
            // Update all tasks in this group to reference the new template
            for (Task task : tasks) {
                task.setTemplate(savedTemplate);
            }
            
            // Save all updated tasks
            taskRepository.saveAll(tasks);
            System.out.println("Updated " + tasks.size() + " tasks to reference template ID: " + savedTemplate.getId());
        }
    }
}
