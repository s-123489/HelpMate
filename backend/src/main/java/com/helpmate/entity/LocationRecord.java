package com.helpmate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("location_record")
public class LocationRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long userId;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
