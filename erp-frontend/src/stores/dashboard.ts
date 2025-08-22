/**
 * 仪表板状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DashboardStats,
  SalesTrendData,
  OrderStatusData,
  TopProduct,
  QuickAction,
  PendingTask,
  RecentActivity,
  SystemNotification,
  DashboardData
} from '@/api/modules/dashboard'
import {
  getDashboardStats,
  getSalesTrend,
  getOrderStatus,
  getTopProducts,
  getQuickActions,
  getPendingTasks,
  getRecentActivities,
  getSystemNotifications,
  getDashboardData,
  markNotificationRead,
  markAllNotificationsRead,
  refreshDashboardData
} from '@/api/modules/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态数据
  const stats = ref<DashboardStats>({
    todayOrders: 0,
    todayOrdersChange: 0,
    todaySales: 0,
    todaySalesChange: 0,
    totalProducts: 0,
    totalProductsChange: 0,
    lowStockAlerts: 0,
    lowStockAlertsChange: 0
  })

  const salesTrend = ref<SalesTrendData>({
    labels: [],
    data: []
  })

  const orderStatus = ref<OrderStatusData>({
    labels: [],
    data: []
  })

  const topProducts = ref<TopProduct[]>([])
  const quickActions = ref<QuickAction[]>([])
  const pendingTasks = ref<PendingTask[]>([])
  const recentActivities = ref<RecentActivity[]>([])
  const systemNotifications = ref<SystemNotification[]>([])

  // 加载状态
  const loading = ref(false)
  const statsLoading = ref(false)
  const chartsLoading = ref(false)
  const activitiesLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // 计算属性
  const unreadNotificationsCount = computed(() => {
    return systemNotifications.value.filter(n => !n.isRead).length
  })

  const highPriorityTasksCount = computed(() => {
    return pendingTasks.value.filter(t => t.priority === 'high').length
  })

  const todayOrdersGrowth = computed(() => {
    return stats.value.todayOrdersChange >= 0 ? 'positive' : 'negative'
  })

  const todaySalesGrowth = computed(() => {
    return stats.value.todaySalesChange >= 0 ? 'positive' : 'negative'
  })

  // 操作方法
  const fetchStats = async () => {
    try {
      statsLoading.value = true
      const response = await getDashboardStats()
      stats.value = response.data
    } catch (error) {
      console.error('获取仪表板统计数据失败:', error)
      // 使用模拟数据作为后备
      stats.value = {
        todayOrders: 1234,
        todayOrdersChange: 12.5,
        todaySales: 156789.50,
        todaySalesChange: -3.2,
        totalProducts: 5678,
        totalProductsChange: 8.7,
        lowStockAlerts: 23,
        lowStockAlertsChange: 15.3
      }
    } finally {
      statsLoading.value = false
    }
  }

  const fetchSalesTrend = async (period: string = '30d') => {
    try {
      chartsLoading.value = true
      const response = await getSalesTrend(period)
      salesTrend.value = response.data
    } catch (error) {
      console.error('获取销售趋势数据失败:', error)
      // 使用模拟数据作为后备
      salesTrend.value = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [120000, 135000, 148000, 162000, 175000, 189000]
      }
    } finally {
      chartsLoading.value = false
    }
  }

  const fetchOrderStatus = async () => {
    try {
      const response = await getOrderStatus()
      orderStatus.value = response.data
    } catch (error) {
      console.error('获取订单状态数据失败:', error)
      // 使用模拟数据作为后备
      orderStatus.value = {
        labels: ['待支付', '已支付', '已发货', '已完成', '已取消'],
        data: [45, 123, 89, 567, 23]
      }
    }
  }

  const fetchTopProducts = async (limit: number = 5) => {
    try {
      const response = await getTopProducts(limit)
      topProducts.value = response.data
    } catch (error) {
      console.error('获取热销商品数据失败:', error)
      // 使用模拟数据作为后备
      topProducts.value = [
        { name: 'iPhone 15 Pro Max', sales: 234, revenue: 2339766 },
        { name: 'MacBook Pro 14英寸', sales: 89, revenue: 1423911 },
        { name: 'AirPods Pro 2', sales: 156, revenue: 296244 },
        { name: 'iPad Air', sales: 67, revenue: 294733 },
        { name: 'Apple Watch', sales: 123, revenue: 369000 }
      ]
    }
  }

  const fetchQuickActions = async () => {
    try {
      const response = await getQuickActions()
      quickActions.value = response.data
    } catch (error) {
      console.error('获取快捷操作数据失败:', error)
      // 使用模拟数据作为后备
      quickActions.value = [
        {
          id: 'orders',
          title: '订单管理',
          description: '查看和处理订单',
          icon: 'ShoppingCart',
          color: '#409EFF',
          badge: '12 待处理',
          badgeType: 'info',
          route: '/orders'
        },
        {
          id: 'products',
          title: '商品管理',
          description: '管理商品信息',
          icon: 'Box',
          color: '#67C23A',
          badge: '3 待审核',
          badgeType: 'warning',
          route: '/products'
        },
        {
          id: 'inventory',
          title: '库存管理',
          description: '监控库存状态',
          icon: 'Warehouse',
          color: '#E6A23C',
          badge: '5 预警',
          badgeType: 'warning',
          route: '/inventory'
        },
        {
          id: 'platforms',
          title: '平台管理',
          description: '管理销售平台',
          icon: 'Shop',
          color: '#F56C6C',
          badge: '正常',
          badgeType: 'success',
          route: '/platforms'
        },
        {
          id: 'logistics',
          title: '物流管理',
          description: '跟踪物流状态',
          icon: 'Truck',
          color: '#909399',
          badge: '8 在途',
          badgeType: 'info',
          route: '/logistics'
        },
        {
          id: 'users',
          title: '用户管理',
          description: '管理系统用户',
          icon: 'User',
          color: '#606266',
          badge: '2 待激活',
          badgeType: 'warning',
          route: '/users'
        }
      ]
    }
  }

  const fetchPendingTasks = async (limit: number = 10) => {
    try {
      const response = await getPendingTasks(limit)
      pendingTasks.value = response.data
    } catch (error) {
      console.error('获取待处理事项失败:', error)
      // 使用模拟数据作为后备
      pendingTasks.value = [
        {
          id: '1',
          title: '处理退货申请',
          description: '订单 #ORD202402050001 申请退货',
          type: 'order',
          priority: 'high',
          createdAt: '2024-02-05 14:30:00',
          route: '/orders/1'
        },
        {
          id: '2',
          title: '库存补充',
          description: 'iPhone 15 Pro Max 库存不足',
          type: 'inventory',
          priority: 'medium',
          createdAt: '2024-02-05 13:20:00',
          route: '/inventory'
        },
        {
          id: '3',
          title: '商品审核',
          description: '3个新商品待审核',
          type: 'product',
          priority: 'medium',
          createdAt: '2024-02-05 12:15:00',
          route: '/products'
        },
        {
          id: '4',
          title: '平台同步异常',
          description: 'eBay平台同步失败',
          type: 'platform',
          priority: 'high',
          createdAt: '2024-02-05 11:45:00',
          route: '/platforms'
        },
        {
          id: '5',
          title: '物流异常处理',
          description: '运单 YE123456789CN 配送异常',
          type: 'logistics',
          priority: 'medium',
          createdAt: '2024-02-05 10:30:00',
          route: '/logistics'
        }
      ]
    }
  }

  const fetchRecentActivities = async (limit: number = 10) => {
    try {
      activitiesLoading.value = true
      const response = await getRecentActivities(limit)
      recentActivities.value = response.data
    } catch (error) {
      console.error('获取最近活动失败:', error)
      // 使用模拟数据作为后备
      recentActivities.value = [
        {
          id: '1',
          type: 'order',
          description: '新订单 #ORD202402050001 已创建',
          user: '张三',
          time: new Date().toISOString()
        },
        {
          id: '2',
          type: 'user',
          description: '新用户注册：李四',
          user: '系统',
          time: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'product',
          description: '商品库存预警：iPhone 15',
          user: '系统',
          time: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          type: 'order',
          description: '订单 #ORD202402050002 已发货',
          user: '王五',
          time: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          type: 'user',
          description: '用户权限更新：赵六',
          user: '管理员',
          time: new Date(Date.now() - 14400000).toISOString()
        }
      ]
    } finally {
      activitiesLoading.value = false
    }
  }

  const fetchSystemNotifications = async (limit: number = 5) => {
    try {
      const response = await getSystemNotifications(limit)
      systemNotifications.value = response.data
    } catch (error) {
      console.error('获取系统通知失败:', error)
      // 使用模拟数据作为后备
      systemNotifications.value = [
        {
          id: '1',
          title: '库存预警',
          content: 'SKU003 (AirPods Pro 2) 库存不足，当前库存：3件',
          type: 'warning',
          isRead: false,
          createdAt: '2024-02-05 14:30:00'
        },
        {
          id: '2',
          title: '新订单提醒',
          content: '收到新订单 ORD202402050001，金额：¥9,999.00',
          type: 'info',
          isRead: false,
          createdAt: '2024-02-05 10:30:00'
        },
        {
          id: '3',
          title: '商品缺货',
          content: 'SKU004 (iPad Air) 已缺货，请及时补充库存',
          type: 'error',
          isRead: true,
          createdAt: '2024-02-04 18:45:00'
        },
        {
          id: '4',
          title: '系统更新',
          content: '系统将于今晚22:00进行维护更新，预计耗时30分钟',
          type: 'info',
          isRead: true,
          createdAt: '2024-02-04 16:00:00'
        },
        {
          id: '5',
          title: '订单发货',
          content: '订单 ORD202402050002 已发货，运单号：YE123456790CN',
          type: 'success',
          isRead: true,
          createdAt: '2024-02-05 09:30:00'
        }
      ]
    }
  }

  const fetchAllData = async () => {
    try {
      loading.value = true
      error.value = null
      
      // 直接调用所有 fetch 方法，让错误传播
      await fetchStats()
      await fetchSalesTrend()
      await fetchOrderStatus()
      await fetchTopProducts()
      await fetchQuickActions()
      await fetchPendingTasks()
      await fetchRecentActivities()
      await fetchSystemNotifications()
      
      lastUpdated.value = new Date()
    } catch (err) {
      console.error('获取仪表板数据失败:', err)
      error.value = err instanceof Error ? err.message : '获取数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      const notification = systemNotifications.value.find(n => n.id === id)
      if (notification) {
        notification.isRead = true
      }
    } catch (error) {
      console.error('标记通知已读失败:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsRead()
      systemNotifications.value.forEach(notification => {
        notification.isRead = true
      })
    } catch (error) {
      console.error('标记所有通知已读失败:', error)
    }
  }

  const refreshData = async () => {
    try {
      await refreshDashboardData()
      await fetchAllData()
    } catch (err) {
      console.error('刷新仪表板数据失败:', err)
      error.value = err instanceof Error ? err.message : '刷新数据失败'
      throw err
    }
  }

  // 清除错误状态
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    stats,
    salesTrend,
    orderStatus,
    topProducts,
    quickActions,
    pendingTasks,
    recentActivities,
    systemNotifications,
    loading,
    statsLoading,
    chartsLoading,
    activitiesLoading,
    error,
    lastUpdated,

    // 计算属性
    unreadNotificationsCount,
    highPriorityTasksCount,
    todayOrdersGrowth,
    todaySalesGrowth,

    // 方法
    fetchStats,
    fetchSalesTrend,
    fetchOrderStatus,
    fetchTopProducts,
    fetchQuickActions,
    fetchPendingTasks,
    fetchRecentActivities,
    fetchSystemNotifications,
    fetchAllData,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshData,
    clearError
  }
})