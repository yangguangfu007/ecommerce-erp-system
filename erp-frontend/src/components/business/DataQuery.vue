<template>
  <div class="data-query">
    <!-- 查询构建器 -->
    <div class="query-builder">
      <div class="query-header">
        <h3 class="query-title">数据查询构建器</h3>
        <div class="query-actions">
          <el-button @click="showSavedQueries = true" type="default">
            <el-icon><FolderOpened /></el-icon>
            已保存查询
          </el-button>
          <el-button @click="saveQuery" :disabled="!canSaveQuery" type="primary">
            <el-icon><DocumentAdd /></el-icon>
            保存查询
          </el-button>
        </div>
      </div>

      <!-- 查询配置 -->
      <div class="query-config">
        <!-- 数据源选择 -->
        <div class="config-section">
          <h4 class="section-title">数据源</h4>
          <el-select
            v-model="queryConfig.dataSource"
            placeholder="选择数据源"
            @change="onDataSourceChange"
            style="width: 100%"
          >
            <el-option
              v-for="source in dataSources"
              :key="source.value"
              :label="source.label"
              :value="source.value"
            />
          </el-select>
        </div>

        <!-- 字段选择 -->
        <div class="config-section">
          <h4 class="section-title">选择字段</h4>
          <div class="field-selection">
            <el-transfer
              v-model="queryConfig.selectedFields"
              :data="availableFields"
              :titles="['可选字段', '已选字段']"
              :button-texts="['移除', '添加']"
              filterable
              filter-placeholder="搜索字段"
              @change="onFieldsChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="query-conditions">
      <h4 class="section-title">查询条件</h4>
      <AdvancedFilter
        ref="advancedFilterRef"
        :basic-filters="basicFilters"
        :advanced-fields="advancedFields"
        :quick-filters="quickFilters"
        :auto-apply="false"
        :cache-key="`data-query-${queryConfig.dataSource}`"
        @filter="onFilterChange"
      />
    </div>

    <!-- 排序和分页 -->
    <div class="query-options">
      <el-row :gutter="20">
        <el-col :span="12">
          <h4 class="section-title">排序</h4>
          <div class="sort-config">
            <el-select
              v-model="queryConfig.sortField"
              placeholder="选择排序字段"
              style="width: 200px"
            >
              <el-option
                v-for="field in sortableFields"
                :key="field.value"
                :label="field.label"
                :value="field.value"
              />
            </el-select>
            <el-select
              v-model="queryConfig.sortOrder"
              style="width: 120px; margin-left: 10px"
            >
              <el-option label="升序" value="asc" />
              <el-option label="降序" value="desc" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="12">
          <h4 class="section-title">分页</h4>
          <div class="pagination-config">
            <el-input-number
              v-model="queryConfig.pageSize"
              :min="10"
              :max="1000"
              :step="10"
              controls-position="right"
              style="width: 120px"
            />
            <span style="margin-left: 10px">条/页</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 查询操作 -->
    <div class="query-actions-bar">
      <el-button @click="resetQuery">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button @click="previewQuery" :loading="previewing">
        <el-icon><View /></el-icon>
        预览
      </el-button>
      <el-button @click="executeQuery" :loading="executing" type="primary">
        <el-icon><Search /></el-icon>
        执行查询
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  FolderOpened,
  DocumentAdd,
  Refresh,
  View,
  Search
} from '@element-plus/icons-vue'
import AdvancedFilter from './AdvancedFilter.vue'

// 组件属性和事件
const props = withDefaults(defineProps<{
  dataSources?: Array<{ label: string; value: string }>
  defaultDataSource?: string
}>(), {
  dataSources: () => [
    { label: '订单数据', value: 'orders' },
    { label: '商品数据', value: 'products' },
    { label: '库存数据', value: 'inventory' },
    { label: '用户数据', value: 'users' }
  ]
})

const emit = defineEmits<{
  query: [config: any]
  preview: [config: any]
  reset: []
}>()

// 响应式数据
const advancedFilterRef = ref()
const previewing = ref(false)
const executing = ref(false)
const showSavedQueries = ref(false)

const queryConfig = reactive({
  dataSource: props.defaultDataSource || '',
  selectedFields: [] as string[],
  filters: {},
  sortField: '',
  sortOrder: 'asc' as 'asc' | 'desc',
  pageSize: 50
})

