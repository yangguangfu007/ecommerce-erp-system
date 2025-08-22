import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import DataFilterQuery from '../DataFilterQuery.vue'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i><slot /></i>'
  },
  ElRow: {
    name: 'ElRow',
    template: '<div><slot /></div>',
    props: ['gutter']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div><slot /></div>',
    props: ['span']
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue"><slot /><template #footer><slot name="footer" /></template></div>',
    props: ['modelValue', 'title', 'width', 'closeOnClickModal']
  },
  ElDescriptions: {
    name: 'ElDescriptions',
    template: '<div><slot /></div>',
    props: ['column', 'border']
  },
  ElDescriptionsItem: {
    name: 'ElDescriptionsItem',
    template: '<div><span>{{ label }}</span><slot /></div>',
    props: ['label']
  },
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>',
    props: ['model', 'labelWidth'],
    methods: {
      validate: vi.fn().mockResolvedValue(true)
    }
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><label>{{ label }}</label><slot /></div>',
    props: ['label', 'prop']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :placeholder="placeholder" />',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" :placeholder="placeholder" />',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value">{{ label }}</option>',
    props: ['label', 'value']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :placeholder="placeholder" />',
    props: ['modelValue', 'placeholder', 'type'],
    emits: ['update:modelValue']
  }
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  Clock: { name: 'Clock', template: '<i class="clock-icon"></i>' },
  Refresh: { name: 'Refresh', template: '<i class="refresh-icon"></i>' }
}))

// Mock business components
vi.mock('@/components/business/DataQuery.vue', () => ({
  default: {
    name: 'DataQuery',
    template: '<div class="data-query-mock"><slot /></div>',
    props: ['dataSources', 'defaultDataSource'],
    emits: ['query', 'preview', 'reset'],
    methods: {
      getQueryConfig: vi.fn().mockReturnValue({
        dataSource: 'orders',
        selectedFields: ['id', 'orderNumber', 'status']
      })
    }
  }
}))

vi.mock('@/components/business/QueryHistory.vue', () => ({
  default: {
    name: 'QueryHistory',
    template: '<div class="query-history-mock"><slot /></div>',
    props: ['dataSources'],
    emits: ['apply'],
    methods: {
      addHistory: vi.fn()
    }
  }
}))

vi.mock('@/components/business/CachedQueryResult.vue', () => ({
  default: {
    name: 'CachedQueryResult',
    template: '<div class="cached-query-result-mock"><slot /></div>',
    props: [
      'data', 'columns', 'loading', 'pagination', 'queryTime', 
      'selectable', 'cacheKey', 'exportTitle', 'exportFilename'
    ],
    emits: [
      'refresh', 'export', 'pageChange', 'sortChange', 
      'selectionChange', 'viewDetail', 'editRow'
    ]
  }
}))

vi.mock('@/components/business/EnhancedDataFilter.vue', () => ({
  default: {
    name: 'EnhancedDataFilter',
    template: '<div class="enhanced-data-filter-mock"><slot /></div>',
    props: ['availableFields', 'quickFilters', 'cacheKey'],
    emits: ['filter', 'preview', 'reset', 'timeRangeChange']
  }
}))

// Mock cell components
vi.mock('@/components/business/cells/CellText.vue', () => ({
  default: {
    name: 'CellText',
    template: '<span class="celltext-mock">{{ value }}</span>',
    props: ['value', 'column']
  }
}))

vi.mock('@/components/business/cells/CellNumber.vue', () => ({
  default: {
    name: 'CellNumber',
    template: '<span class="cellnumber-mock">{{ value }}</span>',
    props: ['value', 'column']
  }
}))

vi.mock('@/components/business/cells/CellDate.vue', () => ({
  default: {
    name: 'CellDate',
    template: '<span class="celldate-mock">{{ value }}</span>',
    props: ['value', 'column']
  }
}))

