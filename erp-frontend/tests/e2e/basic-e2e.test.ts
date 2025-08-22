import { test, expect } from '@playwright/test'

/**
 * 基础端到端测试 - 测试核心用户流程
 * 使用真实API进行测试
 */

const BASE_URL = 'http://localhost:3000'

test.describe('ERP系统基础功能测试', () => {
  
  test('用户登录流程', async ({ page }) => {
    // 访问登录页面
    await page.goto(BASE_URL)
    
    // 验证页面标题
    await expect(page).toHaveTitle(/ERP/)
    
    // 验证登录表单存在
    await expect(page.locator('[data-test="login-form"]')).toBeVisible()
    
    // 测试无效登录
    await page.fill('[data-test="username"]', 'invalid')
    await page.fill('[data-test="password"]', 'invalid')
    await page.click('[data-test="login-btn"]')
    
    // 等待错误消息出现
    await page.waitForTimeout(2000)
    
    // 测试有效登录
    await page.fill('[data-test="username"]', 'admin')
    await page.fill('[data-test="password"]', 'admin123')
    await page.click('[data-test="login-btn"]')
    
    // 等待页面跳转
    await page.waitForTimeout(3000)
    
    // 验证登录成功 - 检查URL变化或页面元素
    const currentUrl = page.url()
    console.log('当前URL:', currentUrl)
    
    // 验证主布局加载
    await expect(page.locator('[data-test="main-layout"]')).toBeVisible()
  })

  test('导航功能测试', async ({ page }) => {
    // 先登录
    await page.goto(BASE_URL)
    await page.fill('[data-test="username"]', 'admin')
    await page.fill('[data-test="password"]', 'admin123')
    await page.click('[data-test="login-btn"]')
    
    // 等待登录完成
    await page.waitForTimeout(3000)
    
    // 测试侧边栏切换
    const toggleBtn = page.locator('[data-test="nav-toggle"]')
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click()
      await page.waitForTimeout(1000)
    }
    
    // 验证用户头像存在
    await expect(page.locator('[data-test="user-avatar"]')).toBeVisible()
  })

  test('API连接测试', async ({ page }) => {
    // 测试API是否可访问
    const response = await page.request.get('http://localhost:8080/actuator/health')
    expect(response.status()).toBe(200)
    
    // 测试用户服务
    const userServiceResponse = await page.request.get('http://localhost:8001/actuator/health')
    expect(userServiceResponse.status()).toBe(200)
  })

  test('页面加载性能测试', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    console.log('页面加载时间:', loadTime, 'ms')
    
    // 验证页面加载时间小于5秒
    expect(loadTime).toBeLessThan(5000)
  })

  test('响应式布局测试', async ({ page }) => {
    // 测试不同分辨率
    const resolutions = [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 }
    ]

    for (const resolution of resolutions) {
      await page.setViewportSize(resolution)
      await page.goto(BASE_URL)
      
      // 验证登录表单在不同分辨率下正常显示
      await expect(page.locator('[data-test="login-form"]')).toBeVisible()
    }
  })
})