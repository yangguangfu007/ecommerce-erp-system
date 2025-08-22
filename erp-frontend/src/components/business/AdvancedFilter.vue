<template>
  <div class="advanced-filter">
    <!-- 快速筛选标签 -->
    <div v-if="quickFilters.length" class="quick-filters">
      <div class="quick-filters-label">快速筛选：</div>
      <div class="quick-filters-tags">
        <el-tag
          v-for="filter in quickFilters"
          :key="filter.key"
          :type="filter.active ? 'primary' : ''"
          :effect="filter.active ? 'dark' : 'plain'"
          @click="toggleQuickFilter(filter)"
          class="quick-filter-tag"
        >
          {{ filter.label }}
        </el-tag>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filters">
      <!-- 搜索组件 -->
      <div class="search-group">
        <el-input
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch" type="primary">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 筛选器组 -->
      <div class="filter-group">
        <!-- 基础筛选器 -->
        <template v-for="filter in basicFilters" :key="filter.key">
          <!-- 选择器筛选 -->
          <el-select
            v-if="filter.type === 'select'"
            v-model="filterValues[filter.key]"
            :placeholder="filter.placeholder"
            class="filter-select"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="option in filter.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <!-- 日期范围筛选 -->
          <el-date-picker
            v-else-if="filter.type === 'daterange'"
            v-model="filterValues[filter.key]"
            type="daterange"
            :placeholder="filter.placeholder"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="filter-date"
            @change="handleFilterChange"
          />

          <!-- 数字范围筛选 -->
          <div v-else-if="filter.type === 'numberrange'" class="filter-number-range">
            <el-input
              v-model="filterValues[filter.key + '_min']"
              :placeholder="`最小${filter.label}`"
              type="number"
              class="range-input"
              @change="handleFilterChange"
            />
            <span class="range-separator">-</span>
            <el-input
              v-model="filterValues[filter.key + '_max']"
              :placeholder="`最大${filter.label}`"
              type="number"
              class="range-input"
              @change="handleFilterChange"
            />
          </div>
        </template>

        <!-- 高级筛选按钮 -->
        <el-button
          @click="showAdvancedFilter = !showAdvancedFilter"
          type="default"
          class="advanced-filter-btn"
        >
          <el-icon><Filter /></el-icon>
          高级筛选
          <el-icon class="expand-icon" :class="{ 'is-expanded': showAdvancedFilter }">
            <ArrowDown />
          </el-icon>
        </el-button>

        <!-- 重置按钮 -->
        <el-button @click="resetFilters" type="default">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 高级筛选面板 -->
    <el-collapse-transition>
      <div v-show="showAdvancedFilter" class="advanced-filter-panel">
        <div class="advanced-filter-content">
          <h4 class="panel-title">高级筛选条件</h4>
          
          <!-- 动态筛选条件 -->
          <div class="filter-conditions">
            <div
              v-for="(condition, index) in filterConditions"
              :key="index"
              class="filter-condition-row"
            >
              <!-- 逻辑操作符 -->
              <el-select
                v-if="index > 0"
                v-model="condition.logic"
                class="logic-select"
                @change="handleConditionChange"
              >
                <el-option label="且" value="AND" />
                <el-option label="或" value="OR" />
              </el-select>

              <!-- 字段选择 -->
              <el-select
                v-model="condition.field"
                placeholder="选择字段"
                class="field-select"
                @change="handleConditionChange"
              >
                <el-option
                  v-for="field in advancedFields"
                  :key="field.value"
                  :label="field.label"
                  :value="field.value"
                />
              </el-select>

              <!-- 操作符选择 -->
              <el-select
                v-model="condition.operator"
                placeholder="操作符"
                class="operator-select"
                @change="handleConditionChange"
              >
                <el-option
                  v-for="op in getOperatorOptions(condition.field)"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                />
              </el-select>

              <!-- 值输入 -->
              <component
                :is="getValueComponent(condition.field, condition.operator)"
                v-model="condition.value"
                :placeholder="getValuePlaceholder(condition.field)"
                :options="getFieldOptions(condition.field)"
                class="value-input"
                @change="handleConditionChange"
              />

              <!-- 删除按钮 -->
              <el-button
                @click="removeCondition(index)"
                type="danger"
                size="small"
                :icon="Delete"
                circle
              />
            </div>

            <!-- 添加条件按钮 -->
            <el-button
              @click="addCondition"
              type="primary"
              size="small"
              class="add-condition-btn"
            >
              <el-icon><Plus /></el-icon>
              添加条件
            </el-button>
          </div>

          <!-- 高级筛选操作 -->
          <div class="advanced-filter-actions">
            <el-button @click="resetAdvancedFilters">重置高级筛选</el-button>
            <el-button @click="applyAdvancedFilters" type="primary">应用筛选</el-button>
          </div>
        </div>
      </div>
    </el-collapse-transition>

    <!-- 已应用的筛选条件标签 -->
    <div v-if="appliedFilters.length" class="applied-filters">
      <div class="applied-filters-label">已应用筛选：</div>
      <div class="applied-filters-tags">
        <el-tag
          v-for="filter in appliedFilters"
          :key="filter.key"
          type="info"
          closable
          @close="removeAppliedFilter(filter)"
          class="applied-filter-tag"
        >
          {{ filter.label }}
        </el-tag>
        <el-button
          v-if="appliedFilters.length > 1"
          @click="clearAllFilters"
          type="danger"
          size="small"
          text
        >
          清除全部
        </el-button>
      </div>
    </div>

    <!-- 筛选历史 -->
    <div v-if="showFilterHistory && filterHistory.length" class="filter-history">
      <div class="filter-history-label">筛选历史：</div>
      <div class="filter-history-items">
        <el-tag
          v-for="(history, index) in filterHistory"
          :key="index"
          type="warning"
          effect="plain"
          @click="applyFilterHistory(history)"
          class="filter-history-tag"
        >
          {{ history.name }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Filter,
  ArrowDown,
  Refresh,
  Plus,
  Delete
} from '@element-plus/icons-vue'

