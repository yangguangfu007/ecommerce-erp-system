import api from '@/api'
import type { ApiResponse, PageResponse, PageRequest } from '@/types'

// 平台类型枚举
export type PlatformType = 'WALMART' | 'AMAZON' | 'EBAY' | 'SHOPIFY' | 'CUSTOM'

// 平台状态枚举
export type PlatformStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING'

// 平台配置接口
export interface Platform {
  id: number
  name: string
  type: PlatformType
  description?: string
  config: PlatformConfig
  status: PlatformStatus
  lastSyncTime?: string
  errorMessage?: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

// 店铺接口
export interface Store {
  id: number
  storeName: string
  platform: string
  platformId?: number
  platformStoreId: string
  apiCredentials?: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE'
  authStatus?: 'AUTHORIZED' | 'UNAUTHORIZED'
  lastSyncTime?: string
  createdAt: string
  updatedAt: string
  // 用于UI状态管理的临时字段
  authLoading?: boolean
  testLoading?: boolean
  statusLoading?: boolean
}

// 平台配置参数接口
export interface PlatformConfig {
  apiUrl?: string
  apiKey?: string
  apiSecret?: string
  clientId?: string
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  webhookUrl?: string
  environment?: 'SANDBOX' | 'PRODUCTION'
  [key: string]: any
}

// 平台查询参数接口
export interface PlatformQuery extends PageRequest {
  name?: string
  type?: PlatformType
  status?: PlatformStatus
  isEnabled?: boolean
  keyword?: string
}

// 平台创建表单接口
export interface CreatePlatformForm {
  name: string
  type: PlatformType
  description?: string
  config: PlatformConfig
  isEnabled: boolean
}

// 平台更新表单接口
export interface UpdatePlatformForm {
  id: number
  name?: string
  description?: string
  config?: Partial<PlatformConfig>
  isEnabled?: boolean
}

// 连接测试结果接口
export interface ConnectionTestResult {
  success: boolean
  message: string
  responseTime?: number
  details?: Record<string, any>
  timestamp: string
}

// 店铺查询参数接口
export interface StoreQuery extends PageRequest {
  platformId?: number
  storeName?: string
  status?: 'ACTIVE' | 'INACTIVE'
  keyword?: string
}

// 店铺创建表单接口
export interface CreateStoreForm {
  platformId: number
  storeName: string
  platformStoreId: string
  apiCredentials?: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE'
}

// 店铺更新表单接口
export interface UpdateStoreForm {
  id: number
  storeName?: string
  platformStoreId?: string
  apiCredentials?: Record<string, any>
  status?: 'ACTIVE' | 'INACTIVE'
}

// 数据同步参数接口
export interface SyncDataRequest {
  platformId?: number
  storeId?: number
  syncType: 'PRODUCTS' | 'ORDERS' | 'INVENTORY' | 'ALL'
  startDate?: string
  endDate?: string
  force?: boolean
}

// 数据同步结果接口
export interface SyncDataResult {
  taskId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress: number
  totalRecords: number
  processedRecords: number
  successRecords: number
  failedRecords: number
  errors: SyncError[]
  startTime: string
  endTime?: string
  message?: string
}

// 同步错误接口
export interface SyncError {
  recordId: string
  recordType: string
  errorCode: string
  errorMessage: string
  details?: Record<string, any>
}

// 平台统计信息接口
export interface PlatformStats {
  totalPlatforms: number
  connectedPlatforms: number
  disconnectedPlatforms: number
  totalStores: number
  activeStores: number
  lastSyncTime?: string
  syncTasksToday: number
}

// 同步日志查询参数接口
export interface SyncLogQuery extends PageRequest {
  platformId?: number
  storeId?: number
  syncType?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 同步日志接口
export interface SyncLog {
  id: number
  taskId: string
  platformId: number
  platform?: Platform
  storeId?: number
  store?: Store
  syncType: string
  status: string
  progress: number
  totalRecords: number
  processedRecords: number
  successRecords: number
  failedRecords: number
  startTime: string
  endTime?: string
  errorMessage?: string
  details?: Record<string, any>
  createdAt: string
}

// 同步计划接口
export interface SyncSchedule {
  id?: number
  platformId?: number
  enabled: boolean
  frequency: 'hourly' | 'daily' | 'weekly' | 'custom'
  intervalHours?: number
  dailyTime?: string
  weeklyDays?: number[]
  cronExpression?: string
  syncTypes: string[]
  errorHandling: 'continue' | 'stop' | 'retry'
  retryCount?: number
  nextExecution?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 平台管理API模块
 * 提供平台配置、连接测试、状态查询、店铺管理和数据同步等功能
 */
export const platformApi = {
  // ==================== 平台配置管理 ====================

  /**
   * 获取平台列表（分页）
   * @param query 查询参数
   * @returns 平台列表分页数据
   */
  getPlatforms(query: PlatformQuery): Promise<ApiResponse<PageResponse<Platform>>> {
    return api.get('/platforms', { params: query })
  },

  /**
   * 根据ID获取平台详情
   * @param id 平台ID
   * @returns 平台详细信息
   */
  getPlatformById(id: number): Promise<ApiResponse<Platform>> {
    return api.get(`/platforms/${id}`)
  },

  /**
   * 创建新平台配置
   * @param platformForm 平台创建表单
   * @returns 创建的平台信息
   */
  createPlatform(platformForm: CreatePlatformForm): Promise<ApiResponse<Platform>> {
    return api.post('/platforms', platformForm)
  },

  /**
   * 更新平台配置
   * @param platformForm 平台更新表单
   * @returns 更新后的平台信息
   */
  updatePlatform(platformForm: UpdatePlatformForm): Promise<ApiResponse<Platform>> {
    const { id, ...data } = platformForm
    return api.put(`/platforms/${id}`, data)
  },

  /**
   * 删除平台配置
   * @param id 平台ID
   * @returns 删除结果
   */
  deletePlatform(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/platforms/${id}`)
  },

  /**
   * 启用平台
   * @param id 平台ID
   * @returns 启用结果
   */
  enablePlatform(id: number): Promise<ApiResponse<void>> {
    return api.put(`/platforms/${id}/enable`)
  },

  /**
   * 禁用平台
   * @param id 平台ID
   * @returns 禁用结果
   */
  disablePlatform(id: number): Promise<ApiResponse<void>> {
    return api.put(`/platforms/${id}/disable`)
  },

  // ==================== 连接测试 ====================

  /**
   * 测试平台连接
   * @param id 平台ID
   * @returns 连接测试结果
   */
  testPlatformConnection(id: number): Promise<ApiResponse<ConnectionTestResult>> {
    return api.post(`/platforms/${id}/test-connection`)
  },

  /**
   * 测试平台配置连接（创建前测试）
   * @param config 平台配置
   * @param type 平台类型
   * @returns 连接测试结果
   */
  testPlatformConfig(config: PlatformConfig, type: PlatformType): Promise<ApiResponse<ConnectionTestResult>> {
    return api.post('/platforms/test-config', { config, type })
  },

  // ==================== 平台状态查询 ====================

  /**
   * 获取平台状态
   * @param id 平台ID
   * @returns 平台状态信息
   */
  getPlatformStatus(id: number): Promise<ApiResponse<{ status: PlatformStatus; lastSyncTime?: string; errorMessage?: string }>> {
    return api.get(`/platforms/${id}/status`)
  },

  /**
   * 获取所有平台状态概览
   * @returns 平台状态概览
   */
  getAllPlatformStatus(): Promise<ApiResponse<Platform[]>> {
    return api.get('/platforms/status/overview')
  },

  /**
   * 刷新平台状态
   * @param id 平台ID
   * @returns 刷新后的状态
   */
  refreshPlatformStatus(id: number): Promise<ApiResponse<{ status: PlatformStatus; lastSyncTime?: string }>> {
    return api.post(`/platforms/${id}/refresh-status`)
  },

  // ==================== 店铺管理 ====================

  /**
   * 获取店铺列表（分页）
   * @param query 查询参数
   * @returns 店铺列表分页数据
   */
  getStores(query: StoreQuery): Promise<ApiResponse<PageResponse<Store>>> {
    return api.get('/stores', { params: query })
  },

  /**
   * 根据平台ID获取店铺列表
   * @param platformId 平台ID
   * @returns 店铺列表
   */
  getStoresByPlatform(platformId: number): Promise<ApiResponse<Store[]>> {
    return api.get(`/platforms/${platformId}/stores`)
  },

  /**
   * 根据ID获取店铺详情
   * @param id 店铺ID
   * @returns 店铺详细信息
   */
  getStoreById(id: number): Promise<ApiResponse<Store>> {
    return api.get(`/stores/${id}`)
  },

  /**
   * 创建新店铺
   * @param storeForm 店铺创建表单
   * @returns 创建的店铺信息
   */
  createStore(storeForm: CreateStoreForm): Promise<ApiResponse<Store>> {
    return api.post('/stores', storeForm)
  },

  /**
   * 更新店铺信息
   * @param storeForm 店铺更新表单
   * @returns 更新后的店铺信息
   */
  updateStore(storeForm: UpdateStoreForm): Promise<ApiResponse<Store>> {
    const { id, ...data } = storeForm
    return api.put(`/stores/${id}`, data)
  },

  /**
   * 删除店铺
   * @param id 店铺ID
   * @returns 删除结果
   */
  deleteStore(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/stores/${id}`)
  },

