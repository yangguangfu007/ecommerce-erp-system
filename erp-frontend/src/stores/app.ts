/**
 * 应用全局状态管理
 * 管理应用级别的状态，如主题、语言、布局等
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useBaseStore, createStateDebugger } from './base'
import { createStoreOptions, storeManager } from './config'
import type { AppState, BreadcrumbItem, TabView } from './types'

// 应用状态接口
export interface AppStoreState extends AppState {
  // 继承基础状态
}

// 主题类型
export type ThemeType = 'light' | 'dark'

// 语言类型
export type LanguageType = 'zh-CN' | 'en-US'

// 布局类型
export type LayoutType = 'default' | 'classic' | 'topNav'

export const useAppStore = defineStore('app', () => {
  // 创建调试器
  const stateDebugger = createStateDebugger('app', {
    logActions: true,
    logMutations: true,
    maxLogEntries: 50
  })

  // 初始状态
  const initialState: AppStoreState = {
    loading: false,
    error: null,
    lastUpdated: null,
    theme: 'light' as ThemeType,
    language: 'zh-CN' as LanguageType,
    sidebarCollapsed: false,
    breadcrumbs: [] as BreadcrumbItem[],
    activeMenu: '',
    visitedViews: [] as TabView[],
    cachedViews: [] as string[]
  }

  // 使用基础存储功能
  const baseStore = useBaseStore(initialState)

  // 应用特定状态 - 直接使用 ref，确保初始化
  const theme = ref<ThemeType>(initialState.theme as ThemeType)
  const language = ref<LanguageType>(initialState.language as LanguageType)
  const sidebarCollapsed = ref<boolean>(initialState.sidebarCollapsed)
  const breadcrumbs = ref<BreadcrumbItem[]>(initialState.breadcrumbs)
  const activeMenu = ref<string>(initialState.activeMenu)
  const visitedViews = ref<TabView[]>(initialState.visitedViews)
  const cachedViews = ref<string[]>(initialState.cachedViews)
  const layoutType = ref<LayoutType>('default')

  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isZhCN = computed(() => language.value === 'zh-CN')
  const hasBreadcrumbs = computed(() => breadcrumbs.value.length > 0)
  const hasVisitedViews = computed(() => visitedViews.value.length > 0)
  const visitedViewsCount = computed(() => visitedViews.value.length)
  const cachedViewsCount = computed(() => cachedViews.value.length)

  // 设置主题
  const setTheme = (newTheme: ThemeType) => {
    stateDebugger.logAction('setTheme', newTheme)
    theme.value = newTheme
    baseStore.updateTimestamp()
    
    // 应用主题到 HTML 元素
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, '')
        .concat(` theme-${newTheme}`)
    }
  }

  // 切换主题
  const toggleTheme = () => {
    stateDebugger.logAction('toggleTheme')
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // 设置语言
  const setLanguage = (newLanguage: LanguageType) => {
    stateDebugger.logAction('setLanguage', newLanguage)
    language.value = newLanguage
    baseStore.updateTimestamp()
    
    // 设置 HTML lang 属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage
    }
  }

  // 设置侧边栏折叠状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    stateDebugger.logAction('setSidebarCollapsed', collapsed)
    sidebarCollapsed.value = collapsed
    baseStore.updateTimestamp()
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    stateDebugger.logAction('toggleSidebar')
    setSidebarCollapsed(!sidebarCollapsed.value)
  }

  // 设置面包屑
  const setBreadcrumbs = (newBreadcrumbs: BreadcrumbItem[]) => {
    stateDebugger.logAction('setBreadcrumbs', newBreadcrumbs)
    breadcrumbs.value = [...newBreadcrumbs]
    baseStore.updateTimestamp()
  }

  // 添加面包屑项
  const addBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    stateDebugger.logAction('addBreadcrumb', breadcrumb)
    const exists = breadcrumbs.value.some(item => item.path === breadcrumb.path)
    if (!exists) {
      breadcrumbs.value.push(breadcrumb)
      baseStore.updateTimestamp()
    }
  }

  // 清除面包屑
  const clearBreadcrumbs = () => {
    stateDebugger.logAction('clearBreadcrumbs')
    breadcrumbs.value = []
    baseStore.updateTimestamp()
  }

  // 设置活动菜单
  const setActiveMenu = (menuKey: string) => {
    stateDebugger.logAction('setActiveMenu', menuKey)
    activeMenu.value = menuKey
    baseStore.updateTimestamp()
  }

  // 添加访问过的视图
  const addVisitedView = (view: TabView) => {
    stateDebugger.logAction('addVisitedView', view)
    const exists = visitedViews.value.some(v => v.path === view.path)
    if (!exists) {
      visitedViews.value.push(view)
      baseStore.updateTimestamp()
    }
  }

  // 删除访问过的视图
  const removeVisitedView = (path: string) => {
    stateDebugger.logAction('removeVisitedView', path)
    const index = visitedViews.value.findIndex(v => v.path === path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
      baseStore.updateTimestamp()
    }
  }

  // 删除其他访问过的视图
  const removeOtherVisitedViews = (path: string) => {
    stateDebugger.logAction('removeOtherVisitedViews', path)
    visitedViews.value = visitedViews.value.filter(v => v.path === path || !v.closable)
    baseStore.updateTimestamp()
  }

  // 删除所有访问过的视图
  const removeAllVisitedViews = () => {
    stateDebugger.logAction('removeAllVisitedViews')
    visitedViews.value = visitedViews.value.filter(v => !v.closable)
    baseStore.updateTimestamp()
  }

  // 添加缓存视图
  const addCachedView = (name: string) => {
    stateDebugger.logAction('addCachedView', name)
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
      baseStore.updateTimestamp()
    }
  }

  // 删除缓存视图
  const removeCachedView = (name: string) => {
    stateDebugger.logAction('removeCachedView', name)
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
      baseStore.updateTimestamp()
    }
  }

  // 清除所有缓存视图
  const clearCachedViews = () => {
    stateDebugger.logAction('clearCachedViews')
    cachedViews.value = []
    baseStore.updateTimestamp()
  }

  // 设置布局类型
  const setLayoutType = (type: LayoutType) => {
    stateDebugger.logAction('setLayoutType', type)
    layoutType.value = type
    baseStore.updateTimestamp()
  }

  // 重置应用状态
  const resetAppState = () => {
    stateDebugger.logAction('resetAppState')
    theme.value = initialState.theme as ThemeType
    language.value = initialState.language as LanguageType
    sidebarCollapsed.value = initialState.sidebarCollapsed
    breadcrumbs.value = []
    activeMenu.value = initialState.activeMenu
    visitedViews.value = []
    cachedViews.value = []
    layoutType.value = 'default'
    baseStore.resetState()
  }

  // 初始化应用设置
  const initializeApp = () => {
    stateDebugger.logAction('initializeApp')
    
    // 应用主题
    setTheme(theme.value)
    
    // 设置语言
    setLanguage(language.value)
    
    // 其他初始化逻辑
    baseStore.updateTimestamp()
  }

  // 获取应用信息
  const getAppInfo = () => {
    return {
      theme: theme.value,
      language: language.value,
      sidebarCollapsed: sidebarCollapsed.value,
      layoutType: layoutType.value,
      visitedViewsCount: visitedViewsCount.value,
      cachedViewsCount: cachedViewsCount.value,
      lastUpdated: baseStore.state.value.lastUpdated
    }
  }

  // 注册到存储管理器
  const store = {
    // 基础状态
    state: baseStore.state,
    
    // 应用特定状态 - 返回 ref 对象以便测试访问 .value
    theme,
    language,
    sidebarCollapsed,
    breadcrumbs,
    activeMenu,
    visitedViews,
    cachedViews,
    layoutType,
    
    // 基础状态属性 - 为了测试兼容性，直接暴露 computed 属性
    loading: computed(() => baseStore.state.value.loading),
    error: computed(() => baseStore.state.value.error),
    
    // 基础状态方法和计算属性
    isLoading: baseStore.isLoading,
    hasError: baseStore.hasError,
    isStale: baseStore.isStale,
    setLoading: baseStore.setLoading,
    setError: baseStore.setError,
    clearError: baseStore.clearError,
    updateTimestamp: baseStore.updateTimestamp,
    patchState: baseStore.patchState,
    withLoading: baseStore.withLoading,
    subscribe: baseStore.subscribe,
    validateState: baseStore.validateState,
    
    // 应用计算属性
    isDarkTheme,
    isZhCN,
    hasBreadcrumbs,
    hasVisitedViews,
    visitedViewsCount,
    cachedViewsCount,
    
    // 应用方法
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
    resetAppState,
    initializeApp,
    getAppInfo
  }

  storeManager.registerStore('app', store)
  
  return store
}, createStoreOptions('app', {
  persist: {
    key: 'erp-app',
    paths: ['theme', 'language', 'sidebarCollapsed', 'layoutType', 'visitedViews']
  }
}))