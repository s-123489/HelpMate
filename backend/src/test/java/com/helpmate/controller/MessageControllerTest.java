package com.helpmate.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.common.AuthInterceptor;
import com.helpmate.dto.SendMessageRequest;
import com.helpmate.entity.Message;
import com.helpmate.service.MessageService;
import com.helpmate.vo.ConversationVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = MessageController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@Import(com.helpmate.common.GlobalExceptionHandler.class)
class MessageControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private MessageService messageService;
    @MockBean private com.helpmate.common.JwtUtil jwtUtil;
    @MockBean private AuthInterceptor authInterceptor;
    @Autowired private ObjectMapper objectMapper;

    @BeforeEach
    void bypassInterceptor() throws Exception {
        when(authInterceptor.preHandle(
                any(HttpServletRequest.class),
                any(HttpServletResponse.class),
                any()
        )).thenAnswer(inv -> {
            HttpServletRequest req = inv.getArgument(0);
            req.setAttribute("userId", 1L);
            return true;
        });
    }

    // ===== POST /api/message/send =====

    @Test
    void send_success_returns200() throws Exception {
        Message msg = new Message();
        msg.setId(1L);
        msg.setSenderId(1L);
        msg.setReceiverId(2L);
        msg.setContent("你好");

        when(messageService.sendMessage(any(SendMessageRequest.class), eq(1L))).thenReturn(msg);

        SendMessageRequest req = new SendMessageRequest();
        req.setReceiverId(2L);
        req.setContent("你好");

        mockMvc.perform(post("/api/message/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content").value("你好"));
    }

    @Test
    void send_missingContent_returns400() throws Exception {
        SendMessageRequest req = new SendMessageRequest();
        req.setReceiverId(2L);

        mockMvc.perform(post("/api/message/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
        verify(messageService, never()).sendMessage(any(), any());
    }

    @Test
    void send_missingReceiverId_returns400() throws Exception {
        SendMessageRequest req = new SendMessageRequest();
        req.setContent("你好");

        mockMvc.perform(post("/api/message/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void send_serviceThrows_returns500() throws Exception {
        when(messageService.sendMessage(any(), any()))
                .thenThrow(new RuntimeException("不能给自己发送消息"));

        SendMessageRequest req = new SendMessageRequest();
        req.setReceiverId(1L);
        req.setContent("自己发");

        mockMvc.perform(post("/api/message/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("不能给自己发送消息"));
    }

    // ===== GET /api/message/conversation/{otherId} =====

    @Test
    void conversation_returnsMessages() throws Exception {
        Message msg = new Message();
        msg.setId(1L);
        msg.setContent("你好");

        when(messageService.getConversation(1L, 2L)).thenReturn(List.of(msg));

        mockMvc.perform(get("/api/message/conversation/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].content").value("你好"));
    }

    @Test
    void conversation_empty_returnsEmptyList() throws Exception {
        when(messageService.getConversation(1L, 2L)).thenReturn(List.of());

        mockMvc.perform(get("/api/message/conversation/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    // ===== GET /api/message/conversations =====

    @Test
    void conversations_returnsConversationList() throws Exception {
        ConversationVO vo = new ConversationVO();
        vo.setUserId(2L);
        vo.setUsername("张三");
        vo.setLastMessage("你好");

        when(messageService.getConversations(1L)).thenReturn(List.of(vo));

        mockMvc.perform(get("/api/message/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].username").value("张三"));
    }
}
