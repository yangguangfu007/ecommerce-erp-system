<!-- 批量操作组件 - 支持批量选择和操作确认 -->
<template>
  <div class="batch-actions">
    <!-- 批量操作栏 -->
    <div 
      v-show="selectedCount > 0" 
      class="batch-action-bar"
      :class="{ 'batch-action-bar-visible': selectedCount > 0 }"
    >
      <div class="batch-info">
        <el-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        />
        <span class="selected-count">
          已选择 <strong>{{ selectedCount }}</strong> 项
        </span>
      </div>
      
      <div class="batch-buttons">
        <el-button
          v-for="action in actions"
          :key="action.key"
          :type="action.type || 'default'"
          :icon="action.icon"
          :disabled="action.disabled || isLoading"
          :loading="loadingAction === action.key"
          @click="handleAction(action)"
        >
          {{ action.label }}
        </el-button>
        
        <el-button @click="handleClearSelection">
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      :title="currentAction?.confirmTitle || '确认操作'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="confirm-content">
        <div class="confirm-icon">
          <el-icon 
            :size="48" 
            :color="currentAction?.type === 'danger' ? '#f56c6c' : '#e6a23c'"
          >
            <WarningFilled />
          </el-icon>
        </div>
        <div class="confirm-message">
          <p>{{ currentAction?.confirmMessage || '确定要执行此操作吗？' }}</p>
          <p class="confirm-detail">
            将对选中的 <strong>{{ selectedCount }}</strong> 项执行 
            <strong>{{ currentAction?.label }}</strong> 操作
          </p>
          <p v-if="currentAction?.warning" class="confirm-warning">
            <el-icon><Warning /></el-icon>
            {{ currentAction.warning }}
          </p>
        </div>
      </div>
      
      <!-- 额外的确认输入 -->
      <div v-if="currentAction?.requireConfirmText" class="confirm-input">
        <p class="confirm-input-label">
          请输入 <code>{{ currentAction.confirmText }}</code> 以确认操作：
        </p>
        <el-input
          v-model="confirmInputValue"
          :placeholder="`请输入 ${currentAction.confirmText}`"
          @keyup.enter="handleConfirm"
        />
      </div>
      
      <template #footer>
        <el-button @click="handleCancelConfirm">
          取消
        </el-button>
        <el-button
          :type="currentAction?.type || 'primary'"
          :disabled="!canConfirm"
          :loading="isLoading"
          @click="handleConfirm"
        >
          确认{{ currentAction?.label }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="批量操作进度"
      width="500px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="progress-content">
        <div class="progress-info">
          <p>正在执行：{{ currentAction?.label }}</p>
          <p class="progress-detail">
            已处理 {{ processedCount }} / {{ totalCount }} 项
          </p>
        </div>
        
        <el-progress
          :percentage="progressPercentage"
          :status="progressStatus"
          :stroke-width="8"
        />
        
        <!-- 错误列表 -->
        <div v-if="errors.length > 0" class="error-list">
          <el-collapse>
            <el-collapse-item title="查看错误详情" name="errors">
              <div class="error-item" v-for="(error, index) in errors" :key="index">
                <el-icon color="#f56c6c"><CircleCloseFilled /></el-icon>
                <span>{{ error.message }}</span>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      
      <template #footer>
        <el-button
          v-if="isCompleted"
          type="primary"
          @click="handleCloseProgress"
        >
          完成
        </el-button>
        <el-button
          v-else
          @click="handleCancelOperation"
        >
          取消操作
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  WarningFilled, 
  Warning, 
  CircleCloseFilled 
} from '@element-plus/icons-vue'

interface BatchAction {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: any
  disabled?: boolean
  confirmTitle?: string
  confirmMessage?: string
  warning?: string
  requireConfirmText?: boolean
  confirmText?: string
}

interface BatchError {
  id: any
  message: string
}

interface Props {
  /** 批量操作配置 */
  actions: BatchAction[]
  /** 选中的项目ID列表 */
  selectedIds: any[]
  /** 总项目数量 */
  totalCount: number
  /** 是否显示全选状态 */
  showSelectAll?: boolean
}

interface Emits {
  (e: 'action', actionKey: string, selectedIds: any[]): Promise<void>
  (e: 'select-all', selected: boolean): void
  (e: 'clear-selection'): void
}

const props = withDefaults(defineProps<Props>(), {
  showSelectAll: true
})

const emit = defineEmits<Emits>()

// 响应式数据
const confirmDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const currentAction = ref<BatchAction | null>(null)
const confirmInputValue = ref('')
const isLoading = ref(false)
const loadingAction = ref('')
const processedCount = ref(0)
const errors = ref<BatchError[]>([])
const isCompleted = ref(false)
const isCancelled = ref(false)

// 计算属性
const selectedCount = computed(() => props.selectedIds.length)

