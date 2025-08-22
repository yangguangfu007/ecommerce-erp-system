import api from '@/api'
import type { ApiResponse, PageResponse, PageRequest } from '@/types'

// 通知类型枚举
export type NotificationType = 
  | 'SYSTEM'       // 系统通知
  | 'ORDER'        // 订单通知
  | 'INVENTORY'    // 库存通知
  | 'LOGISTICS'    // 物流通知
  | 'PLATFORM'     // 平台通知
  | 'USER'         // 用户通知
  | 'ALERT'        // 告警通知
  | 'PROMOTION'    // 促销通知

// 通知状态枚举
export type NotificationStatus = 
  | 'UNREAD'       // 未读
  | 'READ'         // 已读
  | 'ARCHIVED'     // 已归档
  | 'DELETED'      // 已删除

// 通知优先级枚举
export type NotificationPriority = 
  | 'LOW'          // 低优先级
  | 'NORMAL'       // 普通优先级
  | 'HIGH'         // 高优先级
  | 'URGENT'       // 紧急

// 通知发送渠道枚举
export type NotificationChannel = 
  | 'SYSTEM'       // 系统内通知
  | 'EMAIL'        // 邮件
  | 'SMS'          // 短信
  | 'WEBHOOK'      // Webhook
  | 'PUSH'         // 推送通知

// 模板类型枚举
export type TemplateType = 
  | 'TEXT'         // 纯文本
  | 'HTML'         // HTML格式
  | 'MARKDOWN'     // Markdown格式
  | 'JSON'         // JSON格式

