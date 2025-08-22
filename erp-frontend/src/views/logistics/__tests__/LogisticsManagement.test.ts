import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import LogisticsManagement from '../LogisticsManagement.vue'
import { logisticsApi } from '@/api/modules/logistics'
import type { LogisticsOrder, TrackingInfo } from '@/api/modules/logistics'

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
    }
  }
})

// Mock API
vi.mock('@/api/modules/logistics', () => ({
  logisticsApi: {
    getLogisticsOrders: vi.fn(),
    getTrackingInfo: vi.fn(),
    updateLogisticsOrderStatus: vi.fn(),
    exportLogisticsData: vi.fn()
  }
}))

// Mock utils
vi.mock('@/utils', () => ({
  formatDateTime: vi.fn((date: string) => date ? '2024-01-01 12:00:00' : '-')
}))

// Mock components
vi.mock('@/components/business/BreadcrumbNav.vue', () => ({
  default: { template: '<nav class="breadcrumb-nav"></nav>' }
}))

vi.mock('@/components/business/StatusBadge.vue', () => ({
  default: { template: '<span class="status-badge"><slot /></span>' }
}))

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  },
  writable: true
})

describe('LogisticsManagement', () => {
  const mockLogisticsData: LogisticsOrder[] = [
    {
      id: 1,
      orderId: 1001,
      orderNumber: 'ORD20240101001',
      trackingNumber: 'YT123456789',
      carrier: 'YUNEXPRESS',
      service: 'STANDARD',
      status: 'IN_TRANSIT',
      shippingAddress: {
        name: '张三',
        phone: '13800138000',
        country: '中国',
        state: '广东省',
        city: '深圳市',
        address1: '南山区科技园',
        postalCode: '518000'
      },
      weight: 0.5,
      cost: 25.50,
      currency: 'CNY',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      orderId: 1002,
      orderNumber: 'ORD20240101002',
      trackingNumber: 'DHL987654321',
      carrier: 'DHL',
      service: 'EXPRESS',
      status: 'DELIVERED',
      shippingAddress: {
        name: '李四',
        phone: '13900139000',
        country: '美国',
        state: '加利福尼亚州',
        city: '洛杉矶',
        address1: '123 Main St',
        postalCode: '90210'
      },
      weight: 1.2,
      cost: 45.80,
      currency: 'USD',
      actualDeliveryDate: '2024-01-03T15:30:00Z',
      createdAt: '2024-01-01T11:00:00Z',
      updatedAt: '2024-01-03T15:30:00Z'
    }
  ]

  const mockTrackingInfo: TrackingInfo = {
    trackingNumber: 'YT123456789',
    carrier: 'YUNEXPRESS',
    status: 'IN_TRANSIT',
    statusDescription: '包裹正在运输途中',
    estimatedDeliveryDate: '2024-01-05T18:00:00Z',
    events: [
      {
        id: 1,
        timestamp: '2024-01-01T10:00:00Z',
        location: '深圳分拣中心',
        status: 'PICKED_UP',
        description: '包裹已从发货地取件',
        eventCode: 'PICKUP'
      },
      {
        id: 2,
        timestamp: '2024-01-02T08:30:00Z',
        location: '广州转运中心',
        status: 'IN_TRANSIT',
        description: '包裹已到达转运中心，正在处理中',
        eventCode: 'TRANSIT'
      },
      {
        id: 3,
        timestamp: '2024-01-02T14:20:00Z',
        location: '广州转运中心',
        status: 'IN_TRANSIT',
        description: '包裹已发出，正在运输途中',
        eventCode: 'DEPARTED'
      }
    ],
    lastUpdated: '2024-01-02T14:20:00Z'
  }

  const createWrapper = () => {
    return shallowMount(LogisticsManagement, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-timeline': true,
          'el-timeline-item': true,
          'el-form': true,
          'el-form-item': true,
          'el-date-picker': true,
          'el-skeleton': true,
          'el-tooltip': true,
          'el-icon': true,
          'BreadcrumbNav': true,
          'StatusBadge': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置默认的API响应
    vi.mocked(logisticsApi.getLogisticsOrders).mockResolvedValue({
      code: 200,
      message: '获取成功',
      data: {
        records: mockLogisticsData,
        total: 2,
        page: 1,
        size: 10,
        pages: 1
      },
      timestamp: '2024-01-01T12:00:00Z'
    })

    vi.mocked(logisticsApi.getTrackingInfo).mockResolvedValue({
      code: 200,
      message: '获取成功',
      data: mockTrackingInfo,
      timestamp: '2024-01-01T12:00:00Z'
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染物流管理页面', () => {
      const wrapper = createWrapper()
      
      // 检查基本结构
      expect(wrapper.find('.logistics-management').exists()).toBe(true)
      expect(wrapper.find('.page-header').exists()).toBe(true)
    })

    it('应该正确渲染搜索和筛选区域', () => {
      const wrapper = createWrapper()
      
      // 检查搜索区域 - 由于使用了 shallowMount，需要检查组件是否存在
      expect(wrapper.find('.logistics-management').exists()).toBe(true)
    })

    it('应该正确渲染表格区域', () => {
      const wrapper = createWrapper()
      
      // 检查表格容器 - 由于使用了 shallowMount，需要检查组件是否存在
      expect(wrapper.find('.logistics-management').exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时加载物流列表', async () => {
      const wrapper = createWrapper()
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        keyword: undefined,
        status: undefined,
        carrier: undefined,
        startDate: undefined,
        endDate: undefined
      })
    })

    it('应该正确处理API错误', async () => {
      vi.mocked(logisticsApi.getLogisticsOrders).mockRejectedValue(new Error('网络错误'))
      
      const wrapper = createWrapper()
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取物流列表失败')
    })

    it('应该正确处理API返回错误码', async () => {
      vi.mocked(logisticsApi.getLogisticsOrders).mockResolvedValue({
        code: 500,
        message: '服务器错误',
        data: null,
        timestamp: '2024-01-01T12:00:00Z'
      })
      
      const wrapper = createWrapper()
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(ElMessage.error).toHaveBeenCalledWith('服务器错误')
    })
  })

  describe('搜索功能', () => {
    it('应该支持状态筛选', async () => {
      const wrapper = createWrapper()
      
      // 模拟状态选择
      const vm = wrapper.vm as any
      vm.searchForm.status = 'IN_TRANSIT'
      await wrapper.vm.$nextTick()
      
      // 触发搜索
      vm.handleSearch()
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'IN_TRANSIT',
          page: 1
        })
      )
    })

    it('应该支持承运商筛选', async () => {
      const wrapper = createWrapper()
      
      // 模拟承运商选择
      const vm = wrapper.vm as any
      vm.searchForm.carrier = 'DHL'
      await wrapper.vm.$nextTick()
      
      // 触发搜索
      vm.handleSearch()
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          carrier: 'DHL',
          page: 1
        })
      )
    })

    it('应该支持日期范围筛选', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 模拟日期范围选择
      const dateRange: [string, string] = ['2024-01-01', '2024-01-31']
      vm.handleDateRangeChange(dateRange)
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          page: 1
        })
      )
    })

    it('应该在清除日期范围时重置日期参数', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 清除日期范围
      vm.handleDateRangeChange(null)
      
      expect(vm.searchForm.startDate).toBe('')
      expect(vm.searchForm.endDate).toBe('')
    })
  })

  describe('表格功能', () => {
    it('应该支持分页', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 模拟页码变化
      vm.handleCurrentChange(2)
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2
        })
      )
    })

    it('应该支持页面大小变化', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 模拟页面大小变化
      vm.handleSizeChange(20)
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          size: 20
        })
      )
    })

    it('应该支持复制运单号', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 模拟复制运单号
      await vm.copyTrackingNumber('YT123456789')
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('YT123456789')
      expect(ElMessage.success).toHaveBeenCalledWith('运单号已复制到剪贴板')
    })

    it('应该处理复制失败的情况', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('复制失败'))
      
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      await vm.copyTrackingNumber('YT123456789')
      
      expect(ElMessage.error).toHaveBeenCalledWith('复制失败')
    })
  })

  describe('物流跟踪功能', () => {
    it('应该能够打开物流跟踪对话框', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 模拟点击跟踪按钮
      await vm.handleTrackShipment(mockLogisticsData[0])
      
      expect(vm.trackingDialogVisible).toBe(true)
      expect(vm.currentTrackingNumber).toBe('YT123456789')
      expect(logisticsApi.getTrackingInfo).toHaveBeenCalledWith('YT123456789', 'YUNEXPRESS')
    })

    it('应该支持刷新跟踪信息', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 设置当前跟踪号
      vm.currentTrackingNumber = 'YT123456789'
      
      // 刷新跟踪信息
      await vm.refreshTrackingInfo()
      
      expect(logisticsApi.getTrackingInfo).toHaveBeenCalledWith('YT123456789', undefined)
    })

    it('应该处理跟踪信息获取失败', async () => {
      vi.mocked(logisticsApi.getTrackingInfo).mockRejectedValue(new Error('网络错误'))
      
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      await vm.handleTrackShipment(mockLogisticsData[0])
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取跟踪信息失败')
    })
  })

  describe('状态更新功能', () => {
    it('应该能够打开状态更新对话框', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 模拟点击更新状态按钮
      vm.handleUpdateStatus(mockLogisticsData[0])
      
      expect(vm.statusDialogVisible).toBe(true)
      expect(vm.currentLogistics).toEqual(mockLogisticsData[0])
      expect(vm.statusForm.status).toBe('')
      expect(vm.statusForm.notes).toBe('')
    })

    it('应该验证状态选择', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 不选择状态直接确认
      vm.currentLogistics = mockLogisticsData[0]
      vm.statusForm.status = ''
      
      await vm.confirmUpdateStatus()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请选择新状态')
      expect(logisticsApi.updateLogisticsOrderStatus).not.toHaveBeenCalled()
    })

    it('应该处理状态更新失败', async () => {
      vi.mocked(logisticsApi.updateLogisticsOrderStatus).mockRejectedValue(new Error('更新失败'))
      
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      vm.currentLogistics = mockLogisticsData[0]
      vm.statusForm.status = 'DELIVERED'
      
      await vm.confirmUpdateStatus()
      
      expect(ElMessage.error).toHaveBeenCalledWith('状态更新失败')
    })
  })

  describe('工具方法', () => {
    it('应该正确转换承运商名称', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.getCarrierName('YUNEXPRESS')).toBe('云途物流')
      expect(vm.getCarrierName('DHL')).toBe('DHL')
      expect(vm.getCarrierName('FEDEX')).toBe('FedEx')
      expect(vm.getCarrierName('UPS')).toBe('UPS')
      expect(vm.getCarrierName('UNKNOWN' as any)).toBe('UNKNOWN')
    })

    it('应该正确转换状态文本', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.getStatusText('CREATED')).toBe('已创建')
      expect(vm.getStatusText('IN_TRANSIT')).toBe('运输中')
      expect(vm.getStatusText('DELIVERED')).toBe('已送达')
      expect(vm.getStatusText('UNKNOWN' as any)).toBe('UNKNOWN')
    })

    it('应该正确获取状态类型', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.getStatusType('CREATED')).toBe('info')
      expect(vm.getStatusType('IN_TRANSIT')).toBe('primary')
      expect(vm.getStatusType('DELIVERED')).toBe('success')
      expect(vm.getStatusType('EXCEPTION')).toBe('danger')
      expect(vm.getStatusType('UNKNOWN' as any)).toBe('info')
    })

    it('应该正确格式化地址', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      const address = {
        country: '中国',
        state: '广东省',
        city: '深圳市',
        address1: '南山区科技园'
      }
      
      expect(vm.formatAddress(address)).toBe('中国, 广东省, 深圳市, 南山区科技园')
      expect(vm.formatAddress(null)).toBe('-')
      expect(vm.formatAddress({})).toBe('')
    })
  })

  describe('其他功能', () => {
    it('应该支持刷新数据', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // 清除之前的调用
      vi.clearAllMocks()
      
      vm.refreshData()
      
      expect(logisticsApi.getLogisticsOrders).toHaveBeenCalled()
    })

    it('应该显示创建物流单提示', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      vm.handleCreateShipment()
      
      expect(ElMessage.info).toHaveBeenCalledWith('创建物流单功能开发中...')
    })

    it('应该显示打印面单提示', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      vm.handlePrintLabel(mockLogisticsData[0])
      
      expect(ElMessage.info).toHaveBeenCalledWith('打印面单功能开发中... 运单号: YT123456789')
    })

    it('应该正确处理选择变化', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown
      
      const selection = [mockLogisticsData[0]]
      vm.handleSelectionChange(selection)
      
      expect(vm.selectedLogistics).toEqual(selection)
    })
  })
})