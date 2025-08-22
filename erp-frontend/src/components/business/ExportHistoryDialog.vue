<template>
  <el-dialog
    v-model="visible"
    title="导出历史"
    width="800px"
    @close="handleClose"
  >
    <div class="history-container">
      <!-- 统计信息 -->
      <div class="history-stats">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-statistic title="总导出次数" :value="totalExports" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="成功次数" :value="successfulExports" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="失败次数" :value="failedExports" />
          </el-col>
        </el-row>
      </div>

      <!-- 操作栏 -->
      <div class="history-actions">
        <div class="filter-section">
          <el-select
            v-model="statusFilter"
            placeholder="筛选状态"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
          
          <el-select
            v-model="formatFilter"
            placeholder="筛选格式"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="Excel" value="excel" />
            <el-option label="CSV" value="csv" />
            <el-option label="PDF" value="pdf" />
            <el-option label="JSON" value="json" />
          </el-select>
          
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文件名..."
            style="width: 200px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="action-section">
          <el-button 
            type="danger" 
            :icon="Delete"
            @click="handleClearAll"
            :disabled="filteredHistory.length === 0"
          >
            清空历史
          </el-button>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div class="history-list">
        <el-table
          :data="paginatedHistory"
          stripe
          @sort-change="handleSortChange"
        >
          <el-table-column label="文件名" prop="filename" sortable>
            <template #default="{ row }">
              <div class="filename-cell">
                <el-icon class="file-icon">
                  <component :is="getFormatIcon(row.format)" />
                </el-icon>
                <span class="filename">{{ row.filename }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="格式" prop="format" width="80" sortable>
            <template #default="{ row }">
              <el-tag :type="getFormatTagType(row.format)" size="small">
                {{ getFormatDisplayName(row.format) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" prop="status" width="80" sortable>
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'success' ? 'success' : 'danger'" 
                size="small"
              >
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="记录数" prop="recordCount" width="100" sortable>
            <template #default="{ row }">
              {{ row.recordCount.toLocaleString() }}
            </template>
          </el-table-column>
          
          <el-table-column label="文件大小" prop="fileSize" width="100" sortable>
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          
          <el-table-column label="导出时间" prop="exportTime" width="160" sortable>
            <template #default="{ row }">
              {{ formatTime(row.exportTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="重新导出" placement="top">
                  <el-button
                    type="primary"
                    :icon="Refresh"
                    size="small"
                    circle
                    @click="handleReExport(row)"
                  />
                </el-tooltip>
                
                <el-tooltip content="删除记录" placement="top">
                  <el-button
                    type="danger"
                    :icon="Delete"
                    size="small"
                    circle
                    @click="handleDelete(row)"
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 -->
        <div v-if="filteredHistory.length === 0" class="empty-state">
          <el-empty description="暂无导出历史记录" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="history-pagination" v-if="filteredHistory.length > pageSize">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="filteredHistory.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Delete, 
  Refresh,
  Document,
  Grid,
  Printer,
  DataBoard
} from '@element-plus/icons-vue'
import { ExportFormat } from '@/utils/export'
import type { ExportHistory } from '@/composables/useExport'

interface Props {
  modelValue: boolean
  history: ExportHistory[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'reExport': [id: string]
  'clearHistory': []
  'deleteRecord': [id: string]
}>()

// 状态
const statusFilter = ref('')
const formatFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref('')
const sortOrder = ref('')

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const totalExports = computed(() => props.history.length)
const successfulExports = computed(() => 
  props.history.filter(item => item.status === 'success').length
)
const failedExports = computed(() => 
  props.history.filter(item => item.status === 'failed').length
)

const filteredHistory = computed(() => {
  let filtered = props.history

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  // 格式筛选
  if (formatFilter.value) {
    filtered = filtered.filter(item => item.format === formatFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.filename.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (sortField.value) {
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sortField.value as keyof ExportHistory]
      const bValue = b[sortField.value as keyof ExportHistory]
      
      let result = 0
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) result = -1
        else if (aValue > bValue) result = 1
      }
      
      return sortOrder.value === 'descending' ? -result : result
    })
  }

  return filtered
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

// 方法
const getFormatIcon = (format: ExportFormat) => {
  const iconMap = {
    [ExportFormat.EXCEL]: Grid,
    [ExportFormat.CSV]: Document,
    [ExportFormat.PDF]: Printer,
    [ExportFormat.JSON]: DataBoard
  }
  return iconMap[format] || Document
}

const getFormatTagType = (format: ExportFormat) => {
  const typeMap = {
    [ExportFormat.EXCEL]: 'success',
    [ExportFormat.CSV]: 'info',
    [ExportFormat.PDF]: 'warning',
    [ExportFormat.JSON]: 'primary'
  }
  return typeMap[format] || 'info'
}

const getFormatDisplayName = (format: ExportFormat) => {
  const nameMap = {
    [ExportFormat.EXCEL]: 'Excel',
    [ExportFormat.CSV]: 'CSV',
    [ExportFormat.PDF]: 'PDF',
    [ExportFormat.JSON]: 'JSON'
  }
  return nameMap[format] || format
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timeString: string): string => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortField.value = prop
  sortOrder.value = order
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleReExport = (record: ExportHistory) => {
  emit('reExport', record.id)
}

const handleDelete = async (record: ExportHistory) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除导出记录 "${record.filename}" 吗？`,
      '确认删除',
      {
        type: 'warning'
      }
    )
    
    emit('deleteRecord', record.id)
    ElMessage.success('记录已删除')
  } catch {
    // 用户取消操作
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有导出历史记录吗？此操作不可恢复。',
      '确认清空',
      {
        type: 'warning'
      }
    )
    
    emit('clearHistory')
  } catch {
    // 用户取消操作
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.history-container {
  padding: 0;
}

.history-stats {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.history-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.filter-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-section {
  display: flex;
  gap: 12px;
}

.history-list {
  margin-bottom: 16px;
}

.filename-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: var(--el-color-primary);
}

.filename {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 40px 0;
}

.history-pagination {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: 600;
}

:deep(.el-statistic__title) {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
</style>