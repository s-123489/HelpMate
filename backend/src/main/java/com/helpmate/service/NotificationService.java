package com.helpmate.service;

public interface NotificationService {

    void push(Long userId, String type, String title, String content, Long relatedId);

    void subscribe(Long userId, org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter);
}
