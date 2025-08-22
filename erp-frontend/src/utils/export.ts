/**
 * 数据导出工具类
 */
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// 扩展 jsPDF 类型定义
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
  JSON = 'json'
}

/**
 * 导出配置接口
 */
export interface ExportConfig {
  filename?: string
  format: ExportFormat
  data: any[]
  columns?: ExportColumn[]
  title?: string
  subtitle?: string
  showHeader?: boolean
  dateFormat?: string
}

/**
 * 导出列配置
 */
export interface ExportColumn {
  key: string
  title: string
  width?: number
  formatter?: (value: any, row: any) => string
  type?: 'text' | 'number' | 'date' | 'currency' | 'status'
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean
  filename: string
  url?: string
  error?: string
  size?: number
}

/**
 * 数据导出类
 */
export class DataExporter {
  /**
   * 导出数据
   */
  static async export(config: ExportConfig): Promise<ExportResult> {
    try {
      const filename = config.filename || `export_${Date.now()}`
      
      switch (config.format) {
        case ExportFormat.EXCEL:
          return await this.exportToExcel(config, filename)
        case ExportFormat.CSV:
          return await this.exportToCSV(config, filename)
        case ExportFormat.PDF:
          return await this.exportToPDF(config, filename)
        case ExportFormat.JSON:
          return await this.exportToJSON(config, filename)
        default:
          throw new Error(`不支持的导出格式: ${config.format}`)
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  /**
   * 导出到 Excel
   */
  private static async exportToExcel(config: ExportConfig, filename: string): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new()
    const processedData = this.processData(config.data, config.columns)
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(processedData)
    
    // 设置列宽
    if (config.columns) {
      const colWidths = config.columns.map(col => ({
        wch: col.width || 15
      }))
      worksheet['!cols'] = colWidths
    }
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    // 生成文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    return this.downloadBlob(blob, `${filename}.xlsx`)
  }

  /**
   * 导出到 CSV
   */
  private static async exportToCSV(config: ExportConfig, filename: string): Promise<ExportResult> {
    const processedData = this.processData(config.data, config.columns)
    
    if (processedData.length === 0) {
      throw new Error('没有数据可导出')
    }
    
    // 生成 CSV 内容
    const headers = config.columns?.map(col => col.title) || Object.keys(processedData[0])
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => 
        headers.map(header => {
          const key = config.columns?.find(col => col.title === header)?.key || header
          const value = row[key] || ''
          // 处理包含逗号或引号的值
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')
    
    // 添加 BOM 以支持中文
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    
    return this.downloadBlob(blob, `${filename}.csv`)
  }

  /**
   * 导出到 PDF
   */
  private static async exportToPDF(config: ExportConfig, filename: string): Promise<ExportResult> {
    const doc = new jsPDF()
    
    // 设置中文字体（需要额外配置）
    doc.setFont('helvetica')
    
    // 添加标题
    if (config.title) {
      doc.setFontSize(16)
      doc.text(config.title, 20, 20)
    }
    
    if (config.subtitle) {
      doc.setFontSize(12)
      doc.text(config.subtitle, 20, 30)
    }
    
    // 准备表格数据
    const processedData = this.processData(config.data, config.columns)
    const headers = config.columns?.map(col => col.title) || Object.keys(processedData[0] || {})
    const rows = processedData.map(row => 
      headers.map(header => {
        const key = config.columns?.find(col => col.title === header)?.key || header
        return row[key] || ''
      })
    )
    
    // 生成表格
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: config.title || config.subtitle ? 40 : 20,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    })
    
    // 生成 PDF
    const pdfBlob = doc.output('blob')
    
    return this.downloadBlob(pdfBlob, `${filename}.pdf`)
  }

  /**
   * 导出到 JSON
   */
  private static async exportToJSON(config: ExportConfig, filename: string): Promise<ExportResult> {
    const processedData = this.processData(config.data, config.columns)
    
    const jsonContent = JSON.stringify({
      title: config.title,
      exportTime: new Date().toISOString(),
      totalRecords: processedData.length,
      data: processedData
    }, null, 2)
    
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
    
    return this.downloadBlob(blob, `${filename}.json`)
  }

  /**
   * 处理数据
   */
  private static processData(data: any[], columns?: ExportColumn[]): any[] {
    if (!columns) {
      return data
    }
    
    return data.map(row => {
      const processedRow: any = {}
      
      columns.forEach(col => {
        let value = row[col.key]
        
        // 应用格式化器
        if (col.formatter) {
          value = col.formatter(value, row)
        } else {
          // 默认格式化
          value = this.formatValue(value, col.type)
        }
        
        processedRow[col.key] = value
      })
      
      return processedRow
    })
  }

  /**
   * 格式化值
   */
  private static formatValue(value: any, type?: string): string {
    if (value === null || value === undefined) {
      return ''
    }
    
    switch (type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value)
      case 'currency':
        return typeof value === 'number' ? `¥${value.toFixed(2)}` : String(value)
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value)
      case 'status':
        return this.getStatusText(value)
      default:
        return String(value)
    }
  }

  /**
   * 获取状态文本
   */
  private static getStatusText(status: any): string {
    const statusMap: Record<string, string> = {
      'active': '启用',
      'inactive': '禁用',
      'pending': '待处理',
      'completed': '已完成',
      'cancelled': '已取消',
      'online': '在线',
      'offline': '离线'
    }
    
    return statusMap[String(status).toLowerCase()] || String(status)
  }

  /**
   * 下载 Blob
   */
  private static downloadBlob(blob: Blob, filename: string): ExportResult {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 延迟释放 URL
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    
    return {
      success: true,
      filename,
      url,
      size: blob.size
    }
  }

  /**
   * 获取文件大小文本
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 验证导出配置
   */
  static validateConfig(config: ExportConfig): string[] {
    const errors: string[] = []
    
    if (!config.data || !Array.isArray(config.data)) {
      errors.push('数据必须是数组格式')
    }
    
    if (config.data && config.data.length === 0) {
      errors.push('没有数据可导出')
    }
    
    if (!Object.values(ExportFormat).includes(config.format)) {
      errors.push('不支持的导出格式')
    }
    
    if (config.columns) {
      config.columns.forEach((col, index) => {
        if (!col.key) {
          errors.push(`第 ${index + 1} 列缺少 key 属性`)
        }
        if (!col.title) {
          errors.push(`第 ${index + 1} 列缺少 title 属性`)
        }
      })
    }
    
    return errors
  }
}

/**
 * 快捷导出函数
 */
export const exportToExcel = (data: any[], filename?: string, columns?: ExportColumn[]) => {
  return DataExporter.export({
    data,
    format: ExportFormat.EXCEL,
    filename,
    columns
  })
}

export const exportToCSV = (data: any[], filename?: string, columns?: ExportColumn[]) => {
  return DataExporter.export({
    data,
    format: ExportFormat.CSV,
    filename,
    columns
  })
}

export const exportToPDF = (data: any[], filename?: string, columns?: ExportColumn[]) => {
  return DataExporter.export({
    data,
    format: ExportFormat.PDF,
    filename,
    columns
  })
}

export const exportToJSON = (data: any[], filename?: string, columns?: ExportColumn[]) => {
  return DataExporter.export({
    data,
    format: ExportFormat.JSON,
    filename,
    columns
  })
}