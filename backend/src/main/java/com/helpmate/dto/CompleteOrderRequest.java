package com.helpmate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteOrderRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;
}
