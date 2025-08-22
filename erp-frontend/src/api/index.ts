// 导出类型定义
export type { 
  ApiResponse, 
  RequestConfig, 
  PageQuery, 
  PageResult, 
  BaseEntity 
} from './types'
export type { UserTypes } from './types'
export type { ProductTypes } from './types'
export type { OrderTypes } from './types'
export type { InventoryTypes } from './types'
export type { PlatformTypes } from './types'
export type { LogisticsTypes } from './types'
export type { NotificationTypes } from './types'
export type { SystemTypes } from './types'

// 导出HTTP客户端
export { httpClient as api, httpClient } from './request'
export { default } from './request'

// 导出拦截器相关功能
export {
  requestInterceptor,
  responseInterceptor,
  handleHttpError,
  createRetryInterceptor,
  createCacheInterceptor,
  memoryCache,
  defaultRetryConfig
} from './interceptors'

// 导出API模块
export * from './modules/user'
export * from './modules/product'
export * from './modules/order'
export * from './modules/inventory'
export * from './modules/platform'
export * from './modules/logistics'
export * from './modules/notification'
export * from './modules/system'