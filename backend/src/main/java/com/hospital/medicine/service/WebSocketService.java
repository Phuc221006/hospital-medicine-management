package com.hospital.medicine.service;

import com.hospital.medicine.entity.User;
import com.hospital.medicine.entity.enums.Role;
import com.hospital.medicine.repository.UserRepository;
import com.hospital.medicine.websocket.WebSocketHandler;
import com.hospital.medicine.websocket.WebSocketMessage;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WebSocketService {

    private final WebSocketHandler webSocketHandler;
    private final UserRepository userRepository;

    public WebSocketService(WebSocketHandler webSocketHandler, UserRepository userRepository) {
        this.webSocketHandler = webSocketHandler;
        this.userRepository = userRepository;
    }

    // Send notification to a specific user
    public void notifyUser(Long userId, String type, Object payload) {
        webSocketHandler.sendToUser(userId, new WebSocketMessage(type, payload));
    }

    // Broadcast to all connected users
    public void broadcast(String type, Object payload) {
        webSocketHandler.broadcast(new WebSocketMessage(type, payload));
    }

    // Send alert to all admins
    public void notifyAdmins(String type, Object payload) {
        Set<Long> adminIds = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .map(User::getId)
                .collect(Collectors.toSet());
        
        webSocketHandler.broadcastToAdmins(new WebSocketMessage(type, payload), adminIds);
    }

    // Send stock low alert
    public void sendStockLowAlert(Object medicine) {
        notifyAdmins(WebSocketMessage.STOCK_LOW, medicine);
    }

    // Send expiring stock alert
    public void sendExpiringStockAlert(Object data) {
        notifyAdmins(WebSocketMessage.STOCK_EXPIRING, data);
    }

    // Send new alert notification
    public void sendNewAlert(Object alert) {
        notifyAdmins(WebSocketMessage.ALERT_NEW, alert);
    }

    // Send prescription update to patient
    public void sendPrescriptionUpdate(Long patientId, Object prescription) {
        notifyUser(patientId, WebSocketMessage.PRESCRIPTION_UPDATE, prescription);
    }

    // Send appointment update to patient
    public void sendAppointmentUpdate(Long patientId, Object appointment) {
        notifyUser(patientId, WebSocketMessage.APPOINTMENT_UPDATE, appointment);
    }

    // Send general notification
    public void sendNotification(Long userId, String title, String message) {
        webSocketHandler.sendToUser(userId, WebSocketMessage.notification(title, message));
    }
}
