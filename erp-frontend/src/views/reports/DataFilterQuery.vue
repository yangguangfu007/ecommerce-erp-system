<template>
  <div class="data-filter-query-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <h2 class="page-title">数据筛选与查询</h2>
        <p class="page-description">高级数据筛选和查询工具，支持多维度条件组合和历史记录管理</p>
      </div>
      <div class="page-actions">
        <el-button @click="showQueryHistory = !showQueryHistory" type="default">
          <el-icon><Clock /></el-icon>
          查询历史
        </el-button>
        <el-button @click="resetAll" type="default">
          <el-icon><Refresh /></el-icon>
          重置全部
        </el-button>
      </div>
    </div>

    <div class="filter-query-content">
      <el-row :gutter="20">
        <!-- 左侧：查询构建器和筛选器 -->
        <el-col :span="showQueryHistory ? 16 : 24">
          <div class="query-section">
            <!-- 增强数据筛选器 -->
            <div class="content-card">
              <EnhancedDataFilter
                ref="enhancedFilterRef"
                :available-fields="currentAvailableFields"
                :quick-filters="currentQuickFilters"
                :cache-key="`data-filter-${currentDataSource}`"
                @filter="handleEnhancedFilter"
                @preview="handleEnhancedPreview"
                @reset="handleFilterReset"
                @time-range-change="handleTimeRangeChange"
              />
            </div>
            
            <!-- 数据查询构建器 -->
            <div class="content-card" style="margin-top: 16px">
              <DataQuery
                ref="dataQueryRef"
                :data-sources="dataSources"
                :default-data-source="defaultDataSource"
                @query="handleQuery"
                @preview="handlePreview"
                @reset="handleQueryReset"
              />
            </div>
          </div>
        </el-col>

        <!-- 右侧：查询历史 -->
        <el-col v-if="showQueryHistory" :span="8">
          <div class="history-section">
            <div class="content-card">
              <QueryHistory
                ref="queryHistoryRef"
                :data-sources="dataSources"
                @apply="handleApplyHistory"
              />
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 查询结果区域 -->
      <div v-if="showResults" class="results-section">
        <div class="content-card">
          <CachedQueryResult
            ref="cachedQueryResultRef"
            :data="queryData"
            :columns="queryColumns"
            :loading="querying"
            :pagination="pagination"
            :query-time="queryTime"
            :selectable="true"
            :cache-key="`query-result-${currentDataSource}`"
            :export-title="`${currentDataSource}查询结果`"
            :export-filename="`${currentDataSource}-query-${new Date().toISOString().split('T')[0]}`"
            @refresh="handleRefresh"
            @export="handleExport"
            @page-change="handlePageChange"
            @sort-change="handleSortChange"
            @selection-change="handleSelectionChange"
            @view-detail="handleViewDetail"
            @edit-row="handleEditRow"
          />
        </div>
      </div>
    </div>

    <!-- 数据详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`${currentDataSource}详情`"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="detailData" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item
            v-for="(value, key) in detailData"
            :key="String(key)"
            :label="getFieldLabel(String(key))"
          >
            <component
              :is="getCellComponent(String(key))"
              :value="value"
              :column="{ type: getFieldType(String(key)) }"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 数据编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="`编辑${currentDataSource}`"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        v-if="editData"
        ref="editFormRef"
        :model="editData"
        label-width="120px"
      >
        <el-form-item
          v-for="field in editableFields"
          :key="field.key"
          :label="field.label"
          :prop="field.key"
        >
          <el-select
            v-if="field.type === 'select'"
            v-model="editData![field.key]"
            :placeholder="`请选择${field.label}`"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="editData![field.key]"
            :placeholder="`请输入${field.label}`"
          />
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="editData![field.key]"
            type="date"
            :placeholder="`请选择${field.label}`"
          />
          <el-input
            v-else
            v-model="editData![field.key]"
            :placeholder="`请输入${field.label}`"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button @click="saveEdit" type="primary" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Refresh } from '@element-plus/icons-vue'
