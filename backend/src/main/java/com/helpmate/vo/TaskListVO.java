package com.helpmate.vo;

import com.helpmate.entity.Task;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TaskListVO {

    private Long id;
    private Long publisherId;
    private String publisherName;
    private Double publisherRating;
    private String title;
    private String description;
    private String category;
    private BigDecimal reward;
    private Integer status;
    private String location;
    private String pickupLocation;
    private String deliveryLocation;
    private String deadline;
    private LocalDateTime createdAt;

    public static TaskListVO from(Task task, String publisherName, Double publisherRating) {
        TaskListVO vo = new TaskListVO();
        vo.setId(task.getId());
        vo.setPublisherId(task.getPublisherId());
        vo.setPublisherName(publisherName);
        vo.setPublisherRating(publisherRating);
        vo.setTitle(task.getTitle());
        vo.setDescription(task.getDescription());
        vo.setCategory(task.getCategory());
        vo.setReward(task.getReward());
        vo.setStatus(task.getStatus());
        vo.setLocation(task.getLocation());
        vo.setDeadline(task.getDeadline());
        vo.setCreatedAt(task.getCreatedAt());

        // 拆分 location 字段（格式："取件地 → 送达地"）
        if (task.getLocation() != null && task.getLocation().contains("→")) {
            String[] parts = task.getLocation().split("→");
            vo.setPickupLocation(parts[0].trim());
            vo.setDeliveryLocation(parts.length > 1 ? parts[1].trim() : "");
        } else {
            vo.setPickupLocation(task.getLocation());
            vo.setDeliveryLocation("");
        }
        return vo;
    }
}