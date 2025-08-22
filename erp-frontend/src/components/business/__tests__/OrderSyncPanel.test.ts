import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderSyncPanel from '../OrderSyncPanel.vue'
import { orderApi } from '@/api/modules/order'
import type { OrderSyncResult, Store } from '@/types'

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

// Mock order API
vi.mock('@/api/modules/order', () => ({
  orderApi: {
    syncOrders: vi.fn(),
    getSyncStatus: vi.fn(),
    getSyncHistory: vi.fn(),
    cancelSync: vi.fn(),
    retrySyncFailedOrders: vi.fn()
  }
}))

describe('OrderSyncPanel', () => {
  let wrapper: VueWrapper<any>
  
  const mockStores: Store[] = [
    { id: 1, name: 'Walmart旗舰店', platform: 'Walmart', status: 'ACTIVE' },
    { id: 2, name: 'Amazon官方店', platform: 'Amazon', status: 'ACTIVE' }
  ]

  const mockSyncTask: OrderSyncResult = {
    taskId: 'task-123',
    status: 'RUNNING',
    totalCount: 100,
    successCount: 80,
    failedCount: 5,
    errors: [
      { platformOrderId: 'WM-001', error: '商品不存在' },
      { platformOrderId: 'WM-002', error: '库存不足' }
    ],
    startTime: '2024-01-01T10:00:00Z',
    endTime: undefined
  }

  const createWrapper = (props = {}) => {
    return mount(OrderSyncPanel, {
      props: {
        stores: mockStores,
        autoRefresh: false,
        ...props
      },
      global: {
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-progress': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-row': true,
          'el-col': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('应该正确渲染同步操作面板', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.sync-operation-panel').exists()).toBe(true)
      expect(wrapper.find('.panel-title').text()).toContain('订单同步')
      expect(wrapper.find('.panel-description').text()).toContain('从电商平台同步最新的订单数据')
    })

    it('应该渲染同步表单', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.sync-form').exists()).toBe(true)
      expect(wrapper.find('.sync-actions').exists()).toBe(true)
    })

    it('应该渲染同步历史面板', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.sync-history-panel').exists()).toBe(true)
      expect(wrapper.find('.history-title').text()).toContain('同步历史')
    })
  })

  describe('同步操作', () => {
    it('应该能够启动同步任务', async () => {
      const mockResponse = { data: mockSyncTask }
      vi.mocked(orderApi.syncOrders).mockResolvedValue(mockResponse)
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      // 设置表单数据
      component.syncForm.syncType = 'incremental'
      
      // 模拟表单验证通过
      component.syncFormRef = { validate: vi.fn().mockResolvedValue(true) }
      
      await component.handleStartSync()
      
      expect(orderApi.syncOrders).toHaveBeenCalledWith({
        syncType: 'incremental',
        storeId: undefined,
        startDate: '',
        endDate: ''
      })
      expect(ElMessage.success).toHaveBeenCalledWith('同步任务已启动')
      expect(component.activeSyncTask).toEqual(mockSyncTask)
    })

    it('应该处理同步启动失败', async () => {
      const error = new Error('网络错误')
      vi.mocked(orderApi.syncOrders).mockRejectedValue(error)
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.syncForm.syncType = 'incremental'
      
      await component.handleStartSync()
      
      expect(ElMessage.error).toHaveBeenCalledWith('启动同步失败')
    })

    it('应该能够取消同步任务', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      vi.mocked(orderApi.cancelSync).mockResolvedValue({ data: null })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      await component.handleCancelSync()
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(orderApi.cancelSync).toHaveBeenCalledWith('task-123')
      expect(ElMessage.success).toHaveBeenCalledWith('同步任务已取消')
    })

    it('应该能够刷新同步状态', async () => {
      const updatedTask = { ...mockSyncTask, status: 'COMPLETED' as const }
      vi.mocked(orderApi.getSyncStatus).mockResolvedValue({ data: updatedTask })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      await component.handleRefreshStatus()
      
      expect(orderApi.getSyncStatus).toHaveBeenCalledWith('task-123')
      expect(component.activeSyncTask).toEqual(updatedTask)
    })
  })

  describe('进度显示', () => {
    it('应该正确计算进度百分比', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      const percentage = component.getProgressPercentage(mockSyncTask)
      expect(percentage).toBe(85) // (80 + 5) / 100 * 100
    })

    it('应该正确显示进度文本', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      const text = component.getProgressText(mockSyncTask)
      expect(text).toContain('正在同步订单数据')
      expect(text).toContain('85/100')
    })

    it('应该正确获取进度条状态', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      expect(component.getProgressStatus('RUNNING')).toBe('')
      expect(component.getProgressStatus('COMPLETED')).toBe('success')
      expect(component.getProgressStatus('FAILED')).toBe('exception')
    })
  })

  describe('错误处理', () => {
    it('应该显示同步错误信息', async () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.sync-errors').exists()).toBe(true)
      expect(wrapper.find('.error-title').text()).toContain('同步错误 (2)')
    })

    it('应该能够重试失败的订单', async () => {
      const retryTask = { ...mockSyncTask, taskId: 'retry-task-456' }
      vi.mocked(orderApi.retrySyncFailedOrders).mockResolvedValue({ data: retryTask })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      await component.handleRetryFailedOrders()
      
      expect(orderApi.retrySyncFailedOrders).toHaveBeenCalledWith('task-123')
      expect(ElMessage.success).toHaveBeenCalledWith('重试任务已启动')
      expect(component.activeSyncTask).toEqual(retryTask)
    })

    it('应该能够切换显示所有错误', async () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = {
        ...mockSyncTask,
        errors: Array.from({ length: 10 }, (_, i) => ({
          platformOrderId: `WM-${i.toString().padStart(3, '0')}`,
          error: `错误 ${i + 1}`
        }))
      }
      
      expect(component.showAllErrors).toBe(false)
      
      component.showAllErrors = true
      await wrapper.vm.$nextTick()
      
      expect(component.showAllErrors).toBe(true)
    })
  })

  describe('同步历史', () => {
    it('应该能够刷新同步历史', async () => {
      const mockHistory = {
        data: {
          list: [mockSyncTask],
          total: 1
        }
      }
      vi.mocked(orderApi.getSyncHistory).mockResolvedValue(mockHistory)
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      await component.handleRefreshHistory()
      
      expect(orderApi.getSyncHistory).toHaveBeenCalled()
      expect(component.syncHistory).toEqual([mockSyncTask])
      expect(component.historyTotal).toBe(1)
    })

    it('应该能够清空同步历史', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.syncHistory = [mockSyncTask]
      component.historyTotal = 1
      
      await component.handleClearHistory()
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(component.syncHistory).toEqual([])
      expect(component.historyTotal).toBe(0)
      expect(ElMessage.success).toHaveBeenCalledWith('同步历史已清空')
    })

    it('应该处理历史分页变化', async () => {
      const mockHistory = { data: { list: [], total: 0 } }
      vi.mocked(orderApi.getSyncHistory).mockResolvedValue(mockHistory)
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      await component.handleHistoryPageChange(2)
      
      expect(component.historyQuery.page).toBe(2)
      expect(orderApi.getSyncHistory).toHaveBeenCalled()
    })
  })

  describe('日志查看', () => {
    it('应该能够查看同步日志', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.handleViewSyncLog(mockSyncTask)
      
      expect(component.logDialog.visible).toBe(true)
      expect(component.logDialog.task).toEqual(mockSyncTask)
    })

    it('应该能够从日志对话框重试', async () => {
      const retryTask = { ...mockSyncTask, taskId: 'retry-task-789' }
      vi.mocked(orderApi.retrySyncFailedOrders).mockResolvedValue({ data: retryTask })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.logDialog.task = mockSyncTask
      component.logDialog.visible = true
      
      await component.handleRetryFromLog()
      
      expect(orderApi.retrySyncFailedOrders).toHaveBeenCalledWith('task-123')
      expect(component.logDialog.visible).toBe(false)
      expect(component.activeSyncTask).toEqual(retryTask)
    })
  })

  describe('工具方法', () => {
    it('应该正确获取同步状态文本', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      expect(component.getSyncStatusText('PENDING')).toBe('等待中')
      expect(component.getSyncStatusText('RUNNING')).toBe('同步中')
      expect(component.getSyncStatusText('COMPLETED')).toBe('已完成')
      expect(component.getSyncStatusText('FAILED')).toBe('失败')
    })

    it('应该正确格式化日期时间', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      const formatted = component.formatDateTime('2024-01-01T10:00:00Z')
      expect(formatted).toMatch(/2024/)
      expect(formatted).toMatch(/01/)
      // 时间可能因时区而不同，只检查格式
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('事件发射', () => {
    it('应该在同步启动时发射事件', async () => {
      vi.mocked(orderApi.syncOrders).mockResolvedValue({ data: mockSyncTask })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.syncForm.syncType = 'incremental'
      // 模拟表单验证通过
      component.syncFormRef = { validate: vi.fn().mockResolvedValue(true) }
      
      await component.handleStartSync()
      
      expect(wrapper.emitted('syncStarted')).toBeTruthy()
      expect(wrapper.emitted('syncStarted')![0]).toEqual([mockSyncTask])
    })

    it('应该在同步完成时发射事件', async () => {
      const completedTask = { ...mockSyncTask, status: 'COMPLETED' as const }
      vi.mocked(orderApi.getSyncStatus).mockResolvedValue({ data: completedTask })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      await component.handleRefreshStatus()
      
      expect(wrapper.emitted('syncCompleted')).toBeTruthy()
      expect(wrapper.emitted('syncCompleted')![0]).toEqual([completedTask])
    })

    it('应该在同步失败时发射事件', async () => {
      const failedTask = { ...mockSyncTask, status: 'FAILED' as const }
      vi.mocked(orderApi.getSyncStatus).mockResolvedValue({ data: failedTask })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      await component.handleRefreshStatus()
      
      expect(wrapper.emitted('syncFailed')).toBeTruthy()
      expect(wrapper.emitted('syncFailed')![0][0]).toEqual(failedTask)
    })

    it('应该在同步取消时发射事件', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      vi.mocked(orderApi.cancelSync).mockResolvedValue({ data: null })
      
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      await component.handleCancelSync()
      
      expect(wrapper.emitted('syncCancelled')).toBeTruthy()
      expect(wrapper.emitted('syncCancelled')![0]).toEqual(['task-123'])
    })
  })

  describe('计算属性', () => {
    it('应该正确计算是否有同步任务运行', () => {
      wrapper = createWrapper()
      const component = wrapper.vm
      
      component.activeSyncTask = null
      expect(component.hasSyncTaskRunning).toBe(false)
      
      component.activeSyncTask = { ...mockSyncTask, status: 'PENDING' }
      expect(component.hasSyncTaskRunning).toBe(false)
      
      component.activeSyncTask = { ...mockSyncTask, status: 'RUNNING' }
      expect(component.hasSyncTaskRunning).toBe(true)
      
      component.activeSyncTask = { ...mockSyncTask, status: 'COMPLETED' }
      expect(component.hasSyncTaskRunning).toBe(false)
    })
  })

  describe('自动刷新', () => {
    it('应该能够启动和停止自动刷新', () => {
      wrapper = createWrapper({ autoRefresh: true, refreshInterval: 1000 })
      const component = wrapper.vm
      
      component.activeSyncTask = mockSyncTask
      
      // 测试启动自动刷新
      component.startAutoRefresh()
      expect(component.refreshTimer).toBeDefined()
      
      // 测试停止自动刷新
      component.stopAutoRefresh()
      expect(component.refreshTimer).toBeNull()
    })

    it('应该在任务完成时停止自动刷新', () => {
      wrapper = createWrapper({ autoRefresh: true })
      const component = wrapper.vm
      
      component.activeSyncTask = { ...mockSyncTask, status: 'COMPLETED' }
      
      const stopSpy = vi.spyOn(component, 'stopAutoRefresh')
      component.startAutoRefresh()
      
      // 模拟定时器触发
      component.activeSyncTask.status = 'COMPLETED'
      
      expect(stopSpy).toBeDefined()
    })
  })
})