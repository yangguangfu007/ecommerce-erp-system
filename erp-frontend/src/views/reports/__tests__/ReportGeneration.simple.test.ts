/**
 * 报表生成页面组件简单测试
 * 专注于核心功能的基础测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReportGeneration from '../ReportGeneration.vue'

// Mock Element Plus 消息组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    }
  }
})

// Mock 图表组件
vi.mock('@/components/business/ChartContainer.vue', () => ({
  default: {
    name: 'ChartContainer',
    template: '<div class="chart-container">Mock Chart</div>',
    props: ['data', 'type', 'height', 'options']
  }
}))

// Mock API 模块
vi.mock('@/api/modules/report')

describe('ReportGeneration 简单测试', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('应该正确渲染组件', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': { template: '<button><slot /></button>' },
          'el-form': { template: '<form><slot /></form>' },
          'el-form-item': { template: '<div class="form-item"><slot /></div>' },
          'el-input': { template: '<input />' },
          'el-select': { template: '<select><slot /></select>' },
          'el-option': { template: '<option><slot /></option>' },
          'el-date-picker': { template: '<input type="date" />' },
          'el-transfer': { template: '<div class="transfer"><slot /></div>' },
          'el-table': { template: '<table><slot /></table>' },
          'el-table-column': { template: '<td><slot /></td>' },
          'el-radio-group': { template: '<div><slot /></div>' },
          'el-radio': { template: '<input type="radio" />' },
          'el-dialog': { template: '<div class="dialog"><slot /></div>' },
          'el-skeleton': { template: '<div class="skeleton"></div>' },
          'el-empty': { template: '<div class="empty"><slot /></div>' },
          'el-pagination': { template: '<div class="pagination"></div>' },
          'el-icon': { template: '<i><slot /></i>' },
          'el-row': { template: '<div class="row"><slot /></div>' },
          'el-col': { template: '<div class="col"><slot /></div>' },
          'el-textarea': { template: '<textarea></textarea>' }
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('应该包含页面标题', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-textarea': true
        }
      }
    })

    const title = wrapper.find('.page-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('报表生成')
  })

  it('应该包含报表配置表单', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-textarea': true
        }
      }
    })

    expect(wrapper.find('.report-config-form').exists()).toBe(true)
    expect(wrapper.find('.form-section').exists()).toBe(true)
  })

  it('应该包含预览区域', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-textarea': true
        }
      }
    })

    expect(wrapper.find('.preview-section').exists()).toBe(true)
  })

  it('应该初始化报表配置数据', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-textarea': true
        }
      }
    })

    const vm = wrapper.vm
    expect(vm.reportConfig).toBeDefined()
    expect(vm.reportConfig.type).toBe('table')
    expect(vm.reportConfig.outputFormat).toBe('preview')
    expect(vm.reportConfig.orientation).toBe('portrait')
    expect(vm.reportConfig.pageSize).toBe('A4')
  })

  it('应该支持添加和删除指标', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-textarea': true
        }
      }
    })

    const vm = wrapper.vm
    const initialLength = vm.reportConfig.metrics.length

    // 测试添加指标
    vm.addMetric()
    expect(vm.reportConfig.metrics.length).toBe(initialLength + 1)

    // 测试删除指标
    vm.removeMetric(0)
    expect(vm.reportConfig.metrics.length).toBe(initialLength)
  })

  it('应该支持添加和删除筛选条件', () => {
    const wrapper = mount(ReportGeneration, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-transfer': true,
          'el-table': true,
          'el-table-column': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-dialog': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-textarea': true
        }
      }
    })

    const vm = wrapper.vm
    const initialLength = vm.reportConfig.filters.length

    // 测试添加筛选条件
    vm.addFilter()
    expect(vm.reportConfig.filters.length).toBe(initialLength + 1)

    // 测试删除筛选条件
    vm.removeFilter(0)
    expect(vm.reportConfig.filters.length).toBe(initialLength)
  })
})