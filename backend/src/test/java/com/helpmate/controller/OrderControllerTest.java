package com.helpmate.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.common.AuthInterceptor;
import com.helpmate.dto.AcceptOrderRequest;
import com.helpmate.service.OrderService;
import com.helpmate.vo.OrderVO;
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

@WebMvcTest(controllers = OrderController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@Import(com.helpmate.common.GlobalExceptionHandler.class)
class OrderControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private OrderService orderService;
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

    // ===== POST /api/order/accept =====

    @Test
    void accept_success_returns200() throws Exception {
        when(orderService.acceptOrder(1L, 1L)).thenReturn(10L);

        AcceptOrderRequest req = new AcceptOrderRequest();
        req.setTaskId(1L);

        mockMvc.perform(post("/api/order/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("接单成功"))
                .andExpect(jsonPath("$.data").value(10));
    }

    @Test
    void accept_missingTaskId_returns400() throws Exception {
        mockMvc.perform(post("/api/order/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
        verify(orderService, never()).acceptOrder(any(), any());
    }

    @Test
    void accept_serviceThrows_returns500() throws Exception {
        when(orderService.acceptOrder(any(), any())).thenThrow(new RuntimeException("任务已被接单"));

        AcceptOrderRequest req = new AcceptOrderRequest();
        req.setTaskId(1L);

        mockMvc.perform(post("/api/order/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("任务已被接单"));
    }

    // ===== POST /api/order/{orderId}/complete =====

    @Test
    void complete_success_returns200() throws Exception {
        doNothing().when(orderService).completeOrder(10L, 1L);

        mockMvc.perform(post("/api/order/10/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void complete_serviceThrows_returns500() throws Exception {
        doThrow(new RuntimeException("只有发布者才能确认完成")).when(orderService).completeOrder(10L, 1L);

        mockMvc.perform(post("/api/order/10/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("只有发布者才能确认完成"));
    }

    // ===== POST /api/order/{orderId}/cancel =====

    @Test
    void cancel_success_returns200() throws Exception {
        doNothing().when(orderService).cancelOrder(10L, 1L);

        mockMvc.perform(post("/api/order/10/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("订单已取消"));
    }

    // ===== GET /api/order/my-orders =====

    @Test
    void myOrders_returnsOrderList() throws Exception {
        OrderVO vo = new OrderVO();
        vo.setId(1L);
        vo.setTaskTitle("帮我取快递");
        vo.setReward(new BigDecimal("5.00"));
        vo.setStatus(0);

        when(orderService.myOrders(1L)).thenReturn(List.of(vo));

        mockMvc.perform(get("/api/order/my-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].taskTitle").value("帮我取快递"));
    }

    @Test
    void myOrders_emptyList_returnsEmpty() throws Exception {
        when(orderService.myOrders(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/order/my-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    // ===== GET /api/order/my-published =====

    @Test
    void myPublished_returnsOrderList() throws Exception {
        when(orderService.myPublishedOrders(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/order/my-published"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ===== GET /api/order/{orderId} =====

    @Test
    void detail_success_returnsOrderVO() throws Exception {
        OrderVO vo = new OrderVO();
        vo.setId(10L);
        vo.setStatus(1);

        when(orderService.getOrderDetail(10L, 1L)).thenReturn(vo);

        mockMvc.perform(get("/api/order/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(10));
    }

    @Test
    void detail_notFound_returns500() throws Exception {
        when(orderService.getOrderDetail(99L, 1L)).thenThrow(new RuntimeException("订单不存在"));

        mockMvc.perform(get("/api/order/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }
}
