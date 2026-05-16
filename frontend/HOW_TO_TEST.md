# 如何使用测试

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 运行测试

```bash
# 运行所有测试
npm run test

# 生成覆盖率报告
npm run test:coverage

# 监听模式（自动重新运行）
npm run test:watch

# 使用 UI 界面
npm run test:ui
```

### 3. 查看覆盖率报告

运行 `npm run test:coverage` 后，会生成以下报告：

- **终端输出**: 直接在命令行查看覆盖率摘要
- **HTML 报告**: 打开 `frontend/coverage/index.html` 查看详细报告
- **LCOV 报告**: `frontend/coverage/lcov.info` 用于 Codecov 上传

## 配置 Codecov

### 1. 注册 Codecov

1. 访问 https://codecov.io/
2. 使用 GitHub 账号登录
3. 添加你的仓库

### 2. 获取 Token

1. 在 Codecov 仓库设置中找到 Upload Token
2. 复制 token

### 3. 配置 GitHub Secret

1. 进入 GitHub 仓库设置
2. 选择 Secrets and variables > Actions
3. 点击 New repository secret
4. 名称: `CODECOV_TOKEN`
5. 值: 粘贴你的 Codecov token
6. 保存

### 4. 更新 README 徽章

编辑 `README.md`，将以下内容中的 `<用户名>` 和 `<仓库名>` 替换为你的实际信息：

```markdown
[![Frontend Coverage](https://codecov.io/gh/<用户名>/<仓库名>/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/<用户名>/<仓库名>)
```

例如：
```markdown
[![Frontend Coverage](https://codecov.io/gh/zhangsan/HelpMate/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/zhangsan/HelpMate)
```

## 测试文件结构

```
frontend/
├── src/
│   ├── __tests__/              # 测试文件目录
│   │   ├── Login.test.jsx      # Login 组件测试
│   │   ├── Register.test.jsx   # Register 组件测试
│   │   ├── Home.test.jsx       # Home 组件测试
│   │   ├── TaskPublish.test.jsx # TaskPublish 组件测试
│   │   └── mockApi.test.js     # API 测试
│   ├── test/
│   │   └── setup.js            # 测试环境设置
│   └── ...
├── coverage/                   # 覆盖率报告（自动生成）
├── vite.config.js             # Vitest 配置
└── package.json               # 测试脚本
```

## 添加新测试

### 组件测试示例

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import YourComponent from '../pages/YourComponent';

describe('YourComponent', () => {
  it('应该渲染组件', () => {
    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('标题')).toBeInTheDocument();
  });
});
```

### API 测试示例

```javascript
import { describe, it, expect } from 'vitest';
import { mockApi } from '../services/mockApi';

describe('API Tests', () => {
  it('应该成功调用 API', async () => {
    const result = await mockApi.someMethod();
    expect(result.success).toBe(true);
  });
});
```

## 常见问题

### Q: 测试失败怎么办？

A: 查看错误信息，通常会指出哪个断言失败了。检查：
- 组件是否正确渲染
- Mock 是否正确配置
- 异步操作是否使用了 waitFor

### Q: 覆盖率太低怎么办？

A:
1. 查看覆盖率报告，找出未覆盖的代码
2. 为关键功能添加测试
3. 不必追求 100% 覆盖率，重点测试核心功能

### Q: 如何 Mock 外部依赖？

A: 使用 `vi.mock()`:

```javascript
vi.mock('../services/api', () => ({
  api: {
    getData: vi.fn(),
  },
}));
```

## 提交代码

```bash
# 运行测试确保通过
npm run test

# 提交代码
git add .
git commit -m "feat: 添加前端测试"
git push
```

GitHub Actions 会自动运行测试并上传覆盖率到 Codecov。

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)
- [Codecov 文档](https://docs.codecov.com/)
