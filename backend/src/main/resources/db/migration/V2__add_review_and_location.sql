-- V2__add_review_and_location.sql

-- =====================
-- 评价表
-- =====================
CREATE TABLE IF NOT EXISTS review (
    id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_id      BIGINT          NOT NULL COMMENT '关联订单ID',
    reviewer_id   BIGINT          NOT NULL COMMENT '评价人ID',
    reviewee_id   BIGINT          NOT NULL COMMENT '被评价人ID',
    score         TINYINT         NOT NULL COMMENT '评分 1-5',
    content       VARCHAR(500)    DEFAULT NULL COMMENT '评价内容',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_reviewer (order_id, reviewer_id),
    KEY idx_reviewee_id (reviewee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

-- =====================
-- 位置记录表
-- =====================
CREATE TABLE IF NOT EXISTS location_record (
    id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_id      BIGINT          NOT NULL COMMENT '关联订单ID',
    user_id       BIGINT          NOT NULL COMMENT '上报位置的用户ID',
    latitude      DECIMAL(10, 7)  NOT NULL COMMENT '纬度',
    longitude     DECIMAL(10, 7)  NOT NULL COMMENT '经度',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上报时间',
    PRIMARY KEY (id),
    KEY idx_order_id (order_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='位置记录表';

-- =====================
-- 系统消息表
-- =====================
CREATE TABLE IF NOT EXISTS notification (
    id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    user_id       BIGINT          NOT NULL COMMENT '接收消息的用户ID',
    type          VARCHAR(50)     NOT NULL COMMENT '消息类型',
    title         VARCHAR(100)    NOT NULL COMMENT '标题',
    content       VARCHAR(500)    NOT NULL COMMENT '内容',
    is_read       TINYINT         NOT NULL DEFAULT 0 COMMENT '是否已读 0未读 1已读',
    related_id    BIGINT          DEFAULT NULL COMMENT '关联业务ID（订单ID或任务ID）',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统消息表';
