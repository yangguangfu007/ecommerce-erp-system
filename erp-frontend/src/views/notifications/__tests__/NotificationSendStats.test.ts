import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mock notification API first
const mockNotificationApi = {
  getNotificationStats: vi.fn(),
  getNotificationTrends: vi.fn(),
  getChannelEffectiveness: vi.fn(),
  getSendHistory: vi.fn(),
  sendNotification: vi.fn(),
  resendNotification: vi.fn()
}

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: {}
  })),
  registerables: []
}))

// Mock ChartContainer component
vi.mock('@/components/business', () => ({
  ChartContainer: {
    name: 'ChartContainer',
    template: '<div class="mock-chart-container"></div>',
    props: ['data', 'type', 'height']
  }
}))

vi.mock('@/api/modules/notification', () => ({
  notificationApi: mockNotificationApi
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => '2024-01-01 12:00:00')
}))

import NotificationSendStats from '../NotificationSendStats.vue'

describe('NotificationSendStats', () => {
  let wrapper: any
  let pinia: unknown

  const createWrapper = (props = {}) => {
    return mount(NotificationSendStats, {
      props,
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-card': true,
          'el-table': true,
          'el-dialog': true,
          'el-form': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true,
          'el-form-item': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-switch': true,
          'el-date-picker': true,
          'el-alert': true,
          'el-skeleton': true,
          'ChartContainer': {
            template: '<div class="mock-chart-container"></div>'
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Setup default mock responses
    mockNotificationApi.getNotificationStats.mockResolvedValue({
      data: {
        totalSent: 100,
        totalRead: 80,
        totalUnread: 20,
        readRate: 0.8
      }
    })
    
    mockNotificationApi.getNotificationTrends.mockResolvedValue({
      data: [
        { date: '2024-01-01', sent: 10, read: 8, readRate: 0.8 },
        { date: '2024-01-02', sent: 15, read: 12, readRate: 0.8 }
      ]
    })
    
    mockNotificationApi.getChannelEffectiveness.mockResolvedValue({
      data: [
        { channel: 'SYSTEM', sent: 50, delivered: 50, read: 40 },
        { channel: 'EMAIL', sent: 30, delivered: 28, read: 20 }
      ]
    })
    
    mockNotificationApi.getSendHistory.mockResolvedValue({
      data: {
        list: [
          {
            id: 1,
            title: '测试通知',
            recipientName: '张三',
            channel: 'SYSTEM',
            status: 'SUCCESS',
            sentAt: '2024-01-01T12:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        size: 20
      }
    })
    

  })

  it('应该正确渲染组件', () => {
    wrapper = createWrapper()
    
    expect(wrapper.exists()).toBe(true)
  })

  it('应该正确格式化百分比', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.formatPercentage(0.8)).toBe('80.0%')
    expect(wrapper.vm.formatPercentage(0.123)).toBe('12.3%')
    expect(wrapper.vm.formatPercentage(undefined)).toBe('0%')
  })

  it('应该正确获取渠道标签', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getChannelLabel('SYSTEM')).toBe('系统')
    expect(wrapper.vm.getChannelLabel('EMAIL')).toBe('邮件')
    expect(wrapper.vm.getChannelLabel('SMS')).toBe('短信')
  })

  it('应该正确获取状态标签', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getStatusLabel('SUCCESS')).toBe('成功')
    expect(wrapper.vm.getStatusLabel('FAILED')).toBe('失败')
    expect(wrapper.vm.getStatusLabel('PENDING')).toBe('发送中')
  })

  it('应该能够处理定时发送切换', async () => {
    wrapper = createWrapper()
    
    await wrapper.vm.handleScheduleChange(false)
    expect(wrapper.vm.sendForm.scheduledAt).toBeNull()
  })
})