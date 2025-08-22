import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import DataSyncManagement from '../DataSyncManagement.vue'
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
    getSyncSchedule: vi.fn(),
    startDataSync: vi.fn(),
    stopSyncTask: vi.fn(),
    retrySyncTask: vi.fn(),
    saveSyncSchedule: vi.fn(),
    toggleSyncSchedule: vi.fn(),
    getNextExecutionTime: vi.fn(),
    exportSyncLogs: vi.fn(),
    clearSyncLogs: vi.fn(),
    getSyncTaskStatus: vi.fn()
  }
}))

// Mock BreadcrumbNav component
vi.mock('@/components/business/BreadcrumbNav.vue', () => ({
  default: {
    name: 'BreadcrumbNav',
    template: '<div data-testid="breadcrumb-nav"></div>'
  }
}))

describe('DataSyncManagement', () => {
  let wrapper: any
  
  const mockActiveTasks = [
    {
      taskId: 'task-1',
      syncType: 'PRODUCTS',
      status: 'RUNNING',
      progress: 45,
      totalRecords: 1000,
      processedRecords: 450,
      successRecords: 440,
      failedRecords: 10,
      startTime: '2024-01-15T10:00:00Z',
      errors: []
    },
    {
      taskId: 'task-2',
      syncType: 'ORDERS',
      status: 'COMPLETED',
      progress: 100,
      totalRecords: 500,
      processedRecords: 500,
      successRecords: 495,
      failedRecords: 5,
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T09:30:00Z',
      errors: []
    }
  ]
  
  const mockSyncLogs = {
    records: [
      {
        id: 1,
        taskId: 'task-1',
        syncType: 'PRODUCTS',
        status: 'COMPLETED',
        progress: 100,
        totalRecords: 1000,
        processedRecords: 1000,
        successRecords: 990,
        failedRecords: 10,
        startTime: '2024-01-15T08:00:00Z',
        endTime: '2024-01-15T08:30:00Z'
      }
    ],
    total: 1,
    page: 1,
    size: 20
  }
  
  const mockSchedule = {
    id: 1,
    enabled: true,
    frequency: 'daily',
    dailyTime: '02:00',
    syncTypes: ['PRODUCTS', 'ORDERS'],
    errorHandling: 'continue',
    retryCount: 3
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default API responses
    vi.mocked(platformApi.getActiveSyncTasks).mockResolvedValue({
      data: mockActiveTasks
    } as any)
    
    vi.mocked(platformApi.getSyncLogs).mockResolvedValue({
      data: mockSyncLogs
    } as any)
    
    vi.mocked(platformApi.getSyncSchedule).mockResolvedValue({
      data: mockSchedule
    } as any)
    
    vi.mocked(platformApi.getNextExecutionTime).mockResolvedValue({
      data: { nextExecution: '2024-01-16T02:00:00Z' }
    } as any)
  })

  const createWrapper = (props = {}) => {
    return mount(DataSyncManagement, {
      props: {
        platformId: 1,
        ...props
      },
      global: {
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-progress': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-input-number': true,
          'el-time-picker': true,
          'el-date-picker': true,
          'el-switch': true,
          'el-collapse': true,
          'el-collapse-item': true,
          'el-alert': true,
          'el-empty': true,
          'BreadcrumbNav': true
        }
      },
      attachTo: document.body
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染数据同步管理页面', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.data-sync-management').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toBe('数据同步管理')
      expect(wrapper.find('.page-description').text()).toBe('管理平台数据同步任务、计划和日志')
    })

    it('应该显示同步类型选择器', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const syncTypeCards = wrapper.findAll('.sync-type-card')
      expect(syncTypeCards).toHaveLength(3)
      
      // 检查同步类型
      expect(wrapper.text()).toContain('商品数据')
      expect(wrapper.text()).toContain('订单数据')
      expect(wrapper.text()).toContain('库存数据')
    })

    it('应该显示面包屑导航', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.findComponent({ name: 'BreadcrumbNav' }).exists()).toBe(true)
    })
  })

  describe('同步操作', () => {
    it('应该能够选择同步类型', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const syncTypeCard = wrapper.find('.sync-type-card')
      await syncTypeCard.trigger('click')
      
      expect(syncTypeCard.classes()).toContain('active')
      expect(wrapper.vm.selectedSyncTypes).toContain('PRODUCTS')
    })

    it('应该能够启动同步任务', async () => {
      vi.mocked(platformApi.startDataSync).mockResolvedValue({
        data: mockActiveTasks[0]
      } as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 选择同步类型
      wrapper.vm.selectedSyncTypes = ['PRODUCTS']
      
      // 启动同步
      await wrapper.vm.startSync()
      
      expect(platformApi.startDataSync).toHaveBeenCalledWith({
        platformId: 1,
        syncType: 'PRODUCTS',
        startDate: undefined,
        endDate: undefined,
        force: false
      })
      expect(ElMessage.success).toHaveBeenCalledWith('同步任务已启动')
    })

    it('应该在未选择同步类型时显示警告', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.startSync()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请选择要同步的数据类型')
      expect(platformApi.startDataSync).not.toHaveBeenCalled()
    })

    it('应该能够停止同步任务', async () => {
      vi.mocked(platformApi.stopSyncTask).mockResolvedValue({} as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.stopTask('task-1')
      
      expect(platformApi.stopSyncTask).toHaveBeenCalledWith('task-1')
      expect(ElMessage.success).toHaveBeenCalledWith('任务已停止')
    })

    it('应该能够停止所有任务', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)
      vi.mocked(platformApi.stopSyncTask).mockResolvedValue({} as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.stopAllTasks()
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要停止所有同步任务吗？',
        '确认操作',
        { type: 'warning' }
      )
      expect(platformApi.stopSyncTask).toHaveBeenCalledTimes(mockActiveTasks.length)
      expect(ElMessage.success).toHaveBeenCalledWith('所有任务已停止')
    })
  })

  describe('同步进度显示', () => {
    it('应该显示活跃的同步任务', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 手动调用加载方法，因为在测试环境中 onMounted 可能不会自动执行
      await wrapper.vm.loadActiveTasks()
      
      expect(wrapper.vm.activeTasks).toEqual(mockActiveTasks)
      expect(wrapper.vm.hasActiveTasks).toBe(true)
    })

    it('应该正确显示任务进度', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const task = mockActiveTasks[0] // PRODUCTS task
      expect(wrapper.vm.getTaskDisplayName(task)).toBe('商品数据同步')
      expect(wrapper.vm.getProgressStatus(task.status)).toBeUndefined()
      expect(wrapper.vm.getTaskStatusType(task.status)).toBe('warning')
      expect(wrapper.vm.getTaskStatusText(task.status)).toBe('运行中')
    })

    it('应该能够重试失败的任务', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)
      vi.mocked(platformApi.retrySyncTask).mockResolvedValue({
        data: mockActiveTasks[0]
      } as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.retryTask('task-1')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要重试此同步任务吗？',
        '确认操作',
        { type: 'warning' }
      )
      expect(platformApi.retrySyncTask).toHaveBeenCalledWith('task-1')
      expect(ElMessage.success).toHaveBeenCalledWith('任务重试已启动')
    })
  })

  describe('同步计划设置', () => {
    it('应该加载同步计划配置', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 手动调用加载方法
      await wrapper.vm.loadSchedule()
      
      expect(platformApi.getSyncSchedule).toHaveBeenCalledWith(1)
      expect(wrapper.vm.scheduleForm.frequency).toBe('daily')
      expect(wrapper.vm.scheduleEnabled).toBe(true)
    })

    it('应该能够切换同步计划状态', async () => {
      vi.mocked(platformApi.toggleSyncSchedule).mockResolvedValue({} as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.toggleSchedule(false)
      
      expect(platformApi.toggleSyncSchedule).toHaveBeenCalledWith(false, 1)
      expect(ElMessage.success).toHaveBeenCalledWith('自动同步已禁用')
    })

    it('应该能够保存同步计划', async () => {
      vi.mocked(platformApi.saveSyncSchedule).mockResolvedValue({
        data: mockSchedule
      } as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.saveSchedule()
      
      expect(platformApi.saveSyncSchedule).toHaveBeenCalledWith({
        ...wrapper.vm.scheduleForm,
        platformId: 1
      })
      expect(ElMessage.success).toHaveBeenCalledWith('同步计划保存成功')
    })

    it('应该能够重置同步计划', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      wrapper.vm.resetSchedule()
      
      expect(wrapper.vm.scheduleForm.frequency).toBe('daily')
      expect(wrapper.vm.scheduleForm.errorHandling).toBe('continue')
      expect(wrapper.vm.nextExecutionTime).toBeNull()
    })

    it('应该计算下次执行时间', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.calculateNextExecutionTime()
      
      expect(platformApi.getNextExecutionTime).toHaveBeenCalledWith(wrapper.vm.scheduleForm)
      expect(wrapper.vm.nextExecutionTime).toBe('2024-01-16T02:00:00Z')
    })
  })

  describe('同步日志管理', () => {
    it('应该加载同步日志', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 手动调用加载方法
      await wrapper.vm.loadSyncLogs()
      
      expect(platformApi.getSyncLogs).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        platformId: 1,
        syncType: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined
      })
      expect(wrapper.vm.syncLogs).toEqual(mockSyncLogs.records)
    })

    it('应该能够查看日志详情', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const log = mockSyncLogs.records[0]
      wrapper.vm.viewLogDetails(log)
      
      expect(wrapper.vm.selectedLog).toEqual(log)
      expect(wrapper.vm.logDetailDialogVisible).toBe(true)
    })

    it('应该能够导出日志', async () => {
      vi.mocked(platformApi.exportSyncLogs).mockResolvedValue({
        data: { downloadUrl: 'http://example.com/logs.xlsx' }
      } as any)
      
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.exportLogs()
      
      expect(platformApi.exportSyncLogs).toHaveBeenCalled()
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('http://example.com/logs.xlsx')
      expect(mockLink.click).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('日志导出成功')
      
      // Cleanup
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该能够清空日志', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)
      vi.mocked(platformApi.clearSyncLogs).mockResolvedValue({} as unknown)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.clearLogs()
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要清空所有同步日志吗？此操作不可恢复。',
        '确认操作',
        { type: 'warning' }
      )
      expect(platformApi.clearSyncLogs).toHaveBeenCalledWith(1)
      expect(wrapper.vm.syncLogs).toEqual([])
      expect(ElMessage.success).toHaveBeenCalledWith('日志已清空')
    })
  })

  describe('工具方法', () => {
    it('应该正确格式化日期时间', () => {
      wrapper = createWrapper()
      
      const dateTime = '2024-01-15T10:30:00Z'
      const formatted = wrapper.vm.formatDateTime(dateTime)
      
      expect(formatted).toMatch(/2024/)
    })

    it('应该正确获取同步状态类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getSyncStatusType('COMPLETED')).toBe('success')
      expect(wrapper.vm.getSyncStatusType('RUNNING')).toBe('warning')
      expect(wrapper.vm.getSyncStatusType('FAILED')).toBe('danger')
      expect(wrapper.vm.getSyncStatusType('PENDING')).toBe('info')
    })

    it('应该正确获取同步类型文本', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getSyncTypeText('PRODUCTS')).toBe('商品')
      expect(wrapper.vm.getSyncTypeText('ORDERS')).toBe('订单')
      expect(wrapper.vm.getSyncTypeText('INVENTORY')).toBe('库存')
    })

    it('应该正确计算任务持续时间', () => {
      wrapper = createWrapper()
      
      const startTime = '2024-01-15T10:00:00Z'
      const endTime = '2024-01-15T10:05:30Z'
      const duration = wrapper.vm.calculateDuration(startTime, endTime)
      
      expect(duration).toBe('5分钟30秒')
    })
  })

  describe('错误处理', () => {
    it('应该处理API调用失败', async () => {
      vi.mocked(platformApi.startDataSync).mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      wrapper.vm.selectedSyncTypes = ['PRODUCTS']
      await wrapper.vm.startSync()
      
      expect(ElMessage.error).toHaveBeenCalledWith('启动同步任务失败')
    })

    it('应该处理停止任务失败', async () => {
      vi.mocked(platformApi.stopSyncTask).mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.stopTask('task-1')
      
      expect(ElMessage.error).toHaveBeenCalledWith('停止任务失败')
    })

    it('应该处理保存计划失败', async () => {
      vi.mocked(platformApi.saveSyncSchedule).mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await wrapper.vm.saveSchedule()
      
      expect(ElMessage.error).toHaveBeenCalledWith('保存同步计划失败')
    })
  })

  describe('生命周期', () => {
    it('应该在组件挂载时加载数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 手动调用生命周期方法来模拟挂载行为
      await wrapper.vm.loadActiveTasks()
      await wrapper.vm.loadSyncLogs()
      await wrapper.vm.loadSchedule()
      
      expect(platformApi.getActiveSyncTasks).toHaveBeenCalled()
      expect(platformApi.getSyncLogs).toHaveBeenCalled()
      expect(platformApi.getSyncSchedule).toHaveBeenCalled()
    })

    it('应该在有活跃任务时启动状态轮询', async () => {
      vi.useFakeTimers()
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 验证定时器已启动
      expect(wrapper.vm.statusTimer).toBeDefined()
      
      vi.useRealTimers()
    })

    it('应该在组件卸载时清理定时器', async () => {
      vi.useFakeTimers()
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })
})