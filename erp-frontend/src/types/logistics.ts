/**
 * 物流管理相关类型定义
 */

// 基础地址信息
export interface Address {
  id?: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  zipCode?: string
  country?: string
}

// 订单信息（用于面单生成）
export interface Order {
  id: number
  orderNumber: string
  platformOrderId: string
  platform: string
  storeId: number
  storeName: string
  status: string
  totalAmount: number
  currency: string
  customer: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: Address
  billingAddress?: Address
  items: OrderItem[]
  shippingLabel?: ShippingLabel
  orderDate: string
  createdAt: string
  updatedAt: string
}

// 订单商品项
export interface OrderItem {
  id: number
  sku: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
}

// 物流公司
export interface Carrier {
  id: number
  code: string
  name: string
  logo?: string
  status: 'ACTIVE' | 'INACTIVE'
  supportedServices: string[]
  apiConfig?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 面单模板
export interface LabelTemplate {
  id: number
  name: string
  carrierCode: string
  templateType: 'STANDARD' | 'THERMAL' | 'A4'
  width: number
  height: number
  format: 'PDF' | 'PNG' | 'JPG'
  templateUrl?: string
  previewUrl?: string
  isDefault: boolean
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

// 面单信息
export interface ShippingLabel {
  id: number
  orderId: number
  orderNumber: string
  trackingNumber: string
  carrierCode: string
  carrierName: string
  templateId: number
  templateName: string
  status: 'GENERATED' | 'PRINTED' | 'CANCELLED'
  imageUrl?: string
  pdfUrl?: string
  senderInfo: SenderInfo
  recipientInfo: Address
  specialRequirements: string[]
  insuranceAmount?: number
  remarks?: string
  generatedAt: string
  printedAt?: string
  createdAt: string
  updatedAt: string
}

// 发件人信息
export interface SenderInfo {
  name: string
  phone: string
  company?: string
  address: string
}

// 面单生成请求
export interface GenerateShippingLabelRequest {
  orderId: number
  carrier: string
  template: string
  senderInfo: SenderInfo
  specialRequirements: string[]
  insuranceAmount?: number
  remarks?: string
}

// 物流跟踪信息
export interface TrackingInfo {
  id: number
  trackingNumber: string
  carrierCode: string
  carrierName: string
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION' | 'RETURNED'
  currentLocation?: string
  estimatedDelivery?: string
  actualDelivery?: string
  events: TrackingEvent[]
  createdAt: string
  updatedAt: string
}

// 物流跟踪事件
export interface TrackingEvent {
  id: number
  timestamp: string
  location: string
  description: string
  status: string
  operator?: string
}

// 物流异常
export interface LogisticsException {
  id: number
  trackingNumber: string
  orderId: number
  orderNumber: string
  exceptionType: 'DELAY' | 'LOST' | 'DAMAGED' | 'REFUSED' | 'OTHER'
  description: string
  reportedAt: string
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'CLOSED'
  resolution?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

// 异常处理请求
export interface ExceptionProcessRequest {
  exceptionId: number
  action: 'RESOLVE' | 'RESHIP' | 'REFUND' | 'CONTACT_CUSTOMER'
  resolution: string
  newTrackingNumber?: string
  refundAmount?: number
}

// 重新发货请求
export interface ReshipRequest {
  exceptionId: number
  orderId: number
  carrier: string
  trackingNumber: string
  notes?: string
}

// 异常统计
export interface ExceptionStats {
  total: number
  pending: number
  processing: number
  resolved: number
  closed: number
  byType: Array<{
    type: string
    count: number
  }>
  byCarrier: Array<{
    carrier: string
    count: number
  }>
}

// 异常处理历史
export interface ExceptionHistory {
  id: number
  exceptionId: number
  action: string
  description: string
  operator: string
  createdAt: string
}

// 批量操作请求
export interface BatchOperationRequest {
  orderIds: number[]
  operation: 'GENERATE_LABELS' | 'PRINT_LABELS' | 'CANCEL_LABELS' | 'UPDATE_STATUS'
  params?: Record<string, any>
}

// 批量操作结果
export interface BatchOperationResult {
  total: number
  success: number
  failed: number
  errors: Array<{
    orderId: number
    orderNumber: string
    error: string
  }>
}

// API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> {
  records: T[]
  total: number
  page: number
  size: number
  pages: number
}

// 查询参数
export interface OrderQueryParams {
  page?: number
  size?: number
  keyword?: string
  orderStatus?: string
  carrier?: string
  startDate?: string
  endDate?: string
  hasLabel?: boolean
}

export interface TrackingQueryParams {
  page?: number
  size?: number
  keyword?: string
  status?: string
  carrier?: string
  startDate?: string
  endDate?: string
}

export interface ExceptionQueryParams {
  page?: number
  size?: number
  keyword?: string
  exceptionType?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 统计数据
export interface LogisticsStats {
  totalOrders: number
  pendingLabels: number
  generatedLabels: number
  printedLabels: number
  inTransitPackages: number
  deliveredPackages: number
  exceptions: number
  dailyStats: Array<{
    date: string
    generated: number
    printed: number
    delivered: number
  }>
}

// 面单打印配置
export interface PrintConfig {
  printerId?: string
  printerName?: string
  paperSize: 'A4' | 'THERMAL_100X150' | 'THERMAL_100X100'
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  copies: number
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// 物流服务配置
export interface LogisticsServiceConfig {
  id: number
  carrierCode: string
  serviceType: string
  serviceName: string
  isDefault: boolean
  config: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}