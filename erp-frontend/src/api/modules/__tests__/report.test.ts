/**
 * 报表管理 API 模块测试
 * 测试报表生成、模板管理等 API 接口
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reportApi, reportTemplateApi } from '../report'
import type { ReportConfig, ReportTemplate } from '../report'

// Mock request 模块
const mockRequest = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

vi.mock('../request', () => ({
  default: mockRequest
}))

describe('reportApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

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

  describe('generatePreview', () => {
    it('应该调用预览生成接口', async () => {
      const mockResponse = {
        columns: [
          { prop: 'date', label: '日期' },
          { prop: 'amount', label: '金额' }
        ],
        data: [
          { date: '2024-01-01', amount: 1000 }
        ],
        total: 1
      }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await reportApi.generatePreview(mockReportConfig)

      expect(mockRequest.post).toHaveBeenCalledWith('/reports/preview', mockReportConfig)
      expect(result).toEqual(mockResponse)
    })

    it('应该处理预览生成失败', async () => {
      const errorMessage = '生成预览失败'
      mockRequest.post.mockRejectedValue(new Error(errorMessage))

      await expect(reportApi.generatePreview(mockReportConfig))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('generateReport', () => {
    it('应该调用报表生成接口', async () => {
      const mockResponse = {
        downloadUrl: 'http://example.com/report.xlsx'
      }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await reportApi.generateReport(mockReportConfig)

      expect(mockRequest.post).toHaveBeenCalledWith('/reports/generate', mockReportConfig)
      expect(result).toEqual(mockResponse)
    })

    it('应该处理报表生成失败', async () => {
      const errorMessage = '生成报表失败'
      mockRequest.post.mockRejectedValue(new Error(errorMessage))

      await expect(reportApi.generateReport(mockReportConfig))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('exportReport', () => {
    it('应该调用报表导出接口', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.ms-excel' })
      mockRequest.post.mockResolvedValue(mockBlob)

      const result = await reportApi.exportReport(mockReportConfig)

      expect(mockRequest.post).toHaveBeenCalledWith('/reports/export', mockReportConfig, {
        responseType: 'blob'
      })
      expect(result).toEqual(mockBlob)
    })

    it('应该处理报表导出失败', async () => {
      const errorMessage = '导出报表失败'
      mockRequest.post.mockRejectedValue(new Error(errorMessage))

      await expect(reportApi.exportReport(mockReportConfig))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('getDataSources', () => {
    it('应该获取数据源列表', async () => {
      const mockDataSources = [
        { label: '订单数据', value: 'orders' },
        { label: '商品数据', value: 'products' }
      ]

      mockRequest.get.mockResolvedValue(mockDataSources)

      const result = await reportApi.getDataSources()

      expect(mockRequest.get).toHaveBeenCalledWith('/reports/data-sources')
      expect(result).toEqual(mockDataSources)
    })
  })

  describe('getDimensions', () => {
    it('应该获取维度列表', async () => {
      const mockDimensions = [
        { key: 'date', label: '日期' },
        { key: 'category', label: '分类' }
      ]

      mockRequest.get.mockResolvedValue(mockDimensions)

      const result = await reportApi.getDimensions('orders')

      expect(mockRequest.get).toHaveBeenCalledWith('/reports/dimensions/orders')
      expect(result).toEqual(mockDimensions)
    })
  })

  describe('getMetrics', () => {
    it('应该获取指标列表', async () => {
      const mockMetrics = [
        { label: '销售额', value: 'sales_amount' },
        { label: '订单数量', value: 'order_count' }
      ]

      mockRequest.get.mockResolvedValue(mockMetrics)

      const result = await reportApi.getMetrics('orders')

      expect(mockRequest.get).toHaveBeenCalledWith('/reports/metrics/orders')
      expect(result).toEqual(mockMetrics)
    })
  })

  describe('getFields', () => {
    it('应该获取字段列表', async () => {
      const mockFields = [
        { label: '订单状态', value: 'order_status' },
        { label: '商品分类', value: 'product_category' }
      ]

      mockRequest.get.mockResolvedValue(mockFields)

      const result = await reportApi.getFields('orders')

      expect(mockRequest.get).toHaveBeenCalledWith('/reports/fields/orders')
      expect(result).toEqual(mockFields)
    })
  })
})

describe('reportTemplateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockTemplate: ReportTemplate = {
    id: 1,
    name: '销售报表模板',
    type: 'table',
    description: '销售数据分析模板',
    config: {
      name: '销售报表',
      type: 'table',
      dataSource: 'orders',
      dateRange: ['2024-01-01', '2024-01-31'],
      rowDimensions: ['date'],
      columnDimensions: [],
      metrics: [],
      filters: [],
      outputFormat: 'preview',
      orientation: 'portrait',
      pageSize: 'A4'
    },
    createdAt: '2024-01-01T00:00:00Z'
  }

  describe('getTemplates', () => {
    it('应该获取模板列表', async () => {
      const mockResponse = {
        records: [mockTemplate],
        total: 1,
        current: 1,
        size: 10
      }

      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await reportTemplateApi.getTemplates({ page: 1, size: 10 })

      expect(mockRequest.get).toHaveBeenCalledWith('/report-templates', {
        params: { page: 1, size: 10 }
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该支持无参数获取模板列表', async () => {
      const mockResponse = {
        records: [mockTemplate],
        total: 1,
        current: 1,
        size: 10
      }

      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await reportTemplateApi.getTemplates()

      expect(mockRequest.get).toHaveBeenCalledWith('/report-templates', {
        params: undefined
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTemplate', () => {
    it('应该获取模板详情', async () => {
      mockRequest.get.mockResolvedValue(mockTemplate)

      const result = await reportTemplateApi.getTemplate(1)

      expect(mockRequest.get).toHaveBeenCalledWith('/report-templates/1')
      expect(result).toEqual(mockTemplate)
    })
  })

  describe('createTemplate', () => {
    it('应该创建新模板', async () => {
      const newTemplate = {
        name: '新模板',
        type: 'chart',
        description: '新模板描述',
        config: mockTemplate.config
      }

      mockRequest.post.mockResolvedValue({ ...newTemplate, id: 2 })

      const result = await reportTemplateApi.createTemplate(newTemplate)

      expect(mockRequest.post).toHaveBeenCalledWith('/report-templates', newTemplate)
      expect(result).toEqual({ ...newTemplate, id: 2 })
    })
  })

  describe('updateTemplate', () => {
    it('应该更新模板', async () => {
      const updateData = {
        name: '更新后的模板名称',
        description: '更新后的描述'
      }

      const updatedTemplate = { ...mockTemplate, ...updateData }
      mockRequest.put.mockResolvedValue(updatedTemplate)

      const result = await reportTemplateApi.updateTemplate(1, updateData)

      expect(mockRequest.put).toHaveBeenCalledWith('/report-templates/1', updateData)
      expect(result).toEqual(updatedTemplate)
    })
  })

  describe('deleteTemplate', () => {
    it('应该删除模板', async () => {
      mockRequest.delete.mockResolvedValue(undefined)

      await reportTemplateApi.deleteTemplate(1)

      expect(mockRequest.delete).toHaveBeenCalledWith('/report-templates/1')
    })
  })

  describe('batchDeleteTemplates', () => {
    it('应该批量删除模板', async () => {
      const ids = [1, 2, 3]
      mockRequest.delete.mockResolvedValue(undefined)

      await reportTemplateApi.batchDeleteTemplates(ids)

      expect(mockRequest.delete).toHaveBeenCalledWith('/report-templates/batch', {
        data: { ids }
      })
    })
  })
})