package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.entity.User;
import com.helpmate.entity.WalletTransaction;
import com.helpmate.mapper.UserMapper;
import com.helpmate.mapper.WalletTransactionMapper;
import com.helpmate.service.WalletService;
import com.helpmate.vo.WalletTransactionVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class WalletServiceImpl implements WalletService {

    private static final Map<Integer, String> TYPE_DESC = Map.of(
            1, "充值", 2, "提现", 3, "任务赏金支付", 4, "接单收入", 5, "任务取消退款"
    );

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private WalletTransactionMapper walletTransactionMapper;

    @Override
    public BigDecimal getBalance(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new RuntimeException("用户不存在");
        return user.getBalance();
    }

    @Override
    @Transactional
    public void recharge(Long userId, BigDecimal amount) {
        updateBalance(userId, amount);
        saveTransaction(userId, amount, 1, null, "钱包充值");
    }

    @Override
    @Transactional
    public void withdraw(Long userId, BigDecimal amount) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new RuntimeException("用户不存在");
        if (user.getBalance().compareTo(amount) < 0) throw new RuntimeException("余额不足");
        updateBalance(userId, amount.negate());
        saveTransaction(userId, amount.negate(), 2, null, "钱包提现");
    }

    @Override
    @Transactional
    public void freezeReward(Long userId, BigDecimal amount, Long taskId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new RuntimeException("用户不存在");
        if (user.getBalance().compareTo(amount) < 0) throw new RuntimeException("余额不足，无法发布任务");
        updateBalance(userId, amount.negate());
        saveTransaction(userId, amount.negate(), 3, null, "发布任务赏金冻结");
    }

    @Override
    @Transactional
    public void releaseReward(Long publisherId, Long helperId, BigDecimal amount, Long orderId) {
        updateBalance(helperId, amount);
        saveTransaction(helperId, amount, 4, orderId, "接单收入");
    }

    @Override
    @Transactional
    public void refundReward(Long publisherId, BigDecimal amount, Long orderId) {
        updateBalance(publisherId, amount);
        saveTransaction(publisherId, amount, 5, orderId, "任务取消退款");
    }

    @Override
    public Page<WalletTransactionVO> getTransactions(Long userId, Integer page, Integer size) {
        Page<WalletTransaction> pageObj = new Page<>(page, size);
        walletTransactionMapper.selectPage(pageObj, new LambdaQueryWrapper<WalletTransaction>()
                .eq(WalletTransaction::getUserId, userId)
                .orderByDesc(WalletTransaction::getCreatedAt));

        Page<WalletTransactionVO> result = new Page<>(pageObj.getCurrent(), pageObj.getSize(), pageObj.getTotal());
        result.setRecords(pageObj.getRecords().stream().map(t -> {
            WalletTransactionVO vo = new WalletTransactionVO();
            vo.setId(t.getId());
            vo.setAmount(t.getAmount());
            vo.setType(t.getType());
            vo.setTypeDesc(TYPE_DESC.getOrDefault(t.getType(), "未知"));
            vo.setDescription(t.getDescription());
            vo.setCreatedAt(t.getCreatedAt());
            return vo;
        }).toList());
        return result;
    }

    private void updateBalance(Long userId, BigDecimal delta) {
        User user = new User();
        user.setId(userId);
        user.setBalance(userMapper.selectById(userId).getBalance().add(delta));
        userMapper.updateById(user);
    }

    private void saveTransaction(Long userId, BigDecimal amount, int type, Long relatedOrderId, String desc) {
        WalletTransaction tx = new WalletTransaction();
        tx.setUserId(userId);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setRelatedOrderId(relatedOrderId);
        tx.setDescription(desc);
        walletTransactionMapper.insert(tx);
    }
}