import DataQuery from '@/components/business/DataQuery.vue'
import QueryHistory from '@/components/business/QueryHistory.vue'
import CachedQueryResult from '@/components/business/CachedQueryResult.vue'
import EnhancedDataFilter from '@/components/business/EnhancedDataFilter.vue'
import CellText from '@/components/business/cells/CellText.vue'
import CellNumber from '@/components/business/cells/CellNumber.vue'
import CellDate from '@/components/business/cells/CellDate.vue'
import CellStatus from '@/components/business/cells/CellStatus.vue'
import CellImage from '@/components/business/cells/CellImage.vue'

// 类型定义
interface DataSource {
  label: string
  value: string
}

interface FieldConfig {
  key: string
  label: string
  type: string
  sortable?: boolean
  width?: number
}

interface EditableField {
  key: string
  label: string
  type: string
  options?: Array<{ label: string; value: string }>
}

interface FieldConfigs {
  [key: string]: {
    columns: FieldConfig[]
    editableFields: EditableField[]
  }
}

interface QueryConfig {
  dataSource: string
  selectedFields: string[]
  filters?: Record<string, any>
  sortField?: string
  sortOrder?: string
  pageSize?: number
  limit?: number
}

interface Pagination {
  page: number
  size: number
  total: number
}

interface QuickFilter {
  label: string
  value: string
  field: string
}

interface AvailableField {
  key: string
  label: string
  type: string
}

// 响应式数据
const dataQueryRef = ref()
const queryHistoryRef = ref()
const cachedQueryResultRef = ref()
const enhancedFilterRef = ref()
const editFormRef = ref()

const showQueryHistory = ref(false)
const showResults = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const querying = ref(false)
const saving = ref(false)

const queryData = ref<Record<string, any>[]>([])
const queryColumns = ref<FieldConfig[]>([])
const queryTime = ref(0)
const detailData = ref<Record<string, any> | null>(null)
const editData = ref<Record<string, any> | null>(null)
const selectedRows = ref<Record<string, any>[]>([])
const currentDataSource = ref('')
const currentQueryConfig = ref<QueryConfig>({} as QueryConfig)

const pagination = reactive<Pagination>({
  page: 1,
  size: 20,
  total: 0
})

// 数据源配置
const dataSources: DataSource[] = [
  { label: '订单数据', value: 'orders' },
  { label: '商品数据', value: 'products' },
  { label: '库存数据', value: 'inventory' },
  { label: '用户数据', value: 'users' },
  { label: '销售数据', value: 'sales' },
  { label: '财务数据', value: 'finance' }
]

const defaultDataSource = 'orders'

