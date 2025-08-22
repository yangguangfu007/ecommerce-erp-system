import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  NotificationTemplate,
  NotificationTemplateFilter,
  NotificationTemplateListResponse,
  NotificationTemplateCreateRequest,
  NotificationTemplateUpdateRequest,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TemplateVersionHistory
} from '@/types/notificationTemplate'
import {
  getNotificationTemplateList,
  getNotificationTemplateDetail,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  batchDeleteNotificationTemplates,
  copyNotificationTemplate,
  previewNotificationTemplate,
  getTemplateVersionHistory,
  restoreTemplateVersion,
  toggleTemplateStatus,
  validateTemplate,
  getAvailableVariables
} from '@/api/modules/notificationTemplate'

export const useNotificationTemplateStore = defineStore('notificationTemplate', () => {
  // 状态
  const templates = ref<NotificationTemplate[]>([])
  const currentTemplate = ref<NotificationTemplate | null>(null)
  const loading = ref(false)
  const filter = ref<NotificationTemplateFilter>({})
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const previewData = ref<TemplatePreviewResponse | null>(null)
  const versionHistory = ref<TemplateVersionHistory[]>([])
  const availableVariables = ref<{ name: string; label: string; type: string; description: string }[]>([])

  // 计算属性
  const filteredTemplates = computed(() => {
    let result = templates.value
    
    if (filter.value.name) {
      const keyword = filter.value.name.toLowerCase()
      result = result.filter(t => 
        t.name.toLowerCase().includes(keyword) ||
        t.title.toLowerCase().includes(keyword)
      )
    }
    
    if (filter.value.type) {
      result = result.filter(t => t.type === filter.value.type)
    }
    
    if (filter.value.category) {
      result = result.filter(t => t.category === filter.value.category)
    }
    
    if (filter.value.status) {
      result = result.filter(t => t.status === filter.value.status)
    }
    
    if (filter.value.createdBy) {
      result = result.filter(t => t.createdBy.includes(filter.value.createdBy!))
    }
    
    return result
  })

  const activeTemplates = computed(() => 
    templates.value.filter(t => t.status === 'active')
  )

  const draftTemplates = computed(() => 
    templates.value.filter(t => t.status === 'draft')
  )

  // 操作方法
  const fetchTemplates = async (params?: {
    page?: number
    pageSize?: number
    filter?: NotificationTemplateFilter
  }) => {
    try {
      loading.value = true
      const response = await getNotificationTemplateList({
        page: params?.page || pagination.value.page,
        pageSize: params?.pageSize || pagination.value.pageSize,
        filter: params?.filter || filter.value
      })
      
      templates.value = response.data.data
      pagination.value = {
        page: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchTemplateDetail = async (id: string) => {
    try {
      const response = await getNotificationTemplateDetail(id)
      currentTemplate.value = response.data
      
      // 更新列表中的模板
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = response.data
      }
    } catch (error) {
      console.error('Failed to fetch template detail:', error)
      throw error
    }
  }

  const createTemplate = async (data: NotificationTemplateCreateRequest) => {
    try {
      const response = await createNotificationTemplate(data)
      templates.value.unshift(response.data)
      pagination.value.total += 1
      return response.data
    } catch (error) {
      console.error('Failed to create template:', error)
      throw error
    }
  }

  const updateTemplate = async (data: NotificationTemplateUpdateRequest) => {
    try {
      const response = await updateNotificationTemplate(data)
      
      // 更新列表中的模板
      const index = templates.value.findIndex(t => t.id === data.id)
      if (index !== -1) {
        templates.value[index] = response.data
      }
      
      // 更新当前模板
      if (currentTemplate.value?.id === data.id) {
        currentTemplate.value = response.data
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to update template:', error)
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      await deleteNotificationTemplate(id)
      
      // 从列表中移除
      templates.value = templates.value.filter(t => t.id !== id)
      pagination.value.total -= 1
      
      // 清除当前模板
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw error
    }
  }

  const batchDeleteTemplates = async (ids: string[]) => {
    try {
      await batchDeleteNotificationTemplates(ids)
      
      // 从列表中移除
      templates.value = templates.value.filter(t => !ids.includes(t.id))
      pagination.value.total -= ids.length
      
      // 清除当前模板如果被删除
      if (currentTemplate.value && ids.includes(currentTemplate.value.id)) {
        currentTemplate.value = null
      }
    } catch (error) {
      console.error('Failed to batch delete templates:', error)
      throw error
    }
  }

  const copyTemplate = async (id: string, name: string) => {
    try {
      const response = await copyNotificationTemplate(id, name)
      templates.value.unshift(response.data)
      pagination.value.total += 1
      return response.data
    } catch (error) {
      console.error('Failed to copy template:', error)
      throw error
    }
  }

  const previewTemplate = async (data: TemplatePreviewRequest) => {
    try {
      const response = await previewNotificationTemplate(data)
      previewData.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to preview template:', error)
      throw error
    }
  }

  const fetchVersionHistory = async (id: string) => {
    try {
      const response = await getTemplateVersionHistory(id)
      versionHistory.value = response.data
    } catch (error) {
      console.error('Failed to fetch version history:', error)
      throw error
    }
  }

  const restoreVersion = async (id: string, version: string) => {
    try {
      const response = await restoreTemplateVersion(id, version)
      
      // 更新列表中的模板
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = response.data
      }
      
      // 更新当前模板
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = response.data
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to restore version:', error)
      throw error
    }
  }

  const toggleStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await toggleTemplateStatus(id, status)
      
      // 更新列表中的模板
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = response.data
      }
      
      // 更新当前模板
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = response.data
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to toggle status:', error)
      throw error
    }
  }

  const validateTemplateContent = async (content: string, variables: Record<string, any>) => {
    try {
      const response = await validateTemplate(content, variables)
      return response.data
    } catch (error) {
      console.error('Failed to validate template:', error)
      throw error
    }
  }

  const fetchAvailableVariables = async (category: string) => {
    try {
      const response = await getAvailableVariables(category)
      availableVariables.value = response.data
    } catch (error) {
      console.error('Failed to fetch available variables:', error)
      throw error
    }
  }

  const updateFilter = (newFilter: Partial<NotificationTemplateFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const resetFilter = () => {
    filter.value = {}
  }

  const updatePagination = (page: number, pageSize?: number) => {
    pagination.value.page = page
    if (pageSize) {
      pagination.value.pageSize = pageSize
    }
  }

  const clearPreview = () => {
    previewData.value = null
  }

  const clearVersionHistory = () => {
    versionHistory.value = []
  }

  const clearCurrentTemplate = () => {
    currentTemplate.value = null
  }

  return {
    // 状态
    templates,
    currentTemplate,
    loading,
    filter,
    pagination,
    previewData,
    versionHistory,
    availableVariables,
    
    // 计算属性
    filteredTemplates,
    activeTemplates,
    draftTemplates,
    
    // 方法
    fetchTemplates,
    fetchTemplateDetail,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    batchDeleteTemplates,
    copyTemplate,
    previewTemplate,
    fetchVersionHistory,
    restoreVersion,
    toggleStatus,
    validateTemplateContent,
    fetchAvailableVariables,
    updateFilter,
    resetFilter,
    updatePagination,
    clearPreview,
    clearVersionHistory,
    clearCurrentTemplate
  }
})