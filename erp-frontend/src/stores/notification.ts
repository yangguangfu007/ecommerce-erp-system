/**
 * 通知数据状态管理
 * 管理通知列表、模板、规则等业务数据的缓存和同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '@/api/modules/notification'
import { useBaseStore } from './base'
import type { 
  Notification, 
  NotificationTemplate,
  NotificationRule,
  NotificationQuery, 
  CreateNotificationForm, 
  UpdateNotificationForm,
  NotificationStats,
  PageResponse,
  ApiResponse
} from '@/types'
import type {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationRecipient,
  SendNotificationRequest,
  NotificationSendResult
} from '@/api/modules/notification'

// 通知状态接口
interface NotificationState {
  // 通知列表数据
  notifications: Notification[]
  total: number
  currentPage: number
  pageSize: number
  
  // 未读通知统计
  unreadCount: number
  unreadNotifications: Notification[]
  
  // 模板数据
  templates: NotificationTemplate[]
  templateTotal: number
  
  // 规则数据
  rules: NotificationRule[]
  ruleTotal: number
  
  // 搜索和筛选
  searchKeyword: string
  filters: Partial<NotificationQuery>
  selectedNotificationIds: number[]
  
  // 统计数据
  stats: NotificationStats | null
  
  // 实时通知
  realtimeNotifications: Notification[]
  maxRealtimeCount: number
  
  // 缓存控制
  lastFetchTime: number | null
  cacheExpiry: number // 缓存过期时间（毫秒）
}

export const useNotificationStore = defineStore('notification', () => {
  // 基础状态管理
  const baseStore = useBaseStore({
    loading: false,
    error: null,
    lastUpdated: null
  })

  // 通知状态
  const state = ref<NotificationState>({
    notifications: [],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    unreadCount: 0,
    unreadNotifications: [],
    templates: [],
    templateTotal: 0,
    rules: [],
    ruleTotal: 0,
    searchKeyword: '',
    filters: {},
    selectedNotificationIds: [],
    stats: null,
    realtimeNotifications: [],
    maxRealtimeCount: 50,
    lastFetchTime: null,
    cacheExpiry: 1 * 60 * 1000 // 1分钟缓存（通知数据实时性要求高）
  })

  // 计算属性
  const isLoading = computed(() => baseStore.isLoading.value)
  const hasError = computed(() => baseStore.hasError.value)
  const error = computed(() => baseStore.state.value.error)

  // 是否有通知数据
  const hasNotifications = computed(() => state.value.notifications.length > 0)
  
  // 选中的通知数量
  const selectedCount = computed(() => state.value.selectedNotificationIds.length)
  
  // 是否需要刷新数据（缓存过期）
  const needsRefresh = computed(() => {
    if (!state.value.lastFetchTime) return true
    return Date.now() - state.value.lastFetchTime > state.value.cacheExpiry
  })

  // 是否有未读通知
  const hasUnreadNotifications = computed(() => state.value.unreadCount > 0)
  
  // 是否有模板数据
  const hasTemplates = computed(() => state.value.templates.length > 0)
  
  // 是否有规则数据
  const hasRules = computed(() => state.value.rules.length > 0)

  // 获取通知列表
  const fetchNotifications = async (query: Partial<NotificationQuery> = {}) => {
    return await baseStore.withLoading(async () => {
      const params: NotificationQuery = {
        page: query.page || state.value.currentPage,
        size: query.size || state.value.pageSize,
        ...state.value.filters,
        ...query
      }

      const response: ApiResponse<PageResponse<Notification>> = await notificationApi.getNotifications(params)
      
      state.value.notifications = response.data.list
      state.value.total = response.data.total
      state.value.currentPage = response.data.page
      state.value.pageSize = response.data.size
      state.value.lastFetchTime = Date.now()
      
      // 更新未读统计
      updateUnreadCount()
      
      return response.data
    })
  }

  // 获取通知详情
  const fetchNotificationById = async (id: number): Promise<Notification | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Notification> = await notificationApi.getNotificationById(id)
      
      // 更新缓存中的通知信息
      const index = state.value.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        state.value.notifications[index] = response.data
      }
      
      return response.data
    })
  }

  // 获取未读通知
  const fetchUnreadNotifications = async (limit: number = 10): Promise<Notification[]> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Notification[]> = await notificationApi.getUnreadNotifications(limit)
      
      // 直接使用未读通知数据
      const unreadNotifications = response.data
      state.value.unreadNotifications = unreadNotifications
      state.value.unreadCount = unreadNotifications.length
      
      return unreadNotifications
    }) || []
  }

  // 创建通知
  const createNotification = async (notificationForm: CreateNotificationForm): Promise<Notification | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Notification> = await notificationApi.createNotification(notificationForm)
      
      // 添加到列表开头
      state.value.notifications.unshift(response.data)
      state.value.total += 1
      
      // 如果是未读通知，更新未读统计
      if (response.data.status === 'UNREAD') {
        state.value.unreadCount += 1
        state.value.unreadNotifications.unshift(response.data)
      }
      
      // 添加到实时通知
      addRealtimeNotification(response.data)
      
      return response.data
    })
  }

  // 更新通知
  const updateNotification = async (notificationForm: UpdateNotificationForm): Promise<Notification | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Notification> = await notificationApi.updateNotification(notificationForm)
      
      // 更新缓存中的通知信息
      const index = state.value.notifications.findIndex(n => n.id === notificationForm.id)
      if (index !== -1) {
        state.value.notifications[index] = response.data
      }
      
      // 更新未读通知列表
      const unreadIndex = state.value.unreadNotifications.findIndex(n => n.id === notificationForm.id)
      if (unreadIndex !== -1) {
        if (response.data.status === 'UNREAD') {
          state.value.unreadNotifications[unreadIndex] = response.data
        } else {
          state.value.unreadNotifications.splice(unreadIndex, 1)
        }
      }
      
      // 更新未读统计
      updateUnreadCount()
      
      return response.data
    })
  }

  // 标记通知为已读
  const markAsRead = async (id: number): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await notificationApi.markAsRead(id)
      
      // 更新缓存中的通知状态
      const index = state.value.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        state.value.notifications[index].status = 'read'
        state.value.notifications[index].readAt = new Date().toISOString()
      }
      
      // 从未读通知列表中移除
      const unreadIndex = state.value.unreadNotifications.findIndex(n => n.id === id)
      if (unreadIndex !== -1) {
        state.value.unreadNotifications.splice(unreadIndex, 1)
      }
      
      // 更新未读统计
      updateUnreadCount()
      
      return true
    }) !== null
  }

  // 批量标记为已读
  const batchMarkAsRead = async (ids: number[]): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await notificationApi.batchMarkAsRead(ids)
      
      // 更新缓存中的通知状态
      ids.forEach(id => {
        const index = state.value.notifications.findIndex(n => n.id === id)
        if (index !== -1) {
          state.value.notifications[index].status = 'read'
          state.value.notifications[index].readAt = new Date().toISOString()
        }
        
        // 从未读通知列表中移除
        const unreadIndex = state.value.unreadNotifications.findIndex(n => n.id === id)
        if (unreadIndex !== -1) {
          state.value.unreadNotifications.splice(unreadIndex, 1)
        }
      })
      
      // 更新未读统计
      updateUnreadCount()
      
      return true
    }) !== null
  }

  // 全部标记为已读
  const markAllAsRead = async (): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await notificationApi.markAllAsRead()
      
      // 更新所有通知状态
      state.value.notifications.forEach(notification => {
        if (notification.status === 'UNREAD') {
          notification.status = 'read'
          notification.readAt = new Date().toISOString()
        }
      })
      
      // 清空未读通知列表
      state.value.unreadNotifications = []
      state.value.unreadCount = 0
      
      return true
    }) !== null
  }

  // 删除通知
  const deleteNotification = async (id: number): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await notificationApi.deleteNotification(id)
      
      // 从列表中移除
      const index = state.value.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        state.value.notifications.splice(index, 1)
        state.value.total -= 1
      }
      
      // 从未读通知列表中移除
      const unreadIndex = state.value.unreadNotifications.findIndex(n => n.id === id)
      if (unreadIndex !== -1) {
        state.value.unreadNotifications.splice(unreadIndex, 1)
      }
      
      // 从选中列表中移除
      const selectedIndex = state.value.selectedNotificationIds.indexOf(id)
      if (selectedIndex !== -1) {
        state.value.selectedNotificationIds.splice(selectedIndex, 1)
      }
      
      // 更新未读统计
      updateUnreadCount()
      
      return true
    }) !== null
  }

  // 批量删除通知
  const batchDeleteNotifications = async (ids: number[]): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await notificationApi.batchDeleteNotifications(ids)
      
      // 从列表中移除已删除的通知
      state.value.notifications = state.value.notifications.filter(n => !ids.includes(n.id))
      state.value.total -= ids.length
      
      // 从未读通知列表中移除
      state.value.unreadNotifications = state.value.unreadNotifications.filter(n => !ids.includes(n.id))
      
      // 清空选中列表
      state.value.selectedNotificationIds = []
      
      // 更新未读统计
      updateUnreadCount()
      
      return true
    }) !== null
  }

  // 搜索通知
  const searchNotifications = async (keyword: string, filters: Partial<NotificationQuery> = {}): Promise<Notification[]> => {
    state.value.searchKeyword = keyword
    state.value.filters = { ...state.value.filters, ...filters }
    
    if (!keyword.trim() && Object.keys(filters).length === 0) {
      await fetchNotifications()
      return state.value.notifications
    }
    
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Notification[]> = await notificationApi.searchNotifications(keyword, filters)
      
      state.value.notifications = response.data
      state.value.total = response.data.length
      state.value.currentPage = 1
      
      // 更新未读统计
      updateUnreadCount()
      
      return response.data
    }) || []
  }

  // 获取通知模板
  const fetchTemplates = async (query: {
    page: number
    size: number
    type?: 'EMAIL' | 'SMS' | 'SYSTEM' | 'PUSH'
    category?: string
    status?: 'ACTIVE' | 'INACTIVE'
  } = { page: 1, size: 100 }): Promise<NotificationTemplate[]> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<PageResponse<NotificationTemplate>> = 
        await notificationApi.getTemplates(query)
      
      state.value.templates = response.data.list
      state.value.templateTotal = response.data.total
      
      return response.data.list
    }) || []
  }

  // 获取通知规则
  const fetchRules = async (query: {
    page: number
    size: number
    eventType?: string
    enabled?: boolean
  } = { page: 1, size: 100 }): Promise<NotificationRule[]> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<PageResponse<NotificationRule>> = 
        await notificationApi.getRules(query)
      
      state.value.rules = response.data.list
      state.value.ruleTotal = response.data.total
      
      return response.data.list
    }) || []
  }

  // 获取通知统计
  const fetchNotificationStats = async (startDate?: string, endDate?: string): Promise<NotificationStats | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<NotificationStats> = 
        await notificationApi.getNotificationStats(startDate, endDate)
      
      state.value.stats = response.data
      return response.data
    })
  }

  // 发送通知
  const sendNotification = async (notificationData: {
    templateId?: number
    title: string
    content: string
    type: NotificationType
    priority: NotificationPriority
    channels: NotificationChannel[]
    recipients: NotificationRecipient[]
    variables?: Record<string, any>
    scheduledAt?: string
  }): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      const sendRequest: SendNotificationRequest = {
        templateId: notificationData.templateId,
        title: notificationData.title,
        content: notificationData.content,
        type: notificationData.type,
        priority: notificationData.priority,
        channels: notificationData.channels,
        recipients: notificationData.recipients,
        variables: notificationData.variables,
        scheduledAt: notificationData.scheduledAt
      }
      
      await notificationApi.sendNotification(sendRequest)
      return true
    }) !== null
  }

  // 获取发送历史
  const fetchSendHistory = async (query: {
    page: number
    size: number
    status?: 'SUCCESS' | 'FAILED' | 'PENDING'
    channel?: NotificationChannel
    keyword?: string
  }): Promise<PageResponse<NotificationSendResult> | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<PageResponse<NotificationSendResult>> = 
        await notificationApi.getSendHistory(query)
      return response.data
    })
  }

  // 获取通知趋势数据
  const fetchNotificationTrends = async (startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') => {
    return await baseStore.withLoading(async () => {
      const response = await notificationApi.getNotificationTrends(startDate, endDate, groupBy)
      return response.data
    })
  }

  // 获取渠道效果数据
  const fetchChannelEffectiveness = async (startDate: string, endDate: string) => {
    return await baseStore.withLoading(async () => {
      const response = await notificationApi.getChannelEffectiveness(startDate, endDate)
      return response.data
    })
  }

  // 添加实时通知
  const addRealtimeNotification = (notification: Notification) => {
    state.value.realtimeNotifications.unshift(notification)
    
    // 限制实时通知数量
    if (state.value.realtimeNotifications.length > state.value.maxRealtimeCount) {
      state.value.realtimeNotifications = state.value.realtimeNotifications.slice(0, state.value.maxRealtimeCount)
    }
  }

  // 清除实时通知
  const clearRealtimeNotifications = () => {
    state.value.realtimeNotifications = []
  }

  // 更新未读统计
  const updateUnreadCount = () => {
    const unreadCount = state.value.notifications.filter(n => n.status === 'UNREAD').length
    state.value.unreadCount = unreadCount
  }

  // 设置筛选条件
  const setFilters = (filters: Partial<NotificationQuery>) => {
    state.value.filters = { ...state.value.filters, ...filters }
  }

  // 清除筛选条件
  const clearFilters = () => {
    state.value.filters = {}
    state.value.searchKeyword = ''
  }

  // 设置分页
  const setPagination = (page: number, size?: number) => {
    state.value.currentPage = page
    if (size) {
      state.value.pageSize = size
    }
  }

  // 选择通知
  const selectNotification = (id: number) => {
    if (!state.value.selectedNotificationIds.includes(id)) {
      state.value.selectedNotificationIds.push(id)
    }
  }

  // 取消选择通知
  const unselectNotification = (id: number) => {
    const index = state.value.selectedNotificationIds.indexOf(id)
    if (index !== -1) {
      state.value.selectedNotificationIds.splice(index, 1)
    }
  }

  // 切换通知选择状态
  const toggleNotificationSelection = (id: number) => {
    if (state.value.selectedNotificationIds.includes(id)) {
      unselectNotification(id)
    } else {
      selectNotification(id)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (state.value.selectedNotificationIds.length === state.value.notifications.length) {
      state.value.selectedNotificationIds = []
    } else {
      state.value.selectedNotificationIds = state.value.notifications.map(n => n.id)
    }
  }

  // 清空选择
  const clearSelection = () => {
    state.value.selectedNotificationIds = []
  }

  // 获取选中的通知
  const getSelectedNotifications = computed(() => {
    return state.value.notifications.filter(n => state.value.selectedNotificationIds.includes(n.id))
  })

  // 刷新数据
  const refresh = async () => {
    state.value.lastFetchTime = null
    await Promise.all([
      fetchNotifications(),
      fetchUnreadNotifications()
    ])
  }

  // 重置状态
  const reset = () => {
    state.value.notifications = []
    state.value.total = 0
    state.value.currentPage = 1
    state.value.unreadCount = 0
    state.value.unreadNotifications = []
    state.value.templates = []
    state.value.templateTotal = 0
    state.value.rules = []
    state.value.ruleTotal = 0
    state.value.searchKeyword = ''
    state.value.filters = {}
    state.value.selectedNotificationIds = []
    state.value.stats = null
    state.value.realtimeNotifications = []
    state.value.lastFetchTime = null
    baseStore.resetState()
  }

  // 缓存管理
  const invalidateCache = () => {
    state.value.lastFetchTime = null
  }

  const isCacheValid = computed(() => {
    return !needsRefresh.value
  })

  return {
    // 状态
    state: computed(() => state.value),
    
    // 计算属性
    isLoading,
    hasError,
    error,
    hasNotifications,
    selectedCount,
    needsRefresh,
    hasUnreadNotifications,
    hasTemplates,
    hasRules,
    getSelectedNotifications,
    isCacheValid,
    
    // 通知操作
    fetchNotifications,
    fetchNotificationById,
    fetchUnreadNotifications,
    createNotification,
    updateNotification,
    markAsRead,
    batchMarkAsRead,
    markAllAsRead,
    deleteNotification,
    batchDeleteNotifications,
    searchNotifications,
    sendNotification,
    fetchSendHistory,
    fetchNotificationTrends,
    fetchChannelEffectiveness,
    
    // 模板和规则操作
    fetchTemplates,
    fetchRules,
    
    // 统计操作
    fetchNotificationStats,
    
    // 实时通知操作
    addRealtimeNotification,
    clearRealtimeNotifications,
    
    // 筛选和搜索
    setFilters,
    clearFilters,
    setPagination,
    
    // 选择操作
    selectNotification,
    unselectNotification,
    toggleNotificationSelection,
    toggleSelectAll,
    clearSelection,
    
    // 工具方法
    refresh,
    reset,
    invalidateCache
  }
})

export type NotificationStore = ReturnType<typeof useNotificationStore>