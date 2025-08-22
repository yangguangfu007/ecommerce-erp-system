import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 端到端测试配置
 * 专注于Web端桌面浏览器的ERP系统测试
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 全局测试超时时间
  timeout: 30000,
  
  // 期望超时时间
  expect: {
    timeout: 5000
  },
  
  // 失败时重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 并行执行的worker数量
  workers: process.env.CI ? 1 : undefined,
  
  // 报告器配置
  reporter: [
    ['html', { outputFolder: 'test-reports/playwright-report' }],
    ['json', { outputFile: 'test-reports/playwright-results.json' }],
    ['junit', { outputFile: 'test-reports/playwright-junit.xml' }]
  ],
  
  // 全局设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',
    
    // 浏览器上下文选项
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 等待策略
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // 项目配置 - Web端桌面浏览器测试
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // 使用系统浏览器
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      }
    }
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})