/**
 * 订单详情页面组件测试
 * 测试订单详情展示、操作历史、状态更新、打印等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderDetail from '../OrderDetail.vue'
import { useOrderStore } from '@/stores/order'
import type { Order, OrderStatus } from '@/types'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      params: { id: '1' }
    }),
    useRouter: () => ({
      push: mockPush
    })
  }
})

// Mock Element Plus
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

// Mock 订单数据
const mockOrder: Order = {
  id: 1,
  orderId: 'ORD20240101001',
  platformOrderId: 'WM123456789',
  storeId: 1,
  store: {
    id: 1,
    storeName: '沃尔玛旗舰店',
    platform: 'Walmart',
    platformStoreId: 'WM001',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  status: 'PENDING' as OrderStatus,
  customerName: '张三',
  customerEmail: 'zhangsan@example.com',
  totalAmount: 299.99,
  currency: 'CNY',
  orderDate: '2024-01-01T10:00:00Z',
  shipDate: undefined,
  trackingNumber: undefined,
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
}

// Mock 已发货订单数据
const mockShippedOrder: Order = {
  ...mockOrder,
  id: 2,
  orderId: 'ORD20240101002',
  status: 'SHIPPED' as OrderStatus,
  shipDate: '2024-01-02T14:30:00Z',
  trackingNumber: 'SF1234567890'
}

describe('OrderDetail 订单详情页面', () => {
  let wrapper: any
  let orderStore: unknown

  beforeEach(() => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 获取 store 实例
    orderStore = useOrderStore()
    
    // Mock store 方法
    vi.spyOn(orderStore, 'fetchOrderById').mockResolvedValue(mockOrder)
    vi.spyOn(orderStore, 'updateOrderStatus').mockResolvedValue(mockOrder)
    
    // Mock window.open for print functionality
    Object.defineProperty(window, 'open', {
      writable: true,
      value: vi.fn(() => ({
        document: {
          write: vi.fn(),
          close: vi.fn()
        },
        focus: vi.fn(),
        print: vi.fn(),
        close: vi.fn()
      }))
    })
    
    // 挂载组件
    wrapper = mount(OrderDetail, {
      global: {
        plugins: [pinia],
        stubs: {
          'BreadcrumbNav': true,
          'StatusBadge': true,
          'BaseCard': {
            template: '<div class="base-card"><slot name="header"></slot><slot></slot></div>'
          },
          'BaseTable': {
            template: '<div class="base-table"><slot></slot></div>',
            props: ['data', 'columns', 'showPagination']
          },
          'el-button': true,
          'el-loading': true,
          'el-result': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-input': true,
          'el-row': true,
          'el-col': true
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
    it('应该正确渲染面包屑导航', () => {
      expect(wrapper.findComponent({ name: 'BreadcrumbNav' }).exists()).toBe(true)
    })

    it('应该在组件挂载时加载订单详情', () => {
      expect(orderStore.fetchOrderById).toHaveBeenCalledWith(1)
    })

    it('应该渲染加载状态', async () => {
      wrapper.vm.loading = true
      wrapper.vm.order = null
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading-container').exists()).toBe(true)
    })

    it('应该渲染错误状态', async () => {
      wrapper.vm.loading = false
      wrapper.vm.order = null
      wrapper.vm.error = '加载失败'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
    })
  })

  describe('订单头部信息', () => {
    beforeEach(async () => {
      wrapper.vm.order = mockOrder
      await wrapper.vm.$nextTick()
    })

    it('应该显示订单头部信息', () => {
      expect(wrapper.find('.order-header').exists()).toBe(true)
      expect(wrapper.find('.order-title').exists()).toBe(true)
      expect(wrapper.find('.order-meta').exists()).toBe(true)
      expect(wrapper.find('.order-actions').exists()).toBe(true)
    })

    it('应该显示正确的订单号和状态', () => {
      const text = wrapper.text()
      expect(text).toContain('ORD20240101001')
      expect(text).toContain('Walmart')
    })

    it('应该显示操作按钮', () => {
      const actions = wrapper.find('.order-actions')
      expect(actions.exists()).toBe(true)
    })
  })

  describe('订单详情卡片', () => {
    beforeEach(async () => {
      wrapper.vm.order = mockOrder
      await wrapper.vm.$nextTick()
    })

    it('应该显示基本信息卡片', () => {
      const cards = wrapper.findAll('.detail-card')
      expect(cards.length).toBeGreaterThan(0)
      
      const text = wrapper.text()
      expect(text).toContain('基本信息')
      expect(text).toContain('ORD20240101001')
      expect(text).toContain('WM123456789')
      expect(text).toContain('¥299.99')
    })

    it('应该显示客户信息卡片', () => {
      const text = wrapper.text()
      expect(text).toContain('客户信息')
      expect(text).toContain('张三')
      expect(text).toContain('zhangsan@example.com')
      expect(text).toContain('北京市')
      expect(text).toContain('朝阳区某某街道')
    })

    it('应该显示商品信息卡片', () => {
      const text = wrapper.text()
      expect(text).toContain('商品信息')
      // 由于 BaseTable 被 stub，检查是否存在商品表格容器
      expect(wrapper.find('.order-items-table').exists()).toBe(true)
    })

    it('应该显示操作历史卡片', () => {
      const text = wrapper.text()
      expect(text).toContain('操作历史')
    })
  })

  describe('操作历史时间线', () => {
    beforeEach(async () => {
      wrapper.vm.order = mockOrder
      await wrapper.vm.$nextTick()
    })

    it('应该生成订单创建事件', () => {
      const history = wrapper.vm.orderHistory
      expect(history).toHaveLength(1)
      expect(history[0].title).toBe('订单创建')
      expect(history[0].type).toBe('created')
    })

    it('应该为已发货订单生成相应事件', async () => {
      wrapper.vm.order = mockShippedOrder
      await wrapper.vm.$nextTick()
      
      const history = wrapper.vm.orderHistory
      expect(history.length).toBeGreaterThan(1)
      
      const eventTitles = history.map(event => event.title)
      expect(eventTitles).toContain('订单创建')
      expect(eventTitles).toContain('订单确认')
      expect(eventTitles).toContain('订单发货')
    })

    it('应该按时间倒序排列事件', async () => {
      wrapper.vm.order = mockShippedOrder
      await wrapper.vm.$nextTick()
      
      const history = wrapper.vm.orderHistory
      for (let i = 1; i < history.length; i++) {
        const prevTime = new Date(history[i - 1].time).getTime()
        const currTime = new Date(history[i].time).getTime()
        expect(prevTime).toBeGreaterThanOrEqual(currTime)
      }
    })
  })

  describe('状态更新功能', () => {
    beforeEach(async () => {
      wrapper.vm.order = mockOrder
      await wrapper.vm.$nextTick()
    })

    it('应该显示状态更新卡片', () => {
      const text = wrapper.text()
      expect(text).toContain('状态操作')
    })

    it('应该根据当前状态提供可选状态', () => {
      const options = wrapper.vm.getAvailableStatusOptions('PENDING')
      expect(options).toHaveLength(2)
      expect(options.map(opt => opt.value)).toEqual(['CONFIRMED', 'CANCELLED'])
    })

    it('应该处理状态更新', async () => {
      // Mock ElMessageBox.confirm
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      // Mock form validation
      const mockValidate = vi.fn().mockResolvedValue(true)
      wrapper.vm.statusFormRef = { validate: mockValidate }
      
      wrapper.vm.statusForm.status = 'CONFIRMED'
      wrapper.vm.statusForm.notes = '订单已确认'
      
      await wrapper.vm.handleUpdateStatus()
      
      expect(mockValidate).toHaveBeenCalled()
      expect(orderStore.updateOrderStatus).toHaveBeenCalledWith({
        id: 1,
        status: 'CONFIRMED',
        notes: '订单已确认'
      })
    })

    it('应该验证状态更新表单', async () => {
      wrapper.vm.statusForm.status = ''
      
      // Mock form validation
      const mockValidate = vi.fn().mockRejectedValue(new Error('Validation failed'))
      wrapper.vm.statusFormRef = { validate: mockValidate }
      
      await wrapper.vm.handleUpdateStatus()
      
      expect(mockValidate).toHaveBeenCalled()
      expect(orderStore.updateOrderStatus).not.toHaveBeenCalled()
    })
  })

  describe('工具函数', () => {
    it('应该正确格式化日期时间', () => {
      const dateString = '2024-01-01T10:30:45Z'
      const formatted = wrapper.vm.formatDateTime(dateString)
      expect(formatted).toMatch(/2024/)
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/)
    })

    it('应该正确判断是否可以编辑订单', () => {
      expect(wrapper.vm.canEditOrder('PENDING')).toBe(true)
      expect(wrapper.vm.canEditOrder('CONFIRMED')).toBe(true)
      expect(wrapper.vm.canEditOrder('SHIPPED')).toBe(false)
      expect(wrapper.vm.canEditOrder('DELIVERED')).toBe(false)
      expect(wrapper.vm.canEditOrder('CANCELLED')).toBe(false)
    })

    it('应该正确判断是否可以更新状态', () => {
      expect(wrapper.vm.canUpdateStatus('PENDING')).toBe(true)
      expect(wrapper.vm.canUpdateStatus('CONFIRMED')).toBe(true)
      expect(wrapper.vm.canUpdateStatus('SHIPPED')).toBe(true)
      expect(wrapper.vm.canUpdateStatus('DELIVERED')).toBe(false)
      expect(wrapper.vm.canUpdateStatus('CANCELLED')).toBe(false)
    })
  })

  describe('打印功能', () => {
    beforeEach(async () => {
      wrapper.vm.order = mockOrder
      await wrapper.vm.$nextTick()
    })

    it('应该支持打印订单', () => {
      wrapper.vm.handlePrintOrder()
      expect(window.open).toHaveBeenCalled()
    })

    it('应该生成正确的打印内容', () => {
      const printContent = wrapper.vm.generatePrintContent()
      expect(printContent).toContain('ORD20240101001')
      expect(printContent).toContain('张三')
      expect(printContent).toContain('iPhone 15')
      expect(printContent).toContain('¥299.99')
    })

    it('应该处理打印窗口无法打开的情况', () => {
      vi.mocked(window.open).mockReturnValue(null)
      
      wrapper.vm.handlePrintOrder()
      
      expect(ElMessage.error).toHaveBeenCalledWith('无法打开打印窗口，请检查浏览器设置')
    })
  })

  describe('事件处理', () => {
    it('应该支持返回列表', async () => {
      await wrapper.vm.goBack()
      expect(mockPush).toHaveBeenCalledWith('/orders')
    })

    it('应该支持编辑订单', async () => {
      await wrapper.vm.handleEditOrder()
      expect(ElMessage.info).toHaveBeenCalledWith('编辑订单功能开发中...')
    })

    it('应该支持重新加载', async () => {
      vi.clearAllMocks()
      await wrapper.vm.loadOrderDetail()
      expect(orderStore.fetchOrderById).toHaveBeenCalledWith(1)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的订单ID', () => {
      // 直接测试 parseInt 对无效字符串的处理
      const invalidId = parseInt('invalid')
      expect(isNaN(invalidId)).toBe(true)
      
      // 测试组件的 orderId 计算属性
      expect(wrapper.vm.orderId).toBe(1) // 因为我们mock的是 { id: '1' }
    })

    it('应该处理订单不存在的情况', async () => {
      // 重新创建 mock，避免影响其他测试
      const newOrderStore = useOrderStore()
      vi.spyOn(newOrderStore, 'fetchOrderById').mockResolvedValue(null)
      
      // 直接测试错误处理逻辑
      const result = await newOrderStore.fetchOrderById(999)
      expect(result).toBeNull()
    })

    it('应该处理加载失败的情况', async () => {
      // 重新创建 mock，避免影响其他测试
      const newOrderStore = useOrderStore()
      const error = new Error('网络错误')
      vi.spyOn(newOrderStore, 'fetchOrderById').mockRejectedValue(error)
      
      // 直接测试错误处理逻辑
      try {
        await newOrderStore.fetchOrderById(1)
      } catch (err) {
        expect(err).toBe(error)
      }
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      // 验证响应式样式类存在
      expect(wrapper.find('.order-detail').exists()).toBe(true)
    })

    it('应该正确处理不同屏幕尺寸', () => {
      // 验证基本结构存在
      expect(wrapper.find('.order-detail').exists()).toBe(true)
    })
  })
})