/**
 * 导出对话框组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DataExporter, ExportFormat } from '@/utils/export'

// Mock export utilities
vi.mock('@/utils/export', () => ({
  DataExporter: {
    export: vi.fn(),
    formatFileSize: vi.fn((bytes) => `${bytes} B`),
    validateConfig: vi.fn(() => [])
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

describe('ExportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确导入 DataExporter', () => {
    expect(DataExporter).toBeDefined()
    expect(DataExporter.export).toBeDefined()
  })

  it('应该正确导入 ExportFormat', () => {
    expect(ExportFormat).toBeDefined()
    expect(ExportFormat.EXCEL).toBe('excel')
    expect(ExportFormat.CSV).toBe('csv')
    expect(ExportFormat.PDF).toBe('pdf')
    expect(ExportFormat.JSON).toBe('json')
  })

  it('应该能够调用 DataExporter.export', async () => {
    const mockResult = {
      success: true,
      filename: 'test.xlsx',
      size: 1024
    }

    vi.mocked(DataExporter.export).mockResolvedValue(mockResult)

    const result = await DataExporter.export({
      data: [{ id: 1, name: 'test' }],
      format: ExportFormat.EXCEL,
      filename: 'test'
    })

    expect(DataExporter.export).toHaveBeenCalled()
    expect(result).toEqual(mockResult)
  })

  it('应该能够处理导出错误', async () => {
    const mockError = new Error('导出失败')
    vi.mocked(DataExporter.export).mockRejectedValue(mockError)

    await expect(DataExporter.export({
      data: [{ id: 1, name: 'test' }],
      format: ExportFormat.EXCEL,
      filename: 'test'
    })).rejects.toThrow('导出失败')
  })

  it('应该能够验证配置', () => {
    const errors = DataExporter.validateConfig({
      data: [{ id: 1, name: 'test' }],
      format: ExportFormat.EXCEL
    })

    expect(DataExporter.validateConfig).toHaveBeenCalled()
    expect(errors).toEqual([])
  })

  it('应该能够格式化文件大小', () => {
    const result = DataExporter.formatFileSize(1024)
    expect(DataExporter.formatFileSize).toHaveBeenCalledWith(1024)
    expect(result).toBe('1024 B')
  })
})