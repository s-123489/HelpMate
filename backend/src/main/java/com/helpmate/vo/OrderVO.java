package com.helpmate.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderVO {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private BigDecimal reward;
    private Long helperId;
    private String helperName;
    private Integer status;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
