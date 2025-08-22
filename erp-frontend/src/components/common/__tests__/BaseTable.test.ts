import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import BaseTable from '../BaseTable.vue'

// Mock BaseButton component
vi.mock('../BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot></slot></button>',
    props: ['disabled', 'size'],
    emits: ['click']
  }
}))

describe('BaseTable', () => {
  const mockColumns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: '姓名', sortable: false },
    { key: 'email', title: '邮箱' },
    { key: 'status', title: '状态' }
  ]

  const mockData = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: '正常' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: '禁用' },
    { id: 3, name: '王五', email: 'wangwu@example.com', status: '正常' }
  ]

  it('渲染基础表格', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData
      }
    })
    
    expect(wrapper.find('.data-table-container').exists()).toBe(true)
    expect(wrapper.find('.data-table').exists()).toBe(true)
    expect(wrapper.findAll('thead tr th')).toHaveLength(mockColumns.length)
    expect(wrapper.findAll('tbody tr')).toHaveLength(mockData.length)
  })

  it('显示表格标题和数量', () => {
    const wrapper = mount(BaseTable, {
      props: {
        title: '用户列表',
        columns: mockColumns,
        data: mockData,
        total: 100,
        showCount: true
      }
    })
    
    expect(wrapper.find('.table-header').exists()).toBe(true)
    expect(wrapper.find('.table-title h3').text()).toBe('用户列表')
    expect(wrapper.find('.table-count').text()).toContain('共 100 条记录')
  })

  it('支持可选择行', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true
      }
    })
    
    // 检查全选复选框
    expect(wrapper.find('thead .selection-column input[type="checkbox"]').exists()).toBe(true)
    
    // 检查每行的复选框
    const rowCheckboxes = wrapper.findAll('tbody .selection-column input[type="checkbox"]')
    expect(rowCheckboxes).toHaveLength(mockData.length)
  })

  it('处理全选操作', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true
      }
    })
    
    const selectAllCheckbox = wrapper.find('thead .selection-column input[type="checkbox"]')
    await selectAllCheckbox.setValue(true)
    await selectAllCheckbox.trigger('change')
    
    expect(wrapper.emitted('selection-change')?.[0][0]).toHaveLength(mockData.length)
  })

  it('处理单行选择', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true
      }
    })
    
    const firstRowCheckbox = wrapper.find('tbody tr:first-child .selection-column input[type="checkbox"]')
    await firstRowCheckbox.setValue(true)
    await firstRowCheckbox.trigger('change')
    
    const emittedSelections = wrapper.emitted('selection-change')?.[0][0] as any[]
    expect(emittedSelections).toBeDefined()
    expect(emittedSelections.length).toBeGreaterThan(0)
    expect(emittedSelections).toContainEqual(mockData[0])
  })

  it('支持排序功能', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        sortField: '',
        sortOrder: 'asc'
      }
    })
    
    const sortableHeader = wrapper.find('thead th.sortable')
    await sortableHeader.trigger('click')
    
    expect(wrapper.emitted('sort-change')).toBeTruthy()
    expect(wrapper.emitted('update:sortField')).toBeTruthy()
    expect(wrapper.emitted('update:sortOrder')).toBeTruthy()
  })

  it('显示排序图标', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        sortField: 'id',
        sortOrder: 'asc'
      }
    })
    
    const sortIcon = wrapper.find('.sort-icon')
    expect(sortIcon.exists()).toBe(true)
  })

  it('处理行点击事件', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData
      }
    })
    
    const firstRow = wrapper.find('tbody tr:first-child')
    await firstRow.trigger('click')
    
    expect(wrapper.emitted('row-click')?.[0]).toEqual([mockData[0], 0])
  })

  it('支持分页功能', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        showPagination: true,
        currentPage: 2,
        pageSize: 10,
        total: 50
      }
    })
    
    expect(wrapper.find('.table-pagination').exists()).toBe(true)
    expect(wrapper.find('.pagination-info').text()).toContain('显示第 11 到 20 条')
  })

  it('处理页码变更', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        showPagination: true,
        currentPage: 1,
        pageSize: 10,
        total: 50
      }
    })
    
    const nextButton = wrapper.findAll('button').find(btn => 
      btn.find('i.fa-chevron-right').exists()
    )
    
    if (nextButton) {
      await nextButton.trigger('click')
      expect(wrapper.emitted('page-change')?.[0]).toEqual([2])
      expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([2])
    }
  })

  it('显示空状态', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: [],
        emptyText: '暂无用户数据'
      }
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-description').text()).toBe('暂无用户数据')
  })

  it('显示加载状态', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: [],
        loading: true
      }
    })
    
    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('支持操作列插槽', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      slots: {
        actions: '<button class="action-btn">编辑</button>'
      }
    })
    
    expect(wrapper.find('thead .actions-column').exists()).toBe(true)
    expect(wrapper.findAll('tbody .action-btn')).toHaveLength(mockData.length)
  })

  it('支持自定义列插槽', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      slots: {
        status: ({ value }: { value: any }) => h('span', { class: 'status-badge' }, value)
      }
    })
    
    // 检查插槽是否被正确渲染
    expect(wrapper.findAll('.status-badge')).toHaveLength(mockData.length)
  })

  it('支持批量操作', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true
      }
    })
    
    // 选择第一行
    const firstRowCheckbox = wrapper.find('tbody tr:first-child .selection-column input[type="checkbox"]')
    await firstRowCheckbox.trigger('change')
    
    // 检查是否触发了选择事件
    expect(wrapper.emitted('selection-change')).toBeTruthy()
  })

  it('处理批量删除', async () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true
      }
    })
    
    // 选择第一行
    const firstRowCheckbox = wrapper.find('tbody tr:first-child .selection-column input[type="checkbox"]')
    await firstRowCheckbox.trigger('change')
    
    // 点击批量删除按钮
    const batchDeleteBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('批量删除')
    )
    
    if (batchDeleteBtn) {
      await batchDeleteBtn.trigger('click')
      expect(wrapper.emitted('batch-delete')).toBeTruthy()
    }
  })

  it('支持不同表格尺寸', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        size: 'small'
      }
    })
    
    expect(wrapper.find('.data-table').classes()).toContain('table-small')
  })

  it('支持边框和斑马纹', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        bordered: true,
        striped: true
      }
    })
    
    expect(wrapper.find('.data-table').classes()).toContain('table-bordered')
    expect(wrapper.find('.data-table').classes()).toContain('table-striped')
  })

  it('支持列对齐方式', () => {
    const columnsWithAlign = [
      { key: 'id', title: 'ID', align: 'center' as const },
      { key: 'name', title: '姓名', align: 'left' as const },
      { key: 'amount', title: '金额', align: 'right' as const }
    ]
    
    const wrapper = mount(BaseTable, {
      props: {
        columns: columnsWithAlign,
        data: mockData
      }
    })
    
    const headers = wrapper.findAll('thead th')
    expect(headers[0].classes()).toContain('text-center')
    expect(headers[1].classes()).toContain('text-left')
    expect(headers[2].classes()).toContain('text-right')
  })

  it('支持省略号显示', () => {
    const columnsWithEllipsis = [
      { key: 'id', title: 'ID' },
      { key: 'description', title: '描述', ellipsis: true }
    ]
    
    const wrapper = mount(BaseTable, {
      props: {
        columns: columnsWithEllipsis,
        data: mockData
      }
    })
    
    const descriptionHeader = wrapper.findAll('thead th')[1]
    expect(descriptionHeader.classes()).toContain('ellipsis')
  })

  it('计算正确的分页信息', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        currentPage: 3,
        pageSize: 10,
        total: 25
      }
    })
    
    expect(wrapper.find('.pagination-info').text()).toContain('显示第 21 到 25 条，共 25 条')
  })
})