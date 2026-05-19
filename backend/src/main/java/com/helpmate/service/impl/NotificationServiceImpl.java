package com.helpmate.service.impl;

import com.helpmate.entity.Notification;
import com.helpmate.mapper.NotificationMapper;
import com.helpmate.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    @Autowired
    private NotificationMapper notificationMapper;

    @Override
    public void subscribe(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));
    }

    @Override
    public void push(Long userId, String type, String title, String content, Long relatedId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setIsRead(0);
        notification.setRelatedId(relatedId);
        notificationMapper.insert(notification);

        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(type)
                        .data(Map.of(
                                "id", notification.getId(),
                                "title", title,
                                "content", content,
                                "relatedId", relatedId != null ? relatedId : ""
                        )));
            } catch (IOException e) {
                log.warn("SSE 推送失败, userId={}", userId);
                emitters.remove(userId);
            }
        }
    }
}