  /**
   * 激活店铺
   * @param id 店铺ID
   * @returns 激活结果
   */
  activateStore(id: number): Promise<ApiResponse<void>> {
    return api.put(`/stores/${id}/activate`)
  },

  /**
   * 停用店铺
   * @param id 店铺ID
   * @returns 停用结果
   */
  deactivateStore(id: number): Promise<ApiResponse<void>> {
    return api.put(`/stores/${id}/deactivate`)
  },

  /**
   * 测试店铺连接
   * @param id 店铺ID
   * @returns 连接测试结果
   */
  testStoreConnection(id: number): Promise<ApiResponse<ConnectionTestResult>> {
    return api.post(`/stores/${id}/test-connection`)
  },

  // ==================== 数据同步 ====================

  /**
   * 启动数据同步任务
   * @param syncRequest 同步请求参数
   * @returns 同步任务信息
   */
  startDataSync(syncRequest: SyncDataRequest): Promise<ApiResponse<SyncDataResult>> {
    return api.post('/sync/start', syncRequest)
  },

  /**
   * 获取同步任务状态
   * @param taskId 任务ID
   * @returns 同步任务状态
   */
  getSyncTaskStatus(taskId: string): Promise<ApiResponse<SyncDataResult>> {
    return api.get(`/sync/tasks/${taskId}`)
  },

