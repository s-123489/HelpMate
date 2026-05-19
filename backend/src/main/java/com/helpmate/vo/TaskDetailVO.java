package com.helpmate.vo;

import com.helpmate.entity.Task;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TaskDetailVO {

    private Long id;
    private Long publisherId;
    private String publisherName;
    private String publisherPhone;
    private String publisherAvatar;
    private Long accepterId;
    private String accepterName;
    private String accepterPhone;
    private String title;
    private String description;
    private String category;
    private BigDecimal reward;
    private Integer status;
    private String statusText;
    private String location;
    private String pickupLocation;
    private String deliveryLocation;
    private String deadline;
    private LocalDateTime createdAt;

    public static String statusToText(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case 0 -> "待接取";
            case 1 -> "进行中";
            case 2 -> "已完成";
            case 3 -> "已取消";
            default -> "未知";
        };
    }

    public static TaskDetailVO from(Task task) {
        TaskDetailVO vo = new TaskDetailVO();
        vo.setId(task.getId());
        vo.setPublisherId(task.getPublisherId());
        vo.setTitle(task.getTitle());
        vo.setDescription(task.getDescription());
        vo.setCategory(task.getCategory());
        vo.setReward(task.getReward());
        vo.setStatus(task.getStatus());
        vo.setStatusText(statusToText(task.getStatus()));
        vo.setLocation(task.getLocation());
        vo.setDeadline(task.getDeadline());
        vo.setCreatedAt(task.getCreatedAt());

        // 兼容 "pickup → delivery" 这种合并格式，拆出取件与送达
        if (task.getLocation() != null && task.getLocation().contains("→")) {
            String[] parts = task.getLocation().split("→");
            vo.setPickupLocation(parts[0].trim());
            if (parts.length > 1) vo.setDeliveryLocation(parts[1].trim());
        } else {
            vo.setPickupLocation(task.getLocation());
        }
        return vo;
    }
}
