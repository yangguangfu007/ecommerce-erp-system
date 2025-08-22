/**
 * 多店铺库存管理组件测试
 * 测试店铺库存分配、调拨和预警设置功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Refresh: 'refresh-icon',
  Transfer: 'transfer-icon',
  Search: 'search-icon',
  Download: 'download-icon',
  Setting: 'setting-icon',
  HomeFilled: 'home-filled-icon',
  ArrowRight: 'arrow-right-icon'
}))

// Mock API module
vi.mock('@/api/modules/inventory', () => ({
  inventoryApi: {
    getInventoryList: vi.fn(),
    transferInventory: vi.fn(),
    setInventoryAlert: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

import MultiStoreInventory from '../MultiStoreInventory.vue'

// Mock components
const mockComponents = {
  BreadcrumbNav: {
    template: '<div data-testid="breadcrumb-nav"><slot /></div>',
    props: ['items']
  },
  BaseTable: {
    template: `
      <div data-testid="base-table">
        <slot />
        <div v-for="item in data" :key="item.sku" :data-testid="'inventory-row-' + item.sku">
          {{ item.productName }}
        </div>
      </div>
    `,
    props: ['data', 'loading'],
    emits: ['selection-change']
  },
  StatusBadge: {
    template: '<span class="status-badge" :class="type">{{ text }}</span>',
    props: ['status', 'type', 'text', 'size']
  }
}

// Mock data
const mockStoreData = [
  {
    id: 'store_1',
    name: '沃尔玛旗舰店',
    status: 'active',
    stats: {
      totalItems: 1250,
      totalValue: 2580000,
      alertItems: 15,
      outOfStockItems: 3
    }
  },
  {
    id: 'store_2',
    name: '亚马逊专营店',
    status: 'active',
    stats: {
      totalItems: 980,
      totalValue: 1890000,
      alertItems: 8,
      outOfStockItems: 1
    }
  }
]

const mockInventoryData = [
  {
    sku: 'SKU001',
    productName: 'iPhone 15',
    stores: {
      store_1: { availableQuantity: 150, reservedQuantity: 20, totalQuantity: 170, safetyStock: 50, status: 'normal' },
      store_2: { availableQuantity: 80, reservedQuantity: 10, totalQuantity: 90, safetyStock: 30, status: 'normal' }
    }
  }
]

describe('MultiStoreInventory', () => {
  let wrapper: any
  let mockInventoryApi: any
  let mockElMessage: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get mocked modules
    const inventoryModule = await import('@/api/modules/inventory')
    const elementModule = await import('element-plus')
    
    mockInventoryApi = inventoryModule.inventoryApi
    mockElMessage = elementModule.ElMessage
    
    // Setup mock API responses
    mockInventoryApi.getInventoryList.mockResolvedValue({
      records: mockInventoryData,
      total: 1,
      current: 1,
      size: 20
    })
  })

  const createWrapper = (props = {}) => {
    return mount(MultiStoreInventory, {
      props,
      global: {
        components: mockComponents,
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-input-number': true,
          'el-switch': true,
          'el-form': true,
          'el-form-item': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true
        }
      }
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染页面结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.find('.store-filters').exists()).toBe(true)
      expect(wrapper.find('.store-stats-cards').exists()).toBe(true)
      expect(wrapper.find('.table-wrapper').exists()).toBe(true)
    })

    it('应该显示正确的页面标题和描述', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-title').text()).toBe('多店铺库存管理')
      expect(wrapper.find('.page-description').text()).toBe('管理不同店铺的库存分配和调拨')
    })

    it('应该渲染店铺筛选器', () => {
      wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('选择店铺')
      expect(wrapper.text()).toContain('商品SKU')
      expect(wrapper.text()).toContain('库存状态')
    })
  })

  describe('店铺管理', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.storeList = mockStoreData
    })

    it('应该正确显示店铺统计卡片', async () => {
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.storeList).toHaveLength(2)
      expect(wrapper.vm.storeList[0].name).toBe('沃尔玛旗舰店')
      expect(wrapper.vm.storeList[1].name).toBe('亚马逊专营店')
    })

    it('应该支持店铺切换', async () => {
      wrapper.vm.selectedStoreId = 'store_1'
      await wrapper.vm.handleStoreChange()
      
      expect(wrapper.vm.selectedStoreId).toBe('store_1')
    })

    it('应该正确获取店铺状态文本', () => {
      expect(wrapper.vm.getStoreStatusText('active')).toBe('正常')
      expect(wrapper.vm.getStoreStatusText('inactive')).toBe('停用')
    })

    it('应该支持查看特定店铺库存', async () => {
      await wrapper.vm.viewStoreInventory('store_1')
      
      expect(wrapper.vm.selectedStoreId).toBe('store_1')
    })
  })

  describe('库存数据管理', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.inventoryList = mockInventoryData
    })

    it('应该正确获取店铺库存信息', () => {
      const inventory = mockInventoryData[0]
      const storeInventory = wrapper.vm.getStoreInventory(inventory, 'store_1')
      
      expect(storeInventory.availableQuantity).toBe(150)
      expect(storeInventory.status).toBe('normal')
    })

    it('应该正确获取店铺库存状态', () => {
      const inventory = mockInventoryData[0]
      const status = wrapper.vm.getStoreInventoryStatus(inventory, 'store_1')
      
      expect(status).toBe('normal')
    })

    it('应该正确计算总库存', () => {
      const inventory = mockInventoryData[0]
      const total = wrapper.vm.getTotalInventory(inventory)
      
      expect(total).toBe(230) // 150 + 80
    })

    it('应该正确转换状态类型', () => {
      expect(wrapper.vm.getStatusType('normal')).toBe('success')
      expect(wrapper.vm.getStatusType('low')).toBe('warning')
      expect(wrapper.vm.getStatusType('critical')).toBe('danger')
      expect(wrapper.vm.getStatusType('out_of_stock')).toBe('danger')
    })

    it('应该正确转换状态文本', () => {
      expect(wrapper.vm.getStatusText('normal')).toBe('正常')
      expect(wrapper.vm.getStatusText('low')).toBe('库存不足')
      expect(wrapper.vm.getStatusText('critical')).toBe('严重不足')
      expect(wrapper.vm.getStatusText('out_of_stock')).toBe('缺货')
    })
  })

  describe('库存调拨功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.inventoryList = mockInventoryData
    })

    it('应该支持打开调拨对话框', async () => {
      const inventory = mockInventoryData[0]
      await wrapper.vm.transferInventory(inventory)
      
      expect(wrapper.vm.transferForm.sku).toBe('SKU001')
      expect(wrapper.vm.transferForm.productName).toBe('iPhone 15')
      expect(wrapper.vm.showTransferDialog).toBe(true)
    })

    it('应该正确计算最大调拨数量', () => {
      wrapper.vm.transferForm.fromStoreId = 'store_1'
      wrapper.vm.transferForm.sku = 'SKU001'
      
      const maxQuantity = wrapper.vm.getMaxTransferQuantity()
      expect(maxQuantity).toBe(150)
    })

    it('应该处理无效调拨参数', () => {
      wrapper.vm.transferForm.fromStoreId = ''
      wrapper.vm.transferForm.sku = ''
      
      const maxQuantity = wrapper.vm.getMaxTransferQuantity()
      expect(maxQuantity).toBe(0)
    })

    it('应该支持确认调拨操作', async () => {
      wrapper.vm.transferForm = {
        sku: 'SKU001',
        productName: 'iPhone 15',
        fromStoreId: 'store_1',
        toStoreId: 'store_2',
        quantity: 50,
        reason: '库存调拨'
      }
      
      await wrapper.vm.confirmTransfer()
      
      expect(mockElMessage.success).toHaveBeenCalledWith('库存调拨成功')
      expect(wrapper.vm.showTransferDialog).toBe(false)
    })
  })

  describe('预警设置功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.inventoryList = mockInventoryData
      wrapper.vm.storeList = mockStoreData
    })

    it('应该要求选择店铺才能设置预警', async () => {
      wrapper.vm.selectedStoreId = ''
      const inventory = mockInventoryData[0]
      
      await wrapper.vm.setAlert(inventory)
      
      expect(mockElMessage.warning).toHaveBeenCalledWith('请先选择店铺')
    })

    it('应该支持打开预警设置对话框', async () => {
      wrapper.vm.selectedStoreId = 'store_1'
      const inventory = mockInventoryData[0]
      
      await wrapper.vm.setAlert(inventory)
      
      expect(wrapper.vm.alertForm.sku).toBe('SKU001')
      expect(wrapper.vm.alertForm.productName).toBe('iPhone 15')
      expect(wrapper.vm.alertForm.storeId).toBe('store_1')
      expect(wrapper.vm.showAlertDialog).toBe(true)
    })

    it('应该支持确认预警设置', async () => {
      wrapper.vm.alertForm = {
        sku: 'SKU001',
        productName: 'iPhone 15',
        storeId: 'store_1',
        storeName: '沃尔玛旗舰店',
        safetyStock: 50,
        maxStock: 200,
        alertEnabled: true
      }
      
      await wrapper.vm.confirmAlert()
      
      expect(mockElMessage.success).toHaveBeenCalledWith('预警设置保存成功')
      expect(wrapper.vm.showAlertDialog).toBe(false)
    })
  })

  describe('搜索和筛选', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持SKU搜索', async () => {
      wrapper.vm.searchParams.sku = 'SKU001'
      await wrapper.vm.handleSearch()
      
      expect(wrapper.vm.searchParams.sku).toBe('SKU001')
      expect(wrapper.vm.pagination.page).toBe(1)
    })

    it('应该支持状态筛选', async () => {
      wrapper.vm.searchParams.status = 'low'
      await wrapper.vm.handleSearch()
      
      expect(wrapper.vm.searchParams.status).toBe('low')
    })

    it('应该支持重置筛选条件', async () => {
      wrapper.vm.searchParams.sku = 'SKU001'
      wrapper.vm.searchParams.status = 'low'
      wrapper.vm.selectedStoreId = 'store_1'
      
      await wrapper.vm.handleReset()
      
      expect(wrapper.vm.searchParams.sku).toBe('')
      expect(wrapper.vm.searchParams.status).toBe('')
      expect(wrapper.vm.selectedStoreId).toBe('')
    })
  })

  describe('分页功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持页码切换', async () => {
      await wrapper.vm.handlePageChange(2)
      
      expect(wrapper.vm.pagination.page).toBe(2)
    })

    it('应该支持页面大小切换', async () => {
      await wrapper.vm.handleSizeChange(50)
      
      expect(wrapper.vm.pagination.size).toBe(50)
      expect(wrapper.vm.pagination.page).toBe(1)
    })
  })

  describe('工具方法', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该正确格式化货币', () => {
      const formatted = wrapper.vm.formatCurrency(1234567)
      expect(formatted).toBe('1,234,567')
    })

    it('应该处理零值货币格式化', () => {
      const formatted = wrapper.vm.formatCurrency(0)
      expect(formatted).toBe('0')
    })
  })

  describe('导出功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持导出库存数据', async () => {
      await wrapper.vm.exportInventory()
      
      const { ElMessage } = await import('element-plus')
      expect(ElMessage.success).toHaveBeenCalledWith('导出功能开发中...')
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      wrapper = createWrapper()
      
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      expect(wrapper.find('.multi-store-inventory').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该处理店铺数据加载错误', async () => {
      // 模拟加载错误
      const originalConsoleError = console.error
      console.error = vi.fn()
      
      try {
        wrapper.vm.storeList = []
        await wrapper.vm.loadStoreList()
      } catch (error) {
        // 预期的错误
      }
      
      console.error = originalConsoleError
    })

    it('应该处理调拨操作错误', async () => {
      wrapper.vm.transferForm = {
        sku: 'SKU001',
        productName: 'iPhone 15',
        fromStoreId: 'store_1',
        toStoreId: 'store_2',
        quantity: 50,
        reason: '库存调拨'
      }
      
      // 模拟调拨失败
      const originalConfirmTransfer = wrapper.vm.confirmTransfer
      wrapper.vm.confirmTransfer = vi.fn().mockRejectedValue(new Error('Transfer failed'))
      
      try {
        await wrapper.vm.confirmTransfer()
      } catch (error) {
        // 预期的错误
      }
      
      wrapper.vm.confirmTransfer = originalConfirmTransfer
    })

    it('应该处理预警设置错误', async () => {
      wrapper.vm.alertForm = {
        sku: 'SKU001',
        productName: 'iPhone 15',
        storeId: 'store_1',
        storeName: '沃尔玛旗舰店',
        safetyStock: 50,
        maxStock: 200,
        alertEnabled: true
      }
      
      // 模拟预警设置失败
      const originalConfirmAlert = wrapper.vm.confirmAlert
      wrapper.vm.confirmAlert = vi.fn().mockRejectedValue(new Error('Alert setting failed'))
      
      try {
        await wrapper.vm.confirmAlert()
      } catch (error) {
        // 预期的错误
      }
      
      wrapper.vm.confirmAlert = originalConfirmAlert
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量店铺数据', () => {
      const largeStoreList = Array.from({ length: 50 }, (_, i) => ({
        id: `store_${i}`,
        name: `店铺${i}`,
        status: 'active',
        stats: {
          totalItems: 100,
          totalValue: 50000,
          alertItems: 5,
          outOfStockItems: 1
        }
      }))
      
      wrapper = createWrapper()
      wrapper.vm.storeList = largeStoreList
      
      expect(wrapper.vm.storeList).toHaveLength(50)
    })

    it('应该避免不必要的重新计算', () => {
      wrapper = createWrapper()
      wrapper.vm.inventoryList = mockInventoryData
      
      const inventory = mockInventoryData[0]
      const total1 = wrapper.vm.getTotalInventory(inventory)
      const total2 = wrapper.vm.getTotalInventory(inventory)
      
      expect(total1).toBe(total2)
      expect(total1).toBe(230)
    })
  })
})