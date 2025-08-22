import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElInput, ElSelect, ElTag } from 'element-plus'
import AdvancedFilter from '../AdvancedFilter.vue'

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>',
    props: ['type', 'loading', 'disabled', 'size', 'text']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'clearable'],
    emits: ['update:modelValue', 'keyup', 'clear']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder', 'clearable', 'style'],
    emits: ['update:modelValue', 'change']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value">{{ label }}</option>',
    props: ['label', 'value']
  },
  ElTag: {
    name: 'ElTag',
    template: '<span :class="type"><slot /></span>',
    props: ['type', 'effect', 'closable'],
    emits: ['close', 'click']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<input type="date" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder', 'rangeSeparator', 'startPlaceholder', 'endPlaceholder'],
    emits: ['update:modelValue', 'change']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
    props: ['modelValue', 'placeholder', 'type'],
    emits: ['update:modelValue', 'change']
  },
  ElCollapseTransition: {
    name: 'ElCollapseTransition',
    template: '<div><slot /></div>'
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i><slot /></i>',
    props: ['class']
  },
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}))

// Mock 图标组件
vi.mock('@element-plus/icons-vue', () => ({
  Search: { name: 'Search' },
  Filter: { name: 'Filter' },
  ArrowDown: { name: 'ArrowDown' },
  Refresh: { name: 'Refresh' },
  Plus: { name: 'Plus' },
  Delete: { name: 'Delete' }
}))

