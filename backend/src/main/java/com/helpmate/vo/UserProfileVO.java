package com.helpmate.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserProfileVO {
    private Long id;
    private String username;
    private String phone;
    private String email;
    private String avatarUrl;
    private BigDecimal balance;
    private Double avgScore;
    private Long reviewCount;
}