// 通知接口
export interface Notification {
  id: number
  title: string
  content: string
  type: NotificationType
  status: NotificationStatus
  priority: NotificationPriority
  channel: NotificationChannel
  recipientId?: number
  recipientType?: 'USER' | 'ROLE' | 'GROUP'
  senderId?: number
  senderName?: string
  relatedId?: number
  relatedType?: string
  metadata?: Record<string, any>
  readAt?: string
  archivedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

// 通知模板接口
export interface NotificationTemplate {
  id: number
  name: string
  code: string
  title: string
  content: string
  type: NotificationType
  templateType: TemplateType
  channels: NotificationChannel[]
  variables: TemplateVariable[]
  isActive: boolean
  description?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 模板变量接口
export interface TemplateVariable {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'object'
  required: boolean
  defaultValue?: any
  description?: string
}

// 通知规则接口
export interface NotificationRule {
  id: number
  name: string
  code: string
  templateId: number
  templateName?: string
  triggerType: 'EVENT' | 'SCHEDULE' | 'MANUAL'
  triggerCondition: Record<string, any>
  recipients: NotificationRecipient[]
  channels: NotificationChannel[]
  isActive: boolean
  priority: NotificationPriority
  description?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 通知接收者接口
export interface NotificationRecipient {
  type: 'USER' | 'ROLE' | 'GROUP'
  id: number
  name: string
  channels?: NotificationChannel[]
}

// 通知配置接口
export interface NotificationConfig {
  id: number
  userId?: number
  type: NotificationType
  channels: NotificationChannel[]
  isEnabled: boolean
  settings: {
    emailEnabled?: boolean
    smsEnabled?: boolean
    pushEnabled?: boolean
    systemEnabled?: boolean
    quietHours?: {
      enabled: boolean
      startTime: string
      endTime: string
    }
    frequency?: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  }
  createdAt: string
  updatedAt: string
}

// 通知统计接口
export interface NotificationStats {
  totalSent: number
  totalRead: number
  totalUnread: number
  totalArchived: number
  readRate: number
  channelStats: {
    channel: NotificationChannel
    sent: number
    delivered: number
    read: number
    failed: number
    deliveryRate: number
    readRate: number
  }[]
  typeStats: {
    type: NotificationType
    sent: number
    read: number
    readRate: number
  }[]
  dailyStats: {
    date: string
    sent: number
    read: number
    readRate: number
  }[]
}

// 通知查询参数接口
export interface NotificationQuery extends PageRequest {
  type?: NotificationType
  status?: NotificationStatus
  priority?: NotificationPriority
  channel?: NotificationChannel
  recipientId?: number
  senderId?: number
  startDate?: string
  endDate?: string
  keyword?: string
  relatedType?: string
  relatedId?: number
}

// 发送通知请求接口
export interface SendNotificationRequest {
  templateId?: number
  title: string
  content: string
  type: NotificationType
  priority: NotificationPriority
  channels: NotificationChannel[]
  recipients: NotificationRecipient[]
  variables?: Record<string, any>
  scheduledAt?: string
  expiresAt?: string
  metadata?: Record<string, any>
}

// 批量操作参数接口
export interface BatchNotificationOperation {
  notificationIds: number[]
  operation: 'markRead' | 'markUnread' | 'archive' | 'delete' | 'resend'
  channels?: NotificationChannel[]
}

// 通知发送结果接口
export interface NotificationSendResult {
  id: number
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  channel: NotificationChannel
  recipientId: number
  recipientName: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failureReason?: string
  metadata?: Record<string, any>
}

/**
 * 通知管理API模块
 * 提供通知相关的所有API接口功能
 */
export const notificationApi = {
  // ==================== 通知查询相关API ====================

  /**
   * 获取通知列表（分页）
   * @param query 查询参数
   * @returns 通知列表分页数据
   */
  getNotifications(query: NotificationQuery): Promise<ApiResponse<PageResponse<Notification>>> {
    return api.get('/notifications', { params: query })
  },

  /**
   * 根据ID获取通知详情
   * @param id 通知ID
   * @returns 通知详细信息
   */
  getNotificationById(id: number): Promise<ApiResponse<Notification>> {
    return api.get(`/notifications/${id}`)
  },

  /**
   * 获取用户未读通知数量
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 未读通知数量
   */
  getUnreadCount(userId?: number): Promise<ApiResponse<{ count: number }>> {
    return api.get('/notifications/unread-count', { 
      params: userId ? { userId } : undefined 
    })
  },

  /**
   * 获取用户最新通知
   * @param limit 返回数量限制
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 最新通知列表
   */
  getLatestNotifications(limit: number = 10, userId?: number): Promise<ApiResponse<Notification[]>> {
    return api.get('/notifications/latest', { 
      params: { limit, userId } 
    })
  },

  /**
   * 获取用户未读通知
   * @param limit 返回数量限制
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 未读通知列表
   */
  getUnreadNotifications(limit: number = 10, userId?: number): Promise<ApiResponse<Notification[]>> {
    return api.get('/notifications/unread', { 
      params: { limit, userId } 
    })
  },

  /**
   * 标记通知为已读
   * @param id 通知ID
   * @returns 更新结果
   */
  markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return api.put(`/notifications/${id}/read`)
  },

  /**
   * 标记通知为未读
   * @param id 通知ID
   * @returns 更新结果
   */
  markAsUnread(id: number): Promise<ApiResponse<Notification>> {
    return api.put(`/notifications/${id}/unread`)
  },

