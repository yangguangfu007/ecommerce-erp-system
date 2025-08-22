import api from '@/api'
import type { 
  ApiResponse, 
  PageResponse, 
  PageRequest, 
  Order, 
  OrderItem, 
  OrderStatus,
  Store
} from '@/types'

// 订单查询参数接口
export interface OrderQuery extends PageRequest {
  status?: string
  platform?: string
  storeId?: number
  startDate?: string
  endDate?: string
}

// 订单创建表单接口（根据API文档，订单通常是从平台同步而来，不需要复杂的创建表单）
export interface CreateOrderForm {
  orderNumber: string
  platformOrderId: string
  platform: string
  storeId: number
  status: string
  totalAmount: number
  currency: string
}

// 订单更新表单接口
export interface UpdateOrderForm {
  id: number
  status?: OrderStatus
  platformStatus?: string
  shipDate?: string
  trackingNumber?: string
  customerName?: string
  customerEmail?: string
  shippingAddress?: {
    name: string
    phone?: string
    country: string
    state: string
    city: string
    address1: string
    address2?: string
    postalCode: string
  }
  billingAddress?: {
    name: string
    phone?: string
    country: string
    state: string
    city: string
    address1: string
    address2?: string
    postalCode: string
  }
}

// 订单状态更新表单接口
export interface UpdateOrderStatusForm {
  id: number
  status: OrderStatus
  reason?: string
  notes?: string
}

// 批量订单操作参数接口
export interface BatchOrderOperation {
  orderIds: number[]
  operation: 'updateStatus' | 'cancel' | 'ship' | 'confirm' | 'delete'
  status?: OrderStatus
  trackingNumber?: string
  reason?: string
  notes?: string
}

// 订单同步参数接口
export interface OrderSyncParams {
  storeId?: number
  startDate?: string
  endDate?: string
  syncType: 'full' | 'incremental'
  platformOrderIds?: string[]
}

// 订单同步结果接口
export interface OrderSyncResult {
  taskId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  totalCount: number
  successCount: number
  failedCount: number
  errors: {
    platformOrderId: string
    error: string
  }[]
  startTime: string
  endTime?: string
}

// 订单统计信息接口
export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  todayOrders: number
  weekOrders: number
  monthOrders: number
  totalAmount: number
  averageOrderValue: number
}

// 订单筛选选项接口
export interface OrderFilterOptions {
  stores: Store[]
  statuses: { label: string; value: OrderStatus }[]
  dateRanges: { label: string; value: string }[]
}

// 订单导出参数接口
export interface OrderExportParams {
  query: Partial<OrderQuery>
  format: 'excel' | 'csv' | 'pdf'
  fields?: string[]
  includeItems?: boolean
}

/**
 * 订单管理API模块
 * 提供订单相关的所有API接口功能
 */
