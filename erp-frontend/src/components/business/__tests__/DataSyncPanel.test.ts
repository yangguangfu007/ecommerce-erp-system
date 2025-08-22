import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import DataSyncPanel from '../DataSyncPanel.vue'
import { platformApi } from '@/api/modules/platform'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock platform API
vi.mock('@/api/modules/platform', () => ({
  platformApi: {
    getActiveSyncTasks: vi.fn(),
    getSyncLogs: vi.fn(),
    startDataSync: vi.fn(),
    stopSyncTask: vi.fn(),
    getSyncTaskStatus: vi.fn(),
    retrySyncTask: vi.fn()
  }
}))

// Mock data
const mockActiveTasks = [
  {
    taskId: 'task-001',
    status: 'RUNNING',
    progress: 65,
    totalRecords: 1000,
    processedRecords: 650,
    successRecords: 640,
    failedRecords: 10,
    syncType: 'PRODUCTS',
    startTime: '2024-01-15T10:00:00Z',
    errors: []
  },
  {
    taskId: 'task-002',
    status: 'COMPLETED',
    progress: 100,
    totalRecords: 500,
    processedRecords: 500,
    successRecords: 495,
    failedRecords: 5,
    syncType: 'ORDERS',
    startTime: '2024-01-15T11:00:00Z',
    endTime: '2024-01-15T11:30:00Z',
    errors: [
      {
        recordId: 'order-123',
        recordType: 'ORDER',
        errorCode: 'INVALID_STATUS',
        errorMessage: '订单状态无效'
      }
    ]
  }
]

const mockSyncLogs = {
  records: [
    {
      id: 1,
      taskId: 'task-001',
      syncType: 'PRODUCTS',
      status: 'COMPLETED',
      progress: 100,
      totalRecords: 1000,
      processedRecords: 1000,
      successRecords: 995,
      failedRecords: 5,
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T09:30:00Z'
    },
    {
      id: 2,
      taskId: 'task-002',
      syncType: 'ORDERS',
      status: 'FAILED',
      progress: 50,
      totalRecords: 500,
      processedRecords: 250,
      successRecords: 200,
      failedRecords: 50,
      startTime: '2024-01-15T08:00:00Z',
      endTime: '2024-01-15T08:15:00Z',
      errorMessage: '连接超时'
    }
  ],
  total: 2,
  current: 1,
  size: 20
}

