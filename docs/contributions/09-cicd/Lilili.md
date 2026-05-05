# CI/CD 配置贡献说明

姓名：李丽丽　角色：API　日期：2026-05-05

## 完成的工作

### 工作流相关

- [x] 参与审查并合并 `.github/workflows/ci.yml`
- [x] 整合 backend 和 frontend 两个 job 到同一个 ci.yml
- [x] 配置 Codecov Token 到 GitHub Secrets
- [x] 配置 Codecov 覆盖率上传（backend / frontend flag）
- [x] 添加 README 状态徽章（CI、Backend Coverage、Frontend Coverage）

### 代码适配

- [x] 更新 frontend/package-lock.json 修复 CI 依赖问题
- [x] 修复 vite build 权限问题（chmod +x）
- [x] 将 develop 分支合并至 main，解决多次 merge conflict

## CI 运行链接

- https://github.com/s-123489/HelpMate/actions/runs/25366557131

## 遇到的问题和解决

1. 问题：README.md 存在 merge conflict → 解决：手动整合前后端两个版本
2. 问题：frontend npm ci 失败，package-lock.json 缺少 esbuild 相关包 → 解决：本地重新执行 npm install 更新 lock 文件
3. 问题：vite build 报 Permission denied → 解决：在 ci.yml 中加入 chmod +x node_modules/.bin/vite
4. 问题：codecov 徽章显示 unknown → 解决：配置 CODECOV_TOKEN 到 GitHub Secrets 并更新 ci.yml 上传覆盖率

## 心得体会

本次负责 CI/CD 整体配置与整合，包括合并各成员分支、解决冲突、配置 Codecov 覆盖率上传。过程中多次遇到 merge conflict 和 CI 报错，通过逐步排查解决了依赖缺失、权限问题等。深刻理解了多人协作时分支管理和 CI 配置的重要性。