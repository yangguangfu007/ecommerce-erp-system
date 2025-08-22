<template>
  <div class="cached-query-result">
    <!-- 结果头部 -->
    <div class="result-header">
      <div class="result-info">
        <h3 class="result-title">查询结果</h3>
        <div class="result-stats">
          <el-tag v-if="loading" type="info">
            <el-icon class="is-loading"><Loading /></el-icon>
            查询中...
          </el-tag>
          <el-tag v-else-if="data.length" type="success">
            共 {{ pagination.total }} 条记录
          </el-tag>
          <el-tag v-else type="warning">暂无数据</el-tag>
          
          <span v-if="queryTime" class="query-time">
            查询耗时: {{ queryTime }}ms
          </span>
          
          <span v-if="cacheInfo.enabled" class="cache-info">
            <el-icon><Database /></el-icon>
            {{ cacheInfo.hit ? '缓存命中' : '实时查询' }}
          </span>
        </div>
      </div>
      
      <div class="result-actions">
        <el-button @click="refreshData" :loading="loading" size="small">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="toggleCacheSettings" size="small">
          <el-icon><Setting /></el-icon>
          缓存设置
        </el-button>
        <el-button @click="exportData" :disabled="!data.length" size="small">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 缓存设置面板 -->
    <el-collapse-transition>
      <div v-show="showCacheSettings" class="cache-settings-panel">
        <div class="cache-settings-content">
          <h4>缓存配置</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="启用缓存">
                <el-switch
                  v-model="cacheConfig.enabled"
                  @change="onCacheConfigChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="缓存时间(分钟)">
                <el-input-number
                  v-model="cacheConfig.ttl"
                  :min="1"
                  :max="1440"
                  @change="onCacheConfigChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大缓存条数">
                <el-input-number
                  v-model="cacheConfig.maxSize"
                  :min="100"
                  :max="10000"
                  :step="100"
                  @change="onCacheConfigChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <div class="cache-stats">
            <el-descriptions :column="4" border size="small">
              <el-descriptions-item label="缓存命中率">
                {{ cacheStats.hitRate }}%
              </el-descriptions-item>
              <el-descriptions-item label="缓存大小">
                {{ cacheStats.size }} / {{ cacheConfig.maxSize }}
              </el-descriptions-item>
              <el-descriptions-item label="最后更新">
                {{ formatDateTime(cacheStats.lastUpdate) }}
              </el-descriptions-item>
              <el-descriptions-item label="操作">
                <el-button @click="clearCache" type="danger" size="small">
                  清空缓存
                </el-button>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
    </el-collapse-transition>    <!
-- 数据表格 -->
    <div class="result-table">
      <el-table
        ref="tableRef"
        :data="paginatedData"
        :loading="loading"
        border
        stripe
        height="500"
        @selection-change="onSelectionChange"
        @sort-change="onSortChange"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="selectable"
          type="selection"
          width="55"
          fixed="left"
        />
        
        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="80"
          fixed="left"
          :index="getRowIndex"
        />
        
        <!-- 数据列 -->
        <el-table-column
          v-for="column in visibleColumns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth || 120"
          :sortable="column.sortable ? 'custom' : false"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <component
              :is="getCellComponent(column)"
              :value="row[column.key]"
              :column="column"
              :row="row"
            />
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column
          v-if="showActions"
          label="操作"
          width="120"
          fixed="right"
        >
          <template #default="{ row, $index }">
            <el-button
              @click="viewDetail(row)"
              type="primary"
              size="small"
              text
            >
              查看
            </el-button>
            <el-button
              @click="editRow(row)"
              type="warning"
              size="small"
              text
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div v-if="showPagination && pagination.total > 0" class="result-pagination">
      <div class="pagination-info">
        <span>
          显示第 {{ startRecord }}-{{ endRecord }} 条，共 {{ pagination.total }} 条记录
        </span>
        <span v-if="cacheInfo.enabled" class="cache-indicator">
          <el-icon><Database /></el-icon>
          {{ cacheInfo.hit ? '来自缓存' : '实时数据' }}
        </span>
      </div>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="pageSizes"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <!-- 导出对话框 -->
    <ExportDialog
      v-model="showExportDialog"
      :data="selectedRows.length ? selectedRows : data"
      :columns="exportColumns"
      :title="exportTitle"
      :default-filename="exportFilename"
      @exported="handleExported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading,
  Database,
  Refresh,
  Setting,
  Download
} from '@element-plus/icons-vue'

// 导入组件
import { ExportDialog } from '@/components/business'
import CellText from './cells/CellText.vue'
import CellNumber from './cells/CellNumber.vue'
import CellDate from './cells/CellDate.vue'
import CellStatus from './cells/CellStatus.vue'
import CellImage from './cells/CellImage.vue'

// 接口定义
interface Column {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'status' | 'image'
  width?: number
  minWidth?: number
  sortable?: boolean
  visible?: boolean
  formatter?: (value: any) => string
}

interface Pagination {
  page: number
  size: number
  total: number
}

