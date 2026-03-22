\# 数据库设计文档



\## 技术选型

\- 数据库：MySQL 8.0

\- 字符集：utf8mb4

\- 排序规则：utf8mb4\_unicode\_ci



\## ER 图



```mermaid

erDiagram

USER ||--o{ TASK : "publish"
USER ||--o{ ORDER_INFO : "accept"
TASK ||--o| ORDER_INFO : "match"
USER ||--o{ WALLET_TRANSACTION : "own"
ORDER_INFO ||--o{ WALLET_TRANSACTION : "relate"



&#x20;   USER {

&#x20;       bigint id PK

&#x20;       varchar username

&#x20;       varchar password\_hash

&#x20;       varchar phone

&#x20;       varchar email

&#x20;       varchar avatar\_url

&#x20;       decimal balance

&#x20;       tinyint status

&#x20;       datetime created\_at

&#x20;       datetime updated\_at

&#x20;   }



&#x20;   TASK {

&#x20;       bigint id PK

&#x20;       bigint publisher\_id FK

&#x20;       varchar title

&#x20;       text description

&#x20;       varchar category

&#x20;       decimal reward

&#x20;       tinyint status

&#x20;       varchar location

&#x20;       varchar deadline

&#x20;       datetime created\_at

&#x20;       datetime updated\_at

&#x20;   }



&#x20;   ORDER\_INFO {

&#x20;       bigint id PK

&#x20;       bigint task\_id FK

&#x20;       bigint helper\_id FK

&#x20;       tinyint status

&#x20;       varchar remark

&#x20;       datetime created\_at

&#x20;       datetime completed\_at

&#x20;       datetime updated\_at

&#x20;   }



&#x20;   WALLET\_TRANSACTION {

&#x20;       bigint id PK

&#x20;       bigint user\_id FK

&#x20;       decimal amount

&#x20;       tinyint type

&#x20;       bigint related\_order\_id FK

&#x20;       varchar description

&#x20;       datetime created\_at

&#x20;   }

```



\## 数据表说明



\### user 用户表

| 字段 | 类型 | 说明 |

|------|------|------|

| id | BIGINT | 主键 |

| username | VARCHAR(50) | 用户名，唯一 |

| password\_hash | VARCHAR(255) | BCrypt加密密码 |

| phone | VARCHAR(20) | 手机号，唯一 |

| email | VARCHAR(100) | 邮箱 |

| avatar\_url | VARCHAR(255) | 头像URL |

| balance | DECIMAL(10,2) | 钱包余额 |

| status | TINYINT | 1正常 0禁用 |



\### task 任务表

| 字段 | 类型 | 说明 |

|------|------|------|

| id | BIGINT | 主键 |

| publisher\_id | BIGINT | 发布者ID，关联user |

| title | VARCHAR(100) | 任务标题 |

| description | TEXT | 任务详情 |

| category | VARCHAR(20) | EXPRESS/FOOD/PURCHASE/OTHER |

| reward | DECIMAL(10,2) | 悬赏金额 |

| status | TINYINT | 0待接单 1进行中 2已完成 3已取消 |

| location | VARCHAR(255) | 任务地点 |

| deadline | VARCHAR(50) | 截止时间说明 |



\### order\_info 订单表

| 字段 | 类型 | 说明 |

|------|------|------|

| id | BIGINT | 主键 |

| task\_id | BIGINT | 关联任务ID，唯一 |

| helper\_id | BIGINT | 接单者ID，关联user |

| status | TINYINT | 0进行中 1已完成 2已取消 |

| remark | VARCHAR(500) | 备注 |

| completed\_at | DATETIME | 完成时间 |



\### wallet\_transaction 钱包流水表

| 字段 | 类型 | 说明 |

|------|------|------|

| id | BIGINT | 主键 |

| user\_id | BIGINT | 关联user |

| amount | DECIMAL(10,2) | 金额（正数入账，负数出账） |

| type | TINYINT | 1充值 2提现 3任务支付 4接单收入 |

| related\_order\_id | BIGINT | 关联订单ID |

| description | VARCHAR(200) | 流水说明 |



\## 建表 SQL



