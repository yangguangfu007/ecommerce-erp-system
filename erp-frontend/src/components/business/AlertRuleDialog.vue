<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEdit ? '编辑告警规则' : '新增告警规则'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="规则名称" prop="name">
        <el-input 
          v-model="formData.name" 
          placeholder="请输入规则名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="规则类型" prop="type">
        <el-select 
          v-model="formData.type" 
          placeholder="请选择规则类型"
          @change="handleTypeChange"
        >
          <el-option label="CPU 使用率" value="cpu" />
          <el-option label="内存使用率" value="memory" />
          <el-option label="磁盘使用率" value="disk" />
          <el-option label="网络流量" value="network" />
          <el-option label="服务状态" value="service" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="监控指标" prop="metric">
        <el-select 
          v-model="formData.metric" 
          placeholder="请选择监控指标"
          :disabled="!formData.type"
        >
          <el-option 
            v-for="metric in availableMetrics" 
            :key="metric.value"
            :label="metric.label" 
            :value="metric.value" 
          />
        </el-select>
      </el-form-item>
      
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="操作符" prop="operator">
            <el-select v-model="formData.operator" placeholder="选择操作符">
              <el-option label="大于 >" value=">" />
              <el-option label="大于等于 >=" value=">=" />
              <el-option label="小于 <" value="<" />
              <el-option label="小于等于 <=" value="<=" />
              <el-option label="等于 ==" value="==" />
              <el-option label="不等于 !=" value="!=" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="阈值" prop="threshold">
            <el-input-number 
              v-model="formData.threshold" 
              :min="0"
              :max="getMaxThreshold()"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="单位" prop="unit">
            <el-input 
              v-model="formData.unit" 
              placeholder="单位"
              :disabled="isUnitDisabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="规则描述">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入规则描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="告警动作">
        <div class="alert-actions">
          <el-checkbox-group v-model="selectedActions">
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="webhook">Webhook</el-checkbox>
            <el-checkbox label="notification">系统通知</el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>
      
      <!-- 邮件配置 -->
      <el-form-item 
        v-if="selectedActions.includes('email')" 
        label="邮件地址"
        prop="emailTarget"
      >
        <el-input 
          v-model="emailTarget" 
          placeholder="请输入邮件地址，多个地址用逗号分隔"
        />
      </el-form-item>
      
      <!-- 短信配置 -->
      <el-form-item 
        v-if="selectedActions.includes('sms')" 
        label="手机号码"
        prop="smsTarget"
      >
        <el-input 
          v-model="smsTarget" 
          placeholder="请输入手机号码，多个号码用逗号分隔"
        />
      </el-form-item>
      
      <!-- Webhook配置 -->
      <el-form-item 
        v-if="selectedActions.includes('webhook')" 
        label="Webhook URL"
        prop="webhookTarget"
      >
        <el-input 
          v-model="webhookTarget" 
          placeholder="请输入Webhook URL"
        />
      </el-form-item>
      
      <el-form-item label="启用状态">
        <el-switch 
          v-model="formData.enabled"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSave"
          :loading="saving"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { AlertRule, AlertAction } from '@/types/monitor'

interface Props {
  modelValue: boolean
  rule?: AlertRule | null
}

