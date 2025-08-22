<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="清理系统日志"
    width="450px"
    :close-on-click-modal="false"
  >
    <div class="cleanup-warning">
      <el-alert
        title="注意"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>此操作将永久删除符合条件的日志记录，请谨慎操作！</p>
          <p>建议在清理前先导出重要的日志数据。</p>
        </template>
      </el-alert>
    </div>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      style="margin-top: 20px"
    >
      <el-form-item label="清理日期" prop="beforeDate">
        <el-date-picker
          v-model="formData.beforeDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled-date="disabledDate"
        />
        <div class="form-item-tip">
          将清理此日期之前的所有日志
        </div>
      </el-form-item>
      
      <el-form-item label="日志级别">
        <el-select 
          v-model="formData.level" 
          placeholder="选择日志级别（可选）"
          clearable
          style="width: 100%"
        >
          <el-option label="错误" value="error" />
          <el-option label="警告" value="warning" />
          <el-option label="信息" value="info" />
          <el-option label="调试" value="debug" />
        </el-select>
        <div class="form-item-tip">
          不选择则清理所有级别的日志
        </div>
      </el-form-item>
      
      <el-form-item label="预估影响">
        <div class="impact-info">
          <div class="impact-item">
            <span class="impact-label">清理日期:</span>
            <span class="impact-value">
              {{ formData.beforeDate ? `${formData.beforeDate} 之前` : '未选择' }}
            </span>
          </div>
          <div class="impact-item">
            <span class="impact-label">日志级别:</span>
            <span class="impact-value">
              {{ formData.level ? getLevelText(formData.level) : '所有级别' }}
            </span>
          </div>
          <div class="impact-item">
            <span class="impact-label">预估删除:</span>
            <span class="impact-value estimated-count">
              {{ estimatedCount > 0 ? `约 ${estimatedCount} 条记录` : '计算中...' }}
            </span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item>
        <el-checkbox v-model="confirmCleanup">
          我确认要执行此清理操作
        </el-checkbox>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">
          取消
        </el-button>
        <el-button @click="handleEstimate" :loading="estimating">
          预估数量
        </el-button>
        <el-button 
          type="danger" 
          @click="handleCleanup"
          :loading="cleaning"
          :disabled="!confirmCleanup || !formData.beforeDate"
        >
          确认清理
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'cleanup': [params: { beforeDate: string; level?: string }]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const cleaning = ref(false)
const estimating = ref(false)
const confirmCleanup = ref(false)
const estimatedCount = ref(0)

const formData = ref({
  beforeDate: '',
  level: ''
})

// 表单验证规则
const formRules: FormRules = {
  beforeDate: [
    { required: true, message: '请选择清理日期', trigger: 'change' }
  ]
}

// 方法
const disabledDate = (time: Date) => {
  // 禁用今天及以后的日期
  return time.getTime() >= Date.now() - 24 * 60 * 60 * 1000
}

const getLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    error: '错误',
    warning: '警告',
    info: '信息',
    debug: '调试'
  }
  return levelMap[level] || level
}

const resetForm = () => {
  formData.value = {
    beforeDate: '',
    level: ''
  }
  confirmCleanup.value = false
  estimatedCount.value = 0
}

const handleEstimate = async () => {
  if (!formData.value.beforeDate) {
    ElMessage.warning('请先选择清理日期')
    return
  }
  
  estimating.value = true
  
  try {
    // 模拟API调用获取预估数量
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该调用实际的API来获取预估数量
    // const response = await api.estimateLogCleanup(formData.value)
    // estimatedCount.value = response.data.count
    
    // 模拟数据
    const baseCount = Math.floor(Math.random() * 10000) + 1000
    const levelMultiplier = formData.value.level ? 0.3 : 1
    estimatedCount.value = Math.floor(baseCount * levelMultiplier)
    
    ElMessage.success('预估完成')
  } catch (error) {
    ElMessage.error('预估失败')
    estimatedCount.value = 0
  } finally {
    estimating.value = false
  }
}

const handleCleanup = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (!confirmCleanup.value) {
      ElMessage.warning('请确认清理操作')
      return
    }
    
    await ElMessageBox.confirm(
      `确定要清理 ${formData.value.beforeDate} 之前的${formData.value.level ? getLevelText(formData.value.level) : '所有'}日志吗？\n\n预估将删除约 ${estimatedCount.value} 条记录，此操作不可恢复！`,
      '确认清理',
      {
        type: 'warning',
        confirmButtonText: '确认清理',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    cleaning.value = true
    
    const cleanupParams = {
      beforeDate: formData.value.beforeDate,
      level: formData.value.level || undefined
    }
    
    emit('cleanup', cleanupParams)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('请检查表单输入')
    }
  } finally {
    cleaning.value = false
  }
}

// 监听器
watch(() => props.modelValue, (visible) => {
  if (visible) {
    nextTick(() => {
      resetForm()
    })
  }
})

watch(() => [formData.value.beforeDate, formData.value.level], () => {
  estimatedCount.value = 0
  confirmCleanup.value = false
})
</script>

<style scoped>
.cleanup-warning {
  margin-bottom: 20px;
}

.form-item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.impact-info {
  background: var(--el-color-info-light-9);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.impact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.impact-item:last-child {
  margin-bottom: 0;
}

.impact-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.impact-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.estimated-count {
  color: var(--el-color-warning);
  font-weight: 600;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-alert__content) {
  font-size: 13px;
}

:deep(.el-alert__content p) {
  margin: 4px 0;
}
</style>