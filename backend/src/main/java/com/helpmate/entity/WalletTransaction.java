package com.helpmate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("wallet_transaction")
public class WalletTransaction {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** 正数=收入，负数=支出 */
    private BigDecimal amount;

    /** 1=充值 2=提现 3=任务支付 4=接单收入 */
    private Integer type;

    private Long relatedOrderId;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
