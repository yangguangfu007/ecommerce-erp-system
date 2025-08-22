import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { orderApi } from '../order'
import api from '@/api'
import type {
  Order,
  OrderItem,
  OrderStatus,
  Store,
  OrderQuery,
  CreateOrderForm,
  UpdateOrderForm,
  UpdateOrderStatusForm,
  BatchOrderOperation,
  OrderSyncParams,
  OrderSyncResult,
  OrderStats,
  OrderFilterOptions,
  OrderExportParams,
  PageResponse,
  ApiResponse,
} from '@/types'

// Mock API service
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}))

// Mock data
const mockStore: Store = {
  id: 1,
  storeName: '测试店铺',
  platform: 'walmart',
  platformStoreId: 'store123',
  apiCredentials: { apiKey: 'test-key' },
  status: 'ACTIVE',
  lastSyncTime: '2024-01-01T12:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockOrderItem: OrderItem = {
  id: 1,
  orderId: 1,
  sku: 'TEST-SKU-001',
  productTitle: '测试商品',
  quantity: 2,
  unitPrice: 29.99,
  totalPrice: 59.98,
}

const mockOrder: Order = {
  id: 1,
  orderId: 'ORD-2024-001',
  platformOrderId: 'WM-123456789',
  storeId: 1,
  store: mockStore,
  customerName: '张三',
  customerEmail: 'zhangsan@example.com',
  shippingAddress: {
    name: '张三',
    phone: '13800138000',
    country: 'CN',
    state: '广东省',
    city: '深圳市',
    address1: '南山区科技园',
    address2: 'A座1001室',
    postalCode: '518000',
  },
  billingAddress: {
    name: '张三',
    phone: '13800138000',
    country: 'CN',
    state: '广东省',
    city: '深圳市',
    address1: '南山区科技园',
    address2: 'A座1001室',
    postalCode: '518000',
  },
  totalAmount: 59.98,
  currency: 'USD',
  status: 'PENDING',
  platformStatus: 'Created',
  orderDate: '2024-01-01T10:00:00Z',
  shipDate: undefined,
  trackingNumber: undefined,
  items: [mockOrderItem],
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
}

const mockApiResponse = <T>(data: T): ApiResponse<T> => ({
  code: 200,
  message: '操作成功',
  data,
  success: true,
  timestamp: Date.now(),
})

const mockPageResponse = <T>(list: T[], total: number = list.length): PageResponse<T> => ({
  list,
  total,
  page: 1,
  size: 10,
  pages: Math.ceil(total / 10),
})

