package com.helpmate.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.vo.WalletTransactionVO;

import java.math.BigDecimal;

public interface WalletService {

    BigDecimal getBalance(Long userId);

    void recharge(Long userId, BigDecimal amount);

    void withdraw(Long userId, BigDecimal amount);

    /** 冻结任务赏金（发布任务时扣款） */
    void freezeReward(Long userId, BigDecimal amount, Long taskId);

    /** 释放赏金给接单人（任务完成时） */
    void releaseReward(Long publisherId, Long helperId, BigDecimal amount, Long orderId);

    /** 退还赏金给发布人（任务取消时） */
    void refundReward(Long publisherId, BigDecimal amount, Long orderId);

    Page<WalletTransactionVO> getTransactions(Long userId, Integer page, Integer size);
}
