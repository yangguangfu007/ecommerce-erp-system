/**
 * 报表管理状态管理
 * 管理报表生成、模板管理等状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reportApi, reportTemplateApi } from '@/api/modules/report'
import type { ReportConfig, ReportTemplate, ReportPreviewData } from '@/api/modules/report'

export const useReportStore = defineStore('report', () => {
  // 状态数据
  const loading = ref(false)
  const error = ref<string | null>(null)
  const generating = ref(false)
  const previewing = ref(false)
  
  // 报表配置
  const currentConfig = ref<ReportConfig | null>(null)
  const previewData = ref<ReportPreviewData | null>(null)
  
  // 模板管理
  const templates = ref<ReportTemplate[]>([])
  const templatesLoading = ref(false)
  const templatesTotal = ref(0)
  
  // 配置选项
  const dataSources = ref<Array<{ label: string; value: string }>>([])
  const dimensions = ref<Array<{ key: string; label: string }>>([])
  const metrics = ref<Array<{ label: string; value: string }>>([])
  const fields = ref<Array<{ label: string; value: string }>>([])

  // 计算属性
  const hasPreviewData = computed(() => {
    return previewData.value && previewData.value.data.length > 0
  })

  const canGenerate = computed(() => {
    return currentConfig.value && 
           currentConfig.value.name && 
           currentConfig.value.type && 
           currentConfig.value.dataSource &&
           currentConfig.value.dateRange.length === 2
  })

  // 操作方法
  const setError = (message: string) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  /**
   * 生成报表预览
   */
  const generatePreview = async (config: ReportConfig): Promise<void> => {
    if (!config) {
      throw new Error('报表配置不能为空')
    }

    previewing.value = true
    clearError()

    try {
      const result = await reportApi.generatePreview(config)
      previewData.value = result
      currentConfig.value = { ...config }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '生成预览失败'
      setError(message)
      throw new Error(message)
    } finally {
      previewing.value = false
    }
  }

  /**
   * 生成报表文件
   */
  const generateReport = async (config: ReportConfig): Promise<string> => {
    if (!config) {
      throw new Error('报表配置不能为空')
    }

    generating.value = true
    clearError()

    try {
      const result = await reportApi.generateReport(config)
      currentConfig.value = { ...config }
      return result.downloadUrl
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '生成报表失败'
      setError(message)
      throw new Error(message)
    } finally {
      generating.value = false
    }
  }

  /**
   * 导出报表
   */
  const exportReport = async (config: ReportConfig): Promise<Blob> => {
    if (!config) {
      throw new Error('报表配置不能为空')
    }

    loading.value = true
    clearError()

    try {
      const blob = await reportApi.exportReport(config)
      return blob
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '导出报表失败'
      setError(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取数据源列表
   */
  const fetchDataSources = async (): Promise<void> => {
    try {
      const result = await reportApi.getDataSources()
      dataSources.value = result
    } catch (err: any) {
      console.error('获取数据源失败:', err)
      // 使用默认数据源
      dataSources.value = [
        { label: '订单数据', value: 'orders' },
        { label: '商品数据', value: 'products' },
        { label: '库存数据', value: 'inventory' },
        { label: '用户数据', value: 'users' },
        { label: '销售数据', value: 'sales' },
        { label: '财务数据', value: 'finance' }
      ]
    }
  }

  /**
   * 获取维度列表
   */
  const fetchDimensions = async (dataSource: string): Promise<void> => {
    if (!dataSource) return

    try {
      const result = await reportApi.getDimensions(dataSource)
      dimensions.value = result
    } catch (err: any) {
      console.error('获取维度失败:', err)
      // 使用默认维度
      dimensions.value = [
        { key: 'date', label: '日期' },
        { key: 'month', label: '月份' },
        { key: 'quarter', label: '季度' },
        { key: 'year', label: '年份' },
        { key: 'category', label: '商品分类' },
        { key: 'brand', label: '品牌' },
        { key: 'platform', label: '平台' },
        { key: 'store', label: '店铺' },
        { key: 'region', label: '地区' }
      ]
    }
  }

  /**
   * 获取指标列表
   */
  const fetchMetrics = async (dataSource: string): Promise<void> => {
    if (!dataSource) return

    try {
      const result = await reportApi.getMetrics(dataSource)
      metrics.value = result
    } catch (err: any) {
      console.error('获取指标失败:', err)
      // 使用默认指标
      metrics.value = [
        { label: '销售额', value: 'sales_amount' },
        { label: '订单数量', value: 'order_count' },
        { label: '商品数量', value: 'product_count' },
        { label: '库存数量', value: 'inventory_count' },
        { label: '用户数量', value: 'user_count' },
        { label: '利润', value: 'profit' },
        { label: '成本', value: 'cost' }
      ]
    }
  }

  /**
   * 获取字段列表
   */
  const fetchFields = async (dataSource: string): Promise<void> => {
    if (!dataSource) return

    try {
      const result = await reportApi.getFields(dataSource)
      fields.value = result
    } catch (err: any) {
      console.error('获取字段失败:', err)
      // 使用默认字段
      fields.value = [
        { label: '订单状态', value: 'order_status' },
        { label: '商品分类', value: 'product_category' },
        { label: '品牌', value: 'brand' },
        { label: '平台', value: 'platform' },
        { label: '价格', value: 'price' },
        { label: '库存状态', value: 'inventory_status' }
      ]
    }
  }

  /**
   * 获取模板列表
   */
  const fetchTemplates = async (params?: { page?: number; size?: number; keyword?: string }): Promise<void> => {
    templatesLoading.value = true
    clearError()

    try {
      const result = await reportTemplateApi.getTemplates(params)
      templates.value = result.records
      templatesTotal.value = result.total
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '获取模板列表失败'
      setError(message)
      console.error('获取模板列表失败:', err)
    } finally {
      templatesLoading.value = false
    }
  }

  /**
   * 创建模板
   */
  const createTemplate = async (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> => {
    loading.value = true
    clearError()

    try {
      const result = await reportTemplateApi.createTemplate(template)
      templates.value.unshift(result)
      templatesTotal.value += 1
      return result
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '创建模板失败'
      setError(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新模板
   */
  const updateTemplate = async (id: number, template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    loading.value = true
    clearError()

    try {
      const result = await reportTemplateApi.updateTemplate(id, template)
      const index = templates.value.findIndex(t => t.id === id)
      if (index > -1) {
        templates.value[index] = result
      }
      return result
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '更新模板失败'
      setError(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除模板
   */
  const deleteTemplate = async (id: number): Promise<void> => {
    loading.value = true
    clearError()

    try {
      await reportTemplateApi.deleteTemplate(id)
      const index = templates.value.findIndex(t => t.id === id)
      if (index > -1) {
        templates.value.splice(index, 1)
        templatesTotal.value -= 1
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '删除模板失败'
      setError(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除模板
   */
  const batchDeleteTemplates = async (ids: number[]): Promise<void> => {
    loading.value = true
    clearError()

    try {
      await reportTemplateApi.batchDeleteTemplates(ids)
      templates.value = templates.value.filter(t => !ids.includes(t.id!))
      templatesTotal.value -= ids.length
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '批量删除模板失败'
      setError(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 初始化数据
   */
  const initializeData = async (): Promise<void> => {
    await Promise.all([
      fetchDataSources(),
      fetchTemplates({ page: 1, size: 50 })
    ])
  }

  /**
   * 重置状态
   */
  const resetState = (): void => {
    currentConfig.value = null
    previewData.value = null
    clearError()
  }

  return {
    // 状态
    loading,
    error,
    generating,
    previewing,
    currentConfig,
    previewData,
    templates,
    templatesLoading,
    templatesTotal,
    dataSources,
    dimensions,
    metrics,
    fields,
    
    // 计算属性
    hasPreviewData,
    canGenerate,
    
    // 方法
    setError,
    clearError,
    generatePreview,
    generateReport,
    exportReport,
    fetchDataSources,
    fetchDimensions,
    fetchMetrics,
    fetchFields,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    batchDeleteTemplates,
    initializeData,
    resetState
  }
})