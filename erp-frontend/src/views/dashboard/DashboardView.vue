<template>
  <div class="dashboard-view">
    <!-- 错误提示 -->
    <el-alert
      v-if="dashboardStore.error"
      :title="dashboardStore.error"
      type="error"
      :closable="true"
      @close="dashboardStore.clearError"
      style="margin-bottom: 16px;"
    />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <h2 class="page-title">仪表板</h2>
        <div v-if="dashboardStore.lastUpdated" class="last-updated">
          最后更新: {{ formatLastUpdated(dashboardStore.lastUpdated) }}
        </div>
      </div>
      <div class="page-actions">
        <el-button 
          @click="handleRefresh" 
          :loading="dashboardStore.loading"
          type="primary"
        >
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button 
          @click="toggleAutoRefresh"
          :type="autoRefreshEnabled ? 'success' : 'default'"
        >
          <el-icon><Timer /></el-icon>
          {{ autoRefreshEnabled ? '停止自动刷新' : '开启自动刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="dashboard-stats" v-loading="dashboardStore.statsLoading">
      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">今日订单</h3>
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><ShoppingCart /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ formatNumber(dashboardStore.stats.todayOrders) }}</div>
        <div class="stat-change" :class="dashboardStore.todayOrdersGrowth">
          <el-icon v-if="dashboardStore.stats.todayOrdersChange >= 0"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
          <span>{{ Math.abs(dashboardStore.stats.todayOrdersChange) }}%</span>
          <span class="stat-change-text">较昨日</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">今日销售额</h3>
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><Money /></el-icon>
          </div>
        </div>
        <div class="stat-value">¥{{ formatCurrency(dashboardStore.stats.todaySales) }}</div>
        <div class="stat-change" :class="dashboardStore.todaySalesGrowth">
          <el-icon v-if="dashboardStore.stats.todaySalesChange >= 0"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
          <span>{{ Math.abs(dashboardStore.stats.todaySalesChange) }}%</span>
          <span class="stat-change-text">较昨日</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">商品总数</h3>
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><Box /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ formatNumber(dashboardStore.stats.totalProducts) }}</div>
        <div class="stat-change positive">
          <el-icon><ArrowUp /></el-icon>
          <span>{{ dashboardStore.stats.totalProductsChange }}%</span>
          <span class="stat-change-text">较上月</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">库存预警</h3>
          <div class="stat-icon" style="background: #F56C6C;">
            <el-icon><Warning /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ dashboardStore.stats.lowStockAlerts }}</div>
        <div class="stat-change" :class="dashboardStore.stats.lowStockAlertsChange >= 0 ? 'negative' : 'positive'">
          <el-icon v-if="dashboardStore.stats.lowStockAlertsChange >= 0"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
          <span>{{ Math.abs(dashboardStore.stats.lowStockAlertsChange) }}%</span>
          <span class="stat-change-text">较上周</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="dashboard-charts">
      <div class="charts-row">
        <div class="chart-container">
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">销售趋势</h3>
              <div class="card-actions">
                <el-button 
                  text 
                  @click="refreshSalesTrend"
                  :loading="dashboardStore.chartsLoading"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="card-body">
              <ChartContainer
                v-if="dashboardStore.salesTrend.data.length > 0"
                :data="salesTrendChartData"
                type="line"
                height="300px"
                :options="salesTrendOptions"
              />
              <div v-else class="chart-placeholder">
                <el-icon size="48"><TrendCharts /></el-icon>
                <p>销售趋势图表</p>
                <p class="chart-desc">显示最近6个月的销售数据趋势</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">订单状态分布</h3>
              <div class="card-actions">
                <el-button 
                  text 
                  @click="refreshOrderStatus"
                  :loading="dashboardStore.chartsLoading"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="card-body">
              <ChartContainer
                v-if="dashboardStore.orderStatus.data.length > 0"
                :data="orderStatusChartData"
                type="doughnut"
                height="300px"
                :options="orderStatusOptions"
              />
              <div v-else class="chart-placeholder">
                <el-icon size="48"><PieChart /></el-icon>
                <p>订单状态分布</p>
                <p class="chart-desc">显示当前订单状态分布情况</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="charts-row">
        <div class="chart-container full-width">
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">热销商品排行</h3>
              <div class="card-actions">
                <el-button 
                  text 
                  @click="refreshTopProducts"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="card-body">
              <div class="top-products-list">
                <div 
                  v-for="(product, index) in dashboardStore.topProducts" 
                  :key="index"
                  class="top-product-item"
                >
                  <div class="product-rank">{{ index + 1 }}</div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-stats">
                      <span class="sales-count">销量: {{ product.sales }}</span>
                      <span class="revenue">营收: ¥{{ formatCurrency(product.revenue) }}</span>
                    </div>
                  </div>
                  <div class="product-progress">
                    <el-progress 
                      :percentage="getProductPercentage(product.sales, index)" 
                      :show-text="false"
                      :stroke-width="8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作和待处理事项 -->
    <div class="dashboard-quick-section">
      <!-- 快捷操作 -->
      <div class="content-card quick-actions-card">
        <div class="card-header">
          <h3 class="card-title">快捷操作</h3>
          <div class="card-actions">
            <el-button text @click="refreshQuickActions">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="dashboard-actions">
            <div 
              v-for="action in dashboardStore.quickActions" 
              :key="action.id"
              class="action-card interactive-element" 
              @click="navigateToPage(action.route)"
            >
              <div class="action-icon" :style="{ background: action.color }">
                <el-icon>
                  <component :is="getIconComponent(action.icon)" />
                </el-icon>
              </div>
              <div class="action-content">
                <h3>{{ action.title }}</h3>
                <p>{{ action.description }}</p>
                <span 
                  v-if="action.badge" 
                  class="action-badge" 
                  :class="action.badgeType"
                >
                  {{ action.badge }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 待处理事项 -->
      <div class="content-card pending-tasks-card">
        <div class="card-header">
          <h3 class="card-title">待处理事项</h3>
          <div class="card-actions">
            <el-button text @click="refreshPendingTasks">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button text @click="showAllPendingTasks">
              查看全部
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="pending-tasks-list">
            <div 
              v-for="task in dashboardStore.pendingTasks" 
              :key="task.id"
              class="pending-task-item"
              @click="navigateToTask(task)"
            >
              <div class="task-priority" :class="`priority-${task.priority}`"></div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-type">{{ getTaskTypeName(task.type) }}</span>
                  <span class="task-time">{{ formatRelativeTime(task.createdAt) }}</span>
                </div>
              </div>
              <div class="task-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最近操作和系统通知 -->
    <div class="dashboard-activity-section">
      <!-- 最近操作 -->
      <div class="content-card recent-activities-card">
        <div class="card-header">
          <h3 class="card-title">最近操作</h3>
          <div class="card-actions">
            <el-button text @click="refreshRecentActivities">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button text @click="showAllActivities">
              查看全部
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="recent-activities-list" v-loading="dashboardStore.activitiesLoading">
            <div 
              v-for="activity in dashboardStore.recentActivities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon" :class="`activity-${activity.type}`">
                <el-icon>
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-meta">
                  <span class="activity-user">{{ activity.user }}</span>
                  <span class="activity-time">{{ formatRelativeTime(activity.time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 系统通知 -->
      <div class="content-card system-notifications-card">
        <div class="card-header">
          <h3 class="card-title">系统通知</h3>
          <div class="card-actions">
            <el-button text @click="markAllNotificationsRead">
              全部已读
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="system-notifications-list">
            <div 
              v-for="notification in dashboardStore.systemNotifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread': !notification.isRead }"
              @click="markNotificationRead(notification)"
            >
              <div class="notification-icon" :class="`notification-${notification.type}`">
                <el-icon>
                  <component :is="getNotificationIcon(notification.type)" />
                </el-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-text">{{ notification.content }}</div>
                <div class="notification-time">{{ formatRelativeTime(notification.createdAt) }}</div>
              </div>
              <div v-if="!notification.isRead" class="notification-unread-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElAlert } from 'element-plus'
import { 
  Refresh, 
  User, 
  ShoppingCart, 
  Box, 
  Money, 
  ArrowUp, 
  ArrowDown,
  TrendCharts,
  PieChart,
  Warning,
  ArrowRight,
  Bell,
  InfoFilled,
  WarningFilled,
  CircleCloseFilled,
  CircleCheckFilled,
  Shop,
  Van,
  House,
  Timer
} from '@element-plus/icons-vue'
import { useDashboardStore } from '@/stores/dashboard'
import ChartContainer from '@/components/business/ChartContainer.vue'

// 路由和状态管理
const router = useRouter()
const dashboardStore = useDashboardStore()

// 自动刷新相关
const autoRefreshEnabled = ref(false)
const autoRefreshInterval = ref<NodeJS.Timeout | null>(null)
const REFRESH_INTERVAL = 30000 // 30秒

// 计算属性 - 销售趋势图表数据
const salesTrendChartData = computed(() => ({
  labels: dashboardStore.salesTrend.labels,
  datasets: [{
    label: '销售额 (¥)',
    data: dashboardStore.salesTrend.data,
    borderColor: '#409EFF',
    backgroundColor: 'rgba(64, 158, 255, 0.1)',
    tension: 0.4,
    fill: true
  }]
}))

// 计算属性 - 订单状态图表数据
const orderStatusChartData = computed(() => ({
  labels: dashboardStore.orderStatus.labels,
  datasets: [{
    data: dashboardStore.orderStatus.data,
    backgroundColor: [
      '#409EFF',
      '#67C23A', 
      '#E6A23C',
      '#F56C6C',
      '#909399'
    ],
    borderWidth: 0
  }]
}))

// 图表配置选项
const salesTrendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f0f0f0'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const orderStatusOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true
      }
    }
  },
  cutout: '60%'
}

