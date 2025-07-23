package com.chantierpro.controller;

import com.chantierpro.entity.Notification;
import com.chantierpro.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        List<Notification> notifications = notificationService.getUnreadNotifications();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(notification -> ResponseEntity.ok().body(notification))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@Valid @RequestBody Notification notification) {
        Notification createdNotification = notificationService.createNotification(notification);
        return ResponseEntity.ok(createdNotification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        try {
            Notification updatedNotification = notificationService.markAsRead(id);
            return ResponseEntity.ok(updatedNotification);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Notification>> getNotificationsByType(@PathVariable Notification.NotificationType type) {
        List<Notification> notifications = notificationService.getNotificationsByType(type);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Notification>> getNotificationsByPriority(@PathVariable Notification.Priority priority) {
        List<Notification> notifications = notificationService.getNotificationsByPriority(priority);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Notification>> getNotificationsByProjectId(@PathVariable Long projectId) {
        List<Notification> notifications = notificationService.getNotificationsByProjectId(projectId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Long>> getNotificationCounts() {
        Map<String, Long> stats = Map.of(
            "unreadCount", notificationService.getUnreadCount(),
            "highPriorityCount", notificationService.getUnreadCountByPriority(Notification.Priority.HIGH),
            "criticalCount", notificationService.getUnreadCountByPriority(Notification.Priority.CRITICAL)
        );
        return ResponseEntity.ok(stats);
    }
}