// 字段配置
const fieldConfigs: FieldConfigs = {
  orders: {
    columns: [
      { key: 'id', label: '订单ID', type: 'number', sortable: true },
      { key: 'orderNumber', label: '订单号', type: 'text', sortable: true },
      { key: 'customerName', label: '客户姓名', type: 'text' },
      { key: 'totalAmount', label: '订单金额', type: 'number', sortable: true },
      { key: 'status', label: '订单状态', type: 'status' },
      { key: 'platform', label: '平台', type: 'text' },
      { key: 'createdAt', label: '创建时间', type: 'date', sortable: true }
    ],
    editableFields: [
      { key: 'customerName', label: '客户姓名', type: 'text' },
      { key: 'status', label: '订单状态', type: 'select', options: [
        { label: '待支付', value: 'pending' },
        { label: '已支付', value: 'paid' },
        { label: '已发货', value: 'shipped' },
        { label: '已完成', value: 'completed' }
      ]}
    ]
  },
  products: {
    columns: [
      { key: 'id', label: '商品ID', type: 'number', sortable: true },
      { key: 'sku', label: 'SKU', type: 'text', sortable: true },
      { key: 'name', label: '商品名称', type: 'text' },
      { key: 'image', label: '商品图片', type: 'image', width: 80 },
      { key: 'category', label: '分类', type: 'text' },
      { key: 'brand', label: '品牌', type: 'text' },
      { key: 'price', label: '价格', type: 'number', sortable: true },
      { key: 'status', label: '状态', type: 'status' }
    ],
    editableFields: [
      { key: 'name', label: '商品名称', type: 'text' },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: [
        { label: '上架', value: 'active' },
        { label: '下架', value: 'inactive' }
      ]}
    ]
  },
  inventory: {
    columns: [
      { key: 'id', label: '库存ID', type: 'number', sortable: true },
      { key: 'sku', label: 'SKU', type: 'text' },
      { key: 'productName', label: '商品名称', type: 'text' },
      { key: 'totalQuantity', label: '总库存', type: 'number', sortable: true },
      { key: 'availableQuantity', label: '可用库存', type: 'number', sortable: true },
      { key: 'status', label: '库存状态', type: 'status' },
      { key: 'lastUpdated', label: '最后更新', type: 'date', sortable: true }
    ],
    editableFields: [
      { key: 'totalQuantity', label: '总库存', type: 'number' },
      { key: 'availableQuantity', label: '可用库存', type: 'number' }
    ]
  },
  users: {
    columns: [
      { key: 'id', label: '用户ID', type: 'number', sortable: true },
      { key: 'username', label: '用户名', type: 'text' },
      { key: 'realName', label: '真实姓名', type: 'text' },
      { key: 'email', label: '邮箱', type: 'text' },
      { key: 'status', label: '状态', type: 'status' },
      { key: 'createdAt', label: '创建时间', type: 'date', sortable: true }
    ],
    editableFields: [
      { key: 'realName', label: '真实姓名', type: 'text' },
      { key: 'email', label: '邮箱', type: 'text' },
      { key: 'status', label: '状态', type: 'select', options: [
        { label: '启用', value: 'enabled' },
        { label: '禁用', value: 'disabled' }
      ]}
    ]
  }
}

// 计算属性
const editableFields = computed(() => {
  const config = fieldConfigs[currentDataSource.value]
  return config?.editableFields || []
})

const currentAvailableFields = computed((): AvailableField[] => {
  const config = fieldConfigs[currentDataSource.value]
  if (!config) return []
  
  return config.columns.map(col => ({
    key: col.key,
    label: col.label,
    type: col.type
  }))
})

const currentQuickFilters = computed((): QuickFilter[] => {
  const dataSource = currentDataSource.value
  
  // 根据数据源返回相应的快速筛选器
  switch (dataSource) {
    case 'orders':
      return [
        { label: '今日订单', value: 'today', field: 'createdAt' },
        { label: '本周订单', value: 'week', field: 'createdAt' },
        { label: '待支付', value: 'pending', field: 'status' },
        { label: '已支付', value: 'paid', field: 'status' },
        { label: '已发货', value: 'shipped', field: 'status' }
      ]
    case 'products':
      return [
        { label: '上架商品', value: 'active', field: 'status' },
        { label: '下架商品', value: 'inactive', field: 'status' },
        { label: '低库存', value: 'low_stock', field: 'stock' },
        { label: '热销商品', value: 'hot', field: 'sales' }
      ]
    case 'inventory':
      return [
        { label: '库存预警', value: 'warning', field: 'status' },
        { label: '库存充足', value: 'sufficient', field: 'status' },
        { label: '今日更新', value: 'today', field: 'lastUpdated' }
      ]
    case 'users':
      return [
        { label: '启用用户', value: 'enabled', field: 'status' },
        { label: '禁用用户', value: 'disabled', field: 'status' },
        { label: '新注册', value: 'new', field: 'createdAt' }
      ]
    default:
      return []
  }
})

// 方法
const handleEnhancedFilter = (filterConfig: Record<string, any>) => {
  // 处理增强筛选器的筛选事件
  console.log('Enhanced filter applied:', filterConfig)
  
  // 将筛选条件应用到当前查询配置
  if (currentQueryConfig.value) {
    currentQueryConfig.value.filters = { ...currentQueryConfig.value.filters, ...filterConfig }
  }
}

const handleEnhancedPreview = (filterConfig: Record<string, any>) => {
  // 处理增强筛选器的预览事件
  console.log('Enhanced filter preview:', filterConfig)
  
  // 创建预览查询配置
  const previewConfig: QueryConfig = {
    ...currentQueryConfig.value,
    filters: { ...currentQueryConfig.value.filters, ...filterConfig },
    limit: 10
  }
  
  handleQuery(previewConfig)
}

