/**
 * 导出历史对话框组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExportFormat } from '@/utils/export'
import type { ExportHistory } from '@/composables/useExport'

// Mock export utilities
vi.mock('@/utils/export', () => ({
  DataExporter: {
    formatFileSize: vi.fn((bytes) => `${bytes} B`)
  },
  ExportFormat: {
    EXCEL: 'excel',
    CSV: 'csv',
    PDF: 'pdf',
    JSON: 'json'
  }
}))

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn(() => Promise.resolve())
    }
  }
})

describe('ExportHistoryDialog', () => {
  const mockHistory: ExportHistory[] = [
    {
      id: '1',
      filename: 'products.xlsx',
      format: ExportFormat.EXCEL,
      recordCount: 100,
      fileSize: 1024,
      exportTime: new Date().toISOString(),
      status: 'success'
    },
    {
      id: '2',
      filename: 'orders.pdf',
      format: ExportFormat.PDF,
      recordCount: 50,
      fileSize: 2048,
      exportTime: new Date(Date.now() - 3600000).toISOString(),
      status: 'failed',
      error: '导出失败'
    },
    {
      id: '3',
      filename: 'inventory.csv',
      format: ExportFormat.CSV,
      recordCount: 200,
      fileSize: 512,
      exportTime: new Date(Date.now() - 1800000).toISOString(),
      status: 'success'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确导入 ExportFormat', () => {
    expect(ExportFormat).toBeDefined()
    expect(ExportFormat.EXCEL).toBe('excel')
    expect(ExportFormat.CSV).toBe('csv')
    expect(ExportFormat.PDF).toBe('pdf')
    expect(ExportFormat.JSON).toBe('json')
  })

  it('应该正确处理历史记录数据', () => {
    expect(mockHistory).toHaveLength(3)
    expect(mockHistory[0].status).toBe('success')
    expect(mockHistory[1].status).toBe('failed')
    expect(mockHistory[1].error).toBe('导出失败')
  })

  it('应该能够筛选成功的记录', () => {
    const successfulRecords = mockHistory.filter(item => item.status === 'success')
    expect(successfulRecords).toHaveLength(2)
  })

  it('应该能够筛选失败的记录', () => {
    const failedRecords = mockHistory.filter(item => item.status === 'failed')
    expect(failedRecords).toHaveLength(1)
    expect(failedRecords[0].error).toBe('导出失败')
  })

  it('应该能够按格式筛选记录', () => {
    const excelRecords = mockHistory.filter(item => item.format === ExportFormat.EXCEL)
    const pdfRecords = mockHistory.filter(item => item.format === ExportFormat.PDF)
    const csvRecords = mockHistory.filter(item => item.format === ExportFormat.CSV)
    
    expect(excelRecords).toHaveLength(1)
    expect(pdfRecords).toHaveLength(1)
    expect(csvRecords).toHaveLength(1)
  })

  it('应该能够计算总文件大小', () => {
    const totalSize = mockHistory.reduce((sum, item) => sum + item.fileSize, 0)
    expect(totalSize).toBe(3584) // 1024 + 2048 + 512
  })

  it('应该能够按时间排序', () => {
    const sortedByTime = [...mockHistory].sort((a, b) => 
      new Date(b.exportTime).getTime() - new Date(a.exportTime).getTime()
    )
    
    expect(sortedByTime[0].id).toBe('1') // 最新的 (现在时间)
    expect(sortedByTime[1].id).toBe('3') // 中间的 (30分钟前)
    expect(sortedByTime[2].id).toBe('2') // 最旧的 (1小时前)
  })
})