package com.klh.soa.prerequisite.model;

import java.time.LocalDateTime;

public class LmsWebhookEvent {
    private String eventId;
    private LocalDateTime timestamp;
    private String targetLms;      // CANVAS_LMS_LTI, COURSERA_SKILL_GRAPH, MOODLE_ADAPTIVE_ENGINE
    private String eventType;      // PREREQUISITE_UNLOCKED, ZPD_REMEDIATION_ALERT, BKT_MASTERY_ACHIEVED
    private String nodeCode;
    private String skillTitle;
    private String deliveryStatus; // 200_DELIVERED
    private String jsonPayloadPreview;

    public LmsWebhookEvent() {}

    public LmsWebhookEvent(String eventId, LocalDateTime timestamp, String targetLms,
                           String eventType, String nodeCode, String skillTitle,
                           String deliveryStatus, String jsonPayloadPreview) {
        this.eventId = eventId;
        this.timestamp = timestamp;
        this.targetLms = targetLms;
        this.eventType = eventType;
        this.nodeCode = nodeCode;
        this.skillTitle = skillTitle;
        this.deliveryStatus = deliveryStatus;
        this.jsonPayloadPreview = jsonPayloadPreview;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getTargetLms() { return targetLms; }
    public void setTargetLms(String targetLms) { this.targetLms = targetLms; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getNodeCode() { return nodeCode; }
    public void setNodeCode(String nodeCode) { this.nodeCode = nodeCode; }

    public String getSkillTitle() { return skillTitle; }
    public void setSkillTitle(String skillTitle) { this.skillTitle = skillTitle; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public String getJsonPayloadPreview() { return jsonPayloadPreview; }
    public void setJsonPayloadPreview(String jsonPayloadPreview) { this.jsonPayloadPreview = jsonPayloadPreview; }
}