// 工具方法
const formatNumber = (num: number) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }
  return num.toLocaleString('zh-CN')
}

const formatCurrency = (amount: number) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00'
  }
  return amount.toLocaleString('zh-CN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const getProductPercentage = (sales: number, index: number) => {
  if (!Array.isArray(dashboardStore.topProducts) || dashboardStore.topProducts.length === 0) {
    return 0
  }
  const maxSales = Math.max(...dashboardStore.topProducts.map(p => p.sales))
  return Math.round((sales / maxSales) * 100)
}

// 图标组件映射
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    ShoppingCart,
    Box,
    House,
    Shop,
    Van,
    User
  }
  return iconMap[iconName] || Box
}

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    order: ShoppingCart,
    user: User,
    product: Box,
    system: InfoFilled
  }
  return iconMap[type] || InfoFilled
}

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    info: InfoFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    success: CircleCheckFilled
  }
  return iconMap[type] || InfoFilled
}

// 类型名称映射
const getTaskTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    order: '订单',
    product: '商品',
    inventory: '库存',
    platform: '平台',
    logistics: '物流'
  }
  return typeMap[type] || type
}

// 事件处理方法
const handleRefresh = async () => {
  try {
    await dashboardStore.refreshData()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('数据刷新失败:', error)
    ElMessage.error('数据刷新失败')
  }
}

