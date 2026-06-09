package com.helpmate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.helpmate.entity.OrderInfo;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderInfoMapper orderInfoMapper;
    @Mock private TaskMapper taskMapper;
    @Mock private UserMapper userMapper;
    @Mock private WalletService walletService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Task pendingTask;
    private User helper;

    @BeforeEach
    void setUp() {
        pendingTask = new Task();
        pendingTask.setId(1L);
        pendingTask.setPublisherId(1L);
        pendingTask.setTitle("帮我取快递");
        pendingTask.setStatus(0);
        pendingTask.setReward(new BigDecimal("5.00"));

        helper = new User();
        helper.setId(2L);
        helper.setUsername("helper");
    }

    // ===== acceptOrder =====

    @Test
    void acceptOrder_success_returnsOrderId() {
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);
        when(orderInfoMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(orderInfoMapper.insert(any(OrderInfo.class))).thenAnswer(inv -> {
            OrderInfo o = inv.getArgument(0);
            o.setId(10L);
            return 1;
        });
        when(userMapper.selectById(2L)).thenReturn(helper);

        Long orderId = orderService.acceptOrder(1L, 2L);

        assertEquals(10L, orderId);
        verify(taskMapper).updateById(argThat((Task t) -> t.getStatus() == 1));
        verify(notificationService).push(eq(1L), eq("ORDER_ACCEPTED"), anyString(), anyString(), any());
    }

    @Test
    void acceptOrder_taskNotFound_throws() {
        when(taskMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> orderService.acceptOrder(99L, 2L));
    }

    @Test
    void acceptOrder_taskNotPending_throws() {
        pendingTask.setStatus(1);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.acceptOrder(1L, 2L));
        assertEquals("任务已被接单或不可接取", ex.getMessage());
    }

    @Test
    void acceptOrder_ownTask_throws() {
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.acceptOrder(1L, 1L));
        assertEquals("不能接取自己发布的任务", ex.getMessage());
    }

    @Test
    void acceptOrder_alreadyAccepted_throws() {
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);
        when(orderInfoMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.acceptOrder(1L, 2L));
        assertEquals("任务已被接单", ex.getMessage());
    }

    // ===== completeOrder =====

    @Test
    void completeOrder_success() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(0);

        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);

        orderService.completeOrder(10L, 1L);

        verify(orderInfoMapper).updateById(argThat((OrderInfo o) -> o.getStatus() == 1));
        verify(taskMapper).updateById(argThat((Task t) -> t.getStatus() == 2));
        verify(walletService).releaseReward(1L, 2L, new BigDecimal("5.00"), 10L);
    }

    @Test
    void completeOrder_orderNotFound_throws() {
        when(orderInfoMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> orderService.completeOrder(99L, 1L));
    }

    @Test
    void completeOrder_notPublisher_throws() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(0);
        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.completeOrder(10L, 3L));
        assertEquals("只有发布者才能确认完成", ex.getMessage());
    }

    @Test
    void completeOrder_alreadyCompleted_throws() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(1);
        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.completeOrder(10L, 1L));
        assertEquals("订单状态异常", ex.getMessage());
    }

    // ===== cancelOrder =====

    @Test
    void cancelOrder_byPublisher_success() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(0);

        User publisher = new User();
        publisher.setId(1L);
        publisher.setUsername("publisher");

        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);
        when(userMapper.selectById(1L)).thenReturn(publisher);

        orderService.cancelOrder(10L, 1L);

        verify(orderInfoMapper).updateById(argThat((OrderInfo o) -> o.getStatus() == 2));
        verify(taskMapper).updateById(argThat((Task t) -> t.getStatus() == 3));
        verify(walletService).refundReward(1L, new BigDecimal("5.00"), 10L);
    }

    @Test
    void cancelOrder_byHelper_success() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(0);

        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);
        when(userMapper.selectById(2L)).thenReturn(helper);

        orderService.cancelOrder(10L, 2L);

        verify(walletService).refundReward(anyLong(), any(), anyLong());
    }

    @Test
    void cancelOrder_unauthorized_throws() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(0);

        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.cancelOrder(10L, 3L));
        assertEquals("无权操作此订单", ex.getMessage());
    }

    @Test
    void cancelOrder_alreadyEnded_throws() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(1);

        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.cancelOrder(10L, 1L));
        assertEquals("订单已结束，无法取消", ex.getMessage());
    }

    @Test
    void cancelOrder_orderNotFound_throws() {
        when(orderInfoMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> orderService.cancelOrder(99L, 1L));
    }

    // ===== myOrders / myPublishedOrders =====

    @Test
    void myOrders_returnsEmptyWhenNone() {
        when(orderInfoMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of());
        assertTrue(orderService.myOrders(1L).isEmpty());
    }

    @Test
    void myPublishedOrders_returnsEmptyWhenNoTasks() {
        when(taskMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of());
        assertTrue(orderService.myPublishedOrders(1L).isEmpty());
    }

    // ===== getOrderDetail =====

    @Test
    void getOrderDetail_notFound_throws() {
        when(orderInfoMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> orderService.getOrderDetail(99L, 1L));
    }

    @Test
    void getOrderDetail_unauthorized_throws() {
        OrderInfo order = new OrderInfo();
        order.setId(10L);
        order.setTaskId(1L);
        order.setHelperId(2L);
        order.setStatus(0);

        when(orderInfoMapper.selectById(10L)).thenReturn(order);
        when(taskMapper.selectById(1L)).thenReturn(pendingTask);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.getOrderDetail(10L, 3L));
        assertEquals("无权查看此订单", ex.getMessage());
    }
}
