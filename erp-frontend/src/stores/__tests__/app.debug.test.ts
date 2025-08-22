/**
 * 应用状态管理调试测试
 * 调试 store 结构问题
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

describe('应用状态管理 - 调试测试', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('应该检查 store 的结构', async () => {
    const { useAppStore } = await import('../app')
    const appStore = useAppStore()
    
    // 使用断言来显示信息
    expect(Object.keys(appStore).length).toBeGreaterThan(0)
    expect(appStore.theme).toBeDefined()
    
    // 检查 theme 是否是 ref
    if (appStore.theme && typeof appStore.theme === 'object' && 'value' in appStore.theme) {
      expect(appStore.theme.value).toBeDefined()
    }
  })

  it('应该测试初始值', async () => {
    const { useAppStore } = await import('../app')
    const appStore = useAppStore()
    
    // 尝试不同的访问方式
    console.log('Direct theme access:', appStore.theme)
    
    if (appStore.theme && typeof appStore.theme === 'object' && 'value' in appStore.theme) {
      console.log('Theme value via .value:', appStore.theme.value)
      expect(appStore.theme.value).toBeDefined()
    } else {
      console.log('Theme is not a ref, direct value:', appStore.theme)
      expect(appStore.theme).toBeDefined()
    }
  })
})