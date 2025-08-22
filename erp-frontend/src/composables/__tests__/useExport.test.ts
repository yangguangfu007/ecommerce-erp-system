/**
 * useExport 组合式函数测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExport } from '../useExport'
import { DataExporter, ExportFormat } from '@/utils/export'

// Mock DataExporter
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

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useExport', () => {
  const mockData = [
    { id: 1, name: '商品1', price: 100 },
    { id: 2, name: '商品2', price: 200 },
    { id: 3, name: '商品3', price: 300 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('基础导出功能', () => {
    it('应该初始化正确的状态', () => {
      const { isExporting, exportProgress, exportHistory } = useExport()

      expect(isExporting.value).toBe(false)
      expect(exportProgress.value).toBe(0)
      expect(exportHistory.value).toEqual([])
    })

    it('应该能够导出数据', async () => {
      const mockResult = {
        success: true,
        filename: 'test.xlsx',
        size: 1024
      }

      vi.mocked(DataExporter.export).mockResolvedValue(mockResult)

      const { executeExport } = useExport()
      const result = await executeExport({
        data: mockData,
        format: ExportFormat.EXCEL,
        filename: 'test'
      })

      expect(DataExporter.export).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })

    it('应该处理导出错误', async () => {
      const mockError = new Error('导出失败')
      vi.mocked(DataExporter.export).mockRejectedValue(mockError)

      const { executeExport } = useExport()

      await expect(executeExport({
        data: mockData,
        format: ExportFormat.EXCEL,
        filename: 'test'
      })).rejects.toThrow('导出失败')
    })

    it('应该能够导出到 Excel', async () => {
      const mockResult = {
        success: true,
        filename: 'test.xlsx',
        size: 1024
      }

      vi.mocked(DataExporter.export).mockResolvedValue(mockResult)

      const { exportExcel } = useExport()
      const result = await exportExcel(mockData, 'test')

      expect(DataExporter.export).toHaveBeenCalledWith(
        expect.objectContaining({
          format: ExportFormat.EXCEL,
          data: mockData,
          filename: 'test'
        })
      )
      expect(result).toEqual(mockResult)
    })

    it('应该能够导出到 CSV', async () => {
      const mockResult = {
        success: true,
        filename: 'test.csv',
        size: 1024
      }

      vi.mocked(DataExporter.export).mockResolvedValue(mockResult)

      const { exportCSV } = useExport()
      const result = await exportCSV(mockData, 'test')

      expect(DataExporter.export).toHaveBeenCalledWith(
        expect.objectContaining({
          format: ExportFormat.CSV,
          data: mockData,
          filename: 'test'
        })
      )
      expect(result).toEqual(mockResult)
    })

    it('应该能够导出到 PDF', async () => {
      const mockResult = {
        success: true,
        filename: 'test.pdf',
        size: 1024
      }

      vi.mocked(DataExporter.export).mockResolvedValue(mockResult)

      const { exportPDF } = useExport()
      const result = await exportPDF(mockData, 'test')

      expect(DataExporter.export).toHaveBeenCalledWith(
        expect.objectContaining({
          format: ExportFormat.PDF,
          data: mockData,
          filename: 'test'
        })
      )
      expect(result).toEqual(mockResult)
    })

    it('应该能够导出到 JSON', async () => {
      const mockResult = {
        success: true,
        filename: 'test.json',
        size: 1024
      }

      vi.mocked(DataExporter.export).mockResolvedValue(mockResult)

      const { exportJSON } = useExport()
      const result = await exportJSON(mockData, 'test')

      expect(DataExporter.export).toHaveBeenCalledWith(
        expect.objectContaining({
          format: ExportFormat.JSON,
          data: mockData,
          filename: 'test'
        })
      )
      expect(result).toEqual(mockResult)
    })
  })

  describe('历史记录管理', () => {
    it('应该能够清除导出历史', async () => {
      const { clearHistory } = useExport()
      await clearHistory()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('export_history')
    })

    it('应该能够删除单个历史记录', () => {
      const mockHistory = [
        {
          id: '1',
          filename: 'test.xlsx',
          format: ExportFormat.EXCEL,
          recordCount: 3,
          fileSize: 1024,
          exportTime: new Date().toISOString(),
          status: 'success' as const
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))

      const { removeHistory, exportHistory } = useExport()
      removeHistory('1')

      expect(exportHistory.value).toHaveLength(0)
    })
  })

  describe('工具方法', () => {
    it('应该能够格式化文件大小', () => {
      const { formatFileSize } = useExport()
      const result = formatFileSize(1024)

      expect(DataExporter.formatFileSize).toHaveBeenCalledWith(1024)
      expect(result).toBe('1024 B')
    })

    it('应该能够获取格式显示名称', () => {
      const { getFormatDisplayName } = useExport()
      
      expect(getFormatDisplayName(ExportFormat.EXCEL)).toBe('Excel')
      expect(getFormatDisplayName(ExportFormat.CSV)).toBe('CSV')
      expect(getFormatDisplayName(ExportFormat.PDF)).toBe('PDF')
      expect(getFormatDisplayName(ExportFormat.JSON)).toBe('JSON')
    })
  })
})

// 移除 useTableExport 测试，因为当前实现中没有这个函数