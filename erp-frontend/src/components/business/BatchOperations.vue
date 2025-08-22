<!--
  批量操作组件
  提供批量选择、操作确认和进度显示功能
-->
<template>
  <div class="batch-operations">
    <!-- 批量操作栏 -->
    <div v-if="selectedCount > 0" class="batch-actions">
      <div class="batch-info">
        已选择 <strong>{{ selectedCount }}</strong> {{ itemName || '项' }}
      </div>
      <div class="batch-buttons">
        <slot name="actions" :selectedCount="selectedCount" :selectedItems="selectedItems">
          <!-- 默认批量操作按钮 -->
          <el-button 
            size="small" 
            @click="handleBatchOperation('confirm')"
            :disabled="isOperating"
          >
            批量确认
          </el-button>
          <el-button 
            size="small" 
            @click="handleBatchOperation('cancel')"
            :disabled="isOperating"
          >
            批量取消
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleBatchOperation('delete')"
            :disabled="isOperating"
          >
            批量删除
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 批量操作确认对话框 -->
    <el-dialog
      v-model="confirmDialog.visible"
      :title="confirmDialog.title"
      width="500px"
      class="batch-confirm-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="confirm-content">
        <div class="confirm-icon">
          <i :class="confirmDialog.iconClass"></i>
        </div>
        <div class="confirm-message">
          <p>{{ confirmDialog.message }}</p>
          <div v-if="confirmDialog.details" class="confirm-details">
            <p v-for="detail in confirmDialog.details" :key="detail">{{ detail }}</p>
          </div>
        </div>
      </div>
      
      <!-- 额外的表单字段 -->
      <div v-if="confirmDialog.showForm" class="confirm-form">
        <el-form ref="confirmFormRef" :model="confirmForm" :rules="confirmFormRules">
          <el-form-item 
            v-if="confirmDialog.operation === 'cancel'" 
            label="取消原因" 
            prop="reason"
          >
            <el-input
              v-model="confirmForm.reason"
              placeholder="请输入取消原因"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item 
            v-if="confirmDialog.operation === 'ship'" 
            label="物流单号" 
            prop="trackingNumber"
          >
            <el-input
              v-model="confirmForm.trackingNumber"
              placeholder="请输入物流单号"
              maxlength="50"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="confirmForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（可选）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmDialog.visible = false" :disabled="isOperating">
            取消
          </el-button>
          <el-button 
            :type="confirmDialog.confirmType" 
            @click="handleConfirmOperation"
            :loading="isOperating"
          >
            {{ confirmDialog.confirmText }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量操作进度对话框 -->
    <el-dialog
      v-model="progressDialog.visible"
      title="批量操作进度"
      width="600px"
      class="batch-progress-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <div class="progress-header">
          <div class="progress-title">
            <i class="fas fa-cog fa-spin"></i>
            正在执行批量操作...
          </div>
          <div class="progress-stats">
            成功: <span class="success-count">{{ progressDialog.successCount }}</span> / 
            失败: <span class="failed-count">{{ progressDialog.failedCount }}</span> / 
            总计: <span class="total-count">{{ progressDialog.totalCount }}</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <el-progress 
            :percentage="progressPercentage" 
            :status="progressStatus"
            :stroke-width="8"
          />
        </div>
        
        <div class="progress-details">
          <div class="current-operation">
            当前操作: {{ progressDialog.currentOperation }}
          </div>
          <div class="operation-time">
            已用时间: {{ formatDuration(progressDialog.elapsedTime) }}
          </div>
        </div>

        <!-- 错误列表 -->
        <div v-if="progressDialog.errors.length > 0" class="error-list">
          <div class="error-header">
            <i class="fas fa-exclamation-triangle"></i>
            操作失败项目 ({{ progressDialog.errors.length }})
          </div>
          <div class="error-items">
            <div 
              v-for="(error, index) in progressDialog.errors" 
              :key="index"
              class="error-item"
            >
              <div class="error-id">{{ error.id }}</div>
              <div class="error-message">{{ error.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button 
            v-if="progressDialog.completed"
            type="primary" 
            @click="handleCloseProgress"
          >
            完成
          </el-button>
          <el-button 
            v-else
            @click="handleCancelOperation"
            :disabled="!progressDialog.canCancel"
          >
            取消操作
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义组件属性
interface Props {
  selectedCount: number
  selectedItems: any[]
  operations?: BatchOperationConfig[]
  itemName?: string
}

// 批量操作配置接口
interface BatchOperationConfig {
  key: string
  label: string
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger'
  confirmTitle?: string
  confirmMessage?: string
  confirmType?: 'primary' | 'success' | 'warning' | 'danger'
  requiresForm?: boolean
  dangerous?: boolean
}

// 批量操作结果接口
interface BatchOperationResult {
  success: number
  failed: number
  errors: { id: string | number; message: string }[]
}

// 进度信息接口
interface ProgressInfo {
  visible: boolean
  totalCount: number
  successCount: number
  failedCount: number
  currentOperation: string
  elapsedTime: number
  completed: boolean
  canCancel: boolean
  errors: { id: string | number; message: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedCount: 0,
  selectedItems: () => [],
  operations: () => [],
  itemName: '项'
})

// 定义事件
const emit = defineEmits<{
  batchOperation: [operation: string, params: any]
  operationComplete: [result: BatchOperationResult]
  operationCancelled: []
}>()

// 响应式数据
const isOperating = ref(false)
const confirmFormRef = ref()

// 确认对话框状态
const confirmDialog = reactive({
  visible: false,
  title: '',
  message: '',
  details: [] as string[],
  iconClass: '',
  confirmText: '确认',
  confirmType: 'primary' as 'primary' | 'success' | 'warning' | 'danger',
  operation: '',
  showForm: false
})

// 确认表单数据
const confirmForm = reactive({
  reason: '',
  trackingNumber: '',
  notes: ''
})

// 确认表单验证规则
const confirmFormRules = {
  reason: [
    { required: true, message: '请输入取消原因', trigger: 'blur' }
  ],
  trackingNumber: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
}

// 进度对话框状态
const progressDialog = reactive<ProgressInfo>({
  visible: false,
  totalCount: 0,
  successCount: 0,
  failedCount: 0,
  currentOperation: '',
  elapsedTime: 0,
  completed: false,
  canCancel: true,
  errors: []
})

// 进度计时器
let progressTimer: NodeJS.Timeout | null = null
let startTime: number = 0

// 计算属性
const progressPercentage = computed(() => {
  if (progressDialog.totalCount === 0) return 0
  const processed = progressDialog.successCount + progressDialog.failedCount
  return Math.round((processed / progressDialog.totalCount) * 100)
})

const progressStatus = computed(() => {
  if (progressDialog.completed) {
    return progressDialog.failedCount > 0 ? 'warning' : 'success'
  }
  return undefined
})

// 默认操作配置
const defaultOperations: Record<string, BatchOperationConfig> = {
  confirm: {
    key: 'confirm',
    label: '批量确认',
    icon: 'fas fa-check',
    type: 'primary',
    confirmTitle: '批量确认',
    confirmMessage: '确定要批量确认选中的项目吗？',
    confirmType: 'primary'
  },
  cancel: {
    key: 'cancel',
    label: '批量取消',
    icon: 'fas fa-times',
    type: 'warning',
    confirmTitle: '批量取消',
    confirmMessage: '确定要批量取消选中的项目吗？',
    confirmType: 'warning',
    requiresForm: true
  },
  delete: {
    key: 'delete',
    label: '批量删除',
    icon: 'fas fa-trash',
    type: 'danger',
    confirmTitle: '批量删除',
    confirmMessage: '确定要批量删除选中的项目吗？此操作不可恢复！',
    confirmType: 'danger',
    dangerous: true
  },
  ship: {
    key: 'ship',
    label: '批量发货',
    icon: 'fas fa-shipping-fast',
    type: 'success',
    confirmTitle: '批量发货',
    confirmMessage: '确定要批量发货选中的订单吗？',
    confirmType: 'success',
    requiresForm: true
  }
}

// 方法
const handleBatchOperation = (operation: string) => {
  const config = defaultOperations[operation]
  if (!config) {
    ElMessage.error('未知的批量操作')
    return
  }

  // 设置确认对话框
  confirmDialog.operation = operation
  confirmDialog.title = config.confirmTitle || '批量操作确认'
  confirmDialog.message = config.confirmMessage || '确定要执行此批量操作吗？'
  confirmDialog.confirmText = config.label
  confirmDialog.confirmType = config.confirmType || 'primary'
  confirmDialog.showForm = config.requiresForm || false
  
  // 设置图标
  if (config.dangerous) {
    confirmDialog.iconClass = 'fas fa-exclamation-triangle text-danger'
  } else {
    confirmDialog.iconClass = config.icon || 'fas fa-question-circle text-primary'
  }

  // 设置详细信息
  confirmDialog.details = [
    `将对 ${props.selectedCount} 个项目执行${config.label}操作`
  ]

  // 重置表单
  resetConfirmForm()
  
  confirmDialog.visible = true
}

const handleConfirmOperation = async () => {
  // 如果需要表单验证
  if (confirmDialog.showForm && confirmFormRef.value) {
    try {
      await confirmFormRef.value.validate()
    } catch (error) {
      return
    }
  }

  confirmDialog.visible = false
  
  // 开始批量操作
  await startBatchOperation()
}

const startBatchOperation = async () => {
  isOperating.value = true
  
  // 初始化进度对话框
  progressDialog.visible = true
  progressDialog.totalCount = props.selectedCount
  progressDialog.successCount = 0
  progressDialog.failedCount = 0
  progressDialog.currentOperation = `正在执行${defaultOperations[confirmDialog.operation]?.label}...`
  progressDialog.elapsedTime = 0
  progressDialog.completed = false
  progressDialog.canCancel = true
  progressDialog.errors = []

  // 开始计时
  startTime = Date.now()
  startProgressTimer()

  try {
    // 构建操作参数
    const params = {
      operation: confirmDialog.operation,
      items: props.selectedItems,
      ...confirmForm
    }

    // 发送批量操作事件
    emit('batchOperation', confirmDialog.operation, params)

    // 模拟批量操作进度（实际应该通过WebSocket或轮询获取进度）
    await simulateBatchProgress()

  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
    handleCloseProgress()
  }
}

const simulateBatchProgress = async (): Promise<void> => {
  return new Promise((resolve) => {
    const totalItems = props.selectedCount
    let processedItems = 0
    
    const processInterval = setInterval(() => {
      if (processedItems >= totalItems) {
        clearInterval(processInterval)
        progressDialog.completed = true
        progressDialog.canCancel = false
        progressDialog.currentOperation = '批量操作已完成'
        stopProgressTimer()
        
        // 模拟一些失败的项目
        const failedCount = Math.floor(Math.random() * 3)
        progressDialog.failedCount = failedCount
        progressDialog.successCount = totalItems - failedCount
        
        // 生成错误信息
        for (let i = 0; i < failedCount; i++) {
          progressDialog.errors.push({
            id: `item-${i + 1}`,
            message: '操作失败：网络连接超时'
          })
        }

        // 发送完成事件
        emit('operationComplete', {
          success: progressDialog.successCount,
          failed: progressDialog.failedCount,
          errors: progressDialog.errors
        })
        
        resolve()
        return
      }
      
      // 模拟处理进度
      const batchSize = Math.min(3, totalItems - processedItems)
      processedItems += batchSize
      progressDialog.successCount = processedItems
      progressDialog.currentOperation = `正在处理第 ${processedItems} / ${totalItems} 项...`
      
    }, 800) // 每800ms处理一批
  })
}

const handleCancelOperation = () => {
  if (progressDialog.canCancel) {
    progressDialog.visible = false
    stopProgressTimer()
    isOperating.value = false
    emit('operationCancelled')
    ElMessage.info('批量操作已取消')
  }
}

const handleCloseProgress = () => {
  progressDialog.visible = false
  stopProgressTimer()
  isOperating.value = false
  resetConfirmForm()
}

const startProgressTimer = () => {
  progressTimer = setInterval(() => {
    progressDialog.elapsedTime = Date.now() - startTime
  }, 1000)
}

const stopProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const resetConfirmForm = () => {
  confirmForm.reason = ''
  confirmForm.trackingNumber = ''
  confirmForm.notes = ''
}

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  }
  return `${remainingSeconds}秒`
}

// 暴露方法供父组件调用
const updateProgress = (progress: Partial<ProgressInfo>) => {
  Object.assign(progressDialog, progress)
}

const completeOperation = (result: BatchOperationResult) => {
  progressDialog.successCount = result.success
  progressDialog.failedCount = result.failed
  progressDialog.errors = result.errors
  progressDialog.completed = true
  progressDialog.canCancel = false
  progressDialog.currentOperation = '批量操作已完成'
  stopProgressTimer()
  
  emit('operationComplete', result)
}

defineExpose({
  updateProgress,
  completeOperation,
  handleBatchOperation
})
</script>

<style scoped>
/* 批量操作栏样式 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  margin-bottom: 16px;
}

.batch-info {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.batch-info strong {
  color: var(--el-color-primary);
  font-weight: 600;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

/* 确认对话框样式 */
.batch-confirm-dialog {
  border-radius: 8px;
}

.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.confirm-icon {
  flex-shrink: 0;
  font-size: 24px;
  margin-top: 4px;
}

.confirm-icon .text-danger {
  color: var(--el-color-danger);
}

.confirm-icon .text-primary {
  color: var(--el-color-primary);
}

.confirm-message {
  flex: 1;
}

.confirm-message p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
}

.confirm-details {
  margin-top: 12px;
}

.confirm-details p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.confirm-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

/* 进度对话框样式 */
.batch-progress-dialog {
  border-radius: 8px;
}

.progress-content {
  padding: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-title i {
  color: var(--el-color-primary);
}

.progress-stats {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.success-count {
  color: var(--el-color-success);
  font-weight: 600;
}

.failed-count {
  color: var(--el-color-danger);
  font-weight: 600;
}

.total-count {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.progress-bar {
  margin-bottom: 20px;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.current-operation {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.operation-time {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 错误列表样式 */
.error-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-danger);
}

.error-items {
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 4px;
  font-size: 13px;
}

.error-id {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--el-color-danger);
}

.error-message {
  flex: 1;
  color: var(--el-text-color-regular);
}

/* 对话框底部样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .batch-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .progress-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .confirm-content {
    flex-direction: column;
    text-align: center;
  }

  .error-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 滚动条样式 */
.error-items::-webkit-scrollbar {
  width: 6px;
}

.error-items::-webkit-scrollbar-track {
  background: var(--el-bg-color-page);
  border-radius: 3px;
}

.error-items::-webkit-scrollbar-thumb {
  background: var(--el-border-color-base);
  border-radius: 3px;
}

.error-items::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>