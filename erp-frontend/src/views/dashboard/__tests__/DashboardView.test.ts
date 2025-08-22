/**
 * 仪表板页面组件测试
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { ElButton, ElIcon, ElProgress, ElMessage } from 'element-plus'
import DashboardView from '../DashboardView.vue'
import ChartContainer from '@/components/business/ChartContainer.vue'
import { useDashboardStore } from '@/stores/dashboard'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

// Mock Element Plus Message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn()
  })),
  registerables: []
}))

describe('DashboardView', () => {
  let wrapper: any
  let pinia: any
  let dashboardStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    dashboardStore = useDashboardStore()
    
    // Mock store methods
    vi.spyOn(dashboardStore, 'fetchAllData').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchStats').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchSalesTrend').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchOrderStatus').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchTopProducts').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchQuickActions').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchPendingTasks').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchRecentActivities').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'fetchSystemNotifications').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'refreshData').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'markNotificationAsRead').mockResolvedValue(undefined)
    vi.spyOn(dashboardStore, 'markAllNotificationsAsRead').mockResolvedValue(undefined)

    // 设置模拟数据
    dashboardStore.stats = {
      todayOrders: 1234,
      todayOrdersChange: 12.5,
      todaySales: 156789.50,
      todaySalesChange: -3.2,
      totalProducts: 5678,
      totalProductsChange: 8.7,
      lowStockAlerts: 23,
      lowStockAlertsChange: 15.3
    }

    dashboardStore.salesTrend = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [120000, 135000, 148000, 162000, 175000, 189000]
    }

    dashboardStore.orderStatus = {
      labels: ['待支付', '已支付', '已发货', '已完成', '已取消'],
      data: [45, 123, 89, 567, 23]
    }

    dashboardStore.topProducts = [
      { name: 'iPhone 15 Pro Max', sales: 234, revenue: 2339766 },
      { name: 'MacBook Pro 14英寸', sales: 89, revenue: 1423911 }
    ]

    dashboardStore.quickActions = [
      {
        id: 'orders',
        title: '订单管理',
        description: '查看和处理订单',
        icon: 'ShoppingCart',
        color: '#409EFF',
        badge: '12 待处理',
        badgeType: 'info',
        route: '/orders'
      }
    ]

    dashboardStore.pendingTasks = [
      {
        id: '1',
        title: '处理退货申请',
        description: '订单 #ORD202402050001 申请退货',
        type: 'order',
        priority: 'high',
        createdAt: '2024-02-05 14:30:00',
        route: '/orders/1'
      }
    ]

    dashboardStore.recentActivities = [
      {
        id: '1',
        type: 'order',
        description: '新订单 #ORD202402050001 已创建',
        user: '张三',
        time: new Date().toISOString()
      }
    ]

    dashboardStore.systemNotifications = [
      {
        id: '1',
        title: '库存预警',
        content: 'SKU003 (AirPods Pro 2) 库存不足，当前库存：3件',
        type: 'warning',
        isRead: false,
        createdAt: '2024-02-05 14:30:00'
      }
    ]

    wrapper = mount(DashboardView, {
      global: {
        plugins: [pinia],
        components: {
          ElButton,
          ElIcon,
          ElProgress,
          ChartContainer
        },
        stubs: {
          'el-icon': true,
          'chart-container': true
        }
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染仪表板页面', () => {
      expect(wrapper.find('.dashboard-view').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toBe('仪表板')
    })

    it('应该渲染页面头部和操作按钮', () => {
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.find('.page-actions').exists()).toBe(true)
      
      const buttons = wrapper.findAllComponents(ElButton)
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该渲染统计卡片', () => {
      expect(wrapper.find('.dashboard-stats').exists()).toBe(true)
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
      
      // 检查统计数据显示
      expect(wrapper.text()).toContain('今日订单')
      expect(wrapper.text()).toContain('今日销售额')
      expect(wrapper.text()).toContain('商品总数')
      expect(wrapper.text()).toContain('库存预警')
    })

    it('应该渲染图表区域', () => {
      expect(wrapper.find('.dashboard-charts').exists()).toBe(true)
      expect(wrapper.find('.charts-row').exists()).toBe(true)
      
      // 检查图表标题
      expect(wrapper.text()).toContain('销售趋势')
      expect(wrapper.text()).toContain('订单状态分布')
      expect(wrapper.text()).toContain('热销商品排行')
    })

    it('应该渲染快捷操作区域', () => {
      expect(wrapper.find('.dashboard-quick-section').exists()).toBe(true)
      expect(wrapper.find('.quick-actions-card').exists()).toBe(true)
      expect(wrapper.find('.dashboard-actions').exists()).toBe(true)
      
      const actionCards = wrapper.findAll('.action-card')
      expect(actionCards.length).toBeGreaterThan(0)
    })

    it('应该渲染待处理事项', () => {
      expect(wrapper.find('.pending-tasks-card').exists()).toBe(true)
      expect(wrapper.find('.pending-tasks-list').exists()).toBe(true)
      
      const taskItems = wrapper.findAll('.pending-task-item')
      expect(taskItems.length).toBeGreaterThan(0)
    })

    it('应该渲染最近活动和系统通知', () => {
      expect(wrapper.find('.dashboard-activity-section').exists()).toBe(true)
      expect(wrapper.find('.recent-activities-card').exists()).toBe(true)
      expect(wrapper.find('.system-notifications-card').exists()).toBe(true)
    })
  })

  describe('数据显示', () => {
    it('应该正确显示统计数据', () => {
      // 检查今日订单数据
      expect(wrapper.text()).toContain('1,234')
      expect(wrapper.text()).toContain('12.5%')
      
      // 检查今日销售额数据
      expect(wrapper.text()).toContain('156,789.50')
      expect(wrapper.text()).toContain('3.2%')
      
      // 检查商品总数
      expect(wrapper.text()).toContain('5,678')
      
      // 检查库存预警
      expect(wrapper.text()).toContain('23')
    })

    it('应该正确显示热销商品列表', () => {
      expect(wrapper.text()).toContain('iPhone 15 Pro Max')
      expect(wrapper.text()).toContain('MacBook Pro 14英寸')
      expect(wrapper.text()).toContain('销量: 234')
      expect(wrapper.text()).toContain('销量: 89')
    })

    it('应该正确显示快捷操作', () => {
      expect(wrapper.text()).toContain('订单管理')
      expect(wrapper.text()).toContain('查看和处理订单')
      expect(wrapper.text()).toContain('12 待处理')
    })

    it('应该正确显示待处理事项', () => {
      expect(wrapper.text()).toContain('处理退货申请')
      expect(wrapper.text()).toContain('订单 #ORD202402050001 申请退货')
    })

    it('应该正确显示系统通知', () => {
      expect(wrapper.text()).toContain('库存预警')
      expect(wrapper.text()).toContain('SKU003 (AirPods Pro 2) 库存不足')
    })
  })

  describe('交互功能', () => {
    it('应该能够刷新数据', async () => {
      const refreshButton = wrapper.findAllComponents(ElButton)[0]
      await refreshButton.trigger('click')
      
      expect(dashboardStore.refreshData).toHaveBeenCalled()
    })

    it('应该能够刷新销售趋势图表', async () => {
      // 找到销售趋势图表的刷新按钮
      const chartRefreshButtons = wrapper.findAll('.card-actions .btn')
      if (chartRefreshButtons.length > 0) {
        await chartRefreshButtons[0].trigger('click')
        expect(dashboardStore.fetchSalesTrend).toHaveBeenCalled()
      }
    })

    it('应该能够点击快捷操作卡片进行导航', async () => {
      const actionCard = wrapper.find('.action-card')
      await actionCard.trigger('click')
      
      expect(mockPush).toHaveBeenCalledWith('/orders')
    })

    it('应该能够点击待处理事项进行导航', async () => {
      const taskItem = wrapper.find('.pending-task-item')
      await taskItem.trigger('click')
      
      expect(mockPush).toHaveBeenCalledWith('/orders/1')
    })

    it('应该能够标记通知为已读', async () => {
      const notificationItem = wrapper.find('.notification-item')
      await notificationItem.trigger('click')
      
      expect(dashboardStore.markNotificationAsRead).toHaveBeenCalledWith('1')
    })

    it('应该能够标记所有通知为已读', async () => {
      // 查找"全部已读"按钮
      const markAllButton = wrapper.find('.system-notifications-card .card-actions .btn')
      if (markAllButton.exists()) {
        await markAllButton.trigger('click')
        expect(dashboardStore.markAllNotificationsAsRead).toHaveBeenCalled()
      }
    })
  })

  describe('自动刷新功能', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该能够开启自动刷新', async () => {
      const autoRefreshButton = wrapper.findAllComponents(ElButton)[1]
      await autoRefreshButton.trigger('click')
      
      expect(wrapper.vm.autoRefreshEnabled).toBe(true)
      expect(ElMessage.success).toHaveBeenCalledWith('已开启自动刷新')
    })

    it('应该能够停止自动刷新', async () => {
      // 先开启自动刷新
      const autoRefreshButton = wrapper.findAllComponents(ElButton)[1]
      await autoRefreshButton.trigger('click')
      
      // 再次点击停止
      await autoRefreshButton.trigger('click')
      
      expect(wrapper.vm.autoRefreshEnabled).toBe(false)
      expect(ElMessage.info).toHaveBeenCalledWith('已停止自动刷新')
    })

    it('应该在自动刷新间隔内更新数据', async () => {
      // 清除之前的调用记录
      vi.clearAllMocks()
      
      // 开启自动刷新
      const autoRefreshButton = wrapper.findAllComponents(ElButton)[1]
      await autoRefreshButton.trigger('click')
      
      // 等待组件更新
      await nextTick()
      await flushPromises()
      
      // 验证自动刷新已开启
      expect(wrapper.vm.autoRefreshEnabled).toBe(true)
      
      // 快进时间到自动刷新间隔
      vi.advanceTimersByTime(30000)
      await flushPromises()
      
      // 验证自动刷新调用了相关方法
      expect(dashboardStore.fetchStats).toHaveBeenCalled()
      expect(dashboardStore.fetchPendingTasks).toHaveBeenCalled()
      expect(dashboardStore.fetchSystemNotifications).toHaveBeenCalled()
    }, 15000)
  })

  describe('工具方法', () => {
    it('应该正确格式化数字', () => {
      const formattedNumber = wrapper.vm.formatNumber(1234567)
      expect(formattedNumber).toBe('1,234,567')
    })

    it('应该正确格式化货币', () => {
      const formattedCurrency = wrapper.vm.formatCurrency(1234.56)
      expect(formattedCurrency).toBe('1,234.56')
    })

    it('应该正确格式化相对时间', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 3600000).toISOString()
      
      const relativeTime = wrapper.vm.formatRelativeTime(oneHourAgo)
      expect(relativeTime).toBe('1小时前')
    })

    it('应该正确计算商品销量百分比', () => {
      const percentage = wrapper.vm.getProductPercentage(234, 0)
      expect(percentage).toBe(100) // 最高销量商品应该是100%
    })

    it('应该正确获取任务类型名称', () => {
      expect(wrapper.vm.getTaskTypeName('order')).toBe('订单')
      expect(wrapper.vm.getTaskTypeName('product')).toBe('商品')
      expect(wrapper.vm.getTaskTypeName('inventory')).toBe('库存')
    })
  })

  describe('计算属性', () => {
    it('应该正确计算销售趋势图表数据', () => {
      const chartData = wrapper.vm.salesTrendChartData
      expect(chartData.labels).toEqual(['1月', '2月', '3月', '4月', '5月', '6月'])
      expect(chartData.datasets[0].data).toEqual([120000, 135000, 148000, 162000, 175000, 189000])
    })

    it('应该正确计算订单状态图表数据', () => {
      const chartData = wrapper.vm.orderStatusChartData
      expect(chartData.labels).toEqual(['待支付', '已支付', '已发货', '已完成', '已取消'])
      expect(chartData.datasets[0].data).toEqual([45, 123, 89, 567, 23])
    })
  })

  describe('生命周期', () => {
    it('应该在组件挂载时加载数据', () => {
      expect(dashboardStore.fetchAllData).toHaveBeenCalled()
    })

    it('应该在组件卸载时清理自动刷新', async () => {
      // 开启自动刷新
      const autoRefreshButton = wrapper.findAllComponents(ElButton)[1]
      await autoRefreshButton.trigger('click')
      
      // 卸载组件
      wrapper.unmount()
      
      // 验证自动刷新已停止
      expect(wrapper.vm.autoRefreshEnabled).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理数据加载失败', async () => {
      // Mock 失败的API调用
      dashboardStore.fetchAllData.mockRejectedValue(new Error('API Error'))
      
      // 重新挂载组件
      wrapper.unmount()
      wrapper = mount(DashboardView, {
        global: {
          plugins: [pinia],
          components: {
            ElButton,
            ElIcon,
            ElProgress,
            ChartContainer
          },
          stubs: {
            'el-icon': true,
            'chart-container': true
          }
        }
      })
      
      // 等待组件挂载完成
      await wrapper.vm.$nextTick()
      
      // 验证错误被正确处理（不会导致组件崩溃）
      expect(wrapper.find('.dashboard-view').exists()).toBe(true)
    })

    it('应该处理刷新数据失败', async () => {
      dashboardStore.refreshData.mockRejectedValue(new Error('Refresh Error'))
      
      const refreshButton = wrapper.findAllComponents(ElButton)[0]
      await refreshButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('数据刷新失败')
    })
  })
})