interface CacheConfig {
  enabled: boolean
  ttl: number // 缓存时间（分钟）
  maxSize: number // 最大缓存条数
}

interface CacheInfo {
  enabled: boolean
  hit: boolean
  key: string
  timestamp: number
}

interface CacheStats {
  size: number
  hitRate: number
  lastUpdate: string
}

interface CacheItem {
  key: string
  data: any[]
  timestamp: number
  conditions: any
}

// 组件属性
const props = withDefaults(defineProps<{
  data?: any[]
  columns?: Column[]
  loading?: boolean
  pagination?: Pagination
  selectable?: boolean
  showIndex?: boolean
  showActions?: boolean
  showPagination?: boolean
  pageSizes?: number[]
  queryTime?: number
  cacheKey?: string
  exportTitle?: string
  exportFilename?: string
}>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  pagination: () => ({ page: 1, size: 20, total: 0 }),
  selectable: false,
  showIndex: true,
  showActions: true,
  showPagination: true,
  pageSizes: () => [10, 20, 50, 100, 200],
  queryTime: 0,
  cacheKey: 'cached-query-result',
  exportTitle: '查询结果',
  exportFilename: 'query-result'
})

// 事件定义
const emit = defineEmits<{
  refresh: []
  export: [selectedRows: any[]]
  pageChange: [page: number, size: number]
  sortChange: [field: string, order: string]
  selectionChange: [selectedRows: any[]]
  viewDetail: [row: any]
  editRow: [row: any]
}>()

// 响应式数据
const tableRef = ref()
const showCacheSettings = ref(false)
const showExportDialog = ref(false)
const selectedRows = ref<any[]>([])
const sortField = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const cacheConfig = reactive<CacheConfig>({
  enabled: true,
  ttl: 30, // 30分钟
  maxSize: 1000
})

const cacheInfo = reactive<CacheInfo>({
  enabled: false,
  hit: false,
  key: '',
  timestamp: 0
})

const cacheStats = reactive<CacheStats>({
  size: 0,
  hitRate: 0,
  lastUpdate: ''
})

// 缓存存储
const cacheStorage = new Map<string, CacheItem>()
let cacheCleanupTimer: number | null = null//
 计算属性
const visibleColumns = computed(() => {
  return props.columns.filter(col => col.visible !== false)
})

const paginatedData = computed(() => {
  if (!props.showPagination) return props.data
  
  const start = (props.pagination.page - 1) * props.pagination.size
  const end = start + props.pagination.size
  
  let sortedData = [...props.data]
  
  // 客户端排序
  if (sortField.value) {
    sortedData.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      if (aVal === bVal) return 0
      
      const result = aVal > bVal ? 1 : -1
      return sortOrder.value === 'asc' ? result : -result
    })
  }
  
  return sortedData.slice(start, end)
})

const startRecord = computed(() => {
  return (props.pagination.page - 1) * props.pagination.size + 1
})

const endRecord = computed(() => {
  return Math.min(props.pagination.page * props.pagination.size, props.pagination.total)
})

const exportColumns = computed(() => {
  return visibleColumns.value.map(col => ({
    key: col.key,
    title: col.label,
    width: col.width
  }))
})

// 方法
const getRowIndex = (index: number) => {
  return (props.pagination.page - 1) * props.pagination.size + index + 1
}

const getCellComponent = (column: Column) => {
  switch (column.type) {
    case 'number':
      return CellNumber
    case 'date':
      return CellDate
    case 'status':
      return CellStatus
    case 'image':
      return CellImage
    default:
      return CellText
  }
}

const refreshData = () => {
  // 清除相关缓存
  if (cacheInfo.key) {
    cacheStorage.delete(cacheInfo.key)
    updateCacheStats()
  }
  
  emit('refresh')
}

const exportData = () => {
  showExportDialog.value = true
}

const handleExported = () => {
  ElMessage.success('数据导出成功')
}

const onSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selectionChange', selection)
}

const onSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortField.value = prop
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  
  const sortOrderValue = order === 'ascending' ? 'asc' : 'desc'
  emit('sortChange', prop, sortOrderValue)
}

const onPageChange = (page: number) => {
  emit('pageChange', page, props.pagination.size)
}

const onPageSizeChange = (size: number) => {
  emit('pageChange', 1, size)
}

const viewDetail = (row: any) => {
  emit('viewDetail', row)
}

const editRow = (row: any) => {
  emit('editRow', row)
}

const toggleCacheSettings = () => {
  showCacheSettings.value = !showCacheSettings.value
}

const onCacheConfigChange = () => {
  // 保存缓存配置到本地存储
  saveCacheConfig()
  
  // 如果禁用缓存，清空所有缓存
  if (!cacheConfig.enabled) {
    clearCache()
  }
}

const generateCacheKey = (conditions: any): string => {
  return `${props.cacheKey}_${JSON.stringify(conditions)}`
}

