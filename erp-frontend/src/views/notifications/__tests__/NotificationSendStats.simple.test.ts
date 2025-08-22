import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock all external dependencies
vi.mock('@/api/modules/notification', () => ({
  notificationApi: {
    getNotificationStats: vi.fn(),
    getNotificationTrends: vi.fn(),
    getChannelEffectiveness: vi.fn(),
    getSendHistory: vi.fn(),
    sendNotification: vi.fn(),
    resendNotification: vi.fn()
  }
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    isLoading: false,
    fetchNotificationStats: vi.fn(),
    fetchTemplates: vi.fn(),
    sendNotification: vi.fn(),
    fetchSendHistory: vi.fn(),
    fetchNotificationTrends: vi.fn(),
    fetchChannelEffectiveness: vi.fn()
  })
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    currentUser: { id: 1, username: 'admin' }
  })
}))

vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: []
}))

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01 12:00:00')
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

import NotificationSendStats from '../NotificationSendStats.vue'

describe('NotificationSendStats', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const createWrapper = () => {
    return mount(NotificationSendStats, {
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

  it('应该正确渲染组件', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('应该正确格式化百分比', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.formatPercentage(0.8)).toBe('80.0%')
    expect(wrapper.vm.formatPercentage(0.123)).toBe('12.3%')
    expect(wrapper.vm.formatPercentage(undefined)).toBe('0%')
  })

  it('应该正确获取渠道标签', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.getChannelLabel('SYSTEM')).toBe('系统')
    expect(wrapper.vm.getChannelLabel('EMAIL')).toBe('邮件')
    expect(wrapper.vm.getChannelLabel('SMS')).toBe('短信')
  })

  it('应该正确获取状态标签', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.getStatusLabel('SUCCESS')).toBe('成功')
    expect(wrapper.vm.getStatusLabel('FAILED')).toBe('失败')
    expect(wrapper.vm.getStatusLabel('PENDING')).toBe('发送中')
  })

  it('应该能够处理定时发送切换', async () => {
    const wrapper = createWrapper()
    
    await wrapper.vm.handleScheduleChange(false)
    expect(wrapper.vm.sendForm.scheduledAt).toBeNull()
  })

  it('应该能够处理接收者类型变化', async () => {
    const wrapper = createWrapper()
    
    wrapper.vm.recipientType = 'USER'
    wrapper.vm.selectedUsers = [1, 2]
    
    await wrapper.vm.handleRecipientTypeChange()
    
    expect(wrapper.vm.selectedUsers).toEqual([])
    expect(wrapper.vm.selectedRoles).toEqual([])
  })

  it('应该能够关闭发送对话框并重置表单', async () => {
    const wrapper = createWrapper()
    
    // 设置一些表单数据
    wrapper.vm.sendForm.title = '测试'
    wrapper.vm.enableSchedule = true
    wrapper.vm.selectedUsers = [1]
    
    await wrapper.vm.handleCloseSendDialog()
    
    expect(wrapper.vm.showSendDialog).toBe(false)
    expect(wrapper.vm.sendForm.title).toBe('')
    expect(wrapper.vm.enableSchedule).toBe(false)
    expect(wrapper.vm.selectedUsers).toEqual([])
  })
})