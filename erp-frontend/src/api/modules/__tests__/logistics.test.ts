import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logisticsApi } from '../logistics'
import type { 
  CreateLabelRequest, 
  LogisticsQuery, 
  BatchLogisticsOperation,
  HandleExceptionRequest,
  LogisticsOrder,
  TrackingInfo,
  CreateLabelResponse,
  LogisticsStats,
  CarrierConfig
} from '../logistics'

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

describe('物流管理API模块测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mock数据
  const mockLogisticsOrder: LogisticsOrder = {
    id: 1,
    orderId: 1001,
    orderNumber: 'ORD-2024-001',
    trackingNumber: 'YT2024001234567',
    carrier: 'YUNEXPRESS',
    service: 'STANDARD',
    status: 'CREATED',
    shippingAddress: {
      name: '张三',
      phone: '13800138000',
      country: 'CN',
      state: '广东省',
      city: '深圳市',
      address1: '南山区科技园',
      postalCode: '518000'
    },
    weight: 0.5,
    dimensions: {
      length: 20,
      width: 15,
      height: 10,
      unit: 'cm'
    },
    cost: 25.50,
    labelUrl: 'https://example.com/label.pdf',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockTrackingInfo: TrackingInfo = {
    trackingNumber: 'YT2024001234567',
    carrier: 'YUNEXPRESS',
    status: 'IN_TRANSIT',
    statusDescription: '运输中',
    events: [
      {
        id: 1,
        timestamp: '2024-01-01T10:00:00Z',
        location: '深圳',
        status: 'PICKED_UP',
        description: '已取件'
      }
    ],
    lastUpdated: '2024-01-01T10:00:00Z'
  }

  const mockCreateLabelResponse: CreateLabelResponse = {
    logisticsOrderId: 1,
    trackingNumber: 'YT2024001234567',
    labelUrl: 'https://example.com/label.pdf',
    cost: 25.50,
    currency: 'CNY'
  }

  // ==================== 面单生成相关测试 ====================
  
  describe('面单生成相关API', () => {
    it('应该能够生成面单', async () => {
      const mockRequest: CreateLabelRequest = {
        orderId: 1001,
        carrier: 'YUNEXPRESS',
        service: 'STANDARD',
        shippingAddress: mockLogisticsOrder.shippingAddress,
        packageInfo: {
          weight: 0.5,
          dimensions: {
            length: 20,
            width: 15,
            height: 10,
            unit: 'cm'
          }
        }
      }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockCreateLabelResponse,
        success: true
      })

      const result = await logisticsApi.createLabel(mockRequest)

      expect(api.post).toHaveBeenCalledWith('/logistics/labels', mockRequest)
      expect(result.data).toEqual(mockCreateLabelResponse)
    })

    it('应该能够批量生成面单', async () => {
      const mockRequests: CreateLabelRequest[] = [
        {
          orderId: 1001,
          carrier: 'YUNEXPRESS',
          service: 'STANDARD',
          shippingAddress: mockLogisticsOrder.shippingAddress,
          packageInfo: { weight: 0.5 }
        }
      ]

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockCreateLabelResponse],
        success: true
      })

      const result = await logisticsApi.batchCreateLabels(mockRequests)

      expect(api.post).toHaveBeenCalledWith('/logistics/labels/batch', { requests: mockRequests })
      expect(result.data).toEqual([mockCreateLabelResponse])
    })

    it('应该能够重新生成面单', async () => {
      const logisticsOrderId = 1
      const labelFormat = 'PDF'

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockCreateLabelResponse,
        success: true
      })

      const result = await logisticsApi.regenerateLabel(logisticsOrderId, labelFormat)

      expect(api.post).toHaveBeenCalledWith(`/logistics/orders/${logisticsOrderId}/regenerate-label`, { labelFormat })
      expect(result.data).toEqual(mockCreateLabelResponse)
    })

    it('应该能够下载面单', async () => {
      const logisticsOrderId = 1
      const mockDownloadUrl = { downloadUrl: 'https://example.com/download/label.pdf' }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockDownloadUrl,
        success: true
      })

      const result = await logisticsApi.downloadLabel(logisticsOrderId)

      expect(api.get).toHaveBeenCalledWith(`/logistics/orders/${logisticsOrderId}/label/download`)
      expect(result.data).toEqual(mockDownloadUrl)
    })

    it('应该能够打印面单', async () => {
      const logisticsOrderIds = [1, 2, 3]
      const mockPrintResult = { printJobId: 'print-job-123' }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockPrintResult,
        success: true
      })

      const result = await logisticsApi.printLabels(logisticsOrderIds)

      expect(api.post).toHaveBeenCalledWith('/logistics/labels/print', { logisticsOrderIds })
      expect(result.data).toEqual(mockPrintResult)
    })
  })

  // ==================== 物流订单管理相关测试 ====================
  
  describe('物流订单管理相关API', () => {
    it('应该能够获取物流订单列表', async () => {
      const mockQuery: LogisticsQuery = {
        page: 1,
        size: 10,
        status: 'CREATED'
      }

      const mockResponse = {
        list: [mockLogisticsOrder],
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

      const result = await logisticsApi.getLogisticsOrders(mockQuery)

      expect(api.get).toHaveBeenCalledWith('/logistics/orders', { params: mockQuery })
      expect(result.data).toEqual(mockResponse)
    })

    it('应该能够根据ID获取物流订单详情', async () => {
      const id = 1

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockLogisticsOrder,
        success: true
      })

      const result = await logisticsApi.getLogisticsOrderById(id)

      expect(api.get).toHaveBeenCalledWith(`/logistics/orders/${id}`)
      expect(result.data).toEqual(mockLogisticsOrder)
    })

    it('应该能够根据订单ID获取物流订单', async () => {
      const orderId = 1001

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockLogisticsOrder,
        success: true
      })

      const result = await logisticsApi.getLogisticsOrderByOrderId(orderId)

      expect(api.get).toHaveBeenCalledWith(`/logistics/orders/by-order/${orderId}`)
      expect(result.data).toEqual(mockLogisticsOrder)
    })

    it('应该能够根据运单号获取物流订单', async () => {
      const trackingNumber = 'YT2024001234567'

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockLogisticsOrder,
        success: true
      })

      const result = await logisticsApi.getLogisticsOrderByTrackingNumber(trackingNumber)

      expect(api.get).toHaveBeenCalledWith(`/logistics/orders/by-tracking/${trackingNumber}`)
      expect(result.data).toEqual(mockLogisticsOrder)
    })

    it('应该能够更新物流订单状态', async () => {
      const id = 1
      const status = 'SHIPPED'
      const notes = '已发货'

      const updatedOrder = { ...mockLogisticsOrder, status }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: updatedOrder,
        success: true
      })

      const result = await logisticsApi.updateLogisticsOrderStatus(id, status, notes)

      expect(api.put).toHaveBeenCalledWith(`/logistics/orders/${id}/status`, { status, notes })
      expect(result.data.status).toBe(status)
    })

    it('应该能够取消物流订单', async () => {
      const id = 1
      const reason = '客户取消订单'

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await logisticsApi.cancelLogisticsOrder(id, reason)

      expect(api.put).toHaveBeenCalledWith(`/logistics/orders/${id}/cancel`, { reason })
    })
  })

  // ==================== 物流跟踪相关测试 ====================
  
  describe('物流跟踪相关API', () => {
    it('应该能够获取物流跟踪信息', async () => {
      const trackingNumber = 'YT2024001234567'
      const carrier = 'YUNEXPRESS'

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockTrackingInfo,
        success: true
      })

      const result = await logisticsApi.getTrackingInfo(trackingNumber, carrier)

      expect(api.get).toHaveBeenCalledWith(`/logistics/tracking/${trackingNumber}`, { 
        params: { carrier } 
      })
      expect(result.data).toEqual(mockTrackingInfo)
    })

    it('应该能够批量获取物流跟踪信息', async () => {
      const trackingNumbers = ['YT2024001234567', 'YT2024001234568']

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockTrackingInfo],
        success: true
      })

      const result = await logisticsApi.batchGetTrackingInfo(trackingNumbers)

      expect(api.post).toHaveBeenCalledWith('/logistics/tracking/batch', { trackingNumbers })
      expect(result.data).toEqual([mockTrackingInfo])
    })

    it('应该能够刷新物流跟踪信息', async () => {
      const trackingNumber = 'YT2024001234567'
      const carrier = 'YUNEXPRESS'

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockTrackingInfo,
        success: true
      })

      const result = await logisticsApi.refreshTrackingInfo(trackingNumber, carrier)

      expect(api.post).toHaveBeenCalledWith(`/logistics/tracking/${trackingNumber}/refresh`, { carrier })
      expect(result.data).toEqual(mockTrackingInfo)
    })

    it('应该能够订阅物流跟踪更新', async () => {
      const trackingNumbers = ['YT2024001234567']
      const webhookUrl = 'https://example.com/webhook'
      const mockSubscription = { subscriptionId: 'sub-123' }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockSubscription,
        success: true
      })

      const result = await logisticsApi.subscribeTrackingUpdates(trackingNumbers, webhookUrl)

      expect(api.post).toHaveBeenCalledWith('/logistics/tracking/subscribe', { trackingNumbers, webhookUrl })
      expect(result.data).toEqual(mockSubscription)
    })

    it('应该能够取消物流跟踪订阅', async () => {
      const subscriptionId = 'sub-123'

      vi.mocked(api.delete).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await logisticsApi.unsubscribeTrackingUpdates(subscriptionId)

      expect(api.delete).toHaveBeenCalledWith(`/logistics/tracking/subscribe/${subscriptionId}`)
    })
  })  
