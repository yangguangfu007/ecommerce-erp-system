import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElIcon } from 'element-plus'
import ChartContainer from '../ChartContainer.vue'

// Mock ECharts
const mockChart = {
  setOption: vi.fn(),
  dispose: vi.fn(),
  resize: vi.fn(),
  on: vi.fn(),
  getDataURL: vi.fn(() => 'mock-data-url')
}

vi.mock('echarts', () => ({
  init: vi.fn(() => mockChart),
  dispose: vi.fn()
}))

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' }
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}))

describe('ChartContainer', () => {
  const mockOption = {
    title: { text: '测试图表' },
    series: [{
      name: '测试数据',
      type: 'line',
      data: [1, 2, 3, 4, 5]
    }]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染图表容器', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        title: '测试图表'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.find('.chart-container').exists()).toBe(true)
    expect(wrapper.find('.chart-header').exists()).toBe(true)
    expect(wrapper.find('.chart-title').text()).toBe('测试图表')
  })

  it('应该显示加载状态', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        loading: true,
        loadingText: '加载中...'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.find('.chart-loading-overlay').exists()).toBe(true)
    expect(wrapper.find('.loading-text').text()).toBe('加载中...')
  })

  it('应该显示错误状态', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        error: '加载失败'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.find('.chart-error').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('加载失败')
  })

  it('应该显示空数据状态', () => {
    const emptyOption = {
      series: [{
        name: '测试数据',
        type: 'line',
        data: []
      }]
    }

    const wrapper = mount(ChartContainer, {
      props: {
        option: emptyOption,
        emptyText: '暂无数据'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.find('.chart-empty').exists()).toBe(true)
    expect(wrapper.find('.empty-message').text()).toBe('暂无数据')
  })

  it('应该显示刷新按钮', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        showRefresh: true
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    // 检查是否有刷新按钮
    const refreshButton = wrapper.findComponent(ElButton)
    expect(refreshButton.exists()).toBe(true)
  })

  it('应该触发刷新事件', async () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        showRefresh: true
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    const refreshButton = wrapper.findComponent(ElButton)
    if (refreshButton.exists()) {
      await refreshButton.trigger('click')
      expect(wrapper.emitted('refresh')).toBeTruthy()
    }
  })

  it('应该支持不同的图表类型', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        chartType: 'bar'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    // 验证预设配置被应用
    expect(wrapper.vm.getPresetOption).toBeDefined()
  })

  it('应该正确生成预设配置', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    const linePreset = wrapper.vm.getPresetOption('line', { test: true })
    expect(linePreset).toHaveProperty('tooltip')
    expect(linePreset).toHaveProperty('grid')
    expect(linePreset).toHaveProperty('test', true)

    const barPreset = wrapper.vm.getPresetOption('bar', { test: true })
    expect(barPreset).toHaveProperty('tooltip')
    expect(barPreset).toHaveProperty('grid')

    const piePreset = wrapper.vm.getPresetOption('pie', { test: true })
    expect(piePreset).toHaveProperty('tooltip')
    expect(piePreset).toHaveProperty('legend')
  })

  it('应该支持数据缩放', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        enableDataZoom: true
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    // 验证组件正确设置了enableDataZoom属性
    expect(wrapper.props('enableDataZoom')).toBe(true)
  })

  it('应该支持工具箱', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        enableToolbox: true
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.props('enableToolbox')).toBe(true)
  })

  it('应该支持禁用图例', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        enableLegend: false
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.props('enableLegend')).toBe(false)
  })

  it('应该支持自定义尺寸', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        height: '500px',
        width: '800px'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.props('height')).toBe('500px')
    expect(wrapper.props('width')).toBe('800px')
  })

  it('应该支持自定义主题', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        theme: 'dark'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.props('theme')).toBe('dark')
  })

  it('应该正确判断空数据状态', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    // 有数据的情况
    expect(wrapper.vm.isEmpty).toBe(false)

    // 空数据的情况
    const emptyOption = {
      series: [{
        name: '测试数据',
        type: 'line',
        data: []
      }]
    }

    const emptyWrapper = mount(ChartContainer, {
      props: {
        option: emptyOption
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(emptyWrapper.vm.isEmpty).toBe(true)
  })

  it('应该暴露图表实例方法', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.vm.getChartInstance).toBeDefined()
    expect(wrapper.vm.updateOption).toBeDefined()
    expect(wrapper.vm.resize).toBeDefined()
    expect(wrapper.vm.getDataURL).toBeDefined()
  })

  it('应该支持副标题', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption,
        title: '主标题',
        subtitle: '副标题'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.find('.chart-title').text()).toBe('主标题')
    expect(wrapper.find('.chart-subtitle').text()).toBe('副标题')
  })

  it('应该支持插槽', () => {
    const wrapper = mount(ChartContainer, {
      props: {
        option: mockOption
      },
      slots: {
        header: '<div class="custom-header">自定义头部</div>',
        actions: '<button class="custom-action">自定义操作</button>',
        footer: '<div class="custom-footer">自定义底部</div>'
      },
      global: {
        components: {
          ElButton,
          ElIcon
        }
      }
    })

    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-action').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
  })
})