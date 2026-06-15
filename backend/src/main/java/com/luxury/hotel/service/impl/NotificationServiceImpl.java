package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.NotificationDTO;
import com.luxury.hotel.entity.Notification;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.NotificationRepository;
import com.luxury.hotel.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setReadStatus(true);
        Notification saved = notificationRepository.save(notification);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notif -> notif.setReadStatus(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationDTO convertToDto(Notification notification) {
        NotificationDTO dto = modelMapper.map(notification, NotificationDTO.class);
        dto.setUserId(notification.getUser().getId());
        return dto;
    }
}
