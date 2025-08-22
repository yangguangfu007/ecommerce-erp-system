/**
 * 仪表板API模块
 * 提供仪表板相关的数据接口
 */
import request from '../request'

// 仪表板统计数据接口
export interface DashboardStats {
  todayOrders: number
  todayOrdersChange: number
  todaySales: number
  todaySalesChange: number
  totalProducts: number
  totalProductsChange: number
  lowStockAlerts: number
  lowStockAlertsChange: number
}

// 销售趋势数据接口
export interface SalesTrendData {
  labels: string[]
  data: number[]
}

// 订单状态分布数据接口
export interface OrderStatusData {
  labels: string[]
  data: number[]
}

// 热销商品数据接口
export interface TopProduct {
  name: string
  sales: number
  revenue: number
}

// 快捷操作数据接口
export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  badge?: string
  badgeType?: 'info' | 'warning' | 'success' | 'danger'
  route: string
}

// 待处理事项数据接口
export interface PendingTask {
  id: string
  title: string
  description: string
  type: 'order' | 'product' | 'inventory' | 'platform' | 'logistics'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  route?: string
}

// 最近活动数据接口
export interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'product' | 'system'
  description: string
  user: string
  time: string
}

// 系统通知数据接口
export interface SystemNotification {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'error' | 'success'
  isRead: boolean
  createdAt: string
}

// 仪表板数据接口
export interface DashboardData {
  stats: DashboardStats
  salesTrend: SalesTrendData
  orderStatus: OrderStatusData
  topProducts: TopProduct[]
  quickActions: QuickAction[]
  pendingTasks: PendingTask[]
  recentActivities: RecentActivity[]
  systemNotifications: SystemNotification[]
}

/**
 * 获取仪表板统计数据
 */
export const getDashboardStats = () => {
  return request.get<DashboardStats>('/dashboard/stats')
}

/**
 * 获取销售趋势数据
 */
export const getSalesTrend = (period: string = '30d') => {
  return request.get<SalesTrendData>('/dashboard/sales-trend', { params: { period } })
}

/**
 * 获取订单状态分布数据
 */
export const getOrderStatus = () => {
  return request.get<OrderStatusData>('/dashboard/order-status')
}

/**
 * 获取热销商品数据
 */
export const getTopProducts = (limit: number = 5) => {
  return request.get<TopProduct[]>('/dashboard/top-products', { params: { limit } })
}

/**
 * 获取快捷操作数据
 */
export const getQuickActions = () => {
  return request.get<QuickAction[]>('/dashboard/quick-actions')
}

/**
 * 获取待处理事项
 */
export const getPendingTasks = (limit: number = 10) => {
  return request.get<PendingTask[]>('/dashboard/pending-tasks', { params: { limit } })
}

/**
 * 获取最近活动
 */
export const getRecentActivities = (limit: number = 10) => {
  return request.get<RecentActivity[]>('/dashboard/recent-activities', { params: { limit } })
}

/**
 * 获取系统通知
 */
export const getSystemNotifications = (limit: number = 5) => {
  return request.get<SystemNotification[]>('/dashboard/notifications', { params: { limit } })
}

/**
 * 获取完整仪表板数据
 */
export const getDashboardData = () => {
  return request.get<DashboardData>('/dashboard/data')
}

/**
 * 标记通知为已读
 */
export const markNotificationRead = (id: string) => {
  return request.put(`/dashboard/notifications/${id}/read`)
}

/**
 * 标记所有通知为已读
 */
export const markAllNotificationsRead = () => {
  return request.put('/dashboard/notifications/read-all')
}

/**
 * 刷新仪表板数据
 */
export const refreshDashboardData = () => {
  return request.post('/dashboard/refresh')
}