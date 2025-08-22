<!-- 商品搜索筛选组件 - 支持实时搜索、搜索历史和高级筛选 -->
<template>
  <div class="product-search-filter">
    <!-- 主搜索区域 -->
    <div v-if="showSearch" class="search-main">
      <div class="search-input-container">
        <!-- 搜索输入框 -->
        <div class="search-input-wrapper">
          <el-input
            ref="searchInputRef"
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            class="search-input"
            clearable
            @input="handleSearchInput"
            @clear="handleSearchClear"
            @keyup.enter="handleSearch"
            @focus="showSearchSuggestions = true"
            @blur="handleSearchBlur"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-button 
                v-if="searchKeyword"
                text
                @click="handleSearch"
              >
                搜索
              </el-button>
            </template>
          </el-input>
          
          <!-- 搜索建议下拉框 -->
          <div 
            v-if="showSearchSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0)"
            class="search-suggestions"
          >
            <!-- 搜索历史 -->
            <div v-if="searchHistory.length > 0 && !searchKeyword" class="suggestion-section">
              <div class="suggestion-header">
                <span>搜索历史</span>
                <el-button text size="small" @click="clearSearchHistory">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
              <div class="suggestion-list">
                <div
                  v-for="(history, index) in searchHistory.slice(0, 5)"
                  :key="index"
                  class="suggestion-item history-item"
                  @click="selectSearchHistory(history)"
                >
                  <el-icon><Clock /></el-icon>
                  <span>{{ history }}</span>
                </div>
              </div>
            </div>
            
            <!-- 搜索建议 -->
            <div v-if="searchSuggestions.length > 0" class="suggestion-section">
              <div class="suggestion-header">
                <span>搜索建议</span>
              </div>
              <div class="suggestion-list">
                <div
                  v-for="suggestion in searchSuggestions"
                  :key="suggestion.value"
                  class="suggestion-item"
                  @click="selectSearchSuggestion(suggestion)"
                >
                  <el-icon v-if="suggestion.type === 'product'"><Box /></el-icon>
                  <el-icon v-else-if="suggestion.type === 'category'"><FolderOpened /></el-icon>
                  <el-icon v-else-if="suggestion.type === 'brand'"><Star /></el-icon>
                  <el-icon v-else><PriceTag /></el-icon>
                  <span class="suggestion-text">
                    <span v-html="highlightKeyword(suggestion.label, searchKeyword)"></span>
                    <small v-if="suggestion.count" class="suggestion-count">({{ suggestion.count }})</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 高级搜索切换按钮 -->
        <el-button 
          :type="showAdvancedSearch ? 'primary' : 'default'"
          data-testid="advanced-search-toggle"
          @click="toggleAdvancedSearch"
        >
          <el-icon><Filter /></el-icon>
          高级搜索
        </el-button>
      </div>
    </div>

    <!-- 高级搜索区域 -->
    <el-collapse-transition>
      <div v-if="showAdvancedSearch" class="advanced-search">
        <div class="filter-group">
          <!-- 分类筛选 -->
          <div class="filter-item">
            <label class="filter-label">商品分类</label>
            <el-select
              v-model="filterValues.category"
              placeholder="全部分类"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in categoryOptions"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </div>

          <!-- 品牌筛选 -->
          <div class="filter-item">
            <label class="filter-label">商品品牌</label>
            <el-select
              v-model="filterValues.brand"
              placeholder="全部品牌"
              clearable
              filterable
              @change="handleFilterChange"
            >
              <el-option label="全部品牌" value="" />
              <el-option
                v-for="brand in brandOptions"
                :key="brand.value"
                :label="brand.label"
                :value="brand.value"
              />
            </el-select>
          </div>

          <!-- 状态筛选 -->
          <div class="filter-item">
            <label class="filter-label">商品状态</label>
            <el-select
              v-model="filterValues.status"
              placeholder="全部状态"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部状态" value="" />
              <el-option label="上架" value="ACTIVE" />
              <el-option label="下架" value="INACTIVE" />
            </el-select>
          </div>

          <!-- 价格范围 -->
          <div class="filter-item price-range">
            <label class="filter-label">价格范围</label>
            <div class="price-inputs">
              <el-input-number
                v-model="filterValues.minPrice"
                placeholder="最低价"
                :min="0"
                :precision="2"
                controls-position="right"
                @change="handleFilterChange"
              />
              <span class="price-separator">-</span>
              <el-input-number
                v-model="filterValues.maxPrice"
                placeholder="最高价"
                :min="0"
                :precision="2"
                controls-position="right"
                @change="handleFilterChange"
              />
            </div>
          </div>

          <!-- 库存状态 -->
          <div class="filter-item">
            <label class="filter-label">库存状态</label>
            <el-select
              v-model="filterValues.stockStatus"
              placeholder="全部库存"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部库存" value="" />
              <el-option label="有库存" value="inStock" />
              <el-option label="低库存" value="lowStock" />
              <el-option label="缺货" value="outOfStock" />
            </el-select>
          </div>

          <!-- 创建时间 -->
          <div class="filter-item">
            <label class="filter-label">创建时间</label>
            <el-date-picker
              v-model="filterValues.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
          </div>
        </div>

        <!-- 高级搜索操作按钮 -->
        <div class="advanced-actions">
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
    </el-collapse-transition>

    <!-- 快捷筛选标签 -->
    <div v-if="quickFilters.length > 0" class="quick-filters">
      <span class="quick-filter-label">快捷筛选：</span>
      <el-tag
        v-for="quickFilter in quickFilters"
        :key="quickFilter.key"
        :type="activeQuickFilter === quickFilter.key ? 'primary' : undefined"
        :effect="activeQuickFilter === quickFilter.key ? 'dark' : 'plain'"
        class="quick-filter-tag"
        @click="handleQuickFilter(quickFilter)"
      >
        {{ quickFilter.label }}
      </el-tag>
    </div>

    <!-- 当前筛选条件 -->
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
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { 
  Search, 
  Filter, 
  Refresh, 
  Delete, 
  Clock, 
  Box, 
  FolderOpened, 
  Star, 
  PriceTag 
} from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import { productApi } from '@/api/modules/product'
import type { ProductSearchSuggestion } from '@/api/modules/product'

