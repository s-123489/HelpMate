package com.helpmate.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.common.AuthInterceptor;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.service.TaskService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TaskController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@Import(com.helpmate.common.GlobalExceptionHandler.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @MockBean
    private com.helpmate.common.JwtUtil jwtUtil;

    // Mock 掉拦截器，让所有请求直接放行
    @MockBean
    private AuthInterceptor authInterceptor;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void bypassInterceptor() throws Exception {
        when(authInterceptor.preHandle(
                any(HttpServletRequest.class),
                any(HttpServletResponse.class),
                any()
        )).thenAnswer(inv -> {
            // 模拟拦截器写入 userId 属性，供 createTask 使用
            HttpServletRequest req = inv.getArgument(0);
            req.setAttribute("userId", 1L);
            return true;
        });
    }

    private CreateTaskRequest validRequest() {
        CreateTaskRequest req = new CreateTaskRequest();
        req.setTitle("帮我取快递");
        req.setCategory("EXPRESS");
        req.setReward(new BigDecimal("5.00"));
        req.setLocation("南门");
        req.setDeadline("今天18点");
        return req;
    }

    // ===== POST /api/task/create =====

    @Test
    void createTask_withValidToken_returns200() throws Exception {
        when(taskService.createTask(any(CreateTaskRequest.class), eq(1L))).thenReturn(10L);

        mockMvc.perform(post("/api/task/create")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("发布成功"))
                .andExpect(jsonPath("$.data").value(10));
    }

    @Test
    void createTask_missingTitle_returns400() throws Exception {
        CreateTaskRequest req = validRequest();
        req.setTitle("");

        mockMvc.perform(post("/api/task/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));

        verify(taskService, never()).createTask(any(), any());
    }

    @Test
    void createTask_missingCategory_returns400() throws Exception {
        CreateTaskRequest req = validRequest();
        req.setCategory("");

        mockMvc.perform(post("/api/task/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void createTask_rewardTooLow_returns400() throws Exception {
        CreateTaskRequest req = validRequest();
        req.setReward(new BigDecimal("0.00"));

        mockMvc.perform(post("/api/task/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    // ===== GET /api/task/list =====

    @Test
    void listTasks_noParams_returnsDefaultPage() throws Exception {
        Task t1 = new Task();
        t1.setId(1L);
        t1.setTitle("任务1");
        t1.setStatus(0);
        Page<Task> page = new Page<>(1, 10);
        page.setRecords(List.of(t1));
        page.setTotal(1);

        when(taskService.listTasks(1, 10, null)).thenReturn(page);

        mockMvc.perform(get("/api/task/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.records[0].id").value(1));
    }

    @Test
    void listTasks_withCategoryFilter_returnsFiltered() throws Exception {
        Task t = new Task();
        t.setId(2L);
        t.setCategory("FOOD");
        t.setStatus(0);
        Page<Task> page = new Page<>(1, 10);
        page.setRecords(List.of(t));
        page.setTotal(1);

        when(taskService.listTasks(1, 10, "FOOD")).thenReturn(page);

        mockMvc.perform(get("/api/task/list").param("category", "FOOD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records[0].category").value("FOOD"));
    }

    @Test
    void listTasks_emptyResult_returnsEmptyRecords() throws Exception {
        Page<Task> page = new Page<>(1, 10);
        page.setRecords(List.of());
        page.setTotal(0);

        when(taskService.listTasks(anyInt(), anyInt(), isNull())).thenReturn(page);

        mockMvc.perform(get("/api/task/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(0))
                .andExpect(jsonPath("$.data.records").isEmpty());
    }
}
