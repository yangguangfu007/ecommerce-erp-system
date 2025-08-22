<!-- 搜索筛选组件 - 支持多条件筛选和快速搜索 -->
<template>
  <div class="search-filter">
    <div class="filter-group">
      <!-- 搜索输入框 -->
      <div v-if="showSearch" class="filter-item search-item">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            :clearable="true"
            @input="handleSearchInput"
            @clear="handleSearchClear"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 筛选器 -->
      <div 
        v-for="filter in filters" 
        :key="filter.key" 
        class="filter-item"
      >
        <!-- 下拉选择器 -->
        <el-select
          v-if="filter.type === 'select'"
          v-model="filterValues[filter.key]"
          :placeholder="filter.placeholder"
          :clearable="true"
          @change="handleFilterChange"
        >
          <el-option
            v-for="option in filter.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="filter.type === 'date'"
          v-model="filterValues[filter.key]"
          type="date"
          :placeholder="filter.placeholder"
          :clearable="true"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />

        <!-- 日期范围选择器 -->
        <el-date-picker
          v-else-if="filter.type === 'daterange'"
          v-model="filterValues[filter.key]"
          type="daterange"
          :range-separator="filter.rangeSeparator || '至'"
          :start-placeholder="filter.startPlaceholder || '开始日期'"
          :end-placeholder="filter.endPlaceholder || '结束日期'"
          :clearable="true"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />

        <!-- 输入框 -->
        <el-input
          v-else-if="filter.type === 'input'"
          v-model="filterValues[filter.key]"
          :placeholder="filter.placeholder"
          :clearable="true"
          @input="handleFilterInput(filter.key, $event)"
          @clear="handleFilterChange"
        />

        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="filter.type === 'number'"
          v-model="filterValues[filter.key]"
          :placeholder="filter.placeholder"
          :min="filter.min"
          :max="filter.max"
          :step="filter.step || 1"
          :precision="filter.precision"
          @change="handleFilterChange"
        />

        <!-- 多选框 -->
        <el-select
          v-else-if="filter.type === 'multiple'"
          v-model="filterValues[filter.key]"
          :placeholder="filter.placeholder"
          multiple
          :clearable="true"
          :collapse-tags="true"
          :max-collapse-tags="2"
          @change="handleFilterChange"
        >
          <el-option
            v-for="option in filter.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 快捷筛选标签 -->
    <div v-if="quickFilters.length > 0" class="quick-filters">
      <span class="quick-filter-label">快捷筛选：</span>
      <el-tag
        v-for="quickFilter in quickFilters"
        :key="quickFilter.key"
        :type="activeQuickFilter === quickFilter.key ? 'primary' : ''"
        :effect="activeQuickFilter === quickFilter.key ? 'dark' : 'plain'"
        class="quick-filter-tag"
        @click="handleQuickFilter(quickFilter)"
      >
        {{ quickFilter.label }}
      </el-tag>
    </div>

    <!-- 活动筛选条件显示 -->
    <div v-if="activeFilters.length > 0" class="active-filters">
      <span class="active-filter-label">当前筛选：</span>
      <el-tag
        v-for="activeFilter in activeFilters"
        :key="activeFilter.key"
        closable
        @close="handleRemoveFilter(activeFilter.key)"
      >
        {{ activeFilter.label }}: {{ activeFilter.value }}
      </el-tag>
      <el-button 
        type="text" 
        size="small" 
        @click="handleClearAll"
      >
        清空所有
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

interface FilterOption {
  label: string
  value: any
}

interface FilterConfig {
  key: string
  type: 'select' | 'input' | 'date' | 'daterange' | 'number' | 'multiple'
  placeholder: string
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  precision?: number
  rangeSeparator?: string
  startPlaceholder?: string
  endPlaceholder?: string
}

interface QuickFilter {
  key: string
  label: string
  filters: Record<string, any>
}

interface Props {
  /** 筛选器配置 */
  filters?: FilterConfig[]
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 快捷筛选配置 */
  quickFilters?: QuickFilter[]
  /** 初始筛选值 */
  initialValues?: Record<string, any>
  /** 搜索防抖延迟（毫秒） */
  searchDebounce?: number
  /** 是否实时搜索 */
  realTimeSearch?: boolean
}

