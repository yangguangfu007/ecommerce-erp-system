import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElSelect, ElDatePicker, ElTag, ElDialog } from 'element-plus'
import EnhancedDataFilter from '../EnhancedDataFilter.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElSelect: { name: 'ElSelect', template: '<select><slot /></select>' },
  ElOption: { name: 'ElOption', template: '<option><slot /></option>' },
  ElDatePicker: { name: 'ElDatePicker', template: '<input type="date" />' },
  ElTag: { name: 'ElTag', template: '<span><slot /></span>' },
  ElDialog: { name: 'ElDialog', template: '<div><slot /></div>' },
  ElForm: { name: 'ElForm', template: '<form><slot /></form>' },
  ElFormItem: { name: 'ElFormItem', template: '<div><slot /></div>' },
  ElInput: { name: 'ElInput', template: '<input />' },
  ElInputNumber: { name: 'ElInputNumber', template: '<input type="number" />' },
  ElTable: { name: 'ElTable', template: '<table><slot /></table>' },
  ElTableColumn: { name: 'ElTableColumn', template: '<td><slot /></td>' },
  ElCollapseTransition: { name: 'ElCollapseTransition', template: '<div><slot /></div>' },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  FolderOpened: { name: 'FolderOpened' },
  DocumentAdd: { name: 'DocumentAdd' },
  Plus: { name: 'Plus' },
  Delete: { name: 'Delete' },
  Refresh: { name: 'Refresh' },
  View: { name: 'View' },
  Search: { name: 'Search' }
}))

