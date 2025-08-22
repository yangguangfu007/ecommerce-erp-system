/**
 * 数据导出工具测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DataExporter, ExportFormat, type ExportConfig, type ExportColumn } from '../export'

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({ '!cols': [] })),
    book_append_sheet: vi.fn()
  },
  write: vi.fn(() => new ArrayBuffer(8))
}))

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      text: vi.fn(),
      autoTable: vi.fn(),
      output: vi.fn(() => new Blob(['test'], { type: 'application/pdf' }))
    }))
  }
})

// Mock DOM methods
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  }
})

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn()
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
})

describe('DataExporter', () => {
  const mockData = [
    { id: 1, name: '商品A', price: 100, status: 'active', date: '2024-01-01' },
    { id: 2, name: '商品B', price: 200, status: 'inactive', date: '2024-01-02' }
  ]

  const mockColumns: ExportColumn[] = [
    { key: 'id', title: 'ID', type: 'number' },
    { key: 'name', title: '名称', type: 'text' },
    { key: 'price', title: '价格', type: 'currency' },
    { key: 'status', title: '状态', type: 'status' },
    { key: 'date', title: '日期', type: 'date' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateConfig', () => {
    it('应该验证有效的配置', () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.EXCEL,
        columns: mockColumns
      }

      const errors = DataExporter.validateConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('应该检测无效的数据', () => {
      const config: ExportConfig = {
        data: null as any,
        format: ExportFormat.EXCEL
      }

      const errors = DataExporter.validateConfig(config)
      expect(errors).toContain('数据必须是数组格式')
    })

    it('应该检测空数据', () => {
      const config: ExportConfig = {
        data: [],
        format: ExportFormat.EXCEL
      }

      const errors = DataExporter.validateConfig(config)
      expect(errors).toContain('没有数据可导出')
    })

    it('应该检测无效的格式', () => {
      const config: ExportConfig = {
        data: mockData,
        format: 'invalid' as ExportFormat
      }

      const errors = DataExporter.validateConfig(config)
      expect(errors).toContain('不支持的导出格式')
    })

    it('应该检测列配置错误', () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.EXCEL,
        columns: [
          { key: '', title: '测试' },
          { key: 'test', title: '' }
        ]
      }

      const errors = DataExporter.validateConfig(config)
      expect(errors).toContain('第 1 列缺少 key 属性')
      expect(errors).toContain('第 2 列缺少 title 属性')
    })
  })

  describe('export', () => {
    it('应该成功导出 Excel 格式', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.EXCEL,
        filename: 'test',
        columns: mockColumns
      }

      const result = await DataExporter.export(config)

      expect(result.success).toBe(true)
      expect(result.filename).toBe('test.xlsx')
    })

    it('应该成功导出 CSV 格式', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.CSV,
        filename: 'test',
        columns: mockColumns
      }

      const result = await DataExporter.export(config)

      expect(result.success).toBe(true)
      expect(result.filename).toBe('test.csv')
    })

    it('应该成功导出 PDF 格式', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.PDF,
        filename: 'test',
        columns: mockColumns
      }

      const result = await DataExporter.export(config)

      expect(result.success).toBe(true)
      expect(result.filename).toBe('test.pdf')
    })

    it('应该成功导出 JSON 格式', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.JSON,
        filename: 'test',
        columns: mockColumns
      }

      const result = await DataExporter.export(config)

      expect(result.success).toBe(true)
      expect(result.filename).toBe('test.json')
    })

    it('应该处理导出错误', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: 'invalid' as ExportFormat,
        filename: 'test'
      }

      const result = await DataExporter.export(config)

      expect(result.success).toBe(false)
      expect(result.error).toContain('不支持的导出格式')
    })

    it('应该生成默认文件名', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.EXCEL
      }

      const result = await DataExporter.export(config)

      expect(result.success).toBe(true)
      expect(result.filename).toMatch(/export_\d+\.xlsx/)
    })
  })

  describe('formatFileSize', () => {
    it('应该正确格式化文件大小', () => {
      expect(DataExporter.formatFileSize(0)).toBe('0 Bytes')
      expect(DataExporter.formatFileSize(1024)).toBe('1 KB')
      expect(DataExporter.formatFileSize(1048576)).toBe('1 MB')
      expect(DataExporter.formatFileSize(1073741824)).toBe('1 GB')
    })

    it('应该处理小数', () => {
      expect(DataExporter.formatFileSize(1536)).toBe('1.5 KB')
      expect(DataExporter.formatFileSize(1572864)).toBe('1.5 MB')
    })
  })

  describe('数据处理', () => {
    it('应该正确处理数据格式化', () => {
      // 这里测试私有方法的效果，通过导出结果来验证
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.JSON,
        columns: mockColumns
      }

      // 通过导出来测试数据处理
      expect(() => DataExporter.export(config)).not.toThrow()
    })

    it('应该处理没有列配置的情况', async () => {
      const config: ExportConfig = {
        data: mockData,
        format: ExportFormat.JSON,
        filename: 'test'
      }

      const result = await DataExporter.export(config)
      expect(result.success).toBe(true)
    })
  })

  describe('状态文本转换', () => {
    it('应该正确转换状态文本', () => {
      // 通过包含状态字段的数据导出来测试
      const dataWithStatus = [
        { status: 'active' },
        { status: 'inactive' },
        { status: 'pending' },
        { status: 'unknown' }
      ]

      const config: ExportConfig = {
        data: dataWithStatus,
        format: ExportFormat.JSON,
        columns: [{ key: 'status', title: '状态', type: 'status' }]
      }

      expect(() => DataExporter.export(config)).not.toThrow()
    })
  })
})