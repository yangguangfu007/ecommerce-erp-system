/**
 * 数据导出 Composable
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataExporter, ExportFormat, type ExportConfig, type ExportColumn, type ExportResult } from '@/utils/export'

/**
 * 导出历史记录
 */
export interface ExportHistory {
  id: string
  filename: string
  format: ExportFormat
  recordCount: number
  fileSize: number
  exportTime: string
  status: 'success' | 'failed'
  error?: string
}

/**
 * 导出选项
 */
export interface ExportOptions {
  showProgress?: boolean
  showHistory?: boolean
  maxHistorySize?: number
  autoDownload?: boolean
}

/**
 * 使用导出功能
 */
export function useExport(options: ExportOptions = {}) {
  const {
    showProgress = true,
    showHistory = true,
    maxHistorySize = 50,
    autoDownload = true
  } = options

  // 状态
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const exportHistory = ref<ExportHistory[]>([])
  const currentExport = ref<ExportHistory | null>(null)

  // 从本地存储加载历史记录
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('export_history')
      if (stored) {
        exportHistory.value = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('加载导出历史失败:', error)
    }
  }

  // 保存历史记录到本地存储
  const saveHistory = () => {
    try {
      localStorage.setItem('export_history', JSON.stringify(exportHistory.value))
    } catch (error) {
      console.warn('保存导出历史失败:', error)
    }
  }

  // 添加历史记录
  const addHistory = (record: ExportHistory) => {
    exportHistory.value.unshift(record)
    
    // 限制历史记录数量
    if (exportHistory.value.length > maxHistorySize) {
      exportHistory.value = exportHistory.value.slice(0, maxHistorySize)
    }
    
    if (showHistory) {
      saveHistory()
    }
  }

  // 计算属性
  const hasHistory = computed(() => exportHistory.value.length > 0)
  const successfulExports = computed(() => 
    exportHistory.value.filter(item => item.status === 'success')
  )
  const failedExports = computed(() => 
    exportHistory.value.filter(item => item.status === 'failed')
  )

  /**
   * 执行导出
   */
  const executeExport = async (config: ExportConfig): Promise<ExportResult> => {
    // 验证配置
    const errors = DataExporter.validateConfig(config)
    if (errors.length > 0) {
      const errorMessage = errors.join('; ')
      ElMessage.error(errorMessage)
      throw new Error(errorMessage)
    }

    isExporting.value = true
    exportProgress.value = 0

    try {
      // 创建历史记录
      const historyRecord: ExportHistory = {
        id: `export_${Date.now()}`,
        filename: config.filename || `export_${Date.now()}`,
        format: config.format,
        recordCount: config.data.length,
        fileSize: 0,
        exportTime: new Date().toISOString(),
        status: 'success'
      }

      currentExport.value = historyRecord

      // 模拟进度更新
      if (showProgress) {
        const progressInterval = setInterval(() => {
          if (exportProgress.value < 90) {
            exportProgress.value += Math.random() * 20
          }
        }, 100)

        // 执行导出
        const result = await DataExporter.export(config)
        
        clearInterval(progressInterval)
        exportProgress.value = 100

        // 更新历史记录
        if (result.success) {
          historyRecord.fileSize = result.size || 0
          historyRecord.status = 'success'
          
          if (autoDownload) {
            ElMessage.success(`导出成功: ${result.filename}`)
          }
        } else {
          historyRecord.status = 'failed'
          historyRecord.error = result.error
          ElMessage.error(`导出失败: ${result.error}`)
        }

        addHistory(historyRecord)
        return result
      } else {
        // 直接导出
        const result = await DataExporter.export(config)
        
        // 更新历史记录
        if (result.success) {
          historyRecord.fileSize = result.size || 0
          historyRecord.status = 'success'
          ElMessage.success(`导出成功: ${result.filename}`)
        } else {
          historyRecord.status = 'failed'
          historyRecord.error = result.error
          ElMessage.error(`导出失败: ${result.error}`)
        }

        addHistory(historyRecord)
        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导出失败'
      
      // 添加失败记录
      const failedRecord: ExportHistory = {
        id: `export_${Date.now()}`,
        filename: config.filename || `export_${Date.now()}`,
        format: config.format,
        recordCount: config.data.length,
        fileSize: 0,
        exportTime: new Date().toISOString(),
        status: 'failed',
        error: errorMessage
      }
      
      addHistory(failedRecord)
      ElMessage.error(errorMessage)
      
      throw error
    } finally {
      isExporting.value = false
      exportProgress.value = 0
      currentExport.value = null
    }
  }

  /**
   * 导出到 Excel
   */
  const exportExcel = async (
    data: any[], 
    filename?: string, 
    columns?: ExportColumn[],
    title?: string
  ) => {
    return executeExport({
      data,
      format: ExportFormat.EXCEL,
      filename,
      columns,
      title
    })
  }

  /**
   * 导出到 CSV
   */
  const exportCSV = async (
    data: any[], 
    filename?: string, 
    columns?: ExportColumn[],
    title?: string
  ) => {
    return executeExport({
      data,
      format: ExportFormat.CSV,
      filename,
      columns,
      title
    })
  }

  /**
   * 导出到 PDF
   */
  const exportPDF = async (
    data: any[], 
    filename?: string, 
    columns?: ExportColumn[],
    title?: string
  ) => {
    return executeExport({
      data,
      format: ExportFormat.PDF,
      filename,
      columns,
      title
    })
  }

  /**
   * 导出到 JSON
   */
  const exportJSON = async (
    data: any[], 
    filename?: string, 
    columns?: ExportColumn[],
    title?: string
  ) => {
    return executeExport({
      data,
      format: ExportFormat.JSON,
      filename,
      columns,
      title
    })
  }

  /**
   * 批量导出
   */
  const batchExport = async (configs: ExportConfig[]) => {
    const results: ExportResult[] = []
    
    for (let i = 0; i < configs.length; i++) {
      try {
        const result = await executeExport(configs[i])
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          filename: configs[i].filename || `export_${i}`,
          error: error instanceof Error ? error.message : '导出失败'
        })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount
    
    if (failCount === 0) {
      ElMessage.success(`批量导出完成，成功 ${successCount} 个文件`)
    } else {
      ElMessage.warning(`批量导出完成，成功 ${successCount} 个，失败 ${failCount} 个`)
    }
    
    return results
  }

  /**
   * 清空历史记录
   */
  const clearHistory = async () => {
    try {
      await ElMessageBox.confirm('确定要清空所有导出历史记录吗？', '确认操作', {
        type: 'warning'
      })
      
      exportHistory.value = []
      localStorage.removeItem('export_history')
      ElMessage.success('历史记录已清空')
    } catch (error) {
      // 用户取消操作
    }
  }

  /**
   * 删除历史记录
   */
  const removeHistory = (id: string) => {
    const index = exportHistory.value.findIndex(item => item.id === id)
    if (index !== -1) {
      exportHistory.value.splice(index, 1)
      saveHistory()
      ElMessage.success('记录已删除')
    }
  }

  /**
   * 重新导出
   */
  const reExport = async (historyId: string, newData?: any[]) => {
    const history = exportHistory.value.find(item => item.id === historyId)
    if (!history) {
      ElMessage.error('找不到历史记录')
      return
    }

    if (!newData) {
      ElMessage.error('请提供要导出的数据')
      return
    }

    const config: ExportConfig = {
      data: newData,
      format: history.format,
      filename: `${history.filename}_${Date.now()}`
    }

    return executeExport(config)
  }

  /**
   * 获取格式化的文件大小
   */
  const formatFileSize = (bytes: number): string => {
    return DataExporter.formatFileSize(bytes)
  }

  /**
   * 获取格式显示名称
   */
  const getFormatDisplayName = (format: ExportFormat): string => {
    const formatNames = {
      [ExportFormat.EXCEL]: 'Excel',
      [ExportFormat.CSV]: 'CSV',
      [ExportFormat.PDF]: 'PDF',
      [ExportFormat.JSON]: 'JSON'
    }
    return formatNames[format] || format
  }

  // 初始化
  if (showHistory) {
    loadHistory()
  }

  return {
    // 状态
    isExporting,
    exportProgress,
    exportHistory,
    currentExport,
    
    // 计算属性
    hasHistory,
    successfulExports,
    failedExports,
    
    // 方法
    executeExport,
    exportExcel,
    exportCSV,
    exportPDF,
    exportJSON,
    batchExport,
    clearHistory,
    removeHistory,
    reExport,
    formatFileSize,
    getFormatDisplayName
  }
}