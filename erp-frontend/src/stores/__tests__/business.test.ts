/**
 * 业务数据状态管理测试
 * 测试业务数据聚合器的功能，包括数据缓存、更新、同步机制
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { reactive } from 'vue'
import { useBusinessStore } from '../business'
import { useProductStore } from '../product'
import { useOrderStore } from '../order'
import { useInventoryStore } from '../inventory'
import { useNotificationStore } from '../notification'

// Mock 子 stores
vi.mock('../product')
vi.mock('../order')
vi.mock('../inventory')
vi.mock('../notification')

describe('业务数据状态管理 (Business Store)', () => {
  let businessStore: ReturnType<typeof useBusinessStore>
  let mockProductStore: any
  let mockOrderStore: any
  let mockInventoryStore: any
  let mockNotificationStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    // 创建响应式 mock stores
    mockProductStore = reactive({
      isLoading: false,
      hasError: false,
      error: null,
      needsRefresh: false,
      hasSyncTaskRunning: false,
      state: { total: 100, lastFetchTime: Date.now() },
      isCacheValid: true,
      fetchProducts: vi.fn().mockResolvedValue({ list: [], total: 100 }),
      fetchCategories: vi.fn().mockResolvedValue([]),
      refresh: vi.fn().mockResolvedValue(true),
      invalidateCache: vi.fn(),
      reset: vi.fn()
    })

    mockOrderStore = reactive({
      isLoading: false,
      hasError: false,
      error: null,
      needsRefresh: false,
      pendingOrdersCount: 5,
      hasSyncTaskRunning: false,
      state: { total: 50, lastFetchTime: Date.now() },
      isCacheValid: true,
      fetchOrders: vi.fn().mockResolvedValue({ list: [], total: 50 }),
      refresh: vi.fn().mockResolvedValue(true),
      invalidateCache: vi.fn(),
      reset: vi.fn()
    })

    mockInventoryStore = reactive({
      isLoading: false,
      hasError: false,
      error: null,
      needsRefresh: false,
      alertsCount: 3,
      hasSyncTaskRunning: false,
      state: { total: 200, lowStockCount: 10, lastFetchTime: Date.now() },
      isCacheValid: true,
      fetchInventories: vi.fn().mockResolvedValue({ list: [], total: 200 }),
      fetchCurrentAlerts: vi.fn().mockResolvedValue([]),
      refresh: vi.fn().mockResolvedValue(true),
      invalidateCache: vi.fn(),
      reset: vi.fn()
    })

    mockNotificationStore = reactive({
      isLoading: false,
      hasError: false,
      error: null,
      needsRefresh: false,
      state: { unreadCount: 8, lastFetchTime: Date.now() },
      isCacheValid: true,
      fetchNotifications: vi.fn().mockResolvedValue({ list: [], total: 20 }),
      fetchUnreadNotifications: vi.fn().mockResolvedValue([]),
      refresh: vi.fn().mockResolvedValue(true),
      invalidateCache: vi.fn(),
      reset: vi.fn()
    })

    // Mock store 构造函数
    vi.mocked(useProductStore).mockReturnValue(mockProductStore)
    vi.mocked(useOrderStore).mockReturnValue(mockOrderStore)
    vi.mocked(useInventoryStore).mockReturnValue(mockInventoryStore)
    vi.mocked(useNotificationStore).mockReturnValue(mockNotificationStore)

    businessStore = useBusinessStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始同步状态', () => {
      expect(businessStore.syncState.isInitialized).toBe(false)
      expect(businessStore.syncState.lastSyncTime).toBeNull()
      expect(businessStore.syncState.syncInProgress).toBe(false)
      expect(businessStore.syncState.syncErrors).toEqual([])
      expect(businessStore.syncState.autoSyncEnabled).toBe(false)
      expect(businessStore.syncState.syncInterval).toBe(5 * 60 * 1000)
    })

    it('应该正确聚合子 stores 的加载状态', () => {
      expect(businessStore.isLoading).toBe(false)
      
      mockProductStore.isLoading = true
      expect(businessStore.isLoading).toBe(true)
    })

    it('应该正确聚合子 stores 的错误状态', () => {
      expect(businessStore.hasError).toBe(false)
      expect(businessStore.errors).toEqual([])
      
      mockOrderStore.hasError = true
      mockOrderStore.error = '订单加载失败'
      expect(businessStore.hasError).toBe(true)
      expect(businessStore.errors).toContain('订单加载失败')
    })

    it('应该正确计算业务数据统计', () => {
      const stats = businessStore.businessStats
      expect(stats.totalProducts).toBe(100)
      expect(stats.totalOrders).toBe(50)
      expect(stats.totalInventoryItems).toBe(200)
      expect(stats.unreadNotifications).toBe(8)
      expect(stats.pendingOrders).toBe(5)
      expect(stats.lowStockItems).toBe(10)
      expect(stats.alertsCount).toBe(3)
    })
  })

  describe('业务数据初始化', () => {
    it('应该能够初始化所有业务数据', async () => {
      const result = await businessStore.initializeBusinessData()
      
      expect(result).toBe(true)
      expect(mockProductStore.fetchProducts).toHaveBeenCalled()
      expect(mockProductStore.fetchCategories).toHaveBeenCalled()
      expect(mockOrderStore.fetchOrders).toHaveBeenCalled()
      expect(mockInventoryStore.fetchInventories).toHaveBeenCalled()
      expect(mockInventoryStore.fetchCurrentAlerts).toHaveBeenCalled()
      expect(mockNotificationStore.fetchNotifications).toHaveBeenCalled()
      expect(mockNotificationStore.fetchUnreadNotifications).toHaveBeenCalled()
      
      expect(businessStore.syncState.isInitialized).toBe(true)
      expect(businessStore.syncState.lastSyncTime).toBeGreaterThan(0)
    })

    it('应该能够选择性初始化业务数据', async () => {
      await businessStore.initializeBusinessData({
        loadProducts: true,
        loadOrders: false,
        loadInventory: false,
        loadNotifications: false
      })
      
      expect(mockProductStore.fetchProducts).toHaveBeenCalled()
      expect(mockOrderStore.fetchOrders).not.toHaveBeenCalled()
      expect(mockInventoryStore.fetchInventories).not.toHaveBeenCalled()
      expect(mockNotificationStore.fetchNotifications).not.toHaveBeenCalled()
    })

    it('应该处理初始化过程中的错误', async () => {
      mockProductStore.fetchProducts.mockRejectedValue(new Error('商品数据加载失败'))
      
      await businessStore.initializeBusinessData()
      
      expect(businessStore.syncState.syncErrors).toContain('商品数据加载失败: 商品数据加载失败')
      expect(businessStore.syncState.isInitialized).toBe(true) // 即使有错误也应该标记为已初始化
    })

    it('应该能够启用自动同步', async () => {
      await businessStore.initializeBusinessData({ enableAutoSync: true })
      
      expect(businessStore.syncState.autoSyncEnabled).toBe(true)
    })
  })

  describe('数据刷新功能', () => {
    beforeEach(() => {
      // 设置需要刷新的状态
      mockProductStore.needsRefresh = true
      mockOrderStore.needsRefresh = true
    })

    it('应该能够刷新所有需要刷新的数据', async () => {
      const result = await businessStore.refreshAllData()
      
      expect(result).toBe(true)
      expect(mockProductStore.refresh).toHaveBeenCalled()
      expect(mockOrderStore.refresh).toHaveBeenCalled()
      expect(businessStore.syncState.lastSyncTime).toBeGreaterThan(0)
    })

    it('应该能够强制刷新所有数据', async () => {
      mockProductStore.needsRefresh = false
      mockOrderStore.needsRefresh = false
      
      await businessStore.refreshAllData(true)
      
      expect(mockProductStore.refresh).toHaveBeenCalled()
      expect(mockOrderStore.refresh).toHaveBeenCalled()
    })

    it('应该处理刷新过程中的错误', async () => {
      mockProductStore.refresh.mockRejectedValue(new Error('刷新失败'))
      
      await businessStore.refreshAllData()
      
      expect(businessStore.syncState.syncErrors).toContain('商品数据刷新失败: 刷新失败')
    })
  })

  describe('自动同步功能', () => {
    it('应该能够启用自动同步', () => {
      businessStore.enableAutoSync()
      
      expect(businessStore.syncState.autoSyncEnabled).toBe(true)
    })

    it('应该能够禁用自动同步', () => {
      businessStore.enableAutoSync()
      businessStore.disableAutoSync()
      
      expect(businessStore.syncState.autoSyncEnabled).toBe(false)
    })

    it('应该能够设置自动同步间隔', () => {
      const newInterval = 10 * 60 * 1000 // 10分钟
      businessStore.setAutoSyncInterval(newInterval)
      
      expect(businessStore.syncState.syncInterval).toBe(newInterval)
    })

    it('应该在设置新间隔时重启自动同步', () => {
      // 先启用自动同步
      businessStore.enableAutoSync()
      expect(businessStore.syncState.autoSyncEnabled).toBe(true)
      
      const originalInterval = businessStore.syncState.syncInterval
      const newInterval = 10 * 60 * 1000
      
      // 设置新的间隔
      businessStore.setAutoSyncInterval(newInterval)
      
      // 验证间隔已更新
      expect(businessStore.syncState.syncInterval).toBe(newInterval)
      expect(businessStore.syncState.syncInterval).not.toBe(originalInterval)
      
      // 验证自动同步仍然启用
      expect(businessStore.syncState.autoSyncEnabled).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该能够清除同步错误', () => {
      businessStore.syncState.syncErrors = ['错误1', '错误2']
      
      businessStore.clearSyncErrors()
      
      expect(businessStore.syncState.syncErrors).toEqual([])
    })

    it('应该正确聚合所有错误', () => {
      businessStore.syncState.syncErrors = ['同步错误']
      mockProductStore.error = '商品错误'
      mockOrderStore.error = '订单错误'
      
      const allErrors = businessStore.errors
      expect(allErrors).toContain('同步错误')
      expect(allErrors).toContain('商品错误')
      expect(allErrors).toContain('订单错误')
    })
  })

  describe('业务摘要和统计', () => {
    it('应该能够获取业务数据摘要', () => {
      const summary = businessStore.getBusinessSummary()
      
      expect(summary).toHaveProperty('stats')
      expect(summary).toHaveProperty('syncState')
      expect(summary).toHaveProperty('cacheStatus')
      
      expect(summary.cacheStatus).toHaveProperty('product')
      expect(summary.cacheStatus).toHaveProperty('order')
      expect(summary.cacheStatus).toHaveProperty('inventory')
      expect(summary.cacheStatus).toHaveProperty('notification')
    })

    it('应该正确计算待办事项', () => {
      const todos = businessStore.getTodoItems
      
      expect(todos).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'order',
            title: '待处理订单',
            count: 5,
            priority: 'high'
          }),
          expect.objectContaining({
            type: 'inventory',
            title: '库存预警',
            count: 3,
            priority: 'high'
          }),
          expect.objectContaining({
            type: 'inventory',
            title: '低库存商品',
            count: 10,
            priority: 'medium'
          }),
          expect.objectContaining({
            type: 'notification',
            title: '未读通知',
            count: 8,
            priority: 'low'
          })
        ])
      )
    })

    it('应该按优先级排序待办事项', () => {
      const todos = businessStore.getTodoItems
      
      // 检查是否按优先级排序（high > medium > low）
      for (let i = 0; i < todos.length - 1; i++) {
        const currentPriority = todos[i].priority
        const nextPriority = todos[i + 1].priority
        
        if (currentPriority === 'high') {
          expect(['high', 'medium', 'low']).toContain(nextPriority)
        } else if (currentPriority === 'medium') {
          expect(['medium', 'low']).toContain(nextPriority)
        }
      }
    })
  })

  describe('缓存管理', () => {
    it('应该能够失效所有缓存', () => {
      businessStore.invalidateAllCaches()
      
      expect(mockProductStore.invalidateCache).toHaveBeenCalled()
      expect(mockOrderStore.invalidateCache).toHaveBeenCalled()
      expect(mockInventoryStore.invalidateCache).toHaveBeenCalled()
      expect(mockNotificationStore.invalidateCache).toHaveBeenCalled()
    })

    it('应该正确判断是否需要刷新', () => {
      mockProductStore.needsRefresh = true
      expect(businessStore.needsRefresh).toBe(true)
      
      mockProductStore.needsRefresh = false
      mockOrderStore.needsRefresh = false
      mockInventoryStore.needsRefresh = false
      mockNotificationStore.needsRefresh = false
      expect(businessStore.needsRefresh).toBe(false)
    })

    it('应该正确判断是否有同步任务在运行', () => {
      expect(businessStore.hasSyncTaskRunning).toBe(false)
      
      mockOrderStore.hasSyncTaskRunning = true
      expect(businessStore.hasSyncTaskRunning).toBe(true)
    })
  })

  describe('数据重置', () => {
    it('应该能够重置所有业务数据', () => {
      // 先设置一些状态
      businessStore.syncState.isInitialized = true
      businessStore.syncState.lastSyncTime = Date.now()
      businessStore.enableAutoSync()
      
      businessStore.resetAllData()
      
      expect(mockProductStore.reset).toHaveBeenCalled()
      expect(mockOrderStore.reset).toHaveBeenCalled()
      expect(mockInventoryStore.reset).toHaveBeenCalled()
      expect(mockNotificationStore.reset).toHaveBeenCalled()
      
      expect(businessStore.syncState.isInitialized).toBe(false)
      expect(businessStore.syncState.lastSyncTime).toBeNull()
      expect(businessStore.syncState.autoSyncEnabled).toBe(false)
    })
  })

  describe('页面可见性监听', () => {
    let mockAddEventListener: any
    let mockRemoveEventListener: any

    beforeEach(() => {
      mockAddEventListener = vi.spyOn(document, 'addEventListener')
      mockRemoveEventListener = vi.spyOn(document, 'removeEventListener')
    })

    afterEach(() => {
      mockAddEventListener.mockRestore()
      mockRemoveEventListener.mockRestore()
    })

    it('应该能够初始化页面可见性监听', () => {
      businessStore.initVisibilityListener()
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
    })

    it('应该能够清理页面可见性监听', () => {
      businessStore.initVisibilityListener()
      businessStore.cleanupVisibilityListener()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
    })
  })

  describe('边界情况', () => {
    it('应该处理子 store 不存在的情况', () => {
      // 模拟子 store 返回 undefined
      vi.mocked(useProductStore).mockReturnValue(undefined as any)
      
      expect(() => {
        useBusinessStore()
      }).not.toThrow()
    })

    it('应该处理同步过程中的网络错误', async () => {
      mockProductStore.fetchProducts.mockRejectedValue(new Error('Network Error'))
      
      await businessStore.initializeBusinessData()
      
      expect(businessStore.syncState.syncErrors.length).toBeGreaterThan(0)
      expect(businessStore.syncState.syncInProgress).toBe(false)
    })

    it('应该处理并发同步请求', async () => {
      const promise1 = businessStore.initializeBusinessData()
      const promise2 = businessStore.initializeBusinessData()
      
      const [result1, result2] = await Promise.all([promise1, promise2])
      
      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })
  })
})