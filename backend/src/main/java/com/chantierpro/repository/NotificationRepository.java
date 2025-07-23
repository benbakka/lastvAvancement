package com.chantierpro.repository;

import com.chantierpro.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByIsReadFalse();
    
    List<Notification> findByType(Notification.NotificationType type);
    
    List<Notification> findByPriority(Notification.Priority priority);
    
    List<Notification> findByProjectId(Long projectId);
    
    List<Notification> findByVillaId(Long villaId);
    
    List<Notification> findByTaskId(Long taskId);
    
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT n FROM Notification n WHERE n.isRead = false ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findUnreadOrderByPriorityAndDate();
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false")
    Long countUnread();
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false AND n.priority = ?1")
    Long countUnreadByPriority(Notification.Priority priority);
}