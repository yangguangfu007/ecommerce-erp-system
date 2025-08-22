<template>
  <div class="query-result">
    <!-- 结果头部 -->
    <div class="result-header">
      <div class="result-info">
        <h3 class="result-title">查询结果</h3>
        <div class="result-stats">
          <el-tag v-if="loading" type="info">查询中...</el-tag>
          <el-tag v-else-if="data.length" type="success">
            共 {{ pagination.total }} 条记录
          </el-tag>
          <el-tag v-else type="warning">暂无数据</el-tag>
          
          <span v-if="queryTime" class="query-time">
            查询耗时: {{ queryTime }}ms
          </span>
        </div>
      </div>
      
      <div class="result-actions">
        <el-button @click="refreshData" :loading="loading" size="small">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="showColumnSettings = true" size="small">
          <el-icon><Setting /></el-icon>
          列设置
        </el-button>
        <el-button @click="exportData" :disabled="!data.length" size="small">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="result-table">
      <el-table
        ref="tableRef"
        :data="data"
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

    <!-- 列设置对话框 -->
    <el-dialog
      v-model="showColumnSettings"
      title="列设置"
      width="600px"
    >
      <div class="column-settings">
        <div class="settings-header">
          <el-button @click="selectAllColumns" size="small">全选</el-button>
          <el-button @click="deselectAllColumns" size="small">全不选</el-button>
          <el-button @click="resetColumnSettings" size="small">重置</el-button>
        </div>
        
        <el-table
          :data="allColumns"
          border
          max-height="400"
        >
          <el-table-column width="55">
            <template #default="{ row }">
              <el-checkbox
                v-model="row.visible"
                @change="onColumnVisibilityChange"
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="label" label="列名" />
          
          <el-table-column label="宽度" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.width"
                :min="80"
                :max="500"
                size="small"
                controls-position="right"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="排序" width="100">
            <template #default="{ row, $index }">
              <div class="sort-buttons">
                <el-button
                  @click="moveColumnUp($index)"
                  :disabled="$index === 0"
                  size="small"
                  text
                >
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button
                  @click="moveColumnDown($index)"
                  :disabled="$index === allColumns.length - 1"
                  size="small"
                  text
                >
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="showColumnSettings = false">取消</el-button>
        <el-button @click="applyColumnSettings" type="primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Setting,
  Download,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

// 单元格组件
import CellText from './cells/CellText.vue'
import CellNumber from './cells/CellNumber.vue'
import CellDate from './cells/CellDate.vue'
import CellStatus from './cells/CellStatus.vue'
import CellImage from './cells/CellImage.vue'

// 组件属性
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
  queryTime: 0
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
const showColumnSettings = ref(false)
const selectedRows = ref<any[]>([])
const allColumns = ref<Column[]>([])

// 计算属性
const visibleColumns = computed(() => {
  return allColumns.value.filter(col => col.visible !== false)
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
  emit('refresh')
}

const exportData = () => {
  emit('export', selectedRows.value)
}

const onSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selectionChange', selection)
}

const onSortChange = ({ prop, order }: { prop: string; order: string }) => {
  const sortOrder = order === 'ascending' ? 'asc' : 'desc'
  emit('sortChange', prop, sortOrder)
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

// 列设置相关方法
const selectAllColumns = () => {
  allColumns.value.forEach(col => {
    col.visible = true
  })
}

const deselectAllColumns = () => {
  allColumns.value.forEach(col => {
    col.visible = false
  })
}

const resetColumnSettings = () => {
  allColumns.value = props.columns.map(col => ({ ...col, visible: true }))
}

const onColumnVisibilityChange = () => {
  // 列可见性变更处理
}

const moveColumnUp = (index: number) => {
  if (index > 0) {
    const temp = allColumns.value[index]
    allColumns.value[index] = allColumns.value[index - 1]
    allColumns.value[index - 1] = temp
  }
}

const moveColumnDown = (index: number) => {
  if (index < allColumns.value.length - 1) {
    const temp = allColumns.value[index]
    allColumns.value[index] = allColumns.value[index + 1]
    allColumns.value[index + 1] = temp
  }
}

const applyColumnSettings = () => {
  showColumnSettings.value = false
  ElMessage.success('列设置已应用')
}

// 监听器
watch(() => props.columns, (newColumns) => {
  allColumns.value = newColumns.map(col => ({ ...col, visible: col.visible !== false }))
}, { immediate: true, deep: true })

// 暴露方法
defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => tableRef.value?.toggleRowSelection(row, selected),
  getSelectedRows: () => selectedRows.value
})
</script><s
tyle scoped>
.query-result {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  overflow: hidden;
}

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

.query-time {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.result-table {
  padding: var(--spacing-lg);
}

.result-pagination {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-color-secondary);
}

/* 列设置对话框 */
.column-settings {
  max-height: 500px;
}

.settings-header {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

.sort-buttons {
  display: flex;
  gap: var(--spacing-xs);
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
}
</style>