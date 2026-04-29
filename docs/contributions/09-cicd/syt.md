# CI/CD 配置贡献说明

姓名：商雨婷　角色：后端　日期：2026-04-29

## 完成的工作

### 工作流相关

- [x] 参与编写 `.github/workflows/ci.yml`（backend + frontend 两个 job）
- [x] 配置 Codecov 覆盖率上传（backend flag）
- [x] 添加 README CI 状态徽章及 Codecov 覆盖率徽章

### 代码适配

- [x] 后端测试全部使用 Mockito（`@WebMvcTest` + `@ExtendWith(MockitoExtension.class)`），不依赖真实数据库，CI 无需启动 MySQL 服务容器
- [x] JaCoCo 已集成在 `pom.xml`，`mvn test` 自动生成覆盖率报告
- [x] 核心覆盖率达标（> 60%）：UserService、TaskService、UserController、TaskController 共 30 个测试用例

### CI 工作流说明

**backend job：**
1. 使用 JDK 17（temurin）
2. `mvn -B test` 运行全部单元测试 + 生成 JaCoCo XML 报告
3. 通过 `codecov/codecov-action` 上传 `target/site/jacoco/jacoco.xml`

**frontend job：**
1. 使用 Node.js 20
2. `npm ci` 安装依赖
3. `tsc --noEmit` 类型检查
4. `npm run build` 构建验证

## PR 链接

- PR #：（提交后填写）

## CI 运行链接

- https://github.com/s-123489/HelpMate/actions

## 遇到的问题和解决

1. 问题：后端测试全为 Mockito 单元测试，CI 不需要数据库，但 `application.yml` 写死了 MySQL 连接，如果 Spring 完整启动会报错 → 解决：`@WebMvcTest` 只加载 Web 层切片，不初始化数据源，CI 中只需设置 `AI_API_KEY=dummy` 即可通过

## 心得体会

通过 GitHub Actions 实现了推送/PR 自动触发测试，结合 JaCoCo + Codecov 可以在每次 PR 中直观看到覆盖率变化，有效防止新代码降低覆盖率。
