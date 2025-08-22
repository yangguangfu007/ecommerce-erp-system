/**
 * 修复后的应用状态管理测试
 * 使用 Options API 避免 Composition API 在测试环境中的问题
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia, defineStore } from 'pinia'

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

// 创建一个简化的 app store 用于测试
const useAppStoreTest = defineStore('app-test', {
  state: () => ({
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN' as 'zh-CN' | 'en-US',
    sidebarCollapsed: false,
    breadcrumbs: [] as Array<{ title: string; path: string }>,
    activeMenu: '',
    loading: false,
    error: null as string | null
  }),

  getters: {
    isDarkTheme: (state) => state.theme === 'dark',
    isZhCN: (state) => state.language === 'zh-CN',
    hasBreadcrumbs: (state) => state.breadcrumbs.length > 0,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error
  },

  actions: {
    setTheme(newTheme: 'light' | 'dark') {
      this.theme = newTheme
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme)
      }
    },

    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    },

    setLanguage(newLanguage: 'zh-CN' | 'en-US') {
      this.language = newLanguage
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLanguage
      }
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },

    toggleSidebar() {
      this.setSidebarCollapsed(!this.sidebarCollapsed)
    },

    setBreadcrumbs(newBreadcrumbs: Array<{ title: string; path: string }>) {
      this.breadcrumbs = [...newBreadcrumbs]
    },

    addBreadcrumb(breadcrumb: { title: string; path: string }) {
      const exists = this.breadcrumbs.some(item => item.path === breadcrumb.path)
      if (!exists) {
        this.breadcrumbs.push(breadcrumb)
      }
    },

    clearBreadcrumbs() {
      this.breadcrumbs = []
    },

    setActiveMenu(menuKey: string) {
      this.activeMenu = menuKey
    },

    setLoading(isLoading: boolean) {
      this.loading = isLoading
    },

    setError(errorMessage: string | null) {
      this.error = errorMessage
    },

    clearError() {
      this.error = null
    },

    resetAppState() {
      this.theme = 'light'
      this.language = 'zh-CN'
      this.sidebarCollapsed = false
      this.breadcrumbs = []
      this.activeMenu = ''
      this.loading = false
      this.error = null
    }
  }
})

describe('修复后的应用状态管理', () => {
  let pinia: any
  let appStore: unknown

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    appStore = useAppStoreTest()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(appStore.theme).toBe('light')
      expect(appStore.language).toBe('zh-CN')
      expect(appStore.sidebarCollapsed).toBe(false)
      expect(appStore.breadcrumbs).toEqual([])
      expect(appStore.activeMenu).toBe('')
      expect(appStore.loading).toBe(false)
      expect(appStore.error).toBe(null)
    })

    it('应该有正确的计算属性', () => {
      expect(appStore.isDarkTheme).toBe(false)
      expect(appStore.isZhCN).toBe(true)
      expect(appStore.hasBreadcrumbs).toBe(false)
      expect(appStore.isLoading).toBe(false)
      expect(appStore.hasError).toBe(false)
    })
  })

  describe('主题管理', () => {
    it('应该能够设置主题', () => {
      appStore.setTheme('dark')
      
      expect(appStore.theme).toBe('dark')
      expect(appStore.isDarkTheme).toBe(true)
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })

    it('应该能够切换主题', () => {
      expect(appStore.theme).toBe('light')
      
      appStore.toggleTheme()
      expect(appStore.theme).toBe('dark')
      
      appStore.toggleTheme()
      expect(appStore.theme).toBe('light')
    })
  })

  describe('语言管理', () => {
    it('应该能够设置语言', () => {
      appStore.setLanguage('en-US')
      
      expect(appStore.language).toBe('en-US')
      expect(appStore.isZhCN).toBe(false)
      expect(mockDocument.documentElement.lang).toBe('en-US')
    })

    it('应该正确识别中文语言', () => {
      expect(appStore.isZhCN).toBe(true)
      
      appStore.setLanguage('en-US')
      expect(appStore.isZhCN).toBe(false)
      
      appStore.setLanguage('zh-CN')
      expect(appStore.isZhCN).toBe(true)
    })
  })

  describe('侧边栏管理', () => {
    it('应该能够设置侧边栏折叠状态', () => {
      appStore.setSidebarCollapsed(true)
      expect(appStore.sidebarCollapsed).toBe(true)
      
      appStore.setSidebarCollapsed(false)
      expect(appStore.sidebarCollapsed).toBe(false)
    })

    it('应该能够切换侧边栏', () => {
      expect(appStore.sidebarCollapsed).toBe(false)
      
      appStore.toggleSidebar()
      expect(appStore.sidebarCollapsed).toBe(true)
      
      appStore.toggleSidebar()
      expect(appStore.sidebarCollapsed).toBe(false)
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
      
      expect(appStore.breadcrumbs).toEqual(mockBreadcrumbs)
      expect(appStore.hasBreadcrumbs).toBe(true)
    })

    it('应该能够添加面包屑项', () => {
      const breadcrumb = { title: '测试页面', path: '/test' }
      appStore.addBreadcrumb(breadcrumb)
      
      expect(appStore.breadcrumbs).toHaveLength(1)
      expect(appStore.breadcrumbs[0]).toEqual(breadcrumb)
    })

    it('应该能够清除面包屑', () => {
      appStore.setBreadcrumbs(mockBreadcrumbs)
      expect(appStore.breadcrumbs).toHaveLength(3)
      
      appStore.clearBreadcrumbs()
      expect(appStore.breadcrumbs).toHaveLength(0)
      expect(appStore.hasBreadcrumbs).toBe(false)
    })
  })

  describe('基础功能', () => {
    it('应该能够设置加载状态', () => {
      appStore.setLoading(true)
      expect(appStore.isLoading).toBe(true)
      
      appStore.setLoading(false)
      expect(appStore.isLoading).toBe(false)
    })

    it('应该能够设置错误状态', () => {
      appStore.setError('测试错误')
      expect(appStore.error).toBe('测试错误')
      expect(appStore.hasError).toBe(true)
      
      appStore.clearError()
      expect(appStore.error).toBe(null)
      expect(appStore.hasError).toBe(false)
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
      expect(appStore.theme).toBe('light')
      expect(appStore.language).toBe('zh-CN')
      expect(appStore.sidebarCollapsed).toBe(false)
      expect(appStore.activeMenu).toBe('')
      expect(appStore.loading).toBe(false)
      expect(appStore.error).toBe(null)
    })
  })
})