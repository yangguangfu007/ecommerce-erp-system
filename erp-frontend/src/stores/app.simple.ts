/**
 * 简化的应用状态管理
 * 用于测试和调试
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStoreSimple = defineStore('app-simple', () => {
  // 基础状态
  const theme = ref<'light' | 'dark'>('light')
  const language = ref<'zh-CN' | 'en-US'>('zh-CN')
  const sidebarCollapsed = ref<boolean>(false)
  const breadcrumbs = ref<Array<{ title: string; path: string }>>([])
  const activeMenu = ref<string>('')
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isZhCN = computed(() => language.value === 'zh-CN')
  const hasBreadcrumbs = computed(() => breadcrumbs.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // 方法
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const setLanguage = (newLanguage: 'zh-CN' | 'en-US') => {
    language.value = newLanguage
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage
    }
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed.value)
  }

  const setBreadcrumbs = (newBreadcrumbs: Array<{ title: string; path: string }>) => {
    breadcrumbs.value = [...newBreadcrumbs]
  }

  const addBreadcrumb = (breadcrumb: { title: string; path: string }) => {
    const exists = breadcrumbs.value.some(item => item.path === breadcrumb.path)
    if (!exists) {
      breadcrumbs.value.push(breadcrumb)
    }
  }

  const clearBreadcrumbs = () => {
    breadcrumbs.value = []
  }

  const setActiveMenu = (menuKey: string) => {
    activeMenu.value = menuKey
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
    // 状态
    theme,
    language,
    sidebarCollapsed,
    breadcrumbs,
    activeMenu,
    loading,
    error,

    // 计算属性
    isDarkTheme,
    isZhCN,
    hasBreadcrumbs,
    isLoading,
    hasError,

    // 方法
    setTheme,
    toggleTheme,
    setLanguage,
    setSidebarCollapsed,
    toggleSidebar,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
    setActiveMenu,
    setLoading,
    setError,
    clearError,
    resetAppState
  }
})