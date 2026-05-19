package com.helpmate.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalletTransactionVO {
    private Long id;
    private BigDecimal amount;
    private Integer type;
    private String typeDesc;
    private String description;
    private LocalDateTime createdAt;
}