const getCachedData = (conditions: any): CacheItem | null => {
  if (!cacheConfig.enabled) return null
  
  const key = generateCacheKey(conditions)
  const cached = cacheStorage.get(key)
  
  if (!cached) return null
  
  // 检查缓存是否过期
  const now = Date.now()
  const ttlMs = cacheConfig.ttl * 60 * 1000
  
  if (now - cached.timestamp > ttlMs) {
    cacheStorage.delete(key)
    updateCacheStats()
    return null
  }
  
  return cached
}

const setCachedData = (conditions: any, data: any[]) => {
  if (!cacheConfig.enabled) return
  
  const key = generateCacheKey(conditions)
  const cacheItem: CacheItem = {
    key,
    data: [...data],
    timestamp: Date.now(),
    conditions: { ...conditions }
  }
  
  // 检查缓存大小限制
  if (cacheStorage.size >= cacheConfig.maxSize) {
    // 删除最旧的缓存项
    const oldestKey = Array.from(cacheStorage.keys())[0]
    cacheStorage.delete(oldestKey)
  }
  
  cacheStorage.set(key, cacheItem)
  updateCacheStats()
}

const clearCache = () => {
  cacheStorage.clear()
  updateCacheStats()
  ElMessage.success('缓存已清空')
}

const updateCacheStats = () => {
  cacheStats.size = cacheStorage.size
  
  // 计算命中率（这里简化处理）
  const totalRequests = parseInt(localStorage.getItem(`${props.cacheKey}_total_requests`) || '0')
  const cacheHits = parseInt(localStorage.getItem(`${props.cacheKey}_cache_hits`) || '0')
  
  cacheStats.hitRate = totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0
  cacheStats.lastUpdate = new Date().toLocaleString()
}

const startCacheCleanup = () => {
  // 定期清理过期缓存
  cacheCleanupTimer = window.setInterval(() => {
    const now = Date.now()
    const ttlMs = cacheConfig.ttl * 60 * 1000
    
    for (const [key, item] of cacheStorage.entries()) {
      if (now - item.timestamp > ttlMs) {
        cacheStorage.delete(key)
      }
    }
    
    updateCacheStats()
  }, 5 * 60 * 1000) // 每5分钟清理一次
}

const stopCacheCleanup = () => {
  if (cacheCleanupTimer) {
    clearInterval(cacheCleanupTimer)
    cacheCleanupTimer = null
  }
}

const saveCacheConfig = () => {
  try {
    localStorage.setItem(`${props.cacheKey}_config`, JSON.stringify(cacheConfig))
  } catch (error) {
    console.error('保存缓存配置失败:', error)
  }
}

const loadCacheConfig = () => {
  try {
    const stored = localStorage.getItem(`${props.cacheKey}_config`)
    if (stored) {
      Object.assign(cacheConfig, JSON.parse(stored))
    }
  } catch (error) {
    console.error('加载缓存配置失败:', error)
  }
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 监听器
watch(() => props.data, (newData) => {
  if (newData.length > 0 && cacheInfo.key) {
    // 更新缓存数据
    const cached = cacheStorage.get(cacheInfo.key)
    if (cached) {
      cached.data = [...newData]
      cached.timestamp = Date.now()
    }
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  loadCacheConfig()
  updateCacheStats()
  startCacheCleanup()
})

onUnmounted(() => {
  stopCacheCleanup()
})

// 暴露方法
defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => tableRef.value?.toggleRowSelection(row, selected),
  getSelectedRows: () => selectedRows.value,
  getCachedData,
  setCachedData,
  clearCache,
  updateCacheInfo: (info: Partial<CacheInfo>) => Object.assign(cacheInfo, info)
})
</script><style
 scoped>
.cached-query-result {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  overflow: hidden;
}

/* 结果头部 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
  background: var(--bg-color-secondary);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-title {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: 500;
  color: var(--text-color-primary);
}

.result-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.query-time,
.cache-info {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 缓存设置面板 */
.cache-settings-panel {
  padding: var(--spacing-lg);
  background: var(--bg-color-tertiary);
  border-bottom: 1px solid var(--border-color-light);
}

.cache-settings-content h4 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-medium);
  color: var(--text-color-primary);
}

.cache-stats {
  margin-top: var(--spacing-lg);
}

/* 数据表格 */
.result-table {
  padding: var(--spacing-lg);
}

/* 分页 */
.result-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-color-secondary);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.cache-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px 8px;
  background: var(--success-color-light);
  color: var(--success-color-dark);
  border-radius: var(--border-radius-small);
  font-size: var(--font-size-small);
}

/* 加载动画 */
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .result-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .result-stats {
    flex-wrap: wrap;
  }
  
  .result-pagination {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .pagination-info {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .cached-query-result {
    background: var(--bg-color-dark-primary);
  }
  
  .result-header,
  .result-pagination {
    background: var(--bg-color-dark-secondary);
    border-color: var(--border-color-dark);
  }
  
  .cache-settings-panel {
    background: var(--bg-color-dark-tertiary);
    border-color: var(--border-color-dark);
  }
}
</style>