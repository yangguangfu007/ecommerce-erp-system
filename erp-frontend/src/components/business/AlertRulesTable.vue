<template>
  <div class="alert-rules-table">
    <el-table 
      :data="rules" 
      stripe
      :loading="loading"
    >
      <el-table-column 
        prop="name" 
        label="规则名称" 
        min-width="150"
      >
        <template #default="{ row }">
          <div class="rule-name">
            <el-icon class="rule-icon">
              <component :is="getRuleIcon(row.type)" />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="type" 
        label="类型" 
        width="100"
      >
        <template #default="{ row }">
          <el-tag :type="getRuleTypeTag(row.type)">
            {{ getRuleTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="metric" 
        label="监控指标" 
        width="120"
      />
      
      <el-table-column 
        label="阈值条件" 
        width="150"
      >
        <template #default="{ row }">
          <span class="threshold-condition">
            {{ row.operator }} {{ row.threshold }}{{ row.unit }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="enabled" 
        label="状态" 
        width="80"
      >
        <template #default="{ row }">
          <el-switch
            v-model="row.enabled"
            @change="handleToggleRule(row.id, row.enabled)"
            :loading="toggleLoading.includes(row.id)"
          />
        </template>
      </el-table-column>
      
      <el-table-column 
        label="告警动作" 
        width="120"
      >
        <template #default="{ row }">
          <div class="alert-actions">
            <el-tag 
              v-for="action in row.actions.filter(a => a.enabled)" 
              :key="action.type"
              size="small"
              class="action-tag"
            >
              {{ getActionText(action.type) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="createdAt" 
        label="创建时间" 
        width="160"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      
      <el-table-column 
        label="操作" 
        width="150"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button 
              size="small" 
              type="primary"
              :icon="Edit"
              @click="$emit('edit-rule', row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              :icon="Delete"
              @click="$emit('delete-rule', row.id)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Edit, 
  Delete,
  Monitor,
  MemoryCard,
  HardDisk,
  Connection,
  Setting,
  Warning
} from '@element-plus/icons-vue'
import type { AlertRule } from '@/types/monitor'
import { formatDateTime } from '@/utils/date'

interface Props {
  rules: AlertRule[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'edit-rule': [rule: AlertRule]
  'delete-rule': [ruleId: string]
  'toggle-rule': [ruleId: string, enabled: boolean]
}>()

// 响应式数据
const toggleLoading = ref<string[]>([])

// 规则类型图标映射
const ruleIconMap: Record<string, any> = {
  cpu: Monitor,
  memory: MemoryCard,
  disk: HardDisk,
  network: Connection,
  service: Setting,
  custom: Warning
}

// 方法
const getRuleIcon = (type: string) => {
  return ruleIconMap[type] || Warning
}

const getRuleTypeTag = (type: string) => {
  switch (type) {
    case 'cpu': return 'primary'
    case 'memory': return 'success'
    case 'disk': return 'warning'
    case 'network': return 'info'
    case 'service': return 'danger'
    default: return ''
  }
}

const getRuleTypeText = (type: string) => {
  switch (type) {
    case 'cpu': return 'CPU'
    case 'memory': return '内存'
    case 'disk': return '磁盘'
    case 'network': return '网络'
    case 'service': return '服务'
    case 'custom': return '自定义'
    default: return type
  }
}

const getActionText = (actionType: string) => {
  switch (actionType) {
    case 'email': return '邮件'
    case 'sms': return '短信'
    case 'webhook': return 'Webhook'
    case 'notification': return '通知'
    default: return actionType
  }
}

const handleToggleRule = async (ruleId: string, enabled: boolean) => {
  toggleLoading.value.push(ruleId)
  try {
    emit('toggle-rule', ruleId, enabled)
  } finally {
    // 移除加载状态
    setTimeout(() => {
      const index = toggleLoading.value.indexOf(ruleId)
      if (index > -1) {
        toggleLoading.value.splice(index, 1)
      }
    }, 1000)
  }
}
</script>

<style scoped>
.alert-rules-table {
  width: 100%;
}

.rule-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-icon {
  color: var(--el-color-primary);
}

.threshold-condition {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: var(--el-color-info-light-9);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.alert-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-tag {
  margin: 0;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .operation-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .operation-buttons .el-button {
    width: 100%;
  }
  
  .alert-actions {
    flex-direction: column;
  }
}
</style>