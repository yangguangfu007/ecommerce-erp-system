import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick } from 'vue'
import ShippingLabels from '../ShippingLabels.vue'
import { logisticsApi } from '@/api/modules/logistics'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock logistics API
vi.mock('@/api/modules/logistics', () => ({
  logisticsApi: {
    getLogisticsOrders: vi.fn(),
    getCarrierConfigs: vi.fn(),
    createLabel: vi.fn(),
    batchCreateLabels: vi.fn(),
    printLabels: vi.fn(),
    downloadLabel: vi.fn()
  }
}))

// Mock data
const mockOrders = [
  {
    id: 1,
    orderId: 1001,
    orderNumber: 'ORD20240101001',
    trackingNumber: '',
    carrier: 'UPS',
    service: 'STANDARD',
    status: 'CREATED',
    shippingAddress: {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      country: 'US',
      state: 'NY',
      city: 'New York',
      address1: '123 Main St',
      address2: '',
      postalCode: '10001',
      company: ''
    },
    returnAddress: {
      name: 'ERP System',
      phone: '400-123-4567',
      email: 'support@erp.com',
      country: 'US',
      state: 'CA',
      city: 'Los Angeles',
      address1: '456 Business Ave',
      address2: '',
      postalCode: '90001',
      company: 'ERP Company'
    },
    weight: 1.5,
    dimensions: {
      length: 20,
      width: 15,
      height: 10,
      unit: 'cm'
    },
    declaredValue: 299.99,
    currency: 'USD',
    cost: 15.99,
    labelUrl: '',
    labelFormat: 'PDF',
    estimatedDeliveryDate: '2024-01-05T18:00:00Z',
    actualDeliveryDate: '',
    notes: '',
    metadata: {},
    createdAt: '2024-01-01T10:05:00Z',
    updatedAt: '2024-01-01T10:05:00Z'
  },
  {
    id: 2,
    orderId: 1002,
    orderNumber: 'ORD20240101002',
    trackingNumber: 'TRK123456789',
    carrier: 'UPS',
    service: 'STANDARD',
    status: 'IN_TRANSIT',
    shippingAddress: {
      name: 'Jane Smith',
      phone: '+1234567891',
      email: 'jane@example.com',
      country: 'US',
      state: 'CA',
      city: 'Los Angeles',
      address1: '456 Oak Ave',
      address2: '',
      postalCode: '90002',
      company: ''
    },
    returnAddress: {
      name: 'ERP System',
      phone: '400-123-4567',
      email: 'support@erp.com',
      country: 'US',
      state: 'CA',
      city: 'Los Angeles',
      address1: '456 Business Ave',
      address2: '',
      postalCode: '90001',
      company: 'ERP Company'
    },
    weight: 1.2,
    dimensions: {
      length: 18,
      width: 12,
      height: 8,
      unit: 'cm'
    },
    declaredValue: 199.99,
    currency: 'USD',
    cost: 12.99,
    labelUrl: 'https://example.com/label.pdf',
    labelFormat: 'PDF',
    estimatedDeliveryDate: '2024-01-04T18:00:00Z',
    actualDeliveryDate: '',
    notes: '',
    metadata: {},
    createdAt: '2024-01-01T10:05:00Z',
    updatedAt: '2024-01-01T11:00:00Z'
  }
]

const mockCarriers = [
  {
    carrier: 'UPS',
    name: 'UPS',
    apiEndpoint: 'https://api.ups.com',
    credentials: {
      apiKey: 'test-key',
      accountNumber: '123456'
    },
    services: [
      { code: 'STANDARD', name: '标准服务', type: 'STANDARD', enabled: true },
      { code: 'EXPRESS', name: '快递服务', type: 'EXPRESS', enabled: true }
    ],
    settings: {
      defaultService: 'STANDARD',
      autoTracking: true,
      labelFormat: 'PDF',
      testMode: true
    },
    status: 'ACTIVE'
  },
  {
    carrier: 'FEDEX',
    name: 'FedEx',
    apiEndpoint: 'https://api.fedex.com',
    credentials: {
      apiKey: 'test-key',
      accountNumber: '789012'
    },
    services: [
      { code: 'STANDARD', name: '标准服务', type: 'STANDARD', enabled: true },
      { code: 'EXPRESS', name: '快递服务', type: 'EXPRESS', enabled: true },
      { code: 'OVERNIGHT', name: '隔夜服务', type: 'PRIORITY', enabled: true }
    ],
    settings: {
      defaultService: 'STANDARD',
      autoTracking: true,
      labelFormat: 'PDF',
      testMode: true
    },
    status: 'ACTIVE'
  }
]