const props = withDefaults(defineProps<Props>(), {
  rule: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [rule: any]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const saving = ref(false)
const selectedActions = ref<string[]>([])
const emailTarget = ref('')
const smsTarget = ref('')
const webhookTarget = ref('')

const formData = ref({
  name: '',
  type: '',
  metric: '',
  operator: '>',
  threshold: 0,
  unit: '',
  description: '',
  enabled: true
})

// 计算属性
const isEdit = computed(() => !!props.rule)

const availableMetrics = computed(() => {
  const metricsMap: Record<string, Array<{ label: string; value: string }>> = {
    cpu: [
      { label: 'CPU 使用率', value: 'cpu.usage' },
      { label: 'CPU 温度', value: 'cpu.temperature' }
    ],
    memory: [
      { label: '内存使用率', value: 'memory.usage' },
      { label: '内存使用量', value: 'memory.used' }
    ],
    disk: [
      { label: '磁盘使用率', value: 'disk.usage' },
      { label: '磁盘使用量', value: 'disk.used' },
      { label: '磁盘IO', value: 'disk.io' }
    ],
    network: [
      { label: '网络入流量', value: 'network.inbound' },
      { label: '网络出流量', value: 'network.outbound' },
      { label: '网络连接数', value: 'network.connections' }
    ],
    service: [
      { label: '服务响应时间', value: 'service.responseTime' },
      { label: '服务可用性', value: 'service.availability' }
    ],
    custom: []
  }
  
  return metricsMap[formData.value.type] || []
})

const isUnitDisabled = computed(() => {
  const unitMap: Record<string, string> = {
    'cpu.usage': '%',
    'memory.usage': '%',
    'disk.usage': '%',
    'cpu.temperature': '°C',
    'memory.used': 'MB',
    'disk.used': 'GB',
    'network.inbound': 'MB/s',
    'network.outbound': 'MB/s',
    'service.responseTime': 'ms'
  }
  
  if (unitMap[formData.value.metric]) {
    formData.value.unit = unitMap[formData.value.metric]
    return true
  }
  
  return false
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  metric: [
    { required: true, message: '请选择监控指标', trigger: 'change' }
  ],
  operator: [
    { required: true, message: '请选择操作符', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' },
    { type: 'number', min: 0, message: '阈值必须大于等于0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' }
  ],
  emailTarget: [
    { 
      validator: (rule, value, callback) => {
        if (selectedActions.value.includes('email') && !value) {
          callback(new Error('请输入邮件地址'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  smsTarget: [
    { 
      validator: (rule, value, callback) => {
        if (selectedActions.value.includes('sms') && !value) {
          callback(new Error('请输入手机号码'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  webhookTarget: [
    { 
      validator: (rule, value, callback) => {
        if (selectedActions.value.includes('webhook') && !value) {
          callback(new Error('请输入Webhook URL'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 方法
const getMaxThreshold = () => {
  if (formData.value.unit === '%') {
    return 100
  }
  return 999999
}

const handleTypeChange = () => {
  formData.value.metric = ''
  formData.value.unit = ''
}

const resetForm = () => {
  formData.value = {
    name: '',
    type: '',
    metric: '',
    operator: '>',
    threshold: 0,
    unit: '',
    description: '',
    enabled: true
  }
  selectedActions.value = []
  emailTarget.value = ''
  smsTarget.value = ''
  webhookTarget.value = ''
}

const loadRuleData = () => {
  if (props.rule) {
    formData.value = {
      name: props.rule.name,
      type: props.rule.type,
      metric: props.rule.metric,
      operator: props.rule.operator,
      threshold: props.rule.threshold,
      unit: props.rule.unit,
      description: props.rule.description || '',
      enabled: props.rule.enabled
    }
    
    // 加载告警动作
    selectedActions.value = props.rule.actions
      .filter(action => action.enabled)
      .map(action => action.type)
    
    // 加载动作目标
    props.rule.actions.forEach(action => {
      if (action.enabled) {
        switch (action.type) {
          case 'email':
            emailTarget.value = action.target
            break
          case 'sms':
            smsTarget.value = action.target
            break
          case 'webhook':
            webhookTarget.value = action.target
            break
        }
      }
    })
  }
}

const buildActions = (): AlertAction[] => {
  const actions: AlertAction[] = []
  
  if (selectedActions.value.includes('email') && emailTarget.value) {
    actions.push({
      type: 'email',
      target: emailTarget.value,
      enabled: true
    })
  }
  
  if (selectedActions.value.includes('sms') && smsTarget.value) {
    actions.push({
      type: 'sms',
      target: smsTarget.value,
      enabled: true
    })
  }
  
  if (selectedActions.value.includes('webhook') && webhookTarget.value) {
    actions.push({
      type: 'webhook',
      target: webhookTarget.value,
      enabled: true
    })
  }
  
  if (selectedActions.value.includes('notification')) {
    actions.push({
      type: 'notification',
      target: 'system',
      enabled: true
    })
  }
  
  return actions
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const ruleData = {
      ...formData.value,
      actions: buildActions()
    }
    
    emit('save', ruleData)
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
      if (props.rule) {
        loadRuleData()
      } else {
        resetForm()
      }
    })
  }
})
</script>

<style scoped>
.alert-actions {
  width: 100%;
}

.alert-actions .el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>