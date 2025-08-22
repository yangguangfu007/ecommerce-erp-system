/**
 * Pinia 状态管理基础类型定义
 * 定义状态管理相关的通用类型和接口
 */

import type { User, Store, Permission, Role } from '@/types'

// 状态持久化配置类型
export interface PersistConfig {
  key: string
  storage?: Storage
  paths?: string[]
  beforeRestore?: (context: any) => void
  afterRestore?: (context: any) => void
}

// 基础状态接口
export interface BaseState {
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

// 用户状态接口
export interface UserState extends BaseState {
  token: string
  refreshToken: string
  user: User | null
  stores: Store[]
  currentStoreId: number | null
}

// 应用状态接口
export interface AppState extends BaseState {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  sidebarCollapsed: boolean
  breadcrumbs: BreadcrumbItem[]
  activeMenu: string
  visitedViews: TabView[]
  cachedViews: string[]
}

// 面包屑项目接口
export interface BreadcrumbItem {
  title: string
  path: string
  icon?: string
}

// 标签页视图接口
export interface TabView {
  name: string
  title: string
  path: string
  query?: Record<string, any>
  params?: Record<string, any>
  closable: boolean
}

// 权限状态接口
export interface PermissionState extends BaseState {
  routes: RouteConfig[]
  addRoutes: RouteConfig[]
  permissions: string[]
  roles: string[]
}

// 路由配置接口
export interface RouteConfig {
  path: string
  name: string
  component?: any
  redirect?: string
  meta?: RouteMeta
  children?: RouteConfig[]
}

// 路由元信息接口
export interface RouteMeta {
  title: string
  icon?: string
  roles?: string[]
  permissions?: string[]
  hidden?: boolean
  alwaysShow?: boolean
  noCache?: boolean
  breadcrumb?: boolean
  affix?: boolean
}

// 业务数据状态接口
export interface BusinessState extends BaseState {
  products: ProductCache
  orders: OrderCache
  inventory: InventoryCache
  notifications: NotificationCache
}

// 产品缓存接口
export interface ProductCache {
  list: any[]
  categories: any[]
  total: number
  currentPage: number
  pageSize: number
  filters: Record<string, any>
  selectedIds: number[]
}

// 订单缓存接口
export interface OrderCache {
  list: any[]
  total: number
  currentPage: number
  pageSize: number
  filters: Record<string, any>
  selectedIds: number[]
  statusCounts: Record<string, number>
}

// 库存缓存接口
export interface InventoryCache {
  list: any[]
  total: number
  currentPage: number
  pageSize: number
  filters: Record<string, any>
  alertItems: any[]
  lowStockCount: number
}

// 通知缓存接口
export interface NotificationCache {
  list: any[]
  unreadCount: number
  total: number
  currentPage: number
  pageSize: number
  filters: Record<string, any>
}

// 状态更新动作类型
export type StateAction = 
  | 'SET_LOADING'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'UPDATE_TIMESTAMP'
  | 'RESET_STATE'

// 状态更新载荷接口
export interface StatePayload {
  action: StateAction
  data?: any
  timestamp?: number
}

// Store 实例类型
export interface StoreInstance {
  $id: string
  $state: any
  $patch: (partialState: any) => void
  $reset: () => void
  $subscribe: (callback: any, options?: any) => () => void
  $onAction: (callback: any, detached?: boolean) => () => void
}

// 状态管理器配置接口
export interface StoreConfig {
  id: string
  state: () => any
  getters?: Record<string, any>
  actions?: Record<string, any>
  persist?: PersistConfig | boolean
}

// 状态同步配置接口
export interface StateSyncConfig {
  enabled: boolean
  interval: number
  retryCount: number
  retryDelay: number
  syncOnMount: boolean
  syncOnFocus: boolean
}

// 状态验证规则接口
export interface StateValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  validator?: (value: any) => boolean | string
}

// 状态迁移配置接口
export interface StateMigrationConfig {
  version: number
  migrations: Record<number, (state: any) => any>
}

// 状态调试配置接口
export interface StateDebugConfig {
  enabled: boolean
  logActions: boolean
  logMutations: boolean
  logSubscriptions: boolean
  maxLogEntries: number
}

// 全局状态接口
export interface GlobalState {
  user: UserState
  app: AppState
  permission: PermissionState
  business: BusinessState
}

// 状态管理器选项接口
export interface StoreOptions {
  persist?: PersistConfig | boolean
  sync?: StateSyncConfig
  validation?: StateValidationRule[]
  migration?: StateMigrationConfig
  debug?: StateDebugConfig
}

// 状态更新回调类型
export type StateUpdateCallback = (newState: any, oldState: any) => void

// 状态订阅选项接口
export interface StateSubscriptionOptions {
  immediate?: boolean
  deep?: boolean
  flush?: 'pre' | 'post' | 'sync'
}

// 状态持久化存储适配器接口
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

// 默认状态持久化配置
export const DEFAULT_PERSIST_CONFIG: PersistConfig = {
  key: 'erp-store',
  storage: localStorage,
  paths: undefined,
  beforeRestore: undefined,
  afterRestore: undefined
}

// 默认状态同步配置
export const DEFAULT_SYNC_CONFIG: StateSyncConfig = {
  enabled: false,
  interval: 30000, // 30秒
  retryCount: 3,
  retryDelay: 1000, // 1秒
  syncOnMount: true,
  syncOnFocus: true
}

// 默认状态调试配置
export const DEFAULT_DEBUG_CONFIG: StateDebugConfig = {
  enabled: import.meta.env.DEV,
  logActions: true,
  logMutations: true,
  logSubscriptions: false,
  maxLogEntries: 100
}