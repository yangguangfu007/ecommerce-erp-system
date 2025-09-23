# 端到端测试 (E2E Tests)

## 概述

本项目提供了简化的端到端测试，专注于核心功能验证：
- 用户登录功能
- 主要页面导航
- Session共享机制
- 页面错误检查

## 测试特点

### Session共享机制
- **串行执行**: 使用 `test.describe.configure({ mode: 'serial' })` 确保测试按顺序执行
- **状态保持**: 第一次登录后，后续测试复用同一个session
- **自动恢复**: 如果session失效，自动重新登录
- **避免重复**: 大大减少测试执行时间，避免每个测试都重新登录

### 测试内容

#### 1. 登录测试
- 验证用户名/密码登录功能
- 确认登录成功后跳转到仪表板

#### 2. 页面导航测试
测试以下主要页面的访问：
- 仪表板 (`/dashboard`)
- 用户管理 (`/users`)
- 角色管理 (`/roles`)
- 商品管理 (`/products`)
- 订单管理 (`/orders`)
- 库存管理 (`/inventory`)
- 系统设置 (`/settings`)

#### 3. Session共享验证
- 快速切换多个页面
- 验证不需要重新登录
- 确认session在整个测试过程中保持有效

#### 4. 页面错误检查
- 监听JavaScript错误
- 确保页面正常加载无报错

## 运行测试

### 前置条件

1. **启动后端服务**：
```bash
./scripts/start-infrastructure.sh  # 启动基础设施
./scripts/start-backend.sh         # 启动后端服务
```

2. **启动前端服务**：
```bash
./scripts/start-frontend.sh        # 启动前端服务
```

3. **验证服务状态**：
- 前端: http://localhost:3000
- 后端: http://localhost:8080/actuator/health

### 运行测试

#### 方式1：使用测试脚本（推荐）

**快速检查（开发时使用）**：
```bash
# 运行前3个核心测试用例
./tests/e2e/e2e-quick-check.sh
```

**完整测试（CI/CD使用）**：
```bash
# 运行所有10个测试用例
./tests/e2e/e2e-full-test.sh
```

**使用npm脚本**：
```bash
cd erp-frontend

# 快速检查
npm run test:e2e:quick

# 完整测试
npm run test:e2e:full

# 直接运行测试
npm run test:e2e
```

#### 方式2：直接使用Playwright
```bash
# 进入前端目录
cd erp-frontend

# 运行测试（有界面模式）
npx playwright test tests/e2e/basic-e2e.spec.ts --headed

# 运行测试（无界面模式）
npx playwright test tests/e2e/basic-e2e.spec.ts

# 运行测试并生成报告
npx playwright test tests/e2e/basic-e2e.spec.ts --reporter=html
```

### 重要提示：Redis缓存清理

**为什么需要清理Redis缓存？**
- 系统有登录失败保护机制，多次失败会锁定用户
- 测试过程中可能触发异常登录检测
- 清理缓存确保测试环境干净

**如何处理？**
- 运行测试脚本时会提示是否清理Redis缓存
- 建议选择 `y` 清理缓存，确保测试正常
- 如果遇到登录异常，重新运行并选择清理缓存

**手动清理命令**：
```bash
# 清理所有Redis缓存
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 只清理特定用户锁定信息
docker exec erp-redis redis-cli -a redis123 DEL "user:lock:admin"
docker exec erp-redis redis-cli -a redis123 DEL "user:error:admin"
```

## 测试配置

### Playwright配置
测试使用项目根目录的 `playwright.config.ts` 配置文件：

```typescript
// 关键配置项
{
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,  // 显示浏览器界面
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
}
```

### 测试账号
- **用户名**: `admin`
- **密码**: `admin123`

## Session共享原理

### 实现机制
```typescript
// 使用串行模式确保测试顺序执行
test.describe.configure({ mode: 'serial' })

// 全局登录状态标记
let isLoggedIn = false

// 智能登录函数
async function performLogin(page: any) {
  if (isLoggedIn) {
    console.log('已登录，跳过登录步骤')
    return
  }
  // 执行登录逻辑...
  isLoggedIn = true
}

// 带认证检查的导航函数
async function navigateToPage(page: any, path: string) {
  await page.goto(path)
  
  // 如果跳转到登录页面，说明session失效
  if (page.url().includes('/login')) {
    isLoggedIn = false
    await performLogin(page)
    await page.goto(path)
  }
}
```

### 优势
1. **性能提升**: 避免重复登录，测试执行更快
2. **真实场景**: 模拟用户在同一session中的操作
3. **稳定性**: 自动处理session失效情况
4. **简化维护**: 减少测试代码复杂度

## 扩展测试

### 添加新页面测试
在 `basic-e2e.spec.ts` 中添加新的测试用例：

```typescript
test('新页面导航测试', async ({ page }) => {
  await navigateToPage(page, '/new-page')
  
  // 验证页面正常加载
  expect(page.url()).toMatch(/new-page/)
  
  // 添加页面特定的验证逻辑
  // ...
  
  console.log('✓ 新页面导航成功')
})
```

### 添加交互测试
```typescript
test('页面交互测试', async ({ page }) => {
  await navigateToPage(page, '/users')
  
  // 测试按钮点击
  await page.click('button:has-text("新增用户")')
  
  // 测试表单填写
  await page.fill('input[name="username"]', 'testuser')
  
  // 验证结果
  // ...
})
```

## 故障排除

### 常见问题

1. **服务未启动**
```bash
# 检查服务状态
curl http://localhost:3000        # 前端
curl http://localhost:8080/actuator/health  # 后端

# 启动服务
./scripts/start-services.sh
```

2. **登录失败**
- 检查用户名密码是否正确 (`admin` / `admin123`)
- 确认后端用户服务正常运行
- 检查数据库中是否有测试用户数据

3. **页面导航失败**
- 检查前端路由配置
- 确认页面组件正常加载
- 查看浏览器控制台错误信息

4. **Session失效**
- 检查后端JWT配置
- 确认Redis服务正常运行
- 查看后端日志中的认证相关错误

### 调试技巧

1. **启用调试模式**
```bash
# 运行测试时显示浏览器
npx playwright test --headed --debug
```

2. **查看测试报告**
```bash
# 生成HTML报告
npx playwright test --reporter=html
npx playwright show-report
```

3. **截图和录像**
测试失败时会自动生成截图和录像，保存在 `test-results/` 目录

## 最佳实践

1. **保持测试简单**: 专注于核心功能验证
2. **使用Session共享**: 避免重复登录操作
3. **添加适当等待**: 使用 `waitForLoadState` 确保页面完全加载
4. **错误处理**: 优雅处理session失效等异常情况
5. **日志记录**: 添加清晰的日志输出便于调试

## 维护指南

### 定期维护
- 更新测试账号密码
- 检查页面路由变更
- 更新选择器和断言
- 优化测试执行性能

### 版本升级
- 升级Playwright版本
- 更新浏览器驱动
- 调整配置参数
- 测试兼容性

---

更多信息请参考：
- [Playwright官方文档](https://playwright.dev/)
- [项目开发指南](../../docs/development-guide.md)
- [前端测试文档](../README.md)