describe('orderApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('订单基础管理API', () => {
    it('应该能够获取订单列表', async () => {
      const query: OrderQuery = {
        page: 1,
        size: 10,
        status: 'PENDING',
        storeId: 1,
        keyword: '测试',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }

      const orderList = [mockOrder]
      const pageResponse = mockPageResponse(orderList, 1)

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(pageResponse))

      const result = await orderApi.getOrders(query)

      expect(api.get).toHaveBeenCalledWith('/orders', { params: query })
      expect(result.data).toEqual(pageResponse)
      expect(result.data.list).toHaveLength(1)
    })

    it('应该能够根据ID获取订单详情', async () => {
      const orderId = 1

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockOrder))

      const result = await orderApi.getOrderById(orderId)

      expect(api.get).toHaveBeenCalledWith(`/orders/${orderId}`)
      expect(result.data).toEqual(mockOrder)
    })

    it('应该能够根据订单号获取订单详情', async () => {
      const orderId = 'ORD-2024-001'

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockOrder))

      const result = await orderApi.getOrderByOrderId(orderId)

      expect(api.get).toHaveBeenCalledWith(`/orders/by-order-id/${orderId}`)
      expect(result.data).toEqual(mockOrder)
    })

    it('应该能够根据平台订单号获取订单详情', async () => {
      const platformOrderId = 'WM-123456789'

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockOrder))

      const result = await orderApi.getOrderByPlatformOrderId(platformOrderId)

      expect(api.get).toHaveBeenCalledWith(`/orders/by-platform-order-id/${platformOrderId}`)
      expect(result.data).toEqual(mockOrder)
    })

    it('应该能够创建新订单', async () => {
      const orderForm: CreateOrderForm = {
        orderId: 'ORD-2024-002',
        platformOrderId: 'WM-987654321',
        storeId: 1,
        customerName: '李四',
        customerEmail: 'lisi@example.com',
        shippingAddress: {
          name: '李四',
          phone: '13900139000',
          country: 'CN',
          state: '北京市',
          city: '北京市',
          address1: '朝阳区建国门外大街',
          address2: 'B座2002室',
          postalCode: '100020',
        },
        totalAmount: 89.97,
        currency: 'USD',
        status: 'PENDING',
        platformStatus: 'Created',
        orderDate: '2024-01-02T10:00:00Z',
        items: [
          {
            sku: 'TEST-SKU-002',
            productTitle: '测试商品2',
            quantity: 3,
            unitPrice: 29.99,
            totalPrice: 89.97,
          },
        ],
      }

      const newOrder = { ...mockOrder, id: 2, ...orderForm }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(newOrder))

      const result = await orderApi.createOrder(orderForm)

      expect(api.post).toHaveBeenCalledWith('/orders', orderForm)
      expect(result.data).toEqual(newOrder)
    })

    it('应该能够更新订单信息', async () => {
      const orderForm: UpdateOrderForm = {
        id: 1,
        status: 'CONFIRMED',
        customerName: '张三（已更新）',
        customerEmail: 'zhangsan_updated@example.com',
      }

      const updatedOrder = { ...mockOrder, ...orderForm }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(updatedOrder))

      const result = await orderApi.updateOrder(orderForm)

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderForm.id}`, {
        status: orderForm.status,
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
      })
      expect(result.data).toEqual(updatedOrder)
    })

    it('应该能够删除订单', async () => {
      const orderId = 1

      vi.mocked(api.delete).mockResolvedValue(mockApiResponse(undefined))

      const result = await orderApi.deleteOrder(orderId)

      expect(api.delete).toHaveBeenCalledWith(`/orders/${orderId}`)
      expect(result.code).toBe(200)
    })
  })

  describe('订单状态管理API', () => {
    it('应该能够更新订单状态', async () => {
      const statusForm: UpdateOrderStatusForm = {
        id: 1,
        status: 'CONFIRMED',
        reason: '库存充足',
        notes: '订单已确认，准备发货',
      }

      const updatedOrder = { ...mockOrder, status: 'CONFIRMED' as OrderStatus }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(updatedOrder))

      const result = await orderApi.updateOrderStatus(statusForm)

      expect(api.put).toHaveBeenCalledWith(`/orders/${statusForm.id}/status`, {
        status: statusForm.status,
        reason: statusForm.reason,
        notes: statusForm.notes,
      })
      expect(result.data).toEqual(updatedOrder)
    })

    it('应该能够确认订单', async () => {
      const orderId = 1
      const notes = '订单已确认'
      const confirmedOrder = { ...mockOrder, status: 'CONFIRMED' as OrderStatus }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(confirmedOrder))

      const result = await orderApi.confirmOrder(orderId, notes)

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderId}/confirm`, { notes })
      expect(result.data).toEqual(confirmedOrder)
    })

    it('应该能够取消订单', async () => {
      const orderId = 1
      const reason = '客户要求取消'
      const notes = '客户主动取消订单'
      const cancelledOrder = { ...mockOrder, status: 'CANCELLED' as OrderStatus }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(cancelledOrder))

      const result = await orderApi.cancelOrder(orderId, reason, notes)

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderId}/cancel`, { reason, notes })
      expect(result.data).toEqual(cancelledOrder)
    })

    it('应该能够发货订单', async () => {
      const orderId = 1
      const trackingNumber = 'TN123456789'
      const carrier = 'YunExpress'
      const notes = '订单已发货'
      const shippedOrder = {
        ...mockOrder,
        status: 'SHIPPED' as OrderStatus,
        trackingNumber,
        shipDate: '2024-01-02T10:00:00Z',
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(shippedOrder))

      const result = await orderApi.shipOrder(orderId, trackingNumber, carrier, notes)

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderId}/ship`, {
        trackingNumber,
        carrier,
        notes,
      })
      expect(result.data).toEqual(shippedOrder)
    })

    it('应该能够标记订单为已送达', async () => {
      const orderId = 1
      const deliveryDate = '2024-01-05T15:30:00Z'
      const notes = '订单已送达'
      const deliveredOrder = { ...mockOrder, status: 'DELIVERED' as OrderStatus }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(deliveredOrder))

      const result = await orderApi.deliverOrder(orderId, deliveryDate, notes)

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderId}/deliver`, {
        deliveryDate,
        notes,
      })
      expect(result.data).toEqual(deliveredOrder)
    })
  })

  describe('订单搜索和统计API', () => {
    it('应该能够搜索订单', async () => {
      const keyword = '张三'
      const limit = 5
      const searchResults = [mockOrder]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(searchResults))

      const result = await orderApi.searchOrders(keyword, limit)

      expect(api.get).toHaveBeenCalledWith('/orders/search', {
        params: { keyword, limit },
      })
      expect(result.data).toEqual(searchResults)
    })

    it('应该能够获取订单统计信息', async () => {
      const storeId = 1
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const stats: OrderStats = {
        totalOrders: 100,
        pendingOrders: 20,
        confirmedOrders: 30,
        shippedOrders: 25,
        deliveredOrders: 20,
        cancelledOrders: 5,
        todayOrders: 5,
        weekOrders: 25,
        monthOrders: 100,
        totalAmount: 5999.5,
        averageOrderValue: 59.995,
      }

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(stats))

      const result = await orderApi.getOrderStats(storeId, startDate, endDate)

      expect(api.get).toHaveBeenCalledWith('/orders/stats', {
        params: { storeId, startDate, endDate },
      })
      expect(result.data).toEqual(stats)
    })

    it('应该能够获取订单筛选选项', async () => {
      const filterOptions: OrderFilterOptions = {
        stores: [mockStore],
        statuses: [
          { label: '待处理', value: 'PENDING' },
          { label: '已确认', value: 'CONFIRMED' },
          { label: '已发货', value: 'SHIPPED' },
        ],
        dateRanges: [
          { label: '今天', value: 'today' },
          { label: '本周', value: 'week' },
          { label: '本月', value: 'month' },
        ],
      }

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(filterOptions))

      const result = await orderApi.getOrderFilterOptions()

      expect(api.get).toHaveBeenCalledWith('/orders/filter-options')
      expect(result.data).toEqual(filterOptions)
    })
  })

  describe('批量操作API', () => {
    it('应该能够批量操作订单', async () => {
      const operation: BatchOrderOperation = {
        orderIds: [1, 2, 3],
        operation: 'updateStatus',
        status: 'CONFIRMED',
        reason: '批量确认订单',
      }

      const operationResult = { success: 3, failed: 0, errors: [] }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(operationResult))

      const result = await orderApi.batchOperateOrders(operation)

      expect(api.post).toHaveBeenCalledWith('/orders/batch', operation)
      expect(result.data).toEqual(operationResult)
    })

    it('应该能够批量发货订单', async () => {
      const operation: BatchOrderOperation = {
        orderIds: [1, 2, 3],
        operation: 'ship',
        trackingNumber: 'BATCH-TN-001',
        notes: '批量发货',
      }

      const operationResult = { success: 2, failed: 1, errors: [{ orderId: 3, error: '库存不足' }] }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(operationResult))

      const result = await orderApi.batchOperateOrders(operation)

      expect(api.post).toHaveBeenCalledWith('/orders/batch', operation)
      expect(result.data).toEqual(operationResult)
    })

    it('应该能够批量取消订单', async () => {
      const operation: BatchOrderOperation = {
        orderIds: [1, 2, 3],
        operation: 'cancel',
        reason: '系统维护',
        notes: '因系统维护批量取消订单',
      }

      const operationResult = { success: 3, failed: 0, errors: [] }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(operationResult))

      const result = await orderApi.batchOperateOrders(operation)

      expect(api.post).toHaveBeenCalledWith('/orders/batch', operation)
      expect(result.data).toEqual(operationResult)
    })
  })

  describe('导入导出API', () => {
    it('应该能够导出订单数据', async () => {
      const params: OrderExportParams = {
        query: { status: 'CONFIRMED', storeId: 1 },
        format: 'excel',
        fields: ['orderId', 'customerName', 'totalAmount', 'status'],
        includeItems: true,
      }
      const exportResult = {
        downloadUrl: 'https://example.com/export.xlsx',
        fileName: 'orders_export_20240101.xlsx',
      }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(exportResult))

      const result = await orderApi.exportOrders(params)

      expect(api.post).toHaveBeenCalledWith('/orders/export', params)
      expect(result.data).toEqual(exportResult)
    })

    it('应该能够导入订单数据', async () => {
      const file = new File(['test content'], 'orders.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const importResult = {
        success: 15,
        failed: 3,
        errors: [
          { row: 2, field: 'customerEmail', message: '邮箱格式不正确' },
          { row: 5, field: 'totalAmount', message: '金额必须大于0' },
          { row: 8, field: 'storeId', message: '店铺不存在' },
        ],
      }

      vi.mocked(api.upload).mockResolvedValue(mockApiResponse(importResult))

      const result = await orderApi.importOrders(file)

      expect(api.upload).toHaveBeenCalledWith('/orders/import', file)
      expect(result.data).toEqual(importResult)
    })
  })

  describe('订单同步API', () => {
    it('应该能够同步订单数据', async () => {
      const params: OrderSyncParams = {
        storeId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        syncType: 'incremental',
      }

      const syncResult: OrderSyncResult = {
        taskId: 'sync-task-001',
        status: 'RUNNING',
        totalCount: 100,
        successCount: 0,
        failedCount: 0,
        errors: [],
        startTime: '2024-01-01T10:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(syncResult))

      const result = await orderApi.syncOrders(params)

      expect(api.post).toHaveBeenCalledWith('/orders/sync', params)
      expect(result.data).toEqual(syncResult)
    })

    it('应该能够获取订单同步状态', async () => {
      const taskId = 'sync-task-001'
      const syncResult: OrderSyncResult = {
        taskId,
        status: 'COMPLETED',
        totalCount: 100,
        successCount: 95,
        failedCount: 5,
        errors: [
          { platformOrderId: 'WM-001', error: '商品不存在' },
          { platformOrderId: 'WM-002', error: '地址格式错误' },
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:30:00Z',
      }

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(syncResult))

      const result = await orderApi.getSyncStatus(taskId)

      expect(api.get).toHaveBeenCalledWith(`/orders/sync/${taskId}`)
      expect(result.data).toEqual(syncResult)
    })

    it('应该能够获取订单同步历史', async () => {
      const query = { page: 1, size: 10, storeId: 1, status: 'COMPLETED' }
      const syncHistory = [
        {
          taskId: 'sync-task-001',
          status: 'COMPLETED' as const,
          totalCount: 100,
          successCount: 95,
          failedCount: 5,
          errors: [],
          startTime: '2024-01-01T10:00:00Z',
          endTime: '2024-01-01T10:30:00Z',
        },
      ]
      const pageResponse = mockPageResponse(syncHistory, 1)

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(pageResponse))

      const result = await orderApi.getSyncHistory(query)

      expect(api.get).toHaveBeenCalledWith('/orders/sync/history', { params: query })
      expect(result.data).toEqual(pageResponse)
    })

    it('应该能够取消订单同步任务', async () => {
      const taskId = 'sync-task-001'

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await orderApi.cancelSync(taskId)

      expect(api.put).toHaveBeenCalledWith(`/orders/sync/${taskId}/cancel`)
      expect(result.code).toBe(200)
    })

    it('应该能够重试失败的订单同步', async () => {
      const taskId = 'sync-task-001'
      const failedOrderIds = ['WM-001', 'WM-002']
      const retryResult: OrderSyncResult = {
        taskId: 'sync-task-001-retry',
        status: 'RUNNING',
        totalCount: 2,
        successCount: 0,
        failedCount: 0,
        errors: [],
        startTime: '2024-01-01T11:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(retryResult))

      const result = await orderApi.retrySyncFailedOrders(taskId, failedOrderIds)

      expect(api.post).toHaveBeenCalledWith(`/orders/sync/${taskId}/retry`, { failedOrderIds })
      expect(result.data).toEqual(retryResult)
    })
  })

  describe('订单项管理API', () => {
    it('应该能够获取订单项列表', async () => {
      const orderId = 1
      const orderItems = [mockOrderItem]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(orderItems))

      const result = await orderApi.getOrderItems(orderId)

      expect(api.get).toHaveBeenCalledWith(`/orders/${orderId}/items`)
      expect(result.data).toEqual(orderItems)
    })

    it('应该能够添加订单项', async () => {
      const orderId = 1
      const item = {
        sku: 'TEST-SKU-003',
        productTitle: '新增商品',
        quantity: 1,
        unitPrice: 39.99,
        totalPrice: 39.99,
      }
      const newOrderItem = { ...mockOrderItem, id: 2, ...item }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(newOrderItem))

      const result = await orderApi.addOrderItem(orderId, item)

      expect(api.post).toHaveBeenCalledWith(`/orders/${orderId}/items`, item)
      expect(result.data).toEqual(newOrderItem)
    })

    it('应该能够更新订单项', async () => {
      const orderId = 1
      const itemId = 1
      const item = { quantity: 3, totalPrice: 89.97 }
      const updatedOrderItem = { ...mockOrderItem, ...item }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(updatedOrderItem))

      const result = await orderApi.updateOrderItem(orderId, itemId, item)

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderId}/items/${itemId}`, item)
      expect(result.data).toEqual(updatedOrderItem)
    })

    it('应该能够删除订单项', async () => {
      const orderId = 1
      const itemId = 1

      vi.mocked(api.delete).mockResolvedValue(mockApiResponse(undefined))

      const result = await orderApi.deleteOrderItem(orderId, itemId)

      expect(api.delete).toHaveBeenCalledWith(`/orders/${orderId}/items/${itemId}`)
      expect(result.code).toBe(200)
    })
  })

  describe('订单历史和日志API', () => {
    it('应该能够获取订单操作历史', async () => {
      const orderId = 1
      const orderHistory = [
        {
          id: 1,
          orderId: 1,
          action: 'CREATE',
          oldStatus: undefined,
          newStatus: 'PENDING' as OrderStatus,
          reason: '订单创建',
          notes: '系统自动创建订单',
          operatorId: 1,
          operatorName: '系统',
          createdAt: '2024-01-01T10:00:00Z',
        },
        {
          id: 2,
          orderId: 1,
          action: 'STATUS_UPDATE',
          oldStatus: 'PENDING' as OrderStatus,
          newStatus: 'CONFIRMED' as OrderStatus,
          reason: '库存充足',
          notes: '订单已确认',
          operatorId: 2,
          operatorName: '张三',
          createdAt: '2024-01-01T11:00:00Z',
        },
      ]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(orderHistory))

      const result = await orderApi.getOrderHistory(orderId)

      expect(api.get).toHaveBeenCalledWith(`/orders/${orderId}/history`)
      expect(result.data).toEqual(orderHistory)
    })

    it('应该能够添加订单备注', async () => {
      const orderId = 1
      const notes = '客户要求加急处理'

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(undefined))

      const result = await orderApi.addOrderNotes(orderId, notes)

      expect(api.post).toHaveBeenCalledWith(`/orders/${orderId}/notes`, { notes })
      expect(result.code).toBe(200)
    })

    it('应该能够获取订单备注列表', async () => {
      const orderId = 1
      const orderNotes = [
        {
          id: 1,
          orderId: 1,
          notes: '客户要求加急处理',
          operatorId: 2,
          operatorName: '张三',
          createdAt: '2024-01-01T12:00:00Z',
        },
        {
          id: 2,
          orderId: 1,
          notes: '已联系物流公司安排加急',
          operatorId: 3,
          operatorName: '李四',
          createdAt: '2024-01-01T13:00:00Z',
        },
      ]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(orderNotes))

      const result = await orderApi.getOrderNotes(orderId)

      expect(api.get).toHaveBeenCalledWith(`/orders/${orderId}/notes`)
      expect(result.data).toEqual(orderNotes)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      const errorResponse = {
        code: 400,
        message: '订单不存在',
        data: null,
        success: false,
      }

      vi.mocked(api.get).mockRejectedValue(new Error('订单不存在'))

      await expect(orderApi.getOrderById(999)).rejects.toThrow('订单不存在')
    })

    it('应该正确处理网络错误', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('网络连接失败'))

      const orderForm: CreateOrderForm = {
        orderId: 'ORD-2024-003',
        platformOrderId: 'WM-999999999',
        storeId: 1,
        customerName: '测试用户',
        shippingAddress: {
          name: '测试用户',
          country: 'CN',
          state: '测试省',
          city: '测试市',
          address1: '测试地址',
          postalCode: '000000',
        },
        totalAmount: 99.99,
        currency: 'USD',
        status: 'PENDING',
        orderDate: '2024-01-01T10:00:00Z',
        items: [],
      }

      await expect(orderApi.createOrder(orderForm)).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理同步任务错误', async () => {
      const taskId = 'invalid-task-id'

      vi.mocked(api.get).mockRejectedValue(new Error('同步任务不存在'))

      await expect(orderApi.getSyncStatus(taskId)).rejects.toThrow('同步任务不存在')
    })
  })

  describe('参数验证', () => {
    it('搜索订单时应该使用默认limit值', async () => {
      const keyword = '测试订单'
      const searchResults = [mockOrder]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(searchResults))

      await orderApi.searchOrders(keyword)

      expect(api.get).toHaveBeenCalledWith('/orders/search', {
        params: { keyword, limit: 10 },
      })
    })

    it('更新订单时应该正确分离ID和数据', async () => {
      const orderForm: UpdateOrderForm = {
        id: 1,
        status: 'CONFIRMED',
        customerName: '更新后的客户名',
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(mockOrder))

      await orderApi.updateOrder(orderForm)

      expect(api.put).toHaveBeenCalledWith('/orders/1', {
        status: 'CONFIRMED',
        customerName: '更新后的客户名',
      })
    })

    it('更新订单状态时应该正确分离ID和数据', async () => {
      const statusForm: UpdateOrderStatusForm = {
        id: 1,
        status: 'SHIPPED',
        reason: '已发货',
        notes: '物流单号：TN123456789',
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(mockOrder))

      await orderApi.updateOrderStatus(statusForm)

      expect(api.put).toHaveBeenCalledWith('/orders/1/status', {
        status: 'SHIPPED',
        reason: '已发货',
        notes: '物流单号：TN123456789',
      })
    })

    it('获取订单统计时应该正确处理可选参数', async () => {
      const stats: OrderStats = {
        totalOrders: 50,
        pendingOrders: 10,
        confirmedOrders: 15,
        shippedOrders: 12,
        deliveredOrders: 10,
        cancelledOrders: 3,
        todayOrders: 2,
        weekOrders: 12,
        monthOrders: 50,
        totalAmount: 2999.75,
        averageOrderValue: 59.995,
      }

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(stats))

      // 测试无参数调用
      await orderApi.getOrderStats()
      expect(api.get).toHaveBeenCalledWith('/orders/stats', {
        params: { storeId: undefined, startDate: undefined, endDate: undefined },
      })

      // 测试部分参数调用
      await orderApi.getOrderStats(1)
      expect(api.get).toHaveBeenCalledWith('/orders/stats', {
        params: { storeId: 1, startDate: undefined, endDate: undefined },
      })

      // 测试全部参数调用
      await orderApi.getOrderStats(1, '2024-01-01', '2024-01-31')
      expect(api.get).toHaveBeenCalledWith('/orders/stats', {
        params: { storeId: 1, startDate: '2024-01-01', endDate: '2024-01-31' },
      })
    })

    it('重试同步失败订单时应该正确处理可选参数', async () => {
      const taskId = 'sync-task-001'
      const retryResult: OrderSyncResult = {
        taskId: 'sync-task-001-retry',
        status: 'RUNNING',
        totalCount: 5,
        successCount: 0,
        failedCount: 0,
        errors: [],
        startTime: '2024-01-01T11:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(retryResult))

      // 测试无失败订单ID参数
      await orderApi.retrySyncFailedOrders(taskId)
      expect(api.post).toHaveBeenCalledWith(`/orders/sync/${taskId}/retry`, {
        failedOrderIds: undefined,
      })

      // 测试有失败订单ID参数
      const failedOrderIds = ['WM-001', 'WM-002']
      await orderApi.retrySyncFailedOrders(taskId, failedOrderIds)
      expect(api.post).toHaveBeenCalledWith(`/orders/sync/${taskId}/retry`, {
        failedOrderIds,
      })
    })
  })

  describe('边界情况测试', () => {
    it('应该能够处理空的订单列表', async () => {
      const query: OrderQuery = { page: 1, size: 10 }
      const emptyPageResponse = mockPageResponse([], 0)

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(emptyPageResponse))

      const result = await orderApi.getOrders(query)

      expect(result.data.list).toHaveLength(0)
      expect(result.data.total).toBe(0)
    })

    it('应该能够处理大量订单数据', async () => {
      const query: OrderQuery = { page: 1, size: 100 }
      const largeOrderList = Array.from({ length: 100 }, (_, index) => ({
        ...mockOrder,
        id: index + 1,
        orderId: `ORD-2024-${String(index + 1).padStart(3, '0')}`,
      }))
      const largePageResponse = mockPageResponse(largeOrderList, 1000)

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(largePageResponse))

      const result = await orderApi.getOrders(query)

      expect(result.data.list).toHaveLength(100)
      expect(result.data.total).toBe(1000)
    })

    it('应该能够处理同步任务的各种状态', async () => {
      const taskId = 'sync-task-001'
      const statuses: Array<OrderSyncResult['status']> = [
        'PENDING',
        'RUNNING',
        'COMPLETED',
        'FAILED',
      ]

      for (const status of statuses) {
        const syncResult: OrderSyncResult = {
          taskId,
          status,
          totalCount: 100,
          successCount: status === 'COMPLETED' ? 100 : 0,
          failedCount: status === 'FAILED' ? 100 : 0,
          errors: status === 'FAILED' ? [{ platformOrderId: 'WM-001', error: '测试错误' }] : [],
          startTime: '2024-01-01T10:00:00Z',
          endTime:
            status === 'COMPLETED' || status === 'FAILED' ? '2024-01-01T10:30:00Z' : undefined,
        }

        vi.mocked(api.get).mockResolvedValue(mockApiResponse(syncResult))

        const result = await orderApi.getSyncStatus(taskId)
        expect(result.data.status).toBe(status)
      }
    })
  })
})
