export interface NotificationTemplate {
  id: string
  name: string
  title: string
  content: string
  type: 'email' | 'sms' | 'system' | 'push'
  category: 'system' | 'order' | 'inventory' | 'logistics' | 'platform'
  variables: TemplateVariable[]
  status: 'active' | 'inactive' | 'draft'
  version: string
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'object'
  required: boolean
  defaultValue?: any
  description?: string
  validation?: TemplateVariableValidation
}

export interface TemplateVariableValidation {
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  options?: string[]
}

export interface NotificationTemplateFilter {
  name?: string
  type?: string
  category?: string
  status?: string
  createdBy?: string
  dateRange?: [string, string]
}

export interface NotificationTemplateListResponse {
  data: NotificationTemplate[]
  total: number
  page: number
  pageSize: number
}

export interface TemplatePreviewRequest {
  templateId: string
  variables: Record<string, any>
}

export interface TemplatePreviewResponse {
  title: string
  content: string
  renderedAt: string
}

export interface TemplateVersionHistory {
  version: string
  changes: string
  createdAt: string
  createdBy: string
}

export interface NotificationTemplateCreateRequest {
  name: string
  title: string
  content: string
  type: 'email' | 'sms' | 'system' | 'push'
  category: 'system' | 'order' | 'inventory' | 'logistics' | 'platform'
  variables: TemplateVariable[]
  description?: string
}

export interface NotificationTemplateUpdateRequest extends Partial<NotificationTemplateCreateRequest> {
  id: string
  version?: string
}