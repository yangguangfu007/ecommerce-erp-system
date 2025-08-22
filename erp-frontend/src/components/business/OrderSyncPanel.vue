<template>
  <div class="order-sync-panel">
    <!-- 同步操作面板 -->
    <div class="sync-operation-panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <i class="fas fa-sync-alt"></i>
          订单同步
        </h3>
        <p class="panel-description">从电商平台同步最新的订单数据</p>
      </div>

      <div class="panel-body">
        <!-- 同步配置表单 -->
        <el-form
          ref="syncFormRef"
          :model="syncForm"
          :rules="syncFormRules"
          label-width="100px"
          class="sync-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="同步类型" prop="syncType">
                <el-select
                  v-model="syncForm.syncType"
                  placeholder="请选择同步类型"
                  class="form-select"
                >
                  <el-option label="增量同步" value="incremental" />
                  <el-option label="全量同步" value="full" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="店铺" prop="storeId">
                <el-select
                  v-model="syncForm.storeId"
                  placeholder="全部店铺"
                  clearable
                  class="form-select"
                >
                  <el-option
                    v-for="store in stores"
                    :key="store.id"
                    :label="store.name"
                    :value="store.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始日期">
                <el-date-picker
                  v-model="syncForm.startDate"
                  type="date"
                  placeholder="选择开始日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="form-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束日期">
                <el-date-picker
                  v-model="syncForm.endDate"
                  type="date"
                  placeholder="选择结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="form-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 同步操作按钮 -->
        <div class="sync-actions">
          <el-button
            type="primary"
            :loading="syncLoading"
            :disabled="hasSyncTaskRunning"
            @click="handleStartSync"
          >
            <i class="fas fa-play"></i>
            {{ syncLoading ? '同步中...' : '开始同步' }}
          </el-button>
          <el-button
            v-if="activeSyncTask && activeSyncTask.status === 'RUNNING'"
            type="danger"
            @click="handleCancelSync"
          >
            <i class="fas fa-stop"></i>
            取消同步
          </el-button>
          <el-button
            @click="handleRefreshStatus"
            :disabled="syncLoading"
          >
            <i class="fas fa-refresh"></i>
            刷新状态
          </el-button>
        </div>
      </div>
    </div>    <!
