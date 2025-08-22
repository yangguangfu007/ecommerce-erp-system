import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElTable, ElTableColumn, ElPagination, ElTag } from 'element-plus'
import QueryResult from '../QueryResult.vue'

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button :loading="loading" :disabled="disabled" :type="type" :size="size"><slot /></button>',
    props: ['loading', 'disabled', 'type', 'size', 'text']
  },
  ElTable: {
    name: 'ElTable',
    template: '<table class="el-table" :loading="loading" :data="data"><slot /></table>',
    props: ['data', 'loading', 'border', 'stripe', 'height'],
    emits: ['selection-change', 'sort-change'],
    methods: {
      clearSelection: vi.fn(),
      toggleRowSelection: vi.fn()
    }
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td><slot /></td>',
    props: ['type', 'prop', 'label', 'width', 'minWidth', 'sortable', 'showOverflowTooltip', 'fixed']
  },
  ElPagination: {
    name: 'ElPagination',
    template: '<div class="el-pagination"></div>',
    props: ['currentPage', 'pageSize', 'pageSizes', 'total', 'layout'],
    emits: ['size-change', 'current-change', 'update:current-page', 'update:page-size']
  },
  ElTag: {
    name: 'ElTag',
    template: '<span :type="type"><slot /></span>',
    props: ['type']
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue" class="el-dialog"><slot /><div class="el-dialog__footer"><slot name="footer" /></div></div>',
    props: ['modelValue', 'title', 'width'],
    emits: ['update:modelValue']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
    props: ['modelValue', 'min', 'max', 'size', 'controlsPosition'],
    emits: ['update:modelValue']
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue'],
    emits: ['update:modelValue', 'change']
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
  Refresh: { name: 'Refresh' },
  Setting: { name: 'Setting' },
  Download: { name: 'Download' },
  ArrowUp: { name: 'ArrowUp' },
  ArrowDown: { name: 'ArrowDown' }
}))

// Mock 单元格组件
vi.mock('../cells/CellText.vue', () => ({
  default: {
    name: 'CellText',
    template: '<span>{{ value }}</span>',
    props: ['value', 'column', 'row']
  }
}))

vi.mock('../cells/CellNumber.vue', () => ({
  default: {
    name: 'CellNumber',
    template: '<span>{{ value }}</span>',
    props: ['value', 'column', 'row']
  }
}))

vi.mock('../cells/CellDate.vue', () => ({
  default: {
    name: 'CellDate',
    template: '<span>{{ value }}</span>',
    props: ['value', 'column', 'row']
  }
}))

vi.mock('../cells/CellStatus.vue', () => ({
  default: {
    name: 'CellStatus',
    template: '<span>{{ value }}</span>',
    props: ['value', 'column', 'row']
  }
}))

vi.mock('../cells/CellImage.vue', () => ({
  default: {
    name: 'CellImage',
    template: '<span>{{ value }}</span>',
    props: ['value', 'column', 'row']
  }
}))

