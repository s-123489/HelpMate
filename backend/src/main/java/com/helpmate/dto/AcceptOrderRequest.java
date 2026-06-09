package com.helpmate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AcceptOrderRequest {

    @NotNull(message = "任务ID不能为空")
    private Long taskId;
}