const mockTemplates = [
  {
    id: 1,
    name: '标准模板',
    carrierCode: 'UPS',
    templateType: 'STANDARD',
    width: 100,
    height: 150,
    format: 'PDF',
    isDefault: true,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '热敏模板',
    carrierCode: 'UPS',
    templateType: 'THERMAL',
    width: 100,
    height: 100,
    format: 'PNG',
    isDefault: false,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('ShippingLabels', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props = {}) => {
    return mount(ShippingLabels, {
      props,
      global: {
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-row': true,
          'el-col': true,
          'el-card': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-input-number': true,
          'el-date-picker': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-icon': true
        }
      }
    })
  }

  beforeEach(() => {
    // Setup API mocks
    vi.mocked(logisticsApi.getLogisticsOrders).mockResolvedValue({
      data: {
        records: mockOrders,
        total: mockOrders.length,
        page: 1,
        size: 20,
        pages: 1
      }
    } as any)

    vi.mocked(logisticsApi.getCarrierConfigs).mockResolvedValue({
      data: mockCarriers
    } as any)

    vi.mocked(logisticsApi.createLabel).mockResolvedValue({
      data: {
        logisticsOrderId: 1,
        trackingNumber: 'TRK123456789',
        labelUrl: 'https://example.com/label.pdf',
        cost: 15.99,
        currency: 'USD',
        estimatedDeliveryDate: '2024-01-05T18:00:00Z'
      }
    } as any)

    vi.mocked(logisticsApi.batchCreateLabels).mockResolvedValue({
      data: [
        {
          logisticsOrderId: 1,
          trackingNumber: 'TRK123456789',
          labelUrl: 'https://example.com/label1.pdf',
          cost: 15.99,
          currency: 'USD'
        },
        {
          logisticsOrderId: 2,
          trackingNumber: 'TRK123456790',
          labelUrl: 'https://example.com/label2.pdf',
          cost: 12.99,
          currency: 'USD'
        }
      ]
    } as any)

    vi.mocked(logisticsApi.printLabels).mockResolvedValue({
      data: { printJobId: 'job-123' }
    } as any)

    vi.mocked(logisticsApi.downloadLabel).mockResolvedValue({
      data: { downloadUrl: 'https://example.com/download/label.pdf' }
    } as unknown)
  })

  afterEach(() => {
    vi.clearAllMocks()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('应该正确渲染面单生成页面', async () => {
    wrapper = createWrapper()
    await nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm).toBeDefined()
  })

  it('应该能够加载订单数据', async () => {
    wrapper = createWrapper()
    await nextTick()

    expect(logisticsApi.getLogisticsOrders).toHaveBeenCalled()
    expect(logisticsApi.getCarrierConfigs).toHaveBeenCalled()
    expect(wrapper.vm.orders).toHaveLength(2)
    expect(wrapper.vm.carriers).toHaveLength(2)
  })

  it('应该能够搜索订单', async () => {
    wrapper = createWrapper()
    await nextTick()

    // 设置搜索关键词
    wrapper.vm.searchKeyword = 'ORD20240101001'
    await wrapper.vm.handleSearch()

    expect(logisticsApi.getLogisticsOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'ORD20240101001'
      })
    )
  })

  it('应该能够显示生成面单对话框', async () => {
    wrapper = createWrapper()
    await nextTick()

    // 点击生成面单按钮
    wrapper.vm.showGenerateDialog()

    expect(wrapper.vm.generateDialogVisible).toBe(true)
    expect(wrapper.vm.isBatchMode).toBe(false)
  })

  it('应该能够生成单个面单', async () => {
    wrapper = createWrapper()
    await nextTick()

    // 设置表单数据
    wrapper.vm.generateForm.carrier = 'UPS'
    wrapper.vm.generateForm.template = '1'
    wrapper.vm.selectedOrders = [mockOrders[0]]

    // 生成面单
    await wrapper.vm.confirmGenerate()

    expect(logisticsApi.createLabel).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: mockOrders[0].orderId,
        carrier: 'UPS'
      })
    )
    expect(ElMessage.success).toHaveBeenCalledWith('面单生成成功')
  })

  it('应该能够批量生成面单', async () => {
    wrapper = createWrapper()
    await nextTick()

    // 选择多个订单
    wrapper.vm.selectedOrders = mockOrders
    wrapper.vm.batchGenerate()

    expect(wrapper.vm.generateDialogVisible).toBe(true)
    expect(wrapper.vm.isBatchMode).toBe(true)

    // 设置表单数据并生成
    wrapper.vm.generateForm.carrier = 'UPS'
    wrapper.vm.generateForm.template = '1'
    await wrapper.vm.confirmGenerate()

    expect(logisticsApi.batchCreateLabels).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('成功生成 2 个面单')
  })

  it('应该能够预览面单', async () => {
    wrapper = createWrapper()
    await nextTick()

    const mockOrder = mockOrders[1]
    wrapper.vm.previewLabelFunc(mockOrder)

    expect(wrapper.vm.previewDialogVisible).toBe(true)
    expect(wrapper.vm.previewLabel).toStrictEqual(mockOrder)
  })

  it('应该能够打印面单', async () => {
    wrapper = createWrapper()
    await nextTick()

    const mockOrder = mockOrders[1]
    await wrapper.vm.printLabel(mockOrder)

    expect(logisticsApi.printLabels).toHaveBeenCalledWith([mockOrder.id])
    expect(ElMessage.success).toHaveBeenCalledWith('打印任务已发送')
  })

  it('应该正确格式化地址', async () => {
    wrapper = createWrapper()
    await nextTick()

    const address = {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      country: 'US',
      state: 'NY',
      city: 'New York',
      address1: '123 Main St',
      address2: '',
      postalCode: '10001',
      company: ''
    }

    const formatted = wrapper.vm.formatAddress(address)
    expect(formatted).toBe('NY New York 123 Main St ')
  })

  it('应该正确获取订单状态样式', async () => {
    wrapper = createWrapper()
    await nextTick()

    expect(wrapper.vm.getOrderStatusType('CREATED')).toBe('info')
    expect(wrapper.vm.getOrderStatusType('IN_TRANSIT')).toBe('warning')
    expect(wrapper.vm.getOrderStatusType('DELIVERED')).toBe('success')
  })

  it('应该正确获取面单状态样式', async () => {
    wrapper = createWrapper()
    await nextTick()

    expect(wrapper.vm.getLabelStatusType('CREATED')).toBe('success')
    expect(wrapper.vm.getLabelStatusType('IN_TRANSIT')).toBe('warning')
    expect(wrapper.vm.getLabelStatusType('EXCEPTION')).toBe('danger')
  })
})