interface FilterOption {
  label: string
  value: any
}

interface QuickFilter {
  key: string
  label: string
  filters: Record<string, any>
}

interface Props {
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 筛选器配置 */
  filters?: any[]
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
  showSearch: true,
  searchPlaceholder: '请输入搜索关键词...',
  filters: () => [],
  quickFilters: () => [],
  initialValues: () => ({}),
  searchDebounce: 300,
  realTimeSearch: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const searchInputRef = ref()
const searchKeyword = ref('')
const showAdvancedSearch = ref(false)
const showSearchSuggestions = ref(false)
const searchSuggestions = ref<ProductSearchSuggestion[]>([])
const searchHistory = ref<string[]>([])
const activeQuickFilter = ref('')

const filterValues = reactive({
  category: '',
  brand: '',
  status: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  stockStatus: '',
  dateRange: null as [string, string] | null
})

// 筛选选项
const categoryOptions: FilterOption[] = [
  { label: '手机数码', value: '手机数码' },
  { label: '电脑办公', value: '电脑办公' },
  { label: '游戏娱乐', value: '游戏娱乐' },
  { label: '摄影摄像', value: '摄影摄像' }
]

const brandOptions: FilterOption[] = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Huawei', value: 'Huawei' },
  { label: 'Xiaomi', value: 'Xiaomi' },
  { label: 'OPPO', value: 'OPPO' },
  { label: 'Vivo', value: 'Vivo' }
]

// 计算活动的筛选条件
const activeFilters = computed(() => {
  const active: Array<{ key: string; label: string; value: string }> = []
  
  if (filterValues.category) {
    active.push({
      key: 'category',
      label: '分类',
      value: filterValues.category
    })
  }
  
  if (filterValues.brand) {
    active.push({
      key: 'brand',
      label: '品牌',
      value: filterValues.brand
    })
  }
  
  if (filterValues.status) {
    const statusLabel = filterValues.status === 'ACTIVE' ? '上架' : '下架'
    active.push({
      key: 'status',
      label: '状态',
      value: statusLabel
    })
  }
  
  if (filterValues.minPrice !== undefined || filterValues.maxPrice !== undefined) {
    const min = filterValues.minPrice || 0
    const max = filterValues.maxPrice || '∞'
    active.push({
      key: 'priceRange',
      label: '价格',
      value: `¥${min} - ¥${max}`
    })
  }
  
  if (filterValues.stockStatus) {
    const stockLabels = {
      inStock: '有库存',
      lowStock: '低库存',
      outOfStock: '缺货'
    }
    active.push({
      key: 'stockStatus',
      label: '库存',
      value: stockLabels[filterValues.stockStatus as keyof typeof stockLabels]
    })
  }
  
  if (filterValues.dateRange) {
    active.push({
      key: 'dateRange',
      label: '创建时间',
      value: `${filterValues.dateRange[0]} 至 ${filterValues.dateRange[1]}`
    })
  }
  
  return active
})

// 防抖搜索
const debouncedSearch = debounce(() => {
  handleSearch()
}, props.searchDebounce)

// 防抖获取搜索建议
const debouncedGetSuggestions = debounce(async (keyword: string) => {
  if (keyword.trim()) {
    try {
      const response = await productApi.getSearchSuggestions(keyword, 8)
      searchSuggestions.value = response.data || []
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      searchSuggestions.value = []
    }
  } else {
    searchSuggestions.value = []
  }
}, 200)

