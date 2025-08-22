import api from '@/api'
import type { ApiResponse, PageResponse, PageRequest } from '@/types'

// 系统配置类型枚举
export type SystemConfigType = 
  | 'GENERAL'      // 通用配置
  | 'SECURITY'     // 安全配置
  | 'NOTIFICATION' // 通知配置
  | 'INTEGRATION'  // 集成配置
  | 'PERFORMANCE'  // 性能配置
  | 'BACKUP'       // 备份配置
  | 'LOGGING'      // 日志配置
  | 'MONITORING'   // 监控配置

// 系统配置值类型枚举
export type SystemConfigValueType = 
  | 'STRING'       // 字符串
  | 'NUMBER'       // 数字
  | 'BOOLEAN'      // 布尔值
  | 'JSON'         // JSON对象
  | 'ARRAY'        // 数组
  | 'PASSWORD'     // 密码
  | 'URL'          // URL地址
  | 'EMAIL'        // 邮箱地址

// 日志级别枚举
export type LogLevel = 
  | 'TRACE'        // 跟踪
  | 'DEBUG'        // 调试
  | 'INFO'         // 信息
  | 'WARN'         // 警告
  | 'ERROR'        // 错误
  | 'FATAL'        // 致命错误

// 日志类型枚举
export type LogType = 
  | 'SYSTEM'       // 系统日志
  | 'OPERATION'    // 操作日志
  | 'ACCESS'       // 访问日志
  | 'ERROR'        // 错误日志
  | 'SECURITY'     // 安全日志
  | 'AUDIT'        // 审计日志
  | 'PERFORMANCE'  // 性能日志
  | 'API'          // API日志

// 系统状态枚举
export type SystemStatus = 
  | 'HEALTHY'      // 健康
  | 'WARNING'      // 警告
  | 'CRITICAL'     // 严重
  | 'DOWN'         // 宕机
  | 'MAINTENANCE'  // 维护中

// 备份状态枚举
export type BackupStatus = 
  | 'PENDING'      // 等待中
  | 'RUNNING'      // 运行中
  | 'COMPLETED'    // 已完成
  | 'FAILED'       // 失败
  | 'CANCELLED'    // 已取消

// 备份类型枚举
export type BackupType = 
  | 'FULL'         // 全量备份
  | 'INCREMENTAL'  // 增量备份
  | 'DIFFERENTIAL' // 差异备份
  | 'MANUAL'       // 手动备份
  | 'SCHEDULED'    // 定时备份

// 版本状态枚举
export type VersionStatus = 
  | 'CURRENT'      // 当前版本
  | 'AVAILABLE'    // 可用版本
  | 'DEPRECATED'   // 已弃用
  | 'BETA'         // 测试版
  | 'ALPHA'        // 内测版

// 系统配置接口
export interface SystemConfig {
  id: number
  key: string
  value: any
  defaultValue?: any
  name: string
  description?: string
  type: SystemConfigType
  valueType: SystemConfigValueType
  isEditable: boolean
  isRequired: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
  }
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 系统日志接口
export interface SystemLog {
  id: number
  level: LogLevel
  type: LogType
  message: string
  details?: Record<string, any>
  source: string
  userId?: number
  username?: string
  ip?: string
  userAgent?: string
  requestId?: string
  sessionId?: string
  duration?: number
  stackTrace?: string
  metadata?: Record<string, any>
  createdAt: string
}

// 系统状态接口
export interface SystemStatusInfo {
  service: string
  status: SystemStatus
  message?: string
  lastCheckTime: string
  responseTime?: number
  uptime?: number
  version?: string
  metadata?: Record<string, any>
}

// 系统监控指标接口
export interface SystemMetrics {
  timestamp: string
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
  }
  jvm?: {
    heapUsed: number
    heapMax: number
    heapUsage: number
    nonHeapUsed: number
    gcCount: number
    gcTime: number
  }
  database?: {
    connections: number
    activeConnections: number
    maxConnections: number
    queryTime: number
  }
  cache?: {
    hitRate: number
    missRate: number
    evictions: number
    size: number
  }
}

