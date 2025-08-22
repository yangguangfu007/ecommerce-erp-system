import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationApi } from '../notification'
import type { 
  NotificationQuery, 
  SendNotificationRequest,
  BatchNotificationOperation,
  Notification,
  NotificationTemplate,
  NotificationRule,
  NotificationConfig,
  NotificationStats,
  NotificationSendResult
} from '../notification'

// Mock API module
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import api from '@/api'

describe('通知管理API模块测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mock数据
  const mockNotification: Notification = {
    id: 1,
    title: '库存预警通知',
    content: '商品SKU-001库存不足，当前库存：5件，预警阈值：10件',
    type: 'INVENTORY',
    status: 'UNREAD',
    priority: 'HIGH',
    channel: 'SYSTEM',
    recipientId: 1001,
    recipientType: 'USER',
    senderId: 1,
    senderName: '系统管理员',
    relatedId: 123,
    relatedType: 'PRODUCT',
    metadata: { productSku: 'SKU-001', currentStock: 5, threshold: 10 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockNotificationTemplate: NotificationTemplate = {
    id: 1,
    name: '库存预警模板',
    code: 'INVENTORY_ALERT',
    title: '库存预警：{{productName}}',
    content: '商品{{productName}}(SKU: {{sku}})库存不足，当前库存：{{currentStock}}件，预警阈值：{{threshold}}件',
    type: 'INVENTORY',
    templateType: 'TEXT',
    channels: ['SYSTEM', 'EMAIL'],
    variables: [
      { name: 'productName', label: '商品名称', type: 'string', required: true },
      { name: 'sku', label: 'SKU编码', type: 'string', required: true },
      { name: 'currentStock', label: '当前库存', type: 'number', required: true },
      { name: 'threshold', label: '预警阈值', type: 'number', required: true }
    ],
    isActive: true,
    description: '用于库存不足时的预警通知',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockNotificationRule: NotificationRule = {
    id: 1,
    name: '库存预警规则',
    code: 'INVENTORY_LOW_STOCK',
    templateId: 1,
    templateName: '库存预警模板',
    triggerType: 'EVENT',
    triggerCondition: {
      eventType: 'INVENTORY_LOW',
      threshold: 10
    },
    recipients: [
      { type: 'ROLE', id: 1, name: '库存管理员', channels: ['SYSTEM', 'EMAIL'] }
    ],
    channels: ['SYSTEM', 'EMAIL'],
    isActive: true,
    priority: 'HIGH',
    description: '当库存低于阈值时触发通知',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockNotificationConfig: NotificationConfig = {
    id: 1,
    userId: 1001,
    type: 'INVENTORY',
    channels: ['SYSTEM', 'EMAIL'],
    isEnabled: true,
    settings: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      systemEnabled: true,
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00'
      },
      frequency: 'IMMEDIATE'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockNotificationSendResult: NotificationSendResult = {
    id: 1,
    status: 'SUCCESS',
    channel: 'SYSTEM',
    recipientId: 1001,
    recipientName: '张三',
    sentAt: '2024-01-01T10:00:00Z',
    deliveredAt: '2024-01-01T10:00:01Z'
  }

  const mockNotificationStats: NotificationStats = {
    totalSent: 1000,
    totalRead: 750,
    totalUnread: 200,
    totalArchived: 50,
    readRate: 0.75,
    channelStats: [
      {
        channel: 'SYSTEM',
        sent: 600,
        delivered: 600,
        read: 450,
        failed: 0,
        deliveryRate: 1.0,
        readRate: 0.75
      },
      {
        channel: 'EMAIL',
        sent: 400,
        delivered: 380,
        read: 300,
        failed: 20,
        deliveryRate: 0.95,
        readRate: 0.79
      }
    ],
    typeStats: [
      { type: 'INVENTORY', sent: 300, read: 225, readRate: 0.75 },
      { type: 'ORDER', sent: 400, read: 320, readRate: 0.80 },
      { type: 'SYSTEM', sent: 300, read: 205, readRate: 0.68 }
    ],
    dailyStats: [
      { date: '2024-01-01', sent: 50, read: 38, readRate: 0.76 },
      { date: '2024-01-02', sent: 45, read: 34, readRate: 0.76 }
    ]
  }

  // ==================== 通知查询相关测试 ====================
  
  describe('通知查询相关API', () => {
    it('应该能够获取通知列表', async () => {
      const mockQuery: NotificationQuery = {
        page: 1,
        size: 10,
        type: 'INVENTORY',
        status: 'UNREAD'
      }

      const mockResponse = {
        list: [mockNotification],
        total: 1,
        page: 1,
        size: 10,
        pages: 1
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResponse,
        success: true
      })

      const result = await notificationApi.getNotifications(mockQuery)

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: mockQuery })
      expect(result.data).toEqual(mockResponse)
    })

    it('应该能够根据ID获取通知详情', async () => {
      const id = 1

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotification,
        success: true
      })

      const result = await notificationApi.getNotificationById(id)

      expect(api.get).toHaveBeenCalledWith(`/notifications/${id}`)
      expect(result.data).toEqual(mockNotification)
    })

    it('应该能够获取用户未读通知数量', async () => {
      const userId = 1001
      const mockCount = { count: 5 }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockCount,
        success: true
      })

      const result = await notificationApi.getUnreadCount(userId)

      expect(api.get).toHaveBeenCalledWith('/notifications/unread-count', { 
        params: { userId } 
      })
      expect(result.data).toEqual(mockCount)
    })

    it('应该能够获取用户最新通知', async () => {
      const limit = 5
      const userId = 1001

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotification],
        success: true
      })

      const result = await notificationApi.getLatestNotifications(limit, userId)

      expect(api.get).toHaveBeenCalledWith('/notifications/latest', { 
        params: { limit, userId } 
      })
      expect(result.data).toEqual([mockNotification])
    })

    it('应该能够标记通知为已读', async () => {
      const id = 1
      const readNotification = { ...mockNotification, status: 'READ' as const, readAt: '2024-01-01T10:00:00Z' }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: readNotification,
        success: true
      })

      const result = await notificationApi.markAsRead(id)

      expect(api.put).toHaveBeenCalledWith(`/notifications/${id}/read`)
      expect(result.data.status).toBe('READ')
    })

    it('应该能够标记通知为未读', async () => {
      const id = 1

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotification,
        success: true
      })

      const result = await notificationApi.markAsUnread(id)

      expect(api.put).toHaveBeenCalledWith(`/notifications/${id}/unread`)
      expect(result.data.status).toBe('UNREAD')
    })

    it('应该能够归档通知', async () => {
      const id = 1

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await notificationApi.archiveNotification(id)

      expect(api.put).toHaveBeenCalledWith(`/notifications/${id}/archive`)
    })

    it('应该能够删除通知', async () => {
      const id = 1

      vi.mocked(api.delete).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await notificationApi.deleteNotification(id)

      expect(api.delete).toHaveBeenCalledWith(`/notifications/${id}`)
    })

    it('应该能够标记所有通知为已读', async () => {
      const userId = 1001
      const mockResult = { count: 10 }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await notificationApi.markAllAsRead(userId)

      expect(api.put).toHaveBeenCalledWith('/notifications/mark-all-read', { userId })
      expect(result.data).toEqual(mockResult)
    })
  })

  // ==================== 通知发送相关测试 ====================
  
  describe('通知发送相关API', () => {
    it('应该能够发送通知', async () => {
      const mockRequest: SendNotificationRequest = {
        templateId: 1,
        title: '库存预警',
        content: '商品库存不足',
        type: 'INVENTORY',
        priority: 'HIGH',
        channels: ['SYSTEM', 'EMAIL'],
        recipients: [
          { type: 'USER', id: 1001, name: '张三' }
        ],
        variables: { productName: '测试商品', sku: 'SKU-001' }
      }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationSendResult],
        success: true
      })

      const result = await notificationApi.sendNotification(mockRequest)

      expect(api.post).toHaveBeenCalledWith('/notifications/send', mockRequest)
      expect(result.data).toEqual([mockNotificationSendResult])
    })

    it('应该能够批量发送通知', async () => {
      const mockRequests: SendNotificationRequest[] = [
        {
          title: '通知1',
          content: '内容1',
          type: 'SYSTEM',
          priority: 'NORMAL',
          channels: ['SYSTEM'],
          recipients: [{ type: 'USER', id: 1001, name: '张三' }]
        }
      ]

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationSendResult],
        success: true
      })

      const result = await notificationApi.batchSendNotifications(mockRequests)

      expect(api.post).toHaveBeenCalledWith('/notifications/send/batch', { requests: mockRequests })
      expect(result.data).toEqual([mockNotificationSendResult])
    })

    it('应该能够重新发送通知', async () => {
      const id = 1
      const channels = ['EMAIL']

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationSendResult],
        success: true
      })

      const result = await notificationApi.resendNotification(id, channels)

      expect(api.post).toHaveBeenCalledWith(`/notifications/${id}/resend`, { channels })
      expect(result.data).toEqual([mockNotificationSendResult])
    })

    it('应该能够取消定时通知', async () => {
      const id = 1

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await notificationApi.cancelScheduledNotification(id)

      expect(api.put).toHaveBeenCalledWith(`/notifications/${id}/cancel`)
    })

    it('应该能够获取通知发送状态', async () => {
      const id = 1

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationSendResult],
        success: true
      })

      const result = await notificationApi.getNotificationSendStatus(id)

      expect(api.get).toHaveBeenCalledWith(`/notifications/${id}/send-status`)
      expect(result.data).toEqual([mockNotificationSendResult])
    })
  })

  // ==================== 通知模板相关测试 ====================
  
  describe('通知模板相关API', () => {
    it('应该能够获取通知模板列表', async () => {
      const mockQuery = {
        page: 1,
        size: 10,
        type: 'INVENTORY' as const,
        isActive: true
      }

      const mockResponse = {
        list: [mockNotificationTemplate],
        total: 1,
        page: 1,
        size: 10,
        pages: 1
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResponse,
        success: true
      })

      const result = await notificationApi.getNotificationTemplates(mockQuery)

      expect(api.get).toHaveBeenCalledWith('/notifications/templates', { params: mockQuery })
      expect(result.data).toEqual(mockResponse)
    })

    it('应该能够根据ID获取通知模板', async () => {
      const id = 1

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotificationTemplate,
        success: true
      })

      const result = await notificationApi.getNotificationTemplateById(id)

      expect(api.get).toHaveBeenCalledWith(`/notifications/templates/${id}`)
      expect(result.data).toEqual(mockNotificationTemplate)
    })

    it('应该能够根据代码获取通知模板', async () => {
      const code = 'INVENTORY_ALERT'

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotificationTemplate,
        success: true
      })

      const result = await notificationApi.getNotificationTemplateByCode(code)

      expect(api.get).toHaveBeenCalledWith(`/notifications/templates/by-code/${code}`)
      expect(result.data).toEqual(mockNotificationTemplate)
    })

    it('应该能够创建通知模板', async () => {
      const templateData = {
        name: '新模板',
        code: 'NEW_TEMPLATE',
        title: '新通知模板',
        content: '这是新的通知模板',
        type: 'SYSTEM' as const,
        templateType: 'TEXT' as const,
        channels: ['SYSTEM' as const],
        variables: [],
        isActive: true
      }

      const newTemplate = { ...mockNotificationTemplate, ...templateData, id: 2 }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: newTemplate,
        success: true
      })

      const result = await notificationApi.createNotificationTemplate(templateData)

      expect(api.post).toHaveBeenCalledWith('/notifications/templates', templateData)
      expect(result.data).toEqual(newTemplate)
    })

    it('应该能够更新通知模板', async () => {
      const id = 1
      const updateData = { name: '更新的模板名称', isActive: false }

      const updatedTemplate = { ...mockNotificationTemplate, ...updateData }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: updatedTemplate,
        success: true
      })

      const result = await notificationApi.updateNotificationTemplate(id, updateData)

      expect(api.put).toHaveBeenCalledWith(`/notifications/templates/${id}`, updateData)
      expect(result.data).toEqual(updatedTemplate)
    })

    it('应该能够删除通知模板', async () => {
      const id = 1

      vi.mocked(api.delete).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await notificationApi.deleteNotificationTemplate(id)

      expect(api.delete).toHaveBeenCalledWith(`/notifications/templates/${id}`)
    })

    it('应该能够预览通知模板', async () => {
      const id = 1
      const variables = { productName: '测试商品', sku: 'SKU-001', currentStock: 5, threshold: 10 }
      const mockPreview = { 
        title: '库存预警：测试商品', 
        content: '商品测试商品(SKU: SKU-001)库存不足，当前库存：5件，预警阈值：10件' 
      }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockPreview,
        success: true
      })

      const result = await notificationApi.previewNotificationTemplate(id, variables)

      expect(api.post).toHaveBeenCalledWith(`/notifications/templates/${id}/preview`, { variables })
      expect(result.data).toEqual(mockPreview)
    })

    it('应该能够测试通知模板', async () => {
      const id = 1
      const variables = { productName: '测试商品', sku: 'SKU-001' }
      const recipients = [{ type: 'USER' as const, id: 1001, name: '张三' }]

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationSendResult],
        success: true
      })

      const result = await notificationApi.testNotificationTemplate(id, variables, recipients)

      expect(api.post).toHaveBeenCalledWith(`/notifications/templates/${id}/test`, { variables, recipients })
      expect(result.data).toEqual([mockNotificationSendResult])
    })
  })

  // ==================== 通知规则相关测试 ====================
  
  describe('通知规则相关API', () => {
    it('应该能够获取通知规则列表', async () => {
      const mockQuery = {
        page: 1,
        size: 10,
        isActive: true
      }

      const mockResponse = {
        list: [mockNotificationRule],
        total: 1,
        page: 1,
        size: 10,
        pages: 1
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResponse,
        success: true
      })

      const result = await notificationApi.getNotificationRules(mockQuery)

      expect(api.get).toHaveBeenCalledWith('/notifications/rules', { params: mockQuery })
      expect(result.data).toEqual(mockResponse)
    })

    it('应该能够根据ID获取通知规则', async () => {
      const id = 1

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotificationRule,
        success: true
      })

      const result = await notificationApi.getNotificationRuleById(id)

      expect(api.get).toHaveBeenCalledWith(`/notifications/rules/${id}`)
      expect(result.data).toEqual(mockNotificationRule)
    })

    it('应该能够创建通知规则', async () => {
      const ruleData = {
        name: '新规则',
        code: 'NEW_RULE',
        templateId: 1,
        triggerType: 'EVENT' as const,
        triggerCondition: { eventType: 'TEST_EVENT' },
        recipients: [{ type: 'USER' as const, id: 1001, name: '张三' }],
        channels: ['SYSTEM' as const],
        isActive: true,
        priority: 'NORMAL' as const
      }

      const newRule = { ...mockNotificationRule, ...ruleData, id: 2 }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: newRule,
        success: true
      })

      const result = await notificationApi.createNotificationRule(ruleData)

      expect(api.post).toHaveBeenCalledWith('/notifications/rules', ruleData)
      expect(result.data).toEqual(newRule)
    })

    it('应该能够更新通知规则', async () => {
      const id = 1
      const updateData = { name: '更新的规则名称', isActive: false }

      const updatedRule = { ...mockNotificationRule, ...updateData }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: updatedRule,
        success: true
      })

      const result = await notificationApi.updateNotificationRule(id, updateData)

      expect(api.put).toHaveBeenCalledWith(`/notifications/rules/${id}`, updateData)
      expect(result.data).toEqual(updatedRule)
    })

    it('应该能够删除通知规则', async () => {
      const id = 1

      vi.mocked(api.delete).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await notificationApi.deleteNotificationRule(id)

      expect(api.delete).toHaveBeenCalledWith(`/notifications/rules/${id}`)
    })

    it('应该能够启用/禁用通知规则', async () => {
      const id = 1
      const isActive = false

      const toggledRule = { ...mockNotificationRule, isActive }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: toggledRule,
        success: true
      })

      const result = await notificationApi.toggleNotificationRule(id, isActive)

      expect(api.put).toHaveBeenCalledWith(`/notifications/rules/${id}/toggle`, { isActive })
      expect(result.data.isActive).toBe(isActive)
    })

    it('应该能够测试通知规则', async () => {
      const id = 1
      const testData = { productId: 123, currentStock: 5 }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationSendResult],
        success: true
      })

      const result = await notificationApi.testNotificationRule(id, testData)

      expect(api.post).toHaveBeenCalledWith(`/notifications/rules/${id}/test`, { testData })
      expect(result.data).toEqual([mockNotificationSendResult])
    })
  })

  // ==================== 通知配置相关测试 ====================
  
  describe('通知配置相关API', () => {
    it('应该能够获取用户通知配置', async () => {
      const userId = 1001

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotificationConfig],
        success: true
      })

      const result = await notificationApi.getNotificationConfigs(userId)

      expect(api.get).toHaveBeenCalledWith('/notifications/configs', { 
        params: { userId } 
      })
      expect(result.data).toEqual([mockNotificationConfig])
    })

    it('应该能够获取指定类型的通知配置', async () => {
      const type = 'INVENTORY'
      const userId = 1001

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotificationConfig,
        success: true
      })

      const result = await notificationApi.getNotificationConfigByType(type, userId)

      expect(api.get).toHaveBeenCalledWith(`/notifications/configs/${type}`, { 
        params: { userId } 
      })
      expect(result.data).toEqual(mockNotificationConfig)
    })

    it('应该能够更新通知配置', async () => {
      const type = 'INVENTORY'
      const config = { isEnabled: false }
      const userId = 1001

      const updatedConfig = { ...mockNotificationConfig, ...config }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: updatedConfig,
        success: true
      })

      const result = await notificationApi.updateNotificationConfig(type, config, userId)

      expect(api.put).toHaveBeenCalledWith(`/notifications/configs/${type}`, { ...config, userId })
      expect(result.data).toEqual(updatedConfig)
    })

    it('应该能够重置通知配置为默认值', async () => {
      const type = 'INVENTORY'
      const userId = 1001

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotificationConfig,
        success: true
      })

      const result = await notificationApi.resetNotificationConfig(type, userId)

      expect(api.post).toHaveBeenCalledWith(`/notifications/configs/${type}/reset`, { userId })
      expect(result.data).toEqual(mockNotificationConfig)
    })
  })

  // ==================== 批量操作相关测试 ====================
  
  describe('批量操作相关API', () => {
    it('应该能够批量操作通知', async () => {
      const mockOperation: BatchNotificationOperation = {
        notificationIds: [1, 2, 3],
        operation: 'markRead'
      }

      const mockResult = { success: 3, failed: 0, errors: [] }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await notificationApi.batchOperateNotifications(mockOperation)

      expect(api.post).toHaveBeenCalledWith('/notifications/batch', mockOperation)
      expect(result.data).toEqual(mockResult)
    })

    it('应该能够批量标记为已读', async () => {
      const notificationIds = [1, 2, 3]

      const mockResult = { success: 3, failed: 0 }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await notificationApi.batchMarkAsRead(notificationIds)

      expect(api.put).toHaveBeenCalledWith('/notifications/batch/read', { notificationIds })
      expect(result.data).toEqual(mockResult)
    })

    it('应该能够批量归档通知', async () => {
      const notificationIds = [1, 2, 3]

      const mockResult = { success: 3, failed: 0 }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await notificationApi.batchArchiveNotifications(notificationIds)

      expect(api.put).toHaveBeenCalledWith('/notifications/batch/archive', { notificationIds })
      expect(result.data).toEqual(mockResult)
    })

    it('应该能够批量删除通知', async () => {
      const notificationIds = [1, 2, 3]

      const mockResult = { success: 3, failed: 0 }

      vi.mocked(api.delete).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await notificationApi.batchDeleteNotifications(notificationIds)

      expect(api.delete).toHaveBeenCalledWith('/notifications/batch', { data: { notificationIds } })
      expect(result.data).toEqual(mockResult)
    })
  })

  // ==================== 统计和报表相关测试 ====================
  
  describe('统计和报表相关API', () => {
    it('应该能够获取通知统计信息', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const type = 'INVENTORY'
      const userId = 1001

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockNotificationStats,
        success: true
      })

      const result = await notificationApi.getNotificationStats(startDate, endDate, type, userId)

      expect(api.get).toHaveBeenCalledWith('/notifications/stats', { 
        params: { startDate, endDate, type, userId } 
      })
      expect(result.data).toEqual(mockNotificationStats)
    })

    it('应该能够获取通知发送趋势', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const groupBy = 'day'

      const mockTrends = [
        { date: '2024-01-01', sent: 50, read: 38 },
        { date: '2024-01-02', sent: 45, read: 34 }
      ]

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockTrends,
        success: true
      })

      const result = await notificationApi.getNotificationTrends(startDate, endDate, groupBy)

      expect(api.get).toHaveBeenCalledWith('/notifications/trends', { 
        params: { startDate, endDate, groupBy } 
      })
      expect(result.data).toEqual(mockTrends)
    })

    it('应该能够获取通知渠道效果分析', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'

      const mockAnalysis = [
        { channel: 'SYSTEM', deliveryRate: 1.0, readRate: 0.75 },
        { channel: 'EMAIL', deliveryRate: 0.95, readRate: 0.79 }
      ]

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockAnalysis,
        success: true
      })

      const result = await notificationApi.getChannelEffectiveness(startDate, endDate)

      expect(api.get).toHaveBeenCalledWith('/notifications/analysis/channels', { 
        params: { startDate, endDate } 
      })
      expect(result.data).toEqual(mockAnalysis)
    })

    it('应该能够导出通知数据', async () => {
      const query = { type: 'INVENTORY' as const, status: 'READ' as const }
      const format = 'excel'
      const mockExport = { downloadUrl: 'https://example.com/export.xlsx' }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockExport,
        success: true
      })

      const result = await notificationApi.exportNotificationData(query, format)

      expect(api.post).toHaveBeenCalledWith('/notifications/export', { query, format })
      expect(result.data).toEqual(mockExport)
    })
  })

  // ==================== 搜索和筛选相关测试 ====================
  
  describe('搜索和筛选相关API', () => {
    it('应该能够搜索通知', async () => {
      const keyword = '库存'
      const limit = 10
      const userId = 1001

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotification],
        success: true
      })

      const result = await notificationApi.searchNotifications(keyword, limit, userId)

      expect(api.get).toHaveBeenCalledWith('/notifications/search', { 
        params: { keyword, limit, userId } 
      })
      expect(result.data).toEqual([mockNotification])
    })

    it('应该能够获取通知筛选选项', async () => {
      const mockFilterOptions = {
        types: [
          { label: '系统通知', value: 'SYSTEM' as const },
          { label: '库存通知', value: 'INVENTORY' as const }
        ],
        priorities: [
          { label: '普通', value: 'NORMAL' as const },
          { label: '高优先级', value: 'HIGH' as const }
        ],
        channels: [
          { label: '系统内通知', value: 'SYSTEM' as const },
          { label: '邮件', value: 'EMAIL' as const }
        ],
        statuses: [
          { label: '未读', value: 'UNREAD' as const },
          { label: '已读', value: 'READ' as const }
        ]
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockFilterOptions,
        success: true
      })

      const result = await notificationApi.getFilterOptions()

      expect(api.get).toHaveBeenCalledWith('/notifications/filter-options')
      expect(result.data).toEqual(mockFilterOptions)
    })

    it('应该能够获取通知模板筛选选项', async () => {
      const mockTemplateFilterOptions = {
        types: [
          { label: '系统通知', value: 'SYSTEM' as const },
          { label: '库存通知', value: 'INVENTORY' as const }
        ],
        templateTypes: [
          { label: '纯文本', value: 'TEXT' as const },
          { label: 'HTML格式', value: 'HTML' as const }
        ],
        channels: [
          { label: '系统内通知', value: 'SYSTEM' as const },
          { label: '邮件', value: 'EMAIL' as const }
        ]
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockTemplateFilterOptions,
        success: true
      })

      const result = await notificationApi.getTemplateFilterOptions()

      expect(api.get).toHaveBeenCalledWith('/notifications/templates/filter-options')
      expect(result.data).toEqual(mockTemplateFilterOptions)
    })
  })

  // ==================== 错误处理测试 ====================
  
  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      const error = new Error('网络错误')
      vi.mocked(api.get).mockRejectedValue(error)

      await expect(notificationApi.getNotifications({ page: 1, size: 10 })).rejects.toThrow('网络错误')
    })

    it('应该正确处理参数验证', async () => {
      // 测试必需参数
      const invalidRequest = {} as SendNotificationRequest
      
      vi.mocked(api.post).mockRejectedValue(new Error('参数验证失败'))

      await expect(notificationApi.sendNotification(invalidRequest)).rejects.toThrow('参数验证失败')
    })
  })

  // ==================== 边界情况测试 ====================
  
  describe('边界情况', () => {
    it('应该正确处理空数据', async () => {
      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: {
          list: [],
          total: 0,
          page: 1,
          size: 10,
          pages: 0
        },
        success: true
      })

      const result = await notificationApi.getNotifications({ page: 1, size: 10 })

      expect(result.data.list).toEqual([])
      expect(result.data.total).toBe(0)
    })

    it('应该正确处理可选参数', async () => {
      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: { count: 0 },
        success: true
      })

      // 不传userId参数
      await notificationApi.getUnreadCount()

      expect(api.get).toHaveBeenCalledWith('/notifications/unread-count', { 
        params: undefined 
      })
    })

    it('应该正确处理默认参数', async () => {
      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockNotification],
        success: true
      })

      // 使用默认limit参数
      await notificationApi.getLatestNotifications()

      expect(api.get).toHaveBeenCalledWith('/notifications/latest', { 
        params: { limit: 10, userId: undefined } 
      })
    })

    it('应该正确处理模板变量为空的情况', async () => {
      const id = 1
      const variables = {}

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: { title: '标题', content: '内容' },
        success: true
      })

      const result = await notificationApi.previewNotificationTemplate(id, variables)

      expect(api.post).toHaveBeenCalledWith(`/notifications/templates/${id}/preview`, { variables })
      expect(result.data.title).toBe('标题')
    })

    it('应该正确处理批量操作空数组', async () => {
      const notificationIds: number[] = []

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: { success: 0, failed: 0 },
        success: true
      })

      const result = await notificationApi.batchMarkAsRead(notificationIds)

      expect(api.put).toHaveBeenCalledWith('/notifications/batch/read', { notificationIds })
      expect(result.data.success).toBe(0)
    })
  })
})