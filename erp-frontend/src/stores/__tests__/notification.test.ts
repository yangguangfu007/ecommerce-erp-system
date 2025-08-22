/**
 * 通知数据状态管理测试
 * 测试通知数据的缓存、更新、同步机制和业务逻辑
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notification'
import { notificationApi } from '@/api/modules/notification'
import type { Notification, NotificationStats, NotificationTemplate } from '@/types'

// Mock API 模块
vi.mock('@/api/modules/notification', () => ({
  notificationApi: {
    getNotifications: vi.fn(),
    getNotificationById: vi.fn(),
    getLatestNotifications: vi.fn(),
    getUnreadNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    createNotification: vi.fn(),
    updateNotification: vi.fn(),
    deleteNotification: vi.fn(),
    batchDeleteNotifications: vi.fn(),
    markAsRead: vi.fn(),
    batchMarkAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    searchNotifications: vi.fn(),
    getTemplates: vi.fn(),
    getRules: vi.fn(),
    getNotificationStats: vi.fn(),
    sendNotification: vi.fn()
  }
}))

describe('通知数据状态管理 (Notification Store)', () => {
  let notificationStore: ReturnType<typeof useNotificationStore>
  
  // Mock 数据
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: '库存预警',
      content: '商品TEST-001库存不足，当前库存: 5',
      type: 'WARNING',
      status: 'UNREAD',
      priority: 'HIGH',
      userId: 1,
      templateId: 1,
      metadata: { sku: 'TEST-001', currentStock: 5 },
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      title: '订单确认',
      content: '订单ORD-001已确认',
      type: 'INFO',
      status: 'read',
      priority: 'MEDIUM',
      userId: 1,
      templateId: 2,
      metadata: { orderId: 'ORD-001' },
      readAt: '2024-01-01T11:00:00Z',
      createdAt: '2024-01-01T10:30:00Z',
      updatedAt: '2024-01-01T11:00:00Z'
    }
  ]

  const mockUnreadNotifications = [mockNotifications[0]]

  const mockStats: NotificationStats = {
    totalNotifications: 1000,
    unreadCount: 50,
    readCount: 950,
    todayCount: 25,
    weekCount: 150,
    monthCount: 600,
    typeBreakdown: {
      INFO: 400,
      WARNING: 300,
      ERROR: 200,
      SUCCESS: 80,
      SYSTEM: 20
    },
    priorityBreakdown: {
      LOW: 300,
      MEDIUM: 400,
      HIGH: 250,
      URGENT: 50
    }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    notificationStore = useNotificationStore()
    
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置默认的 API mock 返回值
    vi.mocked(notificationApi.getNotifications).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: {
        list: mockNotifications,
        total: mockNotifications.length,
        page: 1,
        size: 20,
        pages: 1
      }
    })

    vi.mocked(notificationApi.getUnreadCount).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: { count: mockUnreadNotifications.length }
    })

    vi.mocked(notificationApi.getLatestNotifications).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockUnreadNotifications
    })

    vi.mocked(notificationApi.getNotificationStats).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockStats
    })

    vi.mocked(notificationApi.getUnreadNotifications).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockUnreadNotifications
    })

    vi.mocked(notificationApi.markAsRead).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: null
    })

    vi.mocked(notificationApi.markAllAsRead).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: null
    })

    vi.mocked(notificationApi.deleteNotification).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: null
    })

    vi.mocked(notificationApi.batchDeleteNotifications).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(notificationStore.state.notifications).toEqual([])
      expect(notificationStore.state.total).toBe(0)
      expect(notificationStore.state.currentPage).toBe(1)
      expect(notificationStore.state.pageSize).toBe(20)
      expect(notificationStore.state.unreadCount).toBe(0)
      expect(notificationStore.state.unreadNotifications).toEqual([])
      expect(notificationStore.state.templates).toEqual([])
      expect(notificationStore.state.templateTotal).toBe(0)
      expect(notificationStore.state.rules).toEqual([])
      expect(notificationStore.state.ruleTotal).toBe(0)
      expect(notificationStore.state.searchKeyword).toBe('')
      expect(notificationStore.state.filters).toEqual({})
      expect(notificationStore.state.selectedNotificationIds).toEqual([])
      expect(notificationStore.state.stats).toBeNull()
      expect(notificationStore.state.realtimeNotifications).toEqual([])
      expect(notificationStore.state.maxRealtimeCount).toBe(50)
      expect(notificationStore.state.lastFetchTime).toBeNull()
      expect(notificationStore.state.cacheExpiry).toBe(1 * 60 * 1000)
    })

    it('应该有正确的计算属性初始值', () => {
      expect(notificationStore.isLoading).toBe(false)
      expect(notificationStore.hasError).toBe(false)
      expect(notificationStore.hasNotifications).toBe(false)
      expect(notificationStore.selectedCount).toBe(0)
      expect(notificationStore.needsRefresh).toBe(true)
      expect(notificationStore.hasUnreadNotifications).toBe(false)
      expect(notificationStore.hasTemplates).toBe(false)
      expect(notificationStore.hasRules).toBe(false)
      expect(notificationStore.isCacheValid).toBe(false)
    })
  })

  describe('通知数据获取', () => {
    it('应该能够获取通知列表', async () => {
      const result = await notificationStore.fetchNotifications()
      
      expect(notificationApi.getNotifications).toHaveBeenCalledWith({
        page: 1,
        size: 20
      })
      expect(result.list).toEqual(mockNotifications)
      expect(notificationStore.state.notifications).toEqual(mockNotifications)
      expect(notificationStore.state.total).toBe(mockNotifications.length)
      expect(notificationStore.state.lastFetchTime).toBeGreaterThan(0)
    })

    it('应该能够获取未读通知', async () => {
      const result = await notificationStore.fetchUnreadNotifications()
      
      expect(notificationApi.getUnreadNotifications).toHaveBeenCalledWith(10)
      expect(result).toEqual(mockUnreadNotifications)
      expect(notificationStore.state.unreadNotifications).toEqual(mockUnreadNotifications)
      expect(notificationStore.state.unreadCount).toBe(1)
    })

    it('应该能够根据ID获取通知详情', async () => {
      const mockNotification = mockNotifications[0]
      vi.mocked(notificationApi.getNotificationById).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockNotification
      })
      
      await notificationStore.fetchNotifications()
      const result = await notificationStore.fetchNotificationById(1)
      
      expect(notificationApi.getNotificationById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockNotification)
      expect(notificationStore.state.notifications[0]).toEqual(mockNotification)
    })
  })

  describe('通知状态管理', () => {
    beforeEach(async () => {
      await notificationStore.fetchNotifications()
      await notificationStore.fetchUnreadNotifications()
    })

    it('应该能够标记通知为已读', async () => {
      vi.mocked(notificationApi.markAsRead).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: undefined
      })
      
      const result = await notificationStore.markAsRead(1)
      
      expect(notificationApi.markAsRead).toHaveBeenCalledWith(1)
      expect(result).toBe(true)
      expect(notificationStore.state.notifications[0].status).toBe('read')
      expect(notificationStore.state.notifications[0].readAt).toBeDefined()
      expect(notificationStore.state.unreadNotifications).toHaveLength(0)
    })

    it('应该能够批量标记为已读', async () => {
      vi.mocked(notificationApi.batchMarkAsRead).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: undefined
      })
      
      const result = await notificationStore.batchMarkAsRead([1, 2])
      
      expect(notificationApi.batchMarkAsRead).toHaveBeenCalledWith([1, 2])
      expect(result).toBe(true)
      expect(notificationStore.state.notifications[0].status).toBe('read')
      expect(notificationStore.state.notifications[1].status).toBe('read')
    })

    it('应该能够全部标记为已读', async () => {
      vi.mocked(notificationApi.markAllAsRead).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: undefined
      })
      
      const result = await notificationStore.markAllAsRead()
      
      expect(notificationApi.markAllAsRead).toHaveBeenCalled()
      expect(result).toBe(true)
      expect(notificationStore.state.unreadNotifications).toHaveLength(0)
      expect(notificationStore.state.unreadCount).toBe(0)
    })
  })

  describe('通知CRUD操作', () => {
    it('应该能够创建通知', async () => {
      const newNotification = {
        ...mockNotifications[0],
        id: 3,
        title: '新通知',
        content: '这是一个新通知'
      }
      
      const createForm = {
        title: '新通知',
        content: '这是一个新通知',
        type: 'INFO' as const,
        priority: 'MEDIUM' as const,
        userId: 1
      }
      
      vi.mocked(notificationApi.createNotification).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: newNotification
      })
      
      const result = await notificationStore.createNotification(createForm)
      
      expect(notificationApi.createNotification).toHaveBeenCalledWith(createForm)
      expect(result).toEqual(newNotification)
      expect(notificationStore.state.notifications[0]).toEqual(newNotification)
      expect(notificationStore.state.total).toBe(1)
    })

    it('应该能够删除通知', async () => {
      await notificationStore.fetchNotifications()
      
      vi.mocked(notificationApi.deleteNotification).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: undefined
      })
      
      const result = await notificationStore.deleteNotification(1)
      
      expect(notificationApi.deleteNotification).toHaveBeenCalledWith(1)
      expect(result).toBe(true)
      expect(notificationStore.state.notifications).toHaveLength(1)
      expect(notificationStore.state.total).toBe(1)
    })

    it('应该能够批量删除通知', async () => {
      await notificationStore.fetchNotifications()
      notificationStore.selectNotification(1)
      notificationStore.selectNotification(2)
      
      vi.mocked(notificationApi.batchDeleteNotifications).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: undefined
      })
      
      const result = await notificationStore.batchDeleteNotifications([1, 2])
      
      expect(notificationApi.batchDeleteNotifications).toHaveBeenCalledWith([1, 2])
      expect(result).toBe(true)
      expect(notificationStore.state.notifications).toHaveLength(0)
      expect(notificationStore.state.selectedNotificationIds).toHaveLength(0)
    })
  })
})