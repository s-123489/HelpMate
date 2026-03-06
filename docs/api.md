API设计文档（初步）



模块功能

HelpMate 是一个校园跑腿/互助平台，核心功能包括：发布任务、接单、实时位置、评价系统、钱包支付



技术选型：

框架：Spring Boot

接口风格：RESTful

实时通信：WebSocket

数据格式：JSON

第三方支付：微信支付 / 支付宝 API



主要接口设计



1\.任务接口

| 方法 | 路径 | 说明 |

|------|------|------|

| POST | /api/tasks | 发布任务 |

| GET | /api/tasks | 获取任务列表 |

| GET | /api/tasks/{id} | 获取任务详情 |

| PUT | /api/tasks/{id}/accept | 接单 |

| PUT | /api/tasks/{id}/complete | 完成任务 |



2\.用户接口

| 方法 | 路径 | 说明 |

|------|------|------|

| POST | /api/users/register | 注册 |

| POST | /api/users/login | 登录 |

| GET | /api/users/{id} | 获取用户信息 |



3\.评价接口

| 方法 | 路径 | 说明 |

|------|------|------|

| POST | /api/reviews | 提交评价 |

| GET | /api/reviews/{userId} | 获取用户评价 |



4\.钱包接口

| 方法 | 路径 | 说明 |

|------|------|------|

| GET | /api/wallet/balance | 查询余额 |

| POST | /api/wallet/pay | 发起支付 |

| GET | /api/wallet/records | 交易记录 |



WebSocket

连接地址：ws://服务器地址/ws/location/{taskId}

用途：跑腿员实时位置推送



项目目录结构（初步）

HelpMate/

├── README.md

├── .gitignore

├── docs/

│   ├── frontend.md        # 前端说明

│   ├── backend.md         # 后端说明

│   └── api.md             # API 设计（本文档）

├── frontend/              # 前端代码（小程序 / React Native）

│   ├── pages/             # 页面

│   ├── components/        # 组件

│   └── utils/             # 工具函数

└── backend/               # 后端代码（Spring Boot）

&nbsp;   ├── src/

&nbsp;   │   └── main/

&nbsp;   │       └── java/

&nbsp;   │           └── com/helpmate/

&nbsp;   │               ├── controller/    # 接口层

&nbsp;   │               ├── service/       # 业务逻辑层

&nbsp;   │               ├── repository/    # 数据访问层

&nbsp;   │               └── model/         # 数据模型

&nbsp;   └── pom.xml



运行方式

mvn spring-boot:run

