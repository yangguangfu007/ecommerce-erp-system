import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductImport from '../ProductImport.vue'
import { productApi } from '@/api/modules/product'
import { createRouter, createWebHistory } from 'vue-router'

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

// Mock 产品 API
vi.mock('@/api/modules/product', () => ({
  productApi: {
    getImportTemplate: vi.fn(),
    validateImportData: vi.fn(),
    importProducts: vi.fn()
  }
}))

// Mock 路由
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/products', component: { template: '<div>Products</div>' } }
  ]
})

// Mock 组件
vi.mock('@/components/business/BreadcrumbNav.vue', () => ({
  default: {
    name: 'BreadcrumbNav',
    template: '<div class="breadcrumb-nav">{{ items }}</div>',
    props: ['items']
  }
}))

vi.mock('@/components/business/FileUpload.vue', () => ({
  default: {
    name: 'FileUpload',
    template: '<div class="file-upload"><slot /></div>',
    props: ['accept', 'maxSize', 'showFileList'],
    emits: ['file-selected', 'file-removed'],
    methods: {
      clearFiles: vi.fn()
    }
  }
}))

vi.mock('@/components/common/BaseTable.vue', () => ({
  default: {
    name: 'BaseTable',
    template: '<div class="base-table">{{ data.length }} rows</div>',
    props: ['data', 'columns', 'loading', 'pagination', 'maxHeight']
  }
}))

