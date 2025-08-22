/**
 * 状态管理类型定义测试
 * 测试状态管理相关的类型定义和常量
 */

import { describe, it, expect } from 'vitest'
import type {
  BaseState,
  UserState,
  AppState,
  PermissionState,
  BusinessState,
  BreadcrumbItem,
  TabView,
  RouteConfig,
  RouteMeta,
  PersistConfig,
  StoreConfig,
  StateSyncConfig,
  StateDebugConfig,
  GlobalState
} from '../types'
import {
  DEFAULT_PERSIST_CONFIG,
  DEFAULT_SYNC_CONFIG,
  DEFAULT_DEBUG_CONFIG
} from '../types'

describe('状态管理类型定义', () => {
  describe('基础状态接口', () => {
    it('应该定义正确的 BaseState 接口', () => {
      const baseState: BaseState = {
        loading: false,
        error: null,
        lastUpdated: null
      }

      expect(baseState.loading).toBe(false)
      expect(baseState.error).toBe(null)
      expect(baseState.lastUpdated).toBe(null)
    })

    it('应该允许 BaseState 的可选字段', () => {
      const baseState: BaseState = {
        loading: true,
        error: '错误信息',
        lastUpdated: Date.now()
      }

      expect(baseState.loading).toBe(true)
      expect(baseState.error).toBe('错误信息')
      expect(typeof baseState.lastUpdated).toBe('number')
    })
  })

  describe('用户状态接口', () => {
    it('应该定义正确的 UserState 接口', () => {
      const userState: UserState = {
        loading: false,
        error: null,
        lastUpdated: null,
        token: 'test-token',
        refreshToken: 'refresh-token',
        user: null,
        stores: [],
        currentStoreId: null
      }

      expect(userState.token).toBe('test-token')
      expect(userState.refreshToken).toBe('refresh-token')
      expect(userState.user).toBe(null)
      expect(Array.isArray(userState.stores)).toBe(true)
      expect(userState.currentStoreId).toBe(null)
    })

    it('应该扩展 BaseState', () => {
      const userState: UserState = {
        loading: true,
        error: '用户错误',
        lastUpdated: Date.now(),
        token: '',
        refreshToken: '',
        user: null,
        stores: [],
        currentStoreId: null
      }

      // 验证继承的基础状态属性
      expect(userState.loading).toBe(true)
      expect(userState.error).toBe('用户错误')
      expect(typeof userState.lastUpdated).toBe('number')
    })
  })

  describe('应用状态接口', () => {
    it('应该定义正确的 AppState 接口', () => {
      const appState: AppState = {
        loading: false,
        error: null,
        lastUpdated: null,
        theme: 'light',
        language: 'zh-CN',
        sidebarCollapsed: false,
        breadcrumbs: [],
        activeMenu: '',
        visitedViews: [],
        cachedViews: []
      }

      expect(appState.theme).toBe('light')
      expect(appState.language).toBe('zh-CN')
      expect(appState.sidebarCollapsed).toBe(false)
      expect(Array.isArray(appState.breadcrumbs)).toBe(true)
      expect(Array.isArray(appState.visitedViews)).toBe(true)
      expect(Array.isArray(appState.cachedViews)).toBe(true)
    })

    it('应该支持主题类型', () => {
      const lightTheme: AppState['theme'] = 'light'
      const darkTheme: AppState['theme'] = 'dark'

      expect(lightTheme).toBe('light')
      expect(darkTheme).toBe('dark')
    })

    it('应该支持语言类型', () => {
      const zhCN: AppState['language'] = 'zh-CN'
      const enUS: AppState['language'] = 'en-US'

      expect(zhCN).toBe('zh-CN')
      expect(enUS).toBe('en-US')
    })
  })

  describe('面包屑和标签页接口', () => {
    it('应该定义正确的 BreadcrumbItem 接口', () => {
      const breadcrumb: BreadcrumbItem = {
        title: '用户管理',
        path: '/users',
        icon: 'user'
      }

      expect(breadcrumb.title).toBe('用户管理')
      expect(breadcrumb.path).toBe('/users')
      expect(breadcrumb.icon).toBe('user')
    })

    it('应该定义正确的 TabView 接口', () => {
      const tabView: TabView = {
        name: 'Users',
        title: '用户管理',
        path: '/users',
        query: { page: '1' },
        params: { id: '123' },
        closable: true
      }

      expect(tabView.name).toBe('Users')
      expect(tabView.title).toBe('用户管理')
      expect(tabView.path).toBe('/users')
      expect(tabView.query).toEqual({ page: '1' })
      expect(tabView.params).toEqual({ id: '123' })
      expect(tabView.closable).toBe(true)
    })

    it('应该允许 TabView 的可选字段', () => {
      const tabView: TabView = {
        name: 'Dashboard',
        title: '仪表板',
        path: '/dashboard',
        closable: false
      }

      expect(tabView.query).toBeUndefined()
      expect(tabView.params).toBeUndefined()
    })
  })

  describe('路由配置接口', () => {
    it('应该定义正确的 RouteConfig 接口', () => {
      const routeConfig: RouteConfig = {
        path: '/users',
        name: 'Users',
        component: undefined,
        redirect: '/users/list',
        meta: {
          title: '用户管理',
          icon: 'user',
          roles: ['admin'],
          permissions: ['user:view'],
          hidden: false
        },
        children: []
      }

      expect(routeConfig.path).toBe('/users')
      expect(routeConfig.name).toBe('Users')
      expect(routeConfig.redirect).toBe('/users/list')
      expect(routeConfig.meta?.title).toBe('用户管理')
      expect(Array.isArray(routeConfig.children)).toBe(true)
    })

    it('应该定义正确的 RouteMeta 接口', () => {
      const routeMeta: RouteMeta = {
        title: '商品管理',
        icon: 'goods',
        roles: ['admin', 'manager'],
        permissions: ['product:view', 'product:edit'],
        hidden: false,
        alwaysShow: true,
        noCache: false,
        breadcrumb: true,
        affix: false
      }

      expect(routeMeta.title).toBe('商品管理')
      expect(routeMeta.icon).toBe('goods')
      expect(Array.isArray(routeMeta.roles)).toBe(true)
      expect(Array.isArray(routeMeta.permissions)).toBe(true)
      expect(typeof routeMeta.hidden).toBe('boolean')
    })
  })

  describe('配置接口', () => {
    it('应该定义正确的 PersistConfig 接口', () => {
      const persistConfig: PersistConfig = {
        key: 'test-store',
        storage: localStorage,
        paths: ['user', 'settings'],
        beforeRestore: (context) => {
          console.log('Before restore:', context)
        },
        afterRestore: (context) => {
          console.log('After restore:', context)
        }
      }

      expect(persistConfig.key).toBe('test-store')
      expect(persistConfig.storage).toBe(localStorage)
      expect(Array.isArray(persistConfig.paths)).toBe(true)
      expect(typeof persistConfig.beforeRestore).toBe('function')
      expect(typeof persistConfig.afterRestore).toBe('function')
    })

    it('应该定义正确的 StateSyncConfig 接口', () => {
      const syncConfig: StateSyncConfig = {
        enabled: true,
        interval: 30000,
        retryCount: 3,
        retryDelay: 1000,
        syncOnMount: true,
        syncOnFocus: true
      }

      expect(syncConfig.enabled).toBe(true)
      expect(syncConfig.interval).toBe(30000)
      expect(syncConfig.retryCount).toBe(3)
      expect(syncConfig.retryDelay).toBe(1000)
      expect(syncConfig.syncOnMount).toBe(true)
      expect(syncConfig.syncOnFocus).toBe(true)
    })

    it('应该定义正确的 StateDebugConfig 接口', () => {
      const debugConfig: StateDebugConfig = {
        enabled: true,
        logActions: true,
        logMutations: true,
        logSubscriptions: false,
        maxLogEntries: 100
      }

      expect(debugConfig.enabled).toBe(true)
      expect(debugConfig.logActions).toBe(true)
      expect(debugConfig.logMutations).toBe(true)
      expect(debugConfig.logSubscriptions).toBe(false)
      expect(debugConfig.maxLogEntries).toBe(100)
    })
  })

  describe('业务状态接口', () => {
    it('应该定义正确的 BusinessState 接口', () => {
      const businessState: BusinessState = {
        loading: false,
        error: null,
        lastUpdated: null,
        products: {
          list: [],
          categories: [],
          total: 0,
          currentPage: 1,
          pageSize: 20,
          filters: {},
          selectedIds: []
        },
        orders: {
          list: [],
          total: 0,
          currentPage: 1,
          pageSize: 20,
          filters: {},
          selectedIds: [],
          statusCounts: {}
        },
        inventory: {
          list: [],
          total: 0,
          currentPage: 1,
          pageSize: 20,
          filters: {},
          alertItems: [],
          lowStockCount: 0
        },
        notifications: {
          list: [],
          unreadCount: 0,
          total: 0,
          currentPage: 1,
          pageSize: 20,
          filters: {}
        }
      }

      expect(businessState.products).toBeDefined()
      expect(businessState.orders).toBeDefined()
      expect(businessState.inventory).toBeDefined()
      expect(businessState.notifications).toBeDefined()
      expect(Array.isArray(businessState.products.list)).toBe(true)
      expect(Array.isArray(businessState.orders.list)).toBe(true)
    })
  })

  describe('全局状态接口', () => {
    it('应该定义正确的 GlobalState 接口', () => {
      // 这里只测试接口结构，不创建实际实例
      type GlobalStateKeys = keyof GlobalState
      const expectedKeys: GlobalStateKeys[] = ['user', 'app', 'permission', 'business']
      
      expectedKeys.forEach(key => {
        expect(key).toBeDefined()
      })
    })
  })

  describe('默认配置常量', () => {
    it('应该定义正确的默认持久化配置', () => {
      expect(DEFAULT_PERSIST_CONFIG).toEqual({
        key: 'erp-store',
        storage: localStorage,
        paths: undefined,
        beforeRestore: undefined,
        afterRestore: undefined
      })
    })

    it('应该定义正确的默认同步配置', () => {
      expect(DEFAULT_SYNC_CONFIG).toEqual({
        enabled: false,
        interval: 30000,
        retryCount: 3,
        retryDelay: 1000,
        syncOnMount: true,
        syncOnFocus: true
      })
    })

    it('应该定义正确的默认调试配置', () => {
      expect(DEFAULT_DEBUG_CONFIG.logActions).toBe(true)
      expect(DEFAULT_DEBUG_CONFIG.logMutations).toBe(true)
      expect(DEFAULT_DEBUG_CONFIG.logSubscriptions).toBe(false)
      expect(DEFAULT_DEBUG_CONFIG.maxLogEntries).toBe(100)
      // enabled 字段依赖于环境变量，这里不测试具体值
      expect(typeof DEFAULT_DEBUG_CONFIG.enabled).toBe('boolean')
    })
  })

  describe('类型兼容性', () => {
    it('应该支持状态扩展', () => {
      interface ExtendedUserState extends UserState {
        customField: string
      }

      const extendedState: ExtendedUserState = {
        loading: false,
        error: null,
        lastUpdated: null,
        token: '',
        refreshToken: '',
        user: null,
        stores: [],
        currentStoreId: null,
        customField: 'custom-value'
      }

      expect(extendedState.customField).toBe('custom-value')
      // 验证基础字段仍然存在
      expect(extendedState.loading).toBe(false)
      expect(extendedState.token).toBe('')
    })

    it('应该支持配置扩展', () => {
      interface ExtendedPersistConfig extends PersistConfig {
        customOption: boolean
      }

      const extendedConfig: ExtendedPersistConfig = {
        key: 'extended-store',
        storage: localStorage,
        customOption: true
      }

      expect(extendedConfig.customOption).toBe(true)
      expect(extendedConfig.key).toBe('extended-store')
    })
  })
})