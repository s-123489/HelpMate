package com.helpmate.controller;

import com.helpmate.common.AuthInterceptor;
import com.helpmate.entity.Notification;
import com.helpmate.mapper.NotificationMapper;
import com.helpmate.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {HealthController.class, NotificationController.class},
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@Import(com.helpmate.common.GlobalExceptionHandler.class)
class HealthAndNotificationControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private NotificationService notificationService;
    @MockBean private NotificationMapper notificationMapper;
    @MockBean private com.helpmate.common.JwtUtil jwtUtil;
    @MockBean private AuthInterceptor authInterceptor;

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

    // ===== GET /health =====

    @Test
    void health_returnsOk() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    // ===== GET /api/notification/list =====

    @Test
    void list_returnsNotifications() throws Exception {
        Notification n = new Notification();
        n.setId(1L);
        n.setTitle("新消息");
        n.setIsRead(0);

        when(notificationMapper.selectList(any())).thenReturn(List.of(n));

        mockMvc.perform(get("/api/notification/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].title").value("新消息"));
    }

    @Test
    void list_empty_returnsEmptyList() throws Exception {
        when(notificationMapper.selectList(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/notification/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    // ===== POST /api/notification/{id}/read =====

    @Test
    void markRead_returns200() throws Exception {
        when(notificationMapper.update(any(), any())).thenReturn(1);

        mockMvc.perform(post("/api/notification/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("已标记"));
    }

    // ===== POST /api/notification/read-all =====

    @Test
    void readAll_returns200() throws Exception {
        when(notificationMapper.update(any(), any())).thenReturn(3);

        mockMvc.perform(post("/api/notification/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("全部已读"));
    }
}
