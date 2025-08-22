import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElInput, ElSelect, ElButton, ElDatePicker, ElInputNumber, ElTag } from 'element-plus'
import SearchFilter from '../SearchFilter.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElInput: { name: 'ElInput', template: '<input />' },
  ElSelect: { name: 'ElSelect', template: '<select><slot /></select>' },
  ElOption: { name: 'ElOption', template: '<option />' },
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElDatePicker: { name: 'ElDatePicker', template: '<input type="date" />' },
  ElInputNumber: { name: 'ElInputNumber', template: '<input type="number" />' },
  ElTag: { name: 'ElTag', template: '<span><slot /></span>' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' }
}))

describe('SearchFilter', () => {
  const mockFilters = [
    {
      key: 'status',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ]
    },
    {
      key: 'name',
      type: 'input' as const,
      placeholder: '请输入名称'
    },
    {
      key: 'date',
      type: 'date' as const,
      placeholder: '请选择日期'
    }
  ]

  it('应该正确渲染搜索筛选组件', () => {
    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters,
        showSearch: true
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker,
          ElInputNumber,
          ElTag
        }
      }
    })

    expect(wrapper.find('.search-filter').exists()).toBe(true)
    expect(wrapper.find('.filter-group').exists()).toBe(true)
  })

  it('应该显示搜索输入框', () => {
    const wrapper = mount(SearchFilter, {
      props: {
        showSearch: true,
        searchPlaceholder: '搜索关键词'
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton
        }
      }
    })

    expect(wrapper.find('.search-item').exists()).toBe(true)
  })

  it('应该隐藏搜索输入框', () => {
    const wrapper = mount(SearchFilter, {
      props: {
        showSearch: false
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton
        }
      }
    })

    expect(wrapper.find('.search-item').exists()).toBe(false)
  })

  it('应该渲染筛选器', () => {
    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker
        }
      }
    })

    const filterItems = wrapper.findAll('.filter-item')
    expect(filterItems.length).toBeGreaterThan(0)
  })

  it('应该触发搜索事件', async () => {
    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker
        }
      }
    })

    await wrapper.vm.handleSearch()

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('应该触发重置事件', async () => {
    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker
        }
      }
    })

    await wrapper.vm.handleReset()

    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('应该显示快捷筛选', () => {
    const quickFilters = [
      {
        key: 'today',
        label: '今天',
        filters: { date: '2023-01-01' }
      }
    ]

    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters,
        quickFilters
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker,
          ElTag
        }
      }
    })

    expect(wrapper.find('.quick-filters').exists()).toBe(true)
    expect(wrapper.find('.quick-filter-tag').exists()).toBe(true)
  })

  it('应该支持初始值', () => {
    const initialValues = {
      status: 'active',
      name: '测试',
      keyword: '搜索词'
    }

    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters,
        initialValues
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker
        }
      }
    })

    expect(wrapper.vm.searchKeyword).toBe('搜索词')
  })

  it('应该支持实时搜索', async () => {
    const wrapper = mount(SearchFilter, {
      props: {
        filters: mockFilters,
        realTimeSearch: true,
        searchDebounce: 100
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker
        }
      }
    })

    // 模拟输入
    wrapper.vm.searchKeyword = '测试'
    wrapper.vm.handleSearchInput()

    // 等待防抖
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('应该正确处理多选筛选器', () => {
    const multipleFilter = [
      {
        key: 'categories',
        type: 'multiple' as const,
        placeholder: '请选择分类',
        options: [
          { label: '分类1', value: 'cat1' },
          { label: '分类2', value: 'cat2' }
        ]
      }
    ]

    const wrapper = mount(SearchFilter, {
      props: {
        filters: multipleFilter
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton
        }
      }
    })

    expect(wrapper.vm.filterValues.categories).toEqual([])
  })

  it('应该正确处理日期范围筛选器', () => {
    const dateRangeFilter = [
      {
        key: 'dateRange',
        type: 'daterange' as const,
        placeholder: '请选择日期范围',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期'
      }
    ]

    const wrapper = mount(SearchFilter, {
      props: {
        filters: dateRangeFilter
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElDatePicker
        }
      }
    })

    expect(wrapper.vm.filterValues.dateRange).toBe('')
  })

  it('应该正确处理数字输入筛选器', () => {
    const numberFilter = [
      {
        key: 'price',
        type: 'number' as const,
        placeholder: '请输入价格',
        min: 0,
        max: 1000,
        step: 0.01
      }
    ]

    const wrapper = mount(SearchFilter, {
      props: {
        filters: numberFilter
      },
      global: {
        components: {
          ElInput,
          ElSelect,
          ElButton,
          ElInputNumber
        }
      }
    })

    expect(wrapper.vm.filterValues.price).toBe('')
  })
})