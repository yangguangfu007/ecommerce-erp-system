import { test, expect } from '@playwright/test'

/**
 * 全面的端到端测试 - 测试完整的用户工作流程
 */

test.describe('ERP系统全面端到端测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 每个测试前都访问登录页面
    await page.goto('/')
  })

  test('完整的用户登录流程测试', async ({ page }) => {
    // 验证登录页面元素
    await expect(page.locator('.login-title')).toContainText('电商ERP管理系统')
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible()
    await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible()
    
    // 测试无效登录
    await page.fill('input[placeholder="请输入用户名"]', 'invalid')
    await page.fill('input[placeholder="请输入密码"]', 'invalid')
    await page.click('button[type="submit"]')
    
    // 等待错误消息 - 使用toast消息
    await page.waitForTimeout(2000)
    
    // 测试有效登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // 验证登录成功，跳转到仪表板
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    await expect(page.locator('.page-title')).toContainText('仪表板')
  })

  test('仪表板功能测试', async ({ page }) => {
    // 先登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 验证仪表板元素
    await expect(page.locator('.page-title')).toContainText('仪表板')
    
    // 验证统计卡片
    const statCards = page.locator('.stat-card')
    await expect(statCards).toHaveCount(4)
    
    // 验证图表容器
    const chartContainers = page.locator('.chart-container')
    await expect(chartContainers.first()).toBeVisible()
    
    // 验证快捷操作
    const quickActions = page.locator('.dashboard-actions')
    await expect(quickActions).toBeVisible()
  })

  test('用户管理功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 导航到用户管理 - 使用实际的导航链接
    await page.click('a[href="/users"]')
    await expect(page).toHaveURL(/.*users/, { timeout: 5000 })
    
    // 验证用户管理页面元素
    await expect(page.locator('.page-title')).toContainText('用户管理')
    
    // 验证页面基本元素存在
    const pageContent = page.locator('.user-management')
    await expect(pageContent).toBeVisible()
  })

  test('商品管理功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 导航到商品管理
    await page.click('a[href="/products"]')
    await expect(page).toHaveURL(/.*products/, { timeout: 5000 })
    
    // 验证商品管理页面
    await expect(page.locator('.page-title')).toContainText('商品管理')
    
    // 验证页面基本元素存在
    const pageContent = page.locator('.product-management')
    await expect(pageContent).toBeVisible()
  })

  test('订单管理功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 导航到订单管理
    await page.click('a[href="/orders"]')
    await expect(page).toHaveURL(/.*orders/, { timeout: 5000 })
    
    // 验证订单管理页面
    await expect(page.locator('.page-title')).toContainText('订单管理')
    
    // 验证页面基本元素存在
    const pageContent = page.locator('.order-management')
    await expect(pageContent).toBeVisible()
  })

  test('库存管理功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 导航到库存管理
    await page.click('a[href="/inventory"]')
    await expect(page).toHaveURL(/.*inventory/, { timeout: 5000 })
    
    // 验证库存管理页面
    await expect(page.locator('.page-title')).toContainText('库存管理')
    
    // 验证页面基本元素存在
    const pageContent = page.locator('.inventory-management')
    await expect(pageContent).toBeVisible()
  })

  test('响应式布局测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1920, height: 1080 }, // 桌面
      { width: 1366, height: 768 },  // 小桌面
      { width: 1024, height: 768 },  // 平板横屏
      { width: 768, height: 1024 }   // 平板竖屏
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      // 验证布局适应性
      await expect(page.locator('.main-layout')).toBeVisible()
      await expect(page.locator('.sidebar')).toBeVisible()
      await expect(page.locator('.main-content')).toBeVisible()
      
      // 在小屏幕上测试侧边栏折叠
      if (viewport.width < 1024) {
        const sidebarToggle = page.locator('.sidebar-toggle')
        if (await sidebarToggle.isVisible()) {
          await sidebarToggle.click()
          await expect(page.locator('.sidebar')).toHaveClass(/collapsed/)
        }
      }
    }
  })

  test('主题切换功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 测试主题切换
    const themeToggle = page.locator('.theme-toggle')
    if (await themeToggle.isVisible()) {
      // 切换到深色主题
      await themeToggle.click()
      await expect(page.locator('html')).toHaveClass(/dark/)
      
      // 切换回浅色主题
      await themeToggle.click()
      await expect(page.locator('html')).not.toHaveClass(/dark/)
    }
  })

  test('导航和面包屑测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 测试导航到不同页面
    const menuItems = [
      { text: '用户管理', url: /.*users/ },
      { text: '商品管理', url: /.*products/ },
      { text: '订单管理', url: /.*orders/ },
      { text: '库存管理', url: /.*inventory/ }
    ]
    
    for (const item of menuItems) {
      await page.click(`text=${item.text}`)
      await expect(page).toHaveURL(item.url)
      
      // 验证面包屑
      const breadcrumb = page.locator('.breadcrumb')
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toContainText(item.text)
      }
    }
    
    // 返回仪表板
    await page.click('text=仪表板')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('错误处理和用户反馈测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // 测试网络错误处理
    // 模拟网络断开
    await page.route('**/api/**', route => route.abort())
    
    // 尝试访问需要API的页面
    await page.click('text=用户管理')
    
    // 验证错误提示
    await expect(page.locator('.error-message, .el-message--error')).toBeVisible({ timeout: 5000 })
    
    // 恢复网络
    await page.unroute('**/api/**')
  })

  test('性能测试 - 页面加载时间', async ({ page }) => {
    const startTime = Date.now()
    
    // 登录
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    const loadTime = Date.now() - startTime
    console.log('登录到仪表板加载时间:', loadTime, 'ms')
    
    // 验证加载时间在合理范围内（10秒内）
    expect(loadTime).toBeLessThan(10000)
    
    // 测试页面切换性能
    const navigationStartTime = Date.now()
    await page.click('text=用户管理')
    await expect(page).toHaveURL(/.*users/)
    
    const navigationTime = Date.now() - navigationStartTime
    console.log('页面导航时间:', navigationTime, 'ms')
    
    // 验证导航时间在合理范围内（3秒内）
    expect(navigationTime).toBeLessThan(3000)
  })
})