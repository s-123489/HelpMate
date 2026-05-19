package com.helpmate.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.helpmate.common.Result;
import com.helpmate.entity.Notification;
import com.helpmate.mapper.NotificationMapper;
import com.helpmate.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationMapper notificationMapper;

    /** SSE 长连接订阅 */
    @GetMapping("/subscribe")
    public SseEmitter subscribe(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        notificationService.subscribe(userId, emitter);
        return emitter;
    }

    /** 获取未读消息列表 */
    @GetMapping("/list")
    public Result<List<Notification>> list(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<Notification> list = notificationMapper.selectList(
                new LambdaQueryWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .orderByDesc(Notification::getCreatedAt)
                        .last("LIMIT 50")
        );
        return Result.success(list);
    }

    /** 标记消息已读 */
    @PostMapping("/{id}/read")
    public Result<Void> markRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        notificationMapper.update(null, new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getId, id)
                .eq(Notification::getUserId, userId)
                .set(Notification::getIsRead, 1));
        return Result.success("已标记");
    }

    /** 全部已读 */
    @PostMapping("/read-all")
    public Result<Void> readAll(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        notificationMapper.update(null, new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0)
                .set(Notification::getIsRead, 1));
        return Result.success("全部已读");
    }
}
