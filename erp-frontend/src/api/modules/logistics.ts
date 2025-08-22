import api from '@/api'
import type { ApiResponse, PageResponse, PageRequest } from '@/types'

// 物流订单状态枚举
export type LogisticsStatus = 
  | 'CREATED'      // 已创建
  | 'PICKED_UP'    // 已取件
  | 'IN_TRANSIT'   // 运输中
  | 'DELIVERED'    // 已送达
  | 'EXCEPTION'    // 异常
  | 'RETURNED'     // 已退回

// 物流服务商枚举
export type LogisticsCarrier = 
  | 'YUNEXPRESS'   // 云途物流
  | 'DHL'          // DHL
  | 'FEDEX'        // FedEx
  | 'UPS'          // UPS
  | 'USPS'         // USPS
  | 'EMS'          // EMS

// 物流服务类型枚举
export type LogisticsServiceType = 
  | 'STANDARD'     // 标准服务
  | 'EXPRESS'      // 快递服务
  | 'ECONOMY'      // 经济服务
  | 'PRIORITY'     // 优先服务

// 地址信息接口
export interface ShippingAddress {
  name: string
  phone?: string
  email?: string
  country: string
  state: string
  city: string
  address1: string
  address2?: string
  postalCode: string
  company?: string
}

// 物流订单接口
export interface LogisticsOrder {
  id: number
  orderId: number
  orderNumber: string
  trackingNumber: string
  carrier: LogisticsCarrier
  service: LogisticsServiceType
  status: LogisticsStatus
  shippingAddress: ShippingAddress
  returnAddress?: ShippingAddress
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
  declaredValue?: number
  currency?: string
  cost?: number
  labelUrl?: string
  labelFormat?: 'PDF' | 'PNG' | 'ZPL'
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 物流跟踪信息接口
export interface TrackingInfo {
  trackingNumber: string
  carrier: LogisticsCarrier
  status: LogisticsStatus
  statusDescription: string
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  events: TrackingEvent[]
  lastUpdated: string
}

// 物流跟踪事件接口
export interface TrackingEvent {
  id: number
  timestamp: string
  location?: string
  status: string
  description: string
  eventCode?: string
  metadata?: Record<string, any>
}

// 面单生成请求接口
export interface CreateLabelRequest {
  orderId: number
  carrier: LogisticsCarrier
  service: LogisticsServiceType
  shippingAddress: ShippingAddress
  returnAddress?: ShippingAddress
  packageInfo: {
    weight: number
    dimensions?: {
      length: number
      width: number
      height: number
      unit: 'cm' | 'inch'
    }
    declaredValue?: number
    currency?: string
    contents?: string
  }
  labelFormat?: 'PDF' | 'PNG' | 'ZPL'
  options?: {
    signature?: boolean
    insurance?: boolean
    saturdayDelivery?: boolean
    holdAtLocation?: boolean
  }
}

// 面单生成响应接口
export interface CreateLabelResponse {
  logisticsOrderId: number
  trackingNumber: string
  labelUrl: string
  cost: number
  currency: string
  estimatedDeliveryDate?: string
}

// 物流查询参数接口
export interface LogisticsQuery extends PageRequest {
  orderId?: number
  orderNumber?: string
  trackingNumber?: string
  carrier?: LogisticsCarrier
  service?: LogisticsServiceType
  status?: LogisticsStatus
  startDate?: string
  endDate?: string
  keyword?: string
}

// 批量操作参数接口
export interface BatchLogisticsOperation {
  logisticsOrderIds: number[]
  operation: 'updateStatus' | 'regenerateLabel' | 'cancel' | 'track'
  status?: LogisticsStatus
  carrier?: LogisticsCarrier
  service?: LogisticsServiceType
}

// 物流异常处理请求接口
export interface HandleExceptionRequest {
  logisticsOrderId: number
  exceptionType: 'DAMAGED' | 'LOST' | 'DELAYED' | 'REFUSED' | 'OTHER'
  description: string
  solution: 'RESEND' | 'REFUND' | 'REPLACE' | 'CONTACT_CUSTOMER'
  notes?: string
}

// 物流统计信息接口
export interface LogisticsStats {
  totalOrders: number
  pendingOrders: number
  inTransitOrders: number
  deliveredOrders: number
  exceptionOrders: number
  totalCost: number
  averageDeliveryTime: number
  deliveryRate: number
  exceptionRate: number
}

// 物流服务商配置接口
export interface CarrierConfig {
  carrier: LogisticsCarrier
  name: string
  apiEndpoint: string
  credentials: {
    apiKey?: string
    secretKey?: string
    accountNumber?: string
    userId?: string
    password?: string
  }
  services: {
    code: string
    name: string
    type: LogisticsServiceType
    enabled: boolean
  }[]
  settings: {
    defaultService?: string
    autoTracking?: boolean
    labelFormat?: 'PDF' | 'PNG' | 'ZPL'
    testMode?: boolean
  }
  status: 'ACTIVE' | 'INACTIVE'
}

/**
 * 物流管理API模块
 * 提供物流相关的所有API接口功能
 */
export const logisticsApi = {
  // ==================== 面单生成相关API ====================

  /**
   * 生成面单
   * @param request 面单生成请求
   * @returns 面单生成结果
   */
  createLabel(request: CreateLabelRequest): Promise<ApiResponse<CreateLabelResponse>> {
    return api.post('/logistics/labels', request)
  },

  /**
   * 批量生成面单
   * @param requests 批量面单生成请求
   * @returns 批量生成结果
   */
  batchCreateLabels(requests: CreateLabelRequest[]): Promise<ApiResponse<CreateLabelResponse[]>> {
    return api.post('/logistics/labels/batch', { requests })
  },

  /**
   * 重新生成面单
   * @param logisticsOrderId 物流订单ID
   * @param labelFormat 面单格式
   * @returns 重新生成结果
   */
  regenerateLabel(logisticsOrderId: number, labelFormat?: 'PDF' | 'PNG' | 'ZPL'): Promise<ApiResponse<CreateLabelResponse>> {
    return api.post(`/logistics/orders/${logisticsOrderId}/regenerate-label`, { labelFormat })
  },

  /**
   * 下载面单
   * @param logisticsOrderId 物流订单ID
   * @returns 面单文件URL
   */
  downloadLabel(logisticsOrderId: number): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.get(`/logistics/orders/${logisticsOrderId}/label/download`)
  },

