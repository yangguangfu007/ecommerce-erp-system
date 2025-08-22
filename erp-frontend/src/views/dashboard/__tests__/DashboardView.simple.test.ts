/**
 * 仪表板页面组件简单测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DashboardView from '../DashboardView.vue'

// Mock Vue Router
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn()
    }),
    createRouter: vi.fn(),
    createWebHistory: vi.fn()
  }
})

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: []
}))

describe('DashboardView - 简单测试', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': { template: '<button><slot /></button>' },
          'el-icon': { template: '<i><slot /></i>' },
          'el-progress': { template: '<div class="progress"></div>' },
          'chart-container': { template: '<div class="chart"></div>' }
        }
      }
    })
  })

  it('应该成功渲染仪表板组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.dashboard-view').exists()).toBe(true)
  })

  it('应该显示页面标题', () => {
    expect(wrapper.find('.page-title').text()).toBe('仪表板')
  })

  it('应该包含统计卡片区域', () => {
    expect(wrapper.find('.dashboard-stats').exists()).toBe(true)
  })

  it('应该包含图表区域', () => {
    expect(wrapper.find('.dashboard-charts').exists()).toBe(true)
  })

  it('应该包含快捷操作区域', () => {
    expect(wrapper.find('.dashboard-quick-section').exists()).toBe(true)
  })

  it('应该包含活动区域', () => {
    expect(wrapper.find('.dashboard-activity-section').exists()).toBe(true)
  })
})