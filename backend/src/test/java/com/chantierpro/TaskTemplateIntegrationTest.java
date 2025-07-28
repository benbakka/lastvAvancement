package com.chantierpro;

import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.entity.Task;
import com.chantierpro.entity.Category;
import com.chantierpro.entity.Villa;
import com.chantierpro.entity.Team;
import com.chantierpro.repository.TaskTemplateRepository;
import com.chantierpro.repository.TaskRepository;
import com.chantierpro.repository.CategoryRepository;
import com.chantierpro.repository.VillaRepository;
import com.chantierpro.repository.TeamRepository;
import com.chantierpro.service.TaskTemplateService;
import com.chantierpro.service.TaskService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class TaskTemplateIntegrationTest {

    @Autowired
    private TaskTemplateRepository taskTemplateRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VillaRepository villaRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TaskTemplateService taskTemplateService;

    @Autowired
    private TaskService taskService;

    private TaskTemplate testTemplate;
    private Category testCategory;
    private Villa testVilla;
    private Team testTeam;

    @BeforeEach
    public void setup() {
        // Create a test task template
        TaskTemplate template = new TaskTemplate();
        template.setName("Test Template");
        template.setDescription("Test Description");
        template.setDurationDays(5);
        template.setDefaultAmount(1000.0);
        testTemplate = taskTemplateRepository.save(template);

        // Create a test villa
        Villa villa = new Villa();
        villa.setName("Test Villa");
        villa.setType("Residential");
        villa.setSurface(200.0);
        testVilla = villaRepository.save(villa);

        // Create a test category
        Category category = new Category();
        category.setName("Test Category");
        category.setVilla(testVilla);
        category.setStartDate(new Date());
        category.setEndDate(new Date());
        testCategory = categoryRepository.save(category);

        // Create a test team
        Team team = new Team();
        team.setName("Test Team");
        team.setSpecialty("Plumbing");
        testTeam = teamRepository.save(team);
    }

    @Test
    public void testCreateTaskFromTemplate() {
        // Create a task from template
        Task task = taskService.createTaskFromTemplate(
                testTemplate.getId(),
                testCategory.getId(),
                testVilla.getId(),
                testTeam.getId()
        );

        // Verify task was created correctly
        assertNotNull(task);
        assertNotNull(task.getId());
        assertEquals(testTemplate.getId(), task.getTemplate().getId());
        assertEquals(testCategory.getId(), task.getCategory().getId());
        assertEquals(testVilla.getId(), task.getVilla().getId());
        assertEquals(testTeam.getId(), task.getTeam().getId());
        assertEquals(testTemplate.getName(), task.getName());
        assertEquals(testTemplate.getDescription(), task.getDescription());
        assertEquals(testTemplate.getDefaultAmount(), task.getAmount());
        assertEquals(Task.TaskStatus.PENDING, task.getStatus());
        assertEquals(0, task.getProgress());
    }

    @Test
    public void testGetTasksByTemplateId() {
        // Create a task from template
        Task task = taskService.createTaskFromTemplate(
                testTemplate.getId(),
                testCategory.getId(),
                testVilla.getId(),
                testTeam.getId()
        );

        // Get tasks by template ID
        List<Task> tasks = taskService.getTasksByTemplateId(testTemplate.getId());

        // Verify tasks were retrieved correctly
        assertNotNull(tasks);
        assertFalse(tasks.isEmpty());
        assertEquals(1, tasks.size());
        assertEquals(task.getId(), tasks.get(0).getId());
    }

    @Test
    public void testUpdateTaskTemplate() {
        // Update task template
        testTemplate.setName("Updated Template Name");
        testTemplate.setDescription("Updated Description");
        testTemplate.setDurationDays(10);
        testTemplate.setDefaultAmount(2000.0);
        
        TaskTemplate updatedTemplate = taskTemplateService.updateTaskTemplate(testTemplate.getId(), testTemplate);

        // Verify task template was updated correctly
        assertNotNull(updatedTemplate);
        assertEquals("Updated Template Name", updatedTemplate.getName());
        assertEquals("Updated Description", updatedTemplate.getDescription());
        assertEquals(10, updatedTemplate.getDurationDays());
        assertEquals(2000.0, updatedTemplate.getDefaultAmount());
    }

    @Test
    public void testCreateTaskWithTemplate() {
        // Create a task with template reference
        Task task = new Task();
        task.setName("Test Task");
        task.setDescription("Test Task Description");
        task.setCategory(testCategory);
        task.setVilla(testVilla);
        task.setTeam(testTeam);
        task.setTemplate(testTemplate);
        task.setStatus(Task.TaskStatus.PENDING);
        task.setProgress(0);
        task.setProgressStatus(Task.ProgressStatus.ON_SCHEDULE);
        task.setIsReceived(false);
        task.setIsPaid(false);
        task.setStartDate(new Date());
        task.setEndDate(new Date());
        task.setPlannedStartDate(new Date());
        task.setPlannedEndDate(new Date());
        
        Task savedTask = taskService.createTask(task);

        // Verify task was created correctly with template reference
        assertNotNull(savedTask);
        assertNotNull(savedTask.getId());
        assertNotNull(savedTask.getTemplate());
        assertEquals(testTemplate.getId(), savedTask.getTemplate().getId());
    }

    @Test
    public void testCountTasksByTemplateId() {
        // Create multiple tasks from the same template
        taskService.createTaskFromTemplate(testTemplate.getId(), testCategory.getId(), testVilla.getId(), testTeam.getId());
        taskService.createTaskFromTemplate(testTemplate.getId(), testCategory.getId(), testVilla.getId(), testTeam.getId());
        taskService.createTaskFromTemplate(testTemplate.getId(), testCategory.getId(), testVilla.getId(), testTeam.getId());

        // Count tasks by template ID
        Long count = taskService.countByTemplateId(testTemplate.getId());

        // Verify count is correct
        assertEquals(3, count);
    }
}