  /**
   * 归档通知
   * @param id 通知ID
   * @returns 归档结果
   */
  archiveNotification(id: number): Promise<ApiResponse<void>> {
    return api.put(`/notifications/${id}/archive`)
  },

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 删除结果
   */
  deleteNotification(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/notifications/${id}`)
  },

  /**
   * 标记所有通知为已读
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 更新结果
   */
  markAllAsRead(userId?: number): Promise<ApiResponse<{ count: number }>> {
    return api.put('/notifications/mark-all-read', { userId })
  },

  // ==================== 通知发送相关API ====================

  /**
   * 发送通知
   * @param request 发送通知请求
   * @returns 发送结果
   */
  sendNotification(request: SendNotificationRequest): Promise<ApiResponse<NotificationSendResult[]>> {
    return api.post('/notifications/send', request)
  },

  /**
   * 批量发送通知
   * @param requests 批量发送请求
   * @returns 批量发送结果
   */
  batchSendNotifications(requests: SendNotificationRequest[]): Promise<ApiResponse<NotificationSendResult[]>> {
    return api.post('/notifications/send/batch', { requests })
  },

  /**
   * 重新发送通知
   * @param id 通知ID
   * @param channels 发送渠道（可选）
   * @returns 重新发送结果
   */
  resendNotification(id: number, channels?: NotificationChannel[]): Promise<ApiResponse<NotificationSendResult[]>> {
    return api.post(`/notifications/${id}/resend`, { channels })
  },

  /**
   * 取消定时通知
   * @param id 通知ID
   * @returns 取消结果
   */
  cancelScheduledNotification(id: number): Promise<ApiResponse<void>> {
    return api.put(`/notifications/${id}/cancel`)
  },

  /**
   * 获取通知发送状态
   * @param id 通知ID
   * @returns 发送状态详情
   */
  getNotificationSendStatus(id: number): Promise<ApiResponse<NotificationSendResult[]>> {
    return api.get(`/notifications/${id}/send-status`)
  },

  // ==================== 通知模板相关API ====================

  /**
   * 获取通知模板列表
   * @param query 查询参数
   * @returns 模板列表
   */
  getNotificationTemplates(query?: Partial<PageRequest & { type?: NotificationType; isActive?: boolean }>): Promise<ApiResponse<PageResponse<NotificationTemplate>>> {
    return api.get('/notifications/templates', { params: query })
  },

  /**
   * 根据ID获取通知模板
   * @param id 模板ID
   * @returns 模板详情
   */
  getNotificationTemplateById(id: number): Promise<ApiResponse<NotificationTemplate>> {
    return api.get(`/notifications/templates/${id}`)
  },

  /**
   * 根据代码获取通知模板
   * @param code 模板代码
   * @returns 模板详情
   */
  getNotificationTemplateByCode(code: string): Promise<ApiResponse<NotificationTemplate>> {
    return api.get(`/notifications/templates/by-code/${code}`)
  },

  /**
   * 创建通知模板
   * @param template 模板信息
   * @returns 创建结果
   */
  createNotificationTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<NotificationTemplate>> {
    return api.post('/notifications/templates', template)
  },

  /**
   * 更新通知模板
   * @param id 模板ID
   * @param template 模板信息
   * @returns 更新结果
   */
  updateNotificationTemplate(id: number, template: Partial<NotificationTemplate>): Promise<ApiResponse<NotificationTemplate>> {
    return api.put(`/notifications/templates/${id}`, template)
  },

  /**
   * 删除通知模板
   * @param id 模板ID
   * @returns 删除结果
   */
  deleteNotificationTemplate(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/notifications/templates/${id}`)
  },

  /**
   * 预览通知模板
   * @param id 模板ID
   * @param variables 模板变量
   * @returns 预览结果
   */
  previewNotificationTemplate(id: number, variables: Record<string, any>): Promise<ApiResponse<{ title: string; content: string }>> {
    return api.post(`/notifications/templates/${id}/preview`, { variables })
  },

  /**
   * 测试通知模板
   * @param id 模板ID
   * @param variables 模板变量
   * @param recipients 测试接收者
   * @returns 测试结果
   */
  testNotificationTemplate(id: number, variables: Record<string, any>, recipients: NotificationRecipient[]): Promise<ApiResponse<NotificationSendResult[]>> {
    return api.post(`/notifications/templates/${id}/test`, { variables, recipients })
  },

  // ==================== 通知规则相关API ====================

  /**
   * 获取通知规则列表
   * @param query 查询参数
   * @returns 规则列表
   */
  getNotificationRules(query?: Partial<PageRequest & { isActive?: boolean }>): Promise<ApiResponse<PageResponse<NotificationRule>>> {
    return api.get('/notifications/rules', { params: query })
  },

