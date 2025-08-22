/**
 * 系统监控页面测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import SystemMonitor from '../SystemMonitor.vue'
import { useMonitorStore } from '@/stores/monitor'

// Mock Element Plus
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
      confirm: vi.fn()
    }
  }
})

// Mock 组件
vi.mock('@/components/business/MetricCard.vue', () => ({
  default: {
    name: 'MetricCard',
    template: '<div class="metric-card">{{ title }}: {{ value }}{{ unit }}</div>',
    props: ['title', 'value', 'unit', 'threshold', 'icon']
  }
}))

vi.mock('@/components/business/ServiceStatusTable.vue', () => ({
  default: {
    name: 'ServiceStatusTable',
    template: '<div class="service-status-table">Services: {{ services.length }}</div>',
    props: ['services'],
    emits: ['test-connection', 'restart-service']
  }
}))

vi.mock('@/components/business/AlertRulesTable.vue', () => ({
  default: {
    name: 'AlertRulesTable',
    template: '<div class="alert-rules-table">Rules: {{ rules.length }}</div>',
    props: ['rules'],
    emits: ['edit-rule', 'delete-rule', 'toggle-rule']
  }
}))

vi.mock('@/components/business/AlertRecordsTable.vue', () => ({
  default: {
    name: 'AlertRecordsTable',
    template: '<div class="alert-records-table">Records: {{ records.length }}</div>',
    props: ['records', 'pagination'],
    emits: ['acknowledge', 'resolve', 'page-change']
  }
}))

vi.mock('@/components/business/SystemLogsTable.vue', () => ({
  default: {
    name: 'SystemLogsTable',
    template: '<div class="system-logs-table">Logs: {{ logs.length }}</div>',
    props: ['logs', 'pagination', 'loading'],
    emits: ['page-change']
  }
}))

vi.mock('@/components/business/AlertRuleDialog.vue', () => ({
  default: {
    name: 'AlertRuleDialog',
    template: '<div class="alert-rule-dialog" v-if="modelValue">Dialog</div>',
    props: ['modelValue', 'rule'],
    emits: ['update:modelValue', 'save']
  }
}))

vi.mock('@/components/business/MonitorConfigDialog.vue', () => ({
  default: {
    name: 'MonitorConfigDialog',
    template: '<div class="monitor-config-dialog" v-if="modelValue">Config Dialog</div>',
    props: ['modelValue', 'config'],
    emits: ['update:modelValue', 'save']
  }
}))

vi.mock('@/components/business/LogCleanupDialog.vue', () => ({
  default: {
    name: 'LogCleanupDialog',
    template: '<div class="log-cleanup-dialog" v-if="modelValue">Cleanup Dialog</div>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'cleanup']
  }
}))

// Mock store
const mockMonitorStore = {
  systemMetrics: {
    cpu: { usage: 45, cores: 4 },
    memory: { usage: 68, total: 16384, used: 11141, free: 5243 },
    disk: { usage: 32, total: 1000, used: 320, free: 680 },
    network: { inbound: 0.8, outbound: 0.4, connections: 150 }
  },
  serviceStatus: [
    {
      id: '1',
      name: 'API 服务',
      status: 'online',
      responseTime: 45,
      uptime: 86400,
      lastCheck: '2024-01-15T10:00:00Z',
      url: 'http://localhost:8080'
    }
  ],
  systemLogs: [
    {
      id: '1',
      timestamp: '2024-01-15T10:00:00Z',
      level: 'info',
      message: '系统启动成功',
      source: 'system'
    }
  ],
  alertRules: [
    {
      id: '1',
      name: 'CPU 使用率告警',
      type: 'cpu',
      metric: 'cpu.usage',
      operator: '>',
      threshold: 80,
      unit: '%',
      enabled: true,
      actions: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ],
  alertRecords: [
    {
      id: '1',
      ruleId: '1',
      ruleName: 'CPU 使用率告警',
      level: 'warning',
      message: 'CPU 使用率过高',
      value: 85,
      threshold: 80,
      status: 'active',
      triggeredAt: '2024-01-15T10:00:00Z'
    }
  ],
  monitorConfig: {
    refreshInterval: 30000,
    retentionDays: 30,
    alertEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  },
  loading: false,
  logsPagination: { page: 1, pageSize: 20, total: 100 },
  alertsPagination: { page: 1, pageSize: 20, total: 50 },
  onlineServices: [
    {
      id: '1',
      name: 'API 服务',
      status: 'online',
      responseTime: 45,
      uptime: 86400,
      lastCheck: '2024-01-15T10:00:00Z'
    }
  ],
  offlineServices: [],
  activeAlerts: [
    {
      id: '1',
      ruleId: '1',
      ruleName: 'CPU 使用率告警',
      level: 'warning',
      message: 'CPU 使用率过高',
      value: 85,
      threshold: 80,
      status: 'active',
      triggeredAt: '2024-01-15T10:00:00Z'
    }
  ],
  criticalAlerts: [],
  systemHealth: 'healthy',
  initializeData: vi.fn(),
  fetchSystemMetrics: vi.fn(),
  fetchServiceStatus: vi.fn(),
  fetchSystemLogs: vi.fn(),
  fetchAlertRecords: vi.fn(),
  testServiceConnection: vi.fn(),
  restartService: vi.fn(),
  createAlertRule: vi.fn(),
  updateAlertRule: vi.fn(),
  deleteAlertRule: vi.fn(),
  toggleAlertRule: vi.fn(),
  acknowledgeAlert: vi.fn(),
  resolveAlert: vi.fn(),
  updateMonitorConfig: vi.fn(),
  cleanupLogs: vi.fn()
}

vi.mock('@/stores/monitor', () => ({
  useMonitorStore: () => mockMonitorStore
}))

describe('SystemMonitor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('应该正确渲染系统监控页面', () => {
    const wrapper = mount(SystemMonitor)
    
    expect(wrapper.find('h1').text()).toBe('系统监控')
    expect(wrapper.find('.system-monitor').exists()).toBe(true)
  })

  it('应该显示系统健康状态', () => {
    const wrapper = mount(SystemMonitor)
    
    expect(wrapper.find('.health-overview').exists()).toBe(true)
    expect(wrapper.find('.health-card').exists()).toBe(true)
  })

  it('应该显示系统性能指标', () => {
    const wrapper = mount(SystemMonitor)
    
    const metricsSection = wrapper.find('.metrics-section')
    expect(metricsSection.exists()).toBe(true)
    
    const metricCards = wrapper.findAllComponents({ name: 'MetricCard' })
    expect(metricCards.length).toBe(4) // CPU, 内存, 磁盘, 网络
  })

  it('应该显示服务状态表格', () => {
    const wrapper = mount(SystemMonitor)
    
    const servicesSection = wrapper.find('.services-section')
    expect(servicesSection.exists()).toBe(true)
    
    const serviceTable = wrapper.findComponent({ name: 'ServiceStatusTable' })
    expect(serviceTable.exists()).toBe(true)
  })

  it('应该显示告警管理标签页', () => {
    const wrapper = mount(SystemMonitor)
    
    const alertsSection = wrapper.find('.alerts-section')
    expect(alertsSection.exists()).toBe(true)
    
    const tabs = wrapper.find('.el-tabs')
    expect(tabs.exists()).toBe(true)
  })

  it('应该显示系统日志表格', () => {
    const wrapper = mount(SystemMonitor)
    
    const logsSection = wrapper.find('.logs-section')
    expect(logsSection.exists()).toBe(true)
    
    const logsTable = wrapper.findComponent({ name: 'SystemLogsTable' })
    expect(logsTable.exists()).toBe(true)
  })

  it('应该处理刷新数据操作', async () => {
    const wrapper = mount(SystemMonitor)
    
    const refreshButton = wrapper.find('[data-testid="refresh-button"]')
    if (refreshButton.exists()) {
      await refreshButton.trigger('click')
      
      expect(mockMonitorStore.fetchSystemMetrics).toHaveBeenCalled()
      expect(mockMonitorStore.fetchServiceStatus).toHaveBeenCalled()
      expect(mockMonitorStore.fetchAlertRecords).toHaveBeenCalled()
    }
  })

  it('应该处理服务连接测试', async () => {
    mockMonitorStore.testServiceConnection.mockResolvedValue({
      status: 'success',
      responseTime: 45
    })
    
    const wrapper = mount(SystemMonitor)
    
    const serviceTable = wrapper.findComponent({ name: 'ServiceStatusTable' })
    await serviceTable.vm.$emit('test-connection', '1')
    
    expect(mockMonitorStore.testServiceConnection).toHaveBeenCalledWith('1')
  })

  it('应该处理服务重启操作', async () => {
    const wrapper = mount(SystemMonitor)
    
    const serviceTable = wrapper.findComponent({ name: 'ServiceStatusTable' })
    await serviceTable.vm.$emit('restart-service', '1')
    
    expect(mockMonitorStore.restartService).toHaveBeenCalledWith('1')
  })

  it('应该处理告警确认操作', async () => {
    const wrapper = mount(SystemMonitor)
    
    const alertRecordsTable = wrapper.findComponent({ name: 'AlertRecordsTable' })
    await alertRecordsTable.vm.$emit('acknowledge', '1')
    
    expect(mockMonitorStore.acknowledgeAlert).toHaveBeenCalledWith('1')
  })

  it('应该处理告警解决操作', async () => {
    const wrapper = mount(SystemMonitor)
    
    const alertRecordsTable = wrapper.findComponent({ name: 'AlertRecordsTable' })
    await alertRecordsTable.vm.$emit('resolve', '1')
    
    expect(mockMonitorStore.resolveAlert).toHaveBeenCalledWith('1')
  })

  it('应该处理告警规则切换', async () => {
    const wrapper = mount(SystemMonitor)
    
    const alertRulesTable = wrapper.findComponent({ name: 'AlertRulesTable' })
    await alertRulesTable.vm.$emit('toggle-rule', '1', false)
    
    expect(mockMonitorStore.toggleAlertRule).toHaveBeenCalledWith('1', false)
  })

  it('应该处理告警规则删除', async () => {
    const wrapper = mount(SystemMonitor)
    
    const alertRulesTable = wrapper.findComponent({ name: 'AlertRulesTable' })
    await alertRulesTable.vm.$emit('delete-rule', '1')
    
    expect(mockMonitorStore.deleteAlertRule).toHaveBeenCalledWith('1')
  })

  it('应该处理日志清理操作', async () => {
    const wrapper = mount(SystemMonitor)
    
    const cleanupDialog = wrapper.findComponent({ name: 'LogCleanupDialog' })
    const cleanupParams = {
      beforeDate: '2024-01-01',
      level: 'error'
    }
    
    await cleanupDialog.vm.$emit('cleanup', cleanupParams)
    
    expect(mockMonitorStore.cleanupLogs).toHaveBeenCalledWith(cleanupParams)
  })

  it('应该在组件挂载时初始化数据', () => {
    mount(SystemMonitor)
    
    expect(mockMonitorStore.initializeData).toHaveBeenCalled()
    expect(mockMonitorStore.fetchSystemLogs).toHaveBeenCalled()
    expect(mockMonitorStore.fetchAlertRecords).toHaveBeenCalled()
  })

  it('应该正确计算健康状态标签类型', () => {
    const wrapper = mount(SystemMonitor)
    const vm = wrapper.vm as any
    
    // 测试健康状态
    mockMonitorStore.systemHealth = 'healthy'
    expect(vm.healthTagType).toBe('success')
    
    mockMonitorStore.systemHealth = 'warning'
    expect(vm.healthTagType).toBe('warning')
    
    mockMonitorStore.systemHealth = 'critical'
    expect(vm.healthTagType).toBe('danger')
  })

  it('应该正确显示健康状态文本', () => {
    const wrapper = mount(SystemMonitor)
    const vm = wrapper.vm as any
    
    mockMonitorStore.systemHealth = 'healthy'
    expect(vm.healthStatusText).toBe('健康')
    
    mockMonitorStore.systemHealth = 'warning'
    expect(vm.healthStatusText).toBe('警告')
    
    mockMonitorStore.systemHealth = 'critical'
    expect(vm.healthStatusText).toBe('严重')
  })

  it('应该处理日志筛选', async () => {
    const wrapper = mount(SystemMonitor)
    const vm = wrapper.vm as any
    
    vm.logQuery = {
      level: 'error',
      keyword: 'test'
    }
    
    await vm.handleLogFilter()
    
    expect(mockMonitorStore.fetchSystemLogs).toHaveBeenCalledWith({
      level: 'error',
      keyword: 'test'
    })
  })

  it('应该处理分页变化', async () => {
    const wrapper = mount(SystemMonitor)
    const vm = wrapper.vm as any
    
    await vm.handleLogsPageChange(2)
    
    expect(mockMonitorStore.logsPagination.page).toBe(2)
    expect(mockMonitorStore.fetchSystemLogs).toHaveBeenCalled()
  })
})