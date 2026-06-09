package com.helpmate.vo;

import lombok.Data;

import java.time.LocalDateTime;

/** 会话列表中每一条会话的摘要 */
@Data
public class ConversationVO {

    /** 对方用户 ID */
    private Long userId;

    /** 对方用户名 */
    private String username;

    /** 最后一条消息内容 */
    private String lastMessage;

    /** 最后一条消息时间 */
    private LocalDateTime lastTime;

    /** 未读消息数 */
    private Integer unreadCount;

    /** 关联任务 ID（可选） */
    private Long taskId;

    /** 关联任务标题（可选） */
    private String taskTitle;
}