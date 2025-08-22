// 全局类型定义

// 错误详情类型
export interface ErrorDetail {
  field: string
  message: string
  value?: any
}

// API响应类型（根据后端实际实现统一格式）
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: string
  error?: string       // 错误码（仅错误时）
  details?: ErrorDetail[] // 错误详情（仅参数错误时）
}

// 导出错误处理相关类型
export * from './errors'

// 分页响应类型（根据后端实际实现统一格式）
export interface PageResponse<T = any> {
  records: T[]         // 数据列表（后端实际字段）
  content?: T[]        // 兼容字段
  current: number      // 当前页码（从1开始，后端实际字段）
  page?: number        // 兼容字段
  size: number         // 每页大小
  total: number        // 总记录数
  pages: number        // 总页数（后端实际字段）
  totalPages?: number  // 兼容字段
}

// 分页请求类型
export interface PageRequest {
  page: number
  size: number
  sort?: string
  order?: 'asc' | 'desc'
}

// 用户相关类型（根据后端实际实现统一字段）
export interface User {
  id: number
  username: string
  realName: string       // 真实姓名（后端返回字段）
  nickname?: string
  email: string
  phone?: string
  avatar?: string
  status: number         // 数字状态：0-禁用，1-启用（后端返回）
  locked: number         // 锁定状态：0-未锁定，1-锁定（后端返回）
  lastLoginTime?: string
  lastLoginIp?: string
  roleNames: string[]    // 角色名称数组（后端返回字段）
  roles: Role[]          // 角色详情数组
  permissions: string[]  // 权限代码数组
  createTime: string     // 创建时间（后端返回字段）
  remark?: string        // 备注
}

export interface Role {
  id: number
  roleName: string       // 角色名称（后端实际字段）
  name?: string          // 兼容字段
  roleCode: string       // 角色编码（后端实际字段）
  code?: string          // 兼容字段
  description?: string   // 角色描述
  permissions?: Permission[] // 权限列表（可选，需要单独查询）
  status: number         // 角色状态：0-禁用，1-启用（后端数字类型）
  sort?: number          // 排序
  remark?: string        // 备注
  createTime?: string    // 创建时间（后端字段）
  updateTime?: string    // 更新时间（后端字段）
}

export interface Permission {
  id: number
  permissionName: string    // 权限名称（后端实际字段）
  name?: string            // 兼容字段
  permissionCode: string   // 权限编码（后端实际字段）
  code?: string            // 兼容字段
  description?: string     // 权限描述
  type: number            // 权限类型：1-菜单，2-按钮，3-接口（后端数字类型）
  parentId?: number       // 父权限ID
  path?: string           // 权限路径
  status?: number         // 权限状态：0-禁用，1-启用
  sort?: number           // 排序
  icon?: string           // 图标
  remark?: string         // 备注
  children?: Permission[] // 子权限（树形结构）
  createTime?: string     // 创建时间
  updateTime?: string     // 更新时间
}

// 店铺相关类型
export interface Store {
  id: number
  storeName: string
  platform: string
  platformId?: number
  platformStoreId: string
  apiCredentials?: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE'
  authStatus?: 'AUTHORIZED' | 'UNAUTHORIZED'
  lastSyncTime?: string
  createdAt: string
  updatedAt: string
  // 用于UI状态管理的临时字段
  authLoading?: boolean
  testLoading?: boolean
  statusLoading?: boolean
}

// 商品相关类型（根据后端实际实现统一字段）
export interface Product {
  id: number
  sku: string
  title: string          // 商品名称（后端实际字段）
  name?: string          // 兼容字段
  description?: string
  categoryId: number     // 分类ID（后端返回数字类型）
  categoryName?: string  // 关联查询时的分类名称
  brand?: string
  price: number
  costPrice?: number
  weight?: number
  dimensions?: string    // 尺寸信息（后端返回字符串格式）
  images?: string[]      // 商品图片数组（可选）
  attributes?: Record<string, any> // 商品属性（可选）
  status: ProductStatus  // 商品状态枚举
  createTime?: string    // 创建时间（后端返回字段，可选）
  updateTime?: string    // 更新时间（后端返回字段，可选）
  version?: number       // 版本号（后端实际字段）
}

