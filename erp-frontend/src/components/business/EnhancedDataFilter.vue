<template>
  <div class="enhanced-data-filter">
    <!-- 筛选器头部 -->
    <div class="filter-header">
      <div class="filter-title">
        <h3>高级数据筛选</h3>
        <el-tag v-if="activeFiltersCount" type="primary">
          {{ activeFiltersCount }} 个筛选条件
        </el-tag>
      </div>
      <div class="filter-actions">
        <el-button @click="showSavedFilters = true" type="default">
          <el-icon><FolderOpened /></el-icon>
          已保存筛选
        </el-button>
        <el-button @click="saveCurrentFilter" :disabled="!hasActiveFilters" type="primary">
          <el-icon><DocumentAdd /></el-icon>
          保存筛选
        </el-button>
      </div>
    </div>

    <!-- 快速筛选标签 -->
    <div v-if="quickFilters.length" class="quick-filters-section">
      <div class="section-label">快速筛选：</div>
      <div class="quick-filters-container">
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

    <!-- 时间范围筛选 -->
    <div class="time-range-section">
      <div class="section-label">时间范围：</div>
      <div class="time-range-controls">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          @change="handleTimeRangeChange"
        />
        <el-select
          v-model="timeRangePreset"
          placeholder="快速选择"
          @change="applyTimeRangePreset"
          style="width: 120px; margin-left: 10px"
        >
          <el-option label="今天" value="today" />
          <el-option label="昨天" value="yesterday" />
          <el-option label="本周" value="thisWeek" />
          <el-option label="上周" value="lastWeek" />
          <el-option label="本月" value="thisMonth" />
          <el-option label="上月" value="lastMonth" />
        </el-select>
      </div>
    </div>    <
!-- 多条件筛选构建器 -->
    <div class="multi-condition-section">
      <div class="section-header">
        <div class="section-label">筛选条件：</div>
        <el-button @click="addFilterCondition" type="primary" size="small">
          <el-icon><Plus /></el-icon>
          添加条件
        </el-button>
      </div>
      
      <div class="filter-conditions">
        <div
          v-for="(condition, index) in filterConditions"
          :key="condition.id"
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
            @change="onFieldChange(condition)"
          >
            <el-option
              v-for="field in availableFields"
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
            :is="getValueComponent(condition)"
            v-model="condition.value"
            :placeholder="getValuePlaceholder(condition.field)"
            :options="getFieldOptions(condition.field)"
            class="value-input"
            @change="handleConditionChange"
          />

          <!-- 删除按钮 -->
          <el-button
            @click="removeFilterCondition(index)"
            type="danger"
            size="small"
            :icon="Delete"
            circle
          />
        </div>
      </div>
    </div>

    <!-- 筛选操作栏 -->
    <div class="filter-actions-bar">
      <div class="filter-stats">
        <span v-if="cacheStats.total">
          缓存中共 {{ cacheStats.total }} 条记录
        </span>
      </div>
      <div class="filter-buttons">
        <el-button @click="resetAllFilters">
          <el-icon><Refresh /></el-icon>
          重置全部
        </el-button>
        <el-button @click="previewFilter" :loading="previewing">
          <el-icon><View /></el-icon>
          预览结果
        </el-button>
        <el-button @click="applyFilter" :loading="applying" type="primary">
          <el-icon><Search /></el-icon>
          应用筛选
        </el-button>
      </div>
    </div>    <
