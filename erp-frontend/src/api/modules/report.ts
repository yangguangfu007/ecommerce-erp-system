/**
 * 报表管理 API 模块
 * 提供报表生成、模板管理等功能的接口
 */

import request from '../request'

// 报表配置接口
export interface ReportConfig {
  name: string
  type: 'table' | 'chart' | 'pivot' | 'crosstab'
  description?: string
  dataSource: string
  dateRange: [string, string]
  rowDimensions: string[]
  columnDimensions: string[]
  metrics: Array<{
    name: string
    aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'
    format: 'number' | 'currency' | 'percentage' | 'date'
  }>
  filters: Array<{
    field: string
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'not_contains'
    value: string
  }>
  outputFormat: 'excel' | 'pdf' | 'csv' | 'preview'
  orientation: 'portrait' | 'landscape'
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal'
}

// 报表模板接口
export interface ReportTemplate {
  id?: number
  name: string
  type: string
  description?: string
  config: ReportConfig
  createdAt?: string
  updatedAt?: string
}

// 报表预览数据接口
export interface ReportPreviewData {
  columns: Array<{
    prop: string
    label: string
    width?: number
    formatter?: (row: any) => string
  }>
  data: any[]
  total: number
  chartData?: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string[]
      borderColor?: string
    }>
  }
}

// 分页查询参数
export interface PageQuery {
  page: number
  size: number
  keyword?: string
}

/**
 * 报表生成 API
 */
export const reportApi = {
  /**
   * 生成报表预览
   */
  generatePreview: (config: ReportConfig): Promise<ReportPreviewData> => {
    return request.post('/reports/preview', config)
  },

  /**
   * 生成报表文件
   */
  generateReport: (config: ReportConfig): Promise<{ downloadUrl: string }> => {
    return request.post('/reports/generate', config)
  },

  /**
   * 导出报表
   */
  exportReport: (config: ReportConfig): Promise<Blob> => {
    return request.post('/reports/export', config, {
      responseType: 'blob'
    })
  },

  /**
   * 获取数据源列表
   */
  getDataSources: (): Promise<Array<{ label: string; value: string }>> => {
    return request.get('/reports/data-sources')
  },

  /**
   * 获取维度列表
   */
  getDimensions: (dataSource: string): Promise<Array<{ key: string; label: string }>> => {
    return request.get(`/reports/dimensions/${dataSource}`)
  },

  /**
   * 获取指标列表
   */
  getMetrics: (dataSource: string): Promise<Array<{ label: string; value: string }>> => {
    return request.get(`/reports/metrics/${dataSource}`)
  },

  /**
   * 获取字段列表
   */
  getFields: (dataSource: string): Promise<Array<{ label: string; value: string }>> => {
    return request.get(`/reports/fields/${dataSource}`)
  }
}

/**
 * 报表模板 API
 */
export const reportTemplateApi = {
  /**
   * 获取模板列表
   */
  getTemplates: (params?: PageQuery): Promise<{
    records: ReportTemplate[]
    total: number
    current: number
    size: number
  }> => {
    return request.get('/report-templates', { params })
  },

  /**
   * 获取模板详情
   */
  getTemplate: (id: number): Promise<ReportTemplate> => {
    return request.get(`/report-templates/${id}`)
  },

  /**
   * 创建模板
   */
  createTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> => {
    return request.post('/report-templates', template)
  },

  /**
   * 更新模板
   */
  updateTemplate: (id: number, template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    return request.put(`/report-templates/${id}`, template)
  },

  /**
   * 删除模板
   */
  deleteTemplate: (id: number): Promise<void> => {
    return request.delete(`/report-templates/${id}`)
  },

  /**
   * 批量删除模板
   */
  batchDeleteTemplates: (ids: number[]): Promise<void> => {
    return request.delete('/report-templates/batch', { data: { ids } })
  }
}