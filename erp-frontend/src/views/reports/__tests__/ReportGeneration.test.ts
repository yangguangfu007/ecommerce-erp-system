/**
 * 报表生成页面组件测试
 * 测试报表配置、预览、生成和模板管理功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import ReportGeneration from '../ReportGeneration.vue'
import { useReportStore } from '@/stores/report'
import type { ReportConfig, ReportTemplate } from '@/api/modules/report'

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

// Mock 图表组件
vi.mock('@/components/business/ChartContainer.vue', () => ({
  default: {
    name: 'ChartContainer',
    template: '<div class="mock-chart-container">图表容器</div>',
    props: ['data', 'type', 'height', 'options']
  }
}))

// Mock API
vi.mock('@/api/modules/report', () => ({
  reportApi: {
    generatePreview: vi.fn(),
    generateReport: vi.fn(),
    exportReport: vi.fn(),
    getDataSources: vi.fn(),
    getDimensions: vi.fn(),
    getMetrics: vi.fn(),
    getFields: vi.fn()
  },
  reportTemplateApi: {
    getTemplates: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    batchDeleteTemplates: vi.fn()
  }
}))

describe('ReportGeneration', () => {
  let wrapper: VueWrapper<any>
  let pinia: any
  let reportStore: any

  // Mock 数据
  const mockReportConfig: ReportConfig = {
    name: '测试报表',
    type: 'table',
    description: '测试报表描述',
    dataSource: 'orders',
    dateRange: ['2024-01-01', '2024-01-31'],
    rowDimensions: ['date'],
    columnDimensions: ['category'],
    metrics: [{
      name: 'sales_amount',
      aggregation: 'sum',
      format: 'currency'
    }],
    filters: [{
      field: 'status',
      operator: 'eq',
      value: 'completed'
    }],
    outputFormat: 'preview',
    orientation: 'portrait',
    pageSize: 'A4'
  }

  const mockPreviewData = {
    columns: [
      { prop: 'date', label: '日期', width: 120 },
      { prop: 'amount', label: '金额', width: 100 }
    ],
    data: [
      { date: '2024-01-01', amount: 1000 },
      { date: '2024-01-02', amount: 1500 }
    ],
    total: 2
  }

  const mockTemplates: ReportTemplate[] = [
    {
      id: 1,
      name: '销售报表模板',
      type: 'table',
      description: '销售数据分析模板',
      config: mockReportConfig,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    reportStore = useReportStore()

    // Mock store 方法
    vi.spyOn(reportStore, 'generatePreview').mockResolvedValue(undefined)
    vi.spyOn(reportStore, 'generateReport').mockResolvedValue('http://example.com/report.xlsx')
    vi.spyOn(reportStore, 'exportReport').mockResolvedValue(new Blob())
    vi.spyOn(reportStore, 'fetchTemplates').mockResolvedValue(undefined)
    vi.spyOn(reportStore, 'createTemplate').mockResolvedValue(mockTemplates[0])
    vi.spyOn(reportStore, 'deleteTemplate').mockResolvedValue(undefined)

    // 设置 store 初始状态
    reportStore.templates = mockTemplates
    reportStore.previewData = mockPreviewData
    reportStore.dataSources = [
      { label: '订单数据', value: 'orders' },
      { label: '商品数据', value: 'products' }
    ]

    wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染页面标题和描述', () => {
      expect(wrapper.find('.page-title').text()).toBe('报表生成')
      expect(wrapper.find('.page-description').text()).toBe('创建和管理多维度数据分析报表')
    })

    it('应该渲染页面操作按钮', () => {
      const actions = wrapper.find('.page-actions')
      expect(actions.exists()).toBe(true)
      
      // 检查按钮是否存在
      const buttons = actions.findAll('el-button-stub')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该渲染报表配置表单', () => {
      expect(wrapper.find('.report-config-form').exists()).toBe(true)
      expect(wrapper.find('.form-section').exists()).toBe(true)
    })

    it('应该渲染预览区域', () => {
      expect(wrapper.find('.preview-section').exists()).toBe(true)
      expect(wrapper.find('.preview-content').exists()).toBe(true)
    })
  })

  describe('报表配置', () => {
    it('应该正确初始化报表配置', async () => {
      const vm = wrapper.vm
      expect(vm.reportConfig).toBeDefined()
      expect(vm.reportConfig.type).toBe('table')
      expect(vm.reportConfig.outputFormat).toBe('preview')
    })

    it('应该支持报表类型切换', async () => {
      const vm = wrapper.vm
      
      // 模拟报表类型变更
      await vm.onReportTypeChange('chart')
      
      expect(vm.reportConfig.type).toBe('chart')
    })

    it('应该支持数据源切换', async () => {
      const vm = wrapper.vm
      
      // 模拟数据源变更
      await vm.onDataSourceChange('products')
      
      expect(vm.reportConfig.dataSource).toBe('products')
    })

    it('应该支持添加指标', async () => {
      const vm = wrapper.vm
      const initialLength = vm.reportConfig.metrics.length
      
      vm.addMetric()
      
      expect(vm.reportConfig.metrics.length).toBe(initialLength + 1)
      expect(vm.reportConfig.metrics[vm.reportConfig.metrics.length - 1]).toEqual({
        name: '',
        aggregation: 'sum',
        format: 'number'
      })
    })

    it('应该支持删除指标', async () => {
      const vm = wrapper.vm
      vm.reportConfig.metrics = [
        { name: 'sales_amount', aggregation: 'sum', format: 'currency' },
        { name: 'order_count', aggregation: 'count', format: 'number' }
      ]
      
      vm.removeMetric(0)
      
      expect(vm.reportConfig.metrics.length).toBe(1)
      expect(vm.reportConfig.metrics[0].name).toBe('order_count')
    })

    it('应该支持添加筛选条件', async () => {
      const vm = wrapper.vm
      const initialLength = vm.reportConfig.filters.length
      
      vm.addFilter()
      
      expect(vm.reportConfig.filters.length).toBe(initialLength + 1)
      expect(vm.reportConfig.filters[vm.reportConfig.filters.length - 1]).toEqual({
        field: '',
        operator: 'eq',
        value: ''
      })
    })

    it('应该支持删除筛选条件', async () => {
      const vm = wrapper.vm
      vm.reportConfig.filters = [
        { field: 'status', operator: 'eq', value: 'completed' },
        { field: 'amount', operator: 'gt', value: '100' }
      ]
      
      vm.removeFilter(0)
      
      expect(vm.reportConfig.filters.length).toBe(1)
      expect(vm.reportConfig.filters[0].field).toBe('amount')
    })
  })

  describe('报表预览', () => {
    it('应该检查预览条件', () => {
      const vm = wrapper.vm
      
      // 设置完整配置
      vm.reportConfig.name = '测试报表'
      vm.reportConfig.type = 'table'
      vm.reportConfig.dataSource = 'orders'
      vm.reportConfig.dateRange = ['2024-01-01', '2024-01-31']
      
      expect(vm.canPreview).toBe(true)
    })

    it('应该生成预览数据', async () => {
      const vm = wrapper.vm
      
      // 设置完整配置
      vm.reportConfig = { ...mockReportConfig }
      
      await vm.generatePreview()
      
      expect(reportStore.generatePreview).toHaveBeenCalledWith(mockReportConfig)
    })

    it('应该处理预览生成失败', async () => {
      const vm = wrapper.vm
      const errorMessage = '生成预览失败'
      
      reportStore.generatePreview.mockRejectedValue(new Error(errorMessage))
      
      await vm.generatePreview()
      
      expect(ElMessage.error).toHaveBeenCalledWith(errorMessage)
    })

    it('应该支持刷新预览', async () => {
      const vm = wrapper.vm
      vm.reportConfig = { ...mockReportConfig }
      
      await vm.refreshPreview()
      
      expect(reportStore.generatePreview).toHaveBeenCalled()
    })

    it('应该支持分页切换', async () => {
      const vm = wrapper.vm
      
      await vm.onPreviewPageChange(2)
      
      expect(vm.previewPagination.page).toBe(2)
    })

    it('应该支持页面大小切换', async () => {
      const vm = wrapper.vm
      
      await vm.onPreviewSizeChange(50)
      
      expect(vm.previewPagination.size).toBe(50)
    })
  })

  describe('报表生成', () => {
    it('应该验证表单后生成报表', async () => {
      const vm = wrapper.vm
      vm.reportConfig = { ...mockReportConfig }
      
      // Mock 表单验证
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.configFormRef = { validate: mockValidate }
      
      await vm.generateReport()
      
      expect(mockValidate).toHaveBeenCalled()
      expect(reportStore.generateReport).toHaveBeenCalledWith(mockReportConfig)
    })

    it('应该处理表单验证失败', async () => {
      const vm = wrapper.vm
      
      // Mock 表单验证失败
      const mockValidate = vi.fn().mockRejectedValue(new Error('验证失败'))
      vm.configFormRef = { validate: mockValidate }
      
      await vm.generateReport()
      
      expect(reportStore.generateReport).not.toHaveBeenCalled()
    })

    it('应该支持导出报表', async () => {
      const vm = wrapper.vm
      vm.previewData = [{ date: '2024-01-01', amount: 1000 }]
      
      await vm.exportReport()
      
      expect(ElMessage.success).toHaveBeenCalledWith('报表导出成功')
    })

    it('应该处理空数据导出', async () => {
      const vm = wrapper.vm
      vm.previewData = []
      
      await vm.exportReport()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('暂无数据可导出')
    })
  })

  describe('模板管理', () => {
    it('应该显示模板管理对话框', async () => {
      const vm = wrapper.vm
      
      vm.showTemplateDialog = true
      await wrapper.vm.$nextTick()
      
      expect(vm.showTemplateDialog).toBe(true)
    })

    it('应该加载模板配置', async () => {
      const vm = wrapper.vm
      const template = mockTemplates[0]
      
      vm.loadTemplateConfig(template)
      
      expect(vm.reportConfig).toEqual(template.config)
      expect(ElMessage.success).toHaveBeenCalledWith('模板加载成功')
    })

    it('应该保存为模板', async () => {
      const vm = wrapper.vm
      vm.reportConfig.name = '测试报表'
      vm.reportConfig.description = '测试描述'
      
      await vm.saveAsTemplate()
      
      expect(vm.templateForm.name).toBe('测试报表_模板')
      expect(vm.templateForm.description).toBe('测试描述')
      expect(vm.showCreateTemplateDialog).toBe(true)
    })

    it('应该创建新模板', async () => {
      const vm = wrapper.vm
      vm.templateForm.name = '新模板'
      vm.templateForm.description = '新模板描述'
      vm.reportConfig = { ...mockReportConfig }
      
      // Mock 表单验证
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.templateFormRef = { validate: mockValidate }
      
      await vm.createTemplate()
      
      expect(mockValidate).toHaveBeenCalled()
      expect(reportStore.createTemplate).toHaveBeenCalled()
    })

    it('应该删除模板', async () => {
      const vm = wrapper.vm
      const template = mockTemplates[0]
      
      // Mock 确认对话框
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      await vm.deleteTemplate(template)
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(reportStore.deleteTemplate).toHaveBeenCalledWith(template.id)
    })

    it('应该处理删除模板取消', async () => {
      const vm = wrapper.vm
      const template = mockTemplates[0]
      
      // Mock 取消确认对话框
      vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')
      
      await vm.deleteTemplate(template)
      
      expect(reportStore.deleteTemplate).not.toHaveBeenCalled()
    })
  })

  describe('表单重置', () => {
    it('应该重置表单配置', async () => {
      const vm = wrapper.vm
      
      // 设置一些配置
      vm.reportConfig.name = '测试报表'
      vm.reportConfig.type = 'chart'
      vm.previewData = [{ test: 'data' }]
      
      // Mock 表单重置
      const mockResetFields = vi.fn()
      vm.configFormRef = { resetFields: mockResetFields }
      
      vm.resetForm()
      
      expect(mockResetFields).toHaveBeenCalled()
      expect(vm.reportConfig.name).toBe('')
      expect(vm.reportConfig.type).toBe('table')
      expect(vm.previewData).toEqual([])
    })
  })

  describe('计算属性', () => {
    it('应该正确计算图表数据', () => {
      const vm = wrapper.vm
      vm.reportConfig.type = 'chart'
      vm.previewData = [
        { label: '类别1', value: 100 },
        { label: '类别2', value: 200 }
      ]
      
      const chartData = vm.chartData
      
      expect(chartData.labels).toEqual(['类别1', '类别2'])
      expect(chartData.datasets[0].data).toEqual([100, 200])
    })

    it('应该正确计算图表类型', () => {
      const vm = wrapper.vm
      
      // 有列维度时应该是柱状图
      vm.reportConfig.columnDimensions = ['category']
      expect(vm.chartType).toBe('bar')
      
      // 无列维度时应该是饼图
      vm.reportConfig.columnDimensions = []
      expect(vm.chartType).toBe('pie')
    })
  })

  describe('错误处理', () => {
    it('应该处理生成报表错误', async () => {
      const vm = wrapper.vm
      const errorMessage = '生成报表失败'
      
      reportStore.generateReport.mockRejectedValue(new Error(errorMessage))
      
      // Mock 表单验证
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.configFormRef = { validate: mockValidate }
      
      await vm.generateReport()
      
      expect(ElMessage.error).toHaveBeenCalledWith(errorMessage)
    })

    it('应该处理模板创建错误', async () => {
      const vm = wrapper.vm
      const errorMessage = '创建模板失败'
      
      reportStore.createTemplate.mockRejectedValue(new Error(errorMessage))
      
      // Mock 表单验证
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.templateFormRef = { validate: mockValidate }
      
      await vm.createTemplate()
      
      expect(ElMessage.error).toHaveBeenCalledWith(errorMessage)
    })
  })
})