  /**
   * 打印面单
   * @param logisticsOrderIds 物流订单ID列表
   * @returns 打印结果
   */
  printLabels(logisticsOrderIds: number[]): Promise<ApiResponse<{ printJobId: string }>> {
    return api.post('/logistics/labels/print', { logisticsOrderIds })
  },

  // ==================== 物流订单管理相关API ====================

  /**
   * 获取物流订单列表（分页）
   * @param query 查询参数
   * @returns 物流订单列表分页数据
   */
  getLogisticsOrders(query: LogisticsQuery): Promise<ApiResponse<PageResponse<LogisticsOrder>>> {
    return api.get('/logistics/orders', { params: query })
  },

  /**
   * 根据ID获取物流订单详情
   * @param id 物流订单ID
   * @returns 物流订单详细信息
   */
  getLogisticsOrderById(id: number): Promise<ApiResponse<LogisticsOrder>> {
    return api.get(`/logistics/orders/${id}`)
  },

  /**
   * 根据订单ID获取物流订单
   * @param orderId 订单ID
   * @returns 物流订单信息
   */
  getLogisticsOrderByOrderId(orderId: number): Promise<ApiResponse<LogisticsOrder>> {
    return api.get(`/logistics/orders/by-order/${orderId}`)
  },

  /**
   * 根据运单号获取物流订单
   * @param trackingNumber 运单号
   * @returns 物流订单信息
   */
  getLogisticsOrderByTrackingNumber(trackingNumber: string): Promise<ApiResponse<LogisticsOrder>> {
    return api.get(`/logistics/orders/by-tracking/${trackingNumber}`)
  },

  /**
   * 更新物流订单状态
   * @param id 物流订单ID
   * @param status 新状态
   * @param notes 备注
   * @returns 更新结果
   */
  updateLogisticsOrderStatus(id: number, status: LogisticsStatus, notes?: string): Promise<ApiResponse<LogisticsOrder>> {
    return api.put(`/logistics/orders/${id}/status`, { status, notes })
  },

  /**
   * 取消物流订单
   * @param id 物流订单ID
   * @param reason 取消原因
   * @returns 取消结果
   */
  cancelLogisticsOrder(id: number, reason: string): Promise<ApiResponse<void>> {
    return api.put(`/logistics/orders/${id}/cancel`, { reason })
  },

  // ==================== 物流跟踪相关API ====================

  /**
   * 获取物流跟踪信息
   * @param trackingNumber 运单号
   * @param carrier 物流服务商（可选）
   * @returns 跟踪信息
   */
  getTrackingInfo(trackingNumber: string, carrier?: LogisticsCarrier): Promise<ApiResponse<TrackingInfo>> {
    return api.get(`/logistics/tracking/${trackingNumber}`, { 
      params: carrier ? { carrier } : undefined 
    })
  },

  /**
   * 批量获取物流跟踪信息
   * @param trackingNumbers 运单号列表
   * @returns 批量跟踪信息
   */
  batchGetTrackingInfo(trackingNumbers: string[]): Promise<ApiResponse<TrackingInfo[]>> {
    return api.post('/logistics/tracking/batch', { trackingNumbers })
  },

