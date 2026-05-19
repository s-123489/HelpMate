package com.helpmate.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReviewVO {
    private Long id;
    private Long orderId;
    private Long reviewerId;
    private String reviewerName;
    private Integer score;
    private String content;
    private LocalDateTime createdAt;
}