const isAllSelected = computed(() => {
  return props.totalCount > 0 && selectedCount.value === props.totalCount
})

const isIndeterminate = computed(() => {
  return selectedCount.value > 0 && selectedCount.value < props.totalCount
})

const canConfirm = computed(() => {
  if (!currentAction.value?.requireConfirmText) {
    return true
  }
  return confirmInputValue.value === currentAction.value.confirmText
})

const progressPercentage = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round((processedCount.value / selectedCount.value) * 100)
})

const progressStatus = computed(() => {
  if (isCancelled.value) return 'exception'
  if (isCompleted.value) {
    return errors.value.length > 0 ? 'warning' : 'success'
  }
  return undefined
})

// 事件处理
const handleSelectAll = (selected: boolean) => {
  emit('select-all', selected)
}

const handleClearSelection = () => {
  emit('clear-selection')
}

const handleAction = async (action: BatchAction) => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要操作的项目')
    return
  }

  currentAction.value = action
  
  // 如果需要确认，显示确认对话框
  if (action.confirmMessage || action.requireConfirmText) {
    confirmInputValue.value = ''
    confirmDialogVisible.value = true
  } else {
    // 直接执行操作
    await executeAction(action)
  }
}

const handleConfirm = async () => {
  if (!canConfirm.value) return
  
  confirmDialogVisible.value = false
  
  if (currentAction.value) {
    await executeAction(currentAction.value)
  }
}

const handleCancelConfirm = () => {
  confirmDialogVisible.value = false
  currentAction.value = null
  confirmInputValue.value = ''
}

const executeAction = async (action: BatchAction) => {
  try {
    isLoading.value = true
    loadingAction.value = action.key
    processedCount.value = 0
    errors.value = []
    isCompleted.value = false
    isCancelled.value = false
    
    // 显示进度对话框
    progressDialogVisible.value = true
    
    // 执行批量操作
    await emit('action', action.key, [...props.selectedIds])
    
    isCompleted.value = true
    
    // 显示成功消息
    const successCount = selectedCount.value - errors.value.length
    if (errors.value.length === 0) {
      ElMessage.success(`${action.label}完成，共处理 ${successCount} 项`)
    } else {
      ElMessage.warning(`${action.label}完成，成功 ${successCount} 项，失败 ${errors.value.length} 项`)
    }
    
  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error(`${action.label}失败: ${error.message || '未知错误'}`)
    isCancelled.value = true
  } finally {
    isLoading.value = false
    loadingAction.value = ''
  }
}

const handleCancelOperation = () => {
  isCancelled.value = true
  progressDialogVisible.value = false
  isLoading.value = false
  loadingAction.value = ''
  ElMessage.info('操作已取消')
}

const handleCloseProgress = () => {
  progressDialogVisible.value = false
  currentAction.value = null
  
  // 如果操作成功完成，清空选择
  if (isCompleted.value && errors.value.length === 0) {
    emit('clear-selection')
  }
}

// 暴露方法供父组件调用
const updateProgress = (processed: number, total?: number) => {
  processedCount.value = processed
}

const addError = (id: any, message: string) => {
  errors.value.push({ id, message })
}

const setCompleted = () => {
  isCompleted.value = true
}

// 监听选中项变化
watch(() => props.selectedIds, (newIds) => {
  if (newIds.length === 0) {
    // 如果没有选中项，关闭相关对话框
    if (confirmDialogVisible.value) {
      handleCancelConfirm()
    }
  }
})

defineExpose({
  updateProgress,
  addError,
  setCompleted
})
</script>

<style scoped>
.batch-actions {
  position: relative;
}

.batch-action-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  z-index: 1000;
  min-width: 400px;
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
  transition: all 0.3s ease;
}

.batch-action-bar-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.batch-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.confirm-icon {
  flex-shrink: 0;
}

.confirm-message {
  flex: 1;
}

.confirm-message p {
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.confirm-detail {
  color: #606266;
  font-size: 14px;
}

.confirm-warning {
  color: #e6a23c;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px !important;
  padding: 8px;
  background: #fdf6ec;
  border-radius: 4px;
}

.confirm-input {
  margin-top: 16px;
}

.confirm-input-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.confirm-input-label code {
  background: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e6a23c;
}

.progress-content {
  text-align: center;
}

.progress-info {
  margin-bottom: 20px;
}

.progress-info p {
  margin: 0 0 8px 0;
}

.progress-detail {
  color: #606266;
  font-size: 14px;
}

.error-list {
  margin-top: 16px;
  text-align: left;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 14px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-action-bar {
    left: 10px;
    right: 10px;
    transform: none;
    min-width: auto;
    flex-direction: column;
    gap: 12px;
  }
  
  .batch-action-bar-visible {
    transform: translateY(0);
  }
  
  .batch-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>