describe('AdvancedFilter', () => {
  let wrapper: any

  const defaultProps = {
    searchPlaceholder: '搜索测试...',
    basicFilters: [
      {
        key: 'status',
        label: '状态',
        type: 'select',
        placeholder: '选择状态',
        options: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' }
        ]
      },
      {
        key: 'dateRange',
        label: '日期范围',
        type: 'daterange',
        placeholder: '选择日期范围'
      }
    ],
    advancedFields: [
      {
        key: 'name',
        label: '名称',
        value: 'name',
        type: 'text'
      },
      {
        key: 'price',
        label: '价格',
        value: 'price',
        type: 'number'
      }
    ],
    quickFilters: [
      {
        key: 'today',
        label: '今日数据',
        active: false,
        conditions: [
          { field: 'dateRange', operator: 'eq', value: ['2024-01-01'] }
        ]
      }
    ]
  }

  beforeEach(() => {
    wrapper = mount(AdvancedFilter, {
      props: defaultProps,
      global: {
        components: {
          ElButton,
          ElInput,
          ElSelect,
          ElTag
        }
      }
    })
  })

  it('应该正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.advanced-filter').exists()).toBe(true)
  })

  it('应该显示搜索输入框', () => {
    const searchInput = wrapper.find('.search-input')
    expect(searchInput.exists()).toBe(true)
  })

  it('应该显示快速筛选标签', () => {
    const quickFilters = wrapper.find('.quick-filters')
    expect(quickFilters.exists()).toBe(true)
    
    const quickFilterTags = wrapper.findAll('.quick-filter-tag')
    expect(quickFilterTags.length).toBe(1)
    expect(quickFilterTags[0].text()).toBe('今日数据')
  })

  it('应该显示基础筛选器', () => {
    const filterGroup = wrapper.find('.filter-group')
    expect(filterGroup.exists()).toBe(true)
    
    // 检查选择器筛选
    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('应该能够切换高级筛选面板', async () => {
    const advancedBtn = wrapper.find('.advanced-filter-btn')
    expect(advancedBtn.exists()).toBe(true)
    
    // 初始状态下高级筛选面板应该是隐藏的
    expect(wrapper.vm.showAdvancedFilter).toBe(false)
    
    // 点击按钮切换显示状态
    await advancedBtn.trigger('click')
    expect(wrapper.vm.showAdvancedFilter).toBe(true)
  })

  it('应该能够添加筛选条件', async () => {
    // 先显示高级筛选面板
    wrapper.vm.showAdvancedFilter = true
    await wrapper.vm.$nextTick()
    
    const addBtn = wrapper.find('.add-condition-btn')
    expect(addBtn.exists()).toBe(true)
    
    const initialConditions = wrapper.vm.filterConditions.length
    await addBtn.trigger('click')
    
    expect(wrapper.vm.filterConditions.length).toBe(initialConditions + 1)
  })

  it('应该能够移除筛选条件', async () => {
    // 添加一个条件
    wrapper.vm.addCondition()
    await wrapper.vm.$nextTick()
    
    const initialConditions = wrapper.vm.filterConditions.length
    wrapper.vm.removeCondition(0)
    
    expect(wrapper.vm.filterConditions.length).toBe(initialConditions - 1)
  })

  it('应该能够重置筛选器', async () => {
    // 设置一些筛选值
    wrapper.vm.searchKeyword = '测试'
    wrapper.vm.filterValues.status = 'active'
    wrapper.vm.addCondition()
    
    await wrapper.vm.resetFilters()
    
    expect(wrapper.vm.searchKeyword).toBe('')
    expect(wrapper.vm.filterValues.status).toBeNull()
    expect(wrapper.vm.filterConditions.length).toBe(0)
  })

  it('应该能够切换快速筛选', async () => {
    const quickFilter = wrapper.vm.quickFilters[0]
    expect(quickFilter.active).toBe(false)
    
    wrapper.vm.toggleQuickFilter(quickFilter)
    expect(quickFilter.active).toBe(true)
    
    wrapper.vm.toggleQuickFilter(quickFilter)
    expect(quickFilter.active).toBe(false)
  })

  it('应该在搜索时触发事件', async () => {
    wrapper.vm.searchKeyword = '测试关键词'
    
    await wrapper.vm.handleSearch()
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['测试关键词', []])
  })

  it('应该在筛选变更时触发事件', async () => {
    wrapper.vm.filterValues.status = 'active'
    
    await wrapper.vm.handleFilterChange()
    
    if (wrapper.props('autoApply')) {
      expect(wrapper.emitted('filter')).toBeTruthy()
    }
  })

  it('应该正确计算当前筛选条件', () => {
    wrapper.vm.searchKeyword = '测试'
    wrapper.vm.filterValues.status = 'active'
    wrapper.vm.filterConditions = [
      { field: 'name', operator: 'contains', value: '商品' }
    ]
    
    const filters = wrapper.vm.currentFilters
    
    expect(filters.keyword).toBe('测试')
    expect(filters.status).toBe('active')
    expect(filters.advanced).toHaveLength(1)
    expect(filters.advanced[0].field).toBe('name')
  })

  it('应该能够保存和加载缓存的筛选条件', () => {
    const cacheKey = 'test-filter'
    wrapper = mount(AdvancedFilter, {
      props: {
        ...defaultProps,
        cacheKey
      },
      global: {
        components: {
          ElButton,
          ElInput,
          ElSelect,
          ElTag
        }
      }
    })
    
    // 设置筛选条件
    wrapper.vm.searchKeyword = '缓存测试'
    wrapper.vm.filterValues.status = 'active'
    
    // 缓存筛选条件
    wrapper.vm.cacheFilters()
    
    // 验证缓存是否保存
    const cached = localStorage.getItem(cacheKey)
    expect(cached).toBeTruthy()
    
    const parsedCache = JSON.parse(cached!)
    expect(parsedCache.searchKeyword).toBe('缓存测试')
    expect(parsedCache.filterValues.status).toBe('active')
  })

  it('应该能够获取操作符选项', () => {
    const textOptions = wrapper.vm.getOperatorOptions('name')
    expect(textOptions).toContain(
      expect.objectContaining({ label: '包含', value: 'contains' })
    )
    
    const numberOptions = wrapper.vm.getOperatorOptions('price')
    expect(numberOptions).toContain(
      expect.objectContaining({ label: '大于', value: 'gt' })
    )
  })

  it('应该能够获取正确的值组件', () => {
    expect(wrapper.vm.getValueComponent('name', 'contains')).toBe('el-input')
    expect(wrapper.vm.getValueComponent('price', 'gt')).toBe('el-input-number')
  })

  it('应该能够更新已应用筛选标签', () => {
    wrapper.vm.searchKeyword = '测试'
    wrapper.vm.filterValues.status = 'active'
    
    wrapper.vm.updateAppliedFilters()
    
    expect(wrapper.vm.appliedFilters.length).toBeGreaterThan(0)
    expect(wrapper.vm.appliedFilters[0].label).toContain('搜索: 测试')
  })

  it('应该能够移除已应用的筛选', () => {
    wrapper.vm.searchKeyword = '测试'
    wrapper.vm.updateAppliedFilters()
    
    const keywordFilter = wrapper.vm.appliedFilters.find((f: any) => f.key === 'keyword')
    expect(keywordFilter).toBeTruthy()
    
    wrapper.vm.removeAppliedFilter(keywordFilter)
    expect(wrapper.vm.searchKeyword).toBe('')
  })
})