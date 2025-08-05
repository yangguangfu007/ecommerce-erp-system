// 全局类型定义

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp?: number
}

// 分页响应类型
export interface PageResponse<T = any> {
  list: T[]
  total: number
  page: number
  size: number
  pages: number
}

// 分页请求类型
export interface PageRequest {
  page: number
  size: number
  sort?: string
  order?: 'asc' | 'desc'
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  nickname: string
  avatar?: string
  roles: Role[]
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE'
  lastLoginTime?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: Permission[]
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: number
  name: string
  code: string
  resource: string
  action: string
  description?: string
}

// 店铺相关类型
export interface Store {
  id: number
  storeName: string
  platform: string
  platformStoreId: string
  apiCredentials?: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE'
  lastSyncTime?: string
  createdAt: string
  updatedAt: string
}

// 商品相关类型
export interface Product {
  id: number
  sku: string
  title: string
  description?: string
  categoryId?: number
  category?: Category
  brand?: string
  price: number
  costPrice?: number
  weight?: number
  dimensions?: string
  images: string[]
  attributes: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  parentId?: number
  level: number
  path: string
  children?: Category[]
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

// 订单相关类型
export interface Order {
  id: number
  orderId: string
  platformOrderId: string
  storeId: number
  store?: Store
  customerName: string
  customerEmail?: string
  shippingAddress: Address
  billingAddress?: Address
  totalAmount: number
  currency: string
  status: OrderStatus
  platformStatus?: string
  orderDate: string
  shipDate?: string
  trackingNumber?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  sku: string
  productTitle: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: Product
}

export interface Address {
  name: string
  phone?: string
  country: string
  state: string
  city: string
  address1: string
  address2?: string
  postalCode: string
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED'

// 库存相关类型
export interface Inventory {
  id: number
  sku: string
  storeId?: number
  availableQuantity: number
  reservedQuantity: number
  totalQuantity: number
  safetyStock: number
  warehouseLocation?: string
  product?: Product
  store?: Store
  lastUpdated: string
}

export interface InventoryTransaction {
  id: number
  sku: string
  type: 'IN' | 'OUT' | 'ADJUST'
  quantity: number
  reason: string
  orderId?: string
  operatorId: number
  operator?: User
  createdAt: string
}

// 物流相关类型
export interface LogisticsOrder {
  id: number
  orderId: number
  trackingNumber: string
  carrier: string
  service: string
  status: LogisticsStatus
  shippingAddress: Address
  weight?: number
  dimensions?: string
  cost?: number
  labelUrl?: string
  createdAt: string
  updatedAt: string
}

export type LogisticsStatus = 
  | 'CREATED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'EXCEPTION'

// 通知相关类型
export interface Notification {
  id: number
  title: string
  content: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  userId?: number
  read: boolean
  createdAt: string
  updatedAt: string
}

// 表单相关类型
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

export interface FormRules {
  [key: string]: FormRule[]
}

// 表格相关类型
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  showOverflowTooltip?: boolean
}

// 菜单相关类型
export interface MenuItem {
  id: string
  title: string
  path: string
  icon?: string
  children?: MenuItem[]
  permissions?: string[]
  roles?: string[]
  hidden?: boolean
}

// 统计相关类型
export interface StatCard {
  key: string
  label: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: string
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

// 图表相关类型
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

// 文件上传相关类型
export interface UploadFile {
  name: string
  size: number
  type: string
  url?: string
  status?: 'ready' | 'uploading' | 'success' | 'fail'
  percentage?: number
}

// 导入导出相关类型
export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value: any
}

// 系统设置相关类型
export interface SystemConfig {
  key: string
  value: any
  description?: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category: string
}

// 日志相关类型
export interface OperationLog {
  id: number
  userId: number
  user?: User
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ip: string
  userAgent: string
  createdAt: string
}

// 工具类型
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type Required<T> = {
  [P in keyof T]-?: T[P]
}

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// 常量类型
export const ORDER_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已送达', value: 'DELIVERED' },
  { label: '已取消', value: 'CANCELLED' }
] as const

export const PRODUCT_STATUS_OPTIONS = [
  { label: '启用', value: 'ACTIVE' },
  { label: '禁用', value: 'INACTIVE' },
  { label: '已删除', value: 'DELETED' }
] as const

export const USER_STATUS_OPTIONS = [
  { label: '启用', value: 'ACTIVE' },
  { label: '禁用', value: 'INACTIVE' }
] as const