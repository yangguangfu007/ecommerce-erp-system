/**
 * 仪表板状态管理测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from '../dashboard'
import * as dashboardApi from '@/api/modules/dashboard'

// Mock API 模块
vi.mock('@/api/modules/dashboard', () => ({
  getDashboardStats: vi.fn(),
  getSalesTrend: vi.fn(),
  getOrderStatus: vi.fn(),
  getTopProducts: vi.fn(),
  getQuickActions: vi.fn(),
  getPendingTasks: vi.fn(),
  getRecentActivities: vi.fn(),
  getSystemNotifications: vi.fn(),
  getDashboardData: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  refreshDashboardData: vi.fn()
}))

describe('Dashboard Store', () => {
  let store: ReturnType<typeof useDashboardStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDashboardStore()
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.loading).toBe(false)
      expect(store.statsLoading).toBe(false)
      expect(store.chartsLoading).toBe(false)
      expect(store.activitiesLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.lastUpdated).toBe(null)
      
      expect(store.stats.todayOrders).toBe(0)
      expect(store.salesTrend.labels).toEqual([])
      expect(store.topProducts).toEqual([])
      expect(store.quickActions).toEqual([])
      expect(store.pendingTasks).toEqual([])
      expect(store.recentActivities).toEqual([])
      expect(store.systemNotifications).toEqual([])
    })
  })

  describe('计算属性', () => {
    beforeEach(() => {
      // 设置测试数据
      store.systemNotifications = [
        { id: '1', title: '通知1', content: '内容1', type: 'info', isRead: false, createdAt: '2024-01-01' },
        { id: '2', title: '通知2', content: '内容2', type: 'warning', isRead: true, createdAt: '2024-01-02' },
        { id: '3', title: '通知3', content: '内容3', type: 'error', isRead: false, createdAt: '2024-01-03' }
      ]
      
      store.pendingTasks = [
        { id: '1', title: '任务1', description: '描述1', type: 'order', priority: 'high', createdAt: '2024-01-01' },
        { id: '2', title: '任务2', description: '描述2', type: 'product', priority: 'medium', createdAt: '2024-01-02' },
        { id: '3', title: '任务3', description: '描述3', type: 'inventory', priority: 'high', createdAt: '2024-01-03' }
      ]
      
      store.stats = {
        todayOrders: 100,
        todayOrdersChange: 10.5,
        todaySales: 50000,
        todaySalesChange: -5.2,
        totalProducts: 1000,
        totalProductsChange: 2.3,
        lowStockAlerts: 5,
        lowStockAlertsChange: 1.1
      }
    })

    it('应该正确计算未读通知数量', () => {
      expect(store.unreadNotificationsCount).toBe(2)
    })

    it('应该正确计算高优先级任务数量', () => {
      expect(store.highPriorityTasksCount).toBe(2)
    })

    it('应该正确计算今日订单增长趋势', () => {
      expect(store.todayOrdersGrowth).toBe('positive')
      
      store.stats.todayOrdersChange = -5.0
      expect(store.todayOrdersGrowth).toBe('negative')
    })

    it('应该正确计算今日销售额增长趋势', () => {
      expect(store.todaySalesGrowth).toBe('negative')
      
      store.stats.todaySalesChange = 8.5
      expect(store.todaySalesGrowth).toBe('positive')
    })
  })

  describe('数据获取方法', () => {
    it('应该能够获取统计数据', async () => {
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
      
      vi.mocked(dashboardApi.getDashboardStats).mockResolvedValue(mockStats)
      
      await store.fetchStats()
      
      expect(store.stats).toEqual(mockStats)
      expect(store.statsLoading).toBe(false)
    })

    it('应该能够获取销售趋势数据', async () => {
      const mockTrend = {
        labels: ['1月', '2月', '3月'],
        data: [10000, 15000, 20000]
      }
      
      vi.mocked(dashboardApi.getSalesTrend).mockResolvedValue(mockTrend)
      
      await store.fetchSalesTrend()
      
      expect(store.salesTrend).toEqual(mockTrend)
      expect(store.chartsLoading).toBe(false)
    })

    it('应该能够获取订单状态数据', async () => {
      const mockOrderStatus = {
        labels: ['待支付', '已支付', '已发货'],
        data: [10, 50, 30]
      }
      
      vi.mocked(dashboardApi.getOrderStatus).mockResolvedValue(mockOrderStatus)
      
      await store.fetchOrderStatus()
      
      expect(store.orderStatus).toEqual(mockOrderStatus)
    })

    it('应该能够获取热销商品数据', async () => {
      const mockProducts = [
        { name: '商品1', sales: 100, revenue: 10000 },
        { name: '商品2', sales: 80, revenue: 8000 }
      ]
      
      vi.mocked(dashboardApi.getTopProducts).mockResolvedValue(mockProducts)
      
      await store.fetchTopProducts()
      
      expect(store.topProducts).toEqual(mockProducts)
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
      
      vi.mocked(dashboardApi.getQuickActions).mockResolvedValue(mockActions)
      
      await store.fetchQuickActions()
      
      expect(store.quickActions).toEqual(mockActions)
    })

    it('应该能够获取待处理事项', async () => {
      const mockTasks = [
        {
          id: '1',
          title: '处理订单',
          description: '处理新订单',
          type: 'order' as const,
          priority: 'high' as const,
          createdAt: '2024-01-01'
        }
      ]
      
      vi.mocked(dashboardApi.getPendingTasks).mockResolvedValue(mockTasks)
      
      await store.fetchPendingTasks()
      
      expect(store.pendingTasks).toEqual(mockTasks)
    })

    it('应该能够获取最近活动', async () => {
      const mockActivities = [
        {
          id: '1',
          type: 'order' as const,
          description: '新订单创建',
          user: '张三',
          time: '2024-01-01T10:00:00Z'
        }
      ]
      
      vi.mocked(dashboardApi.getRecentActivities).mockResolvedValue(mockActivities)
      
      await store.fetchRecentActivities()
      
      expect(store.recentActivities).toEqual(mockActivities)
      expect(store.activitiesLoading).toBe(false)
    })

    it('应该能够获取系统通知', async () => {
      const mockNotifications = [
        {
          id: '1',
          title: '系统通知',
          content: '通知内容',
          type: 'info' as const,
          isRead: false,
          createdAt: '2024-01-01'
        }
      ]
      
      vi.mocked(dashboardApi.getSystemNotifications).mockResolvedValue(mockNotifications)
      
      await store.fetchSystemNotifications()
      
      expect(store.systemNotifications).toEqual(mockNotifications)
    })
  })

  describe('错误处理', () => {
    it('应该处理统计数据获取失败', async () => {
      vi.mocked(dashboardApi.getDashboardStats).mockRejectedValue(new Error('API Error'))
      
      await store.fetchStats()
      
      // 应该使用模拟数据作为后备
      expect(store.stats.todayOrders).toBe(1234)
      expect(store.statsLoading).toBe(false)
    })

    it('应该处理销售趋势数据获取失败', async () => {
      vi.mocked(dashboardApi.getSalesTrend).mockRejectedValue(new Error('API Error'))
      
      await store.fetchSalesTrend()
      
      // 应该使用模拟数据作为后备
      expect(store.salesTrend.labels).toEqual(['1月', '2月', '3月', '4月', '5月', '6月'])
      expect(store.chartsLoading).toBe(false)
    })

    it('应该处理获取所有数据失败', async () => {
      // 模拟 API 调用失败
      vi.mocked(dashboardApi.getDashboardStats).mockRejectedValue(new Error('API Error'))
      
      // fetchAllData 应该成功完成，因为使用了模拟数据作为后备
      await store.fetchAllData()
      
      expect(store.loading).toBe(false)
      // 应该使用模拟数据
      expect(store.stats.todayOrders).toBe(1234)
      expect(store.lastUpdated).toBeTruthy()
    })
  })

  describe('通知管理', () => {
    beforeEach(() => {
      store.systemNotifications = [
        { id: '1', title: '通知1', content: '内容1', type: 'info', isRead: false, createdAt: '2024-01-01' },
        { id: '2', title: '通知2', content: '内容2', type: 'warning', isRead: false, createdAt: '2024-01-02' }
      ]
    })

    it('应该能够标记单个通知为已读', async () => {
      vi.mocked(dashboardApi.markNotificationRead).mockResolvedValue(undefined)
      
      await store.markNotificationAsRead('1')
      
      expect(dashboardApi.markNotificationRead).toHaveBeenCalledWith('1')
      expect(store.systemNotifications[0].isRead).toBe(true)
    })

    it('应该能够标记所有通知为已读', async () => {
      vi.mocked(dashboardApi.markAllNotificationsRead).mockResolvedValue(undefined)
      
      await store.markAllNotificationsAsRead()
      
      expect(dashboardApi.markAllNotificationsRead).toHaveBeenCalled()
      expect(store.systemNotifications.every(n => n.isRead)).toBe(true)
    })

    it('应该处理标记通知失败', async () => {
      vi.mocked(dashboardApi.markNotificationRead).mockRejectedValue(new Error('Mark Error'))
      
      await store.markNotificationAsRead('1')
      
      // 通知状态不应该改变
      expect(store.systemNotifications[0].isRead).toBe(false)
    })
  })

  describe('数据刷新', () => {
    it('应该能够刷新所有数据', async () => {
      vi.mocked(dashboardApi.refreshDashboardData).mockResolvedValue(undefined)
      vi.mocked(dashboardApi.getDashboardStats).mockResolvedValue({
        todayOrders: 200,
        todayOrdersChange: 15.0,
        todaySales: 60000,
        todaySalesChange: 8.5,
        totalProducts: 1200,
        totalProductsChange: 5.2,
        lowStockAlerts: 2,
        lowStockAlertsChange: -1.5
      })
      
      await store.refreshData()
      
      expect(dashboardApi.refreshDashboardData).toHaveBeenCalled()
      expect(store.lastUpdated).toBeInstanceOf(Date)
    })

    it('应该处理刷新数据失败', async () => {
      vi.mocked(dashboardApi.refreshDashboardData).mockRejectedValue(new Error('Refresh Error'))
      
      await expect(store.refreshData()).rejects.toThrow('Refresh Error')
      
      expect(store.error).toBe('Refresh Error')
    })
  })

  describe('错误状态管理', () => {
    it('应该能够清除错误状态', () => {
      store.error = '测试错误'
      
      store.clearError()
      
      expect(store.error).toBe(null)
    })
  })
})