-- V1__init_schema.sql
-- HelpMate 初始化数据库表结构

-- 创建数据库（若通过命令行手动执行）
-- CREATE DATABASE IF NOT EXISTS helpmate DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;

-- =====================
-- 用户表
-- =====================
CREATE TABLE IF NOT EXISTS user (
    id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    username      VARCHAR(50)     NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255)    NOT NULL COMMENT 'BCrypt加密密码',
    phone         VARCHAR(20)     DEFAULT NULL COMMENT '手机号',
    email         VARCHAR(100)    DEFAULT NULL COMMENT '邮箱',
    avatar_url    VARCHAR(255)    DEFAULT NULL COMMENT '头像URL',
    balance       DECIMAL(10, 2)  NOT NULL DEFAULT 0.00 COMMENT '钱包余额',
    status        TINYINT         NOT NULL DEFAULT 1 COMMENT '状态：1正常 0禁用',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =====================
-- 任务表
-- =====================
CREATE TABLE IF NOT EXISTS task (
    id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    publisher_id  BIGINT          NOT NULL COMMENT '发布者用户ID',
    title         VARCHAR(100)    NOT NULL COMMENT '任务标题',
    description   TEXT            DEFAULT NULL COMMENT '任务详细描述',
    category      VARCHAR(20)     NOT NULL COMMENT '分类：EXPRESS取快递 FOOD送餐 PURCHASE代购 OTHER互助',
    reward        DECIMAL(10, 2)  NOT NULL COMMENT '悬赏金额',
    status        TINYINT         NOT NULL DEFAULT 0 COMMENT '状态：0待接单 1进行中 2已完成 3已取消',
    location      VARCHAR(255)    DEFAULT NULL COMMENT '任务地点描述',
    deadline      VARCHAR(50)     DEFAULT NULL COMMENT '截止时间说明',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_publisher_id (publisher_id),
    KEY idx_status (status),
    KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- =====================
-- 订单表
-- =====================
CREATE TABLE IF NOT EXISTS order_info (
    id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    task_id       BIGINT       NOT NULL COMMENT '关联任务ID',
    helper_id     BIGINT       NOT NULL COMMENT '接单者用户ID',
    status        TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0进行中 1已完成 2已取消',
    remark        VARCHAR(500) DEFAULT NULL COMMENT '备注',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '接单时间',
    completed_at  DATETIME     DEFAULT NULL COMMENT '完成时间',
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_id (task_id),
    KEY idx_helper_id (helper_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- =====================
-- 钱包流水表
-- =====================
CREATE TABLE IF NOT EXISTS wallet_transaction (
    id                BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    user_id           BIGINT          NOT NULL COMMENT '用户ID',
    amount            DECIMAL(10, 2)  NOT NULL COMMENT '金额（正数入账，负数出账）',
    type              TINYINT         NOT NULL COMMENT '类型：1充值 2提现 3任务支付 4接单收入',
    related_order_id  BIGINT          DEFAULT NULL COMMENT '关联订单ID',
    description       VARCHAR(200)    DEFAULT NULL COMMENT '流水说明',
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包流水表';