interface Emits {
  (e: 'search', filters: Record<string, any>, keyword: string): void
  (e: 'reset'): void
  (e: 'change', filters: Record<string, any>, keyword: string): void
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => [],
  showSearch: true,
  searchPlaceholder: '请输入搜索关键词...',
  quickFilters: () => [],
  initialValues: () => ({}),
  searchDebounce: 300,
  realTimeSearch: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const searchKeyword = ref('')
const filterValues = reactive<Record<string, any>>({})
const activeQuickFilter = ref('')

// 初始化筛选值
const initializeFilters = () => {
  props.filters.forEach(filter => {
    filterValues[filter.key] = props.initialValues[filter.key] || (
      filter.type === 'multiple' ? [] : ''
    )
  })
  searchKeyword.value = props.initialValues.keyword || ''
}

// 计算活动的筛选条件
const activeFilters = computed(() => {
  const active: Array<{ key: string; label: string; value: string }> = []
  
  props.filters.forEach(filter => {
    const value = filterValues[filter.key]
    if (value !== '' && value !== null && value !== undefined) {
      let displayValue = value
      
      if (filter.type === 'select') {
        const option = filter.options?.find(opt => opt.value === value)
        displayValue = option?.label || value
      } else if (filter.type === 'multiple' && Array.isArray(value) && value.length > 0) {
        displayValue = value.map(v => {
          const option = filter.options?.find(opt => opt.value === v)
          return option?.label || v
        }).join(', ')
      } else if (filter.type === 'daterange' && Array.isArray(value) && value.length === 2) {
        displayValue = `${value[0]} 至 ${value[1]}`
      }
      
      if (displayValue) {
        active.push({
          key: filter.key,
          label: filter.placeholder.replace(/请选择|请输入|\.{3}/g, ''),
          value: displayValue
        })
      }
    }
  })
  
  return active
})

// 防抖搜索
const debouncedSearch = debounce(() => {
  handleSearch()
}, props.searchDebounce)

// 事件处理
const handleSearchInput = () => {
  if (props.realTimeSearch) {
    debouncedSearch()
  }
}

const handleSearchClear = () => {
  searchKeyword.value = ''
  if (props.realTimeSearch) {
    handleSearch()
  }
}

const handleFilterChange = () => {
  activeQuickFilter.value = ''
  if (props.realTimeSearch) {
    debouncedSearch()
  }
}

const handleFilterInput = (key: string, value: string) => {
  filterValues[key] = value
  activeQuickFilter.value = ''
  if (props.realTimeSearch) {
    debouncedSearch()
  }
}

const handleSearch = () => {
  const filters = { ...filterValues }
  // 清理空值
  Object.keys(filters).forEach(key => {
    if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
      delete filters[key]
    }
  })
  
  emit('search', filters, searchKeyword.value)
  emit('change', filters, searchKeyword.value)
}

const handleReset = () => {
  searchKeyword.value = ''
  Object.keys(filterValues).forEach(key => {
    filterValues[key] = props.filters.find(f => f.key === key)?.type === 'multiple' ? [] : ''
  })
  activeQuickFilter.value = ''
  
  emit('reset')
  emit('change', {}, '')
}

const handleQuickFilter = (quickFilter: QuickFilter) => {
  if (activeQuickFilter.value === quickFilter.key) {
    // 取消快捷筛选
    handleReset()
    return
  }
  
  // 应用快捷筛选
  activeQuickFilter.value = quickFilter.key
  Object.keys(quickFilter.filters).forEach(key => {
    if (filterValues.hasOwnProperty(key)) {
      filterValues[key] = quickFilter.filters[key]
    }
  })
  
  handleSearch()
}

const handleRemoveFilter = (key: string) => {
  const filter = props.filters.find(f => f.key === key)
  if (filter) {
    filterValues[key] = filter.type === 'multiple' ? [] : ''
    activeQuickFilter.value = ''
    handleSearch()
  }
}

const handleClearAll = () => {
  handleReset()
}

// 监听初始值变化
watch(() => props.initialValues, (newValues) => {
  Object.keys(newValues).forEach(key => {
    if (key === 'keyword') {
      searchKeyword.value = newValues[key] || ''
    } else if (filterValues.hasOwnProperty(key)) {
      filterValues[key] = newValues[key]
    }
  })
}, { deep: true })

// 初始化
initializeFilters()

// 暴露方法
defineExpose({
  search: handleSearch,
  reset: handleReset,
  getFilters: () => ({ ...filterValues }),
  getKeyword: () => searchKeyword.value
})
</script>

<style scoped>
.search-filter {
  background: #fff;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.search-item {
  min-width: 250px;
}

.search-input-wrapper {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.quick-filters {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.quick-filter-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-filter-tag:hover {
  transform: translateY(-1px);
}

.active-filters {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.active-filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item,
  .search-item {
    min-width: auto;
    width: 100%;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .quick-filters,
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>