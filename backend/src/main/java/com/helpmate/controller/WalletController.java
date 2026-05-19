package com.helpmate.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.common.Result;
import com.helpmate.dto.WalletRequest;
import com.helpmate.service.WalletService;
import com.helpmate.vo.WalletTransactionVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/balance")
    public Result<BigDecimal> balance(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(walletService.getBalance(userId));
    }

    @PostMapping("/recharge")
    public Result<Void> recharge(@Valid @RequestBody WalletRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        walletService.recharge(userId, req.getAmount());
        return Result.success("充值成功");
    }

    @PostMapping("/withdraw")
    public Result<Void> withdraw(@Valid @RequestBody WalletRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        walletService.withdraw(userId, req.getAmount());
        return Result.success("提现成功");
    }

    @GetMapping("/transactions")
    public Result<Page<WalletTransactionVO>> transactions(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(walletService.getTransactions(userId, page, size));
    }
}