// 商品状态枚举
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE', 
  DELETED = 'DELETED'
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
  shippingAddress: {
    name: string
    address1: string
    address2?: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    name: string
    address1: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: OrderItem[]
  shipping?: {
    method: string
    cost: number
    trackingNumber?: string
    carrier?: string
    estimatedDelivery?: string
  }
  payment?: {
    method: string
    status: string
    transactionId: string
  }
  notes?: any[]
  orderDate: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  sku: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Address {
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
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
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM'
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  userId?: number
  user?: {
    id: number
    username: string
    nickname: string
  }
  templateId?: number
  template?: NotificationTemplate
  metadata?: Record<string, any>
  scheduledAt?: string
  sentAt?: string
  readAt?: string
  createdAt: string
  updatedAt: string
}

// 通知模板相关类型
export interface NotificationTemplate {
  id: number
  name: string
  title: string
  content: string
  type: 'EMAIL' | 'SMS' | 'SYSTEM' | 'PUSH'
  category: string
  variables: string[]
  status: 'ACTIVE' | 'INACTIVE'
  description?: string
  createdAt: string
  updatedAt: string
}

// 通知规则相关类型
export interface NotificationRule {
  id: number
  name: string
  description?: string
  eventType: string
  conditions: Record<string, any>
  templateId: number
  template?: NotificationTemplate
  recipients: NotificationRecipient[]
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// 通知接收者相关类型
export interface NotificationRecipient {
  id: number
  type: 'USER' | 'ROLE' | 'EMAIL' | 'PHONE'
  value: string
  name?: string
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

// 查询相关类型
export interface UserQuery extends PageRequest {
  username?: string      // 用户名查询
  realName?: string      // 真实姓名查询（与后端字段一致）
  status?: number        // 状态查询：0-禁用，1-启用（与后端一致）
}

export interface ProductQuery extends PageRequest {
  sku?: string
  name?: string          // 商品名称查询（与后端字段一致）
  categoryId?: number    // 分类ID查询（与后端数字类型一致）
  brand?: string
  status?: ProductStatus // 状态查询（枚举类型）
  minPrice?: number
  maxPrice?: number
  keyword?: string
}

export interface OrderQuery extends PageRequest {
  orderId?: string
  platformOrderId?: string
  storeId?: number
  status?: OrderStatus
  customerName?: string
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface InventoryQuery extends PageRequest {
  sku?: string
  storeId?: number
  lowStock?: boolean
  outOfStock?: boolean
  keyword?: string
}

export interface NotificationQuery extends PageRequest {
  type?: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM'
  status?: 'UNREAD' | 'read' | 'ARCHIVED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  userId?: number
  startDate?: string
  endDate?: string
  keyword?: string
}

// 表单相关类型
export interface CreateUserForm {
  username: string
  realName: string       // 真实姓名（与后端字段一致）
  nickname?: string
  email: string
  phone: string
  password: string
  status: number         // 状态：0-禁用，1-启用（与后端一致）
  remark?: string
}

export interface UpdateUserForm extends Partial<CreateUserForm> {
  id: number
}

export interface LoginForm {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string    // 访问令牌
  refreshToken: string   // 刷新令牌
  tokenType: string      // 令牌类型（Bearer）
  expiresIn: number      // 过期时间（秒）
  userInfo: User         // 用户信息
}

export interface CreateProductForm {
  sku: string
  name: string           // 商品名称（与后端字段一致）
  description?: string
  categoryId: number     // 分类ID（与后端数字类型一致）
  brand?: string
  price: number
  costPrice?: number
  weight?: number
  dimensions?: string    // 尺寸信息（与后端字符串格式一致）
  images?: string[]
  attributes?: Record<string, any>
  status: ProductStatus  // 商品状态枚举
}

export interface UpdateProductForm extends Partial<CreateProductForm> {
  id: number
}

export interface CreateOrderForm {
  platformOrderId: string
  storeId: number
  customerName: string
  customerEmail?: string
  shippingAddress: Address
  billingAddress?: Address
  totalAmount: number
  currency: string
  orderDate: string
  items: Omit<OrderItem, 'id'>[]
}

export interface UpdateOrderForm extends Partial<CreateOrderForm> {
  id: number
}

export interface UpdateOrderStatusForm {
  id: number
  status: OrderStatus
  notes?: string
}

export interface InventoryAdjustmentForm {
  sku: string
  storeId?: number
  operation: 'SET' | 'ADD' | 'SUBTRACT'
  quantity: number
  reason: string
  notes?: string
}

export interface UpdateInventoryForm {
  id: number
  safetyStock?: number
  warehouseLocation?: string
}

export interface CreateNotificationForm {
  title: string
  content: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  userId?: number
  templateId?: number
  metadata?: Record<string, any>
  scheduledAt?: string
}

export interface UpdateNotificationForm extends Partial<CreateNotificationForm> {
  id: number
}

// 统计相关类型
export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  deletedProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  newProductsToday: number
  newProductsThisWeek: number
  newProductsThisMonth: number
  totalValue: number
  averagePrice: number
}

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

export interface InventoryStats {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  averageValue: number
  lastUpdated: string
}

export interface NotificationStats {
  totalNotifications: number
  unreadNotifications: number
  todayNotifications: number
  weekNotifications: number
  monthNotifications: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

// 同步相关类型
export interface OrderSyncResult {
  taskId: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  totalCount: number
  successCount: number
  failedCount: number
  errors: string[]
  startTime: string
  endTime?: string
}

export interface InventorySyncResult {
  taskId: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  totalCount: number
  successCount: number
  failedCount: number
  errors: string[]
  startTime: string
  endTime?: string
}

// 库存预警相关类型
export interface InventoryAlertConfig {
  id: number
  sku?: string
  storeId?: number
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
  threshold: number
  enabled: boolean
  recipients: string[]
  createdAt: string
  updatedAt: string
}

// 常量类型
export const ORDER_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已送达', value: 'DELIVERED' },
  { label: '已取消', value: 'CANCELLED' }
] as const

export const PRODUCT_STATUS_OPTIONS = [
  { label: '启用', value: ProductStatus.ACTIVE },
  { label: '禁用', value: ProductStatus.INACTIVE },
  { label: '已删除', value: ProductStatus.DELETED }
] as const

export const USER_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
] as const