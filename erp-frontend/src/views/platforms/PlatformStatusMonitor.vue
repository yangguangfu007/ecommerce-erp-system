<template>
  <div class="platform-status-monitor">
    <!-- 平台健康度仪表盘 -->
    <div class="dashboard-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon success">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ connectedPlatformsCount }}</div>
                <div class="stat-label">已连接平台</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon danger">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ errorPlatformsCount }}</div>
                <div class="stat-label">连接异常</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warning">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ syncingPlatformsCount }}</div>
                <div class="stat-label">同步中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon info">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ platformHealthPercentage }}%</div>
                <div class="stat-label">健康度</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 平台状态列表 -->
    <el-card class="platform-list-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">平台连接状态</span>
          <div class="card-actions">
            <el-button 
              type="primary" 
              :icon="Refresh" 
              :loading="platformsLoading"
              @click="handleRefreshAll"
            >
              刷新状态
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="platform-status-list">
        <el-row :gutter="20">
          <el-col 
            v-for="platform in platforms" 
            :key="platform.id"
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6"
          >
            <div class="platform-status-card">
              <div class="platform-header">
                <div class="platform-info">
                  <div class="platform-name">{{ platform.name }}</div>
                  <div class="platform-type">{{ getPlatformTypeName(platform.type) }}</div>
                </div>
                <div class="platform-status">
                  <el-tag 
                    :type="getStatusTagType(platform.status)"
                    :icon="getStatusIcon(platform.status)"
                    size="small"
                  >
                    {{ getStatusText(platform.status) }}
                  </el-tag>
                </div>
              </div>
              
              <div class="platform-details">
                <div class="detail-item">
                  <span class="detail-label">最后同步:</span>
                  <span class="detail-value">
                    {{ platform.lastSyncTime ? formatDateTime(platform.lastSyncTime) : '从未同步' }}
                  </span>
                </div>
                
                <div v-if="platform.errorMessage" class="detail-item error">
                  <span class="detail-label">错误信息:</span>
                  <span class="detail-value">{{ platform.errorMessage }}</span>
                </div>
              </div>
              
              <div class="platform-actions">
                <el-button 
                  size="small" 
                  :icon="Connection"
                  :loading="testingConnections[platform.id]"
                  @click="handleTestConnection(platform.id)"
                >
                  测试连接
                </el-button>
                
                <el-button 
                  size="small" 
                  type="primary"
                  :icon="Refresh"
                  :loading="refreshingStatus[platform.id]"
                  @click="handleRefreshStatus(platform.id)"
                >
                  刷新状态
                </el-button>
                
                <el-button 
                  v-if="platform.status === 'CONNECTED'"
                  size="small" 
                  type="success"
                  :icon="Download"
                  :loading="syncingPlatforms[platform.id]"
                  @click="handleStartSync(platform.id)"
                >
                  同步数据
                </el-button>
              </div>
              
              <!-- 状态异常告警 -->
              <div v-if="platform.status === 'ERROR'" class="platform-alert">
                <el-alert
                  title="连接异常"
                  type="error"
                  :description="getErrorSuggestion(platform)"
                  show-icon
                  :closable="false"
                />
              </div>
              
              <!-- 同步进度 -->
              <div v-if="getSyncTask(platform.id)" class="sync-progress">
                <div class="progress-header">
                  <span>数据同步中</span>
                  <el-button 
                    size="small" 
                    type="danger" 
                    text
                    @click="handleStopSync(getSyncTask(platform.id)!.taskId)"
                  >
                    停止
                  </el-button>
                </div>
                <el-progress 
                  :percentage="getSyncTask(platform.id)!.progress"
                  :status="getSyncTask(platform.id)!.status === 'FAILED' ? 'exception' : undefined"
                />
                <div class="progress-info">
                  <span>{{ getSyncTask(platform.id)!.processedRecords }}/{{ getSyncTask(platform.id)!.totalRecords }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 空状态 -->
        <el-empty v-if="platforms.length === 0 && !platformsLoading" description="暂无平台数据" />
        
        <!-- 加载状态 -->
        <div v-if="platformsLoading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
      </div>
    </el-card>

    <!-- 活跃同步任务 -->
    <el-card v-if="activeSyncTasks.length > 0" class="sync-tasks-card">
      <template #header>
        <span class="card-title">活跃同步任务</span>
      </template>
      
      <div class="sync-tasks-list">
        <div 
          v-for="task in activeSyncTasks" 
          :key="task.taskId"
          class="sync-task-item"
        >
          <div class="task-info">
            <div class="task-title">
              {{ getPlatformName(task.taskId) }} - 数据同步
            </div>
            <div class="task-status">
              <el-tag :type="getSyncStatusTagType(task.status)" size="small">
                {{ getSyncStatusText(task.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="task-progress">
            <el-progress 
              :percentage="task.progress"
              :status="task.status === 'FAILED' ? 'exception' : undefined"
            />
            <div class="progress-details">
              <span>{{ task.processedRecords }}/{{ task.totalRecords }} 条记录</span>
              <span>开始时间: {{ formatDateTime(task.startTime) }}</span>
            </div>
          </div>
          
          <div class="task-actions">
            <el-button 
              size="small" 
              type="danger"
              @click="handleStopSync(task.taskId)"
            >
              停止任务
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Connection, 
  Warning, 
  Loading, 
  DataAnalysis, 
  Refresh, 
  Download 
} from '@element-plus/icons-vue'
import { usePlatformStore } from '@/stores/platform'
import type { Platform, PlatformType, PlatformStatus, SyncDataResult } from '@/api/modules/platform'

// 组件名称
defineOptions({
  name: 'PlatformStatusMonitor'
})

// 使用平台状态管理
const platformStore = usePlatformStore()

// 响应式状态
const testingConnections = ref<Record<number, boolean>>({})
const refreshingStatus = ref<Record<number, boolean>>({})
const syncingPlatforms = ref<Record<number, boolean>>({})

// 定时刷新定时器
let refreshTimer: NodeJS.Timeout | null = null

// 计算属性
const platforms = computed(() => platformStore.platforms)
const platformsLoading = computed(() => platformStore.platformsLoading)
const activeSyncTasks = computed(() => platformStore.activeSyncTasks)
const connectedPlatformsCount = computed(() => platformStore.connectedPlatformsCount)
const errorPlatformsCount = computed(() => platformStore.errorPlatformsCount)
const syncingPlatformsCount = computed(() => platformStore.syncingPlatformsCount)
const platformHealthPercentage = computed(() => platformStore.platformHealthPercentage)

// 生命周期
onMounted(async () => {
  await loadData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// 方法定义
/**
 * 加载数据
 */
const loadData = async () => {
  try {
    await Promise.all([
      platformStore.fetchPlatforms(),
      platformStore.fetchPlatformStats(),
      platformStore.fetchActiveSyncTasks()
    ])
  } catch (error) {
    ElMessage.error('加载平台状态数据失败')
  }
}

/**
 * 开始自动刷新
 */
const startAutoRefresh = () => {
  // 每30秒自动刷新一次状态
  refreshTimer = setInterval(() => {
    platformStore.fetchActiveSyncTasks()
  }, 30000)
}

/**
 * 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/**
 * 刷新所有平台状态
 */
const handleRefreshAll = async () => {
  try {
    await platformStore.refreshPlatformStatus()
    ElMessage.success('平台状态刷新成功')
  } catch (error) {
    ElMessage.error('刷新平台状态失败')
  }
}

/**
 * 刷新单个平台状态
 */
const handleRefreshStatus = async (platformId: number) => {
  try {
    refreshingStatus.value[platformId] = true
    await platformStore.refreshPlatformStatus(platformId)
    ElMessage.success('平台状态刷新成功')
  } catch (error) {
    ElMessage.error('刷新平台状态失败')
  } finally {
    refreshingStatus.value[platformId] = false
  }
}

/**
 * 测试平台连接
 */
const handleTestConnection = async (platformId: number) => {
  try {
    testingConnections.value[platformId] = true
    const result = await platformStore.testPlatformConnection(platformId)
    
    if (result.success) {
      ElMessage.success(`连接测试成功 (响应时间: ${result.responseTime}ms)`)
    } else {
      ElMessage.error(`连接测试失败: ${result.message}`)
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  } finally {
    testingConnections.value[platformId] = false
  }
}

/**
 * 启动数据同步
 */
const handleStartSync = async (platformId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要启动数据同步吗？这可能需要一些时间。',
      '确认同步',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    syncingPlatforms.value[platformId] = true
    await platformStore.startDataSync(platformId)
    ElMessage.success('数据同步已启动')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('启动数据同步失败')
    }
  } finally {
    syncingPlatforms.value[platformId] = false
  }
}

/**
 * 停止同步任务
 */
const handleStopSync = async (taskId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要停止同步任务吗？',
      '确认停止',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await platformStore.stopSyncTask(taskId)
    ElMessage.success('同步任务已停止')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('停止同步任务失败')
    }
  }
}

/**
 * 获取平台类型名称
 */
const getPlatformTypeName = (type: PlatformType): string => {
  const typeMap: Record<PlatformType, string> = {
    WALMART: '沃尔玛',
    AMAZON: '亚马逊',
    EBAY: 'eBay',
    SHOPIFY: 'Shopify',
    CUSTOM: '自定义'
  }
  return typeMap[type] || type
}

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: PlatformStatus): string => {
  const typeMap: Record<PlatformStatus, string> = {
    CONNECTED: 'success',
    DISCONNECTED: 'info',
    ERROR: 'danger',
    SYNCING: 'warning'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取状态图标
 */
const getStatusIcon = (status: PlatformStatus) => {
  const iconMap: Record<PlatformStatus, any> = {
    CONNECTED: Connection,
    DISCONNECTED: Warning,
    ERROR: Warning,
    SYNCING: Loading
  }
  return iconMap[status] || Connection
}

/**
 * 获取状态文本
 */
const getStatusText = (status: PlatformStatus): string => {
  const textMap: Record<PlatformStatus, string> = {
    CONNECTED: '已连接',
    DISCONNECTED: '已断开',
    ERROR: '连接异常',
    SYNCING: '同步中'
  }
  return textMap[status] || '未知'
}

/**
 * 获取同步状态标签类型
 */
const getSyncStatusTagType = (status: string): string => {
  const typeMap: Record<string, string> = {
    PENDING: 'info',
    RUNNING: 'warning',
    COMPLETED: 'success',
    FAILED: 'danger'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取同步状态文本
 */
const getSyncStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    PENDING: '等待中',
    RUNNING: '运行中',
    COMPLETED: '已完成',
    FAILED: '失败'
  }
  return textMap[status] || '未知'
}

/**
 * 获取错误建议
 */
const getErrorSuggestion = (platform: Platform): string => {
  if (platform.errorMessage?.includes('authentication')) {
    return '请检查API密钥和认证信息是否正确'
  }
  if (platform.errorMessage?.includes('network')) {
    return '请检查网络连接和防火墙设置'
  }
  if (platform.errorMessage?.includes('timeout')) {
    return '请求超时，请稍后重试或检查平台服务状态'
  }
  return '请检查平台配置信息或联系技术支持'
}

/**
 * 获取同步任务
 */
const getSyncTask = (platformId: number): SyncDataResult | undefined => {
  return activeSyncTasks.value.find(task => 
    task.taskId.includes(platformId.toString())
  )
}

/**
 * 获取平台名称
 */
const getPlatformName = (taskId: string): string => {
  // 从任务ID中提取平台ID，然后查找平台名称
  const platformId = parseInt(taskId.split('-')[0] || '0')
  const platform = platforms.value.find(p => p.id === platformId)
  return platform?.name || '未知平台'
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.platform-status-monitor {
  padding: 20px;
}

.dashboard-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.stat-icon.success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.stat-icon.danger {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.stat-icon.warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.stat-icon.info {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.platform-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.platform-status-list {
  min-height: 200px;
}

.platform-status-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.platform-status-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.platform-info {
  flex: 1;
}

.platform-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.platform-type {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.platform-details {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.detail-item.error {
  color: var(--el-color-danger);
}

.detail-label {
  color: var(--el-text-color-regular);
}

.detail-value {
  font-weight: 500;
}

.platform-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.platform-alert {
  margin-top: 12px;
}

.sync-progress {
  margin-top: 12px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
}

.progress-info {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-align: center;
}

.loading-container {
  padding: 20px;
}

.sync-tasks-card {
  margin-bottom: 20px;
}

.sync-task-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  margin-bottom: 12px;
}

.task-info {
  width: 200px;
  margin-right: 16px;
}

.task-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.task-progress {
  flex: 1;
  margin-right: 16px;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.task-actions {
  width: 100px;
}

@media (max-width: 768px) {
  .platform-status-monitor {
    padding: 12px;
  }
  
  .platform-actions {
    justify-content: center;
  }
  
  .sync-task-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-info,
  .task-progress,
  .task-actions {
    width: 100%;
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .task-actions {
    margin-bottom: 0;
  }
}
</style>