describe('EnhancedDataFilter', () => {
  let wrapper: any

  const mockAvailableFields = [
    { value: 'name', label: '名称', type: 'text' as const },
    { value: 'price', label: '价格', type: 'number' as const },
    { value: 'status', label: '状态', type: 'select' as const, options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]},
    { value: 'createdAt', label: '创建时间', type: 'date' as const }
  ]

  const mockQuickFilters = [
    {
      key: 'active_items',
      label: '启用项目',
      active: false,
      conditions: [{ field: 'status', operator: 'eq', value: 'active' }]
    },
    {
      key: 'recent_items',
      label: '最近项目',
      active: false,
      conditions: [{ field: 'createdAt', operator: 'gt', value: '2024-01-01' }]
    }
  ]

  beforeEach(() => {
    wrapper = mount(EnhancedDataFilter, {
      props: {
        availableFields: mockAvailableFields,
        quickFilters: mockQuickFilters,
        cacheKey: 'test-filter'
      },
      global: {
        components: {
          ElButton,
          ElSelect,
          ElDatePicker,
          ElTag,
          ElDialog
        }
      }
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染筛选器头部', () => {
      expect(wrapper.find('.filter-header').exists()).toBe(true)
      expect(wrapper.find('.filter-title h3').text()).toBe('高级数据筛选')
    })

    it('应该渲染快速筛选标签', () => {
      expect(wrapper.find('.quick-filters-section').exists()).toBe(true)
      const quickFilterTags = wrapper.findAll('.quick-filter-tag')
      expect(quickFilterTags).toHaveLength(2)
      expect(quickFilterTags[0].text()).toBe('启用项目')
      expect(quickFilterTags[1].text()).toBe('最近项目')
    })

    it('应该渲染时间范围筛选', () => {
      expect(wrapper.find('.time-range-section').exists()).toBe(true)
      expect(wrapper.find('.time-range-controls').exists()).toBe(true)
    })

    it('应该渲染筛选条件构建器', () => {
      expect(wrapper.find('.multi-condition-section').exists()).toBe(true)
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('应该渲染筛选操作栏', () => {
      expect(wrapper.find('.filter-actions-bar').exists()).toBe(true)
      const buttons = wrapper.findAll('.filter-buttons .el-button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('快速筛选功能', () => {
    it('应该能够切换快速筛选状态', async () => {
      const quickFilterTag = wrapper.find('.quick-filter-tag')
      
      await quickFilterTag.trigger('click')
      
      expect(wrapper.vm.quickFilters[0].active).toBe(true)
    })

    it('应该在快速筛选激活时显示活跃筛选条件数量', async () => {
      // 激活一个快速筛选
      wrapper.vm.quickFilters[0].active = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activeFiltersCount).toBeGreaterThan(0)
    })
  })

  describe('时间范围筛选', () => {
    it('应该能够设置时间范围', async () => {
      const timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      
      await wrapper.setData({ timeRange })
      
      expect(wrapper.vm.timeRange).toEqual(timeRange)
      expect(wrapper.vm.activeFiltersCount).toBeGreaterThan(0)
    })

    it('应该能够应用时间范围预设', async () => {
      await wrapper.vm.applyTimeRangePreset('today')
      
      expect(wrapper.vm.timeRange).toHaveLength(2)
      expect(wrapper.vm.timeRange[0]).toContain(new Date().toISOString().split('T')[0])
    })

    it('应该在时间范围变更时触发事件', async () => {
      const timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      
      wrapper.vm.timeRange = timeRange
      await wrapper.vm.handleTimeRangeChange()
      
      expect(wrapper.emitted('timeRangeChange')).toBeTruthy()
      expect(wrapper.emitted('timeRangeChange')[0]).toEqual([timeRange])
    })
  })

  describe('筛选条件构建器', () => {
    it('应该能够添加筛选条件', async () => {
      const initialCount = wrapper.vm.filterConditions.length
      
      await wrapper.vm.addFilterCondition()
      
      expect(wrapper.vm.filterConditions.length).toBe(initialCount + 1)
      expect(wrapper.vm.filterConditions[wrapper.vm.filterConditions.length - 1]).toMatchObject({
        field: '',
        operator: '',
        value: null
      })
    })

    it('应该能够删除筛选条件', async () => {
      // 先添加一个条件
      await wrapper.vm.addFilterCondition()
      const initialCount = wrapper.vm.filterConditions.length
      
      await wrapper.vm.removeFilterCondition(0)
      
      expect(wrapper.vm.filterConditions.length).toBe(initialCount - 1)
    })

    it('应该根据字段类型返回正确的操作符选项', () => {
      const textOperators = wrapper.vm.getOperatorOptions('name')
      const numberOperators = wrapper.vm.getOperatorOptions('price')
      const selectOperators = wrapper.vm.getOperatorOptions('status')
      
      expect(textOperators).toContainEqual({ label: '包含', value: 'contains' })
      expect(numberOperators).toContainEqual({ label: '大于', value: 'gt' })
      expect(selectOperators).toContainEqual({ label: '等于', value: 'eq' })
    })

    it('应该根据字段类型和操作符返回正确的值组件', () => {
      const condition1 = { field: 'name', operator: 'contains', value: null }
      const condition2 = { field: 'price', operator: 'gt', value: null }
      const condition3 = { field: 'status', operator: 'eq', value: null }
      
      expect(wrapper.vm.getValueComponent(condition1)).toBe('el-input')
      expect(wrapper.vm.getValueComponent(condition2)).toBe('el-input-number')
      expect(wrapper.vm.getValueComponent(condition3)).toBe('el-select')
    })
  })

  describe('已应用筛选管理', () => {
    it('应该正确更新已应用筛选列表', async () => {
      // 设置时间范围
      wrapper.vm.timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      
      // 激活快速筛选
      wrapper.vm.quickFilters[0].active = true
      
      // 添加筛选条件
      wrapper.vm.filterConditions = [{
        id: 'test-1',
        field: 'name',
        operator: 'contains',
        value: 'test'
      }]
      
      await wrapper.vm.updateAppliedFilters()
      
      expect(wrapper.vm.appliedFilters.length).toBeGreaterThan(0)
      expect(wrapper.vm.appliedFilters.some(f => f.key === 'timeRange')).toBe(true)
      expect(wrapper.vm.appliedFilters.some(f => f.key.startsWith('quick_'))).toBe(true)
      expect(wrapper.vm.appliedFilters.some(f => f.key.startsWith('condition_'))).toBe(true)
    })

    it('应该能够移除已应用的筛选条件', async () => {
      // 设置一些筛选条件
      wrapper.vm.timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      wrapper.vm.quickFilters[0].active = true
      await wrapper.vm.updateAppliedFilters()
      
      const initialCount = wrapper.vm.appliedFilters.length
      const timeRangeFilter = wrapper.vm.appliedFilters.find(f => f.key === 'timeRange')
      
      await wrapper.vm.removeAppliedFilter(timeRangeFilter)
      
      expect(wrapper.vm.timeRange).toEqual([])
      expect(wrapper.vm.appliedFilters.length).toBeLessThan(initialCount)
    })
  })

  describe('筛选操作', () => {
    it('应该能够预览筛选结果', async () => {
      const previewSpy = vi.spyOn(wrapper.vm, 'previewFilter')
      
      await wrapper.vm.previewFilter()
      
      expect(previewSpy).toHaveBeenCalled()
      expect(wrapper.emitted('preview')).toBeTruthy()
    })

    it('应该能够应用筛选条件', async () => {
      const applySpy = vi.spyOn(wrapper.vm, 'applyFilter')
      
      await wrapper.vm.applyFilter()
      
      expect(applySpy).toHaveBeenCalled()
      expect(wrapper.emitted('filter')).toBeTruthy()
    })

    it('应该能够重置所有筛选条件', async () => {
      // 设置一些筛选条件
      wrapper.vm.timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      wrapper.vm.quickFilters[0].active = true
      wrapper.vm.filterConditions = [{ id: 'test', field: 'name', operator: 'contains', value: 'test' }]
      
      await wrapper.vm.resetAllFilters()
      
      expect(wrapper.vm.timeRange).toEqual([])
      expect(wrapper.vm.quickFilters[0].active).toBe(false)
      expect(wrapper.vm.filterConditions).toEqual([])
      expect(wrapper.vm.appliedFilters).toEqual([])
      expect(wrapper.emitted('reset')).toBeTruthy()
    })
  })

  describe('保存的筛选条件', () => {
    it('应该能够保存当前筛选条件', async () => {
      // 设置一些筛选条件
      wrapper.vm.timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      wrapper.vm.filterConditions = [{ id: 'test', field: 'name', operator: 'contains', value: 'test' }]
      
      wrapper.vm.saveFilterForm.name = '测试筛选'
      wrapper.vm.saveFilterForm.description = '测试描述'
      
      const initialCount = wrapper.vm.savedFilters.length
      
      await wrapper.vm.confirmSaveFilter()
      
      expect(wrapper.vm.savedFilters.length).toBe(initialCount + 1)
      expect(wrapper.vm.savedFilters[0].name).toBe('测试筛选')
    })

    it('应该能够应用保存的筛选条件', async () => {
      const savedFilter = {
        id: 'test-filter',
        name: '测试筛选',
        description: '测试描述',
        conditions: [{ id: 'test', field: 'name', operator: 'contains', value: 'test' }],
        timeRange: ['2024-01-01 00:00:00', '2024-12-31 23:59:59'],
        conditionsCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await wrapper.vm.applySavedFilter(savedFilter)
      
      expect(wrapper.vm.filterConditions).toEqual(savedFilter.conditions)
      expect(wrapper.vm.timeRange).toEqual(savedFilter.timeRange)
    })

    it('应该能够删除保存的筛选条件', async () => {
      // 添加一个保存的筛选条件
      wrapper.vm.savedFilters = [{
        id: 'test-filter',
        name: '测试筛选',
        description: '测试描述',
        conditions: [],
        timeRange: null,
        conditionsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
      
      const initialCount = wrapper.vm.savedFilters.length
      
      // Mock ElMessageBox.confirm to resolve
      const { ElMessageBox } = await import('element-plus')
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      await wrapper.vm.deleteSavedFilter(wrapper.vm.savedFilters[0])
      
      expect(wrapper.vm.savedFilters.length).toBe(initialCount - 1)
    })
  })

  describe('计算属性', () => {
    it('应该正确计算活跃筛选条件数量', async () => {
      expect(wrapper.vm.activeFiltersCount).toBe(0)
      
      // 设置时间范围
      wrapper.vm.timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeFiltersCount).toBe(1)
      
      // 激活快速筛选
      wrapper.vm.quickFilters[0].active = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeFiltersCount).toBe(2)
      
      // 添加筛选条件
      wrapper.vm.filterConditions = [{ id: 'test', field: 'name', operator: 'contains', value: 'test' }]
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeFiltersCount).toBe(3)
    })

    it('应该正确判断是否有活跃筛选条件', async () => {
      expect(wrapper.vm.hasActiveFilters).toBe(false)
      
      wrapper.vm.timeRange = ['2024-01-01 00:00:00', '2024-12-31 23:59:59']
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })

    it('应该正确过滤保存的筛选条件', async () => {
      wrapper.vm.savedFilters = [
        { id: '1', name: '测试筛选1', description: '描述1' },
        { id: '2', name: '生产筛选2', description: '描述2' },
        { id: '3', name: '测试筛选3', description: '生产描述' }
      ]
      
      wrapper.vm.filterSearchKeyword = '测试'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.filteredSavedFilters).toHaveLength(2)
      expect(wrapper.vm.filteredSavedFilters.every(f => f.name.includes('测试'))).toBe(true)
    })
  })

  describe('工具方法', () => {
    it('应该生成唯一的条件ID', () => {
      const id1 = wrapper.vm.generateConditionId()
      const id2 = wrapper.vm.generateConditionId()
      
      expect(id1).toMatch(/^condition_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^condition_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('应该正确格式化日期时间', () => {
      const dateTime = '2024-01-01T12:00:00.000Z'
      const formatted = wrapper.vm.formatDateTime(dateTime)
      
      expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
    })

    it('应该正确获取字段选项', () => {
      const options = wrapper.vm.getFieldOptions('status')
      
      expect(options).toEqual([
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ])
    })

    it('应该正确获取值输入占位符', () => {
      const placeholder1 = wrapper.vm.getValuePlaceholder('name')
      const placeholder2 = wrapper.vm.getValuePlaceholder('unknown')
      
      expect(placeholder1).toBe('请输入名称')
      expect(placeholder2).toBe('请输入值')
    })
  })
})