```sql

\-- V1\_\_init\_schema.sql

\-- HelpMate 初始化数据库表结构



CREATE TABLE IF NOT EXISTS user (

&#x20;   id            BIGINT          NOT NULL AUTO\_INCREMENT COMMENT '主键',

&#x20;   username      VARCHAR(50)     NOT NULL COMMENT '用户名',

&#x20;   password\_hash VARCHAR(255)    NOT NULL COMMENT 'BCrypt加密密码',

&#x20;   phone         VARCHAR(20)     DEFAULT NULL COMMENT '手机号',

&#x20;   email         VARCHAR(100)    DEFAULT NULL COMMENT '邮箱',

&#x20;   avatar\_url    VARCHAR(255)    DEFAULT NULL COMMENT '头像URL',

&#x20;   balance       DECIMAL(10, 2)  NOT NULL DEFAULT 0.00 COMMENT '钱包余额',

&#x20;   status        TINYINT         NOT NULL DEFAULT 1 COMMENT '状态：1正常 0禁用',

&#x20;   created\_at    DATETIME        NOT NULL DEFAULT CURRENT\_TIMESTAMP COMMENT '创建时间',

&#x20;   updated\_at    DATETIME        NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP COMMENT '更新时间',

&#x20;   PRIMARY KEY (id),

&#x20;   UNIQUE KEY uk\_username (username),

&#x20;   UNIQUE KEY uk\_phone (phone)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';



CREATE TABLE IF NOT EXISTS task (

&#x20;   id            BIGINT          NOT NULL AUTO\_INCREMENT COMMENT '主键',

&#x20;   publisher\_id  BIGINT          NOT NULL COMMENT '发布者用户ID',

&#x20;   title         VARCHAR(100)    NOT NULL COMMENT '任务标题',

&#x20;   description   TEXT            DEFAULT NULL COMMENT '任务详细描述',

&#x20;   category      VARCHAR(20)     NOT NULL COMMENT '分类：EXPRESS取快递 FOOD送餐 PURCHASE代购 OTHER互助',

&#x20;   reward        DECIMAL(10, 2)  NOT NULL COMMENT '悬赏金额',

&#x20;   status        TINYINT         NOT NULL DEFAULT 0 COMMENT '状态：0待接单 1进行中 2已完成 3已取消',

&#x20;   location      VARCHAR(255)    DEFAULT NULL COMMENT '任务地点描述',

&#x20;   deadline      VARCHAR(50)     DEFAULT NULL COMMENT '截止时间说明',

&#x20;   created\_at    DATETIME        NOT NULL DEFAULT CURRENT\_TIMESTAMP COMMENT '创建时间',

&#x20;   updated\_at    DATETIME        NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP COMMENT '更新时间',

&#x20;   PRIMARY KEY (id),

&#x20;   KEY idx\_publisher\_id (publisher\_id),

&#x20;   KEY idx\_status (status),

&#x20;   KEY idx\_category (category)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';



CREATE TABLE IF NOT EXISTS order\_info (

&#x20;   id            BIGINT       NOT NULL AUTO\_INCREMENT COMMENT '主键',

&#x20;   task\_id       BIGINT       NOT NULL COMMENT '关联任务ID',

&#x20;   helper\_id     BIGINT       NOT NULL COMMENT '接单者用户ID',

&#x20;   status        TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0进行中 1已完成 2已取消',

&#x20;   remark        VARCHAR(500) DEFAULT NULL COMMENT '备注',

&#x20;   created\_at    DATETIME     NOT NULL DEFAULT CURRENT\_TIMESTAMP COMMENT '接单时间',

&#x20;   completed\_at  DATETIME     DEFAULT NULL COMMENT '完成时间',

&#x20;   updated\_at    DATETIME     NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP COMMENT '更新时间',

&#x20;   PRIMARY KEY (id),

&#x20;   UNIQUE KEY uk\_task\_id (task\_id),

&#x20;   KEY idx\_helper\_id (helper\_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';



CREATE TABLE IF NOT EXISTS wallet\_transaction (

&#x20;   id                BIGINT          NOT NULL AUTO\_INCREMENT COMMENT '主键',

&#x20;   user\_id           BIGINT          NOT NULL COMMENT '用户ID',

&#x20;   amount            DECIMAL(10, 2)  NOT NULL COMMENT '金额（正数入账，负数出账）',

&#x20;   type              TINYINT         NOT NULL COMMENT '类型：1充值 2提现 3任务支付 4接单收入',

&#x20;   related\_order\_id  BIGINT          DEFAULT NULL COMMENT '关联订单ID',

&#x20;   description       VARCHAR(200)    DEFAULT NULL COMMENT '流水说明',

&#x20;   created\_at        DATETIME        NOT NULL DEFAULT CURRENT\_TIMESTAMP COMMENT '创建时间',

&#x20;   PRIMARY KEY (id),

&#x20;   KEY idx\_user\_id (user\_id),

&#x20;   KEY idx\_type (type)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包流水表';

```



