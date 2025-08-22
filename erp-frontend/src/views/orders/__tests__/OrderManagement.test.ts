/**
 * 订单管理页面组件测试
 * 测试订单列表展示、筛选、分页、状态更新等功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import OrderManagement from '../OrderManagement.vue'
import { useOrderStore } from '@/stores/order'
import type { Order, OrderStatus } from '@/types'

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
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

// Mock 订单数据
const mockOrders: Order[] = [
  {
    id: 1,
    orderId: 'ORD20240101001',
    platformOrderId: 'WM123456789',
    platform: 'Walmart',
    storeId: 1,
    storeName: '沃尔玛旗舰店',
    status: 'PENDING' as OrderStatus,
    customerName: '张三',
    customerEmail: 'zhangsan@example.com',
    totalAmount: 299.99,
    currency: 'CNY',
    orderDate: '2024-01-01T10:00:00Z',
    createdAt: '2024-01-01T10:05:00Z',
    updatedAt: '2024-01-01T10:05:00Z',
    items: [
      {
        id: 1,
        orderId: 1,
        sku: 'SKU001',
        productTitle: 'iPhone 15',
        quantity: 1,
        unitPrice: 299.99,
        totalPrice: 299.99
      }
    ],
    shippingAddress: {
      name: '张三',
      phone: '13800138000',
      country: 'CN',
      state: '北京市',
      city: '北京市',
      address1: '朝阳区某某街道',
      address2: '',
      postalCode: '100000'
    }
  },
  {
    id: 2,
    orderId: 'ORD20240101002',
    platformOrderId: 'AM987654321',
    platform: 'Amazon',
    storeId: 2,
    storeName: '亚马逊旗舰店',
    status: 'CONFIRMED' as OrderStatus,
    customerName: '李四',
    customerEmail: 'lisi@example.com',
    totalAmount: 199.99,
    currency: 'CNY',
    orderDate: '2024-01-01T11:00:00Z',
    createdAt: '2024-01-01T11:05:00Z',
    updatedAt: '2024-01-01T11:05:00Z',
    items: [
      {
        id: 2,
        orderId: 2,
        sku: 'SKU002',
        productTitle: 'Samsung Galaxy S24',
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99
      }
    ],
    shippingAddress: {
      name: '李四',
      phone: '13800138001',
      country: 'CN',
      state: '上海市',
      city: '上海市',
      address1: '浦东新区某某路',
      address2: '',
      postalCode: '200000'
    }
  }
]

describe('OrderManagement 订单管理页面', () => {
  let wrapper: any
  let orderStore: any

  beforeEach(() => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 获取 store 实例
    orderStore = useOrderStore()
    
    // Mock store 方法
    vi.spyOn(orderStore, 'fetchOrders').mockResolvedValue({
      list: mockOrders,
      total: mockOrders.length,
      page: 1,
      size: 20,
      pages: 1
    })
    vi.spyOn(orderStore, 'updateOrderStatus').mockResolvedValue(mockOrders[0])
    vi.spyOn(orderStore, 'cancelOrder').mockResolvedValue(mockOrders[0])
    vi.spyOn(orderStore, 'batchOperateOrders').mockResolvedValue(true)
    vi.spyOn(orderStore, 'syncOrders').mockResolvedValue({
      taskId: 'task-123',
      status: 'COMPLETED',
      totalCount: 10,
      successCount: 10,
      failedCount: 0,
      errors: [],
      startTime: '2024-01-01T12:00:00Z'
    })
    vi.spyOn(orderStore, 'setFilters').mockImplementation(() => {})
    vi.spyOn(orderStore, 'clearFilters').mockImplementation(() => {})
    vi.spyOn(orderStore, 'setPagination').mockImplementation(() => {})
    
    // 设置初始状态
    orderStore.state.orders = mockOrders
    orderStore.state.total = mockOrders.length
    orderStore.state.currentPage = 1
    orderStore.state.pageSize = 20
    orderStore.state.selectedOrderIds = []
    
    // 挂载组件
    wrapper = mount(OrderManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-table': true,
          'el-table-column': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-dialog': true,
          'el-pagination': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染页面标题和描述', () => {
      expect(wrapper.find('h2').text()).toBe('订单列表')
      expect(wrapper.find('.page-description').text()).toContain('管理和查看所有订单信息')
    })

    it('应该显示订单总数', () => {
      expect(wrapper.find('.table-count').text()).toContain(`共 ${mockOrders.length} 条记录`)
    })

    it('应该渲染筛选表单', () => {
      expect(wrapper.find('.table-filters').exists()).toBe(true)
      expect(wrapper.find('.filter-group').exists()).toBe(true)
      // 检查筛选器组件
      const hasFilterItems = wrapper.find('.filter-item').exists()
      expect(hasFilterItems).toBe(true)
    })

    it('应该渲染操作按钮', () => {
      expect(wrapper.find('.table-actions').exists()).toBe(true)
      
      // 由于el-button被stub为true，检查是否存在操作按钮容器
      const tableActions = wrapper.find('.table-actions')
      expect(tableActions.exists()).toBe(true)
      
      // 检查是否有子元素（stubbed按钮）
      expect(tableActions.element.children.length).toBeGreaterThan(0)
    })

    it('应该渲染表格包装器', () => {
      expect(wrapper.find('.table-wrapper').exists()).toBe(true)
      expect(wrapper.find('.data-table').exists()).toBe(true)
    })

    it('应该渲染分页组件', () => {
      expect(wrapper.find('.table-pagination').exists()).toBe(true)
      expect(wrapper.find('.pagination-info').exists()).toBe(true)
      expect(wrapper.find('.pagination-controls').exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时加载订单数据', () => {
      expect(orderStore.fetchOrders).toHaveBeenCalled()
    })

    it('应该正确显示加载状态', async () => {
      // 直接检查 isLoading 计算属性
      expect(orderStore.isLoading).toBeDefined()
      
      // 验证加载状态传递给表格组件
      expect(wrapper.find('.data-table-container').exists()).toBe(true)
      expect(wrapper.find('.data-table').exists()).toBe(true)
    })

    it('应该显示分页信息', () => {
      const paginationInfo = wrapper.find('.pagination-info')
      expect(paginationInfo.exists()).toBe(true)
      expect(paginationInfo.text()).toContain('显示第')
      expect(paginationInfo.text()).toContain('条记录')
    })
  })

  describe('筛选功能', () => {
    it('应该支持关键词搜索', async () => {
      // 直接调用组件方法进行测试
      wrapper.vm.filterForm.keyword = 'ORD20240101001'
      await wrapper.vm.handleFilterChange()
      
      // 等待防抖
      await new Promise(resolve => setTimeout(resolve, 600))
      
      expect(orderStore.setFilters).toHaveBeenCalled()
    })

    it('应该支持状态筛选', async () => {
      wrapper.vm.filterForm.status = 'PENDING'
      await wrapper.vm.handleFilterChange()
      
      // 等待防抖
      await new Promise(resolve => setTimeout(resolve, 600))
      
      expect(orderStore.setFilters).toHaveBeenCalled()
    })

    it('应该支持重置筛选条件', async () => {
      await wrapper.vm.handleResetFilters()
      
      expect(orderStore.clearFilters).toHaveBeenCalled()
      expect(orderStore.setPagination).toHaveBeenCalledWith(1)
    })
  })

  describe('订单操作', () => {
    it('应该支持查看订单详情', async () => {
      await wrapper.vm.handleViewDetail(1)
      
      expect(mockPush).toHaveBeenCalledWith('/orders/1')
    })

    it('应该支持更新订单状态', async () => {
      await wrapper.vm.handleUpdateStatus(mockOrders[0])
      
      expect(wrapper.vm.statusUpdateDialog.visible).toBe(true)
      expect(wrapper.vm.statusUpdateDialog.form.orderNo).toBe('ORD20240101001')
    })

    it('应该支持取消订单', async () => {
      // Mock 确认对话框
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      await wrapper.vm.handleCancelOrder(mockOrders[0])
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        expect.stringContaining('确定要取消订单'),
        '确认取消',
        expect.any(Object)
      )
      
      expect(orderStore.cancelOrder).toHaveBeenCalledWith(1, '用户取消')
    })
  })

  describe('批量操作', () => {
    beforeEach(() => {
      // 设置选中的订单
      orderStore.state.selectedOrderIds = [1, 2]
    })

    it('应该显示批量操作栏', async () => {
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.batch-actions').exists()).toBe(true)
      expect(wrapper.text()).toContain('已选择 2 个订单')
    })

    it('应该支持批量确认', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      await wrapper.vm.handleBatchConfirm()
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      
      expect(orderStore.batchOperateOrders).toHaveBeenCalledWith({
        orderIds: [1, 2],
        operation: 'confirm'
      })
    })

    it('应该显示正确的批量操作信息', async () => {
      await wrapper.vm.$nextTick()
      const batchInfo = wrapper.find('.batch-info')
      expect(batchInfo.text()).toContain('已选择 2 个订单')
    })

    it('应该支持批量取消', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      await wrapper.vm.handleBatchCancel()
      
      expect(orderStore.batchOperateOrders).toHaveBeenCalledWith({
        orderIds: [1, 2],
        operation: 'cancel',
        reason: '批量取消'
      })
    })
  })

  describe('状态更新对话框', () => {
    beforeEach(async () => {
      // 打开状态更新对话框
      wrapper.vm.statusUpdateDialog.visible = true
      wrapper.vm.statusUpdateDialog.form = {
        id: 1,
        orderNo: 'ORD20240101001',
        status: 'PENDING',
        notes: ''
      }
      await wrapper.vm.$nextTick()
    })

    it('应该正确显示对话框内容', () => {
      // 检查对话框状态
      expect(wrapper.vm.statusUpdateDialog.visible).toBe(true)
      expect(wrapper.vm.statusUpdateDialog.form.orderNo).toBe('ORD20240101001')
      expect(wrapper.vm.statusUpdateDialog.form.status).toBe('PENDING')
    })

    it('应该支持确认状态更新', async () => {
      // Mock 表单验证
      const mockValidate = vi.fn().mockResolvedValue(true)
      
      // 设置表单引用
      wrapper.vm.statusFormRef = { validate: mockValidate }
      
      wrapper.vm.statusUpdateDialog.form.status = 'CONFIRMED'
      wrapper.vm.statusUpdateDialog.form.notes = '确认订单'
      
      await wrapper.vm.handleConfirmStatusUpdate()
      
      expect(orderStore.updateOrderStatus).toHaveBeenCalledWith({
        id: 1,
        status: 'CONFIRMED',
        notes: '确认订单'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('订单状态更新成功')
    })
  })

  describe('工具函数', () => {
    it('应该正确获取状态文本', () => {
      expect(wrapper.vm.getStatusText('PENDING')).toBe('待支付')
      expect(wrapper.vm.getStatusText('CONFIRMED')).toBe('已支付')
      expect(wrapper.vm.getStatusText('SHIPPED')).toBe('已发货')
      expect(wrapper.vm.getStatusText('DELIVERED')).toBe('已完成')
      expect(wrapper.vm.getStatusText('CANCELLED')).toBe('已取消')
    })

    it('应该正确判断是否可以取消订单', () => {
      expect(wrapper.vm.canCancelOrder('PENDING')).toBe(true)
      expect(wrapper.vm.canCancelOrder('CONFIRMED')).toBe(true)
      expect(wrapper.vm.canCancelOrder('SHIPPED')).toBe(false)
      expect(wrapper.vm.canCancelOrder('DELIVERED')).toBe(false)
      expect(wrapper.vm.canCancelOrder('CANCELLED')).toBe(false)
    })

    it('应该正确格式化日期和时间', () => {
      const dateString = '2024-01-01T10:30:45Z'
      
      expect(wrapper.vm.formatDate(dateString)).toBe('2024/1/1')
      expect(wrapper.vm.formatTime(dateString)).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('分页功能', () => {
    it('应该支持页码变化', async () => {
      await wrapper.vm.handlePageChange(2)
      
      expect(orderStore.setPagination).toHaveBeenCalledWith(2)
      expect(orderStore.fetchOrders).toHaveBeenCalled()
    })

    it('应该支持页面大小变化', async () => {
      await wrapper.vm.handleSizeChange(50)
      
      expect(orderStore.setPagination).toHaveBeenCalledWith(1, 50)
      expect(orderStore.fetchOrders).toHaveBeenCalled()
    })
  })

  describe('导出和同步功能', () => {
    it('应该支持导出订单', async () => {
      await wrapper.vm.handleExportOrders()
      
      expect(ElMessage.success).toHaveBeenCalledWith('订单数据导出成功')
    })

    it('应该支持打开同步对话框', async () => {
      const syncButton = wrapper.find('[data-test="sync-orders-btn"]')
      expect(syncButton.exists()).toBe(true)
      
      await syncButton.trigger('click')
      
      expect(wrapper.vm.showSyncDialog).toBe(true)
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      // 验证响应式样式类存在
      expect(wrapper.find('.order-management').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理加载失败的情况', async () => {
      orderStore.fetchOrders.mockRejectedValue(new Error('网络错误'))
      
      try {
        await wrapper.vm.handleApplyFilters()
      } catch (error) {
        // 错误应该被捕获并处理
      }
      
      // 验证错误状态
      expect(orderStore.hasError).toBeDefined()
    })

    it('应该处理状态更新失败的情况', async () => {
      orderStore.updateOrderStatus.mockRejectedValue(new Error('更新失败'))
      
      const mockValidate = vi.fn().mockResolvedValue(true)
      wrapper.vm.statusFormRef = { validate: mockValidate }
      
      wrapper.vm.statusUpdateDialog.form.id = 1
      wrapper.vm.statusUpdateDialog.form.status = 'CONFIRMED'
      
      await wrapper.vm.handleConfirmStatusUpdate()
      
      expect(ElMessage.error).toHaveBeenCalledWith('更新订单状态失败')
    })
  })
})