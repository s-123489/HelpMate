# 监控配置贡献说明

姓名：商雨婷
学号：2312190520
日期：2026-06-02

## 我完成的工作

### 1. 日志配置

- [ ] 结构化日志格式
- [x] 日志级别配置

项目通过 SLF4J + Logback 默认配置输出日志，`application.yml` 中开启了 MyBatis Plus SQL 日志：

```yaml
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

关键业务模块已引入日志记录：

- `AIServiceImpl.java`：使用 `LoggerFactory.getLogger()` 记录 AI 调用错误（`log.error("AI service returned status code: {}", ...)`）
- `NotificationServiceImpl.java`：使用 `@Slf4j` 记录 SSE 推送失败（`log.warn("SSE 推送失败, userId={}", userId)`）
- `LocationWebSocketHandler.java`：记录 WebSocket 连接与断开事件（`log.info("位置WebSocket已连接, orderId={}, userId={}", ...)`）

### 2. 健康检查

- [x] /health 端点实现
- [x] 健康检查逻辑

`HealthController.java` 提供 `/health` 端点，返回服务存活状态：

```java
@GetMapping("/health")
public Map<String, String> health() {
    return Map.of("status", "ok");
}
```

该端点与 Docker 健康检查联动：`Dockerfile` 中配置了 `HEALTHCHECK`，`compose.prod.yaml` 中后端和前端服务均通过 `wget -qO- http://localhost:8080/health` 探测，interval 30s，retries 3，容器异常时自动重启。

`/health` 路径已加入 `AuthInterceptor` 白名单，不需要 JWT 鉴权即可访问。

### 3. 指标收集

- [ ] 请求计数
- [ ] 响应时间
- [ ] 错误率（由全局异常处理兜底，暂无独立指标统计）

未引入 Micrometer / Actuator，本期指标收集通过 `GlobalExceptionHandler.java` 进行兜底：

```java
@ExceptionHandler(RuntimeException.class)
public Result<Void> handleRuntime(RuntimeException e) {
    return Result.error(e.getMessage());
}

@ExceptionHandler(Exception.class)
public Result<Void> handleException(Exception e) {
    return Result.error("服务器内部错误");
}
```

所有未捕获异常统一由 `@RestControllerAdvice` 处理并返回标准 `Result` 格式，错误信息可在日志中追溯，但尚未做聚合统计。

## PR 链接

- PR #：（提交后填写）

## 遇到的问题和解决

1. **问题**：`/health` 端点被 `AuthInterceptor` 拦截，Docker 健康检查返回 401 导致容器持续 unhealthy  
   **解决**：在 `WebMvcConfig.java` 的拦截器配置中将 `/health` 加入 `excludePathPatterns`，使其无需 JWT 即可访问

2. **问题**：WebSocket 连接断开时没有任何日志，排查位置推送问题时无从下手  
   **解决**：在 `LocationWebSocketHandler` 的 `afterConnectionClosed()` 中补充 `log.info` 记录 orderId 和关闭原因，方便追踪连接生命周期

## 心得体会

监控不一定要上重型工具才能发挥作用。这次实践让我意识到，在没有 Prometheus / Grafana 的情况下，合理的日志埋点和统一的异常处理已经能覆盖大部分生产问题的排查需求：关键操作记 INFO、预期外的失败记 WARN/ERROR、异常统一收口到 GlobalExceptionHandler。健康检查则是把"服务是否可用"这个问题从人工判断变成了基础设施可以自动响应的信号，是零停机部署和自动重启的前提。
