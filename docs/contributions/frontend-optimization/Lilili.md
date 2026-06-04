# 前端优化贡献说明

姓名：Lilili
日期：2026-05-20

## 我完成的工作

### 1. 新增聊天功能
- [x] 新增 `ChatList.jsx` — 会话列表页面，展示所有对话及未读消息数
- [x] 新增 `ChatRoom.jsx` — 聊天室页面，支持实时消息收发
- [x] 实现消息轮询（每3秒自动刷新）
- [x] 实现乐观更新（发送消息先本地显示，失败后自动回滚）
- [x] 支持 Enter 键快捷发送

### 2. 新增评价功能
- [x] 个人中心新增"查看评价"入口（点击星级评分弹出评价列表）
- [x] 展示收到的所有评价（评分、内容、时间、评价人）
- [x] 对接后端 `/api/review/user/{userId}` 接口

### 3. 个人中心界面优化
- [x] 重构用户资料卡片（头像、姓名、手机号、星级评分）
- [x] 新增钱包充值功能（支持快捷金额10/50/100元）
- [x] 新增发布任务数和接取任务数统计展示
- [x] 优化任务状态显示（兼容数字和字符串两种格式）
- [x] 手机号脱敏显示

### 4. API 层更新
- [x] 新增消息相关接口（sendMessage、getConversation、getConversations）
- [x] 新增评价相关接口（getUserReviews、submitReview、getMyProfile）
- [x] 新增钱包充值接口（recharge）
- [x] 新增订单相关接口（acceptTask、completeOrder、cancelOrder）
- [x] 实现 SSE 实时通知订阅（subscribeNotifications）

### 5. 后端协助
- [x] 协助设计 Message 实体及消息相关接口
- [x] 修复 AuthInterceptor OPTIONS 预检请求拦截问题
- [x] 修复 WebMvcConfig 任务列表接口白名单配置

## 遇到的问题和解决
1. 问题：CORS预检请求被AuthInterceptor拦截返回401
   解决：在AuthInterceptor中添加OPTIONS请求放行
2. 问题：发布任务时token未正确传递导致401
   解决：统一api.js和auth.js的token存储key为helpmate_token
3. 问题：聊天室实时性问题
   解决：采用3秒轮询方案，结合乐观更新提升用户体验

## 心得体会
通过本次前端优化，掌握了React组件设计、乐观更新、
SSE实时通信等实战技能，同时深入理解了前后端联调的完整流程。