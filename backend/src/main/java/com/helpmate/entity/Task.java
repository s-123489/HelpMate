package com.helpmate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("task")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long publisherId;

    private String title;

    private String description;

    /** EXPRESS / FOOD / PURCHASE / OTHER */
    private String category;

    private BigDecimal reward;

    /** 0=待接单 1=进行中 2=已完成 3=已取消 */
    private Integer status;

    private String location;

    private String deadline;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