const handleFilterReset = () => {
  // 重置筛选器
  if (currentQueryConfig.value) {
    currentQueryConfig.value.filters = {}
  }
  handleQueryReset()
}

const handleTimeRangeChange = (timeRange: { start: string; end: string }) => {
  // 处理时间范围变化
  console.log('Time range changed:', timeRange)
  
  if (currentQueryConfig.value) {
    currentQueryConfig.value.filters = {
      ...currentQueryConfig.value.filters,
      startDate: timeRange.start,
      endDate: timeRange.end
    }
  }
}

const handleQuery = async (queryConfig: QueryConfig) => {
  querying.value = true
  currentQueryConfig.value = queryConfig
  currentDataSource.value = queryConfig.dataSource
  
  try {
    const startTime = Date.now()
    
    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 生成模拟数据
    const mockData = generateMockData(queryConfig)
    queryData.value = mockData.data
    queryColumns.value = mockData.columns
    pagination.total = mockData.total
    pagination.page = 1
    
    queryTime.value = Date.now() - startTime
    showResults.value = true
    
    // 保存到查询历史
    if (queryHistoryRef.value) {
      queryHistoryRef.value.addHistory(queryConfig)
    }
    
    ElMessage.success('查询执行成功')
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  } finally {
    querying.value = false
  }
}

const handlePreview = async (queryConfig: QueryConfig) => {
  // 预览查询，限制结果数量
  const previewConfig: QueryConfig = { ...queryConfig, limit: 10 }
  await handleQuery(previewConfig)
}

const handleQueryReset = () => {
  showResults.value = false
  queryData.value = []
  queryColumns.value = []
  selectedRows.value = []
}

const handleApplyHistory = (historyItem: QueryConfig) => {
  if (dataQueryRef.value && dataQueryRef.value.getQueryConfig) {
    // 应用历史查询配置
    Object.assign(dataQueryRef.value.getQueryConfig(), historyItem)
    handleQuery(historyItem)
  }
}

const handleRefresh = () => {
  if (currentQueryConfig.value.dataSource) {
    handleQuery(currentQueryConfig.value)
  }
}

const handleExport = (selectedRows: Record<string, any>[]) => {
  const dataToExport = selectedRows.length ? selectedRows : queryData.value
  ElMessage.success(`导出 ${dataToExport.length} 条数据`)
}

const handlePageChange = (page: number, size: number) => {
  pagination.page = page
  pagination.size = size
  // 重新查询数据
  handleQuery(currentQueryConfig.value)
}

const handleSortChange = (field: string, order: string) => {
  currentQueryConfig.value.sortField = field
  currentQueryConfig.value.sortOrder = order
  handleQuery(currentQueryConfig.value)
}

const handleSelectionChange = (selection: Record<string, any>[]) => {
  selectedRows.value = selection
}

const handleViewDetail = (row: Record<string, any>) => {
  detailData.value = row
  showDetailDialog.value = true
}

const handleEditRow = (row: Record<string, any>) => {
  editData.value = { ...row }
  showEditDialog.value = true
}

