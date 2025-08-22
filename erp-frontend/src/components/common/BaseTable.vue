<!-- 基础数据表格组件 -->
<template>
  <div class="data-table-container" :class="containerClasses">
    <!-- 表格头部 -->
    <div v-if="showHeader" class="table-header">
      <div class="table-title">
        <h3 v-if="title">{{ title }}</h3>
        <div v-if="showCount" class="table-count">
          共 {{ total }} 条记录
        </div>
      </div>
      <div class="table-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- 表格筛选 -->
    <div v-if="showFilters" class="table-filters">
      <slot name="filters"></slot>
    </div>
    
    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-actions" :data-count="selectedRows.length">
      <slot name="batch-actions" :selectedRows="selectedRows">
        <base-button size="small" type="danger" @click="handleBatchDelete">
          批量删除
        </base-button>
      </slot>
    </div>
    
    <!-- 表格内容 -->
    <div class="table-wrapper">
      <table class="data-table" :class="tableClasses">
        <!-- 表头 -->
        <thead>
          <tr>
            <!-- 全选复选框 -->
            <th v-if="selectable" class="selection-column">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
              />
            </th>
            <!-- 数据列 -->
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClasses(column)"
              :style="getColumnStyle(column)"
              @click="handleSort(column)"
            >
              <div class="column-header">
                <span>{{ column.title }}</span>
                <i
                  v-if="column.sortable"
                  :class="getSortIconClass(column.key)"
                  class="sort-icon"
                ></i>
              </div>
            </th>
            <!-- 操作列 -->
            <th v-if="$slots.actions" class="actions-column">操作</th>
          </tr>
        </thead>
        
        <!-- 表体 -->
        <tbody>
          <tr
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            :class="getRowClasses(row, index)"
            @click="handleRowClick(row, index)"
          >
            <!-- 选择列 -->
            <td v-if="selectable" class="selection-column">
              <input
                type="checkbox"
                :checked="isRowSelected(row)"
                @change="handleRowSelect(row, $event)"
                @click.stop
              />
            </td>
            <!-- 数据列 -->
            <td
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClasses(column)"
              :style="getColumnStyle(column)"
            >
              <slot
                :name="column.key"
                :row="row"
                :column="column"
                :index="index"
                :value="getColumnValue(row, column.key)"
              >
                {{ getColumnValue(row, column.key) }}
              </slot>
            </td>
            <!-- 操作列 -->
            <td v-if="$slots.actions" class="actions-column">
              <div class="row-actions">
                <slot name="actions" :row="row" :index="index"></slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 空状态 -->
      <div v-if="data.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-inbox"></i>
        </div>
        <div class="empty-title">暂无数据</div>
        <div class="empty-description">{{ emptyText }}</div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <div>加载中...</div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="showPagination" class="table-pagination">
      <div class="pagination-info">
        显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
      </div>
      <div class="pagination-controls">
        <base-button
          size="small"
          :disabled="currentPage <= 1"
          @click="handlePageChange(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </base-button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: page === currentPage }]"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <base-button
          size="small"
          :disabled="currentPage >= totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </base-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseButton from './BaseButton.vue'

interface TableColumn {
  key: string
  title: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: 'left' | 'right'
  ellipsis?: boolean
}

interface Props {
  /** 表格数据 */
  data?: any[]
  /** 表格列配置 */
  columns?: TableColumn[]
  /** 表格标题 */
  title?: string
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示筛选 */
  showFilters?: boolean
  /** 是否显示数量 */
  showCount?: boolean
  /** 是否可选择 */
  selectable?: boolean
  /** 是否显示分页 */
  showPagination?: boolean
  /** 当前页码 */
  currentPage?: number
  /** 每页条数 */
  pageSize?: number
  /** 总条数 */
  total?: number
  /** 是否加载中 */
  loading?: boolean
  /** 空状态文本 */
  emptyText?: string
  /** 行键字段 */
  rowKey?: string
  /** 表格尺寸 */
  size?: 'small' | 'default' | 'large'
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示斑马纹 */
  striped?: boolean
  /** 排序字段 */
  sortField?: string
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  showHeader: true,
  showFilters: false,
  showCount: true,
  selectable: false,
  showPagination: true,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  loading: false,
  emptyText: '暂无数据',
  rowKey: 'id',
  size: 'default',
  bordered: true,
  striped: true
})

interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'update:sortField', field: string): void
  (e: 'update:sortOrder', order: 'asc' | 'desc'): void
  (e: 'page-change', page: number): void
  (e: 'sort-change', field: string, order: 'asc' | 'desc'): void
  (e: 'selection-change', selectedRows: any[]): void
  (e: 'row-click', row: any, index: number): void
  (e: 'batch-delete', selectedRows: any[]): void
}

const emit = defineEmits<Emits>()

const selectedRows = ref<any[]>([])

// 计算容器样式类
const containerClasses = computed(() => {
  return {
    loading: props.loading
  }
})

// 计算表格样式类
const tableClasses = computed(() => {
  return {
    [`table-${props.size}`]: props.size !== 'default',
    'table-bordered': props.bordered,
    'table-striped': props.striped
  }
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

// 计算可见页码
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = props.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // 省略号
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1) // 省略号
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push(-1) // 省略号
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // 省略号
      pages.push(total)
    }
  }
  
  return pages
})

// 计算全选状态
const isAllSelected = computed(() => {
  return props.data.length > 0 && selectedRows.value.length === props.data.length
})

// 计算半选状态
const isIndeterminate = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.length < props.data.length
})

