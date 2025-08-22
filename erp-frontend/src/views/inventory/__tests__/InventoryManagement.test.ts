import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import InventoryManagement from '../InventoryManagement.vue'
import { useInventoryStore } from '@/stores/inventory'

// Mock router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
    push: vi.fn(),
    replace: vi.fn()
  })),
  createWebHistory: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
  useRoute: () => ({
    path: '/inventory',
    name: 'InventoryManagement',
    params: {},
    query: {},
    meta: {}
  })
}))

// Mock stores
vi.mock('@/stores/inventory')
vi.mock('@/stores/user')

// Mock API interceptors
vi.mock('@/api/interceptors', () => ({}))

// Mock router instance
vi.mock('@/router', () => ({
  default: {
    beforeEach: vi.fn(),
    push: vi.fn(),
    replace: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

describe('InventoryManagement 库存管理页面', () => {
  let mockInventoryStore: any

  const mockInventoryList = [
    {
      id: 1,
      sku: 'SKU001',
      productName: 'iPhone 15 Pro Max',
      totalStock: 50,
      availableStock: 45,
      reservedStock: 5,
      alertThreshold: 10,
      status: 'normal',
      lastUpdated: '2024-02-05 14:20:00'
    },
    {
      id: 2,
      sku: 'SKU002',
      productName: 'MacBook Pro 14英寸',
      totalStock: 25,
      availableStock: 20,
      reservedStock: 5,
      alertThreshold: 5,
      status: 'low',
      lastUpdated: '2024-02-05 13:15:00'
    }
  ]

  const commonStubs = {
    'BreadcrumbNav': true,
    'SearchFilter': true,
    'BatchOperations': true,
    'BaseTable': true,
    'StatusBadge': true,
    'InventoryAdjustDialog': true,
    'InventoryHistoryDialog': true,
    'el-button': true,
    'el-pagination': true,
    'el-dialog': true,
    'el-form': true,
    'el-form-item': true,
    'el-input': true,
    'el-input-number': true,
    'el-select': true,
    'el-option': true,
    'el-radio-group': true,
    'el-radio': true,
    'el-table-column': true
  }

  beforeEach(() => {
    mockInventoryStore = {
      inventoryList: mockInventoryList,
      getInventoryList: vi.fn().mockResolvedValue({ total: 2 }),
      adjustInventory: vi.fn().mockResolvedValue({}),
      batchAdjustInventory: vi.fn().mockResolvedValue({}),
      exportInventory: vi.fn().mockResolvedValue({}),
      exportSelectedInventory: vi.fn().mockResolvedValue({})
    }

    vi.mocked(useInventoryStore).mockReturnValue(mockInventoryStore)
  })

  describe('组件基本功能', () => {
    it('应该正确初始化组件', () => {
      const wrapper = mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该在挂载时加载库存数据', () => {
      mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })

      expect(mockInventoryStore.getInventoryList).toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    let wrapper: any

    beforeEach(() => {
      wrapper = mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })
    })

    it('应该正确获取状态类型', () => {
      expect(wrapper.vm.getStatusType('normal')).toBe('success')
      expect(wrapper.vm.getStatusType('low')).toBe('warning')
      expect(wrapper.vm.getStatusType('critical')).toBe('danger')
      expect(wrapper.vm.getStatusType('out_of_stock')).toBe('danger')
    })

    it('应该正确获取状态文本', () => {
      expect(wrapper.vm.getStatusText('normal')).toBe('正常')
      expect(wrapper.vm.getStatusText('low')).toBe('库存不足')
      expect(wrapper.vm.getStatusText('critical')).toBe('严重不足')
      expect(wrapper.vm.getStatusText('out_of_stock')).toBe('缺货')
    })

    it('应该正确格式化日期和时间', () => {
      const dateTime = '2024-02-05 14:20:00'
      expect(wrapper.vm.formatDate(dateTime)).toBe('2024-02-05')
      expect(wrapper.vm.formatTime(dateTime)).toBe('14:20:00')
    })
  })

  describe('搜索和筛选', () => {
    let wrapper: any

    beforeEach(() => {
      wrapper = mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })
    })

    it('应该支持搜索功能', async () => {
      wrapper.vm.searchParams.keyword = 'iPhone'
      await wrapper.vm.handleSearch()
      
      expect(mockInventoryStore.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'iPhone'
        })
      )
    })

    it('应该支持重置功能', async () => {
      wrapper.vm.searchParams.keyword = 'test'
      wrapper.vm.searchParams.status = 'low'
      
      await wrapper.vm.handleReset()
      
      expect(wrapper.vm.searchParams.keyword).toBe('')
      expect(wrapper.vm.searchParams.status).toBe('')
    })
  })

  describe('库存操作', () => {
    let wrapper: any

    beforeEach(() => {
      wrapper = mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })
    })

    it('应该支持调整库存', async () => {
      const inventory = mockInventoryList[0]
      await wrapper.vm.adjustStock(inventory)
      
      expect(wrapper.vm.currentInventory).toEqual(inventory)
      expect(wrapper.vm.showAdjustDialog).toBe(true)
    })

    it('应该支持查看历史', async () => {
      const inventory = mockInventoryList[0]
      await wrapper.vm.viewHistory(inventory)
      
      expect(wrapper.vm.currentInventory).toEqual(inventory)
      expect(wrapper.vm.showHistoryDialog).toBe(true)
    })

    it('应该处理库存调整确认', async () => {
      const adjustmentData = {
        type: 'IN',
        quantity: 50,
        reason: 'PURCHASE',
        note: '采购入库'
      }
      
      wrapper.vm.currentInventory = mockInventoryList[0]
      await wrapper.vm.handleAdjustConfirm(adjustmentData)
      
      expect(mockInventoryStore.adjustInventory).toHaveBeenCalledWith(
        mockInventoryList[0].id,
        adjustmentData
      )
      expect(ElMessage.success).toHaveBeenCalledWith('库存调整成功')
    })

    it('应该处理批量调整确认', async () => {
      const batchData = {
        items: [
          { id: '1', adjustment: { type: 'IN', quantity: 10, reason: 'PURCHASE', note: '批量入库' } },
          { id: '2', adjustment: { type: 'IN', quantity: 10, reason: 'PURCHASE', note: '批量入库' } }
        ]
      }
      
      await wrapper.vm.handleBatchAdjustConfirm(batchData)
      
      expect(mockInventoryStore.batchAdjustInventory).toHaveBeenCalledWith(batchData.items)
      expect(ElMessage.success).toHaveBeenCalledWith('批量调整成功')
    })

    it('应该处理调整失败', async () => {
      mockInventoryStore.adjustInventory.mockRejectedValue(new Error('调整失败'))
      
      wrapper.vm.currentInventory = mockInventoryList[0]
      await wrapper.vm.handleAdjustConfirm({
        type: 'IN',
        quantity: 50,
        reason: 'PURCHASE',
        note: '采购入库'
      })
      
      expect(ElMessage.error).toHaveBeenCalledWith('库存调整失败')
    })
  })

  describe('批量操作', () => {
    let wrapper: any

    beforeEach(() => {
      wrapper = mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })
    })

    it('应该支持批量调整', async () => {
      wrapper.vm.selectedInventory = [mockInventoryList[0], mockInventoryList[1]]
      await wrapper.vm.handleBatchAction('adjust')
      
      expect(wrapper.vm.showBatchAdjustDialog).toBe(true)
    })

    it('应该支持清除选择', async () => {
      wrapper.vm.selectedInventory = [mockInventoryList[0]]
      await wrapper.vm.clearSelection()
      
      expect(wrapper.vm.selectedInventory).toEqual([])
    })
  })

  describe('分页功能', () => {
    let wrapper: unknown

    beforeEach(() => {
      wrapper = mount(InventoryManagement, {
        global: {
          stubs: commonStubs
        }
      })
    })

    it('应该支持页码变化', async () => {
      await wrapper.vm.handlePageChange(2)
      
      expect(wrapper.vm.pagination.page).toBe(2)
      expect(mockInventoryStore.getInventoryList).toHaveBeenCalled()
    })

    it('应该支持页面大小变化', async () => {
      await wrapper.vm.handleSizeChange(20)
      
      expect(wrapper.vm.pagination.size).toBe(20)
      expect(wrapper.vm.pagination.page).toBe(1)
    })
  })
})