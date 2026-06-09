package com.helpmate.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SubmitReviewRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "评分不能为空")
    @Min(value = 1, message = "评分最低1分")
    @Max(value = 5, message = "评分最高5分")
    private Integer score;

    @Size(max = 500, message = "评价内容最多500字")
    private String content;
}
