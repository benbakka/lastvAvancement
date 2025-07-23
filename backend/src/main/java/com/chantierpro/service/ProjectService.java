package com.chantierpro.service;

import com.chantierpro.entity.Project;
import com.chantierpro.repository.ProjectRepository;
import com.chantierpro.repository.VillaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private VillaRepository villaRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAllOrderByCreatedAtDesc();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setName(projectDetails.getName());
        project.setType(projectDetails.getType());
        project.setLocation(projectDetails.getLocation());
        project.setStartDate(projectDetails.getStartDate());
        project.setEndDate(projectDetails.getEndDate());
        project.setStatus(projectDetails.getStatus());
        project.setProgress(projectDetails.getProgress());

        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        projectRepository.delete(project);
    }

    public List<Project> searchProjects(String searchTerm) {
        return projectRepository.findByNameOrLocationContaining(searchTerm);
    }

    public List<Project> getProjectsByStatus(Project.ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    @Transactional
    public void updateProjectStats(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Update villas count
        Long villasCount = villaRepository.countByProjectId(projectId);
        project.setVillasCount(villasCount.intValue());

        // Calculate overall progress (this is a simplified calculation)
        // In a real scenario, you might want to calculate based on villa progress
        Long completedVillas = villaRepository.countByProjectIdAndStatus(projectId, 
                com.chantierpro.entity.Villa.VillaStatus.COMPLETED);
        
        if (villasCount > 0) {
            int progress = (int) ((completedVillas * 100) / villasCount);
            project.setProgress(progress);
        }

        projectRepository.save(project);
    }
}