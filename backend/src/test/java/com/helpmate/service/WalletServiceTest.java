package com.helpmate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.entity.User;
import com.helpmate.entity.WalletTransaction;
import com.helpmate.mapper.UserMapper;
import com.helpmate.mapper.WalletTransactionMapper;
import com.helpmate.service.impl.WalletServiceImpl;
import com.helpmate.vo.WalletTransactionVO;
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
class WalletServiceTest {

    @Mock private UserMapper userMapper;
    @Mock private WalletTransactionMapper walletTransactionMapper;

    @InjectMocks
    private WalletServiceImpl walletService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setBalance(new BigDecimal("100.00"));
    }

    // ===== getBalance =====

    @Test
    void getBalance_returnsUserBalance() {
        when(userMapper.selectById(1L)).thenReturn(user);
        assertEquals(new BigDecimal("100.00"), walletService.getBalance(1L));
    }

    @Test
    void getBalance_userNotFound_throws() {
        when(userMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> walletService.getBalance(99L));
    }

    // ===== recharge =====

    @Test
    void recharge_updatesBalanceAndSavesTransaction() {
        when(userMapper.selectById(1L)).thenReturn(user);

        walletService.recharge(1L, new BigDecimal("50.00"));

        verify(userMapper).updateById(argThat((User u) -> u.getBalance().compareTo(new BigDecimal("150.00")) == 0));
        verify(walletTransactionMapper).insert(argThat((WalletTransaction t) ->
                t.getType() == 1 && t.getAmount().compareTo(new BigDecimal("50.00")) == 0));
    }

    // ===== withdraw =====

    @Test
    void withdraw_sufficientBalance_success() {
        when(userMapper.selectById(1L)).thenReturn(user);

        walletService.withdraw(1L, new BigDecimal("50.00"));

        verify(userMapper).updateById(argThat((User u) -> u.getBalance().compareTo(new BigDecimal("50.00")) == 0));
        verify(walletTransactionMapper).insert(argThat((WalletTransaction t) -> t.getType() == 2));
    }

    @Test
    void withdraw_insufficientBalance_throws() {
        when(userMapper.selectById(1L)).thenReturn(user);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> walletService.withdraw(1L, new BigDecimal("200.00")));
        assertEquals("余额不足", ex.getMessage());
    }

    @Test
    void withdraw_userNotFound_throws() {
        when(userMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> walletService.withdraw(99L, new BigDecimal("10.00")));
    }

    // ===== freezeReward =====

    @Test
    void freezeReward_sufficientBalance_success() {
        when(userMapper.selectById(1L)).thenReturn(user);

        walletService.freezeReward(1L, new BigDecimal("30.00"), 1L);

        verify(userMapper).updateById(argThat((User u) -> u.getBalance().compareTo(new BigDecimal("70.00")) == 0));
        verify(walletTransactionMapper).insert(argThat((WalletTransaction t) -> t.getType() == 3));
    }

    @Test
    void freezeReward_insufficientBalance_throws() {
        when(userMapper.selectById(1L)).thenReturn(user);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> walletService.freezeReward(1L, new BigDecimal("200.00"), 1L));
        assertEquals("余额不足，无法发布任务", ex.getMessage());
    }

    @Test
    void freezeReward_userNotFound_throws() {
        when(userMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class,
                () -> walletService.freezeReward(99L, new BigDecimal("10.00"), 1L));
    }

    // ===== releaseReward =====

    @Test
    void releaseReward_addsBalanceToHelper() {
        when(userMapper.selectById(2L)).thenReturn(new User() {{ setId(2L); setBalance(new BigDecimal("0.00")); }});

        walletService.releaseReward(1L, 2L, new BigDecimal("50.00"), 10L);

        verify(userMapper).updateById(argThat((User u) -> u.getBalance().compareTo(new BigDecimal("50.00")) == 0));
        verify(walletTransactionMapper).insert(argThat((WalletTransaction t) ->
                t.getType() == 4 && t.getRelatedOrderId().equals(10L)));
    }

    // ===== refundReward =====

    @Test
    void refundReward_addsBalanceToPublisher() {
        when(userMapper.selectById(1L)).thenReturn(user);

        walletService.refundReward(1L, new BigDecimal("30.00"), 10L);

        verify(userMapper).updateById(argThat((User u) -> u.getBalance().compareTo(new BigDecimal("130.00")) == 0));
        verify(walletTransactionMapper).insert(argThat((WalletTransaction t) ->
                t.getType() == 5 && t.getRelatedOrderId().equals(10L)));
    }

    // ===== getTransactions =====

    @Test
    void getTransactions_returnsVOPage() {
        WalletTransaction tx = new WalletTransaction();
        tx.setId(1L);
        tx.setAmount(new BigDecimal("50.00"));
        tx.setType(1);
        tx.setDescription("充值");

        Page<WalletTransaction> txPage = new Page<>(1, 20);
        txPage.setRecords(List.of(tx));
        txPage.setTotal(1);

        when(walletTransactionMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenAnswer(inv -> {
                    Page<WalletTransaction> p = inv.getArgument(0);
                    p.setRecords(List.of(tx));
                    p.setTotal(1);
                    return p;
                });

        Page<WalletTransactionVO> result = walletService.getTransactions(1L, 1, 20);

        assertEquals(1, result.getRecords().size());
        assertEquals("充值", result.getRecords().get(0).getTypeDesc());
    }

    @Test
    void getTransactions_unknownTypeDesc() {
        WalletTransaction tx = new WalletTransaction();
        tx.setId(1L);
        tx.setAmount(new BigDecimal("10.00"));
        tx.setType(99);

        when(walletTransactionMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenAnswer(inv -> {
                    Page<WalletTransaction> p = inv.getArgument(0);
                    p.setRecords(List.of(tx));
                    p.setTotal(1);
                    return p;
                });

        Page<WalletTransactionVO> result = walletService.getTransactions(1L, 1, 20);
        assertEquals("未知", result.getRecords().get(0).getTypeDesc());
    }
}
