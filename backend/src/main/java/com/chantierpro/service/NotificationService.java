package com.chantierpro.service;

import com.chantierpro.entity.Notification;
import com.chantierpro.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllOrderByCreatedAtDesc();
    }

    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findUnreadOrderByPriorityAndDate();
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        List<Notification> unreadNotifications = notificationRepository.findByIsReadFalse();
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notificationRepository.delete(notification);
    }

    public List<Notification> getNotificationsByType(Notification.NotificationType type) {
        return notificationRepository.findByType(type);
    }

    public List<Notification> getNotificationsByPriority(Notification.Priority priority) {
        return notificationRepository.findByPriority(priority);
    }

    public List<Notification> getNotificationsByProjectId(Long projectId) {
        return notificationRepository.findByProjectId(projectId);
    }

    public Long getUnreadCount() {
        return notificationRepository.countUnread();
    }

    public Long getUnreadCountByPriority(Notification.Priority priority) {
        return notificationRepository.countUnreadByPriority(priority);
    }

    // Helper methods to create specific types of notifications
    public Notification createDelayNotification(String title, String message, Long projectId, Long villaId, Long taskId) {
        Notification notification = new Notification();
        notification.setType(Notification.NotificationType.DELAY);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPriority(Notification.Priority.HIGH);
        
        // Set related entities if provided
        // You would need to fetch and set the actual entities here
        
        return notificationRepository.save(notification);
    }

    public Notification createDeadlineNotification(String title, String message, Long projectId, Long villaId) {
        Notification notification = new Notification();
        notification.setType(Notification.NotificationType.DEADLINE);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPriority(Notification.Priority.MEDIUM);
        
        return notificationRepository.save(notification);
    }

    public Notification createUnreceivedNotification(String title, String message, Long projectId, Long villaId) {
        Notification notification = new Notification();
        notification.setType(Notification.NotificationType.UNRECEIVED);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPriority(Notification.Priority.MEDIUM);
        
        return notificationRepository.save(notification);
    }
}