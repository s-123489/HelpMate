package com.helpmate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskServiceImpl taskService;

    private CreateTaskRequest buildRequest(String title, String category, BigDecimal reward) {
        CreateTaskRequest req = new CreateTaskRequest();
        req.setTitle(title);
        req.setCategory(category);
        req.setReward(reward);
        req.setDescription("测试描述");
        req.setLocation("宿舍楼");
        req.setDeadline("明天");
        return req;
    }

    // ===== createTask =====

    @Test
    void createTask_success_returnsId() {
        when(taskMapper.<Task>insert(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(42L);
            return 1;
        });

        CreateTaskRequest req = buildRequest("帮我取快递", "EXPRESS", new BigDecimal("5.00"));
        Long id = taskService.createTask(req, 1L);

        assertEquals(42L, id);
        verify(taskMapper).<Task>insert(any(Task.class));
    }

    @Test
    void createTask_setsPublisherIdAndStatus() {
        when(taskMapper.<Task>insert(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            assertEquals(99L, t.getPublisherId());
            assertEquals(0, t.getStatus()); // 初始状态=待接单
            return 1;
        });

        CreateTaskRequest req = buildRequest("送餐", "FOOD", new BigDecimal("10.00"));
        taskService.createTask(req, 99L);
    }

    @Test
    void createTask_setsAllFieldsFromRequest() {
        when(taskMapper.<Task>insert(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            assertEquals("帮我买东西", t.getTitle());
            assertEquals("PURCHASE", t.getCategory());
            assertEquals(new BigDecimal("15.00"), t.getReward());
            assertEquals("超市门口", t.getLocation());
            return 1;
        });

        CreateTaskRequest req = buildRequest("帮我买东西", "PURCHASE", new BigDecimal("15.00"));
        req.setLocation("超市门口");
        taskService.createTask(req, 1L);
    }

    // ===== listTasks =====

    @Test
    void listTasks_noCategory_returnsAllPendingTasks() {
        Task t1 = new Task(); t1.setId(1L); t1.setStatus(0);
        Task t2 = new Task(); t2.setId(2L); t2.setStatus(0);
        Page<Task> mockPage = new Page<>(1, 10);
        mockPage.setRecords(List.of(t1, t2));
        mockPage.setTotal(2);

        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(mockPage);

        Page<Task> result = taskService.listTasks(1, 10, null);

        assertEquals(2, result.getRecords().size());
        assertEquals(2, result.getTotal());
    }

    @Test
    void listTasks_withCategory_filtersCorrectly() {
        Task t = new Task(); t.setId(3L); t.setCategory("EXPRESS");
        Page<Task> mockPage = new Page<>(1, 10);
        mockPage.setRecords(List.of(t));
        mockPage.setTotal(1);

        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(mockPage);

        Page<Task> result = taskService.listTasks(1, 10, "EXPRESS");

        assertEquals(1, result.getRecords().size());
        assertEquals("EXPRESS", result.getRecords().get(0).getCategory());
    }

    @Test
    void listTasks_emptyResult_returnsEmptyPage() {
        Page<Task> mockPage = new Page<>(1, 10);
        mockPage.setRecords(List.of());
        mockPage.setTotal(0);

        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(mockPage);

        Page<Task> result = taskService.listTasks(1, 10, "OTHER");

        assertTrue(result.getRecords().isEmpty());
        assertEquals(0, result.getTotal());
    }

    @Test
    void listTasks_pageParamsPassedCorrectly() {
        Page<Task> mockPage = new Page<>(2, 5);
        mockPage.setTotal(0);

        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenAnswer(inv -> {
            Page<Task> p = inv.getArgument(0);
            assertEquals(2L, p.getCurrent());
            assertEquals(5L, p.getSize());
            return mockPage;
        });

        taskService.listTasks(2, 5, null);
    }
}
