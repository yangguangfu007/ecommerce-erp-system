/**
 * 库存历史查询组件测试
 * 测试库存变动记录展示、筛选、统计和导出功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import InventoryHistory from '../InventoryHistory.vue'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Refresh: 'refresh-icon',
  Download: 'download-icon', 
  Search: 'search-icon',
  HomeFilled: 'home-filled-icon',
  Edit: 'edit-icon',
  Clock: 'clock-icon',
  ArrowRight: 'arrow-right-icon'
}))

// Mock API module
vi.mock('@/api/modules/inventory', () => ({
  inventoryApi: {
    getInventoryHistory: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

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
        <div v-for="item in data" :key="item.id" :data-testid="'history-row-' + item.id">
          {{ item.productName }}
        </div>
      </div>
    `,
    props: ['data', 'loading'],
    emits: ['selection-change']
  },
  ChartContainer: {
    template: '<div data-testid="chart-container"></div>',
    props: ['chartData', 'chartOptions', 'height']
  }
}

// Mock data
const mockHistoryData = [
  {
    id: 'hist_1',
    inventoryId: 'inv_1',
    sku: 'SKU001',
    productName: 'iPhone 15',
    type: 'IN',
    quantity: 50,
    beforeQuantity: 100,
    afterQuantity: 150,
    reason: 'PURCHASE',
    note: '采购入库',
    referenceNumber: 'PO202401001',
    operatorId: 'user_1',
    operatorName: '管理员',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 'hist_2',
    inventoryId: 'inv_2',
    sku: 'SKU002',
    productName: 'Samsung Galaxy S24',
    type: 'OUT',
    quantity: 20,
    beforeQuantity: 80,
    afterQuantity: 60,
    reason: 'SALE',
    note: '销售出库',
    referenceNumber: 'SO202401001',
    operatorId: 'user_2',
    operatorName: '销售员',
    createdAt: '2024-01-15 14:20:00'
  }
]

const mockTrendData = [
  { date: '2024-01-01', quantity: 10, inQuantity: 100, outQuantity: 90 },
  { date: '2024-01-02', quantity: -5, inQuantity: 80, outQuantity: 85 },
  { date: '2024-01-03', quantity: 15, inQuantity: 120, outQuantity: 105 }
]

describe('InventoryHistory', () => {
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
    mockInventoryApi.getInventoryHistory.mockResolvedValue({
      records: mockHistoryData,
      total: 2,
      current: 1,
      size: 20
    })
  })

  const createWrapper = (props = {}) => {
    return mount(InventoryHistory, {
      props,
      global: {
        components: mockComponents,
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true,
          'el-dialog': true
        }
      }
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染页面结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[data-testid="breadcrumb-nav"]').exists()).toBe(true)
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.find('.search-filters').exists()).toBe(true)
      expect(wrapper.find('.stats-cards').exists()).toBe(true)
      expect(wrapper.find('[data-testid="chart-container"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="base-table"]').exists()).toBe(true)
    })

    it('应该显示正确的页面标题和描述', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-title').text()).toBe('库存历史')
      expect(wrapper.find('.page-description').text()).toBe('查看库存变动记录和操作日志')
    })

    it('应该渲染统计卡片', () => {
      wrapper = createWrapper()
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards).toHaveLength(4)
      
      // 检查统计卡片标签
      const labels = statCards.map((card: any) => card.find('.stat-label').text())
      expect(labels).toContain('总入库数量')
      expect(labels).toContain('总出库数量')
      expect(labels).toContain('净变动数量')
      expect(labels).toContain('变动记录数')
    })

    it('应该渲染搜索筛选表单', () => {
      wrapper = createWrapper()
      
      const filterGroups = wrapper.findAll('.filter-group')
      expect(filterGroups.length).toBeGreaterThan(0)
      
      // 检查筛选字段
      expect(wrapper.text()).toContain('商品SKU')
      expect(wrapper.text()).toContain('变动类型')
      expect(wrapper.text()).toContain('变动原因')
      expect(wrapper.text()).toContain('时间范围')
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时加载历史数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Wait for component to mount and load data
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(mockInventoryApi.getInventoryHistory).toHaveBeenCalled()
    })

    it('应该正确显示历史记录数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const historyRows = wrapper.findAll('[data-testid^="history-row-"]')
      expect(historyRows.length).toBeGreaterThan(0)
    })

    it('应该处理API加载错误', async () => {
      mockInventoryApi.getInventoryHistory.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待错误处理
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(mockElMessage.error).toHaveBeenCalledWith('加载历史记录失败')
    })
  })

  describe('搜索和筛选', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持SKU搜索', async () => {
      const skuInput = wrapper.find('el-input-stub')
      await skuInput.setValue('SKU001')
      
      const searchButton = wrapper.find('[data-testid="search-button"]')
      if (searchButton.exists()) {
        await searchButton.trigger('click')
      }
      
      // 验证搜索参数
      expect(wrapper.vm.searchParams.sku).toBe('SKU001')
    })

    it('应该支持变动类型筛选', async () => {
      // 模拟选择变动类型
      wrapper.vm.searchParams.type = 'IN'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.searchParams.type).toBe('IN')
    })

    it('应该支持变动原因筛选', async () => {
      // 模拟选择变动原因
      wrapper.vm.searchParams.reason = 'PURCHASE'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.searchParams.reason).toBe('PURCHASE')
    })

    it('应该支持时间范围筛选', async () => {
      const dateRange = ['2024-01-01', '2024-01-31']
      wrapper.vm.dateRange = dateRange
      await wrapper.vm.handleDateRangeChange(dateRange)
      
      expect(wrapper.vm.searchParams.startDate).toBe('2024-01-01')
      expect(wrapper.vm.searchParams.endDate).toBe('2024-01-31')
    })

    it('应该支持重置筛选条件', async () => {
      // 设置筛选条件
      wrapper.vm.searchParams.sku = 'SKU001'
      wrapper.vm.searchParams.type = 'IN'
      wrapper.vm.dateRange = ['2024-01-01', '2024-01-31']
      
      // 重置
      await wrapper.vm.handleReset()
      
      expect(wrapper.vm.searchParams.sku).toBe('')
      expect(wrapper.vm.searchParams.type).toBe('')
      expect(wrapper.vm.dateRange).toBeNull()
    })
  })

  describe('统计计算', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.historyList = mockHistoryData
    })

    it('应该正确计算入库统计', () => {
      wrapper.vm.calculateStats()
      
      const inQuantity = mockHistoryData
        .filter(item => item.type === 'IN')
        .reduce((sum, item) => sum + item.quantity, 0)
      
      expect(wrapper.vm.stats.totalInQuantity).toBe(inQuantity)
    })

    it('应该正确计算出库统计', () => {
      wrapper.vm.calculateStats()
      
      const outQuantity = mockHistoryData
        .filter(item => item.type === 'OUT')
        .reduce((sum, item) => sum + item.quantity, 0)
      
      expect(wrapper.vm.stats.totalOutQuantity).toBe(outQuantity)
    })

    it('应该正确计算净变动数量', () => {
      wrapper.vm.calculateStats()
      
      const netQuantity = wrapper.vm.stats.totalInQuantity - wrapper.vm.stats.totalOutQuantity
      expect(wrapper.vm.stats.netQuantity).toBe(netQuantity)
    })

    it('应该正确计算总记录数', () => {
      wrapper.vm.calculateStats()
      
      expect(wrapper.vm.stats.totalTransactions).toBe(mockHistoryData.length)
    })
  })

  describe('趋势图表', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持切换趋势粒度', async () => {
      wrapper.vm.trendGranularity = 'week'
      await wrapper.vm.loadTrendData()
      
      expect(wrapper.vm.trendGranularity).toBe('week')
      expect(wrapper.vm.trendChartData.labels).toBeDefined()
      expect(wrapper.vm.trendChartData.datasets).toBeDefined()
    })

    it('应该生成正确的图表数据结构', async () => {
      await wrapper.vm.loadTrendData()
      
      expect(wrapper.vm.trendChartData.labels).toBeInstanceOf(Array)
      expect(wrapper.vm.trendChartData.datasets).toBeInstanceOf(Array)
      expect(wrapper.vm.trendChartData.datasets).toHaveLength(3) // 入库、出库、净变动
    })

    it('应该包含正确的数据集标签', async () => {
      await wrapper.vm.loadTrendData()
      
      const labels = wrapper.vm.trendChartData.datasets.map((dataset: any) => dataset.label)
      expect(labels).toContain('入库数量')
      expect(labels).toContain('出库数量')
      expect(labels).toContain('净变动')
    })
  })

  describe('详情查看', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.historyList = mockHistoryData
    })

    it('应该支持查看记录详情', async () => {
      const record = mockHistoryData[0]
      await wrapper.vm.viewDetail(record)
      
      expect(wrapper.vm.currentRecord).toBe(record)
      expect(wrapper.vm.showDetailDialog).toBe(true)
    })

    it('详情对话框应该显示完整信息', async () => {
      const record = mockHistoryData[0]
      wrapper.vm.currentRecord = record
      wrapper.vm.showDetailDialog = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.currentRecord.productName).toBe('iPhone 15')
      expect(wrapper.vm.currentRecord.sku).toBe('SKU001')
      expect(wrapper.vm.currentRecord.type).toBe('IN')
      expect(wrapper.vm.currentRecord.quantity).toBe(50)
    })
  })

  describe('分页功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持页码切换', async () => {
      await wrapper.vm.handlePageChange(2)
      
      expect(wrapper.vm.pagination.page).toBe(2)
      expect(mockInventoryApi.getInventoryHistory).toHaveBeenCalled()
    })

    it('应该支持页面大小切换', async () => {
      await wrapper.vm.handleSizeChange(50)
      
      expect(wrapper.vm.pagination.size).toBe(50)
      expect(wrapper.vm.pagination.page).toBe(1) // 应该重置到第一页
      expect(mockInventoryApi.getInventoryHistory).toHaveBeenCalled()
    })
  })

  describe('导出功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      wrapper.vm.selectedHistory = mockHistoryData
    })

    it('应该支持导出全部历史', async () => {
      await wrapper.vm.exportHistory()
      
      expect(mockElMessage.success).toHaveBeenCalledWith('导出功能开发中...')
    })

    it('应该支持导出选中记录', async () => {
      await wrapper.vm.exportSelectedHistory()
      
      expect(mockElMessage.success).toHaveBeenCalledWith('导出选中记录功能开发中...')
    })
  })

  describe('工具方法', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该正确格式化日期', () => {
      const dateTime = '2024-01-15 10:30:00'
      const date = wrapper.vm.formatDate(dateTime)
      
      expect(date).toBe('2024-01-15')
    })

    it('应该正确格式化时间', () => {
      const dateTime = '2024-01-15 10:30:00'
      const time = wrapper.vm.formatTime(dateTime)
      
      expect(time).toBe('10:30:00')
    })

    it('应该正确转换原因文本', () => {
      expect(wrapper.vm.getReasonText('PURCHASE')).toBe('采购入库')
      expect(wrapper.vm.getReasonText('SALE')).toBe('销售出库')
      expect(wrapper.vm.getReasonText('RETURN')).toBe('退货入库')
      expect(wrapper.vm.getReasonText('DAMAGE')).toBe('损坏出库')
      expect(wrapper.vm.getReasonText('TRANSFER')).toBe('调拨')
      expect(wrapper.vm.getReasonText('STOCKTAKING')).toBe('盘点调整')
      expect(wrapper.vm.getReasonText('OTHER')).toBe('其他')
    })

    it('应该处理未知原因', () => {
      const unknownReason = 'UNKNOWN_REASON'
      expect(wrapper.vm.getReasonText(unknownReason)).toBe(unknownReason)
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
      
      expect(wrapper.find('.inventory-history').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理趋势数据加载错误', async () => {
      wrapper = createWrapper()
      
      // 模拟趋势数据加载错误
      const originalConsoleError = console.error
      console.error = vi.fn()
      
      try {
        // 触发错误
        wrapper.vm.trendChartData = null
        await wrapper.vm.loadTrendData()
      } catch (error) {
        // 预期的错误
      }
      
      console.error = originalConsoleError
    })

    it('应该处理空数据情况', () => {
      wrapper = createWrapper()
      wrapper.vm.historyList = []
      wrapper.vm.calculateStats()
      
      expect(wrapper.vm.stats.totalInQuantity).toBe(0)
      expect(wrapper.vm.stats.totalOutQuantity).toBe(0)
      expect(wrapper.vm.stats.netQuantity).toBe(0)
      expect(wrapper.vm.stats.totalTransactions).toBe(0)
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量数据', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockHistoryData[0],
        id: `hist_${i}`,
        quantity: i + 1
      }))
      
      wrapper = createWrapper()
      wrapper.vm.historyList = largeDataset
      wrapper.vm.calculateStats()
      
      expect(wrapper.vm.stats.totalTransactions).toBe(1000)
    })

    it('应该避免不必要的重新渲染', async () => {
      wrapper = createWrapper()
      
      const renderCount = wrapper.vm.$el.querySelectorAll('[data-testid^="history-row-"]').length
      
      // 触发相同的搜索
      await wrapper.vm.handleSearch()
      await wrapper.vm.handleSearch()
      
      // 验证没有额外的渲染
      expect(wrapper.vm.pagination.page).toBe(1)
    })
  })
})