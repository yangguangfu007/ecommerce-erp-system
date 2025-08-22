import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElSelect, ElInputNumber } from 'element-plus'
import DataQuery from '../DataQuery.vue'

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button :loading="loading" :disabled="disabled"><slot /></button>',
    props: ['loading', 'disabled', 'type']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder', 'style'],
    emits: ['update:modelValue', 'change']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value">{{ label }}</option>',
    props: ['label', 'value']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
    props: ['modelValue', 'min', 'max', 'step', 'controlsPosition', 'style'],
    emits: ['update:modelValue']
  },
  ElTransfer: {
    name: 'ElTransfer',
    template: '<div class="el-transfer"><slot /></div>',
    props: ['modelValue', 'data', 'titles', 'buttonTexts', 'filterable', 'filterPlaceholder'],
    emits: ['update:modelValue', 'change']
  },
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>',
    props: ['gutter']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot /></div>',
    props: ['span']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i><slot /></i>'
  },
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}))

// Mock 图标组件
vi.mock('@element-plus/icons-vue', () => ({
  FolderOpened: { name: 'FolderOpened' },
  DocumentAdd: { name: 'DocumentAdd' },
  Refresh: { name: 'Refresh' },
  View: { name: 'View' },
  Search: { name: 'Search' }
}))

// Mock AdvancedFilter 组件
vi.mock('../AdvancedFilter.vue', () => ({
  default: {
    name: 'AdvancedFilter',
    template: '<div class="advanced-filter-mock"><slot /></div>',
    props: ['basicFilters', 'advancedFields', 'quickFilters', 'autoApply', 'cacheKey'],
    emits: ['filter'],
    methods: {
      resetFilters: vi.fn()
    }
  }
}))