-- 同步进度显示 -->
    <div v-if="activeSyncTask" class="sync-progress-panel">
      <div class="progress-header">
        <h4 class="progress-title">
          <i class="fas fa-tasks"></i>
          同步进度
        </h4>
        <span :class="`status-badge status-${activeSyncTask.status.toLowerCase()}`">
          {{ getSyncStatusText(activeSyncTask.status) }}
        </span>
      </div>

      <div class="progress-body">
        <!-- 进度条 -->
        <div class="progress-bar-container">
          <div class="progress-info">
            <span class="progress-text">
              {{ getProgressText(activeSyncTask) }}
            </span>
            <span class="progress-percentage">
              {{ getProgressPercentage(activeSyncTask) }}%
            </span>
          </div>
          <el-progress
            :percentage="getProgressPercentage(activeSyncTask)"
            :status="getProgressStatus(activeSyncTask.status)"
            :stroke-width="8"
            class="progress-bar"
          />
        </div>

        <!-- 统计信息 -->
        <div class="sync-stats">
          <div class="stat-item">
            <div class="stat-label">总数</div>
            <div class="stat-value">{{ activeSyncTask.totalCount }}</div>
          </div>
          <div class="stat-item success">
            <div class="stat-label">成功</div>
            <div class="stat-value">{{ activeSyncTask.successCount }}</div>
          </div>
          <div class="stat-item error">
            <div class="stat-label">失败</div>
            <div class="stat-value">{{ activeSyncTask.failedCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">开始时间</div>
            <div class="stat-value">{{ formatDateTime(activeSyncTask.startTime) }}</div>
          </div>
          <div v-if="activeSyncTask.endTime" class="stat-item">
            <div class="stat-label">结束时间</div>
            <div class="stat-value">{{ formatDateTime(activeSyncTask.endTime) }}</div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="activeSyncTask.errors && activeSyncTask.errors.length > 0" class="sync-errors">
          <div class="error-header">
            <h5 class="error-title">
              <i class="fas fa-exclamation-triangle"></i>
              同步错误 ({{ activeSyncTask.errors.length }})
            </h5>
            <el-button
              size="small"
              type="primary"
              @click="handleRetryFailedOrders"
              :disabled="activeSyncTask.status === 'RUNNING'"
            >
              <i class="fas fa-redo"></i>
              重试失败项
            </el-button>
          </div>
          <div class="error-list">
            <div
              v-for="(error, index) in activeSyncTask.errors.slice(0, showAllErrors ? undefined : 5)"
              :key="index"
              class="error-item"
            >
              <div class="error-order-id">{{ error.platformOrderId }}</div>
              <div class="error-message">{{ error.error }}</div>
            </div>
            <div v-if="activeSyncTask.errors.length > 5" class="error-toggle">
              <el-button
                type="text"
                @click="showAllErrors = !showAllErrors"
              >
                {{ showAllErrors ? '收起' : `查看全部 ${activeSyncTask.errors.length} 个错误` }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 同步历史记录 -->
    <div class="sync-history-panel">
      <div class="history-header">
        <h4 class="history-title">
          <i class="fas fa-history"></i>
          同步历史
        </h4>
        <div class="history-actions">
          <el-button
            size="small"
            @click="handleRefreshHistory"
            :loading="historyLoading"
          >
            <i class="fas fa-refresh"></i>
            刷新
          </el-button>
          <el-button
            size="small"
            @click="handleClearHistory"
          >
            <i class="fas fa-trash"></i>
            清空历史
          </el-button>
        </div>
      </div>

      <div class="history-body">
        <el-table
          :data="syncHistory"
          :loading="historyLoading"
          class="history-table"
          empty-text="暂无同步历史"
        >
          <el-table-column prop="taskId" label="任务ID" width="120">
            <template #default="{ row }">
              <span class="task-id">{{ row.taskId.substring(0, 8) }}...</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span :class="`status-badge status-${row.status.toLowerCase()}`">
                {{ getSyncStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalCount" label="总数" width="80" />
          <el-table-column prop="successCount" label="成功" width="80">
            <template #default="{ row }">
              <span class="success-count">{{ row.successCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="failedCount" label="失败" width="80">
            <template #default="{ row }">
              <span class="error-count">{{ row.failedCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                size="small"
                type="text"
                @click="handleViewSyncLog(row)"
              >
                <i class="fas fa-eye"></i>
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div v-if="syncHistory.length > 0" class="history-pagination">
          <el-pagination
            v-model:current-page="historyQuery.page"
            v-model:page-size="historyQuery.size"
            :total="historyTotal"
            :page-sizes="[10, 20, 50]"
            layout="prev, pager, next, sizes"
            @current-change="handleHistoryPageChange"
            @size-change="handleHistorySizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 同步日志查看对话框 -->
    <el-dialog
      v-model="logDialog.visible"
      title="同步日志详情"
      width="800px"
      class="log-dialog"
      :close-on-click-modal="false"
    >
      <div v-if="logDialog.task" class="log-content">
        <!-- 任务基本信息 -->
        <div class="log-task-info">
          <div class="task-info-grid">
            <div class="info-item">
              <label>任务ID:</label>
              <span>{{ logDialog.task.taskId }}</span>
            </div>
            <div class="info-item">
              <label>状态:</label>
              <span :class="`status-badge status-${logDialog.task.status.toLowerCase()}`">
                {{ getSyncStatusText(logDialog.task.status) }}
              </span>
            </div>
            <div class="info-item">
              <label>总数:</label>
              <span>{{ logDialog.task.totalCount }}</span>
            </div>
            <div class="info-item">
              <label>成功:</label>
              <span class="success-count">{{ logDialog.task.successCount }}</span>
            </div>
            <div class="info-item">
              <label>失败:</label>
              <span class="error-count">{{ logDialog.task.failedCount }}</span>
            </div>
            <div class="info-item">
              <label>开始时间:</label>
              <span>{{ formatDateTime(logDialog.task.startTime) }}</span>
            </div>
            <div v-if="logDialog.task.endTime" class="info-item">
              <label>结束时间:</label>
              <span>{{ formatDateTime(logDialog.task.endTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 错误详情 -->
        <div v-if="logDialog.task.errors && logDialog.task.errors.length > 0" class="log-errors">
          <h5 class="log-section-title">
            <i class="fas fa-exclamation-triangle"></i>
            错误详情
          </h5>
          <div class="log-error-list">
            <div
              v-for="(error, index) in logDialog.task.errors"
              :key="index"
              class="log-error-item"
            >
              <div class="error-index">{{ index + 1 }}</div>
              <div class="error-details">
                <div class="error-order">订单号: {{ error.platformOrderId }}</div>
                <div class="error-msg">错误: {{ error.error }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="log-dialog-footer">
          <el-button @click="logDialog.visible = false">关闭</el-button>
          <el-button
            v-if="logDialog.task && logDialog.task.failedCount > 0"
            type="primary"
            @click="handleRetryFromLog"
          >
            <i class="fas fa-redo"></i>
            重试失败项
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api/modules/order'
import type { 
  OrderSyncParams, 
  OrderSyncResult, 
  Store,
  PageRequest 
} from '@/types'

// Props
interface Props {
  stores?: Store[]
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  stores: () => [],
  autoRefresh: true,
  refreshInterval: 5000 // 5秒刷新间隔
})

// Emits
const emit = defineEmits<{
  syncStarted: [task: OrderSyncResult]
  syncCompleted: [task: OrderSyncResult]
  syncFailed: [task: OrderSyncResult, error: any]
  syncCancelled: [taskId: string]
}>()

// 响应式数据
const syncFormRef = ref()
const syncLoading = ref(false)
const historyLoading = ref(false)
const showAllErrors = ref(false)

// 同步表单
const syncForm = reactive<OrderSyncParams>({
  syncType: 'incremental',
  storeId: undefined,
  startDate: '',
  endDate: ''
})

// 同步表单验证规则
const syncFormRules = {
  syncType: [
    { required: true, message: '请选择同步类型', trigger: 'change' }
  ]
}

// 活跃同步任务
const activeSyncTask = ref<OrderSyncResult | null>(null)

// 同步历史
const syncHistory = ref<OrderSyncResult[]>([])
const historyTotal = ref(0)
const historyQuery = reactive<PageRequest>({
  page: 1,
  size: 10
})

// 日志对话框
const logDialog = reactive({
  visible: false,
  task: null as OrderSyncResult | null
})

// 自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null

// 计算属性
const stores = computed(() => props.stores)
const hasSyncTaskRunning = computed(() => {
  return activeSyncTask.value?.status === 'RUNNING'
})

// 方法

/**
 * 获取同步状态文本
 */
const getSyncStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: '等待中',
    RUNNING: '同步中',
    COMPLETED: '已完成',
    FAILED: '失败'
  }
  return statusMap[status] || status
}

/**
 * 获取进度文本
 */
const getProgressText = (task: OrderSyncResult): string => {
  if (task.status === 'RUNNING') {
    return `正在同步订单数据... ${task.successCount + task.failedCount}/${task.totalCount}`
  } else if (task.status === 'COMPLETED') {
    return `同步完成，成功 ${task.successCount} 个，失败 ${task.failedCount} 个`
  } else if (task.status === 'FAILED') {
    return '同步失败'
  }
  return '准备同步...'
}

/**
 * 获取进度百分比
 */
const getProgressPercentage = (task: OrderSyncResult): number => {
  if (task.totalCount === 0) return 0
  return Math.round(((task.successCount + task.failedCount) / task.totalCount) * 100)
}

/**
 * 获取进度条状态
 */
const getProgressStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    RUNNING: '',
    COMPLETED: 'success',
    FAILED: 'exception'
  }
  return statusMap[status] || ''
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 开始同步
 */
const handleStartSync = async () => {
  if (!syncFormRef.value) return
  
  try {
    await syncFormRef.value.validate()
    
    syncLoading.value = true
    
    const response = await orderApi.syncOrders(syncForm)
    activeSyncTask.value = response.data
    
    ElMessage.success('同步任务已启动')
    emit('syncStarted', response.data)
    
    // 开始自动刷新状态
    startAutoRefresh()
    
  } catch (error) {
    console.error('启动同步失败:', error)
    ElMessage.error('启动同步失败')
    emit('syncFailed', activeSyncTask.value!, error)
  } finally {
    syncLoading.value = false
  }
}

/**
 * 取消同步
 */
const handleCancelSync = async () => {
  if (!activeSyncTask.value) return
  
  try {
    await ElMessageBox.confirm(
      '确定要取消当前同步任务吗？',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await orderApi.cancelSync(activeSyncTask.value.taskId)
    
    ElMessage.success('同步任务已取消')
    emit('syncCancelled', activeSyncTask.value.taskId)
    
    // 停止自动刷新
    stopAutoRefresh()
    
    // 刷新状态
    await handleRefreshStatus()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消同步失败:', error)
      ElMessage.error('取消同步失败')
    }
  }
}

/**
 * 刷新同步状态
 */
const handleRefreshStatus = async () => {
  if (!activeSyncTask.value) return
  
  try {
    const response = await orderApi.getSyncStatus(activeSyncTask.value.taskId)
    activeSyncTask.value = response.data
    
    // 如果任务已完成，停止自动刷新并触发事件
    if (response.data.status === 'COMPLETED') {
      stopAutoRefresh()
      emit('syncCompleted', response.data)
      ElMessage.success('订单同步完成')
    } else if (response.data.status === 'FAILED') {
      stopAutoRefresh()
      emit('syncFailed', response.data, new Error('同步任务失败'))
      ElMessage.error('订单同步失败')
    }
    
  } catch (error) {
    console.error('刷新同步状态失败:', error)
  }
}

/**
 * 重试失败的订单
 */
const handleRetryFailedOrders = async () => {
  if (!activeSyncTask.value) return
  
  try {
    const response = await orderApi.retrySyncFailedOrders(activeSyncTask.value.taskId)
    activeSyncTask.value = response.data
    
    ElMessage.success('重试任务已启动')
    
    // 重新开始自动刷新
    startAutoRefresh()
    
  } catch (error) {
    console.error('重试失败订单失败:', error)
    ElMessage.error('重试失败订单失败')
  }
}

/**
 * 刷新同步历史
 */
const handleRefreshHistory = async () => {
  try {
    historyLoading.value = true
    
    const response = await orderApi.getSyncHistory(historyQuery)
    syncHistory.value = response.data.list
    historyTotal.value = response.data.total
    
  } catch (error) {
    console.error('获取同步历史失败:', error)
    ElMessage.error('获取同步历史失败')
  } finally {
    historyLoading.value = false
  }
}

/**
 * 清空同步历史
 */
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有同步历史记录吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用清空历史的API，暂时只清空本地数据
    syncHistory.value = []
    historyTotal.value = 0
    
    ElMessage.success('同步历史已清空')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空同步历史失败:', error)
      ElMessage.error('清空同步历史失败')
    }
  }
}

/**
 * 历史分页变化
 */
const handleHistoryPageChange = (page: number) => {
  historyQuery.page = page
  handleRefreshHistory()
}

/**
 * 历史页面大小变化
 */
const handleHistorySizeChange = (size: number) => {
  historyQuery.size = size
  historyQuery.page = 1
  handleRefreshHistory()
}

/**
 * 查看同步日志
 */
const handleViewSyncLog = (task: OrderSyncResult) => {
  logDialog.task = task
  logDialog.visible = true
}

/**
 * 从日志对话框重试
 */
const handleRetryFromLog = async () => {
  if (!logDialog.task) return
  
  try {
    const response = await orderApi.retrySyncFailedOrders(logDialog.task.taskId)
    
    // 更新活跃任务
    activeSyncTask.value = response.data
    
    // 关闭对话框
    logDialog.visible = false
    
    ElMessage.success('重试任务已启动')
    
    // 开始自动刷新
    startAutoRefresh()
    
  } catch (error) {
    console.error('重试失败订单失败:', error)
    ElMessage.error('重试失败订单失败')
  }
}

/**
 * 开始自动刷新
 */
const startAutoRefresh = () => {
  if (!props.autoRefresh) return
  
  stopAutoRefresh() // 先停止之前的定时器
  
  refreshTimer = setInterval(() => {
    if (activeSyncTask.value && activeSyncTask.value.status === 'RUNNING') {
      handleRefreshStatus()
    } else {
      stopAutoRefresh()
    }
  }, props.refreshInterval)
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

// 生命周期
onMounted(() => {
  handleRefreshHistory()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// 导出方法供父组件使用
defineExpose({
  startSync: handleStartSync,
  cancelSync: handleCancelSync,
  refreshStatus: handleRefreshStatus,
  refreshHistory: handleRefreshHistory,
  activeSyncTask: computed(() => activeSyncTask.value),
  hasSyncTaskRunning
})
</script>

<style scoped>
.order-sync-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 同步操作面板样式 */
.sync-operation-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
}

.panel-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title i {
  color: var(--el-color-primary);
}

.panel-description {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.panel-body {
  padding: 20px;
}

.sync-form {
  margin-bottom: 20px;
}

.sync-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 同步进度面板样式 */
.sync-progress-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color-page);
}

.progress-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-body {
  padding: 20px;
}

.progress-bar-container {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.progress-bar {
  margin-bottom: 0;
}

/* 统计信息样式 */
.sync-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
}

.stat-item.success {
  background: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.3);
}

.stat-item.error {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.success-count {
  color: var(--el-color-success);
}

.error-count {
  color: var(--el-color-danger);
}

/* 错误信息样式 */
.sync-errors {
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 6px;
  background: rgba(245, 108, 108, 0.05);
}

.error-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-color-danger-light-7);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(245, 108, 108, 0.1);
}

.error-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-danger);
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-list {
  padding: 16px;
}

.error-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.error-item:last-child {
  border-bottom: none;
}

.error-order-id {
  flex: 0 0 120px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.error-message {
  flex: 1;
  font-size: 14px;
  color: var(--el-color-danger);
}

.error-toggle {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 同步历史面板样式 */
.sync-history-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color-page);
}

.history-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.history-body {
  padding: 0;
}

.history-table {
  width: 100%;
}

.task-id {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.history-pagination {
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: center;
}

/* 状态徽章样式 */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: white;
}

.status-badge.status-pending {
  background-color: #e6a23c;
}

.status-badge.status-running {
  background-color: #409eff;
}

.status-badge.status-completed {
  background-color: #67c23a;
}

.status-badge.status-failed {
  background-color: #f56c6c;
}

/* 日志对话框样式 */
.log-dialog {
  border-radius: 8px;
}

.log-content {
  max-height: 500px;
  overflow-y: auto;
}

.log-task-info {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.task-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item label {
  flex: 0 0 80px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.info-item span {
  color: var(--el-text-color-primary);
}

.log-errors {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.log-section-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
}

.log-error-list {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.log-error-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.log-error-item:last-child {
  border-bottom: none;
}

.error-index {
  flex: 0 0 30px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-danger);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.error-details {
  flex: 1;
}

.error-order {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.error-msg {
  font-size: 14px;
  color: var(--el-color-danger);
}

.log-dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 表单样式 */
.form-select,
.form-input {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sync-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .task-info-grid {
    grid-template-columns: 1fr;
  }
  
  .error-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .error-order-id {
    flex: none;
  }
  
  .sync-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .history-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .history-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .sync-stats {
    grid-template-columns: 1fr;
  }
  
  .panel-body,
  .progress-body {
    padding: 16px;
  }
  
  .log-error-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .error-index {
    align-self: flex-start;
  }
}

/* 滚动条样式 */
.log-content::-webkit-scrollbar,
.log-error-list::-webkit-scrollbar {
  width: 6px;
}

.log-content::-webkit-scrollbar-track,
.log-error-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb,
.log-error-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb:hover,
.log-error-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>