// ==================== 异常处理相关测试 ====================
  
  describe('异常处理相关API', () => {
    it('应该能够获取异常物流订单列表', async () => {
      const mockQuery = {
        page: 1,
        size: 10,
        carrier: 'YUNEXPRESS' as const
      }

      const mockResponse = {
        list: [{ ...mockLogisticsOrder, status: 'EXCEPTION' as const }],
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

      const result = await logisticsApi.getExceptionOrders(mockQuery)

      expect(api.get).toHaveBeenCalledWith('/logistics/orders/exceptions', { params: mockQuery })
      expect(result.data).toEqual(mockResponse)
    })

    it('应该能够处理物流异常', async () => {
      const mockRequest: HandleExceptionRequest = {
        logisticsOrderId: 1,
        exceptionType: 'DAMAGED',
        description: '包裹损坏',
        solution: 'RESEND',
        notes: '重新发货'
      }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await logisticsApi.handleException(mockRequest)

      expect(api.post).toHaveBeenCalledWith('/logistics/exceptions/handle', mockRequest)
    })

    it('应该能够重新发货', async () => {
      const logisticsOrderId = 1
      const newShippingAddress = mockLogisticsOrder.shippingAddress

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockCreateLabelResponse,
        success: true
      })

      const result = await logisticsApi.resendOrder(logisticsOrderId, newShippingAddress)

      expect(api.post).toHaveBeenCalledWith(`/logistics/orders/${logisticsOrderId}/resend`, { newShippingAddress })
      expect(result.data).toEqual(mockCreateLabelResponse)
    })

    it('应该能够标记异常已解决', async () => {
      const logisticsOrderId = 1
      const solution = '已重新发货'

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: null,
        success: true
      })

      await logisticsApi.markExceptionResolved(logisticsOrderId, solution)

      expect(api.put).toHaveBeenCalledWith(`/logistics/orders/${logisticsOrderId}/resolve-exception`, { solution })
    })
  })

  // ==================== 批量操作相关测试 ====================
  
  describe('批量操作相关API', () => {
    it('应该能够批量操作物流订单', async () => {
      const mockOperation: BatchLogisticsOperation = {
        logisticsOrderIds: [1, 2, 3],
        operation: 'updateStatus',
        status: 'SHIPPED'
      }

      const mockResult = { success: 3, failed: 0, errors: [] }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await logisticsApi.batchOperateLogisticsOrders(mockOperation)

      expect(api.post).toHaveBeenCalledWith('/logistics/orders/batch', mockOperation)
      expect(result.data).toEqual(mockResult)
    })

    it('应该能够批量更新物流状态', async () => {
      const logisticsOrderIds = [1, 2, 3]
      const status = 'SHIPPED'
      const notes = '批量发货'

      const mockResult = { success: 3, failed: 0 }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await logisticsApi.batchUpdateStatus(logisticsOrderIds, status, notes)

      expect(api.put).toHaveBeenCalledWith('/logistics/orders/batch/status', { logisticsOrderIds, status, notes })
      expect(result.data).toEqual(mockResult)
    })

    it('应该能够批量取消物流订单', async () => {
      const logisticsOrderIds = [1, 2, 3]
      const reason = '批量取消'

      const mockResult = { success: 3, failed: 0 }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockResult,
        success: true
      })

      const result = await logisticsApi.batchCancelOrders(logisticsOrderIds, reason)

      expect(api.put).toHaveBeenCalledWith('/logistics/orders/batch/cancel', { logisticsOrderIds, reason })
      expect(result.data).toEqual(mockResult)
    })
  })

  // ==================== 统计和报表相关测试 ====================
  
  describe('统计和报表相关API', () => {
    it('应该能够获取物流统计信息', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const carrier = 'YUNEXPRESS'

      const mockStats: LogisticsStats = {
        totalOrders: 100,
        pendingOrders: 10,
        inTransitOrders: 50,
        deliveredOrders: 35,
        exceptionOrders: 5,
        totalCost: 2550.00,
        averageDeliveryTime: 7.5,
        deliveryRate: 0.95,
        exceptionRate: 0.05
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockStats,
        success: true
      })

      const result = await logisticsApi.getLogisticsStats(startDate, endDate, carrier)

      expect(api.get).toHaveBeenCalledWith('/logistics/stats', { 
        params: { startDate, endDate, carrier } 
      })
      expect(result.data).toEqual(mockStats)
    })

    it('应该能够获取物流成本分析', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const groupBy = 'carrier'

      const mockAnalysis = [
        { carrier: 'YUNEXPRESS', totalCost: 1500.00, orderCount: 60 },
        { carrier: 'DHL', totalCost: 1050.00, orderCount: 40 }
      ]

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockAnalysis,
        success: true
      })

      const result = await logisticsApi.getCostAnalysis(startDate, endDate, groupBy)

      expect(api.get).toHaveBeenCalledWith('/logistics/analysis/cost', { 
        params: { startDate, endDate, groupBy } 
      })
      expect(result.data).toEqual(mockAnalysis)
    })

    it('应该能够获取配送时效分析', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const carrier = 'YUNEXPRESS'

      const mockAnalysis = [
        { date: '2024-01-01', averageDeliveryTime: 7.2, orderCount: 10 },
        { date: '2024-01-02', averageDeliveryTime: 7.8, orderCount: 15 }
      ]

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockAnalysis,
        success: true
      })

      const result = await logisticsApi.getDeliveryTimeAnalysis(startDate, endDate, carrier)

      expect(api.get).toHaveBeenCalledWith('/logistics/analysis/delivery-time', { 
        params: { startDate, endDate, carrier } 
      })
      expect(result.data).toEqual(mockAnalysis)
    })

    it('应该能够导出物流数据', async () => {
      const query = { status: 'DELIVERED' as const }
      const format = 'excel'
      const mockExport = { downloadUrl: 'https://example.com/export.xlsx' }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockExport,
        success: true
      })

      const result = await logisticsApi.exportLogisticsData(query, format)

      expect(api.post).toHaveBeenCalledWith('/logistics/export', { query, format })
      expect(result.data).toEqual(mockExport)
    })
  }) 
 // ==================== 物流服务商配置相关测试 ====================
  
  describe('物流服务商配置相关API', () => {
    const mockCarrierConfig: CarrierConfig = {
      carrier: 'YUNEXPRESS',
      name: '云途物流',
      apiEndpoint: 'https://api.yunexpress.com',
      credentials: {
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key'
      },
      services: [
        {
          code: 'YE_STANDARD',
          name: '标准服务',
          type: 'STANDARD',
          enabled: true
        }
      ],
      settings: {
        defaultService: 'YE_STANDARD',
        autoTracking: true,
        labelFormat: 'PDF',
        testMode: false
      },
      status: 'ACTIVE'
    }

    it('应该能够获取物流服务商配置列表', async () => {
      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockCarrierConfig],
        success: true
      })

      const result = await logisticsApi.getCarrierConfigs()

      expect(api.get).toHaveBeenCalledWith('/logistics/carriers')
      expect(result.data).toEqual([mockCarrierConfig])
    })

    it('应该能够获取指定服务商配置', async () => {
      const carrier = 'YUNEXPRESS'

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockCarrierConfig,
        success: true
      })

      const result = await logisticsApi.getCarrierConfig(carrier)

      expect(api.get).toHaveBeenCalledWith(`/logistics/carriers/${carrier}`)
      expect(result.data).toEqual(mockCarrierConfig)
    })

    it('应该能够更新物流服务商配置', async () => {
      const carrier = 'YUNEXPRESS'
      const config = { status: 'INACTIVE' as const }

      const updatedConfig = { ...mockCarrierConfig, ...config }

      vi.mocked(api.put).mockResolvedValue({
        code: 200,
        message: '成功',
        data: updatedConfig,
        success: true
      })

      const result = await logisticsApi.updateCarrierConfig(carrier, config)

      expect(api.put).toHaveBeenCalledWith(`/logistics/carriers/${carrier}`, config)
      expect(result.data).toEqual(updatedConfig)
    })

    it('应该能够测试物流服务商连接', async () => {
      const carrier = 'YUNEXPRESS'
      const mockTestResult = { success: true, message: '连接成功', responseTime: 150 }

      vi.mocked(api.post).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockTestResult,
        success: true
      })

      const result = await logisticsApi.testCarrierConnection(carrier)

      expect(api.post).toHaveBeenCalledWith(`/logistics/carriers/${carrier}/test`)
      expect(result.data).toEqual(mockTestResult)
    })

    it('应该能够获取物流服务商支持的服务类型', async () => {
      const carrier = 'YUNEXPRESS'
      const mockServices = [
        { code: 'YE_STANDARD', name: '标准服务', type: 'STANDARD' as const },
        { code: 'YE_EXPRESS', name: '快递服务', type: 'EXPRESS' as const }
      ]

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockServices,
        success: true
      })

      const result = await logisticsApi.getCarrierServices(carrier)

      expect(api.get).toHaveBeenCalledWith(`/logistics/carriers/${carrier}/services`)
      expect(result.data).toEqual(mockServices)
    })
  })

  // ==================== 搜索和筛选相关测试 ====================
  
  describe('搜索和筛选相关API', () => {
    it('应该能够搜索物流订单', async () => {
      const keyword = 'YT2024'
      const limit = 10

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockLogisticsOrder],
        success: true
      })

      const result = await logisticsApi.searchLogisticsOrders(keyword, limit)

      expect(api.get).toHaveBeenCalledWith('/logistics/orders/search', { 
        params: { keyword, limit } 
      })
      expect(result.data).toEqual([mockLogisticsOrder])
    })

    it('应该能够根据运单号搜索', async () => {
      const trackingNumber = 'YT2024'

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: [mockLogisticsOrder],
        success: true
      })

      const result = await logisticsApi.searchByTrackingNumber(trackingNumber)

      expect(api.get).toHaveBeenCalledWith('/logistics/orders/search/tracking', { 
        params: { trackingNumber } 
      })
      expect(result.data).toEqual([mockLogisticsOrder])
    })

    it('应该能够获取物流订单筛选选项', async () => {
      const mockFilterOptions = {
        carriers: [
          { label: '云途物流', value: 'YUNEXPRESS' as const },
          { label: 'DHL', value: 'DHL' as const }
        ],
        services: [
          { label: '标准服务', value: 'STANDARD' as const },
          { label: '快递服务', value: 'EXPRESS' as const }
        ],
        statuses: [
          { label: '已创建', value: 'CREATED' as const },
          { label: '运输中', value: 'IN_TRANSIT' as const }
        ]
      }

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockFilterOptions,
        success: true
      })

      const result = await logisticsApi.getFilterOptions()

      expect(api.get).toHaveBeenCalledWith('/logistics/orders/filter-options')
      expect(result.data).toEqual(mockFilterOptions)
    })
  })

  // ==================== 错误处理测试 ====================
  
  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      const error = new Error('网络错误')
      vi.mocked(api.get).mockRejectedValue(error)

      await expect(logisticsApi.getLogisticsOrders({ page: 1, size: 10 })).rejects.toThrow('网络错误')
    })

    it('应该正确处理参数验证', async () => {
      // 测试必需参数
      const invalidRequest = {} as CreateLabelRequest
      
      vi.mocked(api.post).mockRejectedValue(new Error('参数验证失败'))

      await expect(logisticsApi.createLabel(invalidRequest)).rejects.toThrow('参数验证失败')
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

      const result = await logisticsApi.getLogisticsOrders({ page: 1, size: 10 })

      expect(result.data.list).toEqual([])
      expect(result.data.total).toBe(0)
    })

    it('应该正确处理可选参数', async () => {
      const trackingNumber = 'YT2024001234567'

      vi.mocked(api.get).mockResolvedValue({
        code: 200,
        message: '成功',
        data: mockTrackingInfo,
        success: true
      })

      // 不传carrier参数
      await logisticsApi.getTrackingInfo(trackingNumber)

      expect(api.get).toHaveBeenCalledWith(`/logistics/tracking/${trackingNumber}`, { 
        params: undefined 
      })
    })
  })
})