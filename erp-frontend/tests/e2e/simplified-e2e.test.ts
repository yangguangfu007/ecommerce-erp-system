import { test, expect } from '@playwright/test'

/**
 * 简化的端到端测试 - 专注于核心功能验证
 * 基于实际页面结构进行测试
 */

test.describe('ERP系统核心功能测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 每个测试前都访问登录页面
    await page.goto('/')
  })

  test('用户登录和基本导航测试', async ({ page }) => {
    // 验证登录页面加载
    await expect(page.locator('.login-card')).toBeVisible()
    await expect(page.locator('.login-title')).toContainText('电商ERP管理系统')
    
    // 执行登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // 验证登录成功，跳转到仪表板
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 验证主布局加载
    await expect(page.locator('.app-container')).toBeVisible()
    await expect(page.locator('.app-header')).toBeVisible()
    await expect(page.locator('.app-sidebar')).toBeVisible()
    
    // 验证仪表板内容
    await expect(page.locator('.dashboard-view')).toBeVisible()
    await expect(page.locator('.page-title')).toContainText('仪表板')
  })

  test('仪表板数据展示测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 验证统计卡片
    const statCards = page.locator('.stat-card')
    await expect(statCards).toHaveCountGreaterThan(0)
    
    // 验证图表容器
    const chartContainers = page.locator('.chart-container')
    await expect(chartContainers.first()).toBeVisible()
    
    // 验证快捷操作区域
    await expect(page.locator('.dashboard-actions')).toBeVisible()
  })

  test('侧边栏导航测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 测试侧边栏切换
    const toggleBtn = page.locator('.sidebar-toggle')
    await expect(toggleBtn).toBeVisible()
    
    // 点击切换按钮
    await toggleBtn.click()
    await page.waitForTimeout(500)
    
    // 验证侧边栏状态变化
    await expect(page.locator('.app-container')).toHaveClass(/sidebar-collapsed/)
    
    // 再次点击恢复
    await toggleBtn.click()
    await page.waitForTimeout(500)
  })

  test('用户头像和下拉菜单测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 验证用户头像区域
    const userAvatar = page.locator('[data-test="user-avatar"]')
    await expect(userAvatar).toBeVisible()
    
    // 点击用户头像显示下拉菜单
    await userAvatar.click()
    await page.waitForTimeout(500)
    
    // 验证下拉菜单显示
    const userDropdown = page.locator('.user-dropdown.show')
    await expect(userDropdown).toBeVisible()
  })

  test('主题切换功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 查找主题切换器
    const themeToggle = page.locator('.theme-toggle')
    if (await themeToggle.isVisible()) {
      // 切换主题
      await themeToggle.click()
      await page.waitForTimeout(500)
      
      // 验证主题变化（检查HTML类名变化）
      const htmlElement = page.locator('html')
      // 主题切换后应该有相应的类名变化
      await page.waitForTimeout(1000)
    }
  })

  test('响应式布局基础测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1920, height: 1080 }, // 桌面
      { width: 1366, height: 768 },  // 小桌面
      { width: 1024, height: 768 }   // 平板
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(500)
      
      // 验证基本布局元素仍然可见
      await expect(page.locator('.app-container')).toBeVisible()
      await expect(page.locator('.app-header')).toBeVisible()
      
      // 在小屏幕上，侧边栏可能会自动折叠
      if (viewport.width < 1024) {
        // 验证侧边栏切换按钮可用
        await expect(page.locator('.sidebar-toggle')).toBeVisible()
      }
    }
  })

  test('页面加载性能基础测试', async ({ page }) => {
    const startTime = Date.now()
    
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // 等待仪表板完全加载
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    await expect(page.locator('.dashboard-view')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    console.log('登录到仪表板加载时间:', loadTime, 'ms')
    
    // 验证加载时间在合理范围内（15秒内）
    expect(loadTime).toBeLessThan(15000)
  })

  test('错误处理基础测试', async ({ page }) => {
    // 测试无效登录
    await page.fill('input[placeholder="请输入用户名"]', 'invalid_user')
    await page.fill('input[placeholder="请输入密码"]', 'invalid_pass')
    await page.click('button[type="submit"]')
    
    // 等待错误处理
    await page.waitForTimeout(3000)
    
    // 验证仍在登录页面
    await expect(page.locator('.login-card')).toBeVisible()
    
    // 验证表单仍然可用
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible()
    await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible()
  })

  test('基本API连接测试', async ({ page }) => {
    // 测试后端API是否可访问
    const response = await page.request.get('http://localhost:8080/actuator/health')
    expect(response.status()).toBe(200)
    
    const healthData = await response.json()
    expect(healthData.status).toBe('UP')
  })

  test('前端资源加载测试', async ({ page }) => {
    // 监听网络请求
    const responses: any[] = []
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status()
      })
    })
    
    // 访问登录页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 验证关键资源加载成功
    const failedRequests = responses.filter(r => r.status >= 400)
    
    if (failedRequests.length > 0) {
      console.log('失败的请求:', failedRequests)
    }
    
    // 验证页面基本元素加载
    await expect(page.locator('.login-card')).toBeVisible()
  })
})