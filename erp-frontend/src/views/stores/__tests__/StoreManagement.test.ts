import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import StoreManagement from '../StoreManagement.vue'
import { platformApi } from '@/api/modules/platform'

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock API
vi.mock('@/api/modules/platform', () => ({
  platformApi: {
    getStores: vi.fn(),
    getPlatforms: vi.fn(),
    createStore: vi.fn(),
    updateStore: vi.fn(),
    deleteStore: vi.fn(),
    activateStore: vi.fn(),
    deactivateStore: vi.fn(),
    testStoreConnection: vi.fn()
  }
}))

// Mock 工具函数
vi.mock('@/utils', () => ({
  formatDateTime: vi.fn((date) => date)
}))

// Mock 组件
vi.mock('@/components/business/BreadcrumbNav.vue', () => ({
  default: { template: '<div>BreadcrumbNav</div>' }
}))

vi.mock('@/components/business/SearchFilter.vue', () => ({
  default: { 
    template: '<div>SearchFilter</div>',
    emits: ['search', 'reset']
  }
}))

vi.mock('@/components/common/BaseTable.vue', () => ({
  default: { 
    template: '<div>BaseTable</div>',
    emits: ['selection-change', 'page-change', 'size-change']
  }
}))

vi.mock('@/components/business/StatusBadge.vue', () => ({
  default: { template: '<div>StatusBadge</div>' }
}))

