import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 端到端测试配置
 * 专注于Web端桌面浏览器的ERP系统测试
 * 配置session共享以避免重复登录
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 全局测试超时时间
  timeout: 60000,
  
  // 期望超时时间
  expect: {
    timeout: 10000
  },
  
  // 失败时重试次数
  retries: process.env.CI ? 2 : 1,
  
  // 并行执行的worker数量 - 设置为1确保session共享
  workers: 1,
  
  // 报告器配置
  reporter: [
    ['html', { outputFolder: 'test-reports/playwright-report' }],
    ['json', { outputFile: 'test-reports/playwright-results.json' }],
    ['junit', { outputFile: 'test-reports/playwright-junit.xml' }],
    ['list']
  ],
  
  // 全局设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',
    
    // 浏览器上下文选项
    trace: 'on', // 总是记录trace
    screenshot: 'on', // 总是截图
    video: 'on', // 总是录制视频
    
    // 等待策略
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,
    
    // 设置用户代理
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },

  // 项目配置 - 简化配置，专注于基础测试
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        channel: 'chrome'
      }
    }
  ],

  // 开发服务器配置 - 不自动启动，需要手动启动服务
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: true,
  //   timeout: 120000
  // }
})