describe('DataQuery', () => {
  let wrapper: any

  const defaultProps = {
    dataSources: [
      { label: '订单数据', value: 'orders' },
      { label: '商品数据', value: 'products' }
    ],
    defaultDataSource: 'orders'
  }

  beforeEach(() => {
    wrapper = mount(DataQuery, {
      props: defaultProps,
      global: {
        components: {
          ElButton,
          ElSelect,
          ElInputNumber
        }
      }
    })
  })

  it('应该正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.data-query').exists()).toBe(true)
  })

  it('应该显示查询构建器标题', () => {
    const title = wrapper.find('.query-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('数据查询构建器')
  })

  it('应该显示数据源选择器', () => {
    const dataSourceSelect = wrapper.find('select')
    expect(dataSourceSelect.exists()).toBe(true)
  })

  it('应该显示字段选择组件', () => {
    const fieldSelection = wrapper.find('.field-selection')
    expect(fieldSelection.exists()).toBe(true)
  })

  it('应该显示查询操作按钮', () => {
    const actionBar = wrapper.find('.query-actions-bar')
    expect(actionBar.exists()).toBe(true)
    
    const buttons = actionBar.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3) // 重置、预览、执行查询
  })

  it('应该在数据源变更时重置配置', async () => {
    // 设置初始值
    wrapper.vm.queryConfig.selectedFields = ['id', 'name']
    wrapper.vm.queryConfig.filters = { status: 'active' }
    
    // 触发数据源变更
    await wrapper.vm.onDataSourceChange('products')
    
    expect(wrapper.vm.queryConfig.selectedFields).toEqual([])
    expect(wrapper.vm.queryConfig.filters).toEqual({})
    expect(wrapper.vm.queryConfig.sortField).toBe('')
  })

  it('应该能够预览查询', async () => {
    // 设置必要的配置
    wrapper.vm.queryConfig.dataSource = 'orders'
    wrapper.vm.queryConfig.selectedFields = ['id', 'orderNumber']
    
    const previewSpy = vi.spyOn(wrapper.vm, '$emit')
    
    await wrapper.vm.previewQuery()
    
    expect(previewSpy).toHaveBeenCalledWith('preview', expect.objectContaining({
      dataSource: 'orders',
      selectedFields: ['id', 'orderNumber'],
      preview: true,
      limit: 10
    }))
  })

  it('应该能够执行查询', async () => {
    // 设置必要的配置
    wrapper.vm.queryConfig.dataSource = 'orders'
    wrapper.vm.queryConfig.selectedFields = ['id', 'orderNumber']
    
    const querySpy = vi.spyOn(wrapper.vm, '$emit')
    
    await wrapper.vm.executeQuery()
    
    expect(querySpy).toHaveBeenCalledWith('query', expect.objectContaining({
      dataSource: 'orders',
      selectedFields: ['id', 'orderNumber']
    }))
  })

  it('应该在缺少必要配置时显示警告', async () => {
    const { ElMessage } = await import('element-plus')
    
    // 清空配置
    wrapper.vm.queryConfig.dataSource = ''
    
    await wrapper.vm.executeQuery()
    
    expect(ElMessage.warning).toHaveBeenCalledWith('请选择数据源')
  })

  it('应该能够重置查询配置', () => {
    // 设置一些值
    wrapper.vm.queryConfig.dataSource = 'orders'
    wrapper.vm.queryConfig.selectedFields = ['id', 'name']
    wrapper.vm.queryConfig.filters = { status: 'active' }
    
    wrapper.vm.resetQuery()
    
    expect(wrapper.vm.queryConfig.dataSource).toBe('')
    expect(wrapper.vm.queryConfig.selectedFields).toEqual([])
    expect(wrapper.vm.queryConfig.filters).toEqual({})
  })

  it('应该根据数据源计算可用字段', () => {
    wrapper.vm.queryConfig.dataSource = 'orders'
    
    const availableFields = wrapper.vm.availableFields
    expect(availableFields.length).toBeGreaterThan(0)
    expect(availableFields[0]).toHaveProperty('key')
    expect(availableFields[0]).toHaveProperty('label')
  })

  it('应该计算可排序字段', () => {
    wrapper.vm.queryConfig.dataSource = 'orders'
    
    const sortableFields = wrapper.vm.sortableFields
    expect(sortableFields.length).toBeGreaterThan(0)
    
    // 验证只包含可排序的字段
    const sortableKeys = ['id', 'createdAt', 'totalAmount', 'price', 'totalQuantity']
    sortableFields.forEach((field: any) => {
      expect(sortableKeys).toContain(field.key)
    })
  })

  it('应该根据数据源计算基础筛选器', () => {
    wrapper.vm.queryConfig.dataSource = 'orders'
    
    const basicFilters = wrapper.vm.basicFilters
    expect(basicFilters.length).toBeGreaterThan(0)
    
    // 验证订单数据源的筛选器
    const statusFilter = basicFilters.find((f: any) => f.key === 'status')
    expect(statusFilter).toBeTruthy()
    expect(statusFilter.options).toBeTruthy()
  })

  it('应该根据数据源计算高级字段', () => {
    wrapper.vm.queryConfig.dataSource = 'orders'
    
    const advancedFields = wrapper.vm.advancedFields
    expect(advancedFields.length).toBeGreaterThan(0)
    
    advancedFields.forEach((field: any) => {
      expect(field).toHaveProperty('value')
      expect(field).toHaveProperty('type')
    })
  })

  it('应该根据数据源计算快速筛选', () => {
    wrapper.vm.queryConfig.dataSource = 'orders'
    
    const quickFilters = wrapper.vm.quickFilters
    expect(quickFilters.length).toBeGreaterThan(0)
    
    const todayFilter = quickFilters.find((f: any) => f.key === 'today_orders')
    expect(todayFilter).toBeTruthy()
    expect(todayFilter.conditions).toBeTruthy()
  })

  it('应该能够判断是否可以保存查询', () => {
    // 初始状态不能保存
    expect(wrapper.vm.canSaveQuery).toBe(false)
    
    // 设置必要条件
    wrapper.vm.queryConfig.dataSource = 'orders'
    wrapper.vm.queryConfig.selectedFields = ['id']
    
    expect(wrapper.vm.canSaveQuery).toBe(true)
  })

  it('应该能够获取字段类型', () => {
    expect(wrapper.vm.getFieldType('id')).toBe('number')
    expect(wrapper.vm.getFieldType('totalAmount')).toBe('number')
    expect(wrapper.vm.getFieldType('createdAt')).toBe('date')
    expect(wrapper.vm.getFieldType('status')).toBe('select')
    expect(wrapper.vm.getFieldType('name')).toBe('text')
  })

  it('应该在数据源变更时自动选择常用字段', async () => {
    wrapper.vm.queryConfig.dataSource = 'orders'
    
    // 触发监听器
    await wrapper.vm.$nextTick()
    
    const selectedFields = wrapper.vm.queryConfig.selectedFields
    expect(selectedFields).toContain('id')
  })

  it('应该能够处理筛选变更', () => {
    const filters = { status: 'active', keyword: '测试' }
    
    wrapper.vm.onFilterChange(filters)
    
    expect(wrapper.vm.queryConfig.filters).toEqual(filters)
  })

  it('应该暴露正确的方法', () => {
    expect(wrapper.vm.executeQuery).toBeDefined()
    expect(wrapper.vm.resetQuery).toBeDefined()
    expect(wrapper.vm.getQueryConfig).toBeDefined()
    
    const config = wrapper.vm.getQueryConfig()
    expect(config).toBe(wrapper.vm.queryConfig)
  })
})