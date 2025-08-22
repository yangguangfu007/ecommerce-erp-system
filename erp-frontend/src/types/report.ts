/**
 * 报表管理相关类型定义
 */

// 报表配置类型
export interface ReportConfig {
  name: string
  type: 'table' | 'chart' | 'pivot' | 'crosstab'
  description?: string
  dataSource: string
  dateRange: [string, string]
  rowDimensions: string[]
  columnDimensions: string[]
  metrics: ReportMetric[]
  filters: ReportFilter[]
  outputFormat: 'excel' | 'pdf' | 'csv' | 'preview'
  orientation: 'portrait' | 'landscape'
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal'
}

// 报表指标类型
export interface ReportMetric {
  name: string
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'
  format: 'number' | 'currency' | 'percentage' | 'date'
}

// 报表筛选条件类型
export interface ReportFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'not_contains'
  value: string
}

// 报表模板类型
export interface ReportTemplate {
  id?: number
  name: string
  type: string
  description?: string
  config: ReportConfig
  createdAt?: string
  updatedAt?: string
}

// 报表预览数据类型
export interface ReportPreviewData {
  columns: ReportColumn[]
  data: any[]
  total: number
  chartData?: ChartData
}

// 报表列定义类型
export interface ReportColumn {
  prop: string
  label: string
  width?: number
  formatter?: (row: any) => string
}

// 图表数据类型
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// 图表数据集类型
export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string[]
  borderColor?: string
}

// 维度选项类型
export interface DimensionOption {
  key: string
  label: string
}

// 指标选项类型
export interface MetricOption {
  label: string
  value: string
}

// 字段选项类型
export interface FieldOption {
  label: string
  value: string
}

// 数据源选项类型
export interface DataSourceOption {
  label: string
  value: string
}

// 报表类型选项
export interface ReportTypeOption {
  label: string
  value: string
}

// 分页查询参数类型
export interface ReportPageQuery {
  page: number
  size: number
  keyword?: string
}

// 报表生成结果类型
export interface ReportGenerationResult {
  downloadUrl: string
  fileName: string
  fileSize: number
  generatedAt: string
}

// 报表导出参数类型
export interface ReportExportParams {
  config: ReportConfig
  fileName?: string
}

// 模板创建表单类型
export interface TemplateCreateForm {
  name: string
  description?: string
  config: ReportConfig
}

// 模板更新表单类型
export interface TemplateUpdateForm {
  name?: string
  description?: string
  config?: ReportConfig
}