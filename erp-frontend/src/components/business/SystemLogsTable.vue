<template>
  <div class="system-logs-table">
    <el-table 
      :data="logs" 
      stripe
      :loading="loading"
      row-class-name="log-row"
      :default-sort="{ prop: 'timestamp', order: 'descending' }"
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
            size="small"
          >
            {{ getLevelText(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="timestamp" 
        label="时间" 
        width="160"
        sortable
      >
        <template #default="{ row }">
          <span class="log-timestamp">
            {{ formatDateTime(row.timestamp) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="source" 
        label="来源" 
        width="120"
      >
        <template #default="{ row }">
          <el-tag type="info" size="small">
            {{ row.source }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="message" 
        label="日志信息" 
        min-width="300"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <div class="log-message" :class="getMessageClass(row.level)">
            {{ row.message }}
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="userId" 
        label="用户" 
        width="100"
      >
        <template #default="{ row }">
          <span v-if="row.userId" class="user-id">{{ row.userId }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="ip" 
        label="IP地址" 
        width="120"
      >
        <template #default="{ row }">
          <span v-if="row.ip" class="ip-address">{{ row.ip }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        label="操作" 
        width="100"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button 
            size="small" 
            type="info"
            :icon="View"
            @click="showDetails(row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="800px"
    >
      <div v-if="selectedLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志级别">
            <el-tag :type="getLevelType(selectedLog.level)">
              {{ getLevelText(selectedLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时间">
            {{ formatDateTime(selectedLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="来源">
            {{ selectedLog.source }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ selectedLog.userId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ip || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="日志ID">
            {{ selectedLog.id }}
          </el-descriptions-item>
          <el-descriptions-item label="日志信息" :span="2">
            <div class="log-message-detail">
              {{ selectedLog.message }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item 
            v-if="selectedLog.details && Object.keys(selectedLog.details).length > 0"
            label="详细信息" 
            :span="2"
          >
            <div class="log-details-json">
              <pre>{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { View } from '@element-plus/icons-vue'
import type { SystemLog } from '@/types/monitor'
import { formatDateTime } from '@/utils/date'

interface Props {
  logs: SystemLog[]
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
  'page-change': [page: number]
  'size-change': [size: number]
}>()

// 响应式数据
const detailDialogVisible = ref(false)
const selectedLog = ref<SystemLog | null>(null)

// 方法
const getLevelType = (level: string) => {
  switch (level) {
    case 'error': return 'danger'
    case 'warning': return 'warning'
    case 'info': return 'primary'
    case 'debug': return 'info'
    default: return 'info'
  }
}

const getLevelClass = (level: string) => {
  return `log-level-${level}`
}

const getLevelText = (level: string) => {
  switch (level) {
    case 'error': return '错误'
    case 'warning': return '警告'
    case 'info': return '信息'
    case 'debug': return '调试'
    default: return level.toUpperCase()
  }
}

const getMessageClass = (level: string) => {
  return `message-${level}`
}

const showDetails = (log: SystemLog) => {
  selectedLog.value = log
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
.system-logs-table {
  width: 100%;
}

.log-level-error {
  animation: pulse-error 2s infinite;
}

@keyframes pulse-error {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.log-timestamp {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.log-message {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.message-error {
  color: var(--el-color-danger);
}

.message-warning {
  color: var(--el-color-warning);
}

.message-info {
  color: var(--el-text-color-primary);
}

.message-debug {
  color: var(--el-text-color-secondary);
}

.user-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-color-primary);
}

.ip-address {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.text-muted {
  color: var(--el-text-color-placeholder);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.log-detail {
  padding: 16px 0;
}

.log-message-detail {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--el-color-info-light-9);
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-details-json {
  background: var(--el-color-info-light-9);
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
}

.log-details-json pre {
  margin: 0;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

:deep(.log-row.el-table__row--striped) {
  background-color: var(--el-table-row-hover-bg-color);
}

:deep(.log-row:hover) {
  background-color: var(--el-color-primary-light-9);
}

@media (max-width: 768px) {
  .log-message {
    font-size: 12px;
  }
  
  .log-timestamp {
    font-size: 11px;
  }
  
  .log-details-json {
    max-height: 200px;
  }
}
</style>