// 初始化
const initializeFilters = () => {
  Object.keys(filterValues).forEach(key => {
    if (props.initialValues[key] !== undefined) {
      ;(filterValues as any)[key] = props.initialValues[key]
    }
  })
  searchKeyword.value = props.initialValues.keyword || ''
  
  // 从本地存储加载搜索历史
  const savedHistory = localStorage.getItem('product-search-history')
  if (savedHistory) {
    try {
      searchHistory.value = JSON.parse(savedHistory)
    } catch (error) {
      console.error('解析搜索历史失败:', error)
      searchHistory.value = []
    }
  }
}

// 事件处理
const handleSearchInput = (value: string) => {
  searchKeyword.value = value
  debouncedGetSuggestions(value)
  
  if (props.realTimeSearch) {
    debouncedSearch()
  }
}

const handleSearchClear = () => {
  searchKeyword.value = ''
  searchSuggestions.value = []
  showSearchSuggestions.value = false
  
  if (props.realTimeSearch) {
    handleSearch()
  }
}

const handleSearchBlur = () => {
  // 延迟隐藏建议，以便点击建议项
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

const handleFilterChange = () => {
  activeQuickFilter.value = ''
  if (props.realTimeSearch) {
    debouncedSearch()
  }
}

const handleSearch = () => {
  const filters: Record<string, any> = {}
  
  // 收集筛选条件
  Object.keys(filterValues).forEach(key => {
    const value = (filterValues as any)[key]
    if (value !== '' && value !== null && value !== undefined) {
      if (key === 'dateRange' && Array.isArray(value)) {
        filters.startDate = value[0]
        filters.endDate = value[1]
      } else if (key === 'minPrice' || key === 'maxPrice') {
        filters[key] = value
      } else {
        filters[key] = value
      }
    }
  })
  
  // 保存搜索历史
  if (searchKeyword.value.trim()) {
    saveSearchHistory(searchKeyword.value.trim())
  }
  
  showSearchSuggestions.value = false
  emit('search', filters, searchKeyword.value)
  emit('change', filters, searchKeyword.value)
}

const handleReset = () => {
  searchKeyword.value = ''
  Object.keys(filterValues).forEach(key => {
    ;(filterValues as any)[key] = key === 'dateRange' ? null : (key.includes('Price') ? undefined : '')
  })
  activeQuickFilter.value = ''
  searchSuggestions.value = []
  showSearchSuggestions.value = false
  
  emit('reset')
  emit('change', {}, '')
}

const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
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
      ;(filterValues as any)[key] = quickFilter.filters[key]
    }
  })
  
  handleSearch()
}

const handleRemoveFilter = (key: string) => {
  if (key === 'priceRange') {
    filterValues.minPrice = undefined
    filterValues.maxPrice = undefined
  } else {
    ;(filterValues as any)[key] = key === 'dateRange' ? null : ''
  }
  activeQuickFilter.value = ''
  handleSearch()
}

const handleClearAll = () => {
  handleReset()
}

// 搜索建议相关
const selectSearchSuggestion = (suggestion: ProductSearchSuggestion) => {
  searchKeyword.value = suggestion.value
  showSearchSuggestions.value = false
  handleSearch()
}

const selectSearchHistory = (history: string) => {
  searchKeyword.value = history
  showSearchSuggestions.value = false
  handleSearch()
}

const saveSearchHistory = (keyword: string) => {
  // 移除重复项并添加到开头
  const history = searchHistory.value.filter(item => item !== keyword)
  history.unshift(keyword)
  
  // 限制历史记录数量
  searchHistory.value = history.slice(0, 10)
  
  // 保存到本地存储
  localStorage.setItem('product-search-history', JSON.stringify(searchHistory.value))
}

const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('product-search-history')
}

const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword) return text
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 监听初始值变化
watch(() => props.initialValues, (newValues) => {
  Object.keys(newValues).forEach(key => {
    if (key === 'keyword') {
      searchKeyword.value = newValues[key] || ''
    } else if (filterValues.hasOwnProperty(key)) {
      ;(filterValues as unknown)[key] = newValues[key]
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
  getKeyword: () => searchKeyword.value,
  toggleAdvanced: toggleAdvancedSearch
})
</script>

<style scoped>
.product-search-filter {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-bottom: 16px;
  overflow: hidden;
}

.search-main {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-section {
  padding: 8px 0;
}

.suggestion-section:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.suggestion-list {
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: #f5f7fa;
}

.suggestion-item .el-icon {
  color: #909399;
  font-size: 14px;
}

.suggestion-text {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.suggestion-count {
  color: #c0c4cc;
  font-size: 12px;
}

.history-item .el-icon {
  color: #c0c4cc;
}

:deep(mark) {
  background: #409eff;
  color: #fff;
  padding: 1px 2px;
  border-radius: 2px;
}

.advanced-search {
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.filter-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.price-range {
  grid-column: span 2;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-separator {
  color: #909399;
  font-weight: 500;
}

.advanced-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.quick-filters {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: #fafafa;
}

.quick-filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.quick-filter-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-filter-tag:hover {
  transform: translateY(-1px);
}

.active-filters {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: #f0f9ff;
}

.active-filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .price-range {
    grid-column: span 1;
  }
  
  .price-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-filters,
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>