  /**
   * 停止同步任务
   * @param taskId 任务ID
   * @returns 停止结果
   */
  stopSyncTask(taskId: string): Promise<ApiResponse<void>> {
    return api.post(`/sync/tasks/${taskId}/stop`)
  },

  /**
   * 获取同步日志列表
   * @param query 查询参数
   * @returns 同步日志分页数据
   */
  getSyncLogs(query: SyncLogQuery): Promise<ApiResponse<PageResponse<SyncLog>>> {
    return api.get('/sync/logs', { params: query })
  },

  /**
   * 获取同步日志详情
   * @param id 日志ID
   * @returns 同步日志详情
   */
  getSyncLogById(id: number): Promise<ApiResponse<SyncLog>> {
    return api.get(`/sync/logs/${id}`)
  },

  /**
   * 重试失败的同步任务
   * @param taskId 任务ID
   * @returns 重试结果
   */
  retrySyncTask(taskId: string): Promise<ApiResponse<SyncDataResult>> {
    return api.post(`/sync/tasks/${taskId}/retry`)
  },

  /**
   * 获取正在运行的同步任务列表
   * @returns 运行中的同步任务列表
   */
  getActiveSyncTasks(): Promise<ApiResponse<SyncDataResult[]>> {
    return api.get('/sync/tasks/active')
  },

  // ==================== 统计和监控 ====================

  /**
   * 获取平台统计信息
   * @returns 平台统计数据
   */
  getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    return api.get('/platforms/stats')
  },

  /**
   * 获取平台支持的类型列表
   * @returns 支持的平台类型列表
   */
  getSupportedPlatformTypes(): Promise<ApiResponse<{ type: PlatformType; name: string; description: string }[]>> {
    return api.get('/platforms/types')
  },

  /**
   * 获取平台配置模板
   * @param type 平台类型
   * @returns 配置模板
   */
  getPlatformConfigTemplate(type: PlatformType): Promise<ApiResponse<{ fields: any[]; example: PlatformConfig }>> {
    return api.get(`/platforms/types/${type}/config-template`)
  },

  /**
   * 批量更新平台状态
   * @param platformIds 平台ID列表
   * @returns 更新结果
   */
  batchRefreshPlatformStatus(platformIds: number[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.post('/platforms/batch/refresh-status', { platformIds })
  },

  /**
   * 导出平台配置
   * @param platformIds 平台ID列表（可选，不传则导出所有）
   * @returns 导出文件URL
   */
  exportPlatformConfig(platformIds?: number[]): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/platforms/export', { platformIds })
  },

  /**
   * 导入平台配置
   * @param file 配置文件
   * @returns 导入结果
   */
  importPlatformConfig(file: File): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return api.upload('/platforms/import', file)
  },

  // ==================== 同步计划管理 ====================

  /**
   * 保存同步计划设置
   * @param schedule 同步计划配置
   * @returns 保存结果
   */
  saveSyncSchedule(schedule: SyncSchedule): Promise<ApiResponse<SyncSchedule>> {
    return api.post('/sync/schedule', schedule)
  },

  /**
   * 获取同步计划设置
   * @param platformId 平台ID
   * @returns 同步计划配置
   */
  getSyncSchedule(platformId?: number): Promise<ApiResponse<SyncSchedule>> {
    return api.get('/sync/schedule', { params: { platformId } })
  },

  /**
   * 启用/禁用同步计划
   * @param enabled 是否启用
   * @param platformId 平台ID
   * @returns 操作结果
   */
  toggleSyncSchedule(enabled: boolean, platformId?: number): Promise<ApiResponse<void>> {
    return api.put('/sync/schedule/toggle', { enabled, platformId })
  },

  /**
   * 获取下次执行时间
   * @param schedule 同步计划配置
   * @returns 下次执行时间
   */
  getNextExecutionTime(schedule: SyncSchedule): Promise<ApiResponse<{ nextExecution: string }>> {
    return api.post('/sync/schedule/next-execution', schedule)
  },

  /**
   * 导出同步日志
   * @param query 查询参数
   * @returns 导出文件URL
   */
  exportSyncLogs(query: SyncLogQuery): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/sync/logs/export', query)
  },

  /**
   * 清空同步日志
   * @param platformId 平台ID（可选）
   * @returns 清空结果
   */
  clearSyncLogs(platformId?: number): Promise<ApiResponse<void>> {
    return api.delete('/sync/logs', { params: { platformId } })
  }
}

export default platformApi