// 组件属性
interface FilterOption {
  label: string
  value: any
}

interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'daterange' | 'numberrange' | 'date' | 'number'
  placeholder?: string
  options?: FilterOption[]
}

interface QuickFilter {
  key: string
  label: string
  active: boolean
  conditions: any[]
}

interface FilterCondition {
  logic?: 'AND' | 'OR'
  field: string
  operator: string
  value: any
}

interface AppliedFilter {
  key: string
  label: string
  value: any
}

interface FilterHistory {
  name: string
  conditions: FilterCondition[]
  timestamp: number
}

const props = withDefaults(defineProps<{
  // 搜索配置
  searchPlaceholder?: string
  searchFields?: string[]
  
  // 基础筛选器配置
  basicFilters?: FilterField[]
  
  // 高级筛选字段
  advancedFields?: FilterField[]
  
  // 快速筛选配置
  quickFilters?: QuickFilter[]
  
  // 是否显示筛选历史
  showFilterHistory?: boolean
  
  // 是否自动应用筛选
  autoApply?: boolean
  
  // 缓存键名
  cacheKey?: string
}>(), {
  searchPlaceholder: '请输入搜索关键词...',
  searchFields: () => [],
  basicFilters: () => [],
  advancedFields: () => [],
  quickFilters: () => [],
  showFilterHistory: true,
  autoApply: true,
  cacheKey: 'advanced-filter'
})

// 事件定义
const emit = defineEmits<{
  search: [keyword: string, fields: string[]]
  filter: [filters: any]
  reset: []
}>()

// 响应式数据
const searchKeyword = ref('')
const filterValues = reactive<Record<string, any>>({})
const showAdvancedFilter = ref(false)
const filterConditions = ref<FilterCondition[]>([])
const appliedFilters = ref<AppliedFilter[]>([])
const filterHistory = ref<FilterHistory[]>([])

// 操作符配置
const operatorOptions = {
  text: [
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '开始于', value: 'starts_with' },
    { label: '结束于', value: 'ends_with' }
  ],
  number: [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '介于', value: 'between' }
  ],
  date: [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '早于', value: 'lt' },
    { label: '晚于', value: 'gt' },
    { label: '介于', value: 'between' }
  ],
  select: [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '包含', value: 'in' },
    { label: '不包含', value: 'not_in' }
  ]
}

// 计算属性
const currentFilters = computed(() => {
  const filters: any = {}
  
  // 搜索关键词
  if (searchKeyword.value) {
    filters.keyword = searchKeyword.value
  }
  
  // 基础筛选器
  Object.keys(filterValues).forEach(key => {
    if (filterValues[key] !== null && filterValues[key] !== undefined && filterValues[key] !== '') {
      filters[key] = filterValues[key]
    }
  })
  
  // 高级筛选条件
  if (filterConditions.value.length) {
    filters.advanced = filterConditions.value.filter(condition => 
      condition.field && condition.operator && condition.value !== null && condition.value !== undefined && condition.value !== ''
    )
  }
  
  return filters
})

// 方法
const handleSearch = () => {
  emit('search', searchKeyword.value, props.searchFields)
  if (props.autoApply) {
    applyFilters()
  }
}

const handleFilterChange = () => {
  if (props.autoApply) {
    applyFilters()
  }
}

const handleConditionChange = () => {
  if (props.autoApply) {
    applyFilters()
  }
}