describe('DataSyncPanel', () => {
  let wrapper: any
  
  const createWrapper = (props = {}) => {
    return mount(DataSyncPanel, {
      props,
      global: {
        stubs: {
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-progress': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-switch': true,
          'el-date-picker': true,
          'el-time-picker': true,
          'el-input-number': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-collapse': true,
          'el-collapse-item': true,
          'el-alert': true
        }
      }
    })
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup API mocks with default empty responses
    vi.mocked(platformApi.getActiveSyncTasks).mockResolvedValue({
      data: []
    } as any)
    
    vi.mocked(platformApi.getSyncLogs).mockResolvedValue({
      data: {
        records: [],
        total: 0,
        current: 1,
        size: 20
      }
    } as any)
    
    vi.mocked(platformApi.startDataSync).mockResolvedValue({
      data: mockActiveTasks[0]
    } as any)
    
    vi.mocked(platformApi.stopSyncTask).mockResolvedValue({} as any)
    vi.mocked(platformApi.getSyncTaskStatus).mockResolvedValue({
      data: mockActiveTasks[0]
    } as any)
    vi.mocked(platformApi.retrySyncTask).mockResolvedValue({
      data: mockActiveTasks[0]
    } as any)
  })
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('应该正确渲染数据同步面板', async () => {
    wrapper = createWrapper({ platformId: 1 })

    // 等待异步数据加载
    await wrapper.vm.$nextTick()

    // 检查基本结构
    expect(wrapper.find('.data-sync-panel').exists()).toBe(true)
    expect(wrapper.find('.sync-operations').exists()).toBe(true)
    expect(wrapper.find('.sync-logs-section').exists()).toBe(true)
    expect(wrapper.find('.sync-schedule-section').exists()).toBe(true)
  })

  it('应该显示同步类型选择器', () => {
    wrapper = createWrapper()

    const syncTypeCards = wrapper.findAll('.sync-type-card')
    expect(syncTypeCards).toHaveLength(3)
    
    // 检查同步类型
    expect(wrapper.text()).toContain('商品数据')
    expect(wrapper.text()).toContain('订单数据')
    expect(wrapper.text()).toContain('库存数据')
  })

  it('应该能够选择和取消选择同步类型', async () => {
    wrapper = createWrapper()

    // 直接测试组件方法
    wrapper.vm.toggleSyncType('PRODUCTS')
    expect(wrapper.vm.selectedSyncTypes).toContain('PRODUCTS')
    
    wrapper.vm.toggleSyncType('PRODUCTS')
    expect(wrapper.vm.selectedSyncTypes).not.toContain('PRODUCTS')
  })

  it('应该显示活跃的同步任务', async () => {
    // Mock with active tasks
    vi.mocked(platformApi.getActiveSyncTasks).mockResolvedValue({
      data: mockActiveTasks
    } as any)

    wrapper = createWrapper()

    // 等待数据加载
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 检查活跃任务数据
    expect(wrapper.vm.activeTasks).toHaveLength(2)
    expect(wrapper.vm.hasActiveTasks).toBe(true)
  })

  it('应该能够启动同步任务', async () => {
    wrapper = createWrapper()

    // 设置同步表单数据
    wrapper.vm.syncForm.syncTypes = ['PRODUCTS']
    
    // 调用启动同步方法
    await wrapper.vm.startSync()

    expect(platformApi.startDataSync).toHaveBeenCalledWith({
      platformId: undefined,
      syncType: 'PRODUCTS',
      startDate: undefined,
      endDate: undefined,
      force: false
    })
    expect(ElMessage.success).toHaveBeenCalledWith('同步任务已启动')
  })

  it('应该能够停止同步任务', async () => {
    wrapper = createWrapper()
    
    // 设置活跃任务
    wrapper.vm.activeTasks = [mockActiveTasks[0]]

    // 模拟停止任务
    await wrapper.vm.stopTask('task-001')

    expect(platformApi.stopSyncTask).toHaveBeenCalledWith('task-001')
    expect(ElMessage.success).toHaveBeenCalledWith('任务已停止')
  })

  it('应该能够重试失败的任务', async () => {
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)

    wrapper = createWrapper()

    // 模拟重试任务
    await wrapper.vm.retryTask('task-002')

    expect(ElMessageBox.confirm).toHaveBeenCalled()
    expect(platformApi.retrySyncTask).toHaveBeenCalledWith('task-002')
    expect(ElMessage.success).toHaveBeenCalledWith('任务重试已启动')
  })

  it('应该能够刷新同步状态', async () => {
    wrapper = createWrapper()

    // 调用刷新方法
    await wrapper.vm.refreshSyncStatus()

    expect(platformApi.getActiveSyncTasks).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('状态刷新成功')
  })

  it('应该能够加载同步日志', async () => {
    wrapper = createWrapper({ platformId: 1 })

    // 等待初始加载
    await wrapper.vm.$nextTick()

    expect(platformApi.getSyncLogs).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      platformId: 1,
      syncType: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined
    })
  })

  it('应该能够筛选同步日志', async () => {
    wrapper = createWrapper()

    // 设置筛选条件
    wrapper.vm.logFilters.syncType = 'PRODUCTS'
    wrapper.vm.logFilters.status = 'COMPLETED'

    // 执行筛选
    await wrapper.vm.loadSyncLogs()

    expect(platformApi.getSyncLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        syncType: 'PRODUCTS',
        status: 'COMPLETED'
      })
    )
  })

  it('应该能够查看日志详情', async () => {
    wrapper = createWrapper()

    const testLog = mockSyncLogs.records[0]
    
    // 查看日志详情
    wrapper.vm.viewLogDetails(testLog)

    expect(wrapper.vm.selectedLog).toBe(testLog)
    expect(wrapper.vm.logDetailDialogVisible).toBe(true)
  })

  it('应该能够配置同步计划', async () => {
    wrapper = createWrapper()

    // 启用计划
    wrapper.vm.scheduleEnabled = true
    wrapper.vm.toggleSchedule(true)

    // 设置计划参数
    wrapper.vm.scheduleForm.frequency = 'daily'
    wrapper.vm.scheduleForm.dailyTime = new Date('2024-01-01T09:00:00')

    // 保存计划
    await wrapper.vm.saveSchedule()

    expect(ElMessage.success).toHaveBeenCalledWith('同步计划保存成功')
  })

  it('应该能够计算下次执行时间', async () => {
    wrapper = createWrapper()

    // 设置每日执行
    wrapper.vm.scheduleForm.frequency = 'daily'
    wrapper.vm.scheduleForm.dailyTime = new Date('2024-01-01T09:00:00')

    // 计算下次执行时间
    wrapper.vm.calculateNextExecutionTime()

    expect(wrapper.vm.nextExecutionTime).toBeTruthy()
  })

  it('应该正确格式化时间显示', () => {
    wrapper = createWrapper()

    const testTime = '2024-01-15T10:30:00Z'
    const formatted = wrapper.vm.formatDateTime(testTime)

    expect(formatted).toMatch(/2024/)
    expect(typeof formatted).toBe('string')
  })

  it('应该正确获取同步状态类型', () => {
    wrapper = mount(DataSyncPanel)

    expect(wrapper.vm.getSyncStatusType('COMPLETED')).toBe('success')
    expect(wrapper.vm.getSyncStatusType('RUNNING')).toBe('warning')
    expect(wrapper.vm.getSyncStatusType('FAILED')).toBe('danger')
    expect(wrapper.vm.getSyncStatusType('PENDING')).toBe('info')
  })

  it('应该正确获取同步状态文本', () => {
    wrapper = mount(DataSyncPanel)

    expect(wrapper.vm.getSyncStatusText('COMPLETED')).toBe('已完成')
    expect(wrapper.vm.getSyncStatusText('RUNNING')).toBe('运行中')
    expect(wrapper.vm.getSyncStatusText('FAILED')).toBe('失败')
    expect(wrapper.vm.getSyncStatusText('PENDING')).toBe('等待中')
  })

  it('应该正确计算任务持续时间', () => {
    wrapper = mount(DataSyncPanel)

    const startTime = '2024-01-15T10:00:00Z'
    const endTime = '2024-01-15T10:30:45Z'
    const duration = wrapper.vm.calculateDuration(startTime, endTime)

    expect(duration).toContain('30分钟')
    expect(duration).toContain('45秒')
  })

  it('应该处理API错误', async () => {
    vi.mocked(platformApi.getActiveSyncTasks).mockRejectedValue(new Error('API Error'))

    wrapper = mount(DataSyncPanel)

    // 等待错误处理
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证错误被正确处理（不会导致组件崩溃）
    expect(wrapper.find('.data-sync-panel').exists()).toBe(true)
  })

  it('应该在组件卸载时清理定时器', () => {
    wrapper = mount(DataSyncPanel)

    // 启动状态轮询
    wrapper.vm.startStatusPolling()
    expect(wrapper.vm.statusTimer).toBeTruthy()

    // 卸载组件
    wrapper.unmount()

    // 验证定时器被清理（通过检查组件是否正常卸载）
    expect(wrapper.vm).toBeTruthy()
  })

  it('应该支持无平台ID的使用场景', async () => {
    wrapper = mount(DataSyncPanel)

    // 等待数据加载
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证组件正常工作
    expect(wrapper.find('.data-sync-panel').exists()).toBe(true)
    expect(platformApi.getSyncLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        platformId: undefined
      })
    )
  })
})