// 字段配置
const fieldConfigs = {
  orders: [
    { key: 'id', label: '订单ID' },
    { key: 'orderNumber', label: '订单号' },
    { key: 'customerName', label: '客户姓名' },
    { key: 'totalAmount', label: '订单金额' },
    { key: 'status', label: '订单状态' },
    { key: 'platform', label: '平台' },
    { key: 'createdAt', label: '创建时间' }
  ],
  products: [
    { key: 'id', label: '商品ID' },
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: '商品名称' },
    { key: 'category', label: '分类' },
    { key: 'brand', label: '品牌' },
    { key: 'price', label: '价格' },
    { key: 'status', label: '状态' }
  ],
  inventory: [
    { key: 'id', label: '库存ID' },
    { key: 'sku', label: 'SKU' },
    { key: 'productName', label: '商品名称' },
    { key: 'totalQuantity', label: '总库存' },
    { key: 'availableQuantity', label: '可用库存' },
    { key: 'status', label: '库存状态' }
  ],
  users: [
    { key: 'id', label: '用户ID' },
    { key: 'username', label: '用户名' },
    { key: 'realName', label: '真实姓名' },
    { key: 'email', label: '邮箱' },
    { key: 'status', label: '状态' },
    { key: 'createdAt', label: '创建时间' }
  ]
}// 计算属性

const availableFields = computed(() => {
  const fields = fieldConfigs[queryConfig.dataSource as keyof typeof fieldConfigs] || []
  return fields.map(field => ({
    key: field.key,
    label: field.label
  }))
})

const sortableFields = computed(() => {
  return availableFields.value.filter(field => 
    ['id', 'createdAt', 'totalAmount', 'price', 'totalQuantity'].includes(field.key)
  )
})

const basicFilters = computed(() => {
  const dataSource = queryConfig.dataSource
  const filters = []
  
  if (dataSource === 'orders') {
    filters.push(
      {
        key: 'status',
        label: '订单状态',
        type: 'select',
        placeholder: '选择订单状态',
        options: [
          { label: '待支付', value: 'pending' },
          { label: '已支付', value: 'paid' },
          { label: '已发货', value: 'shipped' },
          { label: '已完成', value: 'completed' },
          { label: '已取消', value: 'cancelled' }
        ]
      },
      {
        key: 'platform',
        label: '平台',
        type: 'select',
        placeholder: '选择平台',
        options: [
          { label: '沃尔玛', value: 'walmart' },
          { label: '亚马逊', value: 'amazon' },
          { label: 'eBay', value: 'ebay' }
        ]
      },
      {
        key: 'dateRange',
        label: '创建时间',
        type: 'daterange',
        placeholder: '选择时间范围'
      }
    )
  } else if (dataSource === 'products') {
    filters.push(
      {
        key: 'category',
        label: '商品分类',
        type: 'select',
        placeholder: '选择分类',
        options: [
          { label: '电子产品', value: 'electronics' },
          { label: '服装', value: 'clothing' },
          { label: '家居', value: 'home' },
          { label: '运动', value: 'sports' }
        ]
      },
      {
        key: 'status',
        label: '商品状态',
        type: 'select',
        placeholder: '选择状态',
        options: [
          { label: '上架', value: 'active' },
          { label: '下架', value: 'inactive' },
          { label: '缺货', value: 'out_of_stock' }
        ]
      },
      {
        key: 'priceRange',
        label: '价格范围',
        type: 'numberrange',
        placeholder: '价格范围'
      }
    )
  } else if (dataSource === 'inventory') {
    filters.push(
      {
        key: 'status',
        label: '库存状态',
        type: 'select',
        placeholder: '选择库存状态',
        options: [
          { label: '正常', value: 'normal' },
          { label: '库存不足', value: 'low' },
          { label: '严重不足', value: 'critical' },
          { label: '缺货', value: 'out_of_stock' }
        ]
      },
      {
        key: 'quantityRange',
        label: '库存数量',
        type: 'numberrange',
        placeholder: '库存数量范围'
      }
    )
  }
  
  return filters
})

const advancedFields = computed(() => {
  return availableFields.value.map(field => ({
    ...field,
    value: field.key,
    type: getFieldType(field.key)
  }))
})

