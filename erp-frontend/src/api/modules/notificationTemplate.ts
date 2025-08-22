import { request } from '../request'
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

// 获取通知模板列表
export function getNotificationTemplateList(params: {
  page?: number
  pageSize?: number
  filter?: NotificationTemplateFilter
}) {
  return request<NotificationTemplateListResponse>({
    url: '/notification-templates',
    method: 'GET',
    params
  })
}

// 获取通知模板详情
export function getNotificationTemplateDetail(id: string) {
  return request<NotificationTemplate>({
    url: `/notification-templates/${id}`,
    method: 'GET'
  })
}

// 创建通知模板
export function createNotificationTemplate(data: NotificationTemplateCreateRequest) {
  return request<NotificationTemplate>({
    url: '/notification-templates',
    method: 'POST',
    data
  })
}

// 更新通知模板
export function updateNotificationTemplate(data: NotificationTemplateUpdateRequest) {
  return request<NotificationTemplate>({
    url: `/notification-templates/${data.id}`,
    method: 'PUT',
    data
  })
}

// 删除通知模板
export function deleteNotificationTemplate(id: string) {
  return request({
    url: `/notification-templates/${id}`,
    method: 'DELETE'
  })
}

// 批量删除通知模板
export function batchDeleteNotificationTemplates(ids: string[]) {
  return request({
    url: '/notification-templates/batch-delete',
    method: 'POST',
    data: { ids }
  })
}

// 复制通知模板
export function copyNotificationTemplate(id: string, name: string) {
  return request<NotificationTemplate>({
    url: `/notification-templates/${id}/copy`,
    method: 'POST',
    data: { name }
  })
}

// 预览通知模板
export function previewNotificationTemplate(data: TemplatePreviewRequest) {
  return request<TemplatePreviewResponse>({
    url: '/notification-templates/preview',
    method: 'POST',
    data
  })
}

// 获取模板版本历史
export function getTemplateVersionHistory(id: string) {
  return request<TemplateVersionHistory[]>({
    url: `/notification-templates/${id}/versions`,
    method: 'GET'
  })
}

// 恢复模板版本
export function restoreTemplateVersion(id: string, version: string) {
  return request<NotificationTemplate>({
    url: `/notification-templates/${id}/versions/${version}/restore`,
    method: 'POST'
  })
}

// 激活/停用模板
export function toggleTemplateStatus(id: string, status: 'active' | 'inactive') {
  return request<NotificationTemplate>({
    url: `/notification-templates/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}

// 验证模板语法
export function validateTemplate(content: string, variables: Record<string, any>) {
  return request<{ valid: boolean; errors: string[] }>({
    url: '/notification-templates/validate',
    method: 'POST',
    data: { content, variables }
  })
}

// 获取可用变量列表
export function getAvailableVariables(category: string) {
  return request<{ name: string; label: string; type: string; description: string }[]>({
    url: `/notification-templates/variables/${category}`,
    method: 'GET'
  })
}