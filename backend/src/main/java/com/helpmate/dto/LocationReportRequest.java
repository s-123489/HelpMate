package com.helpmate.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LocationReportRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "纬度不能为空")
    @DecimalMin(value = "-90.0", message = "纬度范围 -90 到 90")
    @DecimalMax(value = "90.0", message = "纬度范围 -90 到 90")
    private BigDecimal latitude;

    @NotNull(message = "经度不能为空")
    @DecimalMin(value = "-180.0", message = "经度范围 -180 到 180")
    @DecimalMax(value = "180.0", message = "经度范围 -180 到 180")
    private BigDecimal longitude;
}