!-- 已应用的筛选条件 -->
    <div v-if="appliedFilters.length" class="applied-filters-section">
      <div class="section-label">已应用筛选：</div>
      <div class="applied-filters-container">
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
          @click="clearAllAppliedFilters"
          type="danger"
          size="small"
          text
        >
          清除全部
        </el-button>
      </div>
    </div>

    <!-- 保存的筛选条件对话框 -->
    <el-dialog
      v-model="showSavedFilters"
      title="已保存的筛选条件"
      width="800px"
    >
      <div class="saved-filters-content">
        <div class="saved-filters-actions">
          <el-input
            v-model="filterSearchKeyword"
            placeholder="搜索筛选条件..."
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <el-table
          :data="filteredSavedFilters"
          border
          style="width: 100%; margin-top: 16px"
        >
          <el-table-column prop="name" label="筛选名称" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column prop="conditionsCount" label="条件数量" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button @click="applySavedFilter(row)" type="primary" size="small">
                应用
              </el-button>
              <el-button @click="editSavedFilter(row)" size="small">
                编辑
              </el-button>
              <el-button @click="deleteSavedFilter(row)" type="danger" size="small">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="showSavedFilters = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 保存筛选条件对话框 -->
    <el-dialog
      v-model="showSaveFilterDialog"
      title="保存筛选条件"
      width="500px"
    >
      <el-form :model="saveFilterForm" label-width="100px">
        <el-form-item label="筛选名称" required>
          <el-input
            v-model="saveFilterForm.name"
            placeholder="请输入筛选名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="saveFilterForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入筛选描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSaveFilterDialog = false">取消</el-button>
        <el-button @click="confirmSaveFilter" type="primary" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template><scri
pt setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderOpened,
  DocumentAdd,
  Plus,
  Delete,
  Refresh,
  View,
  Search
} from '@element-plus/icons-vue'

// 接口定义
interface FilterField {
  value: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: Array<{ label: string; value: any }>
}

interface FilterCondition {
  id: string
  logic?: 'AND' | 'OR'
  field: string
  operator: string
  value: any
}

interface QuickFilter {
  key: string
  label: string
  active: boolean
  conditions: FilterCondition[]
}

interface AppliedFilter {
  key: string
  label: string
  value: any
}

interface SavedFilter {
  id: string
  name: string
  description: string
  conditions: FilterCondition[]
  timeRange: string[] | null
  conditionsCount: number
  createdAt: string
  updatedAt: string
}

interface CacheStats {
  total: number
  filtered: number
  lastUpdate: string
}

// 组件属性
const props = withDefaults(defineProps<{
  availableFields?: FilterField[]
  quickFilters?: QuickFilter[]
  cacheKey?: string
  enableCache?: boolean
  maxCacheSize?: number
}>(), {
  availableFields: () => [],
  quickFilters: () => [],
  cacheKey: 'enhanced-data-filter',
  enableCache: true,
  maxCacheSize: 1000
})

// 事件定义
const emit = defineEmits<{
  filter: [conditions: any]
  preview: [conditions: any]
  reset: []
  timeRangeChange: [range: string[]]
}>()

// 响应式数据
const timeRange = ref<string[]>([])
const timeRangePreset = ref('')
const filterConditions = ref<FilterCondition[]>([])
const appliedFilters = ref<AppliedFilter[]>([])
const savedFilters = ref<SavedFilter[]>([])
const showSavedFilters = ref(false)
const showSaveFilterDialog = ref(false)
const filterSearchKeyword = ref('')
const previewing = ref(false)
const applying = ref(false)
const saving = ref(false)

const saveFilterForm = reactive({
  name: '',
  description: ''
})

const cacheStats = reactive<CacheStats>({
  total: 0,
  filtered: 0,
  lastUpdate: ''
})

// 操作符配置
const operatorOptions = {
  text: [
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '开始于', value: 'starts_with' },
    { label: '结束于', value: 'ends_with' },
    { label: '为空', value: 'is_null' },
    { label: '不为空', value: 'is_not_null' }
  ],
  number: [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '介于', value: 'between' },
    { label: '为空', value: 'is_null' },
    { label: '不为空', value: 'is_not_null' }
  ],
  date: [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '早于', value: 'lt' },
    { label: '晚于', value: 'gt' },
    { label: '介于', value: 'between' },
    { label: '为空', value: 'is_null' },
    { label: '不为空', value: 'is_not_null' }
  ],
  select: [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '包含', value: 'in' },
    { label: '不包含', value: 'not_in' }
  ],
  boolean: [
    { label: '为真', value: 'is_true' },
    { label: '为假', value: 'is_false' }
  ]
}

