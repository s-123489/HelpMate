package com.helpmate.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.common.AuthInterceptor;
import com.helpmate.dto.WalletRequest;
import com.helpmate.service.WalletService;
import com.helpmate.vo.WalletTransactionVO;
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

@WebMvcTest(controllers = WalletController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@Import(com.helpmate.common.GlobalExceptionHandler.class)
class WalletControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private WalletService walletService;
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

    // ===== GET /api/wallet/balance =====

    @Test
    void balance_returnsUserBalance() throws Exception {
        when(walletService.getBalance(1L)).thenReturn(new BigDecimal("100.00"));

        mockMvc.perform(get("/api/wallet/balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(100.00));
    }

    @Test
    void balance_serviceThrows_returns500() throws Exception {
        when(walletService.getBalance(1L)).thenThrow(new RuntimeException("用户不存在"));

        mockMvc.perform(get("/api/wallet/balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    // ===== POST /api/wallet/recharge =====

    @Test
    void recharge_success_returns200() throws Exception {
        doNothing().when(walletService).recharge(1L, new BigDecimal("50.00"));

        WalletRequest req = new WalletRequest();
        req.setAmount(new BigDecimal("50.00"));

        mockMvc.perform(post("/api/wallet/recharge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("充值成功"));
    }

    @Test
    void recharge_invalidAmount_returns400() throws Exception {
        WalletRequest req = new WalletRequest();
        req.setAmount(new BigDecimal("0.00"));

        mockMvc.perform(post("/api/wallet/recharge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
        verify(walletService, never()).recharge(any(), any());
    }

    @Test
    void recharge_missingAmount_returns400() throws Exception {
        mockMvc.perform(post("/api/wallet/recharge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    // ===== POST /api/wallet/withdraw =====

    @Test
    void withdraw_success_returns200() throws Exception {
        doNothing().when(walletService).withdraw(1L, new BigDecimal("30.00"));

        WalletRequest req = new WalletRequest();
        req.setAmount(new BigDecimal("30.00"));

        mockMvc.perform(post("/api/wallet/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("提现成功"));
    }

    @Test
    void withdraw_insufficientBalance_returns500() throws Exception {
        doThrow(new RuntimeException("余额不足")).when(walletService).withdraw(any(), any());

        WalletRequest req = new WalletRequest();
        req.setAmount(new BigDecimal("999.00"));

        mockMvc.perform(post("/api/wallet/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("余额不足"));
    }

    // ===== GET /api/wallet/transactions =====

    @Test
    void transactions_returnsPagedResult() throws Exception {
        WalletTransactionVO vo = new WalletTransactionVO();
        vo.setId(1L);
        vo.setAmount(new BigDecimal("50.00"));
        vo.setTypeDesc("充值");

        Page<WalletTransactionVO> page = new Page<>(1, 20);
        page.setRecords(List.of(vo));
        page.setTotal(1);

        when(walletService.getTransactions(1L, 1, 20)).thenReturn(page);

        mockMvc.perform(get("/api/wallet/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.records[0].typeDesc").value("充值"));
    }

    @Test
    void transactions_customPageParams() throws Exception {
        Page<WalletTransactionVO> page = new Page<>(2, 10);
        page.setRecords(List.of());
        page.setTotal(0);

        when(walletService.getTransactions(1L, 2, 10)).thenReturn(page);

        mockMvc.perform(get("/api/wallet/transactions")
                        .param("page", "2")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