describe('StoreManagement', () => {
  const mockStores = [
    {
      id: 1,
      storeName: '测试店铺1',
      platform: 'WALMART',
      platformId: 1,
      platformStoreId: 'WM001',
      status: 'ACTIVE',
      apiCredentials: { clientId: 'test123' },
      lastSyncTime: '2024-01-01T12:00:00Z',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z'
    },
    {
      id: 2,
      storeName: '测试店铺2',
      platform: 'AMAZON',
      platformId: 2,
      platformStoreId: 'AMZ002',
      status: 'INACTIVE',
      apiCredentials: null,
      lastSyncTime: null,
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ]

  const mockPlatforms = [
    {
      id: 1,
      name: '沃尔玛平台',
      type: 'WALMART',
      isEnabled: true
    },
    {
      id: 2,
      name: '亚马逊平台',
      type: 'AMAZON',
      isEnabled: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置默认的 API 响应
    vi.mocked(platformApi.getStores).mockResolvedValue({
      data: {
        list: mockStores,
        total: 2,
        page: 1,
        size: 10,
        pages: 1
      }
    } as any)

    vi.mocked(platformApi.getPlatforms).mockResolvedValue({
      data: {
        list: mockPlatforms,
        total: 2,
        page: 1,
        size: 100,
        pages: 1
      }
    } as any)
  })

  it('应该正确渲染店铺管理页面', async () => {
    const wrapper = mount(StoreManagement)
    
    expect(wrapper.find('.store-management').exists()).toBe(true)
    expect(wrapper.find('.page-title').text()).toBe('店铺管理')
  })

  it('应该在组件挂载时获取店铺列表和平台选项', async () => {
    mount(StoreManagement)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(platformApi.getStores).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      keyword: undefined,
      platformId: undefined,
      status: undefined
    })
    
    expect(platformApi.getPlatforms).toHaveBeenCalledWith({
      page: 1,
      size: 100
    })
  })

  it('应该正确处理搜索功能', async () => {
    const wrapper = mount(StoreManagement)
    
    // 模拟搜索
    const searchFilter = wrapper.findComponent({ name: 'SearchFilter' })
    await searchFilter.vm.$emit('search')
    
    expect(platformApi.getStores).toHaveBeenCalledTimes(2) // 初始加载 + 搜索
  })

  it('应该正确处理重置搜索', async () => {
    const wrapper = mount(StoreManagement)
    
    // 模拟重置搜索
    const searchFilter = wrapper.findComponent({ name: 'SearchFilter' })
    await searchFilter.vm.$emit('reset')
    
    expect(platformApi.getStores).toHaveBeenCalledTimes(2) // 初始加载 + 重置
  })

  it('应该正确处理分页变化', async () => {
    const wrapper = mount(StoreManagement)
    
    // 模拟页码变化
    const baseTable = wrapper.findComponent({ name: 'BaseTable' })
    await baseTable.vm.$emit('page-change', 2)
    
    expect(platformApi.getStores).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    )
  })

  it('应该正确处理页面大小变化', async () => {
    const wrapper = mount(StoreManagement)
    
    // 模拟页面大小变化
    const baseTable = wrapper.findComponent({ name: 'BaseTable' })
    await baseTable.vm.$emit('size-change', 20)
    
    expect(platformApi.getStores).toHaveBeenCalledWith(
      expect.objectContaining({ 
        page: 1, // 应该重置到第一页
        size: 20 
      })
    )
  })

  it('应该正确处理选择变化', async () => {
    const wrapper = mount(StoreManagement)
    
    // 模拟选择变化
    const baseTable = wrapper.findComponent({ name: 'BaseTable' })
    await baseTable.vm.$emit('selection-change', [mockStores[0]])
    
    // 验证选中状态
    expect(wrapper.vm.selectedStores).toEqual([mockStores[0]])
  })

  it('应该正确创建新店铺', async () => {
    vi.mocked(platformApi.createStore).mockResolvedValue({ data: mockStores[0] } as any)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // Mock form ref
    wrapper.vm.$refs.storeFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn()
    }
    
    // 打开添加对话框
    wrapper.vm.isEditMode = false
    wrapper.vm.storeDialogVisible = true
    
    // 填写表单
    wrapper.vm.storeForm.storeName = '新店铺'
    wrapper.vm.storeForm.platformId = 1
    wrapper.vm.storeForm.platformStoreId = 'NEW001'
    wrapper.vm.storeForm.status = 'ACTIVE'
    
    // 提交表单
    await wrapper.vm.handleStoreSubmit()
    
    expect(platformApi.createStore).toHaveBeenCalledWith({
      storeName: '新店铺',
      platformId: 1,
      platformStoreId: 'NEW001',
      status: 'ACTIVE',
      apiCredentials: {}
    })
    
    expect(ElMessage.success).toHaveBeenCalledWith('店铺创建成功')
  })

  it('应该正确更新店铺信息', async () => {
    vi.mocked(platformApi.updateStore).mockResolvedValue({ data: mockStores[0] } as any)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // Mock form ref
    wrapper.vm.$refs.storeFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn()
    }
    
    // 设置编辑模式和表单数据
    wrapper.vm.isEditMode = true
    wrapper.vm.currentStore = mockStores[0]
    wrapper.vm.storeDialogVisible = true
    
    Object.assign(wrapper.vm.storeForm, {
      id: 1,
      storeName: '更新后的店铺',
      platformId: 1,
      platformStoreId: 'WM001',
      status: 'ACTIVE',
      apiCredentials: { clientId: 'test123' }
    })
    
    // 提交表单
    await wrapper.vm.handleStoreSubmit()
    
    expect(platformApi.updateStore).toHaveBeenCalledWith({
      id: 1,
      storeName: '更新后的店铺',
      platformStoreId: 'WM001',
      status: 'ACTIVE',
      apiCredentials: { clientId: 'test123' }
    })
    
    expect(ElMessage.success).toHaveBeenCalledWith('店铺更新成功')
  })

  it('应该正确删除店铺', async () => {
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)
    vi.mocked(platformApi.deleteStore).mockResolvedValue({ data: null } as any)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // 删除店铺
    await wrapper.vm.deleteStore(mockStores[0])
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除店铺"测试店铺1"吗？此操作不可恢复。',
      '确认删除',
      expect.any(Object)
    )
    
    expect(platformApi.deleteStore).toHaveBeenCalledWith(1)
    expect(ElMessage.success).toHaveBeenCalledWith('店铺删除成功')
  })

  it('应该正确切换店铺状态', async () => {
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)
    vi.mocked(platformApi.deactivateStore).mockResolvedValue({ data: null } as any)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    const store = { ...mockStores[0], statusLoading: false }
    
    // 停用店铺
    await wrapper.vm.toggleStoreStatus(store)
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要停用店铺"测试店铺1"吗？',
      '确认操作',
      expect.any(Object)
    )
    
    expect(platformApi.deactivateStore).toHaveBeenCalledWith(1)
    expect(store.status).toBe('INACTIVE')
    expect(ElMessage.success).toHaveBeenCalledWith('店铺已停用')
  })

  it('应该正确测试店铺连接', async () => {
    const mockTestResult = {
      success: true,
      message: '连接成功',
      responseTime: 150
    }
    
    vi.mocked(platformApi.testStoreConnection).mockResolvedValue({ data: mockTestResult } as any)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    const store = { ...mockStores[0], testLoading: false }
    
    // 测试连接
    await wrapper.vm.testStoreConnection(store)
    
    expect(platformApi.testStoreConnection).toHaveBeenCalledWith(1)
    expect(ElMessage.success).toHaveBeenCalledWith('连接测试成功 (150ms)')
  })

  it('应该正确处理批量操作', async () => {
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)
    vi.mocked(platformApi.activateStore).mockResolvedValue({ data: null } as any)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // 设置选中的店铺
    wrapper.vm.selectedStores = [mockStores[0], mockStores[1]]
    
    // 批量启用
    await wrapper.vm.handleBatchOperation('activate')
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要批量启用选中的 2 个店铺吗？',
      '确认批量启用',
      expect.any(Object)
    )
    
    expect(platformApi.activateStore).toHaveBeenCalledTimes(2)
    expect(ElMessage.success).toHaveBeenCalledWith('批量启用成功')
  })

  it('应该正确处理平台变化', async () => {
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // 设置初始API凭证
    wrapper.vm.storeForm.apiCredentials = { clientId: 'test' }
    
    // 切换平台
    await wrapper.vm.handlePlatformChange()
    
    // 验证API凭证被清空
    expect(wrapper.vm.storeForm.apiCredentials).toEqual({})
  })

  it('应该正确获取平台名称', () => {
    const wrapper = mount(StoreManagement)
    
    expect(wrapper.vm.getPlatformName('WALMART')).toBe('沃尔玛')
    expect(wrapper.vm.getPlatformName('AMAZON')).toBe('亚马逊')
    expect(wrapper.vm.getPlatformName('EBAY')).toBe('eBay')
    expect(wrapper.vm.getPlatformName('SHOPIFY')).toBe('Shopify')
    expect(wrapper.vm.getPlatformName('UNKNOWN')).toBe('UNKNOWN')
  })

  it('应该正确获取平台标签类型', () => {
    const wrapper = mount(StoreManagement)
    
    expect(wrapper.vm.getPlatformTagType('WALMART')).toBe('primary')
    expect(wrapper.vm.getPlatformTagType('AMAZON')).toBe('warning')
    expect(wrapper.vm.getPlatformTagType('EBAY')).toBe('success')
    expect(wrapper.vm.getPlatformTagType('SHOPIFY')).toBe('info')
    expect(wrapper.vm.getPlatformTagType('UNKNOWN')).toBe('default')
  })

  it('应该正确获取状态类型', () => {
    const wrapper = mount(StoreManagement)
    
    expect(wrapper.vm.getStatusType('ACTIVE')).toBe('success')
    expect(wrapper.vm.getStatusType('INACTIVE')).toBe('danger')
  })

  it('应该正确识别密码字段', () => {
    const wrapper = mount(StoreManagement)
    
    expect(wrapper.vm.isPasswordField('clientSecret')).toBe(true)
    expect(wrapper.vm.isPasswordField('secretAccessKey')).toBe(true)
    expect(wrapper.vm.isPasswordField('certId')).toBe(true)
    expect(wrapper.vm.isPasswordField('token')).toBe(true)
    expect(wrapper.vm.isPasswordField('accessToken')).toBe(true)
    expect(wrapper.vm.isPasswordField('apiSecret')).toBe(true)
    expect(wrapper.vm.isPasswordField('clientId')).toBe(false)
    expect(wrapper.vm.isPasswordField('apiKey')).toBe(false)
  })

  it('应该正确处理API错误', async () => {
    const error = new Error('网络错误')
    vi.mocked(platformApi.getStores).mockRejectedValue(error)
    
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // 等待错误处理
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(ElMessage.error).toHaveBeenCalledWith('获取店铺列表失败')
  })

  it('应该正确处理表单验证错误', async () => {
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // 模拟表单验证失败
    const mockValidate = vi.fn().mockRejectedValue(new Error('验证失败'))
    
    // 直接设置 storeFormRef 的值
    wrapper.vm.storeFormRef = { 
      validate: mockValidate,
      resetFields: vi.fn()
    }
    
    // 设置对话框状态
    wrapper.vm.isEditMode = false
    wrapper.vm.storeDialogVisible = true
    
    // 不填写必填字段直接提交
    wrapper.vm.storeForm.storeName = ''
    
    await wrapper.vm.handleStoreSubmit()
    
    expect(mockValidate).toHaveBeenCalled()
    expect(platformApi.createStore).not.toHaveBeenCalled()
  })

  it('应该正确显示店铺详情', async () => {
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // 显示店铺详情
    await wrapper.vm.showStoreDetail(mockStores[0])
    
    expect(wrapper.vm.detailDialogVisible).toBe(true)
    expect(wrapper.vm.currentStore).toEqual(mockStores[0])
  })

  it('应该正确重置表单', async () => {
    const wrapper = mount(StoreManagement)
    await wrapper.vm.$nextTick()
    
    // Mock form ref
    const mockResetFields = vi.fn()
    wrapper.vm.storeFormRef = {
      validate: vi.fn(),
      resetFields: mockResetFields
    }
    
    // 设置表单数据
    wrapper.vm.storeForm.storeName = '测试店铺'
    wrapper.vm.storeForm.platformId = 1
    
    // 重置表单
    await wrapper.vm.resetStoreForm()
    
    expect(wrapper.vm.storeForm.storeName).toBe('')
    expect(wrapper.vm.storeForm.platformId).toBe(0)
    expect(mockResetFields).toHaveBeenCalled()
  })
})