describe('ProductImport 商品导入组件', () => {
  let wrapper: VueWrapper<any>
  
  // Mock 数据
  const mockFile = new File(['test content'], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  
  const mockPreviewData = [
    {
      name: 'iPhone 15 Pro Max',
      sku: 'SKU001',
      category: '手机数码',
      price: 9999.00,
      stock: 50,
      status: 'ACTIVE'
    },
    {
      name: 'MacBook Pro 14英寸',
      sku: 'SKU002',
      category: '电脑办公',
      price: 15999.00,
      stock: 25,
      status: 'ACTIVE'
    }
  ]
  
  const mockValidationResult = {
    valid: true,
    errors: [],
    preview: mockPreviewData
  }
  
  const mockImportResult = {
    total: 2,
    success: 2,
    failed: 0,
    errors: [],
    successProducts: mockPreviewData
  }

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置默认的 API mock 返回值
    vi.mocked(productApi.getImportTemplate).mockResolvedValue({
      code: 200,
      message: '获取成功',
      data: { downloadUrl: 'http://example.com/template.xlsx' }
    })
    
    vi.mocked(productApi.validateImportData).mockResolvedValue({
      code: 200,
      message: '验证成功',
      data: mockValidationResult
    })
    
    vi.mocked(productApi.importProducts).mockResolvedValue({
      code: 200,
      message: '导入成功',
      data: mockImportResult
    })
    
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(ProductImport, {
      global: {
        plugins: [mockRouter],
        stubs: {
          'el-card': { template: '<div class="el-card"><slot name="header" /><slot /></div>' },
          'el-button': { 
            template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'icon', 'loading', 'disabled', 'size']
          },
          'el-steps': { 
            template: '<div class="el-steps"><slot /></div>',
            props: ['active', 'alignCenter']
          },
          'el-step': { 
            template: '<div class="el-step">{{ title }}</div>',
            props: ['title', 'description']
          },
          'el-icon': { template: '<i class="el-icon"><slot /></i>' },
          'el-alert': { 
            template: '<div class="el-alert"><slot name="default" /></div>',
            props: ['title', 'type', 'closable', 'showIcon']
          }
        }
      }
    })
  }

  it('应该正确渲染商品导入页面', () => {
    wrapper = createWrapper()
    
    // 检查页面标题
    expect(wrapper.find('.page-title').text()).toBe('商品导入')
    
    // 检查下载模板按钮
    expect(wrapper.find('.page-actions .el-button').exists()).toBe(true)
    
    // 检查导入步骤
    expect(wrapper.find('.el-steps').exists()).toBe(true)
    
    // 检查文件上传区域
    expect(wrapper.find('.upload-area').exists()).toBe(true)
  })

  it('应该能够下载导入模板', async () => {
    wrapper = createWrapper()
    
    // 创建下载链接的 mock
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
    
    // 点击下载模板按钮
    await wrapper.find('.page-actions .el-button').trigger('click')
    await wrapper.vm.$nextTick()
    
    // 验证 API 调用
    expect(productApi.getImportTemplate).toHaveBeenCalled()
    
    // 验证下载链接创建
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockLink.href).toBe('http://example.com/template.xlsx')
    expect(mockLink.download).toBe('商品导入模板.xlsx')
    expect(mockLink.click).toHaveBeenCalled()
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
    
    // 验证成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('模板下载成功')
    
    // 清理 mock
    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('应该能够处理文件选择', async () => {
    wrapper = createWrapper()
    
    // 模拟文件选择
    await wrapper.vm.handleFileSelect(mockFile)
    
    // 验证文件已选择
    expect(wrapper.vm.selectedFile).toEqual(mockFile)
    expect(ElMessage.success).toHaveBeenCalledWith('文件选择成功')
  })

  it('应该能够解析文件并显示预览', async () => {
    wrapper = createWrapper()
    
    // 设置选中的文件
    wrapper.vm.selectedFile = mockFile
    
    // 解析文件
    await wrapper.vm.parseFile()
    
    // 验证 API 调用
    expect(productApi.validateImportData).toHaveBeenCalledWith(mockFile)
    
    // 验证状态更新
    expect(wrapper.vm.currentStep).toBe(1)
    expect(wrapper.vm.previewData).toEqual(mockPreviewData)
    expect(wrapper.vm.validationErrors).toEqual([])
    
    // 验证成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('文件解析完成')
  })

  it('应该能够处理文件解析错误', async () => {
    wrapper = createWrapper()
    
    // Mock 验证失败的结果
    const mockErrorResult = {
      valid: false,
      errors: [
        { row: 2, field: 'sku', message: 'SKU不能为空', value: '' }
      ],
      preview: mockPreviewData
    }
    
    vi.mocked(productApi.validateImportData).mockResolvedValue({
      code: 200,
      message: '验证完成',
      data: mockErrorResult
    })
    
    // 设置选中的文件
    wrapper.vm.selectedFile = mockFile
    
    // 解析文件
    await wrapper.vm.parseFile()
    
    // 验证状态更新
    expect(wrapper.vm.currentStep).toBe(1)
    expect(wrapper.vm.previewData).toEqual(mockPreviewData)
    expect(wrapper.vm.validationErrors).toEqual(mockErrorResult.errors)
    
    // 验证警告消息
    expect(ElMessage.warning).toHaveBeenCalledWith('文件解析完成，但存在数据错误')
  })

  it('应该能够确认导入商品', async () => {
    wrapper = createWrapper()
    
    // 设置预览数据
    wrapper.vm.previewData = mockPreviewData
    wrapper.vm.validationErrors = []
    wrapper.vm.selectedFile = mockFile
    
    // 确认导入
    await wrapper.vm.confirmImport()
    
    // 验证确认对话框
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确认导入 2 条商品数据吗？',
      '确认导入',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 验证 API 调用
    expect(productApi.importProducts).toHaveBeenCalledWith(mockFile, {
      updateExisting: false,
      skipErrors: false
    })
    
    // 验证状态更新
    expect(wrapper.vm.currentStep).toBe(2)
    expect(wrapper.vm.importResult).toEqual(mockImportResult)
    
    // 验证成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('商品导入完成')
  })

  it('应该能够处理导入失败', async () => {
    wrapper = createWrapper()
    
    // Mock 导入失败的结果
    const mockFailedResult = {
      total: 2,
      success: 1,
      failed: 1,
      errors: [
        { row: 2, field: 'sku', message: 'SKU重复', value: 'SKU002', sku: 'SKU002' }
      ],
      successProducts: [mockPreviewData[0]]
    }
    
    vi.mocked(productApi.importProducts).mockResolvedValue({
      code: 200,
      message: '导入完成',
      data: mockFailedResult
    })
    
    // 设置预览数据
    wrapper.vm.previewData = mockPreviewData
    wrapper.vm.validationErrors = []
    wrapper.vm.selectedFile = mockFile
    
    // 确认导入
    await wrapper.vm.confirmImport()
    
    // 验证状态更新
    expect(wrapper.vm.currentStep).toBe(2)
    expect(wrapper.vm.importResult).toEqual(mockFailedResult)
    
    // 验证警告消息
    expect(ElMessage.warning).toHaveBeenCalledWith('导入完成，成功 1 条，失败 1 条')
  })

  it('应该能够重置导入状态', async () => {
    wrapper = createWrapper()
    
    // 设置一些状态
    wrapper.vm.currentStep = 2
    wrapper.vm.selectedFile = mockFile
    wrapper.vm.previewData = mockPreviewData
    wrapper.vm.validationErrors = [{ row: 1, field: 'test', message: 'test error', value: 'test' }]
    wrapper.vm.importResult = mockImportResult
    
    // 重置导入
    await wrapper.vm.resetImport()
    
    // 验证状态重置
    expect(wrapper.vm.currentStep).toBe(0)
    expect(wrapper.vm.selectedFile).toBeNull()
    expect(wrapper.vm.previewData).toEqual([])
    expect(wrapper.vm.validationErrors).toEqual([])
    expect(wrapper.vm.importResult).toEqual({
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
      successProducts: []
    })
  })

  it('应该能够跳转到商品列表', async () => {
    wrapper = createWrapper()
    
    // 确保 mockRouter 存在
    if (mockRouter && mockRouter.push) {
      const pushSpy = vi.spyOn(mockRouter, 'push')
      
      // 跳转到商品列表
      await wrapper.vm.goToProductList()
      
      // 验证路由跳转
      expect(pushSpy).toHaveBeenCalledWith('/products')
    } else {
      // 如果 mockRouter 不存在，至少验证方法存在
      expect(wrapper.vm.goToProductList).toBeDefined()
    }
  })

  it('应该正确格式化文件大小', () => {
    wrapper = createWrapper()
    
    // 测试不同大小的格式化
    expect(wrapper.vm.formatFileSize(500)).toBe('500 B')
    expect(wrapper.vm.formatFileSize(1536)).toBe('1.5 KB')
    expect(wrapper.vm.formatFileSize(2097152)).toBe('2.0 MB')
  })

  it('应该在有验证错误时禁用确认导入按钮', async () => {
    wrapper = createWrapper()
    
    // 设置验证错误
    wrapper.vm.validationErrors = [
      { row: 1, field: 'sku', message: 'SKU不能为空', value: '' }
    ]
    wrapper.vm.currentStep = 1
    
    await wrapper.vm.$nextTick()
    
    // 确认导入应该被阻止
    await wrapper.vm.confirmImport()
    
    // 验证错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('请先修正数据错误')
    
    // 验证 API 没有被调用
    expect(productApi.importProducts).not.toHaveBeenCalled()
  })

  it('应该处理文件解析 API 错误', async () => {
    wrapper = createWrapper()
    
    // Mock API 错误
    vi.mocked(productApi.validateImportData).mockRejectedValue(new Error('API Error'))
    
    // 设置选中的文件
    wrapper.vm.selectedFile = mockFile
    
    // 解析文件
    await wrapper.vm.parseFile()
    
    // 验证错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('文件解析失败，请检查文件格式')
  })

  it('应该处理导入 API 错误', async () => {
    wrapper = createWrapper()
    
    // Mock API 错误
    vi.mocked(productApi.importProducts).mockRejectedValue(new Error('Import Error'))
    
    // 设置预览数据
    wrapper.vm.previewData = mockPreviewData
    wrapper.vm.validationErrors = []
    wrapper.vm.selectedFile = mockFile
    
    // 确认导入
    await wrapper.vm.confirmImport()
    
    // 验证错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('商品导入失败')
  })

  it('应该处理下载模板 API 错误', async () => {
    wrapper = createWrapper()
    
    // Mock API 错误
    vi.mocked(productApi.getImportTemplate).mockRejectedValue(new Error('Download Error'))
    
    // 点击下载模板按钮
    await wrapper.find('.page-actions .el-button').trigger('click')
    await wrapper.vm.$nextTick()
    
    // 验证错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('模板下载失败')
  })
})