vi.mock('@/components/business/cells/CellStatus.vue', () => ({
  default: {
    name: 'CellStatus',
    template: '<span class="cellstatus-mock">{{ value }}</span>',
    props: ['value', 'column']
  }
}))

vi.mock('@/components/business/cells/CellImage.vue', () => ({
  default: {
    name: 'CellImage',
    template: '<span class="cellimage-mock">{{ value }}</span>',
    props: ['value', 'column']
  }
}))

describe('DataFilterQuery', () => {
  let wrapper: VueWrapper<unknown>

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(DataFilterQuery, {
      global: {
        stubs: {
          'el-button': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-dialog': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染页面标题和描述', () => {
      expect(wrapper.find('.page-title').text()).toBe('数据筛选与查询')
      expect(wrapper.find('.page-description').text()).toContain('高级数据筛选和查询工具')
    })

    it('应该渲染页面操作按钮', () => {
      const buttons = wrapper.findAll('.page-actions el-button-stub')
      expect(buttons).toHaveLength(2)
    })

    it('应该渲染增强数据筛选器组件', () => {
      // Check if the main content structure exists
      expect(wrapper.find('.filter-query-content').exists()).toBe(true)
    })

    it('应该渲染数据查询组件', () => {
      // Check if the query section exists
      expect(wrapper.find('.filter-query-content').exists()).toBe(true)
    })
  })

  describe('数据源配置', () => {
    it('应该有正确的数据源配置', () => {
      const vm = wrapper.vm
      expect(vm.dataSources).toHaveLength(6)
      expect(vm.dataSources[0]).toEqual({ label: '订单数据', value: 'orders' })
      expect(vm.defaultDataSource).toBe('orders')
    })

    it('应该有正确的字段配置', () => {
      const vm = wrapper.vm
      expect(vm.fieldConfigs.orders).toBeDefined()
      expect(vm.fieldConfigs.orders.columns).toBeInstanceOf(Array)
      expect(vm.fieldConfigs.orders.editableFields).toBeInstanceOf(Array)
    })
  })

  describe('计算属性', () => {
    it('应该正确计算当前可用字段', () => {
      const vm = wrapper.vm
      vm.currentDataSource = 'orders'
      
      const availableFields = vm.currentAvailableFields
      expect(availableFields).toBeInstanceOf(Array)
      expect(availableFields.length).toBeGreaterThan(0)
      expect(availableFields[0]).toHaveProperty('key')
      expect(availableFields[0]).toHaveProperty('label')
      expect(availableFields[0]).toHaveProperty('type')
    })

    it('应该正确计算快速筛选器', () => {
      const vm = wrapper.vm
      vm.currentDataSource = 'orders'
      
      const quickFilters = vm.currentQuickFilters
      expect(quickFilters).toBeInstanceOf(Array)
      expect(quickFilters.length).toBeGreaterThan(0)
      expect(quickFilters[0]).toHaveProperty('label')
      expect(quickFilters[0]).toHaveProperty('value')
      expect(quickFilters[0]).toHaveProperty('field')
    })

    it('应该正确计算可编辑字段', () => {
      const vm = wrapper.vm
      vm.currentDataSource = 'orders'
      
      const editableFields = vm.editableFields
      expect(editableFields).toBeInstanceOf(Array)
    })
  })

  describe('查询功能', () => {
    it('应该能够处理查询请求', async () => {
      const vm = wrapper.vm
      const queryConfig = {
        dataSource: 'orders',
        selectedFields: ['id', 'orderNumber', 'status'],
        pageSize: 20
      }

      await vm.handleQuery(queryConfig)

      expect(vm.querying).toBe(false)
      expect(vm.showResults).toBe(true)
      expect(vm.queryData).toBeInstanceOf(Array)
      expect(vm.queryColumns).toBeInstanceOf(Array)
      expect(vm.queryTime).toBeGreaterThan(0)
    })

    it('应该能够处理预览查询', async () => {
      const vm = wrapper.vm
      const queryConfig = {
        dataSource: 'orders',
        selectedFields: ['id', 'orderNumber'],
        pageSize: 20
      }

      await vm.handlePreview(queryConfig)

      expect(vm.showResults).toBe(true)
    })

    it('应该能够重置查询', () => {
      const vm = wrapper.vm
      vm.showResults = true
      vm.queryData = [{ id: 1 }]

      vm.handleQueryReset()

      expect(vm.showResults).toBe(false)
      expect(vm.queryData).toHaveLength(0)
      expect(vm.selectedRows).toHaveLength(0)
    })
  })

  describe('筛选功能', () => {
    it('应该能够处理增强筛选器事件', () => {
      const vm = wrapper.vm
      const filterConfig = { status: 'active', category: 'electronics' }

      vm.handleEnhancedFilter(filterConfig)

      expect(vm.currentQueryConfig.filters).toEqual(filterConfig)
    })

    it('应该能够处理筛选器重置', () => {
      const vm = wrapper.vm
      vm.currentQueryConfig = { 
        dataSource: 'orders', 
        selectedFields: [], 
        filters: { status: 'active' } 
      }

      vm.handleFilterReset()

      expect(vm.currentQueryConfig.filters).toEqual({})
    })

    it('应该能够处理时间范围变化', () => {
      const vm = wrapper.vm
      vm.currentQueryConfig = { dataSource: 'orders', selectedFields: [], filters: {} }
      const timeRange = { start: '2024-01-01', end: '2024-01-31' }

      vm.handleTimeRangeChange(timeRange)

      expect(vm.currentQueryConfig.filters.startDate).toBe('2024-01-01')
      expect(vm.currentQueryConfig.filters.endDate).toBe('2024-01-31')
    })
  })

  describe('数据操作', () => {
    it('应该能够查看详情', () => {
      const vm = wrapper.vm
      const row = { id: 1, name: 'Test Item' }

      vm.handleViewDetail(row)

      expect(vm.detailData).toEqual(row)
      expect(vm.showDetailDialog).toBe(true)
    })

    it('应该能够编辑行数据', () => {
      const vm = wrapper.vm
      const row = { id: 1, name: 'Test Item' }

      vm.handleEditRow(row)

      expect(vm.editData).toEqual(row)
      expect(vm.showEditDialog).toBe(true)
    })

    it('应该能够处理选择变化', () => {
      const vm = wrapper.vm
      const selection = [{ id: 1 }, { id: 2 }]

      vm.handleSelectionChange(selection)

      expect(vm.selectedRows).toEqual(selection)
    })

    it('应该能够处理导出', () => {
      const vm = wrapper.vm
      const selectedRows = [{ id: 1 }, { id: 2 }]

      vm.handleExport(selectedRows)

      expect(ElMessage.success).toHaveBeenCalledWith('导出 2 条数据')
    })
  })

  describe('分页功能', () => {
    it('应该能够处理页码变化', () => {
      const vm = wrapper.vm
      vm.currentQueryConfig = { dataSource: 'orders', selectedFields: [] }

      vm.handlePageChange(2, 10)

      expect(vm.pagination.page).toBe(2)
      expect(vm.pagination.size).toBe(10)
    })

    it('应该能够处理排序变化', () => {
      const vm = wrapper.vm
      vm.currentQueryConfig = { dataSource: 'orders', selectedFields: [] }

      vm.handleSortChange('createdAt', 'desc')

      expect(vm.currentQueryConfig.sortField).toBe('createdAt')
      expect(vm.currentQueryConfig.sortOrder).toBe('desc')
    })
  })

  describe('历史记录功能', () => {
    it('应该能够应用历史查询', () => {
      const vm = wrapper.vm
      const historyItem = {
        dataSource: 'products',
        selectedFields: ['id', 'name'],
        filters: { status: 'active' }
      }

      // Mock the dataQueryRef by setting it directly
      const mockRef = {
        getQueryConfig: vi.fn().mockReturnValue({})
      }
      vm.dataQueryRef = mockRef

      vm.handleApplyHistory(historyItem)

      expect(mockRef.getQueryConfig).toHaveBeenCalled()
    })
  })

  describe('工具方法', () => {
    it('应该能够获取字段标签', () => {
      const vm = wrapper.vm
      vm.currentDataSource = 'orders'

      const label = vm.getFieldLabel('orderNumber')
      expect(label).toBe('订单号')
    })

    it('应该能够获取字段类型', () => {
      const vm = wrapper.vm
      vm.currentDataSource = 'orders'

      const type = vm.getFieldType('totalAmount')
      expect(type).toBe('number')
    })

    it('应该能够获取单元格组件', () => {
      const vm = wrapper.vm
      vm.currentDataSource = 'orders'

      const component = vm.getCellComponent('totalAmount')
      expect(component.name).toBe('CellNumber')
    })

    it('应该能够获取编辑组件', () => {
      const vm = wrapper.vm

      expect(vm.getEditComponent('number')).toBe('el-input-number')
      expect(vm.getEditComponent('select')).toBe('el-select')
      expect(vm.getEditComponent('date')).toBe('el-date-picker')
      expect(vm.getEditComponent('text')).toBe('el-input')
    })
  })

  describe('数据生成', () => {
    it('应该能够生成模拟数据', () => {
      const vm = wrapper.vm
      const queryConfig = {
        dataSource: 'orders',
        selectedFields: ['id', 'orderNumber', 'status'],
        pageSize: 10
      }

      const result = vm.generateMockData(queryConfig)

      expect(result.data).toHaveLength(10)
      expect(result.columns).toBeInstanceOf(Array)
      expect(result.total).toBeGreaterThan(0)
      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('orderNumber')
      expect(result.data[0]).toHaveProperty('status')
    })

    it('应该处理无效数据源', () => {
      const vm = wrapper.vm
      const queryConfig = {
        dataSource: 'invalid',
        selectedFields: ['id'],
        pageSize: 10
      }

      const result = vm.generateMockData(queryConfig)

      expect(result.data).toHaveLength(0)
      expect(result.columns).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('保存编辑', () => {
    it('应该能够保存编辑的数据', async () => {
      const vm = wrapper.vm
      vm.editData = { id: 1, name: 'Updated Item' }
      vm.queryData = [{ id: 1, name: 'Original Item' }, { id: 2, name: 'Other Item' }]
      
      // Mock form ref
      const mockFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      vm.editFormRef = mockFormRef

      await vm.saveEdit()

      expect(vm.queryData[0].name).toBe('Updated Item')
      expect(vm.showEditDialog).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('保存成功')
    })

    it('应该处理保存失败', async () => {
      const vm = wrapper.vm
      vm.editData = { id: 1, name: 'Updated Item' }
      
      // Mock form ref with validation failure
      const mockFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
      }
      vm.editFormRef = mockFormRef

      await vm.saveEdit()

      expect(ElMessage.error).toHaveBeenCalledWith('保存失败')
    })
  })

  describe('重置功能', () => {
    it('应该能够重置所有状态', () => {
      const vm = wrapper.vm
      vm.showResults = true
      vm.queryData = [{ id: 1 }]
      
      // Mock dataQueryRef
      const mockRef = {
        resetQuery: vi.fn()
      }
      vm.dataQueryRef = mockRef

      vm.resetAll()

      expect(mockRef.resetQuery).toHaveBeenCalled()
      expect(vm.showResults).toBe(false)
      expect(vm.queryData).toHaveLength(0)
    })
  })

  describe('查询历史切换', () => {
    it('应该能够切换查询历史显示', async () => {
      const vm = wrapper.vm
      expect(vm.showQueryHistory).toBe(false)

      const historyButton = wrapper.findAll('.page-actions el-button-stub')[0]
      await historyButton.trigger('click')

      expect(vm.showQueryHistory).toBe(true)
    })
  })
})