export const orderApi = {
  /**
   * 获取订单列表（分页）
   * @param query 查询参数
   * @returns 订单列表分页数据
   */
  getOrders(query: OrderQuery): Promise<ApiResponse<PageResponse<Order>>> {
    return api.get('/orders', { params: query })
  },

  /**
   * 根据ID获取订单详情
   * @param id 订单ID
   * @returns 订单详细信息
   */
  getOrderById(id: number): Promise<ApiResponse<Order>> {
    return api.get(`/orders/${id}`)
  },

  /**
   * 根据订单号获取订单详情
   * @param orderId 订单号
   * @returns 订单详细信息
   */
  getOrderByOrderId(orderId: string): Promise<ApiResponse<Order>> {
    return api.get(`/orders/by-order-id/${orderId}`)
  },

  /**
   * 根据平台订单号获取订单详情
   * @param platformOrderId 平台订单号
   * @returns 订单详细信息
   */
  getOrderByPlatformOrderId(platformOrderId: string): Promise<ApiResponse<Order>> {
    return api.get(`/orders/by-platform-order-id/${platformOrderId}`)
  },

  /**
   * 创建新订单
   * @param orderForm 订单创建表单
   * @returns 创建的订单信息
   */
  createOrder(orderForm: CreateOrderForm): Promise<ApiResponse<Order>> {
    return api.post('/orders', orderForm)
  },

  /**
   * 更新订单信息
   * @param orderForm 订单更新表单
   * @returns 更新后的订单信息
   */
  updateOrder(orderForm: UpdateOrderForm): Promise<ApiResponse<Order>> {
    const { id, ...data } = orderForm
    return api.put(`/orders/${id}`, data)
  },

  /**
   * 更新订单状态
   * @param statusForm 订单状态更新表单
   * @returns 更新结果
   */
  updateOrderStatus(statusForm: UpdateOrderStatusForm): Promise<ApiResponse<Order>> {
    const { id, ...data } = statusForm
    return api.put(`/orders/${id}/status`, data)
  },

  /**
   * 删除订单
   * @param id 订单ID
   * @returns 删除结果
   */
  deleteOrder(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/orders/${id}`)
  },

  /**
   * 确认订单
   * @param id 订单ID
   * @param notes 备注信息
   * @returns 确认结果
   */
  confirmOrder(id: number, notes?: string): Promise<ApiResponse<Order>> {
    return api.put(`/orders/${id}/confirm`, { notes })
  },

  /**
   * 取消订单
   * @param id 订单ID
   * @param reason 取消原因
   * @param notes 备注信息
   * @returns 取消结果
   */
  cancelOrder(id: number, reason: string, notes?: string): Promise<ApiResponse<Order>> {
    return api.put(`/orders/${id}/cancel`, { reason, notes })
  },

  /**
   * 发货订单
   * @param id 订单ID
   * @param trackingNumber 物流单号
   * @param carrier 承运商
   * @param notes 备注信息
   * @returns 发货结果
   */
  shipOrder(id: number, trackingNumber: string, carrier?: string, notes?: string): Promise<ApiResponse<Order>> {
    return api.put(`/orders/${id}/ship`, { trackingNumber, carrier, notes })
  },

  /**
   * 标记订单为已送达
   * @param id 订单ID
   * @param deliveryDate 送达日期
   * @param notes 备注信息
   * @returns 标记结果
   */
  deliverOrder(id: number, deliveryDate?: string, notes?: string): Promise<ApiResponse<Order>> {
    return api.put(`/orders/${id}/deliver`, { deliveryDate, notes })
  },

  /**
   * 搜索订单
   * @param keyword 搜索关键词
   * @param limit 返回数量限制
   * @returns 搜索结果
   */
  searchOrders(keyword: string, limit: number = 10): Promise<ApiResponse<Order[]>> {
    return api.get('/orders/search', { 
      params: { keyword, limit } 
    })
  },

  /**
   * 获取订单统计信息
   * @param storeId 店铺ID（可选）
   * @param startDate 开始日期（可选）
   * @param endDate 结束日期（可选）
   * @returns 订单统计数据
   */
  getOrderStats(storeId?: number, startDate?: string, endDate?: string): Promise<ApiResponse<OrderStats>> {
    return api.get('/orders/stats', { 
      params: { storeId, startDate, endDate } 
    })
  },

  /**
   * 批量操作订单
   * @param operation 批量操作参数
   * @returns 操作结果
   */
  batchOperateOrders(operation: BatchOrderOperation): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return api.post('/orders/batch', operation)
  },

  /**
   * 获取订单筛选选项
   * @returns 筛选选项数据
   */
  getOrderFilterOptions(): Promise<ApiResponse<OrderFilterOptions>> {
    return api.get('/orders/filter-options')
  },

  /**
   * 导出订单数据
   * @param params 导出参数
   * @returns 导出文件URL
   */
  exportOrders(params: OrderExportParams): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> {
    return api.post('/orders/export', params)
  },

  /**
   * 导入订单数据
   * @param file Excel文件
   * @returns 导入结果
   */
  importOrders(file: File): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return api.upload('/orders/import', file)
  },

  // ==================== 订单同步相关API ====================

  /**
   * 同步订单数据
   * @param params 同步参数
   * @returns 同步任务信息
   */
  syncOrders(params: OrderSyncParams): Promise<ApiResponse<OrderSyncResult>> {
    return api.post('/orders/sync', params)
  },

  /**
   * 获取订单同步状态
   * @param taskId 同步任务ID
   * @returns 同步状态信息
   */
  getSyncStatus(taskId: string): Promise<ApiResponse<OrderSyncResult>> {
    return api.get(`/orders/sync/${taskId}`)
  },

  /**
   * 获取订单同步历史
   * @param query 查询参数
   * @returns 同步历史列表
   */
  getSyncHistory(query: PageRequest & { storeId?: number; status?: string }): Promise<ApiResponse<PageResponse<OrderSyncResult>>> {
    return api.get('/orders/sync/history', { params: query })
  },

  /**
   * 取消订单同步任务
   * @param taskId 同步任务ID
   * @returns 取消结果
   */
  cancelSync(taskId: string): Promise<ApiResponse<void>> {
    return api.put(`/orders/sync/${taskId}/cancel`)
  },

  /**
   * 重试失败的订单同步
   * @param taskId 同步任务ID
   * @param failedOrderIds 失败的订单ID列表
   * @returns 重试结果
   */
  retrySyncFailedOrders(taskId: string, failedOrderIds?: string[]): Promise<ApiResponse<OrderSyncResult>> {
    return api.post(`/orders/sync/${taskId}/retry`, { failedOrderIds })
  },

  // ==================== 订单项相关API ====================

  /**
   * 获取订单项列表
   * @param orderId 订单ID
   * @returns 订单项列表
   */
  getOrderItems(orderId: number): Promise<ApiResponse<OrderItem[]>> {
    return api.get(`/orders/${orderId}/items`)
  },

  /**
   * 添加订单项
   * @param orderId 订单ID
   * @param item 订单项信息
   * @returns 添加结果
   */
  addOrderItem(orderId: number, item: Omit<OrderItem, 'id' | 'orderId'>): Promise<ApiResponse<OrderItem>> {
    return api.post(`/orders/${orderId}/items`, item)
  },

  /**
   * 更新订单项
   * @param orderId 订单ID
   * @param itemId 订单项ID
   * @param item 订单项信息
   * @returns 更新结果
   */
  updateOrderItem(orderId: number, itemId: number, item: Partial<OrderItem>): Promise<ApiResponse<OrderItem>> {
    return api.put(`/orders/${orderId}/items/${itemId}`, item)
  },

  /**
   * 删除订单项
   * @param orderId 订单ID
   * @param itemId 订单项ID
   * @returns 删除结果
   */
  deleteOrderItem(orderId: number, itemId: number): Promise<ApiResponse<void>> {
    return api.delete(`/orders/${orderId}/items/${itemId}`)
  },

  // ==================== 订单历史和日志相关API ====================

  /**
   * 获取订单操作历史
   * @param orderId 订单ID
   * @returns 操作历史列表
   */
  getOrderHistory(orderId: number): Promise<ApiResponse<{
    id: number
    orderId: number
    action: string
    oldStatus?: OrderStatus
    newStatus?: OrderStatus
    reason?: string
    notes?: string
    operatorId: number
    operatorName: string
    createdAt: string
  }[]>> {
    return api.get(`/orders/${orderId}/history`)
  },

  /**
   * 添加订单备注
   * @param orderId 订单ID
   * @param notes 备注内容
   * @returns 添加结果
   */
  addOrderNotes(orderId: number, notes: string): Promise<ApiResponse<void>> {
    return api.post(`/orders/${orderId}/notes`, { notes })
  },

  /**
   * 获取订单备注列表
   * @param orderId 订单ID
   * @returns 备注列表
   */
  getOrderNotes(orderId: number): Promise<ApiResponse<{
    id: number
    orderId: number
    notes: string
    operatorId: number
    operatorName: string
    createdAt: string
  }[]>> {
    return api.get(`/orders/${orderId}/notes`)
  }
}

export default orderApi