const quickFilters = computed(() => {
  const dataSource = queryConfig.dataSource
  const filters = []
  
  if (dataSource === 'orders') {
    filters.push(
      {
        key: 'today_orders',
        label: '今日订单',
        active: false,
        conditions: [
          { field: 'dateRange', operator: 'eq', value: [new Date().toISOString().split('T')[0]] }
        ]
      },
      {
        key: 'pending_orders',
        label: '待处理订单',
        active: false,
        conditions: [
          { field: 'status', operator: 'in', value: ['pending', 'paid'] }
        ]
      }
    )
  } else if (dataSource === 'inventory') {
    filters.push(
      {
        key: 'low_stock',
        label: '低库存商品',
        active: false,
        conditions: [
          { field: 'status', operator: 'in', value: ['low', 'critical'] }
        ]
      }
    )
  }
  
  return filters
})

const canSaveQuery = computed(() => {
  return queryConfig.dataSource && queryConfig.selectedFields.length > 0
})

// 方法
const getFieldType = (fieldKey: string) => {
  if (['id', 'totalAmount', 'price', 'totalQuantity', 'availableQuantity'].includes(fieldKey)) {
    return 'number'
  } else if (['createdAt', 'updatedAt'].includes(fieldKey)) {
    return 'date'
  } else if (['status', 'platform', 'category', 'brand'].includes(fieldKey)) {
    return 'select'
  }
  return 'text'
}

const onDataSourceChange = (dataSource: string) => {
  // 重置字段选择和筛选条件
  queryConfig.selectedFields = []
  queryConfig.filters = {}
  queryConfig.sortField = ''
  
  // 重置筛选器
  if (advancedFilterRef.value) {
    advancedFilterRef.value.resetFilters()
  }
}

const onFieldsChange = (selectedFields: string[]) => {
  // 字段变更时的处理
  console.log('选中字段:', selectedFields)
}

const onFilterChange = (filters: any) => {
  queryConfig.filters = filters
}

const previewQuery = async () => {
  if (!queryConfig.dataSource) {
    ElMessage.warning('请选择数据源')
    return
  }
  
  if (queryConfig.selectedFields.length === 0) {
    ElMessage.warning('请选择至少一个字段')
    return
  }
  
  previewing.value = true
  
  try {
    const config = {
      ...queryConfig,
      preview: true,
      limit: 10 // 预览只显示前10条
    }
    
    emit('preview', config)
    
    // 模拟预览延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('预览生成成功')
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败')
  } finally {
    previewing.value = false
  }
}

const executeQuery = async () => {
  if (!queryConfig.dataSource) {
    ElMessage.warning('请选择数据源')
    return
  }
  
  if (queryConfig.selectedFields.length === 0) {
    ElMessage.warning('请选择至少一个字段')
    return
  }
  
  executing.value = true
  
  try {
    emit('query', { ...queryConfig })
    
    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('查询执行成功')
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  } finally {
    executing.value = false
  }
}

const resetQuery = () => {
  queryConfig.dataSource = ''
  queryConfig.selectedFields = []
  queryConfig.filters = {}
  queryConfig.sortField = ''
  queryConfig.sortOrder = 'asc'
  queryConfig.pageSize = 50
  
  if (advancedFilterRef.value) {
    advancedFilterRef.value.resetFilters()
  }
  
  emit('reset')
}

const saveQuery = () => {
  // 实现保存查询逻辑
  ElMessage.success('查询已保存')
}

// 监听器
watch(() => queryConfig.dataSource, (newSource) => {
  if (newSource && availableFields.value.length > 0) {
    // 自动选择一些常用字段
    const commonFields = ['id', 'name', 'status', 'createdAt'].filter(field =>
      availableFields.value.some(f => f.key === field)
    )
    queryConfig.selectedFields = commonFields
  }
})

// 暴露方法
defineExpose({
  executeQuery,
  resetQuery,
  getQueryConfig: () => queryConfig
})
</script>

<style scoped>
.data-query {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-lg);
}

.query-builder {
  margin-bottom: var(--spacing-xl);
}

.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
}

.query-title {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: 500;
  color: var(--text-color-primary);
}

.query-actions {
  display: flex;
  gap: var(--spacing-md);
}

.query-config {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-xl);
}

.config-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-medium);
  font-weight: 500;
  color: var(--text-color-primary);
}

.field-selection {
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-md);
}

.query-conditions {
  margin-bottom: var(--spacing-xl);
}

.query-options {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-base);
}

.sort-config,
.pagination-config {
  display: flex;
  align-items: center;
}

.query-actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .query-config {
    grid-template-columns: 1fr;
  }
  
  .query-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .query-actions-bar {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .sort-config,
  .pagination-config {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>