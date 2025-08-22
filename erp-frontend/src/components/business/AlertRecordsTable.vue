<template>
  <div class="alert-records-table">
    <el-table 
      :data="records" 
      stripe
      :loading="loading"
      row-class-name="alert-record-row"
    >
      <el-table-column 
        prop="level" 
        label="级别" 
        width="80"
      >
        <template #default="{ row }">
          <el-tag 
            :type="getLevelType(row.level)"
            :class="getLevelClass(row.level)"
          >
            {{ getLevelText(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="ruleName" 
        label="规则名称" 
        min-width="150"
      />
      
      <el-table-column 
        prop="message" 
        label="告警信息" 
        min-width="200"
        show-overflow-tooltip
      />
      
      <el-table-column 
        label="当前值/阈值" 
        width="120"
      >
        <template #default="{ row }">
          <div class="value-comparison">
            <span class="current-value">{{ row.value }}</span>
            <span class="separator">/</span>
            <span class="threshold-value">{{ row.threshold }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="status" 
        label="状态" 
        width="100"
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
        prop="triggeredAt" 
        label="触发时间" 
        width="160"
        sortable
      >
        <template #default="{ row }">
          {{ formatDateTime(row.triggeredAt) }}
        </template>
      </el-table-column>
      
      <el-table-column 
        label="持续时间" 
        width="100"
      >
        <template #default="{ row }">
          {{ getDuration(row) }}
        </template>
      </el-table-column>
      
      <el-table-column 
        label="操作" 
        width="180"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button 
              v-if="row.status === 'active'"
              size="small" 
              type="warning"
              :icon="Check"
              @click="$emit('acknowledge', row.id)"
            >
              确认
            </el-button>
            <el-button 
              v-if="row.status === 'active' || row.status === 'acknowledged'"
              size="small" 
              type="success"
              :icon="CircleCheck"
              @click="$emit('resolve', row.id)"
            >
              解决
            </el-button>
            <el-button 
              size="small" 
              type="info"
              :icon="View"
              @click="showDetails(row)"
            >
              详情
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="告警详情"
      width="600px"
    >
      <div v-if="selectedRecord" class="alert-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getLevelType(selectedRecord.level)">
              {{ getLevelText(selectedRecord.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="规则名称">
            {{ selectedRecord.ruleName }}
          </el-descriptions-item>
          <el-descriptions-item label="告警信息" :span="2">
            {{ selectedRecord.message }}
          </el-descriptions-item>
          <el-descriptions-item label="当前值">
            {{ selectedRecord.value }}
          </el-descriptions-item>
          <el-descriptions-item label="阈值">
            {{ selectedRecord.threshold }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="触发时间">
            {{ formatDateTime(selectedRecord.triggeredAt) }}
          </el-descriptions-item>
          <el-descriptions-item 
            v-if="selectedRecord.acknowledgedAt" 
            label="确认时间"
          >
            {{ formatDateTime(selectedRecord.acknowledgedAt) }}
          </el-descriptions-item>
          <el-descriptions-item 
            v-if="selectedRecord.acknowledgedBy" 
            label="确认人"
          >
            {{ selectedRecord.acknowledgedBy }}
          </el-descriptions-item>
          <el-descriptions-item 
            v-if="selectedRecord.resolvedAt" 
            label="解决时间"
          >
            {{ formatDateTime(selectedRecord.resolvedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Check, 
  CircleCheck, 
  View 
} from '@element-plus/icons-vue'
import type { AlertRecord } from '@/types/monitor'
import { formatDateTime } from '@/utils/date'

interface Props {
  records: AlertRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'acknowledge': [recordId: string]
  'resolve': [recordId: string]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

// 响应式数据
const detailDialogVisible = ref(false)
const selectedRecord = ref<AlertRecord | null>(null)

// 方法
const getLevelType = (level: string) => {
  switch (level) {
    case 'critical': return 'danger'
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

const getLevelClass = (level: string) => {
  return `level-${level}`
}

const getLevelText = (level: string) => {
  switch (level) {
    case 'critical': return '严重'
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return level
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'danger'
    case 'acknowledged': return 'warning'
    case 'resolved': return 'success'
    default: return 'info'
  }
}

const getStatusClass = (status: string) => {
  return `status-${status}`
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '活跃'
    case 'acknowledged': return '已确认'
    case 'resolved': return '已解决'
    default: return status
  }
}

const getDuration = (record: AlertRecord) => {
  const startTime = new Date(record.triggeredAt).getTime()
  const endTime = record.resolvedAt 
    ? new Date(record.resolvedAt).getTime() 
    : Date.now()
  
  const duration = Math.floor((endTime - startTime) / 1000 / 60) // 分钟
  
  if (duration < 60) {
    return `${duration}分钟`
  } else if (duration < 24 * 60) {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}小时${minutes}分钟`
  } else {
    const days = Math.floor(duration / (24 * 60))
    const hours = Math.floor((duration % (24 * 60)) / 60)
    return `${days}天${hours}小时`
  }
}

const showDetails = (record: AlertRecord) => {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

const handleCurrentChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped>
.alert-records-table {
  width: 100%;
}

.level-critical {
  animation: blink-critical 1s infinite;
}

.level-high {
  animation: blink-high 2s infinite;
}

@keyframes blink-critical {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.6; }
}

@keyframes blink-high {
  0%, 70% { opacity: 1; }
  71%, 100% { opacity: 0.8; }
}

.value-comparison {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.current-value {
  color: var(--el-color-danger);
  font-weight: 600;
}

.separator {
  color: var(--el-text-color-secondary);
}

.threshold-value {
  color: var(--el-text-color-regular);
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.alert-detail {
  padding: 16px 0;
}

:deep(.alert-record-row.el-table__row--striped) {
  background-color: var(--el-table-row-hover-bg-color);
}

:deep(.alert-record-row:hover) {
  background-color: var(--el-color-primary-light-9);
}

@media (max-width: 768px) {
  .operation-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .operation-buttons .el-button {
    width: 100%;
  }
  
  .value-comparison {
    flex-direction: column;
    gap: 2px;
  }
}
</style>