const toggleQuickFilter = (filter: QuickFilter) => {
  filter.active = !filter.active
  
  if (filter.active) {
    // 应用快速筛选条件
    filter.conditions.forEach(condition => {
      if (condition.field in filterValues) {
        filterValues[condition.field] = condition.value
      } else {
        // 添加到高级筛选条件
        const existingIndex = filterConditions.value.findIndex(c => c.field === condition.field)
        if (existingIndex > -1) {
          filterConditions.value[existingIndex] = { ...condition }
        } else {
          filterConditions.value.push({ ...condition })
        }
      }
    })
  } else {
    // 移除快速筛选条件
    filter.conditions.forEach(condition => {
      if (condition.field in filterValues) {
        filterValues[condition.field] = null
      } else {
        const index = filterConditions.value.findIndex(c => c.field === condition.field)
        if (index > -1) {
          filterConditions.value.splice(index, 1)
        }
      }
    })
  }
  
  if (props.autoApply) {
    applyFilters()
  }
}

const addCondition = () => {
  filterConditions.value.push({
    logic: filterConditions.value.length > 0 ? 'AND' : undefined,
    field: '',
    operator: '',
    value: null
  })
}

const removeCondition = (index: number) => {
  filterConditions.value.splice(index, 1)
  if (props.autoApply) {
    applyFilters()
  }
}

const getOperatorOptions = (field: string) => {
  const fieldConfig = props.advancedFields.find(f => f.value === field)
  if (!fieldConfig) return []
  
  return operatorOptions[fieldConfig.type] || operatorOptions.text
}

const getValueComponent = (field: string, operator: string) => {
  const fieldConfig = props.advancedFields.find(f => f.value === field)
  if (!fieldConfig) return 'el-input'
  
  if (fieldConfig.type === 'select') {
    return 'el-select'
  } else if (fieldConfig.type === 'date') {
    return operator === 'between' ? 'el-date-picker' : 'el-date-picker'
  } else if (fieldConfig.type === 'number') {
    return 'el-input-number'
  }
  
  return 'el-input'
}

const getValuePlaceholder = (field: string) => {
  const fieldConfig = props.advancedFields.find(f => f.value === field)
  return fieldConfig?.placeholder || '请输入值'
}

const getFieldOptions = (field: string) => {
  const fieldConfig = props.advancedFields.find(f => f.value === field)
  return fieldConfig?.options || []
}

const applyFilters = () => {
  const filters = currentFilters.value
  
  // 更新已应用筛选标签
  updateAppliedFilters()
  
  // 保存筛选历史
  saveFilterHistory()
  
  // 缓存筛选条件
  cacheFilters()
  
  emit('filter', filters)
}

const applyAdvancedFilters = () => {
  showAdvancedFilter.value = false
  applyFilters()
}

const resetFilters = () => {
  searchKeyword.value = ''
  Object.keys(filterValues).forEach(key => {
    filterValues[key] = null
  })
  
  // 重置快速筛选
  props.quickFilters.forEach(filter => {
    filter.active = false
  })
  
  appliedFilters.value = []
  
  emit('reset')
  
  if (props.autoApply) {
    applyFilters()
  }
}

const resetAdvancedFilters = () => {
  filterConditions.value = []
  if (props.autoApply) {
    applyFilters()
  }
}

const updateAppliedFilters = () => {
  const applied: AppliedFilter[] = []
  
  // 搜索关键词
  if (searchKeyword.value) {
    applied.push({
      key: 'keyword',
      label: `搜索: ${searchKeyword.value}`,
      value: searchKeyword.value
    })
  }
  
  // 基础筛选器
  props.basicFilters.forEach(filter => {
    const value = filterValues[filter.key]
    if (value !== null && value !== undefined && value !== '') {
      let label = `${filter.label}: `
      
      if (Array.isArray(value)) {
        label += value.join(' 至 ')
      } else if (filter.options) {
        const option = filter.options.find(opt => opt.value === value)
        label += option?.label || value
      } else {
        label += value
      }
      
      applied.push({
        key: filter.key,
        label,
        value
      })
    }
  })
  
  // 高级筛选条件
  filterConditions.value.forEach((condition, index) => {
    if (condition.field && condition.operator && condition.value !== null && condition.value !== undefined && condition.value !== '') {
      const fieldConfig = props.advancedFields.find(f => f.value === condition.field)
      const operatorConfig = getOperatorOptions(condition.field).find(op => op.value === condition.operator)
      
      const label = `${fieldConfig?.label || condition.field} ${operatorConfig?.label || condition.operator} ${condition.value}`
      
      applied.push({
        key: `advanced_${index}`,
        label,
        value: condition
      })
    }
  })
  
  appliedFilters.value = applied
}

const removeAppliedFilter = (filter: AppliedFilter) => {
  if (filter.key === 'keyword') {
    searchKeyword.value = ''
  } else if (filter.key.startsWith('advanced_')) {
    const index = parseInt(filter.key.replace('advanced_', ''))
    filterConditions.value.splice(index, 1)
  } else {
    filterValues[filter.key] = null
  }
  
  if (props.autoApply) {
    applyFilters()
  }
}

