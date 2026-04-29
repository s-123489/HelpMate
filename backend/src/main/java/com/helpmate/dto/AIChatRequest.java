package com.helpmate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIChatRequest {

    @NotBlank(message = "消息不能为空")
    private String message;
}
