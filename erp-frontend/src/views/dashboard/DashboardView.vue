<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表板</h1>
      <p>欢迎回来，{{ userStore.user?.nickname }}！</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-change" :class="stat.changeType">
                <el-icon>
                  <ArrowUp v-if="stat.changeType === 'increase'" />
                  <ArrowDown v-else />
                </el-icon>
                {{ stat.change }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card title="订单趋势" class="chart-card">
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="64" color="#ddd">
                <TrendCharts />
              </el-icon>
              <p>订单趋势图表</p>
              <small>此处将显示最近30天的订单趋势</small>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card title="销售分布" class="chart-card">
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="64" color="#ddd">
                <PieChart />
              </el-icon>
              <p>销售分布图</p>
              <small>按平台/类目的销售分布</small>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和最新动态 -->
    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :lg="12">
        <el-card title="快捷操作" class="quick-actions-card">
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.key"
              :type="action.type"
              :icon="action.icon"
              @click="handleQuickAction(action.key)"
              class="action-button"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card title="最新动态" class="activities-card">
          <div class="activities">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon" :class="activity.type">
                <el-icon>
                  <component :is="activity.icon" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
                <div class="activity-time">{{ formatTime(activity.time) }}</div>
              </div>
            </div>
            
            <div v-if="activities.length === 0" class="empty-activities">
              <el-empty description="暂无动态" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-row :gutter="20" class="todo-row">
      <el-col :span="24">
        <el-card title="待办事项" class="todo-card">
          <div class="todo-tabs">
            <el-tabs v-model="activeTodoTab" @tab-click="handleTodoTabClick">
              <el-tab-pane label="待处理订单" name="orders">
                <div class="todo-list">
                  <div
                    v-for="order in pendingOrders"
                    :key="order.id"
                    class="todo-item"
                  >
                    <div class="todo-content">
                      <div class="todo-title">订单 #{{ order.orderNumber }}</div>
                      <div class="todo-desc">{{ order.customerName }} - {{ order.totalAmount }}</div>
                    </div>
                    <div class="todo-actions">
                      <el-button size="small" type="primary" @click="handleOrder(order.id)">
                        处理
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="库存预警" name="inventory">
                <div class="todo-list">
                  <div
                    v-for="item in lowStockItems"
                    :key="item.id"
                    class="todo-item"
                  >
                    <div class="todo-content">
                      <div class="todo-title">{{ item.productName }}</div>
                      <div class="todo-desc">当前库存: {{ item.currentStock }} / 安全库存: {{ item.safetyStock }}</div>
                    </div>
                    <div class="todo-actions">
                      <el-button size="small" type="warning" @click="handleInventory(item.id)">
                        补货
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="系统通知" name="notifications">
                <div class="todo-list">
                  <div
                    v-for="notification in systemNotifications"
                    :key="notification.id"
                    class="todo-item"
                  >
                    <div class="todo-content">
                      <div class="todo-title">{{ notification.title }}</div>
                      <div class="todo-desc">{{ notification.content }}</div>
                    </div>
                    <div class="todo-actions">
                      <el-button size="small" @click="handleNotification(notification.id)">
                        查看
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Document,
  Goods,
  Box,
  Shop,
  ArrowUp,
  ArrowDown,
  TrendCharts,
  PieChart,
  Plus,
  Upload,
  Search,
  Setting,
  Bell,
  Warning
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const activeTodoTab = ref('orders')

// 统计数据
const stats = reactive([
  {
    key: 'orders',
    label: '今日订单',
    value: '156',
    change: '+12.5%',
    changeType: 'increase',
    icon: 'Document',
    type: 'primary'
  },
  {
    key: 'products',
    label: '商品总数',
    value: '2,847',
    change: '+3.2%',
    changeType: 'increase',
    icon: 'Goods',
    type: 'success'
  },
  {
    key: 'inventory',
    label: '库存预警',
    value: '23',
    change: '-5.1%',
    changeType: 'decrease',
    icon: 'Box',
    type: 'warning'
  },
  {
    key: 'stores',
    label: '活跃店铺',
    value: '8',
    change: '0%',
    changeType: 'increase',
    icon: 'Shop',
    type: 'info'
  }
])

// 快捷操作
const quickActions = reactive([
  { key: 'new-product', label: '添加商品', type: 'primary', icon: Plus },
  { key: 'import-products', label: '批量导入', type: 'success', icon: Upload },
  { key: 'search-orders', label: '查询订单', type: 'info', icon: Search },
  { key: 'system-settings', label: '系统设置', type: 'warning', icon: Setting }
])

// 最新动态
const activities = reactive([
  {
    id: 1,
    title: '新订单创建',
    description: '订单 #WM202401001 已创建，等待处理',
    time: new Date(Date.now() - 5 * 60 * 1000),
    type: 'order',
    icon: 'Document'
  },
  {
    id: 2,
    title: '库存预警',
    description: '商品 iPhone 15 Pro 库存不足，当前库存: 5',
    time: new Date(Date.now() - 15 * 60 * 1000),
    type: 'warning',
    icon: 'Warning'
  },
  {
    id: 3,
    title: '商品上架',
    description: '成功上架商品到沃尔玛平台',
    time: new Date(Date.now() - 30 * 60 * 1000),
    type: 'success',
    icon: 'Goods'
  }
])

// 待处理订单
const pendingOrders = reactive([
  {
    id: 1,
    orderNumber: 'WM202401001',
    customerName: 'John Doe',
    totalAmount: '$299.99'
  },
  {
    id: 2,
    orderNumber: 'WM202401002',
    customerName: 'Jane Smith',
    totalAmount: '$159.99'
  }
])

// 低库存商品
const lowStockItems = reactive([
  {
    id: 1,
    productName: 'iPhone 15 Pro',
    currentStock: 5,
    safetyStock: 20
  },
  {
    id: 2,
    productName: 'Samsung Galaxy S24',
    currentStock: 8,
    safetyStock: 15
  }
])

// 系统通知
const systemNotifications = reactive([
  {
    id: 1,
    title: '系统维护通知',
    content: '系统将于今晚23:00-01:00进行维护'
  },
  {
    id: 2,
    title: '新功能上线',
    content: '批量订单处理功能已上线'
  }
])

// 方法
const handleQuickAction = (actionKey: string) => {
  switch (actionKey) {
    case 'new-product':
      router.push('/products?action=create')
      break
    case 'import-products':
      router.push('/products/import')
      break
    case 'search-orders':
      router.push('/orders')
      break
    case 'system-settings':
      router.push('/settings')
      break
  }
}

const handleTodoTabClick = (tab: any) => {
  // 可以在这里加载对应的数据
  console.log('Tab clicked:', tab.name)
}

const handleOrder = (orderId: number) => {
  router.push(`/orders/${orderId}`)
}

const handleInventory = (itemId: number) => {
  router.push(`/inventory?item=${itemId}`)
}

const handleNotification = (notificationId: number) => {
  router.push(`/notifications/${notificationId}`)
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

// 组件挂载时加载数据
onMounted(() => {
  // TODO: 加载仪表板数据
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.dashboard-header p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  border-left: 4px solid #409eff;
}

.stat-card.success {
  border-left: 4px solid #67c23a;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.info {
  border-left: 4px solid #909399;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 16px;
  color: #409eff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-change.increase {
  color: #67c23a;
}

.stat-change.decrease {
  color: #f56c6c;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 16px 0 8px;
  font-size: 16px;
}

.chart-placeholder small {
  font-size: 12px;
  color: #c0c4cc;
}

.content-row {
  margin-bottom: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.action-button {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.activities {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.activity-icon.order {
  background-color: #e1f3ff;
  color: #409eff;
}

.activity-icon.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.activity-icon.success {
  background-color: #f0f9ff;
  color: #67c23a;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.empty-activities {
  padding: 40px 0;
}

.todo-row {
  margin-bottom: 24px;
}

.todo-card {
  min-height: 400px;
}

.todo-list {
  max-height: 300px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.todo-desc {
  font-size: 12px;
  color: #606266;
}

.todo-actions {
  margin-left: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 24px;
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-card {
    height: 300px;
  }
  
  .chart-container {
    height: 220px;
  }
}
</style>