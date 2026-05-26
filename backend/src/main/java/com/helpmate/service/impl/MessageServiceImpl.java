package com.helpmate.service.impl;

import com.helpmate.dto.SendMessageRequest;
import com.helpmate.entity.Message;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.MessageMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.MessageService;
import com.helpmate.service.NotificationService;
import com.helpmate.vo.ConversationVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired private MessageMapper messageMapper;
    @Autowired private UserMapper userMapper;
    @Autowired private TaskMapper taskMapper;
    @Autowired private NotificationService notificationService;

    @Override
    @Transactional
    public Message sendMessage(SendMessageRequest request, Long senderId) {
        // 不能给自己发消息
        if (senderId.equals(request.getReceiverId())) {
            throw new RuntimeException("不能给自己发送消息");
        }

        Message msg = new Message();
        msg.setSenderId(senderId);
        msg.setReceiverId(request.getReceiverId());
        msg.setTaskId(request.getTaskId());
        msg.setContent(request.getContent());
        msg.setIsRead(false);
        messageMapper.insert(msg);

        // 复用现有 NotificationService 实时推送给接收方
        try {
            User sender = userMapper.selectById(senderId);
            String senderName = sender != null ? sender.getUsername() : "用户";
            notificationService.push(
                    request.getReceiverId(),
                    "message",
                    "新消息",
                    senderName + " 发来了消息",
                    msg.getId()
            );
        } catch (Exception ignored) {
            // 推送失败不影响消息存储
        }

        return msg;
    }

    @Override
    @Transactional
    public List<Message> getConversation(Long myId, Long otherId) {
        // 标记对方发给我的消息为已读
        messageMapper.markAsRead(otherId, myId);
        return messageMapper.findConversation(myId, otherId);
    }

    @Override
    public List<ConversationVO> getConversations(Long myId) {
        List<Message> latestMessages = messageMapper.findLatestMessagesPerConversation(myId);
        if (latestMessages.isEmpty()) return Collections.emptyList();

        // 收集所有对方 userId
        Set<Long> otherUserIds = latestMessages.stream()
                .map(m -> m.getSenderId().equals(myId) ? m.getReceiverId() : m.getSenderId())
                .collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(otherUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // 收集所有 taskId（可能为 null）
        Set<Long> taskIds = latestMessages.stream()
                .map(Message::getTaskId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Task> taskMap = taskIds.isEmpty()
                ? Collections.emptyMap()
                : taskMapper.selectBatchIds(taskIds).stream()
                .collect(Collectors.toMap(Task::getId, t -> t));

        return latestMessages.stream().map(msg -> {
            Long otherId = msg.getSenderId().equals(myId) ? msg.getReceiverId() : msg.getSenderId();
            User other = userMap.get(otherId);

            ConversationVO vo = new ConversationVO();
            vo.setUserId(otherId);
            vo.setUsername(other != null ? other.getUsername() : "未知用户");
            vo.setLastMessage(msg.getContent());
            vo.setLastTime(msg.getCreatedAt());
            vo.setUnreadCount(messageMapper.countUnread(otherId, myId));

            if (msg.getTaskId() != null) {
                Task task = taskMap.get(msg.getTaskId());
                vo.setTaskId(msg.getTaskId());
                vo.setTaskTitle(task != null ? task.getTitle() : null);
            }

            return vo;
        }).collect(Collectors.toList());
    }
}