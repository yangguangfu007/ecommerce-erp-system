/**
 * 系统监控页面简单测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SystemMonitor from '../SystemMonitor.vue'

// Mock 所有子组件
vi.mock('@/components/business/MetricCard.vue', () => ({
  default: { name: 'MetricCard', template: '<div>MetricCard</div>' }
}))

vi.mock('@/components/business/ServiceStatusTable.vue', () => ({
  default: { name: 'ServiceStatusTable', template: '<div>ServiceStatusTable</div>' }
}))

vi.mock('@/components/business/AlertRulesTable.vue', () => ({
  default: { name: 'AlertRulesTable', template: '<div>AlertRulesTable</div>' }
}))

vi.mock('@/components/business/AlertRecordsTable.vue', () => ({
  default: { name: 'AlertRecordsTable', template: '<div>AlertRecordsTable</div>' }
}))

vi.mock('@/components/business/SystemLogsTable.vue', () => ({
  default: { name: 'SystemLogsTable', template: '<div>SystemLogsTable</div>' }
}))

vi.mock('@/components/business/AlertRuleDialog.vue', () => ({
  default: { name: 'AlertRuleDialog', template: '<div>AlertRuleDialog</div>' }
}))

vi.mock('@/components/business/MonitorConfigDialog.vue', () => ({
  default: { name: 'MonitorConfigDialog', template: '<div>MonitorConfigDialog</div>' }
}))

vi.mock('@/components/business/LogCleanupDialog.vue', () => ({
  default: { name: 'LogCleanupDialog', template: '<div>LogCleanupDialog</div>' }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn() },
  ElMessageBox: { confirm: vi.fn() }
}))

// Mock store
vi.mock('@/stores/monitor', () => ({
  useMonitorStore: () => ({
    systemMetrics: null,
    serviceStatus: [],
    systemLogs: [],
    alertRules: [],
    alertRecords: [],
    monitorConfig: null,
    loading: false,
    logsPagination: { page: 1, pageSize: 20, total: 0 },
    alertsPagination: { page: 1, pageSize: 20, total: 0 },
    onlineServices: [],
    offlineServices: [],
    activeAlerts: [],
    criticalAlerts: [],
    systemHealth: 'unknown',
    initializeData: vi.fn(),
    fetchSystemLogs: vi.fn(),
    fetchAlertRecords: vi.fn()
  })
}))

describe('SystemMonitor 简单测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该能够正常挂载', () => {
    const wrapper = mount(SystemMonitor)
    expect(wrapper.exists()).toBe(true)
  })

  it('应该包含系统监控标题', () => {
    const wrapper = mount(SystemMonitor)
    expect(wrapper.text()).toContain('系统监控')
  })

  it('应该包含主要的监控区域', () => {
    const wrapper = mount(SystemMonitor)
    
    expect(wrapper.find('.system-monitor').exists()).toBe(true)
    expect(wrapper.find('.monitor-header').exists()).toBe(true)
  })
})