// 数据备份接口
export interface DataBackup {
  id: number
  name: string
  description?: string
  type: BackupType
  status: BackupStatus
  size?: number
  filePath?: string
  downloadUrl?: string
  tables?: string[]
  startTime?: string
  endTime?: string
  duration?: number
  progress?: number
  errorMessage?: string
  metadata?: Record<string, any>
  createdBy: number
  createdByName?: string
  createdAt: string
  updatedAt: string
}

// 系统版本接口
export interface SystemVersion {
  id: number
  version: string
  name: string
  description?: string
  status: VersionStatus
  releaseDate: string
  features: string[]
  bugFixes: string[]
  breakingChanges?: string[]
  downloadUrl?: string
  installationGuide?: string
  size?: number
  checksum?: string
  dependencies?: {
    name: string
    version: string
    required: boolean
  }[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 系统健康检查接口
export interface SystemHealthCheck {
  service: string
  status: SystemStatus
  checks: {
    name: string
    status: SystemStatus
    message?: string
    duration?: number
    details?: Record<string, any>
  }[]
  overallStatus: SystemStatus
  timestamp: string
  uptime: number
  version: string
}

// 系统配置查询参数接口
export interface SystemConfigQuery extends PageRequest {
  type?: SystemConfigType
  key?: string
  keyword?: string
  isEditable?: boolean
  isRequired?: boolean
}

// 系统日志查询参数接口
export interface SystemLogQuery extends PageRequest {
  level?: LogLevel
  type?: LogType
  source?: string
  userId?: number
  startTime?: string
  endTime?: string
  keyword?: string
  requestId?: string
  sessionId?: string
}

// 系统监控查询参数接口
export interface SystemMetricsQuery {
  startTime: string
  endTime: string
  interval?: 'minute' | 'hour' | 'day'
  metrics?: string[]
}

// 数据备份查询参数接口
export interface DataBackupQuery extends PageRequest {
  type?: BackupType
  status?: BackupStatus
  startTime?: string
  endTime?: string
  createdBy?: number
}

// 系统版本查询参数接口
export interface SystemVersionQuery extends PageRequest {
  status?: VersionStatus
  keyword?: string
}

// 备份创建请求接口
export interface CreateBackupRequest {
  name: string
  description?: string
  type: BackupType
  tables?: string[]
  includeData?: boolean
  includeSchema?: boolean
  compression?: boolean
  encryption?: boolean
  password?: string
  scheduledAt?: string
  metadata?: Record<string, any>
}

// 备份恢复请求接口
export interface RestoreBackupRequest {
  backupId: number
  targetDatabase?: string
  overwriteExisting?: boolean
  restoreTables?: string[]
  restoreData?: boolean
  restoreSchema?: boolean
  password?: string
  metadata?: Record<string, any>
}

// 系统配置更新请求接口
export interface UpdateSystemConfigRequest {
  value: any
  description?: string
  metadata?: Record<string, any>
}

// 批量系统配置更新请求接口
export interface BatchUpdateSystemConfigRequest {
  configs: {
    key: string
    value: any
    description?: string
  }[]
}

// 系统维护模式请求接口
export interface MaintenanceModeRequest {
  enabled: boolean
  message?: string
  allowedIps?: string[]
  startTime?: string
  endTime?: string
  metadata?: Record<string, any>
}

// 系统清理请求接口
export interface SystemCleanupRequest {
  cleanupTypes: ('logs' | 'cache' | 'temp' | 'backup' | 'session')[]
  retentionDays?: number
  dryRun?: boolean
  metadata?: Record<string, any>
}

// 系统清理结果接口
export interface SystemCleanupResult {
  type: string
  itemsDeleted: number
  spaceFreed: number
  duration: number
  errors?: string[]
}/**

 * 系统设置管理API模块
 * 提供系统配置、日志查询、状态监控、数据备份恢复和版本管理等功能
 */
export const systemApi = {
  // ==================== 系统配置相关API ====================

  /**
   * 获取系统配置列表（分页）
   * @param query 查询参数
   * @returns 系统配置列表分页数据
   */
  getSystemConfigs(query: SystemConfigQuery): Promise<ApiResponse<PageResponse<SystemConfig>>> {
    return api.get('/system/configs', { params: query })
  },

  /**
   * 根据键获取系统配置
   * @param key 配置键
   * @returns 系统配置详情
   */
  getSystemConfigByKey(key: string): Promise<ApiResponse<SystemConfig>> {
    return api.get(`/system/configs/${key}`)
  },

  /**
   * 根据类型获取系统配置
   * @param type 配置类型
   * @returns 系统配置列表
   */
  getSystemConfigsByType(type: SystemConfigType): Promise<ApiResponse<SystemConfig[]>> {
    return api.get(`/system/configs/type/${type}`)
  },

  /**
   * 更新系统配置
   * @param key 配置键
   * @param request 更新请求
   * @returns 更新结果
   */
  updateSystemConfig(key: string, request: UpdateSystemConfigRequest): Promise<ApiResponse<SystemConfig>> {
    return api.put(`/system/configs/${key}`, request)
  },

  /**
   * 批量更新系统配置
   * @param request 批量更新请求
   * @returns 更新结果
   */
  batchUpdateSystemConfigs(request: BatchUpdateSystemConfigRequest): Promise<ApiResponse<SystemConfig[]>> {
    return api.put('/system/configs/batch', request)
  },

  /**
   * 重置系统配置为默认值
   * @param key 配置键
   * @returns 重置结果
   */
  resetSystemConfig(key: string): Promise<ApiResponse<SystemConfig>> {
    return api.post(`/system/configs/${key}/reset`)
  },

  /**
   * 重置所有系统配置为默认值
   * @param type 配置类型（可选）
   * @returns 重置结果
   */
  resetAllSystemConfigs(type?: SystemConfigType): Promise<ApiResponse<{ count: number }>> {
    return api.post('/system/configs/reset-all', { type })
  },

  /**
   * 导出系统配置
   * @param type 配置类型（可选）
   * @param format 导出格式
   * @returns 导出文件URL
   */
  exportSystemConfigs(type?: SystemConfigType, format: 'json' | 'yaml' | 'properties' = 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/system/configs/export', { type, format })
  },

  /**
   * 导入系统配置
   * @param file 配置文件
   * @param overwrite 是否覆盖现有配置
   * @returns 导入结果
   */
  importSystemConfigs(file: File, overwrite: boolean = false): Promise<ApiResponse<{ imported: number; skipped: number; errors: any[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('overwrite', String(overwrite))
    return api.post('/system/configs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // ==================== 系统日志相关API ====================

  /**
   * 获取系统日志列表（分页）
   * @param query 查询参数
   * @returns 系统日志列表分页数据
   */
  getSystemLogs(query: SystemLogQuery): Promise<ApiResponse<PageResponse<SystemLog>>> {
    return api.get('/system/logs', { params: query })
  },

  /**
   * 根据ID获取系统日志详情
   * @param id 日志ID
   * @returns 系统日志详情
   */
  getSystemLogById(id: number): Promise<ApiResponse<SystemLog>> {
    return api.get(`/system/logs/${id}`)
  },

  /**
   * 获取日志统计信息
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param groupBy 分组方式
   * @returns 日志统计数据
   */
  getLogStatistics(startTime: string, endTime: string, groupBy: 'hour' | 'day' | 'level' | 'type'): Promise<ApiResponse<any[]>> {
    return api.get('/system/logs/statistics', { 
      params: { startTime, endTime, groupBy } 
    })
  },

  /**
   * 清理系统日志
   * @param retentionDays 保留天数
   * @param logTypes 日志类型（可选）
   * @returns 清理结果
   */
  cleanupSystemLogs(retentionDays: number, logTypes?: LogType[]): Promise<ApiResponse<{ deletedCount: number; spaceFreed: number }>> {
    return api.delete('/system/logs/cleanup', { 
      data: { retentionDays, logTypes } 
    })
  },

  /**
   * 导出系统日志
   * @param query 查询条件
   * @param format 导出格式
   * @returns 导出文件URL
   */
  exportSystemLogs(query: Partial<SystemLogQuery>, format: 'csv' | 'excel' | 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/system/logs/export', { query, format })
  },

  // ==================== 系统状态监控相关API ====================

  /**
   * 获取系统健康状态
   * @returns 系统健康检查结果
   */
  getSystemHealth(): Promise<ApiResponse<SystemHealthCheck>> {
    return api.get('/system/health')
  },

  /**
   * 获取系统状态信息
   * @returns 系统状态信息列表
   */
  getSystemStatus(): Promise<ApiResponse<SystemStatusInfo[]>> {
    return api.get('/system/status')
  },

  /**
   * 获取指定服务的状态信息
   * @param service 服务名称
   * @returns 服务状态信息
   */
  getServiceStatus(service: string): Promise<ApiResponse<SystemStatusInfo>> {
    return api.get(`/system/status/${service}`)
  },

  /**
   * 获取系统监控指标
   * @param query 查询参数
   * @returns 系统监控指标数据
   */
  getSystemMetrics(query: SystemMetricsQuery): Promise<ApiResponse<SystemMetrics[]>> {
    return api.get('/system/metrics', { params: query })
  },

  /**
   * 获取实时系统监控指标
   * @returns 实时监控指标
   */
  getRealTimeMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return api.get('/system/metrics/realtime')
  },

  /**
   * 获取系统性能报告
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param reportType 报告类型
   * @returns 性能报告数据
   */
  getPerformanceReport(startTime: string, endTime: string, reportType: 'summary' | 'detailed'): Promise<ApiResponse<any>> {
    return api.get('/system/performance/report', { 
      params: { startTime, endTime, reportType } 
    })
  },

  /**
   * 获取系统告警信息
   * @param severity 告警级别（可选）
   * @param limit 返回数量限制
   * @returns 告警信息列表
   */
  getSystemAlerts(severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', limit: number = 50): Promise<ApiResponse<any[]>> {
    return api.get('/system/alerts', { 
      params: { severity, limit } 
    })
  },

  /**
   * 确认系统告警
   * @param alertId 告警ID
   * @param comment 确认备注
   * @returns 确认结果
   */
  acknowledgeAlert(alertId: number, comment?: string): Promise<ApiResponse<void>> {
    return api.put(`/system/alerts/${alertId}/acknowledge`, { comment })
  },

  // ==================== 数据备份恢复相关API ====================

  /**
   * 获取数据备份列表（分页）
   * @param query 查询参数
   * @returns 数据备份列表分页数据
   */
  getDataBackups(query: DataBackupQuery): Promise<ApiResponse<PageResponse<DataBackup>>> {
    return api.get('/system/backups', { params: query })
  },

  /**
   * 根据ID获取数据备份详情
   * @param id 备份ID
   * @returns 数据备份详情
   */
  getDataBackupById(id: number): Promise<ApiResponse<DataBackup>> {
    return api.get(`/system/backups/${id}`)
  },

  /**
   * 创建数据备份
   * @param request 备份创建请求
   * @returns 备份创建结果
   */
  createDataBackup(request: CreateBackupRequest): Promise<ApiResponse<DataBackup>> {
    return api.post('/system/backups', request)
  },

  /**
   * 删除数据备份
   * @param id 备份ID
   * @returns 删除结果
   */
  deleteDataBackup(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/system/backups/${id}`)
  },

  /**
   * 下载数据备份文件
   * @param id 备份ID
   * @returns 下载URL
   */
  downloadDataBackup(id: number): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.get(`/system/backups/${id}/download`)
  },

  /**
   * 恢复数据备份
   * @param request 恢复请求
   * @returns 恢复结果
   */
  restoreDataBackup(request: RestoreBackupRequest): Promise<ApiResponse<{ taskId: string }>> {
    return api.post('/system/backups/restore', request)
  },

  /**
   * 获取备份恢复任务状态
   * @param taskId 任务ID
   * @returns 任务状态
   */
  getRestoreTaskStatus(taskId: string): Promise<ApiResponse<{ status: string; progress: number; message?: string }>> {
    return api.get(`/system/backups/restore/status/${taskId}`)
  },

  /**
   * 验证备份文件完整性
   * @param id 备份ID
   * @returns 验证结果
   */
  validateBackup(id: number): Promise<ApiResponse<{ isValid: boolean; checksum: string; errors?: string[] }>> {
    return api.post(`/system/backups/${id}/validate`)
  },

  /**
   * 获取可备份的数据表列表
   * @returns 数据表列表
   */
  getBackupTables(): Promise<ApiResponse<{ name: string; size: number; rowCount: number }[]>> {
    return api.get('/system/backups/tables')
  },

  // ==================== 版本管理相关API ====================

  /**
   * 获取系统版本列表（分页）
   * @param query 查询参数
   * @returns 系统版本列表分页数据
   */
  getSystemVersions(query: SystemVersionQuery): Promise<ApiResponse<PageResponse<SystemVersion>>> {
    return api.get('/system/versions', { params: query })
  },

  /**
   * 获取当前系统版本信息
   * @returns 当前版本信息
   */
  getCurrentVersion(): Promise<ApiResponse<SystemVersion>> {
    return api.get('/system/versions/current')
  },

  /**
   * 根据ID获取系统版本详情
   * @param id 版本ID
   * @returns 系统版本详情
   */
  getSystemVersionById(id: number): Promise<ApiResponse<SystemVersion>> {
    return api.get(`/system/versions/${id}`)
  },

  /**
   * 检查系统更新
   * @returns 可用更新信息
   */
  checkForUpdates(): Promise<ApiResponse<{ hasUpdates: boolean; latestVersion?: SystemVersion; updateCount: number }>> {
    return api.get('/system/versions/check-updates')
  },

  /**
   * 下载系统版本
   * @param id 版本ID
   * @returns 下载任务信息
   */
  downloadSystemVersion(id: number): Promise<ApiResponse<{ taskId: string; downloadUrl: string }>> {
    return api.post(`/system/versions/${id}/download`)
  },

  /**
   * 获取版本下载进度
   * @param taskId 下载任务ID
   * @returns 下载进度信息
   */
  getDownloadProgress(taskId: string): Promise<ApiResponse<{ progress: number; status: string; message?: string }>> {
    return api.get(`/system/versions/download/progress/${taskId}`)
  },

  /**
   * 安装系统版本
   * @param id 版本ID
   * @param options 安装选项
   * @returns 安装任务信息
   */
  installSystemVersion(id: number, options?: { backupFirst?: boolean; restartAfter?: boolean }): Promise<ApiResponse<{ taskId: string }>> {
    return api.post(`/system/versions/${id}/install`, options)
  },

  /**
   * 获取版本安装进度
   * @param taskId 安装任务ID
   * @returns 安装进度信息
   */
  getInstallProgress(taskId: string): Promise<ApiResponse<{ progress: number; status: string; message?: string; logs?: string[] }>> {
    return api.get(`/system/versions/install/progress/${taskId}`)
  },

  /**
   * 回滚到指定版本
   * @param id 版本ID
   * @returns 回滚任务信息
   */
  rollbackToVersion(id: number): Promise<ApiResponse<{ taskId: string }>> {
    return api.post(`/system/versions/${id}/rollback`)
  },

  /**
   * 获取版本变更日志
   * @param fromVersion 起始版本
   * @param toVersion 目标版本
   * @returns 变更日志
   */
  getVersionChangelog(fromVersion: string, toVersion: string): Promise<ApiResponse<{ changelog: string; features: string[]; bugFixes: string[]; breakingChanges: string[] }>> {
    return api.get('/system/versions/changelog', { 
      params: { fromVersion, toVersion } 
    })
  },

  // ==================== 系统维护相关API ====================

  /**
   * 获取系统维护模式状态
   * @returns 维护模式状态
   */
  getMaintenanceMode(): Promise<ApiResponse<{ enabled: boolean; message?: string; startTime?: string; endTime?: string }>> {
    return api.get('/system/maintenance')
  },

  /**
   * 设置系统维护模式
   * @param request 维护模式请求
   * @returns 设置结果
   */
  setMaintenanceMode(request: MaintenanceModeRequest): Promise<ApiResponse<void>> {
    return api.put('/system/maintenance', request)
  },

  /**
   * 执行系统清理
   * @param request 清理请求
   * @returns 清理结果
   */
  performSystemCleanup(request: SystemCleanupRequest): Promise<ApiResponse<SystemCleanupResult[]>> {
    return api.post('/system/cleanup', request)
  },

  /**
   * 重启系统服务
   * @param service 服务名称（可选，不指定则重启所有服务）
   * @returns 重启结果
   */
  restartSystemService(service?: string): Promise<ApiResponse<{ taskId: string }>> {
    return api.post('/system/restart', { service })
  },

  /**
   * 获取服务重启进度
   * @param taskId 重启任务ID
   * @returns 重启进度信息
   */
  getRestartProgress(taskId: string): Promise<ApiResponse<{ progress: number; status: string; message?: string }>> {
    return api.get(`/system/restart/progress/${taskId}`)
  },

  /**
   * 刷新系统缓存
   * @param cacheType 缓存类型（可选）
   * @returns 刷新结果
   */
  refreshSystemCache(cacheType?: 'all' | 'config' | 'user' | 'permission' | 'menu'): Promise<ApiResponse<{ cleared: string[]; errors?: string[] }>> {
    return api.post('/system/cache/refresh', { cacheType })
  },

  /**
   * 获取系统缓存统计
   * @returns 缓存统计信息
   */
  getCacheStatistics(): Promise<ApiResponse<{ name: string; size: number; hitRate: number; missRate: number; evictions: number }[]>> {
    return api.get('/system/cache/statistics')
  },

  // ==================== 系统信息相关API ====================

  /**
   * 获取系统基本信息
   * @returns 系统基本信息
   */
  getSystemInfo(): Promise<ApiResponse<{
    name: string
    version: string
    buildTime: string
    javaVersion: string
    osName: string
    osVersion: string
    serverTime: string
    timezone: string
    encoding: string
    profiles: string[]
  }>> {
    return api.get('/system/info')
  },

  /**
   * 获取系统环境变量
   * @param includeSecrets 是否包含敏感信息
   * @returns 环境变量列表
   */
  getSystemEnvironment(includeSecrets: boolean = false): Promise<ApiResponse<Record<string, string>>> {
    return api.get('/system/environment', { 
      params: { includeSecrets } 
    })
  },

  /**
   * 获取系统依赖信息
   * @returns 依赖信息列表
   */
  getSystemDependencies(): Promise<ApiResponse<{ name: string; version: string; description?: string; license?: string }[]>> {
    return api.get('/system/dependencies')
  },

  /**
   * 测试系统连接
   * @param type 连接类型
   * @param config 连接配置
   * @returns 测试结果
   */
  testSystemConnection(type: 'database' | 'redis' | 'kafka' | 'email' | 'sms', config: Record<string, any>): Promise<ApiResponse<{ success: boolean; message: string; duration: number; details?: Record<string, any> }>> {
    return api.post('/system/test-connection', { type, config })
  }
}

export default systemApi