package com.chantierpro.service;

import com.chantierpro.entity.Villa;
import com.chantierpro.entity.Project;
import com.chantierpro.repository.VillaRepository;
import com.chantierpro.repository.ProjectRepository;
import com.chantierpro.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VillaService {

    @Autowired
    private VillaRepository villaRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProjectService projectService;

    public List<Villa> getAllVillas() {
        return villaRepository.findAll();
    }

    public List<Villa> getVillasByProjectId(Long projectId) {
        return villaRepository.findByProjectId(projectId);
    }

    public Optional<Villa> getVillaById(Long id) {
        return villaRepository.findById(id);
    }

    public Villa createVilla(Villa villa) {
        Project project = projectRepository.findById(villa.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        villa.setProject(project);
        Villa savedVilla = villaRepository.save(villa);
        
        // Update project stats
        projectService.updateProjectStats(project.getId());
        
        return savedVilla;
    }

    public Villa updateVilla(Long id, Villa villaDetails) {
        Villa villa = villaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Villa not found with id: " + id));

        villa.setName(villaDetails.getName());
        villa.setType(villaDetails.getType());
        villa.setSurface(villaDetails.getSurface());
        villa.setProgress(villaDetails.getProgress());
        villa.setStatus(villaDetails.getStatus());

        Villa savedVilla = villaRepository.save(villa);
        
        // Update project stats
        projectService.updateProjectStats(villa.getProject().getId());
        
        return savedVilla;
    }

    public void deleteVilla(Long id) {
        Villa villa = villaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Villa not found with id: " + id));
        
        Long projectId = villa.getProject().getId();
        villaRepository.delete(villa);
        
        // Update project stats
        projectService.updateProjectStats(projectId);
    }

    public List<Villa> searchVillas(Long projectId, String searchTerm) {
        if (projectId != null) {
            return villaRepository.findByProjectIdAndNameOrTypeContaining(projectId, searchTerm);
        }
        return villaRepository.findByNameContainingIgnoreCase(searchTerm);
    }

    public List<Villa> getVillasByStatus(Villa.VillaStatus status) {
        return villaRepository.findByStatus(status);
    }

    @Transactional
    public void updateVillaStats(Long villaId) {
        Villa villa = villaRepository.findById(villaId)
                .orElseThrow(() -> new RuntimeException("Villa not found with id: " + villaId));

        // Update categories count
        Long categoriesCount = categoryRepository.countByVillaId(villaId);
        villa.setCategoriesCount(categoriesCount.intValue());

        // Calculate progress based on categories
        // This is a simplified calculation
        Long completedCategories = categoryRepository.countByVillaIdAndStatus(villaId, 
                com.chantierpro.entity.Category.CategoryStatus.ON_SCHEDULE);
        
        if (categoriesCount > 0) {
            int progress = (int) ((completedCategories * 100) / categoriesCount);
            villa.setProgress(progress);
            
            // Update status based on progress
            if (progress == 100) {
                villa.setStatus(Villa.VillaStatus.COMPLETED);
            } else if (progress > 0) {
                villa.setStatus(Villa.VillaStatus.IN_PROGRESS);
            }
        }

        villaRepository.save(villa);
        
        // Update project stats
        projectService.updateProjectStats(villa.getProject().getId());
    }
}