// 获取行键值
const getRowKey = (row: any, index: number) => {
  return row[props.rowKey] || index
}

// 获取列值
const getColumnValue = (row: any, key: string) => {
  if (!key || typeof key !== 'string') return ''
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

// 获取列样式类
const getColumnClasses = (column: TableColumn) => {
  return {
    [`text-${column.align}`]: column.align,
    'sortable': column.sortable,
    'ellipsis': column.ellipsis,
    [`fixed-${column.fixed}`]: column.fixed
  }
}

// 获取列样式
const getColumnStyle = (column: TableColumn) => {
  const style: any = {}
  if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width
  }
  if (column.minWidth) {
    style.minWidth = typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth
  }
  return style
}

// 获取行样式类
const getRowClasses = (row: any, index: number) => {
  return {
    selected: isRowSelected(row),
    'row-clickable': true
  }
}

// 获取排序图标类
const getSortIconClass = (key: string) => {
  if (props.sortField !== key) {
    return 'fas fa-sort'
  }
  return props.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

// 判断行是否被选中
const isRowSelected = (row: any) => {
  return selectedRows.value.some(selectedRow => 
    getRowKey(selectedRow, -1) === getRowKey(row, -1)
  )
}

// 处理全选
const handleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedRows.value = [...props.data]
  } else {
    selectedRows.value = []
  }
  emit('selection-change', selectedRows.value)
}

// 处理行选择
const handleRowSelect = (row: any, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedRows.value.push(row)
  } else {
    const index = selectedRows.value.findIndex(selectedRow => 
      getRowKey(selectedRow, -1) === getRowKey(row, -1)
    )
    if (index > -1) {
      selectedRows.value.splice(index, 1)
    }
  }
  emit('selection-change', selectedRows.value)
}



// 处理排序
const handleSort = (column: TableColumn) => {
  if (!column.sortable) return
  
  let order: 'asc' | 'desc' = 'asc'
  if (props.sortField === column.key) {
    order = props.sortOrder === 'asc' ? 'desc' : 'asc'
  }
  
  emit('update:sortField', column.key)
  emit('update:sortOrder', order)
  emit('sort-change', column.key, order)
}

// 处理页码变更
const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  
  emit('update:currentPage', page)
  emit('page-change', page)
}

// 处理行点击
const handleRowClick = (row: any, index: number) => {
  emit('row-click', row, index)
}

// 处理批量删除
const handleBatchDelete = () => {
  emit('batch-delete', selectedRows.value)
}

// 监听数据变化，清空选择
watch(
  () => props.data,
  () => {
    selectedRows.value = []
  }
)
</script>

<style scoped>
/* 数据表格样式 */
.data-table-container {
  background: var(--bg-color-primary);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  position: relative;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-padding);
  border-bottom: 1px solid var(--border-color-light);
}

.table-title h3 {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  margin: 0 0 var(--spacing-xs);
}

.table-count {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.table-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.table-filters {
  padding: var(--spacing-lg) var(--card-padding);
  border-bottom: 1px solid var(--border-color-light);
  background: var(--bg-color-tertiary);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--warning-color-light);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--warning-color);
  margin: var(--spacing-md) var(--card-padding) 0;
}

.batch-actions::before {
  content: '已选择 ' attr(data-count) ' 项：';
  font-size: var(--font-size-small);
  color: var(--warning-color-dark);
  margin-right: var(--spacing-sm);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--table-border-color);
}

.data-table th {
  background: var(--table-header-bg);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  font-size: var(--font-size-small);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  color: var(--text-color-regular);
  font-size: var(--font-size-base);
}

.data-table tbody tr:hover {
  background: var(--table-row-hover-bg);
}

.data-table tbody tr.selected {
  background: var(--primary-color-lighter);
}

/* 表格尺寸 */
.table-small th,
.table-small td {
  padding: var(--spacing-sm) var(--spacing-md);
}

.table-large th,
.table-large td {
  padding: var(--spacing-lg) var(--spacing-md);
}

/* 表格边框 */
.table-bordered {
  border: 1px solid var(--table-border-color);
}

.table-bordered th,
.table-bordered td {
  border-right: 1px solid var(--table-border-color);
}

/* 斑马纹 */
.table-striped tbody tr:nth-child(even) {
  background: var(--bg-color-tertiary);
}

/* 列对齐 */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* 可排序列 */
.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: var(--bg-color-secondary);
}

.column-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.sort-icon {
  color: var(--text-color-placeholder);
  font-size: var(--font-size-small);
}

.sortable:hover .sort-icon {
  color: var(--primary-color);
}

/* 省略号 */
.ellipsis {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 固定列 */
.fixed-left,
.fixed-right {
  position: sticky;
  background: var(--bg-color-primary);
  z-index: 2;
}

.fixed-left {
  left: 0;
}

.fixed-right {
  right: 0;
}

/* 选择列 */
.selection-column {
  width: 50px;
  text-align: center;
}

.selection-column input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--primary-color);
}

/* 操作列 */
.actions-column {
  width: 120px;
  text-align: center;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxxl);
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--text-color-placeholder);
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-regular);
  margin-bottom: var(--spacing-md);
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-color-secondary);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxxl);
  color: var(--text-color-secondary);
}

.loading-spinner {
  margin-bottom: var(--spacing-lg);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 分页 */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--card-padding);
  border-top: 1px solid var(--border-color-light);
}

.pagination-info {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  background: var(--bg-color-primary);
  color: var(--text-color-regular);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: var(--transition-base);
}

.page-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-color-white);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .table-pagination {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .row-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}
</style>