describe('QueryResult', () => {
  let wrapper: any

  const mockData = [
    { id: 1, name: '商品1', price: 100, status: 'active' },
    { id: 2, name: '商品2', price: 200, status: 'inactive' }
  ]

  const mockColumns = [
    { key: 'id', label: 'ID', type: 'number', sortable: true },
    { key: 'name', label: '名称', type: 'text' },
    { key: 'price', label: '价格', type: 'number', sortable: true },
    { key: 'status', label: '状态', type: 'status' }
  ]

  const defaultProps = {
    data: mockData,
    columns: mockColumns,
    loading: false,
    pagination: { page: 1, size: 20, total: 100 },
    selectable: true,
    showIndex: true,
    showActions: true,
    showPagination: true,
    queryTime: 1500
  }

  beforeEach(() => {
    wrapper = mount(QueryResult, {
      props: defaultProps,
      global: {
        components: {
          ElButton,
          ElTable,
          ElTableColumn,
          ElPagination,
          ElTag
        }
      }
    })
  })

  it('应该正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.query-result').exists()).toBe(true)
  })

  it('应该显示结果头部信息', () => {
    const header = wrapper.find('.result-header')
    expect(header.exists()).toBe(true)
    
    const title = wrapper.find('.result-title')
    expect(title.text()).toBe('查询结果')
    
    const stats = wrapper.find('.result-stats')
    expect(stats.exists()).toBe(true)
  })

  it('应该显示查询统计信息', () => {
    const stats = wrapper.find('.result-stats')
    expect(stats.text()).toContain('共 100 条记录')
    expect(stats.text()).toContain('查询耗时: 1500ms')
  })

  it('应该显示数据表格', () => {
    const table = wrapper.find('.el-table')
    expect(table.exists()).toBe(true)
  })

  it('应该显示分页组件', () => {
    const pagination = wrapper.find('.el-pagination')
    expect(pagination.exists()).toBe(true)
  })

  it('应该显示操作按钮', () => {
    const actions = wrapper.find('.result-actions')
    expect(actions.exists()).toBe(true)
    
    const buttons = actions.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3) // 刷新、列设置、导出
  })

  it('应该能够刷新数据', async () => {
    const refreshBtn = wrapper.find('.result-actions button')
    await refreshBtn.trigger('click')
    
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('应该能够导出数据', async () => {
    const exportBtn = wrapper.findAll('.result-actions button')[2] // 第三个按钮是导出
    await exportBtn.trigger('click')
    
    expect(wrapper.emitted('export')).toBeTruthy()
  })

  it('应该能够处理分页变更', () => {
    wrapper.vm.onPageChange(2)
    expect(wrapper.emitted('pageChange')).toBeTruthy()
    expect(wrapper.emitted('pageChange')[0]).toEqual([2, 20])
  })

  it('应该能够处理页面大小变更', () => {
    wrapper.vm.onPageSizeChange(50)
    expect(wrapper.emitted('pageChange')).toBeTruthy()
    expect(wrapper.emitted('pageChange')[0]).toEqual([1, 50])
  })

  it('应该能够处理排序变更', () => {
    const sortData = { prop: 'price', order: 'ascending' }
    wrapper.vm.onSortChange(sortData)
    
    expect(wrapper.emitted('sortChange')).toBeTruthy()
    expect(wrapper.emitted('sortChange')[0]).toEqual(['price', 'asc'])
  })

  it('应该能够处理选择变更', () => {
    const selection = [mockData[0]]
    wrapper.vm.onSelectionChange(selection)
    
    expect(wrapper.vm.selectedRows).toEqual(selection)
    expect(wrapper.emitted('selectionChange')).toBeTruthy()
    expect(wrapper.emitted('selectionChange')[0]).toEqual([selection])
  })

  it('应该能够查看详情', () => {
    const row = mockData[0]
    wrapper.vm.viewDetail(row)
    
    expect(wrapper.emitted('viewDetail')).toBeTruthy()
    expect(wrapper.emitted('viewDetail')[0]).toEqual([row])
  })

  it('应该能够编辑行', () => {
    const row = mockData[0]
    wrapper.vm.editRow(row)
    
    expect(wrapper.emitted('editRow')).toBeTruthy()
    expect(wrapper.emitted('editRow')[0]).toEqual([row])
  })

  it('应该计算可见列', () => {
    const visibleColumns = wrapper.vm.visibleColumns
    expect(visibleColumns.length).toBe(mockColumns.length)
    
    // 隐藏一列
    wrapper.vm.allColumns[0].visible = false
    const updatedVisibleColumns = wrapper.vm.visibleColumns
    expect(updatedVisibleColumns.length).toBe(mockColumns.length - 1)
  })

  it('应该能够获取行索引', () => {
    const index = wrapper.vm.getRowIndex(0)
    expect(index).toBe(1) // (1-1) * 20 + 0 + 1 = 1
    
    // 测试第二页
    wrapper.setProps({ pagination: { page: 2, size: 20, total: 100 } })
    const index2 = wrapper.vm.getRowIndex(0)
    expect(index2).toBe(21) // (2-1) * 20 + 0 + 1 = 21
  })

  it('应该能够获取正确的单元格组件', () => {
    const textColumn = { type: 'text' }
    const numberColumn = { type: 'number' }
    const dateColumn = { type: 'date' }
    const statusColumn = { type: 'status' }
    const imageColumn = { type: 'image' }
    
    expect(wrapper.vm.getCellComponent(textColumn).name).toBe('CellText')
    expect(wrapper.vm.getCellComponent(numberColumn).name).toBe('CellNumber')
    expect(wrapper.vm.getCellComponent(dateColumn).name).toBe('CellDate')
    expect(wrapper.vm.getCellComponent(statusColumn).name).toBe('CellStatus')
    expect(wrapper.vm.getCellComponent(imageColumn).name).toBe('CellImage')
  })

  it('应该能够打开列设置对话框', async () => {
    expect(wrapper.vm.showColumnSettings).toBe(false)
    
    const settingBtn = wrapper.findAll('.result-actions button')[1] // 第二个按钮是列设置
    await settingBtn.trigger('click')
    
    expect(wrapper.vm.showColumnSettings).toBe(true)
  })

  it('应该能够全选和全不选列', () => {
    wrapper.vm.selectAllColumns()
    wrapper.vm.allColumns.forEach((col: any) => {
      expect(col.visible).toBe(true)
    })
    
    wrapper.vm.deselectAllColumns()
    wrapper.vm.allColumns.forEach((col: any) => {
      expect(col.visible).toBe(false)
    })
  })

  it('应该能够重置列设置', () => {
    // 修改列设置
    wrapper.vm.allColumns[0].visible = false
    wrapper.vm.allColumns[0].width = 200
    
    wrapper.vm.resetColumnSettings()
    
    expect(wrapper.vm.allColumns[0].visible).toBe(true)
    expect(wrapper.vm.allColumns[0].width).toBe(mockColumns[0].width)
  })

  it('应该能够移动列位置', () => {
    const originalOrder = wrapper.vm.allColumns.map((col: any) => col.key)
    
    // 向上移动第二列
    wrapper.vm.moveColumnUp(1)
    const newOrder = wrapper.vm.allColumns.map((col: any) => col.key)
    
    expect(newOrder[0]).toBe(originalOrder[1])
    expect(newOrder[1]).toBe(originalOrder[0])
  })

  it('应该能够应用列设置', async () => {
    const { ElMessage } = await import('element-plus')
    
    wrapper.vm.applyColumnSettings()
    
    expect(wrapper.vm.showColumnSettings).toBe(false)
    expect(ElMessage.success).toHaveBeenCalledWith('列设置已应用')
  })

  it('应该暴露正确的方法', () => {
    expect(wrapper.vm.clearSelection).toBeDefined()
    expect(wrapper.vm.toggleRowSelection).toBeDefined()
    expect(wrapper.vm.getSelectedRows).toBeDefined()
    
    const selectedRows = wrapper.vm.getSelectedRows()
    expect(selectedRows).toEqual(wrapper.vm.selectedRows)
  })

  it('应该在加载状态下显示正确的标签', async () => {
    await wrapper.setProps({ loading: true })
    
    const stats = wrapper.find('.result-stats')
    expect(stats.text()).toContain('查询中...')
  })

  it('应该在无数据时显示正确的标签', async () => {
    await wrapper.setProps({ data: [] })
    
    const stats = wrapper.find('.result-stats')
    expect(stats.text()).toContain('暂无数据')
  })

  it('应该监听列配置变更', async () => {
    const newColumns = [
      { key: 'id', label: 'ID', type: 'number', visible: true },
      { key: 'name', label: '名称', type: 'text', visible: false }
    ]
    
    await wrapper.setProps({ columns: newColumns })
    
    expect(wrapper.vm.allColumns.length).toBe(2)
    expect(wrapper.vm.allColumns[0].visible).toBe(true)
    expect(wrapper.vm.allColumns[1].visible).toBe(false)
  })
})