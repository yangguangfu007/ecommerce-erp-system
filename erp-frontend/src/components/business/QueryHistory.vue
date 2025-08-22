<template>
  <div class="query-history">
    <div class="history-header">
      <h4 class="history-title">查询历史</h4>
      <div class="history-actions">
        <el-button @click="clearHistory" size="small" type="danger" text>
          <el-icon><Delete /></el-icon>
          清空历史
        </el-button>
      </div>
    </div>

    <div class="history-list">
      <div
        v-for="(item, index) in historyList"
        :key="index"
        class="history-item"
        @click="applyHistory(item)"
      >
        <div class="history-info">
          <div class="history-name">{{ item.name }}</div>
          <div class="history-summary">
            <span class="data-source">{{ getDataSourceLabel(item.dataSource) }}</span>
            <span class="field-count">{{ item.selectedFields.length }} 个字段</span>
            <span class="filter-count" v-if="item.filterCount">
              {{ item.filterCount }} 个筛选条件
            </span>
          </div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
        
        <div class="history-actions">
          <el-button
            @click.stop="editHistory(item, index)"
            size="small"
            type="primary"
            text
          >
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button
            @click.stop="deleteHistory(index)"
            size="small"
            type="danger"
            text
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div v-if="!historyList.length" class="history-empty">
        <el-empty description="暂无查询历史" :image-size="80" />
      </div>
    </div>

    <!-- 编辑历史对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑查询历史"
      width="400px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input
            v-model="editForm.name"
            placeholder="请输入查询名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button @click="saveEdit" type="primary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'

// 查询历史项接口
interface QueryHistoryItem {
  name: string
  dataSource: string
  selectedFields: string[]
  filters: any
  sortField: string
  sortOrder: string
  pageSize: number
  timestamp: number
  filterCount?: number
}

// 组件属性
const props = withDefaults(defineProps<{
  maxHistory?: number
  storageKey?: string
  dataSources?: Array<{ label: string; value: string }>
}>(), {
  maxHistory: 20,
  storageKey: 'query-history',
  dataSources: () => [
    { label: '订单数据', value: 'orders' },
    { label: '商品数据', value: 'products' },
    { label: '库存数据', value: 'inventory' },
    { label: '用户数据', value: 'users' }
  ]
})

// 事件定义
const emit = defineEmits<{
  apply: [item: QueryHistoryItem]
}>()

// 响应式数据
const historyList = ref<QueryHistoryItem[]>([])
const showEditDialog = ref(false)
const editForm = reactive({
  name: '',
  index: -1
})

// 计算属性
const getDataSourceLabel = computed(() => {
  return (value: string) => {
    const source = props.dataSources.find(s => s.value === value)
    return source?.label || value
  }
})

// 方法
const loadHistory = () => {
  try {
    const stored = localStorage.getItem(props.storageKey)
    if (stored) {
      historyList.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载查询历史失败:', error)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(historyList.value))
  } catch (error) {
    console.error('保存查询历史失败:', error)
  }
}

const addHistory = (queryConfig: any, customName?: string) => {
  // 计算筛选条件数量
  let filterCount = 0
  if (queryConfig.filters) {
    if (queryConfig.filters.keyword) filterCount++
    if (queryConfig.filters.advanced?.length) filterCount += queryConfig.filters.advanced.length
    
    // 计算基础筛选器数量
    Object.keys(queryConfig.filters).forEach(key => {
      if (key !== 'keyword' && key !== 'advanced' && queryConfig.filters[key]) {
        filterCount++
      }
    })
  }

  const historyItem: QueryHistoryItem = {
    name: customName || `查询_${new Date().toLocaleString()}`,
    dataSource: queryConfig.dataSource,
    selectedFields: [...queryConfig.selectedFields],
    filters: { ...queryConfig.filters },
    sortField: queryConfig.sortField || '',
    sortOrder: queryConfig.sortOrder || 'asc',
    pageSize: queryConfig.pageSize || 50,
    timestamp: Date.now(),
    filterCount
  }

  // 检查是否已存在相同的查询
  const existingIndex = historyList.value.findIndex(item =>
    item.dataSource === historyItem.dataSource &&
    JSON.stringify(item.selectedFields) === JSON.stringify(historyItem.selectedFields) &&
    JSON.stringify(item.filters) === JSON.stringify(historyItem.filters)
  )

  if (existingIndex > -1) {
    // 更新现有项的时间戳
    historyList.value[existingIndex].timestamp = historyItem.timestamp
    historyList.value[existingIndex].name = historyItem.name
  } else {
    // 添加新项
    historyList.value.unshift(historyItem)
    
    // 限制历史记录数量
    if (historyList.value.length > props.maxHistory) {
      historyList.value = historyList.value.slice(0, props.maxHistory)
    }
  }

  saveHistory()
}

const applyHistory = (item: QueryHistoryItem) => {
  emit('apply', item)
  ElMessage.success('已应用查询历史')
}

const editHistory = (item: QueryHistoryItem, index: number) => {
  editForm.name = item.name
  editForm.index = index
  showEditDialog.value = true
}

const saveEdit = () => {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入查询名称')
    return
  }

  if (editForm.index >= 0 && editForm.index < historyList.value.length) {
    historyList.value[editForm.index].name = editForm.name.trim()
    saveHistory()
    ElMessage.success('修改成功')
  }

  showEditDialog.value = false
}

const deleteHistory = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条查询历史吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    historyList.value.splice(index, 1)
    saveHistory()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有查询历史吗？',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    historyList.value = []
    saveHistory()
    ElMessage.success('历史记录已清空')
  } catch {
    // 用户取消清空
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 生命周期
onMounted(() => {
  loadHistory()
})

// 暴露方法
defineExpose({
  addHistory,
  clearHistory,
  getHistory: () => historyList.value
})
</script>

<style scoped>
.query-history {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-light);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
  background: var(--bg-color-secondary);
}

.history-title {
  margin: 0;
  font-size: var(--font-size-medium);
  font-weight: 500;
  color: var(--text-color-primary);
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-lighter);
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background: var(--bg-color-secondary);
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  font-weight: 500;
  color: var(--text-color-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-summary {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.history-summary span {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  background: var(--bg-color-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-small);
}

.history-time {
  font-size: var(--font-size-small);
  color: var(--text-color-placeholder);
}

.history-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.3s;
}

.history-item:hover .history-actions {
  opacity: 1;
}

.history-empty {
  padding: var(--spacing-xl);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .history-actions {
    opacity: 1;
    align-self: flex-end;
  }
  
  .history-summary {
    flex-wrap: wrap;
  }
}
</style>