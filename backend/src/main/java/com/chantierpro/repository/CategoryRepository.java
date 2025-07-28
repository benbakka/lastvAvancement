package com.chantierpro.repository;

import com.chantierpro.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Use villa.id to query through the relationship
    List<Category> findByVilla_Id(Long villaId);
    
    // Team-related query removed as per requirement - team assignment is now only at task level
    
    List<Category> findByStatus(Category.CategoryStatus status);
    
    // Use villa.id to query through the relationship
    List<Category> findByVilla_IdAndStatus(Long villaId, Category.CategoryStatus status);
    
    @Query("SELECT c FROM Category c WHERE c.villa.project.id = ?1")
    List<Category> findByProjectId(Long projectId);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.villa.id = ?1")
    Long countByVillaId(Long villaId);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.villa.id = ?1 AND c.status = ?2")
    Long countByVillaIdAndStatus(Long villaId, Category.CategoryStatus status);
}