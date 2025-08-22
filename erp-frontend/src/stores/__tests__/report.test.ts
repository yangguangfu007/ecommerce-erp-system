/**
 * 报表管理状态管理测试
 * 测试报表生成、模板管理等状态管理功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReportStore } from '../report'
import type { ReportConfig, ReportTemplate } from '@/api/modules/report'

// Mock API 模块
const mockReportApi = {
  generatePreview: vi.fn(),
  generateReport: vi.fn(),
  exportReport: vi.fn(),
  getDataSources: vi.fn(),
  getDimensions: vi.fn(),
  getMetrics: vi.fn(),
  getFields: vi.fn()
}

const mockReportTemplateApi = {
  getTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  batchDeleteTemplates: vi.fn()
}

vi.mock('@/api/modules/report', () => ({
  reportApi: mockReportApi,
  reportTemplateApi: mockReportTemplateApi
}))

describe('useReportStore', () => {
  let reportStore: ReturnType<typeof useReportStore>

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

  const mockTemplate: ReportTemplate = {
    id: 1,
    name: '销售报表模板',
    type: 'table',
    description: '销售数据分析模板',
    config: mockReportConfig,
    createdAt: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    reportStore = useReportStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(reportStore.loading).toBe(false)
      expect(reportStore.error).toBe(null)
      expect(reportStore.generating).toBe(false)
      expect(reportStore.previewing).toBe(false)
      expect(reportStore.currentConfig).toBe(null)
      expect(reportStore.previewData).toBe(null)
      expect(reportStore.templates).toEqual([])
      expect(reportStore.templatesLoading).toBe(false)
      expect(reportStore.templatesTotal).toBe(0)
      expect(reportStore.dataSources).toEqual([])
      expect(reportStore.dimensions).toEqual([])
      expect(reportStore.metrics).toEqual([])
      expect(reportStore.fields).toEqual([])
    })
  })

  describe('计算属性', () => {
    it('hasPreviewData 应该正确计算', () => {
      expect(reportStore.hasPreviewData).toBe(false)

      reportStore.previewData = mockPreviewData
      expect(reportStore.hasPreviewData).toBe(true)

      reportStore.previewData = { ...mockPreviewData, data: [] }
      expect(reportStore.hasPreviewData).toBe(false)
    })

    it('canGenerate 应该正确计算', () => {
      expect(reportStore.canGenerate).toBe(false)

      reportStore.currentConfig = mockReportConfig
      expect(reportStore.canGenerate).toBe(true)

      reportStore.currentConfig = { ...mockReportConfig, name: '' }
      expect(reportStore.canGenerate).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该设置和清除错误', () => {
      const errorMessage = '测试错误'
      
      reportStore.setError(errorMessage)
      expect(reportStore.error).toBe(errorMessage)

      reportStore.clearError()
      expect(reportStore.error).toBe(null)
    })
  })

  describe('报表预览', () => {
    it('应该成功生成预览', async () => {
      mockReportApi.generatePreview.mockResolvedValue(mockPreviewData)

      await reportStore.generatePreview(mockReportConfig)

      expect(mockReportApi.generatePreview).toHaveBeenCalledWith(mockReportConfig)
      expect(reportStore.previewData).toEqual(mockPreviewData)
      expect(reportStore.currentConfig).toEqual(mockReportConfig)
      expect(reportStore.previewing).toBe(false)
      expect(reportStore.error).toBe(null)
    })

    it('应该处理预览生成失败', async () => {
      const errorMessage = '生成预览失败'
      mockReportApi.generatePreview.mockRejectedValue(new Error(errorMessage))

      await expect(reportStore.generatePreview(mockReportConfig))
        .rejects.toThrow(errorMessage)

      expect(reportStore.error).toBe(errorMessage)
      expect(reportStore.previewing).toBe(false)
    })

    it('应该处理空配置', async () => {
      await expect(reportStore.generatePreview(null as any))
        .rejects.toThrow('报表配置不能为空')
    })
  })

  describe('报表生成', () => {
    it('应该成功生成报表', async () => {
      const downloadUrl = 'http://example.com/report.xlsx'
      mockReportApi.generateReport.mockResolvedValue({ downloadUrl })

      const result = await reportStore.generateReport(mockReportConfig)

      expect(mockReportApi.generateReport).toHaveBeenCalledWith(mockReportConfig)
      expect(result).toBe(downloadUrl)
      expect(reportStore.currentConfig).toEqual(mockReportConfig)
      expect(reportStore.generating).toBe(false)
      expect(reportStore.error).toBe(null)
    })

    it('应该处理报表生成失败', async () => {
      const errorMessage = '生成报表失败'
      mockReportApi.generateReport.mockRejectedValue(new Error(errorMessage))

      await expect(reportStore.generateReport(mockReportConfig))
        .rejects.toThrow(errorMessage)

      expect(reportStore.error).toBe(errorMessage)
      expect(reportStore.generating).toBe(false)
    })
  })

  describe('报表导出', () => {
    it('应该成功导出报表', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.ms-excel' })
      mockReportApi.exportReport.mockResolvedValue(mockBlob)

      const result = await reportStore.exportReport(mockReportConfig)

      expect(mockReportApi.exportReport).toHaveBeenCalledWith(mockReportConfig)
      expect(result).toBe(mockBlob)
      expect(reportStore.loading).toBe(false)
      expect(reportStore.error).toBe(null)
    })

    it('应该处理报表导出失败', async () => {
      const errorMessage = '导出报表失败'
      mockReportApi.exportReport.mockRejectedValue(new Error(errorMessage))

      await expect(reportStore.exportReport(mockReportConfig))
        .rejects.toThrow(errorMessage)

      expect(reportStore.error).toBe(errorMessage)
      expect(reportStore.loading).toBe(false)
    })
  })

  describe('数据源管理', () => {
    it('应该成功获取数据源', async () => {
      const mockDataSources = [
        { label: '订单数据', value: 'orders' },
        { label: '商品数据', value: 'products' }
      ]
      mockReportApi.getDataSources.mockResolvedValue(mockDataSources)

      await reportStore.fetchDataSources()

      expect(mockReportApi.getDataSources).toHaveBeenCalled()
      expect(reportStore.dataSources).toEqual(mockDataSources)
    })

    it('应该处理获取数据源失败并使用默认值', async () => {
      mockReportApi.getDataSources.mockRejectedValue(new Error('获取失败'))

      await reportStore.fetchDataSources()

      expect(reportStore.dataSources.length).toBeGreaterThan(0)
      expect(reportStore.dataSources[0]).toHaveProperty('label')
      expect(reportStore.dataSources[0]).toHaveProperty('value')
    })
  })

  describe('维度管理', () => {
    it('应该成功获取维度', async () => {
      const mockDimensions = [
        { key: 'date', label: '日期' },
        { key: 'category', label: '分类' }
      ]
      mockReportApi.getDimensions.mockResolvedValue(mockDimensions)

      await reportStore.fetchDimensions('orders')

      expect(mockReportApi.getDimensions).toHaveBeenCalledWith('orders')
      expect(reportStore.dimensions).toEqual(mockDimensions)
    })

    it('应该处理空数据源', async () => {
      await reportStore.fetchDimensions('')

      expect(mockReportApi.getDimensions).not.toHaveBeenCalled()
    })

    it('应该处理获取维度失败并使用默认值', async () => {
      mockReportApi.getDimensions.mockRejectedValue(new Error('获取失败'))

      await reportStore.fetchDimensions('orders')

      expect(reportStore.dimensions.length).toBeGreaterThan(0)
    })
  })

  describe('指标管理', () => {
    it('应该成功获取指标', async () => {
      const mockMetrics = [
        { label: '销售额', value: 'sales_amount' },
        { label: '订单数量', value: 'order_count' }
      ]
      mockReportApi.getMetrics.mockResolvedValue(mockMetrics)

      await reportStore.fetchMetrics('orders')

      expect(mockReportApi.getMetrics).toHaveBeenCalledWith('orders')
      expect(reportStore.metrics).toEqual(mockMetrics)
    })

    it('应该处理获取指标失败并使用默认值', async () => {
      mockReportApi.getMetrics.mockRejectedValue(new Error('获取失败'))

      await reportStore.fetchMetrics('orders')

      expect(reportStore.metrics.length).toBeGreaterThan(0)
    })
  })

  describe('字段管理', () => {
    it('应该成功获取字段', async () => {
      const mockFields = [
        { label: '订单状态', value: 'order_status' },
        { label: '商品分类', value: 'product_category' }
      ]
      mockReportApi.getFields.mockResolvedValue(mockFields)

      await reportStore.fetchFields('orders')

      expect(mockReportApi.getFields).toHaveBeenCalledWith('orders')
      expect(reportStore.fields).toEqual(mockFields)
    })

    it('应该处理获取字段失败并使用默认值', async () => {
      mockReportApi.getFields.mockRejectedValue(new Error('获取失败'))

      await reportStore.fetchFields('orders')

      expect(reportStore.fields.length).toBeGreaterThan(0)
    })
  })

  describe('模板管理', () => {
    it('应该成功获取模板列表', async () => {
      const mockResponse = {
        records: [mockTemplate],
        total: 1,
        current: 1,
        size: 10
      }
      mockReportTemplateApi.getTemplates.mockResolvedValue(mockResponse)

      await reportStore.fetchTemplates({ page: 1, size: 10 })

      expect(mockReportTemplateApi.getTemplates).toHaveBeenCalledWith({ page: 1, size: 10 })
      expect(reportStore.templates).toEqual([mockTemplate])
      expect(reportStore.templatesTotal).toBe(1)
      expect(reportStore.templatesLoading).toBe(false)
    })

    it('应该处理获取模板列表失败', async () => {
      const errorMessage = '获取模板列表失败'
      mockReportTemplateApi.getTemplates.mockRejectedValue(new Error(errorMessage))

      await reportStore.fetchTemplates()

      expect(reportStore.error).toBe(errorMessage)
      expect(reportStore.templatesLoading).toBe(false)
    })

    it('应该成功创建模板', async () => {
      const newTemplate = {
        name: '新模板',
        type: 'chart',
        description: '新模板描述',
        config: mockReportConfig
      }
      const createdTemplate = { ...newTemplate, id: 2 }
      mockReportTemplateApi.createTemplate.mockResolvedValue(createdTemplate)

      const result = await reportStore.createTemplate(newTemplate)

      expect(mockReportTemplateApi.createTemplate).toHaveBeenCalledWith(newTemplate)
      expect(result).toEqual(createdTemplate)
      expect(reportStore.templates[0]).toEqual(createdTemplate)
      expect(reportStore.templatesTotal).toBe(1)
    })

    it('应该成功更新模板', async () => {
      reportStore.templates = [mockTemplate]
      const updateData = { name: '更新后的模板' }
      const updatedTemplate = { ...mockTemplate, ...updateData }
      mockReportTemplateApi.updateTemplate.mockResolvedValue(updatedTemplate)

      const result = await reportStore.updateTemplate(1, updateData)

      expect(mockReportTemplateApi.updateTemplate).toHaveBeenCalledWith(1, updateData)
      expect(result).toEqual(updatedTemplate)
      expect(reportStore.templates[0]).toEqual(updatedTemplate)
    })

    it('应该成功删除模板', async () => {
      reportStore.templates = [mockTemplate]
      reportStore.templatesTotal = 1
      mockReportTemplateApi.deleteTemplate.mockResolvedValue(undefined)

      await reportStore.deleteTemplate(1)

      expect(mockReportTemplateApi.deleteTemplate).toHaveBeenCalledWith(1)
      expect(reportStore.templates).toEqual([])
      expect(reportStore.templatesTotal).toBe(0)
    })

    it('应该成功批量删除模板', async () => {
      const templates = [
        { ...mockTemplate, id: 1 },
        { ...mockTemplate, id: 2 },
        { ...mockTemplate, id: 3 }
      ]
      reportStore.templates = templates
      reportStore.templatesTotal = 3
      mockReportTemplateApi.batchDeleteTemplates.mockResolvedValue(undefined)

      await reportStore.batchDeleteTemplates([1, 2])

      expect(mockReportTemplateApi.batchDeleteTemplates).toHaveBeenCalledWith([1, 2])
      expect(reportStore.templates.length).toBe(1)
      expect(reportStore.templates[0].id).toBe(3)
      expect(reportStore.templatesTotal).toBe(1)
    })
  })

  describe('初始化和重置', () => {
    it('应该初始化数据', async () => {
      const mockDataSources = [{ label: '订单数据', value: 'orders' }]
      const mockTemplatesResponse = {
        records: [mockTemplate],
        total: 1,
        current: 1,
  