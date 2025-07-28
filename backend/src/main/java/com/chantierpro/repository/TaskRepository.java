package com.chantierpro.repository;

import com.chantierpro.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    @Query("SELECT t FROM Task t WHERE t.category.id = ?1")
    List<Task> findByCategoryId(Long categoryId);
    
    @Query("SELECT t FROM Task t WHERE t.villa.id = ?1")
    List<Task> findByVillaId(Long villaId);
    
    @Query("SELECT t FROM Task t WHERE t.team.id = ?1")
    List<Task> findByTeamId(Long teamId);
    
    List<Task> findByStatus(Task.TaskStatus status);
    
    List<Task> findByProgressStatus(Task.ProgressStatus progressStatus);
    
    List<Task> findByIsReceivedFalseAndStatus(Task.TaskStatus status);
    
    List<Task> findByIsPaidFalse();
    
    @Query("SELECT t FROM Task t WHERE t.category.villa.project.id = ?1")
    List<Task> findByProjectId(Long projectId);
    
    @Query("SELECT t FROM Task t WHERE t.category.villa.project.id = ?1 AND t.status = ?2")
    List<Task> findByProjectIdAndStatus(Long projectId, Task.TaskStatus status);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.category.id = ?1")
    Long countByCategoryId(Long categoryId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.category.id = ?1 AND t.status = 'COMPLETED'")
    Long countCompletedByCategoryId(Long categoryId);
    
    @Query("SELECT t FROM Task t ORDER BY t.updatedAt DESC")
    List<Task> findAllOrderByUpdatedAtDesc();
    
    @Query("SELECT SUM(t.amount) FROM Task t WHERE t.category.villa.project.id = ?1")
    Double getTotalAmountByProjectId(Long projectId);
    
    @Query("SELECT SUM(t.amount) FROM Task t WHERE t.category.villa.project.id = ?1 AND t.isPaid = true")
    Double getPaidAmountByProjectId(Long projectId);
    
    @Query("SELECT t FROM Task t WHERE t.category.id = ?1 AND t.villa.id = ?2")
    List<Task> findByCategoryIdAndVillaId(Long categoryId, Long villaId);
    
    // TaskTemplate related methods
    List<Task> findByTemplateId(Long templateId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.template.id = ?1")
    Long countByTemplateId(Long templateId);
    
    @Query("SELECT t FROM Task t WHERE t.template.id = ?1 AND t.status = ?2")
    List<Task> findByTemplateIdAndStatus(Long templateId, Task.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.template.id = ?1 AND t.team.id = ?2")
    List<Task> findByTemplateIdAndTeamId(Long templateId, Long teamId);
}