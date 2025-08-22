<template>
  <div class="service-status-table">
    <el-table 
      :data="services" 
      stripe
      :loading="loading"
      @sort-change="handleSortChange"
    >
      <el-table-column 
        prop="name" 
        label="服务名称" 
        min-width="150"
        sortable="custom"
      >
        <template #default="{ row }">
          <div class="service-name">
            <el-icon class="service-icon">
              <component :is="getServiceIcon(row.name)" />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="status" 
        label="状态" 
        width="100"
        sortable="custom"
      >
        <template #default="{ row }">
          <el-tag 
            :type="getStatusType(row.status)"
            :class="getStatusClass(row.status)"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="responseTime" 
        label="响应时间" 
        width="120"
        sortable="custom"
      >
        <template #default="{ row }">
          <span :class="getResponseTimeClass(row.responseTime)">
            {{ row.responseTime }}ms
          </span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="uptime" 
        label="运行时间" 
        width="120"
        sortable="custom"
      >
        <template #default="{ row }">
          {{ formatUptime(row.uptime) }}
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="lastCheck" 
        label="最后检查" 
        width="160"
        sortable="custom"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.lastCheck) }}
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="url" 
        label="服务地址" 
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-link 
            v-if="row.url" 
            :href="row.url" 
            target="_blank"
            type="primary"
          >
            {{ row.url }}
          </el-link>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        label="操作" 
        width="180"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button 
              size="small" 
              type="primary"
              :icon="Connection"
              @click="$emit('test-connection', row.id)"
              :loading="testingServices.includes(row.id)"
            >
              测试
            </el-button>
            <el-button 
              size="small" 
              type="warning"
              :icon="Refresh"
              @click="handleRestart(row)"
              :loading="restartingServices.includes(row.id)"
              :disabled="row.status === 'offline'"
            >
              重启
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { 
  Connection, 
  Refresh,
  Monitor,
  DataBase,
  Coin,
  Message,
  CloudUpload,
  Bell,
  Setting
} from '@element-plus/icons-vue'
import type { ServiceStatus } from '@/types/monitor'
import { formatDateTime } from '@/utils/date'

interface Props {
  services: ServiceStatus[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'test-connection': [serviceId: string]
  'restart-service': [serviceId: string]
  'sort-change': [sort: { prop: string; order: string }]
}>()

// 响应式数据
const testingServices = ref<string[]>([])
const restartingServices = ref<string[]>([])

// 服务图标映射
const serviceIconMap: Record<string, any> = {
  'API 服务': Monitor,
  '数据库': DataBase,
  'Redis 缓存': Coin,
  '消息队列': Message,
  '文件服务': CloudUpload,
  '通知服务': Bell,
  '配置中心': Setting
}

// 方法
const getServiceIcon = (serviceName: string) => {
  return serviceIconMap[serviceName] || Monitor
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'online': return 'success'
    case 'offline': return 'danger'
    case 'warning': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

const getStatusClass = (status: string) => {
  return `status-${status}`
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'warning': return '警告'
    case 'error': return '错误'
    default: return '未知'
  }
}

const getResponseTimeClass = (responseTime: number) => {
  if (responseTime > 1000) return 'response-time-critical'
  if (responseTime > 500) return 'response-time-warning'
  return 'response-time-normal'
}

const formatUptime = (uptime: number) => {
  const days = Math.floor(uptime / (24 * 60 * 60))
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((uptime % (60 * 60)) / 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

const handleRestart = async (service: ServiceStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要重启服务 "${service.name}" 吗？这可能会导致短暂的服务中断。`,
      '确认重启',
      {
        type: 'warning',
        confirmButtonText: '确认重启',
        cancelButtonText: '取消'
      }
    )
    
    restartingServices.value.push(service.id)
    emit('restart-service', service.id)
  } catch (error) {
    // 用户取消操作
  } finally {
    // 移除加载状态（实际应该在父组件处理完成后移除）
    setTimeout(() => {
      const index = restartingServices.value.indexOf(service.id)
      if (index > -1) {
        restartingServices.value.splice(index, 1)
      }
    }, 3000)
  }
}

const handleSortChange = (sort: { prop: string; order: string }) => {
  emit('sort-change', sort)
}
</script>

<style scoped>
.service-status-table {
  width: 100%;
}

.service-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  color: var(--el-color-primary);
}

.status-online {
  animation: pulse-success 2s infinite;
}

.status-warning {
  animation: pulse-warning 2s infinite;
}

.status-error,
.status-offline {
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-success {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.response-time-normal {
  color: var(--el-color-success);
}

.response-time-warning {
  color: var(--el-color-warning);
}

.response-time-critical {
  color: var(--el-color-danger);
}

.text-muted {
  color: var(--el-text-color-placeholder);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>