  /**
   * 刷新物流跟踪信息
   * @param trackingNumber 运单号
   * @param carrier 物流服务商（可选）
   * @returns 最新跟踪信息
   */
  refreshTrackingInfo(trackingNumber: string, carrier?: LogisticsCarrier): Promise<ApiResponse<TrackingInfo>> {
    return api.post(`/logistics/tracking/${trackingNumber}/refresh`, { carrier })
  },

  /**
   * 订阅物流跟踪更新
   * @param trackingNumbers 运单号列表
   * @param webhookUrl 回调URL
   * @returns 订阅结果
   */
  subscribeTrackingUpdates(trackingNumbers: string[], webhookUrl: string): Promise<ApiResponse<{ subscriptionId: string }>> {
    return api.post('/logistics/tracking/subscribe', { trackingNumbers, webhookUrl })
  },

  /**
   * 取消物流跟踪订阅
   * @param subscriptionId 订阅ID
   * @returns 取消结果
   */
  unsubscribeTrackingUpdates(subscriptionId: string): Promise<ApiResponse<void>> {
    return api.delete(`/logistics/tracking/subscribe/${subscriptionId}`)
  },

  // ==================== 异常处理相关API ====================

  /**
   * 获取物流异常列表
   * @param query 查询参数
   * @returns 异常列表
   */
  getLogisticsExceptions(query: any): Promise<ApiResponse<PageResponse<any>>> {
    return api.get('/logistics/exceptions', { params: query })
  },

  /**
   * 获取异常统计信息
   * @returns 异常统计数据
   */
  getExceptionStats(): Promise<ApiResponse<any>> {
    return api.get('/logistics/exceptions/stats')
  },

  /**
   * 获取异常处理历史
   * @param exceptionId 异常ID
   * @returns 处理历史
   */
  getExceptionHistory(exceptionId: number): Promise<ApiResponse<any[]>> {
    return api.get(`/logistics/exceptions/${exceptionId}/history`)
  },

  /**
   * 处理物流异常
   * @param request 异常处理请求
   * @returns 处理结果
   */
  processException(request: any): Promise<ApiResponse<void>> {
    return api.post('/logistics/exceptions/process', request)
  },

  /**
   * 重新发货
   * @param request 重新发货请求
   * @returns 重新发货结果
   */
  reshipOrder(request: any): Promise<ApiResponse<any>> {
    return api.post('/logistics/exceptions/reship', request)
  },

  /**
   * 导出异常数据
   * @param query 查询条件
   * @param format 导出格式
   * @returns 导出文件URL
   */
  exportExceptionData(query: any, format: 'excel' | 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/logistics/exceptions/export', { query, format })
  },

  /**
   * 获取异常物流订单列表
   * @param query 查询参数
   * @returns 异常订单列表
   */
  getExceptionOrders(query: Omit<LogisticsQuery, 'status'>): Promise<ApiResponse<PageResponse<LogisticsOrder>>> {
    return api.get('/logistics/orders/exceptions', { params: query })
  },

  /**
   * 处理物流异常
   * @param request 异常处理请求
   * @returns 处理结果
   */
  handleException(request: HandleExceptionRequest): Promise<ApiResponse<void>> {
    return api.post('/logistics/exceptions/handle', request)
  },

  /**
   * 重新发货
   * @param logisticsOrderId 原物流订单ID
   * @param newShippingAddress 新收货地址（可选）
   * @returns 重新发货结果
   */
  resendOrder(logisticsOrderId: number, newShippingAddress?: ShippingAddress): Promise<ApiResponse<CreateLabelResponse>> {
    return api.post(`/logistics/orders/${logisticsOrderId}/resend`, { newShippingAddress })
  },

  /**
   * 标记异常已解决
   * @param logisticsOrderId 物流订单ID
   * @param solution 解决方案描述
   * @returns 标记结果
   */
  markExceptionResolved(logisticsOrderId: number, solution: string): Promise<ApiResponse<void>> {
    return api.put(`/logistics/orders/${logisticsOrderId}/resolve-exception`, { solution })
  },

  // ==================== 批量操作相关API ====================