const saveEdit = async () => {
  if (!editFormRef.value || !editData.value) return
  
  try {
    await editFormRef.value.validate()
    
    saving.value = true
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新本地数据
    const index = queryData.value.findIndex(item => item.id === editData.value?.id)
    if (index > -1 && editData.value) {
      queryData.value[index] = { ...editData.value }
    }
    
    showEditDialog.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetAll = () => {
  if (dataQueryRef.value) {
    dataQueryRef.value.resetQuery()
  }
  handleQueryReset()
}

const getFieldLabel = (key: string) => {
  const config = fieldConfigs[currentDataSource.value as keyof typeof fieldConfigs]
  const column = config?.columns.find(col => col.key === key)
  return column?.label || key
}

const getFieldType = (key: string) => {
  const config = fieldConfigs[currentDataSource.value as keyof typeof fieldConfigs]
  const column = config?.columns.find(col => col.key === key)
  return column?.type || 'text'
}

const getCellComponent = (key: string) => {
  const type = getFieldType(key)
  switch (type) {
    case 'number': return CellNumber
    case 'date': return CellDate
    case 'status': return CellStatus
    case 'image': return CellImage
    default: return CellText
  }
}

const getEditComponent = (type: string) => {
  switch (type) {
    case 'number': return 'el-input-number'
    case 'select': return 'el-select'
    case 'date': return 'el-date-picker'
    default: return 'el-input'
  }
}

const generateMockData = (queryConfig: QueryConfig) => {
  const { dataSource, selectedFields, pageSize = 20 } = queryConfig
  const config = fieldConfigs[dataSource]
  
  if (!config) {
    return { data: [], columns: [], total: 0 }
  }
  
  // 生成列配置
  const columns = config.columns.filter(col => 
    selectedFields.includes(col.key)
  )
  
  // 生成模拟数据
  const data = Array.from({ length: pageSize }, (_, index) => {
    const item: Record<string, unknown> = { id: index + 1 }
    
    selectedFields.forEach(field => {
      switch (field) {
        case 'orderNumber':
          item[field] = `ORD${String(index + 1).padStart(6, '0')}`
          break
        case 'sku':
          item[field] = `SKU${String(index + 1).padStart(4, '0')}`
          break
        case 'customerName':
        case 'realName':
          item[field] = `用户${index + 1}`
          break
        case 'name':
        case 'productName':
          item[field] = `商品${index + 1}`
          break
        case 'username':
          item[field] = `user${index + 1}`
          break
        case 'email':
          item[field] = `user${index + 1}@example.com`
          break
        case 'totalAmount':
        case 'price':
          item[field] = Math.floor(Math.random() * 1000) + 100
          break
        case 'totalQuantity':
        case 'availableQuantity':
          item[field] = Math.floor(Math.random() * 100) + 10
          break
        case 'status':
          const statuses = ['active', 'inactive', 'pending', 'completed']
          item[field] = statuses[Math.floor(Math.random() * statuses.length)]
          break
        case 'platform':
          const platforms = ['沃尔玛', '亚马逊', 'eBay']
          item[field] = platforms[Math.floor(Math.random() * platforms.length)]
          break
        case 'category':
          const categories = ['电子产品', '服装', '家居', '运动']
          item[field] = categories[Math.floor(Math.random() * categories.length)]
          break
        case 'brand':
          const brands = ['品牌A', '品牌B', '品牌C']
          item[field] = brands[Math.floor(Math.random() * brands.length)]
          break
        case 'createdAt':
        case 'lastUpdated':
          item[field] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'image':
          item[field] = `https://via.placeholder.com/100x100?text=商品${index + 1}`
          break
        default:
          item[field] = `${field}_${index + 1}`
      }
    })
    
    return item
  })
  
  return {
    data,
    columns,
    total: Math.floor(Math.random() * 500) + 100
  }
}

// 生命周期
onMounted(() => {
  // 初始化
  currentDataSource.value = defaultDataSource
})
</script>

<style scoped>
.data-filter-query-view {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background: var(--bg-color-tertiary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-light);
}

.page-header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-color-primary);
}

.page-description {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: var(--font-size-medium);
}

.page-actions {
  display: flex;
  gap: var(--spacing-md);
}

.filter-query-content {
  margin-bottom: var(--spacing-xl);
}

.query-section,
.history-section,
.results-section {
  margin-bottom: var(--spacing-lg);
}

.content-card {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-light);
  overflow: hidden;
}

/* 详情对话框 */
.detail-content {
  max-height: 500px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .data-filter-query-view {
    padding: var(--spacing-md);
  }
  
  .page-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-query-content :deep(.el-col) {
    margin-bottom: var(--spacing-lg);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .data-filter-query-view {
    background: var(--bg-color-dark-tertiary);
  }
  
  .content-card {
    background: var(--bg-color-dark-primary);
    box-shadow: var(--box-shadow-dark);
  }
}
</style>