  /**
   * 根据ID获取通知规则
   * @param id 规则ID
   * @returns 规则详情
   */
  getNotificationRuleById(id: number): Promise<ApiResponse<NotificationRule>> {
    return api.get(`/notifications/rules/${id}`)
  },

  /**
   * 创建通知规则
   * @param rule 规则信息
   * @returns 创建结果
   */
  createNotificationRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<NotificationRule>> {
    return api.post('/notifications/rules', rule)
  },

  /**
   * 更新通知规则
   * @param id 规则ID
   * @param rule 规则信息
   * @returns 更新结果
   */
  updateNotificationRule(id: number, rule: Partial<NotificationRule>): Promise<ApiResponse<NotificationRule>> {
    return api.put(`/notifications/rules/${id}`, rule)
  },

  /**
   * 删除通知规则
   * @param id 规则ID
   * @returns 删除结果
   */
  deleteNotificationRule(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/notifications/rules/${id}`)
  },

  /**
   * 启用/禁用通知规则
   * @param id 规则ID
   * @param isActive 是否启用
   * @returns 更新结果
   */
  toggleNotificationRule(id: number, isActive: boolean): Promise<ApiResponse<NotificationRule>> {
    return api.put(`/notifications/rules/${id}/toggle`, { isActive })
  },

  /**
   * 测试通知规则
   * @param id 规则ID
   * @param testData 测试数据
   * @returns 测试结果
   */
  testNotificationRule(id: number, testData: Record<string, any>): Promise<ApiResponse<NotificationSendResult[]>> {
    return api.post(`/notifications/rules/${id}/test`, { testData })
  },

  // ==================== 通知配置相关API ====================

  /**
   * 获取用户通知配置
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 通知配置列表
   */
  getNotificationConfigs(userId?: number): Promise<ApiResponse<NotificationConfig[]>> {
    return api.get('/notifications/configs', { 
      params: userId ? { userId } : undefined 
    })
  },

  /**
   * 获取指定类型的通知配置
   * @param type 通知类型
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 通知配置
   */
  getNotificationConfigByType(type: NotificationType, userId?: number): Promise<ApiResponse<NotificationConfig>> {
    return api.get(`/notifications/configs/${type}`, { 
      params: userId ? { userId } : undefined 
    })
  },

  /**
   * 更新通知配置
   * @param type 通知类型
   * @param config 配置信息
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 更新结果
   */
  updateNotificationConfig(type: NotificationType, config: Partial<NotificationConfig>, userId?: number): Promise<ApiResponse<NotificationConfig>> {
    return api.put(`/notifications/configs/${type}`, { ...config, userId })
  },

  /**
   * 重置通知配置为默认值
   * @param type 通知类型
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 重置结果
   */
  resetNotificationConfig(type: NotificationType, userId?: number): Promise<ApiResponse<NotificationConfig>> {
    return api.post(`/notifications/configs/${type}/reset`, { userId })
  },

  // ==================== 批量操作相关API ====================

  /**
   * 批量操作通知
   * @param operation 批量操作参数
   * @returns 操作结果
   */
  batchOperateNotifications(operation: BatchNotificationOperation): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return api.post('/notifications/batch', operation)
  },

  /**
   * 批量标记为已读
   * @param notificationIds 通知ID列表
   * @returns 操作结果
   */
  batchMarkAsRead(notificationIds: number[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.put('/notifications/batch/read', { notificationIds })
  },

  /**
   * 批量归档通知
   * @param notificationIds 通知ID列表
   * @returns 操作结果
   */
  batchArchiveNotifications(notificationIds: number[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.put('/notifications/batch/archive', { notificationIds })
  },

  /**
   * 批量删除通知
   * @param notificationIds 通知ID列表
   * @returns 操作结果
   */
  batchDeleteNotifications(notificationIds: number[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.delete('/notifications/batch', { data: { notificationIds } })
  },

  // ==================== 统计和报表相关API ====================

  /**
   * 获取通知统计信息
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param type 通知类型（可选）
   * @param userId 用户ID（可选）
   * @returns 统计信息
   */
  getNotificationStats(startDate: string, endDate: string, type?: NotificationType, userId?: number): Promise<ApiResponse<NotificationStats>> {
    return api.get('/notifications/stats', { 
      params: { startDate, endDate, type, userId } 
    })
  },

  /**
   * 获取通知发送趋势
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param groupBy 分组方式
   * @returns 趋势数据
   */
  getNotificationTrends(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month'): Promise<ApiResponse<any[]>> {
    return api.get('/notifications/trends', { 
      params: { startDate, endDate, groupBy } 
    })
  },

  /**
   * 获取通知渠道效果分析
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 渠道效果数据
   */
  getChannelEffectiveness(startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    return api.get('/notifications/analysis/channels', { 
      params: { startDate, endDate } 
    })
  },

  /**
   * 导出通知数据
   * @param query 查询条件
   * @param format 导出格式
   * @returns 导出文件URL
   */
  exportNotificationData(query: Partial<NotificationQuery>, format: 'excel' | 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/notifications/export', { query, format })
  },

  // ==================== 搜索和筛选相关API ====================

  /**
   * 搜索通知
   * @param keyword 搜索关键词
   * @param limit 返回数量限制
   * @param userId 用户ID（可选）
   * @returns 搜索结果
   */
  searchNotifications(keyword: string, limit: number = 10, userId?: number): Promise<ApiResponse<Notification[]>> {
    return api.get('/notifications/search', { 
      params: { keyword, limit, userId } 
    })
  },

  /**
   * 获取通知筛选选项
   * @returns 筛选选项
   */
  getFilterOptions(): Promise<ApiResponse<{
    types: { label: string; value: NotificationType }[]
    priorities: { label: string; value: NotificationPriority }[]
    channels: { label: string; value: NotificationChannel }[]
    statuses: { label: string; value: NotificationStatus }[]
  }>> {
    return api.get('/notifications/filter-options')
  },

  /**
   * 获取通知模板筛选选项
   * @returns 模板筛选选项
   */
  getTemplateFilterOptions(): Promise<ApiResponse<{
    types: { label: string; value: NotificationType }[]
    templateTypes: { label: string; value: TemplateType }[]
    channels: { label: string; value: NotificationChannel }[]
  }>> {
    return api.get('/notifications/templates/filter-options')
  },

  // ==================== 发送历史和统计相关API ====================

  /**
   * 获取通知发送历史
   * @param query 查询参数
   * @returns 发送历史列表
   */
  getSendHistory(query?: Partial<PageRequest & { 
    status?: 'SUCCESS' | 'FAILED' | 'PENDING'
    channel?: NotificationChannel
    recipientId?: number
    startDate?: string
    endDate?: string
    keyword?: string
  }>): Promise<ApiResponse<PageResponse<NotificationSendResult>>> {
    return api.get('/notifications/send-history', { params: query })
  },

  /**
   * 获取通知发送趋势数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param groupBy 分组方式
   * @returns 趋势数据
   */
  getNotificationTrends(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month'): Promise<ApiResponse<{
    date: string
    sent: number
    read: number
    readRate: number
  }[]>> {
    return api.get('/notifications/trends', { 
      params: { startDate, endDate, groupBy } 
    })
  },

  /**
   * 获取渠道效果分析
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 渠道效果数据
   */
  getChannelEffectiveness(startDate: string, endDate: string): Promise<ApiResponse<{
    channel: NotificationChannel
    sent: number
    delivered: number
    read: number
    failed: number
    deliveryRate: number
    readRate: number
  }[]>> {
    return api.get('/notifications/analysis/channels', { 
      params: { startDate, endDate } 
    })
  },

  /**
   * 获取通知类型统计
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 类型统计数据
   */
  getTypeStats(startDate: string, endDate: string): Promise<ApiResponse<{
    type: NotificationType
    sent: number
    read: number
    readRate: number
  }[]>> {
    return api.get('/notifications/analysis/types', { 
      params: { startDate, endDate } 
    })
  }
}

export default notificationApi