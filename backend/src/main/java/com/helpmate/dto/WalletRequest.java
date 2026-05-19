package com.helpmate.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WalletRequest {

    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0.01", message = "金额最低0.01元")
    private BigDecimal amount;
}
