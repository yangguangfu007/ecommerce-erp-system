/**
 * 库存数据状态管理测试
 * 测试库存数据的缓存、更新、同步机制和业务逻辑
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInventoryStore } from '../inventory'
import type { Inventory, InventoryStats, InventoryAlertConfig } from '@/types'

// Mock inventory API
vi.mock('@/api/modules/inventory', () => ({
  inventoryApi: {
    getInventories: vi.fn(),
    getInventoryById: vi.fn(),
    getInventoryBySku: vi.fn(),
    getInventoriesBySkus: vi.fn(),
    adjustInventory: vi.fn(),
    batchAdjustInventory: vi.fn(),
    updateInventory: vi.fn(),
    setSafetyStock: vi.fn(),
    searchInventories: vi.fn(),
    getCurrentAlerts: vi.fn(),
    getInventoryAlerts: vi.fn(),
    createInventoryAlert: vi.fn(),
    updateInventoryAlert: vi.fn(),
    deleteInventoryAlert: vi.fn(),
    getInventoryHistory: vi.fn(),
    getInventoryStats: vi.fn(),
    syncInventory: vi.fn(),
    getSyncStatus: vi.fn()
  }
}))

import { inventoryApi } from '@/api/modules/inventory'

describe('库存数据状态管理 (Inventory Store)', () => {
  let inventoryStore: ReturnType<typeof useInventoryStore>
  
  // Mock 数据
  const mockInventories: Inventory[] = [
    {
      id: 1,
      sku: 'TEST-001',
      storeId: 1,
      availableQuantity: 100,
      reservedQuantity: 10,
      totalQuantity: 110,
      safetyStock: 20,
      warehouseLocation: 'A-01-01',
      lastUpdated: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      sku: 'TEST-002',
      storeId: 1,
      availableQuantity: 5,
      reservedQuantity: 2,
      totalQuantity: 7,
      safetyStock: 10,
      warehouseLocation: 'A-01-02',
      lastUpdated: '2024-01-01T10:00:00Z'
    }
  ]

  const mockStats: InventoryStats = {
    totalItems: 1000,
    totalValue: 2500000,
    lowStockItems: 25,
    outOfStockItems: 5,
    alertsCount: 30,
    averageValue: 2500,
    lastUpdated: '2024-01-01T10:00:00Z'
  }

  const mockAlerts = [
    {
      ...mockInventories[1],
      alertType: 'LOW_STOCK',
      alertMessage: '库存不足，当前库存: 5，安全库存: 10'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    inventoryStore = useInventoryStore()
    
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置默认的 API mock 返回值
    vi.mocked(inventoryApi.getInventories).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: {
        list: mockInventories,
        total: mockInventories.length,
        page: 1,
        size: 20
      }
    })

    vi.mocked(inventoryApi.getCurrentAlerts).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockAlerts
    })

    vi.mocked(inventoryApi.getInventoryStats).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockStats
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(inventoryStore.state.inventories).toEqual([])
      expect(inventoryStore.state.total).toBe(0)
      expect(inventoryStore.state.currentPage).toBe(1)
      expect(inventoryStore.state.pageSize).toBe(20)
      expect(inventoryStore.state.alerts).toEqual([])
      expect(inventoryStore.state.selectedInventoryIds).toEqual([])
      expect(inventoryStore.isLoading).toBe(false)
      expect(inventoryStore.hasError).toBe(false)
    })

    it('应该有正确的计算属性', () => {
      expect(inventoryStore.hasInventories).toBe(false)
      expect(inventoryStore.selectedCount).toBe(0)
      expect(inventoryStore.needsRefresh).toBe(true)
      expect(inventoryStore.alertsCount).toBe(0)
    })
  })

  describe('库存数据获取', () => {
    it('应该能够获取库存列表', async () => {
      const result = await inventoryStore.fetchInventories()
      
      expect(inventoryApi.getInventories).toHaveBeenCalledWith({
        page: 1,
        size: 20
      })
      expect(result.list).toEqual(mockInventories)
      expect(inventoryStore.state.inventories).toEqual(mockInventories)
      expect(inventoryStore.state.total).toBe(mockInventories.length)
    })

    it('应该能够根据ID获取库存详情', async () => {
      const mockInventory = mockInventories[0]
      vi.mocked(inventoryApi.getInventoryById).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockInventory
      })
      
      const result = await inventoryStore.fetchInventoryById(1)
      
      expect(inventoryApi.getInventoryById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockInventory)
    })

    it('应该能够根据SKU获取库存', async () => {
      const mockInventory = mockInventories[0]
      vi.mocked(inventoryApi.getInventoryBySku).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockInventory
      })
      
      const result = await inventoryStore.fetchInventoryBySku('TEST-001', 1)
      
      expect(inventoryApi.getInventoryBySku).toHaveBeenCalledWith('TEST-001', 1)
      expect(result).toEqual(mockInventory)
    })

    it('应该能够批量获取库存', async () => {
      vi.mocked(inventoryApi.getInventoriesBySkus).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockInventories
      })
      
      const result = await inventoryStore.fetchInventoriesBySkus(['TEST-001', 'TEST-002'], 1)
      
      expect(inventoryApi.getInventoriesBySkus).toHaveBeenCalledWith(['TEST-001', 'TEST-002'], 1)
      expect(result).toEqual(mockInventories)
    })
  })

  describe('库存调整功能', () => {
    beforeEach(async () => {
      // 先加载一些库存数据
      await inventoryStore.fetchInventories()
    })

    it('应该能够调整库存', async () => {
      const adjustmentForm = {
        sku: 'TEST-001',
        storeId: 1,
        operation: 'ADD' as const,
        quantity: 20,
        reason: '采购入库',
        notes: '新到货物'
      }

      const adjustedInventory = {
        ...mockInventories[0],
        availableQuantity: 120,
        totalQuantity: 130
      }

      vi.mocked(inventoryApi.adjustInventory).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: adjustedInventory
      })

      const result = await inventoryStore.adjustInventory(adjustmentForm)
      
      expect(inventoryApi.adjustInventory).toHaveBeenCalledWith(adjustmentForm)
      expect(result).toEqual(adjustedInventory)
      expect(inventoryStore.state.inventories[0]).toEqual(adjustedInventory)
    })

    it('应该能够批量调整库存', async () => {
      const batchOperation = {
        items: [
          {
            sku: 'TEST-001',
            storeId: 1,
            operation: 'ADD' as const,
            quantity: 10,
            reason: '采购入库'
          }
        ]
      }

      vi.mocked(inventoryApi.batchAdjustInventory).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: { success: 1, failed: 0 }
      })

      const result = await inventoryStore.batchAdjustInventory(batchOperation)
      
      expect(inventoryApi.batchAdjustInventory).toHaveBeenCalledWith(batchOperation)
      expect(result).toBe(true)
      expect(inventoryApi.getInventories).toHaveBeenCalled() // 应该刷新数据
    })

    it('应该能够设置安全库存', async () => {
      const updatedInventory = { ...mockInventories[0], safetyStock: 30 }
      vi.mocked(inventoryApi.setSafetyStock).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: updatedInventory
      })

      const result = await inventoryStore.setSafetyStock('TEST-001', 30, 1)
      
      expect(inventoryApi.setSafetyStock).toHaveBeenCalledWith('TEST-001', 30, 1)
      expect(result).toEqual(updatedInventory)
    })
  })

  describe('库存预警功能', () => {
    it('应该能够获取当前预警', async () => {
      const result = await inventoryStore.fetchCurrentAlerts()
      
      expect(inventoryApi.getCurrentAlerts).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockAlerts)
      expect(inventoryStore.state.alerts).toEqual(mockAlerts)
    })

    it('应该能够创建预警配置', async () => {
      const alertConfig = {
        sku: 'TEST-001',
        storeId: 1,
        alertType: 'LOW_STOCK' as const,
        threshold: 10,
        enabled: true
      }
      
      vi.mocked(inventoryApi.createInventoryAlert).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: { ...alertConfig, id: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' }
      })

      const result = await inventoryStore.createAlertConfig(alertConfig)
      
      expect(inventoryApi.createInventoryAlert).toHaveBeenCalledWith(alertConfig)
      expect(result).toBeDefined()
      expect(inventoryStore.state.alertConfigs).toContainEqual(result)
    })
  })

  describe('库存统计功能', () => {
    it('应该能够获取库存统计', async () => {
      const result = await inventoryStore.fetchInventoryStats()
      
      expect(inventoryApi.getInventoryStats).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockStats)
      expect(inventoryStore.state.stats).toEqual(mockStats)
    })

    it('应该正确识别缺货商品', async () => {
      const outOfStockInventories = [
        {
          ...mockInventories[0],
          availableQuantity: 0,
          totalQuantity: 0
        }
      ]
      
      vi.mocked(inventoryApi.getInventories).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: {
          list: outOfStockInventories,
          total: 1,
          page: 1,
          size: 20
        }
      })

      await inventoryStore.fetchInventories()
      
      expect(inventoryStore.state.outOfStockCount).toBe(1)
    })
  })

  describe('库存选择功能', () => {
    beforeEach(async () => {
      await inventoryStore.fetchInventories()
    })

    it('应该能够选择库存', () => {
      inventoryStore.selectInventory(1)
      
      expect(inventoryStore.state.selectedInventoryIds).toContain(1)
      expect(inventoryStore.selectedCount).toBe(1)
    })

    it('应该能够切换选择状态', () => {
      inventoryStore.toggleInventorySelection(1)
      expect(inventoryStore.state.selectedInventoryIds).toContain(1)
      
      inventoryStore.toggleInventorySelection(1)
      expect(inventoryStore.state.selectedInventoryIds).not.toContain(1)
    })

    it('应该能够全选/取消全选', () => {
      inventoryStore.toggleSelectAll()
      expect(inventoryStore.state.selectedInventoryIds).toHaveLength(mockInventories.length)
      
      inventoryStore.toggleSelectAll()
      expect(inventoryStore.state.selectedInventoryIds).toHaveLength(0)
    })

    it('应该能够获取选中的库存', () => {
      inventoryStore.selectInventory(1)
      
      const selectedInventories = inventoryStore.getSelectedInventories
      expect(selectedInventories).toHaveLength(1)
      expect(selectedInventories[0]).toEqual(mockInventories[0])
    })

    it('应该能够清空选择', () => {
      inventoryStore.selectInventory(1)
      inventoryStore.selectInventory(2)
      expect(inventoryStore.selectedCount).toBe(2)
      
      inventoryStore.clearSelection()
      expect(inventoryStore.selectedCount).toBe(0)
    })
  })

  describe('数据刷新和重置', () => {
    it('应该能够刷新数据', async () => {
      await inventoryStore.refresh()
      
      expect(inventoryApi.getInventories).toHaveBeenCalled()
      expect(inventoryApi.getCurrentAlerts).toHaveBeenCalled()
    })

    it('应该能够重置状态', () => {
      // 设置一些状态
      inventoryStore.state.inventories = mockInventories
      inventoryStore.state.selectedInventoryIds = [1, 2]
      
      inventoryStore.reset()
      
      expect(inventoryStore.state.inventories).toEqual([])
      expect(inventoryStore.state.selectedInventoryIds).toEqual([])
      expect(inventoryStore.state.total).toBe(0)
    })
  })

  describe('缓存管理', () => {
    it('应该正确判断缓存是否需要刷新', () => {
      expect(inventoryStore.needsRefresh).toBe(true)
      
      // 模拟获取数据后
      inventoryStore.state.lastFetchTime = Date.now()
      expect(inventoryStore.needsRefresh).toBe(false)
      
      // 模拟缓存过期
      inventoryStore.state.lastFetchTime = Date.now() - 3 * 60 * 1000 // 3分钟前
      expect(inventoryStore.needsRefresh).toBe(true)
    })

    it('应该能够使缓存失效', () => {
      inventoryStore.state.lastFetchTime = Date.now()
      expect(inventoryStore.needsRefresh).toBe(false)
      
      inventoryStore.invalidateCache()
      expect(inventoryStore.needsRefresh).toBe(true)
    })
  })

  describe('筛选和搜索', () => {
    it('应该能够设置筛选条件', () => {
      const filters = { storeId: 1, lowStock: true }
      inventoryStore.setFilters(filters)
      
      expect(inventoryStore.state.filters).toEqual(filters)
    })

    it('应该能够清除筛选条件', () => {
      inventoryStore.setFilters({ storeId: 1 })
      inventoryStore.state.searchKeyword = 'test'
      
      inventoryStore.clearFilters()
      
      expect(inventoryStore.state.filters).toEqual({})
      expect(inventoryStore.state.searchKeyword).toBe('')
    })

    it('应该能够搜索库存', async () => {
      vi.mocked(inventoryApi.searchInventories).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: [mockInventories[0]]
      })

      const result = await inventoryStore.searchInventories('TEST-001')
      
      expect(inventoryApi.searchInventories).toHaveBeenCalledWith('TEST-001', {})
      expect(result).toEqual([mockInventories[0]])
      expect(inventoryStore.state.searchKeyword).toBe('TEST-001')
    })
  })

  describe('分页功能', () => {
    it('应该能够设置分页参数', () => {
      inventoryStore.setPagination(2, 50)
      
      expect(inventoryStore.state.currentPage).toBe(2)
      expect(inventoryStore.state.pageSize).toBe(50)
    })
  })
})