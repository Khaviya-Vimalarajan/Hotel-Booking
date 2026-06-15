package com.luxury.hotel.service;

import com.luxury.hotel.dto.NotificationDTO;
import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getNotificationsByUserId(Long userId);
    NotificationDTO markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
