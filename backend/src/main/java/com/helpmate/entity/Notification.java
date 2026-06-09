package com.helpmate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("notification")
public class Notification {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String type;

    private String title;

    private String content;

    /** 0=未读 1=已读 */
    private Integer isRead;

    private Long relatedId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
