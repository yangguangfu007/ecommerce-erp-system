/**
 * Vitest 集成测试配置
 * 专门用于集成测试的配置文件
 */
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 测试文件匹配模式
    include: [
      'src/__tests__/integration.test.ts',
      'src/__tests__/system-integration.test.ts',
      'src/__tests__/final-integration.test.ts',
      'src/__tests__/comprehensive-system.test.ts'
    ],
    
    // 测试超时时间
    testTimeout: 30000,
    
    // 钩子超时时间
    hookTimeout: 30000,
    
    // 设置文件
    setupFiles: ['src/test-setup.ts'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-reports/coverage-integration',
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    
    // 报告器配置
    reporter: ['verbose', 'json'],
    outputFile: './test-reports/integration-results.json'
  }
})