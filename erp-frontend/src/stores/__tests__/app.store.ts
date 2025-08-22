/**
 * App Store 测试专用实现
 * 简化版本，专门用于测试
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 基础状态
  const theme = ref('light')
  const language = ref('zh-CN')
  const sidebarCollapsed = ref(false)
  const breadcrumbs = ref([])
  const activeMenu = ref('')
  const visitedViews = ref([])
  const cachedViews = ref([])
  const layoutType = ref('default')
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isZhCN = computed(() => language.value === 'zh-CN')
  const hasBreadcrumbs = computed(() => breadcrumbs.value.length > 0)
  const hasVisitedViews = computed(() => visitedViews.value.length > 0)
  const visitedViewsCount = computed(() => visitedViews.value.length)
  const cachedViewsCount = computed(() => cachedViews.value.length)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // 方法
  const setTheme = (newTheme) => {
    theme.value = newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const setLanguage = (newLanguage) => {
    language.value = newLanguage
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage
    }
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setBreadcrumbs = (newBreadcrumbs) => {
    breadcrumbs.value = [...newBreadcrumbs]
  }

  const addBreadcrumb = (breadcrumb) => {
    const exists = breadcrumbs.value.some(item => item.path === breadcrumb.path)
    if (!exists) {
      breadcrumbs.value.push(breadcrumb)
    }
  }

  const clearBreadcrumbs = () => {
    breadcrumbs.value = []
  }

  const setActiveMenu = (menuKey) => {
    activeMenu.value = menuKey
  }

  const addVisitedView = (view) => {
    const exists = visitedViews.value.some(v => v.path === view.path)
    if (!exists) {
      visitedViews.value.push(view)
    }
  }

  const removeVisitedView = (path) => {
    const index = visitedViews.value.findIndex(v => v.path === path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  const removeOtherVisitedViews = (path) => {
    visitedViews.value = visitedViews.value.filter(v => v.path === path || !v.closable)
  }

  const removeAllVisitedViews = () => {
    visitedViews.value = visitedViews.value.filter(v => !v.closable)
  }

  const addCachedView = (name) => {
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
    }
  }

  const removeCachedView = (name) => {
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  const clearCachedViews = () => {
    cachedViews.value = []
  }

  const setLayoutType = (type) => {
    layoutType.value = type
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setError = (errorMessage) => {
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
    visitedViews.value = []
    cachedViews.value = []
    layoutType.value = 'default'
    loading.value = false
    error.value = null
  }

  const initializeApp = () => {
    setTheme(theme.value)
    setLanguage(language.value)
  }

  const getAppInfo = () => {
    return {
      theme: theme.value,
      language: language.value,
      sidebarCollapsed: sidebarCollapsed.value,
      layoutType: layoutType.value,
      visitedViewsCount: visitedViewsCount.value,
      cachedViewsCount: cachedViewsCount.value,
      lastUpdated: Date.now()
    }
  }

  return {
    // 状态
    theme,
    language,
    sidebarCollapsed,
    breadcrumbs,
    activeMenu,
    visitedViews,
    cachedViews,
    layoutType,
    loading,
    error,

    // 计算属性
    isDarkTheme,
    isZhCN,
    hasBreadcrumbs,
    hasVisitedViews,
    visitedViewsCount,
    cachedViewsCount,
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
    addVisitedView,
    removeVisitedView,
    removeOtherVisitedViews,
    removeAllVisitedViews,
    addCachedView,
    removeCachedView,
    clearCachedViews,
    setLayoutType,
    setLoading,
    setError,
    clearError,
    resetAppState,
    initializeApp,
    getAppInfo
  }
})