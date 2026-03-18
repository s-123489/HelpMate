package com.helpmate.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "任务标题不能为空")
    private String title;

    private String description;

    @NotBlank(message = "任务分类不能为空")
    private String category;

    @NotNull(message = "悬赏金额不能为空")
    @DecimalMin(value = "0.01", message = "悬赏金额最低0.01元")
    private BigDecimal reward;

    private String location;

    private String deadline;
}
