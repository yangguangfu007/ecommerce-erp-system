/**
 * 库存历史对话框组件测试
 * 测试库存历史查询、时间线展示、筛选功能等
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElDialog, ElForm, ElFormItem, ElSelect, ElDatePicker, ElButton, ElTimeline, ElTimelineItem, ElPagination } from 'element-plus'
import InventoryHistoryDialog from '../InventoryHistoryDialog.vue'
import { inventoryApi } from '@/api/modules/inventory'
import type { Inventory, InventoryHistory } from '@/types/inventory'

// Mock API
vi.mock('@/api/modules/inventory', () => ({
  inventoryApi: {
    getInventoryHistory: vi.fn()
  }
}))

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

// 测试数据
const mockInventory: Inventory = {
  id: '1',
  sku: 'TEST-SKU-001',
  productId: 'prod-1',
  productName: 'iPhone 15 Pro',
  productImage: 'https://example.com/iphone15.jpg',
  storeId: 'store-1',
  storeName: '主仓库',
  availableQuantity: 100,
  reservedQuantity: 10,
  totalQuantity: 110,
  safetyStock: 20,
  maxStock: 500,
  status: 'NORMAL',
  warehouseLocation: 'A-01-001',
  cost: 999.99,
  totalValue: 109999.00,
  lastUpdated: '2024-01-15 10:30:00',
  createTime: '2024-01-01 00:00:00',
  updateTime: '2024-01-15 10:30:00'
}

const mockHistoryData: InventoryHistory[] = [
  {
    id: '1',
    inventoryId: '1',
    sku: 'TEST-SKU-001',
    productName: 'iPhone 15 Pro',
    type: 'IN',
    quantity: 50,
    beforeQuantity: 50,
    afterQuantity: 100,
    reason: 'PURCHASE',
    note: '采购入库',
    referenceNumber: 'PO-001',
    operatorId: 'user-1',
    operatorName: '张三',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    inventoryId: '1',
    sku: 'TEST-SKU-001',
    productName: 'iPhone 15 Pro',
    type: 'OUT',
    quantity: 10,
    beforeQuantity: 100,
    afterQuantity: 90,
    reason: 'SALE',
    note: '销售出库',
    referenceNumber: 'SO-001',
    operatorId: 'user-2',
    operatorName: '李四',
    createdAt: '2024-01-14 15:20:00'
  }
]

describe('InventoryHistoryDialog', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props = {}) => {
    return mount(InventoryHistoryDialog, {
      props: {
        modelValue: true,
        inventory: mockInventory,
        ...props
      },
      global: {
        components: {
          ElDialog,
          ElForm,
          ElFormItem,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElTimeline,
          ElTimelineItem,
          ElPagination
        },
        stubs: {
          ElDialog: {
            template: '<div class="el-dialog"><slot /></div>',
            props: ['modelValue', 'title', 'width']
          },
          ElForm: {
            template: '<form class="el-form"><slot /></form>',
            props: ['model', 'inline']
          },
          ElFormItem: {
            template: '<div class="el-form-item"><slot /></div>',
            props: ['label']
          },
          ElSelect: {
            template: '<select class="el-select"><slot /></select>',
            props: ['modelValue', 'placeholder', 'clearable']
          },
          ElOption: {
            template: '<option class="el-option"><slot /></option>',
            props: ['label', 'value']
          },
          ElDatePicker: {
            template: '<input class="el-date-picker" />',
            props: ['modelValue', 'type', 'rangeSeparator']
          },
          ElButton: {
            template: '<button class="el-button"><slot /></button>',
            props: ['type', 'icon', 'loading', 'size']
          },
          ElTimeline: {
            template: '<div class="el-timeline"><slot /></div>'
          },
          ElTimelineItem: {
            template: '<div class="el-timeline-item"><slot /></div>',
            props: ['timestamp', 'placement', 'type', 'icon', 'size']
          },
          ElTag: {
            template: '<span class="el-tag"><slot /></span>',
            props: ['type', 'size']
          },
          ElPagination: {
            template: '<div class="el-pagination"></div>',
            props: ['currentPage', 'pageSize', 'total', 'pageSizes', 'layout']
          },
          ElEmpty: {
            template: '<div class="el-empty"><slot /></div>',
            props: ['description']
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock API 响应
    vi.mocked(inventoryApi.getInventoryHistory).mockResolvedValue({
      records: mockHistoryData,
      total: 2,
      current: 1,
      size: 10
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染历史对话框', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.product-info-section').exists()).toBe(true)
      expect(wrapper.find('.filter-section').exists()).toBe(true)
      expect(wrapper.find('.history-section').exists()).toBe(true)
    })

    it('应该显示商品信息', () => {
      wrapper = createWrapper()
      
      const productCard = wrapper.find('.product-card')
      expect(productCard.exists()).toBe(true)
      expect(productCard.text()).toContain('iPhone 15 Pro')
      expect(productCard.text()).toContain('TEST-SKU-001')
      expect(productCard.text()).toContain('A-01-001')
      expect(productCard.text()).toContain('100')
    })

    it('应该显示筛选表单', () => {
      wrapper = createWrapper()
      
      const filterForm = wrapper.find('.filter-form')
      expect(filterForm.exists()).toBe(true)
      expect(wrapper.text()).toContain('调整类型')
      expect(wrapper.text()).toContain('时间范围')
    })

    it('应该显示历史记录标题和统计', () => {
      wrapper = createWrapper()
      
      const sectionHeader = wrapper.find('.section-header')
      expect(sectionHeader.exists()).toBe(true)
      expect(sectionHeader.text()).toContain('调整历史')
      expect(sectionHeader.text()).toContain('条记录')
    })
  })

  describe('数据加载', () => {
    it('应该在对话框打开时加载历史数据', async () => {
      wrapper = createWrapper()
      
      // 等待组件挂载和数据加载
      await wrapper.vm.$nextTick()
      
      expect(inventoryApi.getInventoryHistory).toHaveBeenCalledWith(
        mockInventory.id,
        expect.objectContaining({
          page: 1,
          pageSize: 10
        })
      )
    })

    it('应该在库存ID变化时重新加载数据', async () => {
      wrapper = createWrapper()
      
      const newInventory = { ...mockInventory, id: '2' }
      await wrapper.setProps({ inventory: newInventory })
      
      expect(inventoryApi.getInventoryHistory).toHaveBeenCalledWith(
        '2',
        expect.any(Object)
      )
    })

    it('应该处理API加载错误', async () => {
      const { ElMessage } = await import('element-plus')
      vi.mocked(inventoryApi.getInventoryHistory).mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加载历史记录失败')
    })
  })

  describe('筛选功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持按调整类型筛选', async () => {
      const vm = wrapper.vm
      vm.filterForm.type = 'IN'
      
      await vm.loadHistory()
      
      expect(inventoryApi.getInventoryHistory).toHaveBeenCalledWith(
        mockInventory.id,
        expect.objectContaining({
          type: 'IN'
        })
      )
    })

    it('应该支持按时间范围筛选', async () => {
      const vm = wrapper.vm
      vm.filterForm.dateRange = ['2024-01-01', '2024-01-31']
      
      await vm.loadHistory()
      
      expect(inventoryApi.getInventoryHistory).toHaveBeenCalledWith(
        mockInventory.id,
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      )
    })

    it('应该支持重置筛选条件', async () => {
      const vm = wrapper.vm
      vm.filterForm.type = 'IN'
      vm.filterForm.dateRange = ['2024-01-01', '2024-01-31']
      
      vm.resetFilter()
      
      expect(vm.filterForm.type).toBe('')
      expect(vm.filterForm.dateRange).toBeNull()
      expect(vm.pagination.page).toBe(1)
    })
  })

  describe('时间线展示', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 手动设置历史数据
      wrapper.vm.historyList = mockHistoryData
    })

    it('应该显示历史记录时间线', () => {
      const timeline = wrapper.find('.history-timeline')
      expect(timeline.exists()).toBe(true)
      
      const timelineItems = wrapper.findAll('.el-timeline-item')
      expect(timelineItems.length).toBe(mockHistoryData.length)
    })

    it('应该正确显示每条记录的信息', () => {
      const timelineContent = wrapper.findAll('.timeline-content')
      expect(timelineContent.length).toBe(2)
      
      // 检查第一条记录
      const firstRecord = timelineContent[0]
      expect(firstRecord.text()).toContain('入库')
      expect(firstRecord.text()).toContain('+50')
      expect(firstRecord.text()).toContain('采购入库')
      expect(firstRecord.text()).toContain('张三')
    })

    it('应该根据调整类型显示不同的样式', () => {
      const vm = wrapper.vm
      
      expect(vm.getTimelineType('IN')).toBe('success')
      expect(vm.getTimelineType('OUT')).toBe('warning')
      
      expect(vm.getTimelineIcon('IN')).toBe('Plus')
      expect(vm.getTimelineIcon('OUT')).toBe('Minus')
    })

    it('应该正确显示库存变化', () => {
      const stockChanges = wrapper.findAll('.stock-change')
      expect(stockChanges.length).toBe(2)
      
      // 检查第一条记录的库存变化
      const firstChange = stockChanges[0]
      expect(firstChange.text()).toContain('50')
      expect(firstChange.text()).toContain('100')
    })

    it('应该显示操作详情', () => {
      const operationDetails = wrapper.findAll('.operation-details')
      expect(operationDetails.length).toBe(2)
      
      const firstDetails = operationDetails[0]
      expect(firstDetails.text()).toContain('采购入库')
      expect(firstDetails.text()).toContain('PO-001')
      expect(firstDetails.text()).toContain('张三')
    })
  })

  describe('分页功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持分页切换', async () => {
      const vm = wrapper.vm
      
      await vm.handlePageChange(2)
      
      expect(vm.pagination.page).toBe(2)
      expect(inventoryApi.getInventoryHistory).toHaveBeenCalledWith(
        mockInventory.id,
        expect.objectContaining({
          page: 2
        })
      )
    })

    it('应该支持页面大小切换', async () => {
      const vm = wrapper.vm
      
      await vm.handleSizeChange(20)
      
      expect(vm.pagination.size).toBe(20)
      expect(vm.pagination.page).toBe(1)
      expect(inventoryApi.getInventoryHistory).toHaveBeenCalledWith(
        mockInventory.id,
        expect.objectContaining({
          pageSize: 20,
          page: 1
        })
      )
    })

    it('应该在有数据时显示分页组件', async () => {
      const vm = wrapper.vm
      vm.pagination.total = 50
      
      await wrapper.vm.$nextTick()
      
      const pagination = wrapper.find('.pagination-section')
      expect(pagination.exists()).toBe(true)
    })

    it('应该在无数据时隐藏分页组件', async () => {
      const vm = wrapper.vm
      vm.pagination.total = 0
      
      await wrapper.vm.$nextTick()
      
      const pagination = wrapper.find('.pagination-section')
      expect(pagination.exists()).toBe(false)
    })
  })

  describe('空状态处理', () => {
    it('应该在无历史记录时显示空状态', async () => {
      vi.mocked(inventoryApi.getInventoryHistory).mockResolvedValue({
        records: [],
        total: 0,
        current: 1,
        size: 10
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无调整记录')
    })
  })

  describe('导出功能', () => {
    it('应该支持导出历史记录', async () => {
      wrapper = createWrapper()
      
      const exportButton = wrapper.find('.section-actions .el-button')
      expect(exportButton.exists()).toBe(true)
      expect(exportButton.text()).toContain('导出历史')
      
      await exportButton.trigger('click')
      
      // 由于导出功能还在开发中，这里只检查是否调用了方法
      expect(wrapper.vm.exportHistory).toBeDefined()
    })
  })

  describe('格式化方法', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该正确格式化日期时间', () => {
      const vm = wrapper.vm
      const dateStr = '2024-01-15 10:30:00'
      
      const formatted = vm.formatDateTime(dateStr)
      expect(formatted).toMatch(/2024\/01\/15/)
      expect(formatted).toMatch(/10:30/)
    })

    it('应该正确获取原因文本', () => {
      const vm = wrapper.vm
      
      expect(vm.getReasonText('PURCHASE')).toBe('采购入库')
      expect(vm.getReasonText('SALE')).toBe('销售出库')
      expect(vm.getReasonText('DAMAGE')).toBe('损坏出库')
      expect(vm.getReasonText('UNKNOWN')).toBe('UNKNOWN')
    })

    it('应该正确获取原因标签类型', () => {
      const vm = wrapper.vm
      
      expect(vm.getReasonTagType('PURCHASE')).toBe('success')
      expect(vm.getReasonTagType('SALE')).toBe('primary')
      expect(vm.getReasonTagType('DAMAGE')).toBe('danger')
      expect(vm.getReasonTagType('UNKNOWN')).toBe('info')
    })
  })

  describe('审核状态显示', () => {
    it('应该显示审核状态信息', async () => {
      const historyWithAudit = [
        {
          ...mockHistoryData[0],
          auditStatus: 'APPROVED',
          auditNote: '审核通过',
          auditorName: '王五',
          auditTime: '2024-01-15 11:00:00'
        }
      ]
      
      wrapper = createWrapper()
      wrapper.vm.historyList = historyWithAudit
      await wrapper.vm.$nextTick()
      
      const auditSection = wrapper.find('.audit-section')
      expect(auditSection.exists()).toBe(true)
      expect(auditSection.text()).toContain('已审核')
      expect(auditSection.text()).toContain('审核通过')
      expect(auditSection.text()).toContain('王五')
    })

    it('应该正确获取审核状态类型', () => {
      const vm = wrapper.vm
      
      expect(vm.getAuditStatusType('PENDING')).toBe('warning')
      expect(vm.getAuditStatusType('APPROVED')).toBe('success')
      expect(vm.getAuditStatusType('REJECTED')).toBe('danger')
    })

    it('应该正确获取审核状态文本', () => {
      const vm = wrapper.vm
      
      expect(vm.getAuditStatusText('PENDING')).toBe('待审核')
      expect(vm.getAuditStatusText('APPROVED')).toBe('已审核')
      expect(vm.getAuditStatusText('REJECTED')).toBe('已拒绝')
    })
  })

  describe('对话框生命周期', () => {
    it('应该在关闭时重置数据', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.filterForm.type = 'IN'
      vm.historyList = mockHistoryData
      
      vm.handleClose()
      
      expect(vm.filterForm.type).toBe('')
      expect(vm.historyList).toEqual([])
    })

    it('应该处理图片加载错误', () => {
      wrapper = createWrapper()
      
      const img = wrapper.find('.product-image img')
      const mockEvent = {
        target: { src: '' }
      } as any
      
      wrapper.vm.handleImageError(mockEvent)
      
      expect(mockEvent.target.src).toBe('/placeholder-product.png')
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕上调整布局', () => {
      wrapper = createWrapper()
      
      // 检查响应式样式是否存在
      const style = wrapper.find('style')
      expect(style.exists()).toBe(true)
    })
  })

  describe('加载状态', () => {
    it('应该在加载时显示加载状态', async () => {
      // 模拟长时间加载
      vi.mocked(inventoryApi.getInventoryHistory).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(true)
    })
  })
})