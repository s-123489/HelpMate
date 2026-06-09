package com.helpmate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotNull(message = "接收者ID不能为空")
    private Long receiverId;

    /** 关联任务 ID，可选 */
    private Long taskId;

    @NotBlank(message = "消息内容不能为空")
    private String content;
}