// 格式化最后更新时间
const formatLastUpdated = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    return `${hours}小时前`
  } else {
    return date.toLocaleString('zh-CN')
  }
}

const refreshSalesTrend = async () => {
  try {
    await dashboardStore.fetchSalesTrend()
    ElMessage.success('销售趋势数据已更新')
  } catch (error) {
    ElMessage.error('销售趋势数据更新失败')
  }
}

const refreshOrderStatus = async () => {
  try {
    await dashboardStore.fetchOrderStatus()
    ElMessage.success('订单状态数据已更新')
  } catch (error) {
    ElMessage.error('订单状态数据更新失败')
  }
}

const refreshTopProducts = async () => {
  try {
    await dashboardStore.fetchTopProducts()
    ElMessage.success('热销商品数据已更新')
  } catch (error) {
    ElMessage.error('热销商品数据更新失败')
  }
}

const refreshQuickActions = async () => {
  try {
    await dashboardStore.fetchQuickActions()
    ElMessage.success('快捷操作数据已更新')
  } catch (error) {
    ElMessage.error('快捷操作数据更新失败')
  }
}

const refreshPendingTasks = async () => {
  try {
    await dashboardStore.fetchPendingTasks()
    ElMessage.success('待处理事项已更新')
  } catch (error) {
    ElMessage.error('待处理事项更新失败')
  }
}

const refreshRecentActivities = async () => {
  try {
    await dashboardStore.fetchRecentActivities()
    ElMessage.success('最近操作数据已更新')
  } catch (error) {
    ElMessage.error('最近操作数据更新失败')
  }
}