  /**
   * 批量操作物流订单
   * @param operation 批量操作参数
   * @returns 操作结果
   */
  batchOperateLogisticsOrders(operation: BatchLogisticsOperation): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return api.post('/logistics/orders/batch', operation)
  },

  /**
   * 批量更新物流状态
   * @param logisticsOrderIds 物流订单ID列表
   * @param status 新状态
   * @param notes 备注
   * @returns 更新结果
   */
  batchUpdateStatus(logisticsOrderIds: number[], status: LogisticsStatus, notes?: string): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.put('/logistics/orders/batch/status', { logisticsOrderIds, status, notes })
  },

  /**
   * 批量取消物流订单
   * @param logisticsOrderIds 物流订单ID列表
   * @param reason 取消原因
   * @returns 取消结果
   */
  batchCancelOrders(logisticsOrderIds: number[], reason: string): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.put('/logistics/orders/batch/cancel', { logisticsOrderIds, reason })
  },

  // ==================== 统计和报表相关API ====================

  /**
   * 获取物流统计信息
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param carrier 物流服务商（可选）
   * @returns 统计信息
   */
  getLogisticsStats(startDate: string, endDate: string, carrier?: LogisticsCarrier): Promise<ApiResponse<LogisticsStats>> {
    return api.get('/logistics/stats', { 
      params: { startDate, endDate, carrier } 
    })
  },

  /**
   * 获取物流成本分析
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param groupBy 分组方式
   * @returns 成本分析数据
   */
  getCostAnalysis(startDate: string, endDate: string, groupBy: 'carrier' | 'service' | 'date'): Promise<ApiResponse<any[]>> {
    return api.get('/logistics/analysis/cost', { 
      params: { startDate, endDate, groupBy } 
    })
  },

  /**
   * 获取配送时效分析
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param carrier 物流服务商（可选）
   * @returns 时效分析数据
   */
  getDeliveryTimeAnalysis(startDate: string, endDate: string, carrier?: LogisticsCarrier): Promise<ApiResponse<any[]>> {
    return api.get('/logistics/analysis/delivery-time', { 
      params: { startDate, endDate, carrier } 
    })
  },

  /**
   * 导出物流数据
   * @param query 查询条件
   * @param format 导出格式
   * @returns 导出文件URL
   */
  exportLogisticsData(query: Partial<LogisticsQuery>, format: 'excel' | 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/logistics/export', { query, format })
  },

  // ==================== 物流服务商配置相关API ====================

  /**
   * 获取物流服务商配置列表
   * @returns 服务商配置列表
   */
  getCarrierConfigs(): Promise<ApiResponse<CarrierConfig[]>> {
    return api.get('/logistics/carriers')
  },

  /**
   * 获取指定服务商配置
   * @param carrier 物流服务商
   * @returns 服务商配置
   */
  getCarrierConfig(carrier: LogisticsCarrier): Promise<ApiResponse<CarrierConfig>> {
    return api.get(`/logistics/carriers/${carrier}`)
  },

  /**
   * 更新物流服务商配置
   * @param carrier 物流服务商
   * @param config 配置信息
   * @returns 更新结果
   */
  updateCarrierConfig(carrier: LogisticsCarrier, config: Partial<CarrierConfig>): Promise<ApiResponse<CarrierConfig>> {
    return api.put(`/logistics/carriers/${carrier}`, config)
  },

  /**
   * 测试物流服务商连接
   * @param carrier 物流服务商
   * @returns 测试结果
   */
  testCarrierConnection(carrier: LogisticsCarrier): Promise<ApiResponse<{ success: boolean; message: string; responseTime?: number }>> {
    return api.post(`/logistics/carriers/${carrier}/test`)
  },

  /**
   * 获取物流服务商支持的服务类型
   * @param carrier 物流服务商
   * @returns 服务类型列表
   */
  getCarrierServices(carrier: LogisticsCarrier): Promise<ApiResponse<{ code: string; name: string; type: LogisticsServiceType }[]>> {
    return api.get(`/logistics/carriers/${carrier}/services`)
  },

  // ==================== 搜索和筛选相关API ====================

  /**
   * 搜索物流订单
   * @param keyword 搜索关键词
   * @param limit 返回数量限制
   * @returns 搜索结果
   */
  searchLogisticsOrders(keyword: string, limit: number = 10): Promise<ApiResponse<LogisticsOrder[]>> {
    return api.get('/logistics/orders/search', { 
      params: { keyword, limit } 
    })
  },

  /**
   * 根据运单号搜索
   * @param trackingNumber 运单号（支持模糊搜索）
   * @returns 搜索结果
   */
  searchByTrackingNumber(trackingNumber: string): Promise<ApiResponse<LogisticsOrder[]>> {
    return api.get('/logistics/orders/search/tracking', { 
      params: { trackingNumber } 
    })
  },

  /**
   * 获取物流订单筛选选项
   * @returns 筛选选项
   */
  getFilterOptions(): Promise<ApiResponse<{
    carriers: { label: string; value: LogisticsCarrier }[]
    services: { label: string; value: LogisticsServiceType }[]
    statuses: { label: string; value: LogisticsStatus }[]
  }>> {
    return api.get('/logistics/orders/filter-options')
  }
}

export default logisticsApi