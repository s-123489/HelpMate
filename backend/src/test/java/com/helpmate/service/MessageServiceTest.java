package com.helpmate.service;

import com.helpmate.dto.SendMessageRequest;
import com.helpmate.entity.Message;
import com.helpmate.entity.User;
import com.helpmate.mapper.MessageMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.impl.MessageServiceImpl;
import com.helpmate.vo.ConversationVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock private MessageMapper messageMapper;
    @Mock private UserMapper userMapper;
    @Mock private TaskMapper taskMapper;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private MessageServiceImpl messageService;

    // ===== sendMessage =====

    @Test
    void sendMessage_success_returnsMessage() {
        User sender = new User(); sender.setId(1L); sender.setUsername("alice");
        when(userMapper.selectById(1L)).thenReturn(sender);
        when(messageMapper.insert(any(Message.class))).thenAnswer(inv -> {
            Message m = inv.getArgument(0);
            m.setId(10L);
            return 1;
        });

        SendMessageRequest req = new SendMessageRequest();
        req.setReceiverId(2L);
        req.setContent("你好");

        Message result = messageService.sendMessage(req, 1L);

        assertEquals("你好", result.getContent());
        assertEquals(1L, result.getSenderId());
        assertEquals(2L, result.getReceiverId());
        assertFalse(result.getIsRead());
        verify(messageMapper).insert(any(Message.class));
    }

    @Test
    void sendMessage_toSelf_throws() {
        SendMessageRequest req = new SendMessageRequest();
        req.setReceiverId(1L);
        req.setContent("给自己");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> messageService.sendMessage(req, 1L));
        assertEquals("不能给自己发送消息", ex.getMessage());
        verify(messageMapper, never()).insert(any());
    }

    @Test
    void sendMessage_notificationFailure_doesNotThrow() {
        when(messageMapper.insert(any(Message.class))).thenReturn(1);
        when(userMapper.selectById(1L)).thenReturn(null);
        doThrow(new RuntimeException("push failed"))
                .when(notificationService).push(anyLong(), anyString(), anyString(), anyString(), any());

        SendMessageRequest req = new SendMessageRequest();
        req.setReceiverId(2L);
        req.setContent("测试");

        assertDoesNotThrow(() -> messageService.sendMessage(req, 1L));
    }

    // ===== getConversation =====

    @Test
    void getConversation_returnsMessages() {
        Message m = new Message(); m.setId(1L); m.setContent("你好");
        when(messageMapper.findConversation(1L, 2L)).thenReturn(List.of(m));

        List<Message> result = messageService.getConversation(1L, 2L);

        assertEquals(1, result.size());
        verify(messageMapper).markAsRead(2L, 1L);
    }

    @Test
    void getConversation_empty_returnsEmpty() {
        when(messageMapper.findConversation(1L, 2L)).thenReturn(List.of());
        assertTrue(messageService.getConversation(1L, 2L).isEmpty());
    }

    // ===== getConversations =====

    @Test
    void getConversations_empty_returnsEmptyList() {
        when(messageMapper.findLatestMessagesPerConversation(1L)).thenReturn(Collections.emptyList());
        assertTrue(messageService.getConversations(1L).isEmpty());
    }

    @Test
    void getConversations_returnsConversationVOs() {
        Message msg = new Message();
        msg.setId(1L);
        msg.setSenderId(2L);
        msg.setReceiverId(1L);
        msg.setContent("最新消息");
        msg.setCreatedAt(LocalDateTime.now());

        User other = new User(); other.setId(2L); other.setUsername("bob");

        when(messageMapper.findLatestMessagesPerConversation(1L)).thenReturn(List.of(msg));
        when(userMapper.selectBatchIds(anyCollection())).thenReturn(List.of(other));
        when(messageMapper.countUnread(2L, 1L)).thenReturn(3);

        List<ConversationVO> result = messageService.getConversations(1L);

        assertEquals(1, result.size());
        assertEquals("bob", result.get(0).getUsername());
        assertEquals("最新消息", result.get(0).getLastMessage());
        assertEquals(3, result.get(0).getUnreadCount());
    }
}