const clearAllFilters = () => {
  resetFilters()
}

const saveFilterHistory = () => {
  if (!filterConditions.value.length && !searchKeyword.value && !Object.values(filterValues).some(v => v)) {
    return
  }
  
  const historyItem: FilterHistory = {
    name: `筛选_${new Date().toLocaleString()}`,
    conditions: [...filterConditions.value],
    timestamp: Date.now()
  }
  
  // 避免重复保存相同的筛选条件
  const exists = filterHistory.value.some(item => 
    JSON.stringify(item.conditions) === JSON.stringify(historyItem.conditions)
  )
  
  if (!exists) {
    filterHistory.value.unshift(historyItem)
    
    // 限制历史记录数量
    if (filterHistory.value.length > 10) {
      filterHistory.value = filterHistory.value.slice(0, 10)
    }
    
    // 缓存历史记录
    localStorage.setItem(`${props.cacheKey}_history`, JSON.stringify(filterHistory.value))
  }
}

const applyFilterHistory = (history: FilterHistory) => {
  filterConditions.value = [...history.conditions]
  applyFilters()
  ElMessage.success('已应用历史筛选条件')
}

const cacheFilters = () => {
  const cacheData = {
    searchKeyword: searchKeyword.value,
    filterValues: { ...filterValues },
    filterConditions: [...filterConditions.value]
  }
  
  localStorage.setItem(props.cacheKey, JSON.stringify(cacheData))
}

const loadCachedFilters = () => {
  try {
    const cached = localStorage.getItem(props.cacheKey)
    if (cached) {
      const data = JSON.parse(cached)
      searchKeyword.value = data.searchKeyword || ''
      Object.assign(filterValues, data.filterValues || {})
      filterConditions.value = data.filterConditions || []
    }
    
    // 加载历史记录
    const historyCache = localStorage.getItem(`${props.cacheKey}_history`)
    if (historyCache) {
      filterHistory.value = JSON.parse(historyCache)
    }
  } catch (error) {
    console.error('加载缓存筛选条件失败:', error)
  }
}

// 监听器
watch(() => props.basicFilters, (newFilters) => {
  // 初始化筛选器值
  newFilters.forEach(filter => {
    if (!(filter.key in filterValues)) {
      filterValues[filter.key] = null
    }
  })
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadCachedFilters()
})

// 暴露方法
defineExpose({
  applyFilters,
  resetFilters,
  getCurrentFilters: () => currentFilters.value
})
</script>

<style scoped>
.advanced-filter {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

/* 快速筛选 */
.quick-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
}

.quick-filters-label {
  font-weight: 500;
  color: var(--text-color-primary);
  white-space: nowrap;
}

.quick-filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-filter-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-filter-tag:hover {
  transform: translateY(-1px);
}

/* 搜索和筛选区域 */
.search-filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.search-group {
  display: flex;
  align-items: center;
}

.search-input {
  max-width: 400px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-select,
.filter-date {
  min-width: 150px;
}

.filter-number-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.range-input {
  width: 120px;
}

.range-separator {
  color: var(--text-color-secondary);
}

.advanced-filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.expand-icon {
  transition: transform 0.3s;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

/* 高级筛选面板 */
.advanced-filter-panel {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

.advanced-filter-content {
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-lg);
}

.panel-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-large);
  font-weight: 500;
  color: var(--text-color-primary);
}

.filter-conditions {
  margin-bottom: var(--spacing-lg);
}

.filter-condition-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-light);
}

.logic-select {
  width: 80px;
}

.field-select {
  width: 150px;
}

.operator-select {
  width: 120px;
}

.value-input {
  flex: 1;
  min-width: 150px;
}

.add-condition-btn {
  margin-top: var(--spacing-md);
}

.advanced-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

/* 已应用筛选 */
.applied-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

.applied-filters-label {
  font-weight: 500;
  color: var(--text-color-primary);
  white-space: nowrap;
}

.applied-filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.applied-filter-tag {
  max-width: 200px;
}

/* 筛选历史 */
.filter-history {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color-lighter);
}

.filter-history-label {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.filter-history-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.filter-history-tag {
  cursor: pointer;
  font-size: var(--font-size-small);
}

.filter-history-tag:hover {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-filters {
    gap: var(--spacing-md);
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select,
  .filter-date {
    min-width: auto;
    width: 100%;
  }
  
  .filter-condition-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .logic-select,
  .field-select,
  .operator-select {
    width: 100%;
  }
  
  .applied-filters,
  .filter-history {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .applied-filters-tags,
  .filter-history-items {
    width: 100%;
  }
}
</style>