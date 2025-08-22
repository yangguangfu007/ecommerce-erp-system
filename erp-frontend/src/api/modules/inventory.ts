import api from '@/api'
import type { 
  ApiResponse, 
  PageResponse
} from '@/types'
import type {
  Inventory,
  InventorySearchParams,
  InventoryAdjustment,
  InventoryHistory,
  InventoryAlert,
  InventoryTransaction,
  InventoryImportResult,
  InventoryTrend,
  StockTaking
} from '@/types/inventory'

// 定义查询参数接口
export interface InventoryQuery {
  page?: number
  size?: number
  sku?: string
  storeId?: number
  lowStock?: boolean
  keyword?: string
  name?: string
  categoryId?: number
  brand?: string
  status?: string
}

// 定义库存调整表单接口
export interface InventoryAdjustmentForm {
  type: 'IN' | 'OUT' | 'ADJUST'
  quantity: number
  reason: string
  note?: string
  referenceId?: string
  referenceType?: string
  operator?: string
}

// 定义库存预警配置接口
export interface InventoryAlertConfig {
  id?: number
  sku: string
  storeId?: number
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
  thresholdValue: number
  enabled: boolean
  notificationEmails?: string
  createdAt?: string
  updatedAt?: string
}

export const inventoryApi = {
  // 获取库存列表
  getInventoryList(params: InventoryQuery): Promise<ApiResponse<Inventory[]>> {
    return api.get('/inventory', { params })
  },

  // 获取库存详情
  getInventoryById(id: number): Promise<ApiResponse<Inventory>> {
    return api.get(`/inventory/${id}`)
  },

  // 根据SKU获取库存
  getInventoryBySku(sku: string, storeId?: number): Promise<ApiResponse<Inventory>> {
    return api.get(`/inventory/sku/${sku}`, { 
      params: storeId ? { storeId } : undefined 
    })
  },

  // 批量获取库存
  getInventoriesBySkus(skus: string[], storeId?: number): Promise<ApiResponse<Inventory[]>> {
    return api.post('/inventory/batch/skus', { 
      skus, 
      storeId 
    })
  },

  // 库存调整
  adjustInventory(id: string, data: InventoryAdjustmentForm): Promise<ApiResponse<boolean>> {
    return api.post(`/inventory/${id}/adjust`, data)
  },

  // 批量库存调整
  batchAdjustInventory(adjustments: Array<{
    id: string
    adjustment: InventoryAdjustmentForm
  }>): Promise<ApiResponse<boolean>> {
    return api.post('/inventory/batch/adjust', { adjustments })
  },

  // 更新库存信息
  updateInventory(data: any): Promise<ApiResponse<Inventory>> {
    return api.put(`/inventory/${data.id}`, data)
  },

  // 设置安全库存
  setSafetyStock(sku: string, safetyStock: number, storeId?: number): Promise<ApiResponse<Inventory>> {
    return api.put(`/inventory/sku/${sku}/safety-stock`, { 
      safetyStock, 
      storeId 
    })
  },

  // 搜索库存
  searchInventories(keyword: string, filters: Partial<InventoryQuery> = {}): Promise<ApiResponse<Inventory[]>> {
    return api.get('/inventory/search', { 
      params: { 
        keyword, 
        ...filters 
      } 
    })
  },

  // 获取库存历史记录
  getInventoryHistory(params: {
    page: number
    size: number
    sku?: string
    storeId?: number
    transactionType?: 'IN' | 'OUT' | 'ADJUST'
    operatorId?: number
    orderId?: string
    startDate?: string
    endDate?: string
    reason?: string
  }): Promise<ApiResponse<{ content: InventoryTransaction[], page: number, size: number, total: number, totalPages: number }>> {
    return api.get('/inventory/history', { params })
  },

  // 获取当前预警
  getCurrentAlerts(storeId?: number): Promise<ApiResponse<Array<Inventory & { alertType: string; alertMessage: string }>>> {
    return api.get('/inventory/alerts/current', { 
      params: storeId ? { storeId } : undefined 
    })
  },

  // 获取库存预警配置
  getInventoryAlerts(params: {
    page: number
    size: number
    alertType?: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
    storeId?: number
    enabled?: boolean
  }): Promise<ApiResponse<{ content: InventoryAlertConfig[], page: number, size: number, total: number, totalPages: number }>> {
    return api.get('/inventory/alerts', { params })
  },

  // 创建预警配置
  createInventoryAlert(data: Omit<InventoryAlertConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<InventoryAlertConfig>> {
    return api.post('/inventory/alerts', data)
  },

  // 更新预警配置
  updateInventoryAlert(id: number, data: Partial<InventoryAlertConfig>): Promise<ApiResponse<InventoryAlertConfig>> {
    return api.put(`/inventory/alerts/${id}`, data)
  },

  // 删除预警配置
  deleteInventoryAlert(id: number): Promise<ApiResponse<boolean>> {
    return api.delete(`/inventory/alerts/${id}`)
  },

  // 获取库存统计
  getInventoryStats(storeId?: number): Promise<ApiResponse<{
    totalItems: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
    normalItems: number
  }>> {
    return api.get('/inventory/stats', { 
      params: storeId ? { storeId } : undefined 
    })
  },

  // 同步库存
  syncInventory(params: {
    storeId?: number
    skus?: string[]
    syncType: 'full' | 'incremental'
    forceUpdate?: boolean
  }): Promise<ApiResponse<{ taskId: string, status: string }>> {
    return api.post('/inventory/sync', params)
  },

  // 获取同步状态
  getSyncStatus(taskId: string): Promise<ApiResponse<{ taskId: string, status: string, progress: number }>> {
    return api.get(`/inventory/sync/${taskId}`)
  },

  // 导出库存数据
  exportInventory(params: InventoryQuery): Promise<Blob> {
    return api.get('/inventory/export', { 
      params,
      responseType: 'blob'
    }).then(response => response as unknown as Blob)
  },

  // 批量导出库存数据
  batchExport(ids: string[]): Promise<Blob> {
    return api.post('/inventory/batch/export', { ids }, {
      responseType: 'blob'
    }).then(response => response as unknown as Blob)
  },

  // 导入库存数据
  importInventory(file: File, storeId: string): Promise<ApiResponse<InventoryImportResult>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storeId', storeId)
    
    return api.post('/inventory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 库存转移（店铺间调拨）
  transferInventory(data: {
    fromStoreId: string
    toStoreId: string
    items: Array<{
      sku: string
      quantity: number
    }>
    reason: string
    note?: string
  }): Promise<ApiResponse<boolean>> {
    return api.post('/inventory/transfer', data)
  },

  // 获取库存变动趋势
  getInventoryTrend(params: {
    sku?: string
    storeId?: string
    startDate: string
    endDate: string
    granularity?: 'day' | 'week' | 'month'
  }): Promise<ApiResponse<InventoryTrend[]>> {
    return api.get('/inventory/trend', { params })
  },

  // 库存盘点
  createStockTaking(data: {
    storeId: string
    name: string
    description?: string
    skus?: string[]
    warehouseLocation?: string
  }): Promise<ApiResponse<{
    id: string
    name: string
    status: string
    createdAt: string
  }>> {
    return api.post('/inventory/stock-taking', data)
  },

  // 提交盘点结果
  submitStockTaking(id: string, data: {
    results: Array<{
      sku: string
      systemQuantity: number
      actualQuantity: number
      note?: string
    }>
  }): Promise<ApiResponse<boolean>> {
    return api.post(`/inventory/stock-taking/${id}/submit`, data)
  },

  // 获取盘点列表
  getStockTakingList(params?: {
    storeId?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{
    content: StockTaking[]
    page: number
    size: number
    total: number
    totalPages: number
  }>> {
    return api.get('/inventory/stock-taking', { params })
  }
}