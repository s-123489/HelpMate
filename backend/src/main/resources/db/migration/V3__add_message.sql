-- 创建消息表
CREATE TABLE IF NOT EXISTS message (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '消息ID',
    sender_id   BIGINT       NOT NULL                COMMENT '发送者ID',
    receiver_id BIGINT       NOT NULL                COMMENT '接收者ID',
    task_id     BIGINT                               COMMENT '关联任务ID（可选）',
    content     TEXT         NOT NULL                COMMENT '消息内容',
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE  COMMENT '是否已读',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    PRIMARY KEY (id),
    INDEX idx_sender   (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_task     (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内消息表';