\# 软件测试贡献说明



姓名：Lilili

角色：后端（API测试协助）

日期：2026-04-22



\## 完成的测试工作



\### 测试文件

\- `backend/src/test/java/com/helpmate/service/UserServiceTest.java`

\- `backend/src/test/java/com/helpmate/service/TaskServiceTest.java`

\- `backend/src/test/java/com/helpmate/controller/UserControllerTest.java`

\- `backend/src/test/java/com/helpmate/controller/TaskControllerTest.java`



\### 测试清单



\#### UserServiceTest（8个）

\- \[x] register\_success — 正常注册成功

\- \[x] register\_duplicateUsername\_throwsException — 用户名重复异常

\- \[x] register\_balanceDefaultZero — 注册余额默认为0

\- \[x] register\_passwordIsEncrypted — 密码已加密存储

\- \[x] login\_success\_returnsToken — 正常登录返回token

\- \[x] login\_callsGenerateTokenWithCorrectUse — 登录调用token生成

\- \[x] login\_userNotFound\_throwsException — 用户不存在异常

\- \[x] login\_wrongPassword\_throwsException — 密码错误异常



\#### TaskServiceTest（7个）

\- \[x] createTask\_setsAllFieldsFromRequest — 创建任务字段正确

\- \[x] createTask\_setsPublisherIdAndStatus — 发布者ID和状态正确

\- \[x] createTask\_success\_returnsId — 创建任务返回ID

\- \[x] listTasks\_noCategory\_returnsAllPendingTasks — 无分类返回所有待接单任务

\- \[x] listTasks\_pageParamsPassedCorrectly — 分页参数正确传递

\- \[x] listTasks\_withCategory\_filtersCorrectly — 分类筛选正确

\- \[x] listTasks\_emptyResult\_returnsEmptyPage — 空结果返回空分页



\#### UserControllerTest（7个）

\- \[x] register\_success\_returns200 — 注册成功返回200

\- \[x] register\_missingUsername\_returns400 — 缺少用户名返回400

\- \[x] register\_passwordTooShort\_returns400 — 密码太短返回400

\- \[x] register\_duplicateUsername\_returns500 — 用户名重复返回500

\- \[x] login\_success\_returnsTokenAndUsername — 登录成功返回token和用户名

\- \[x] login\_wrongPassword\_returns500 — 密码错误返回500

\- \[x] login\_missingUsername\_returns400 — 缺少用户名返回400



\#### TaskControllerTest（7个）

\- \[x] createTask\_withValidToken\_returns200 — 有效token发布任务返回200

\- \[x] listTasks\_noParams\_returnsDefaultPage — 无参数返回默认分页

\- \[x] listTasks\_withCategoryFilter\_returnsFiltered — 分类筛选返回正确结果

\- \[x] listTasks\_emptyResult\_returnsEmptyRecords — 空结果返回空记录

\- \[x] createTask\_missingCategory\_returns400 — 缺少分类返回400

\- \[x] createTask\_rewardTooLow\_returns400 — 悬赏金额太低返回400

\- \[x] createTask\_missingTitle\_returns400 — 缺少标题返回400



\### 覆盖率

\- 测试总数：29个，全部通过

\- 覆盖场景：正常情况、边界情况、异常情况



\## PR 链接

\- PR #1: https://github.com/s-123489/HelpMate/pull/1

\- PR #4: https://github.com/s-123489/HelpMate/pull/4

