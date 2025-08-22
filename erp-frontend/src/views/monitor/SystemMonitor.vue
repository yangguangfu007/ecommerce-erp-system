<template>
  <div class="system-monitor">
    <div class="page-header">
      <h2 class="page-title">系统监控</h2>
      <div class="page-actions">
        <el-button @click="refreshData" :loading="loading" type="primary">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 系统状态卡片 -->
    <div class="monitor-stats">
      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">CPU 使用率</h3>
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><Monitor /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ systemStats.cpuUsage }}%</div>
        <div class="stat-change" :class="systemStats.cpuUsage > 80 ? 'negative' : 'positive'">
          <span>{{ systemStats.cpuUsage > 80 ? '高负载' : '正常' }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">内存使用率</h3>
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><DataBoard /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ systemStats.memoryUsage }}%</div>
        <div class="stat-change" :class="systemStats.memoryUsage > 85 ? 'negative' : 'positive'">
          <span>{{ systemStats.memoryUsage > 85 ? '高负载' : '正常' }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">磁盘使用率</h3>
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><FolderOpened /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ systemStats.diskUsage }}%</div>
        <div class="stat-change" :class="systemStats.diskUsage > 90 ? 'negative' : 'positive'">
          <span>{{ systemStats.diskUsage > 90 ? '空间不足' : '正常' }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3 class="stat-title">网络延迟</h3>
          <div class="stat-icon" style="background: #F56C6C;">
            <el-icon><Connection /></el-icon>
          </div>
        </div>
        <div class="stat-value">{{ systemStats.networkLatency }}ms</div>
        <div class="stat-change" :class="systemStats.networkLatency > 100 ? 'negative' : 'positive'">
          <span>{{ systemStats.networkLatency > 100 ? '延迟较高' : '正常' }}</span>
        </div>
      </div>
    </div>

    <!-- 服务状态 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">服务状态</h3>
      </div>
      <div class="card-body">
        <div class="service-list">
          <div 
            v-for="service in services" 
            :key="service.name"
            class="service-item"
          >
            <div class="service-info">
              <div class="service-name">{{ service.name }}</div>
              <div class="service-description">{{ service.description }}</div>
            </div>
            <div class="service-status">
              <el-tag 
                :type="service.status === 'running' ? 'success' : 'danger'"
                size="small"
              >
                {{ service.status === 'running' ? '运行中' : '已停止' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Refresh, 
  Monitor, 
  DataBoard, 
  FolderOpened, 
  Connection 
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const systemStats = ref({
  cpuUsage: 45,
  memoryUsage: 68,
  diskUsage: 72,
  networkLatency: 25
})

const services = ref([
  {
    name: '用户服务',
    description: 'erp-user-service',
    status: 'running'
  },
  {
    name: '商品服务',
    description: 'erp-product-service',
    status: 'running'
  },
  {
    name: '订单服务',
    description: 'erp-order-service',
    status: 'running'
  },
  {
    name: '库存服务',
    description: 'erp-inventory-service',
    status: 'running'
  }
])

// 方法
const refreshData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新系统状态
    systemStats.value = {
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      diskUsage: Math.floor(Math.random() * 100),
      networkLatency: Math.floor(Math.random() * 200)
    }
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
.system-monitor {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
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

.monitor-stats {
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

.card-body {
  padding: 20px;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.service-item:hover {
  background: var(--el-fill-color-light);
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.service-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.service-status {
  display: flex;
  align-items: center;
}
</style>