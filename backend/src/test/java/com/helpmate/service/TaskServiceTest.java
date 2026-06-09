package com.helpmate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.NotificationService;
import com.helpmate.service.WalletService;
import com.helpmate.service.impl.TaskServiceImpl;
import com.helpmate.vo.TaskListVO;
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

    @Mock
    private UserMapper userMapper;

    @Mock
    private WalletService walletService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private OrderInfoMapper orderInfoMapper;

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
        Task t1 = new Task(); t1.setId(1L); t1.setStatus(0); t1.setPublisherId(1L);
        Task t2 = new Task(); t2.setId(2L); t2.setStatus(0); t2.setPublisherId(2L);
        List<Task> taskRecords = List.of(t1, t2);

        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenAnswer(inv -> {
                    Page<Task> p = inv.getArgument(0);
                    p.setRecords(taskRecords);
                    p.setTotal(taskRecords.size());
                    return p;
                });
        when(userMapper.selectBatchIds(anyList()))
                .thenReturn(List.of());

        Page<TaskListVO> result = taskService.listTasks(1, 10, null);

        assertEquals(2, result.getRecords().size());
        assertEquals(2, result.getTotal());
    }

    @Test
    void listTasks_withCategory_filtersCorrectly() {
        Task t = new Task(); t.setId(3L); t.setCategory("EXPRESS"); t.setPublisherId(3L);
        List<Task> taskRecords = List.of(t);

        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenAnswer(inv -> {
                    Page<Task> p = inv.getArgument(0);
                    p.setRecords(taskRecords);
                    p.setTotal(taskRecords.size());
                    return p;
                });
        when(userMapper.selectBatchIds(anyList()))
                .thenReturn(List.of());

        Page<TaskListVO> result = taskService.listTasks(1, 10, "EXPRESS");

        assertEquals(1, result.getRecords().size());
        assertEquals("EXPRESS", result.getRecords().get(0).getCategory());
    }

    @Test
    void listTasks_emptyResult_returnsEmptyPage() {
        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenAnswer(inv -> {
                    Page<Task> p = inv.getArgument(0);
                    p.setRecords(List.of());
                    p.setTotal(0);
                    return p;
                });

        Page<TaskListVO> result = taskService.listTasks(1, 10, "OTHER");

        assertTrue(result.getRecords().isEmpty());
        assertEquals(0, result.getTotal());
    }

    @Test
    void listTasks_pageParamsPassedCorrectly() {
        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenAnswer(inv -> {
                    Page<Task> p = inv.getArgument(0);
                    assertEquals(2L, p.getCurrent());
                    assertEquals(5L, p.getSize());
                    p.setRecords(List.of());
                    p.setTotal(0);
                    return p;
                });

        taskService.listTasks(2, 5, null);
    }

    // ===== getMyPublishedTasks =====

    @Test
    void getMyPublishedTasks_returnsUserTasks() {
        Task t = new Task(); t.setId(1L); t.setPublisherId(1L); t.setStatus(0);
        when(taskMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(t));
        when(userMapper.selectBatchIds(anyList())).thenReturn(List.of());

        var result = taskService.getMyPublishedTasks(1L);
        assertEquals(1, result.size());
    }

    @Test
    void getMyPublishedTasks_emptyResult_returnsEmpty() {
        when(taskMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of());
        assertTrue(taskService.getMyPublishedTasks(1L).isEmpty());
    }

    // ===== getTaskById =====

    @Test
    void getTaskById_found_returnsTask() {
        Task t = new Task(); t.setId(1L);
        when(taskMapper.selectById(1L)).thenReturn(t);
        assertEquals(1L, taskService.getTaskById(1L).getId());
    }

    @Test
    void getTaskById_notFound_throws() {
        when(taskMapper.selectById(99L)).thenReturn(null);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> taskService.getTaskById(99L));
        assertEquals("任务不存在", ex.getMessage());
    }

    // ===== cancelTask =====

    @Test
    void cancelTask_success() {
        Task t = new Task(); t.setId(1L); t.setPublisherId(1L); t.setStatus(0);
        t.setReward(new BigDecimal("5.00"));
        when(taskMapper.selectById(1L)).thenReturn(t);

        taskService.cancelTask(1L, 1L);

        verify(taskMapper).updateById(argThat((Task task) -> task.getStatus() == 3));
        verify(walletService).refundReward(1L, new BigDecimal("5.00"), null);
    }

    @Test
    void cancelTask_notFound_throws() {
        when(taskMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> taskService.cancelTask(99L, 1L));
    }

    @Test
    void cancelTask_notPublisher_throws() {
        Task t = new Task(); t.setId(1L); t.setPublisherId(1L); t.setStatus(0);
        when(taskMapper.selectById(1L)).thenReturn(t);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> taskService.cancelTask(1L, 2L));
        assertEquals("只有发布者才能取消任务", ex.getMessage());
    }

    @Test
    void cancelTask_notPending_throws() {
        Task t = new Task(); t.setId(1L); t.setPublisherId(1L); t.setStatus(1);
        when(taskMapper.selectById(1L)).thenReturn(t);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> taskService.cancelTask(1L, 1L));
        assertEquals("只有待接单的任务才能取消", ex.getMessage());
    }
}
