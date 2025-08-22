/**
 * 仪表板API模块测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as dashboardApi from '../dashboard'
import request from '../../request'

// Mock request module
vi.mock('../../request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}))

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('数据获取接口', () => {
    it('应该能够获取仪表板统计数据', async () => {
      const mockStats = {
        todayOrders: 123,
        todayOrdersChange: 5.5,
        todaySales: 45000,
        todaySalesChange: 3.2,
        totalProducts: 800,
        totalProductsChange: 1.8,
        lowStockAlerts: 3,
        lowStockAlertsChange: -0.5
      }
      
      vi.mocked(request.get).mockResolvedValue(mockStats)
      
      const result = await dashboardApi.getDashboardStats()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/stats')
      expect(result).toEqual(mockStats)
    })

    it('应该能够获取销售趋势数据', async () => {
      const mockTrend = {
        labels: ['1月', '2月', '3月'],
        data: [10000, 15000, 20000]
      }
      
      vi.mocked(request.get).mockResolvedValue(mockTrend)
      
      const result = await dashboardApi.getSalesTrend('30d')
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/sales-trend', { params: { period: '30d' } })
      expect(result).toEqual(mockTrend)
    })

    it('应该能够获取订单状态分布数据', async () => {
      const mockOrderStatus = {
        labels: ['待支付', '已支付', '已发货'],
        data: [10, 50, 30]
      }
      
      vi.mocked(request.get).mockResolvedValue(mockOrderStatus)
      
      const result = await dashboardApi.getOrderStatus()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/order-status')
      expect(result).toEqual(mockOrderStatus)
    })

    it('应该能够获取热销商品数据', async () => {
      const mockProducts = [
        { name: '商品1', sales: 100, revenue: 10000 },
        { name: '商品2', sales: 80, revenue: 8000 }
      ]
      
      vi.mocked(request.get).mockResolvedValue(mockProducts)
      
      const result = await dashboardApi.getTopProducts(5)
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/top-products', { params: { limit: 5 } })
      expect(result).toEqual(mockProducts)
    })

    it('应该能够获取快捷操作数据', async () => {
      const mockActions = [
        {
          id: 'orders',
          title: '订单管理',
          description: '管理订单',
          icon: 'ShoppingCart',
          color: '#409EFF',
          route: '/orders'
        }
      ]
      
      vi.mocked(request.get).mockResolvedValue(mockActions)
      
      const result = await dashboardApi.getQuickActions()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/quick-actions')
      expect(result).toEqual(mockActions)
    })

    it('应该能够获取待处理事项', async () => {
      const mockTasks = [
        {
          id: '1',
          title: '处理订单',
          description: '处理新订单',
          type: 'order',
          priority: 'high',
          createdAt: '2024-01-01'
        }
      ]
      
      vi.mocked(request.get).mockResolvedValue(mockTasks)
      
      const result = await dashboardApi.getPendingTasks(10)
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/pending-tasks', { params: { limit: 10 } })
      expect(result).toEqual(mockTasks)
    })

    it('应该能够获取最近活动', async () => {
      const mockActivities = [
        {
          id: '1',
          type: 'order',
          description: '新订单创建',
          user: '张三',
          time: '2024-01-01T10:00:00Z'
        }
      ]
      
      vi.mocked(request.get).mockResolvedValue(mockActivities)
      
      const result = await dashboardApi.getRecentActivities(10)
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/recent-activities', { params: { limit: 10 } })
      expect(result).toEqual(mockActivities)
    })

    it('应该能够获取系统通知', async () => {
      const mockNotifications = [
        {
          id: '1',
          title: '系统通知',
          content: '通知内容',
          type: 'info',
          isRead: false,
          createdAt: '2024-01-01'
        }
      ]
      
      vi.mocked(request.get).mockResolvedValue(mockNotifications)
      
      const result = await dashboardApi.getSystemNotifications(5)
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/notifications', { params: { limit: 5 } })
      expect(result).toEqual(mockNotifications)
    })

    it('应该能够获取完整仪表板数据', async () => {
      const mockDashboardData = {
        stats: { todayOrders: 100, todayOrdersChange: 5.0, todaySales: 50000, todaySalesChange: 3.0, totalProducts: 1000, totalProductsChange: 2.0, lowStockAlerts: 5, lowStockAlertsChange: 1.0 },
        salesTrend: { labels: ['1月'], data: [10000] },
        orderStatus: { labels: ['待支付'], data: [10] },
        topProducts: [{ name: '商品1', sales: 100, revenue: 10000 }],
        quickActions: [{ id: 'orders', title: '订单管理', description: '管理订单', icon: 'ShoppingCart', color: '#409EFF', route: '/orders' }],
        pendingTasks: [{ id: '1', title: '任务1', description: '描述1', type: 'order' as const, priority: 'high' as const, createdAt: '2024-01-01' }],
        recentActivities: [{ id: '1', type: 'order' as const, description: '活动1', user: '用户1', time: '2024-01-01' }],
        systemNotifications: [{ id: '1', title: '通知1', content: '内容1', type: 'info' as const, isRead: false, createdAt: '2024-01-01' }]
      }
      
      vi.mocked(request.get).mockResolvedValue(mockDashboardData)
      
      const result = await dashboardApi.getDashboardData()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/data')
      expect(result).toEqual(mockDashboardData)
    })
  })

  describe('通知管理接口', () => {
    it('应该能够标记通知为已读', async () => {
      vi.mocked(request.put).mockResolvedValue(undefined)
      
      await dashboardApi.markNotificationRead('1')
      
      expect(request.put).toHaveBeenCalledWith('/dashboard/notifications/1/read')
    })

    it('应该能够标记所有通知为已读', async () => {
      vi.mocked(request.put).mockResolvedValue(undefined)
      
      await dashboardApi.markAllNotificationsRead()
      
      expect(request.put).toHaveBeenCalledWith('/dashboard/notifications/read-all')
    })
  })

  describe('数据刷新接口', () => {
    it('应该能够刷新仪表板数据', async () => {
      vi.mocked(request.post).mockResolvedValue(undefined)
      
      await dashboardApi.refreshDashboardData()
      
      expect(request.post).toHaveBeenCalledWith('/dashboard/refresh')
    })
  })

  describe('参数处理', () => {
    it('应该使用默认参数获取销售趋势', async () => {
      vi.mocked(request.get).mockResolvedValue({ labels: [], data: [] })
      
      await dashboardApi.getSalesTrend()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/sales-trend', { params: { period: '30d' } })
    })

    it('应该使用默认参数获取热销商品', async () => {
      vi.mocked(request.get).mockResolvedValue([])
      
      await dashboardApi.getTopProducts()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/top-products', { params: { limit: 5 } })
    })

    it('应该使用默认参数获取待处理事项', async () => {
      vi.mocked(request.get).mockResolvedValue([])
      
      await dashboardApi.getPendingTasks()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/pending-tasks', { params: { limit: 10 } })
    })

    it('应该使用默认参数获取最近活动', async () => {
      vi.mocked(request.get).mockResolvedValue([])
      
      await dashboardApi.getRecentActivities()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/recent-activities', { params: { limit: 10 } })
    })

    it('应该使用默认参数获取系统通知', async () => {
      vi.mocked(request.get).mockResolvedValue([])
      
      await dashboardApi.getSystemNotifications()
      
      expect(request.get).toHaveBeenCalledWith('/dashboard/notifications', { params: { limit: 5 } })
    })
  })
})