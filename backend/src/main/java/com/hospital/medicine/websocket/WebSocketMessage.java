package com.hospital.medicine.websocket;

import java.time.LocalDateTime;

public class WebSocketMessage {
    private String type;
    private Object payload;
    private LocalDateTime timestamp;

    public WebSocketMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public WebSocketMessage(String type, Object payload) {
        this.type = type;
        this.payload = payload;
        this.timestamp = LocalDateTime.now();
    }

    // Message types
    public static final String ALERT_NEW = "ALERT_NEW";
    public static final String ALERT_UPDATE = "ALERT_UPDATE";
    public static final String STOCK_LOW = "STOCK_LOW";
    public static final String STOCK_EXPIRING = "STOCK_EXPIRING";
    public static final String PRESCRIPTION_NEW = "PRESCRIPTION_NEW";
    public static final String PRESCRIPTION_UPDATE = "PRESCRIPTION_UPDATE";
    public static final String APPOINTMENT_NEW = "APPOINTMENT_NEW";
    public static final String APPOINTMENT_UPDATE = "APPOINTMENT_UPDATE";
    public static final String NOTIFICATION = "NOTIFICATION";

    // Factory methods
    public static WebSocketMessage alertNew(Object alert) {
        return new WebSocketMessage(ALERT_NEW, alert);
    }

    public static WebSocketMessage stockLow(Object medicine) {
        return new WebSocketMessage(STOCK_LOW, medicine);
    }

    public static WebSocketMessage stockExpiring(Object data) {
        return new WebSocketMessage(STOCK_EXPIRING, data);
    }

    public static WebSocketMessage prescriptionUpdate(Object prescription) {
        return new WebSocketMessage(PRESCRIPTION_UPDATE, prescription);
    }

    public static WebSocketMessage notification(String title, String message) {
        return new WebSocketMessage(NOTIFICATION, new NotificationPayload(title, message));
    }

    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    // Inner class for notification payload
    public static class NotificationPayload {
        private String title;
        private String message;

        public NotificationPayload(String title, String message) {
            this.title = title;
            this.message = message;
        }

        public String getTitle() {
            return title;
        }

        public String getMessage() {
            return message;
        }
    }
}
