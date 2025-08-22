/**
 * 订单数据状态管理测试
 * 测试订单数据的缓存、更新、同步机制和业务逻辑
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '../order'
import { orderApi } from '@/api/modules/order'
import type { Order, OrderStats, OrderSyncResult } from '@/types'

// Mock API 模块
vi.mock('@/api/modules/order')

describe('订单数据状态管理 (Order Store)', () => {
  let orderStore: ReturnType<typeof useOrderStore>
  
  // Mock 数据
  const mockOrders: Order[] = [
    {
      id: 1,
      orderId: 'ORD-001',
      platformOrderId: 'PLAT-001',
      storeId: 1,
      customerName: '张三',
      customerEmail: 'zhangsan@example.com',
      shippingAddress: {
        name: '张三',
        phone: '13800138000',
        country: '中国',
        state: '北京市',
        city: '北京市',
        address1: '朝阳区某某街道123号',
        postalCode: '100000'
      },
      totalAmount: 299.99,
      currency: 'CNY',
      status: 'PENDING',
      orderDate: '2024-01-01T10:00:00Z',
      items: [
        {
          id: 1,
          orderId: 1,
          sku: 'TEST-001',
          productTitle: '测试商品1',
          quantity: 2,
          unitPrice: 149.99,
          totalPrice: 299.98
        }
      ],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ]

  const mockStats: OrderStats = {
    totalOrders: 1000,
    pendingOrders: 50,
    confirmedOrders: 300,
    shippedOrders: 500,
    deliveredOrders: 140,
    cancelledOrders: 10,
    todayOrders: 25,
    weekOrders: 150,
    monthOrders: 600,
    totalAmount: 150000,
    averageOrderValue: 150
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    orderStore = useOrderStore()
    
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 创建新的 mock 数据副本以避免测试间的数据污染
    const freshMockOrders = mockOrders.map(order => ({ ...order }))
    
    // 设置默认的 API mock 返回值
    vi.mocked(orderApi.getOrders).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: {
        list: freshMockOrders,
        total: freshMockOrders.length,
        page: 1,
        size: 20,
        pages: 1
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(orderStore.state.orders).toEqual([])
      expect(orderStore.state.total).toBe(0)
      expect(orderStore.state.currentPage).toBe(1)
      expect(orderStore.state.pageSize).toBe(20)
      expect(orderStore.state.statusCounts).toEqual({
        PENDING: 0,
        CONFIRMED: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0
      })
      expect(orderStore.state.searchKeyword).toBe('')
      expect(orderStore.state.filters).toEqual({})
      expect(orderStore.state.selectedOrderIds).toEqual([])
      expect(orderStore.state.stats).toBeNull()
      expect(orderStore.state.syncTasks).toEqual([])
      expect(orderStore.state.activeSyncTask).toBeNull()
      expect(orderStore.state.lastFetchTime).toBeNull()
      expect(orderStore.state.cacheExpiry).toBe(3 * 60 * 1000)
    })
  })

  describe('订单数据获取', () => {
    it('应该能够获取订单列表', async () => {
      const result = await orderStore.fetchOrders()
      
      expect(orderApi.getOrders).toHaveBeenCalledWith({
        page: 1,
        size: 20
      })
      expect(result.list).toEqual(mockOrders)
      expect(orderStore.state.orders).toEqual(mockOrders)
      expect(orderStore.state.total).toBe(mockOrders.length)
      expect(orderStore.state.lastFetchTime).toBeGreaterThan(0)
    })

    it('应该能够根据ID获取订单详情', async () => {
      const mockOrder = mockOrders[0]
      vi.mocked(orderApi.getOrderById).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockOrder
      })
      
      await orderStore.fetchOrders()
      const result = await orderStore.fetchOrderById(1)
      
      expect(orderApi.getOrderById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockOrder)
      expect(orderStore.state.orders[0]).toEqual(mockOrder)
    })

    it('应该能够搜索订单', async () => {
      const searchResults = [mockOrders[0]]
      vi.mocked(orderApi.searchOrders).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: searchResults
      })
      
      const result = await orderStore.searchOrders('ORD-001')
      
      expect(orderApi.searchOrders).toHaveBeenCalledWith('ORD-001')
      expect(result).toEqual(searchResults)
      expect(orderStore.state.searchKeyword).toBe('ORD-001')
    })
  })

  describe('订单状态管理', () => {
    beforeEach(async () => {
      await orderStore.fetchOrders()
    })

    it('应该能够确认订单', async () => {
      const confirmedOrder = { ...mockOrders[0], status: 'CONFIRMED' as const }
      vi.mocked(orderApi.confirmOrder).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: confirmedOrder
      })
      
      const result = await orderStore.confirmOrder(1, '订单确认')
      
      expect(orderApi.confirmOrder).toHaveBeenCalledWith(1, '订单确认')
      expect(result).toEqual(confirmedOrder)
      expect(orderStore.state.orders[0].status).toBe('CONFIRMED')
    })

    it('应该能够取消订单', async () => {
      const cancelledOrder = { ...mockOrders[0], status: 'CANCELLED' as const }
      vi.mocked(orderApi.cancelOrder).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: cancelledOrder
      })
      
      const result = await orderStore.cancelOrder(1, '客户要求取消', '取消备注')
      
      expect(orderApi.cancelOrder).toHaveBeenCalledWith(1, '客户要求取消', '取消备注')
      expect(result).toEqual(cancelledOrder)
      expect(orderStore.state.orders[0].status).toBe('CANCELLED')
    })

    it('应该能够发货订单', async () => {
      const shippedOrder = { ...mockOrders[0], status: 'SHIPPED' as const, trackingNumber: 'TRK123' }
      vi.mocked(orderApi.shipOrder).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: shippedOrder
      })
      
      const result = await orderStore.shipOrder(1, 'TRK123', '顺丰', '发货备注')
      
      expect(orderApi.shipOrder).toHaveBeenCalledWith(1, 'TRK123', '顺丰', '发货备注')
      expect(result).toEqual(shippedOrder)
      expect(orderStore.state.orders[0].status).toBe('SHIPPED')
      expect(orderStore.state.orders[0].trackingNumber).toBe('TRK123')
    })
  })

  describe('订单同步功能', () => {
    it('应该能够同步订单', async () => {
      const syncResult: OrderSyncResult = {
        taskId: 'sync-123',
        status: 'RUNNING',
        totalCount: 100,
        successCount: 0,
        failedCount: 0,
        errors: [],
        startTime: '2024-01-01T10:00:00Z'
      }
      
      vi.mocked(orderApi.syncOrders).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: syncResult
      })
      
      const result = await orderStore.syncOrders({
        storeId: 1,
        syncType: 'incremental'
      })
      
      expect(orderApi.syncOrders).toHaveBeenCalledWith({
        storeId: 1,
        syncType: 'incremental'
      })
      expect(result).toEqual(syncResult)
      expect(orderStore.state.syncTasks[0]).toEqual(syncResult)
      expect(orderStore.state.activeSyncTask).toEqual(syncResult)
    })

    it('应该能够获取同步状态', async () => {
      const syncResult: OrderSyncResult = {
        taskId: 'sync-123',
        status: 'COMPLETED',
        totalCount: 100,
        successCount: 95,
        failedCount: 5,
        errors: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:05:00Z'
      }
      
      // 先添加一个同步任务
      orderStore.state.syncTasks = [{ ...syncResult, status: 'RUNNING' }]
      orderStore.state.activeSyncTask = { ...syncResult, status: 'RUNNING' }
      
      vi.mocked(orderApi.getSyncStatus).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: syncResult
      })
      
      const result = await orderStore.getSyncStatus('sync-123')
      
      expect(orderApi.getSyncStatus).toHaveBeenCalledWith('sync-123')
      expect(result).toEqual(syncResult)
      expect(orderStore.state.syncTasks[0]).toEqual(syncResult)
      expect(orderStore.state.activeSyncTask).toEqual(syncResult)
    })
  })

  describe('计算属性', () => {
    beforeEach(async () => {
      await orderStore.fetchOrders()
    })

    it('应该正确计算待处理订单数量', async () => {
      // 先获取订单数据以更新状态统计
      await orderStore.fetchOrders()
      expect(orderStore.pendingOrdersCount).toBe(1) // mockOrders[0] 的状态是 PENDING
    })

    it('应该正确判断是否有同步任务在运行', () => {
      expect(orderStore.hasSyncTaskRunning).toBe(false)
      
      orderStore.state.activeSyncTask = {
        taskId: 'sync-123',
        status: 'RUNNING',
        totalCount: 100,
        successCount: 0,
        failedCount: 0,
        errors: [],
        startTime: '2024-01-01T10:00:00Z'
      }
      
      expect(orderStore.hasSyncTaskRunning).toBe(true)
    })

    it('应该正确更新状态统计', async () => {
      // 先获取订单数据以更新状态统计
      await orderStore.fetchOrders()
      // 初始状态应该有1个PENDING订单
      expect(orderStore.state.statusCounts.PENDING).toBe(1)
      expect(orderStore.state.statusCounts.CONFIRMED).toBe(0)
    })
  })
})