// 导航方法
const navigateToPage = (route: string) => {
  router.push(route)
}

const navigateToTask = (task: any) => {
  if (task.route) {
    router.push(task.route)
  }
}

const showAllPendingTasks = () => {
  // 导航到待处理事项页面
  ElMessage.info('功能开发中')
}

const showAllActivities = () => {
  // 导航到活动日志页面
  ElMessage.info('功能开发中')
}

// 通知处理
const markNotificationRead = async (notification: any) => {
  if (!notification.isRead) {
    try {
      await dashboardStore.markNotificationAsRead(notification.id)
      ElMessage.success('通知已标记为已读')
    } catch (error) {
      ElMessage.error('标记通知失败')
    }
  }
}

const markAllNotificationsRead = async () => {
  try {
    await dashboardStore.markAllNotificationsAsRead()
    ElMessage.success('所有通知已标记为已读')
  } catch (error) {
    ElMessage.error('标记通知失败')
  }
}

// 自动刷新控制
const toggleAutoRefresh = () => {
  if (autoRefreshEnabled.value) {
    stopAutoRefresh()
  } else {
    startAutoRefresh()
  }
}

const startAutoRefresh = () => {
  autoRefreshEnabled.value = true
  autoRefreshInterval.value = setInterval(async () => {
    try {
      await dashboardStore.fetchStats()
      await dashboardStore.fetchPendingTasks()
      await dashboardStore.fetchSystemNotifications()
    } catch (error) {
      console.error('自动刷新失败:', error)
    }
  }, REFRESH_INTERVAL)
  ElMessage.success('已开启自动刷新')
}

const stopAutoRefresh = () => {
  autoRefreshEnabled.value = false
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
  ElMessage.info('已停止自动刷新')
}

// 生命周期
onMounted(async () => {
  try {
    await dashboardStore.fetchAllData()
  } catch (error) {
    console.error('仪表板数据加载失败:', error)
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.dashboard-view {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.last-updated {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 统计卡片样式 */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-light);
}

.stat-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 8px 0;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--el-color-success);
}

.stat-change.negative {
  color: var(--el-color-danger);
}

.stat-change-text {
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  color: white;
  font-size: 20px;
}

/* 图表区域样式 */
.dashboard-charts {
  margin-bottom: 24px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.charts-row .chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-container {
  min-height: 350px;
}

.content-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  padding: 20px;
}

/* 图表占位符样式 */
.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.chart-placeholder p {
  margin: 12px 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.chart-desc {
  font-size: 12px !important;
  color: var(--el-text-color-secondary) !important;
  margin: 0 !important;
}

/* 热销商品列表样式 */
.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.top-product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.top-product-item:hover {
  background: var(--el-fill-color-light);
}

.product-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.product-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.product-progress {
  width: 120px;
}

/* 快捷操作和待处理事项样式 */
.dashboard-quick-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.action-card:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: white;
  font-size: 18px;
}

.action-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.action-content p {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0 0 8px 0;
}

.action-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.action-badge.warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.action-badge.success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

/* 待处理事项样式 */
.pending-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pending-task-item:hover {
  background: var(--el-fill-color-light);
}

.task-priority {
  width: 4px;
  height: 40px;
  border-radius: 2px;
}

.task-priority.priority-high {
  background: var(--el-color-danger);
}

.task-priority.priority-medium {
  background: var(--el-color-warning);
}

.task-priority.priority-low {
  background: var(--el-color-info);
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.task-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.task-arrow {
  color: var(--el-text-color-placeholder);
}

/* 最近操作和系统通知样式 */
.dashboard-activity-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.recent-activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: var(--el-fill-color-lighter);
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
}

.activity-icon.activity-order {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.activity-icon.activity-user {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.activity-icon.activity-product {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.activity-icon.activity-system {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 系统通知样式 */
.system-notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: var(--el-fill-color-lighter);
}

.notification-item.unread {
  background: var(--el-color-primary-light-9);
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
}

.notification-icon.notification-info {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.notification-icon.notification-warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.notification-icon.notification-error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.notification-icon.notification-success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.notification-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.notification-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.notification-unread-dot {
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border-radius: 50%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-quick-section {
    grid-template-columns: 1fr;
  }
  
  .dashboard-activity-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .dashboard-actions {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>