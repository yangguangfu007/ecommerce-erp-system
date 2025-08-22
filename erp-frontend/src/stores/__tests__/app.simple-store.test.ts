/**
 * 简化应用状态管理测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

import { useAppStoreSimple } from '../app.simple'

describe('简化应用状态管理', () => {
  let pinia: any
  let appStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    appStore = useAppStoreSimple()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(appStore.theme.value).toBe('light')
      expect(appStore.language.value).toBe('zh-CN')
      expect(appStore.sidebarCollapsed.value).toBe(false)
      expect(appStore.breadcrumbs.value).toEqual([])
      expect(appStore.activeMenu.value).toBe('')
      expect(appStore.loading.value).toBe(false)
      expect(appStore.error.value).toBe(null)
    })

    it('应该有正确的计算属性', () => {
      expect(appStore.isDarkTheme.value).toBe(false)
      expect(appStore.isZhCN.value).toBe(true)
      expect(appStore.hasBreadcrumbs.value).toBe(false)
      expect(appStore.isLoading.value).toBe(false)
      expect(appStore.hasError.value).toBe(false)
    })
  })

  describe('主题管理', () => {
    it('应该能够设置主题', () => {
      appStore.setTheme('dark')
      
      expect(appStore.theme.value).toBe('dark')
      expect(appStore.isDarkTheme.value).toBe(true)
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })

    it('应该能够切换主题', () => {
      expect(appStore.theme.value).toBe('light')
      
      appStore.toggleTheme()
      expect(appStore.theme.value).toBe('dark')
      
      appStore.toggleTheme()
      expect(appStore.theme.value).toBe('light')
    })
  })

  describe('语言管理', () => {
    it('应该能够设置语言', () => {
      appStore.setLanguage('en-US')
      
      expect(appStore.language.value).toBe('en-US')
      expect(appStore.isZhCN.value).toBe(false)
      expect(mockDocument.documentElement.lang).toBe('en-US')
    })

    it('应该正确识别中文语言', () => {
      expect(appStore.isZhCN.value).toBe(true)
      
      appStore.setLanguage('en-US')
      expect(appStore.isZhCN.value).toBe(false)
      
      appStore.setLanguage('zh-CN')
      expect(appStore.isZhCN.value).toBe(true)
    })
  })

  describe('侧边栏管理', () => {
    it('应该能够设置侧边栏折叠状态', () => {
      appStore.setSidebarCollapsed(true)
      expect(appStore.sidebarCollapsed.value).toBe(true)
      
      appStore.setSidebarCollapsed(false)
      expect(appStore.sidebarCollapsed.value).toBe(false)
    })

    it('应该能够切换侧边栏', () => {
      expect(appStore.sidebarCollapsed.value).toBe(false)
      
      appStore.toggleSidebar()
      expect(appStore.sidebarCollapsed.value).toBe(true)
      
      appStore.toggleSidebar()
      expect(appStore.sidebarCollapsed.value).toBe(false)
    })
  })

  describe('面包屑管理', () => {
    const mockBreadcrumbs = [
      { title: '首页', path: '/' },
      { title: '用户管理', path: '/users' },
      { title: '用户详情', path: '/users/1' }
    ]

    it('应该能够设置面包屑', () => {
      appStore.setBreadcrumbs(mockBreadcrumbs)
      
      expect(appStore.breadcrumbs.value).toEqual(mockBreadcrumbs)
      expect(appStore.hasBreadcrumbs.value).toBe(true)
    })

    it('应该能够添加面包屑项', () => {
      const breadcrumb = { title: '测试页面', path: '/test' }
      appStore.addBreadcrumb(breadcrumb)
      
      expect(appStore.breadcrumbs.value).toContain(breadcrumb)
      expect(appStore.breadcrumbs.value).toHaveLength(1)
    })

    it('应该能够清除面包屑', () => {
      appStore.setBreadcrumbs(mockBreadcrumbs)
      expect(appStore.breadcrumbs.value).toHaveLength(3)
      
      appStore.clearBreadcrumbs()
      expect(appStore.breadcrumbs.value).toHaveLength(0)
      expect(appStore.hasBreadcrumbs.value).toBe(false)
    })
  })

  describe('基础功能', () => {
    it('应该能够设置加载状态', () => {
      appStore.setLoading(true)
      expect(appStore.isLoading.value).toBe(true)
      
      appStore.setLoading(false)
      expect(appStore.isLoading.value).toBe(false)
    })

    it('应该能够设置错误状态', () => {
      appStore.setError('测试错误')
      expect(appStore.error.value).toBe('测试错误')
      expect(appStore.hasError.value).toBe(true)
      
      appStore.clearError()
      expect(appStore.error.value).toBe(null)
      expect(appStore.hasError.value).toBe(false)
    })

    it('应该能够重置状态', () => {
      // 修改一些状态
      appStore.setTheme('dark')
      appStore.setLanguage('en-US')
      appStore.setSidebarCollapsed(true)
      appStore.setActiveMenu('test')
      appStore.setLoading(true)
      appStore.setError('测试错误')
      
      // 重置状态
      appStore.resetAppState()
      
      // 验证状态已重置
      expect(appStore.theme.value).toBe('light')
      expect(appStore.language.value).toBe('zh-CN')
      expect(appStore.sidebarCollapsed.value).toBe(false)
      expect(appStore.activeMenu.value).toBe('')
      expect(appStore.loading.value).toBe(false)
      expect(appStore.error.value).toBe(null)
    })
  })
})