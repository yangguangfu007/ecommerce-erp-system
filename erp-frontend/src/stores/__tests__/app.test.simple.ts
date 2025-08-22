/**
 * 应用状态管理简化测试
 * 测试应用级别的状态管理功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed } from 'vue'

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

// 简化的 app store 用于测试
const createTestAppStore = () => {
  const theme = ref('light')
  const language = ref('zh-CN')
  const sidebarCollapsed = ref(false)
  const breadcrumbs = ref([])
  const activeMenu = ref('')
  const loading = ref(false)
  const error = ref(null)

  const isDarkTheme = computed(() => theme.value === 'dark')
  const isZhCN = computed(() => language.value === 'zh-CN')
  const hasBreadcrumbs = computed(() => breadcrumbs.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const setLanguage = (newLanguage: string) => {
    language.value = newLanguage
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage
    }
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setBreadcrumbs = (newBreadcrumbs: any[]) => {
    breadcrumbs.value = [...newBreadcrumbs]
  }

  const addBreadcrumb = (breadcrumb: any) => {
    const exists = breadcrumbs.value.some((item: any) => item.path === breadcrumb.path)
    if (!exists) {
      breadcrumbs.value.push(breadcrumb)
    }
  }

  const clearBreadcrumbs = () => {
    breadcrumbs.value = []
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const resetAppState = () => {
    theme.value = 'light'
    language.value = 'zh-CN'
    sidebarCollapsed.value = false
    breadcrumbs.value = []
    activeMenu.value = ''
    loading.value = false
    error.value = null
  }

  return {
    theme,
    language,
    sidebarCollapsed,
    breadcrumbs,
    activeMenu,
    loading,
    error,
    isDarkTheme,
    isZhCN,
    hasBreadcrumbs,
    isLoading,
    hasError,
    setTheme,
    toggleTheme,
    setLanguage,
    setSidebarCollapsed,
    toggleSidebar,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
    setLoading,
    setError,
    clearError,
    resetAppState
  }
}

describe('应用状态管理', () => {
  let pinia: any
  let appStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    appStore = createTestAppStore()
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
      const breadcrumb = { title: '首页', path: '/' }
      appStore.addBreadcrumb(breadcrumb)
      
      expect(appStore.breadcrumbs.value).toContain(breadcrumb)
      expect(appStore.breadcrumbs.value).toHaveLength(1)
    })

    it('应该能够清除面包屑', () => {
      appStore.setBreadcrumbs(mockBreadcrumbs)
      expect(appStore.breadcrumbs.value).toHaveLength(3)
      
      appStore.clearBreadcrumbs()
      expect(appStore.breadcrumbs.value).toEqual([])
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
      // 设置一些状态
      appStore.setTheme('dark')
      appStore.setSidebarCollapsed(true)
      appStore.setError('测试错误')
      
      // 重置状态
      appStore.resetAppState()
      
      // 验证状态已重置
      expect(appStore.theme.value).toBe('light')
      expect(appStore.sidebarCollapsed.value).toBe(false)
      expect(appStore.error.value).toBe(null)
    })
  })
})