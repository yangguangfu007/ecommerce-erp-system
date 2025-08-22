/**
 * 应用状态管理简化测试
 * 测试基本的 store 功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock document
const mockDocument = {
  documentElement: {
    setAttribute: vi.fn(),
    className: 'existing-class theme-light',
    lang: 'zh-CN'
  }
}

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
})

describe('应用状态管理 - 简化测试', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('应该能够创建 store 实例', async () => {
    // 动态导入以避免模块加载问题
    const { useAppStore } = await import('../app')
    const appStore = useAppStore()
    
    // 基本检查 - store 应该存在
    expect(appStore).toBeDefined()
    expect(typeof appStore).toBe('object')
  })

  it('应该有基本的方法', async () => {
    const { useAppStore } = await import('../app')
    const appStore = useAppStore()
    
    // 检查方法是否存在
    expect(typeof appStore.setTheme).toBe('function')
    expect(typeof appStore.setLanguage).toBe('function')
    expect(typeof appStore.setSidebarCollapsed).toBe('function')
  })

  it('应该能够调用方法而不报错', async () => {
    const { useAppStore } = await import('../app')
    const appStore = useAppStore()
    
    // 调用方法应该不报错
    expect(() => {
      appStore.setTheme('dark')
      appStore.setLanguage('en-US')
      appStore.setSidebarCollapsed(true)
    }).not.toThrow()
  })
})