// 计算属性
const activeFiltersCount = computed(() => {
  let count = 0
  if (timeRange.value && timeRange.value.length === 2) count++
  count += filterConditions.value.filter(c => c.field && c.operator).length
  count += props.quickFilters.filter(f => f.active).length
  return count
})

const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

const filteredSavedFilters = computed(() => {
  if (!filterSearchKeyword.value) return savedFilters.value
  
  const keyword = filterSearchKeyword.value.toLowerCase()
  return savedFilters.value.filter(filter =>
    filter.name.toLowerCase().includes(keyword) ||
    filter.description.toLowerCase().includes(keyword)
  )
})

const currentFilterConditions = computed(() => {
  const conditions: any = {
    timeRange: timeRange.value,
    conditions: filterConditions.value.filter(c => c.field && c.operator),
    quickFilters: props.quickFilters.filter(f => f.active).map(f => f.key)
  }
  
  return conditions
})// 方法

const generateConditionId = () => {
  return `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const addFilterCondition = () => {
  filterConditions.value.push({
    id: generateConditionId(),
    logic: filterConditions.value.length > 0 ? 'AND' : undefined,
    field: '',
    operator: '',
    value: null
  })
}

const removeFilterCondition = (index: number) => {
  filterConditions.value.splice(index, 1)
  updateAppliedFilters()
}

const onFieldChange = (condition: FilterCondition) => {
  // 重置操作符和值
  condition.operator = ''
  condition.value = null
}

const getOperatorOptions = (field: string) => {
  const fieldConfig = props.availableFields.find(f => f.value === field)
  if (!fieldConfig) return []
  
  return operatorOptions[fieldConfig.type] || operatorOptions.text
}

const getValueComponent = (condition: FilterCondition) => {
  const fieldConfig = props.availableFields.find(f => f.value === condition.field)
  if (!fieldConfig) return 'el-input'
  
  if (['is_null', 'is_not_null', 'is_true', 'is_false'].includes(condition.operator)) {
    return 'span' // 不需要输入值
  }
  
  if (condition.operator === 'between') {
    return fieldConfig.type === 'date' ? 'el-date-picker' : 'el-input'
  }
  
  switch (fieldConfig.type) {
    case 'select':
      return condition.operator === 'in' || condition.operator === 'not_in' ? 'el-select' : 'el-select'
    case 'date':
      return 'el-date-picker'
    case 'number':
      return 'el-input-number'
    case 'boolean':
      return 'el-switch'
    default:
      return 'el-input'
  }
}

const getValuePlaceholder = (field: string) => {
  const fieldConfig = props.availableFields.find(f => f.value === field)
  return fieldConfig ? `请输入${fieldConfig.label}` : '请输入值'
}

const getFieldOptions = (field: string) => {
  const fieldConfig = props.availableFields.find(f => f.value === field)
  return fieldConfig?.options || []
}

const handleTimeRangeChange = () => {
  updateAppliedFilters()
  emit('timeRangeChange', timeRange.value)
}

const applyTimeRangePreset = (preset: string) => {
  const now = new Date()
  let start: Date, end: Date
  
  switch (preset) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      break
    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59)
      break
    case 'thisWeek':
      const dayOfWeek = now.getDay()
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59)
      break
    case 'lastWeek':
      const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7)
      start = lastWeekStart
      end = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() + 6, 23, 59, 59)
      break
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      break
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      break
    default:
      return
  }
  
  timeRange.value = [
    start.toISOString().slice(0, 19).replace('T', ' '),
    end.toISOString().slice(0, 19).replace('T', ' ')
  ]
  
  handleTimeRangeChange()
}

const toggleQuickFilter = (filter: QuickFilter) => {
  filter.active = !filter.active
  updateAppliedFilters()
}

const handleConditionChange = () => {
  updateAppliedFilters()
}

const updateAppliedFilters = () => {
  const applied: AppliedFilter[] = []
  
  // 时间范围
  if (timeRange.value && timeRange.value.length === 2) {
    applied.push({
      key: 'timeRange',
      label: `时间范围: ${timeRange.value[0]} 至 ${timeRange.value[1]}`,
      value: timeRange.value
    })
  }
  
  // 快速筛选
  props.quickFilters.forEach(filter => {
    if (filter.active) {
      applied.push({
        key: `quick_${filter.key}`,
        label: `快速筛选: ${filter.label}`,
        value: filter.key
      })
    }
  })
  
  // 筛选条件
  filterConditions.value.forEach((condition, index) => {
    if (condition.field && condition.operator) {
      const fieldConfig = props.availableFields.find(f => f.value === condition.field)
      const operatorConfig = getOperatorOptions(condition.field).find(op => op.value === condition.operator)
      
      let valueText = ''
      if (!['is_null', 'is_not_null', 'is_true', 'is_false'].includes(condition.operator)) {
        if (Array.isArray(condition.value)) {
          valueText = ` ${condition.value.join(', ')}`
        } else {
          valueText = ` ${condition.value}`
        }
      }
      
      const label = `${fieldConfig?.label || condition.field} ${operatorConfig?.label || condition.operator}${valueText}`
      
      applied.push({
        key: `condition_${index}`,
        label,
        value: condition
      })
    }
  })
  
  appliedFilters.value = applied
}const remove
AppliedFilter = (filter: AppliedFilter) => {
  if (filter.key === 'timeRange') {
    timeRange.value = []
    timeRangePreset.value = ''
  } else if (filter.key.startsWith('quick_')) {
    const quickFilterKey = filter.key.replace('quick_', '')
    const quickFilter = props.quickFilters.find(f => f.key === quickFilterKey)
    if (quickFilter) {
      quickFilter.active = false
    }
  } else if (filter.key.startsWith('condition_')) {
    const index = parseInt(filter.key.replace('condition_', ''))
    if (index >= 0 && index < filterConditions.value.length) {
      filterConditions.value.splice(index, 1)
    }
  }
  
  updateAppliedFilters()
}

const clearAllAppliedFilters = () => {
  resetAllFilters()
}

const resetAllFilters = () => {
  timeRange.value = []
  timeRangePreset.value = ''
  filterConditions.value = []
  props.quickFilters.forEach(filter => {
    filter.active = false
  })
  appliedFilters.value = []
  
  emit('reset')
}

const previewFilter = async () => {
  previewing.value = true
  
  try {
    const conditions = currentFilterConditions.value
    emit('preview', conditions)
    
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

const applyFilter = async () => {
  applying.value = true
  
  try {
    const conditions = currentFilterConditions.value
    
    // 更新缓存统计
    if (props.enableCache) {
      updateCacheStats(conditions)
    }
    
    emit('filter', conditions)
    
    // 模拟应用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('筛选条件已应用')
  } catch (error) {
    console.error('应用筛选失败:', error)
    ElMessage.error('应用筛选失败')
  } finally {
    applying.value = false
  }
}

const saveCurrentFilter = () => {
  if (!hasActiveFilters.value) {
    ElMessage.warning('请先设置筛选条件')
    return
  }
  
  saveFilterForm.name = `筛选_${new Date().toLocaleString()}`
  saveFilterForm.description = ''
  showSaveFilterDialog.value = true
}

const confirmSaveFilter = async () => {
  if (!saveFilterForm.name.trim()) {
    ElMessage.warning('请输入筛选名称')
    return
  }
  
  saving.value = true
  
  try {
    const savedFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name: saveFilterForm.name.trim(),
      description: saveFilterForm.description.trim(),
      conditions: [...filterConditions.value],
      timeRange: timeRange.value.length === 2 ? [...timeRange.value] : null,
      conditionsCount: activeFiltersCount.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    savedFilters.value.unshift(savedFilter)
    
    // 保存到本地存储
    saveSavedFiltersToStorage()
    
    showSaveFilterDialog.value = false
    ElMessage.success('筛选条件已保存')
  } catch (error) {
    console.error('保存筛选条件失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const applySavedFilter = (savedFilter: SavedFilter) => {
  // 应用保存的筛选条件
  filterConditions.value = [...savedFilter.conditions]
  
  if (savedFilter.timeRange) {
    timeRange.value = [...savedFilter.timeRange]
  }
  
  updateAppliedFilters()
  showSavedFilters.value = false
  
  ElMessage.success(`已应用筛选条件: ${savedFilter.name}`)
}

const editSavedFilter = (savedFilter: SavedFilter) => {
  saveFilterForm.name = savedFilter.name
  saveFilterForm.description = savedFilter.description
  showSaveFilterDialog.value = true
  
  // 这里可以添加编辑逻辑
}

const deleteSavedFilter = async (savedFilter: SavedFilter) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除筛选条件 "${savedFilter.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = savedFilters.value.findIndex(f => f.id === savedFilter.id)
    if (index > -1) {
      savedFilters.value.splice(index, 1)
      saveSavedFiltersToStorage()
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const updateCacheStats = (conditions: any) => {
  // 模拟缓存统计更新
  cacheStats.total = Math.floor(Math.random() * 10000) + 1000
  cacheStats.filtered = Math.floor(cacheStats.total * (0.1 + Math.random() * 0.8))
  cacheStats.lastUpdate = new Date().toLocaleString()
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const saveSavedFiltersToStorage = () => {
  try {
    localStorage.setItem(`${props.cacheKey}_saved_filters`, JSON.stringify(savedFilters.value))
  } catch (error) {
    console.error('保存筛选条件到本地存储失败:', error)
  }
}

const loadSavedFiltersFromStorage = () => {
  try {
    const stored = localStorage.getItem(`${props.cacheKey}_saved_filters`)
    if (stored) {
      savedFilters.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('从本地存储加载筛选条件失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadSavedFiltersFromStorage()
  
  // 初始化缓存统计
  if (props.enableCache) {
    updateCacheStats({})
  }
})

// 暴露方法
defineExpose({
  applyFilter,
  resetAllFilters,
  getCurrentConditions: () => currentFilterConditions.value,
  addCondition: addFilterCondition
})
</script><style s
coped>
.enhanced-data-filter {
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color-light);
}

/* 筛选器头部 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-title h3 {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: 500;
  color: var(--text-color-primary);
}

.filter-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* 快速筛选 */
.quick-filters-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-base);
}

.section-label {
  font-weight: 500;
  color: var(--text-color-primary);
  white-space: nowrap;
}

.quick-filters-container {
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

/* 时间范围筛选 */
.time-range-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-base);
}

.time-range-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* 多条件筛选 */
.multi-condition-section {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.filter-conditions {
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-md);
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

.filter-condition-row:last-child {
  margin-bottom: 0;
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

/* 筛选操作栏 */
.filter-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

.filter-stats {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-md);
}

/* 已应用筛选 */
.applied-filters-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

.applied-filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.applied-filter-tag {
  max-width: 300px;
}

/* 保存的筛选条件 */
.saved-filters-content {
  max-height: 500px;
}

.saved-filters-actions {
  margin-bottom: var(--spacing-md);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .enhanced-data-filter {
    padding: var(--spacing-md);
  }
  
  .quick-filters-section,
  .time-range-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .time-range-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .filter-condition-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .logic-select,
  .field-select,
  .operator-select,
  .value-input {
    width: 100%;
  }
  
  .filter-actions-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .applied-filters-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .applied-filters-container {
    width: 100%;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .enhanced-data-filter {
    background: var(--bg-color-dark-primary);
    border-color: var(--border-color-dark);
  }
  
  .quick-filters-section,
  .time-range-section,
  .filter-conditions {
    background: var(--bg-color-dark-secondary);
  }
  
  .filter-condition-row {
    background: var(--bg-color-dark-primary);
    border-color: var(--border-color-dark);
  }
}
</style>