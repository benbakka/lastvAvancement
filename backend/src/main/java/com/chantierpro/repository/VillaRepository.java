package com.chantierpro.repository;

import com.chantierpro.entity.Villa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VillaRepository extends JpaRepository<Villa, Long> {
    
    List<Villa> findByProjectId(Long projectId);
    
    List<Villa> findByStatus(Villa.VillaStatus status);
    
    List<Villa> findByProjectIdAndStatus(Long projectId, Villa.VillaStatus status);
    
    List<Villa> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT v FROM Villa v WHERE v.project.id = ?1 AND (v.name LIKE %?2% OR v.type LIKE %?2%)")
    List<Villa> findByProjectIdAndNameOrTypeContaining(Long projectId, String searchTerm);
    
    @Query("SELECT COUNT(v) FROM Villa v WHERE v.project.id = ?1")
    Long countByProjectId(Long projectId);
    
    @Query("SELECT COUNT(v) FROM Villa v WHERE v.project.id = ?1 AND v.status = ?2")
    Long countByProjectIdAndStatus(Long projectId, Villa.VillaStatus status);
}