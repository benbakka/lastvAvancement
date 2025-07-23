package com.chantierpro.repository;

import com.chantierpro.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByVillaId(Long villaId);
    
    List<Category> findByTeamId(Long teamId);
    
    List<Category> findByStatus(Category.CategoryStatus status);
    
    List<Category> findByVillaIdAndStatus(Long villaId, Category.CategoryStatus status);
    
    @Query("SELECT c FROM Category c WHERE c.villa.project.id = ?1")
    List<Category> findByProjectId(Long projectId);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.villa.id = ?1")
    Long countByVillaId(Long villaId);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.villa.id = ?1 AND c.status = ?2")
    Long countByVillaIdAndStatus(Long villaId, Category.CategoryStatus status);
}