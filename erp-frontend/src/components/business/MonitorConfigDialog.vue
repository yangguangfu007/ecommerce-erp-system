<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="监控配置"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="刷新间隔" prop="refreshInterval">
        <el-select 
          v-model="formData.refreshInterval" 
          placeholder="请选择刷新间隔"
          style="width: 100%"
        >
          <el-option label="10秒" :value="10000" />
          <el-option label="30秒" :value="30000" />
          <el-option label="1分钟" :value="60000" />
          <el-option label="2分钟" :value="120000" />
          <el-option label="5分钟" :value="300000" />
        </el-select>
        <div class="form-item-tip">
          系统性能数据的自动刷新间隔
        </div>
      </el-form-item>
      
      <el-form-item label="数据保留天数" prop="retentionDays">
        <el-input-number 
          v-model="formData.retentionDays" 
          :min="1"
          :max="365"
          style="width: 100%"
        />
        <div class="form-item-tip">
          监控数据和日志的保留天数，超过此天数的数据将被自动清理
        </div>
      </el-form-item>
      
      <el-divider content-position="left">告警设置</el-divider>
      
      <el-form-item label="启用告警">
        <el-switch 
          v-model="formData.alertEnabled"
          active-text="启用"
          inactive-text="禁用"
        />
        <div class="form-item-tip">
          是否启用系统告警功能
        </div>
      </el-form-item>
      
      <el-form-item 
        label="邮件通知" 
        v-if="formData.alertEnabled"
      >
        <el-switch 
          v-model="formData.emailNotifications"
          active-text="启用"
          inactive-text="禁用"
        />
        <div class="form-item-tip">
          是否通过邮件发送告警通知
        </div>
      </el-form-item>
      
      <el-form-item 
        label="短信通知" 
        v-if="formData.alertEnabled"
      >
        <el-switch 
          v-model="formData.smsNotifications"
          active-text="启用"
          inactive-text="禁用"
        />
        <div class="form-item-tip">
          是否通过短信发送告警通知
        </div>
      </el-form-item>
      
      <el-form-item 
        label="Webhook URL" 
        prop="webhookUrl"
        v-if="formData.alertEnabled"
      >
        <el-input 
          v-model="formData.webhookUrl" 
          placeholder="请输入Webhook URL（可选）"
        />
        <div class="form-item-tip">
          告警信息将通过POST请求发送到此URL
        </div>
      </el-form-item>
      
      <el-divider content-position="left">系统信息</el-divider>
      
      <el-form-item label="当前配置">
        <div class="current-config">
          <div class="config-item">
            <span class="config-label">刷新间隔:</span>
            <span class="config-value">{{ formatInterval(config?.refreshInterval || 30000) }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">数据保留:</span>
            <span class="config-value">{{ config?.retentionDays || 30 }}天</span>
          </div>
          <div class="config-item">
            <span class="config-label">告警状态:</span>
            <span class="config-value">
              <el-tag :type="config?.alertEnabled ? 'success' : 'danger'">
                {{ config?.alertEnabled ? '已启用' : '已禁用' }}
              </el-tag>
            </span>
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">
          取消
        </el-button>
        <el-button @click="resetToDefault">
          恢复默认
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSave"
          :loading="saving"
        >
          保存配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { MonitorConfig } from '@/types/monitor'

interface Props {
  modelValue: boolean
  config?: MonitorConfig | null
}

const props = withDefaults(defineProps<Props>(), {
  config: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [config: Partial<MonitorConfig>]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const saving = ref(false)

const formData = ref({
  refreshInterval: 30000,
  retentionDays: 30,
  alertEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  webhookUrl: ''
})

// 默认配置
const defaultConfig = {
  refreshInterval: 30000,
  retentionDays: 30,
  alertEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  webhookUrl: ''
}

// 表单验证规则
const formRules: FormRules = {
  refreshInterval: [
    { required: true, message: '请选择刷新间隔', trigger: 'change' }
  ],
  retentionDays: [
    { required: true, message: '请输入数据保留天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '保留天数必须在1-365之间', trigger: 'blur' }
  ],
  webhookUrl: [
    { 
      validator: (rule, value, callback) => {
        if (value && !/^https?:\/\/.+/.test(value)) {
          callback(new Error('请输入有效的URL地址'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 方法
const formatInterval = (interval: number) => {
  if (interval < 60000) {
    return `${interval / 1000}秒`
  } else if (interval < 3600000) {
    return `${interval / 60000}分钟`
  } else {
    return `${interval / 3600000}小时`
  }
}

const loadConfigData = () => {
  if (props.config) {
    formData.value = {
      refreshInterval: props.config.refreshInterval,
      retentionDays: props.config.retentionDays,
      alertEnabled: props.config.alertEnabled,
      emailNotifications: props.config.emailNotifications,
      smsNotifications: props.config.smsNotifications,
      webhookUrl: props.config.webhookUrl || ''
    }
  } else {
    formData.value = { ...defaultConfig }
  }
}

const resetToDefault = () => {
  formData.value = { ...defaultConfig }
  ElMessage.success('已恢复默认配置')
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const configData = {
      ...formData.value,
      webhookUrl: formData.value.webhookUrl || undefined
    }
    
    emit('save', configData)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    saving.value = false
  }
}

// 监听器
watch(() => props.modelValue, (visible) => {
  if (visible) {
    nextTick(() => {
      loadConfigData()
    })
  }
})
</script>

<style scoped>
.form-item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.current-config {
  background: var(--el-color-info-light-9);
  padding: 12px;
  border-radius: 4px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.config-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>