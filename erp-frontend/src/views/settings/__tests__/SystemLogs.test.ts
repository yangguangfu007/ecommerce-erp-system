import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import SystemLogs from '../SystemLogs.vue'
import { systemApi } from '@/api/modules/system'

// Mock API
vi.mock('@/api/modules/system', () => ({
  systemApi: {
    getSystemLogs: vi.fn(),
    cleanupSystemLogs: vi.fn(),
    exportSystemLogs: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock utils
vi.mock('@/utils', () => ({
  formatDateTime: vi.fn((date) => '2024-01-01 12:00:00')
}))

describe('SystemLogs', () => {
  let wrapper: any

  const mockLogData = {
    content: [
      {
        id: 1,
        level: 'INFO',
        type: 'SYSTEM',
        message: '用户 admin 登录系统',
        source: 'user-service',
        username: 'admin',
        ip: '192.168.1.100',
        duration: 150,
        createdAt: '2024-01-01T12:00:00Z',
        details: { action: 'login' },
        stackTrace: null
      },
      {
        id: 2,
        level: 'WARN',
        type: 'OPERATION',
        message: '商品 SKU003 库存不足',
        source: 'inventory-service',
        username: 'system',
        ip: '127.0.0.1',
        duration: 50,
        createdAt: '2024-01-01T11:30:00Z',
        details: { sku: 'SKU003', stock: 3 },
        stackTrace: null
      },
      {
        id: 3,
        level: 'ERROR',
        type: 'ERROR',
        message: '平台同步失败：连接超时',
        source: 'platform-service',
        username: null,
        ip: null,
        duration: 5000,
        createdAt: '2024-01-01T11:00:00Z',
        details: { platform: 'walmart', error: 'timeout' },
        stackTrace: 'java.net.SocketTimeoutException: Read timed out'
      }
    ],
    total: 3,
    current: 1,
    size: 20
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock API responses
    vi.mocked(systemApi.getSystemLogs).mockResolvedValue({
      code: 200,
      message: '查询成功',
      data: mockLogData
    })
    
    vi.mocked(systemApi.cleanupSystemLogs).mockResolvedValue({
      code: 200,
      message: '清理成功',
      data: { deletedCount: 100, spaceFreed: 1024000 }
    })
    
    vi.mocked(systemApi.exportSystemLogs).mockResolvedValue({
      code: 200,
      message: '导出成功',
      data: { downloadUrl: 'http://example.com/logs.xlsx' }
    })

    wrapper = mount(SystemLogs, {
      global: {
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-input': true,
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-text': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-icon': true
        }
      }
    })
  })

  it('应该正确渲染系统日志页面', () => {
    expect(wrapper.find('.system-logs').exists()).toBe(true)
    expect(wrapper.find('.page-header').exists()).toBe(true)
    expect(wrapper.find('.filter-card').exists()).toBe(true)
    expect(wrapper.find('.table-card').exists()).toBe(true)
  })

  it('应该显示正确的页面标题', () => {
    const pageTitle = wrapper.find('.page-title h2')
    expect(pageTitle.text()).toBe('系统日志')
  })

  it('应该正确初始化查询参数', () => {
    const vm = wrapper.vm
    expect(vm.queryParams.page).toBe(1)
    expect(vm.queryParams.size).toBe(20)
    expect(vm.queryParams.level).toBe('')
    expect(vm.queryParams.type).toBe('')
    expect(vm.queryParams.keyword).toBe('')
  })

  it('应该在组件挂载时加载日志数据', async () => {
    await wrapper.vm.$nextTick()
    expect(systemApi.getSystemLogs).toHaveBeenCalledWith(wrapper.vm.queryParams)
  })

  it('应该正确设置日志数据', async () => {
    await wrapper.vm.loadLogs()
    expect(wrapper.vm.logList).toEqual(mockLogData.content)
    expect(wrapper.vm.total).toBe(mockLogData.total)
  })

  it('应该正确获取日志级别类型', () => {
    const vm = wrapper.vm
    expect(vm.getLogLevelType('INFO')).toBe('success')
    expect(vm.getLogLevelType('WARN')).toBe('warning')
    expect(vm.getLogLevelType('ERROR')).toBe('danger')
    expect(vm.getLogLevelType('DEBUG')).toBe('info')
  })

  it('应该正确获取日志级别文本', () => {
    const vm = wrapper.vm
    expect(vm.getLogLevelText('INFO')).toBe('信息')
    expect(vm.getLogLevelText('WARN')).toBe('警告')
    expect(vm.getLogLevelText('ERROR')).toBe('错误')
    expect(vm.getLogLevelText('DEBUG')).toBe('调试')
  })

  it('应该正确获取日志类型颜色', () => {
    const vm = wrapper.vm
    expect(vm.getLogTypeColor('SYSTEM')).toBe('primary')
    expect(vm.getLogTypeColor('OPERATION')).toBe('success')
    expect(vm.getLogTypeColor('ERROR')).toBe('danger')
    expect(vm.getLogTypeColor('SECURITY')).toBe('warning')
  })

  it('应该正确获取日志类型文本', () => {
    const vm = wrapper.vm
    expect(vm.getLogTypeText('SYSTEM')).toBe('系统')
    expect(vm.getLogTypeText('OPERATION')).toBe('操作')
    expect(vm.getLogTypeText('ERROR')).toBe('错误')
    expect(vm.getLogTypeText('SECURITY')).toBe('安全')
  })

  it('应该能够搜索日志', async () => {
    wrapper.vm.queryParams.keyword = '登录'
    wrapper.vm.queryParams.level = 'INFO'
    
    await wrapper.vm.handleSearch()
    
    expect(wrapper.vm.queryParams.page).toBe(1)
    expect(systemApi.getSystemLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: '登录',
        level: 'INFO',
        page: 1
      })
    )
  })

  it('应该能够重置搜索条件', async () => {
    wrapper.vm.queryParams.keyword = '测试'
    wrapper.vm.queryParams.level = 'ERROR'
    wrapper.vm.queryParams.type = 'SYSTEM'
    
    await wrapper.vm.handleReset()
    
    expect(wrapper.vm.queryParams.keyword).toBe('')
    expect(wrapper.vm.queryParams.level).toBe('')
    expect(wrapper.vm.queryParams.type).toBe('')
    expect(wrapper.vm.queryParams.page).toBe(1)
    expect(systemApi.getSystemLogs).toHaveBeenCalled()
  })

  it('应该能够刷新日志', async () => {
    await wrapper.vm.handleRefresh()
    expect(systemApi.getSystemLogs).toHaveBeenCalled()
  })

  it('应该能够清空日志', async () => {
    // Mock 确认对话框
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')

    await wrapper.vm.handleClearLogs()

    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要清空所有日志吗？此操作不可恢复。',
      '清空确认',
      expect.any(Object)
    )
    expect(systemApi.cleanupSystemLogs).toHaveBeenCalledWith(30)
    expect(ElMessage.success).toHaveBeenCalledWith('日志清空成功')
  })

  it('应该在用户取消清空时不执行清空操作', async () => {
    // Mock 用户取消确认
    vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')

    await wrapper.vm.handleClearLogs()

    expect(systemApi.cleanupSystemLogs).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该能够导出日志', async () => {
    // Mock DOM 操作
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

    await wrapper.vm.handleExport()

    expect(systemApi.exportSystemLogs).toHaveBeenCalledWith(
      wrapper.vm.queryParams,
      'excel'
    )
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockLink.href).toBe('http://example.com/logs.xlsx')
    expect(mockLink.click).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('日志导出成功')

    // 清理 mock
    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('应该能够处理分页大小改变', async () => {
    await wrapper.vm.handleSizeChange(50)
    
    expect(wrapper.vm.queryParams.size).toBe(50)
    expect(wrapper.vm.queryParams.page).toBe(1)
    expect(systemApi.getSystemLogs).toHaveBeenCalled()
  })

  it('应该能够处理当前页改变', async () => {
    await wrapper.vm.handleCurrentChange(2)
    
    expect(wrapper.vm.queryParams.page).toBe(2)
    expect(systemApi.getSystemLogs).toHaveBeenCalled()
  })

  it('应该能够显示日志详情', () => {
    const testLog = mockLogData.content[0]
    
    wrapper.vm.showLogDetail(testLog)
    
    expect(wrapper.vm.selectedLog).toEqual(testLog)
    expect(wrapper.vm.detailVisible).toBe(true)
  })

  it('应该能够处理行点击事件', () => {
    const testLog = mockLogData.content[2] // 有 stackTrace 的日志
    
    // 直接测试方法调用结果
    wrapper.vm.handleRowClick(testLog)
    
    // 验证详情对话框是否打开
    expect(wrapper.vm.selectedLog).toEqual(testLog)
    expect(wrapper.vm.detailVisible).toBe(true)
  })

  it('应该正确处理时间范围变化', async () => {
    const dateRange = ['2024-01-01 00:00:00', '2024-01-01 23:59:59']
    wrapper.vm.dateRange = dateRange
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.queryParams.startTime).toBe(dateRange[0])
    expect(wrapper.vm.queryParams.endTime).toBe(dateRange[1])
  })

  it('应该正确处理API错误', async () => {
    vi.mocked(systemApi.getSystemLogs).mockRejectedValue(new Error('网络错误'))

    await wrapper.vm.loadLogs()

    expect(ElMessage.error).toHaveBeenCalledWith('加载日志列表失败')
  })

  it('应该正确设置加载状态', () => {
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.clearLoading).toBe(false)
    expect(wrapper.vm.exportLoading).toBe(false)
    expect(wrapper.vm.detailVisible).toBe(false)
  })

  it('应该正确获取日志级别样式类', () => {
    const vm = wrapper.vm
    expect(vm.getLogLevelClass('ERROR')).toBe('error-message')
    expect(vm.getLogLevelClass('FATAL')).toBe('error-message')
    expect(vm.getLogLevelClass('WARN')).toBe('warning-message')
    expect(vm.getLogLevelClass('INFO')).toBe('')
  })

  it('应该正确处理导出错误', async () => {
    vi.mocked(systemApi.exportSystemLogs).mockRejectedValue(new Error('导出失败'))

    await wrapper.vm.handleExport()

    expect(ElMessage.error).toHaveBeenCalledWith('导出日志失败，请重试')
  })

  it('应该正确处理清空日志错误', async () => {
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
    vi.mocked(systemApi.cleanupSystemLogs).mockRejectedValue(new Error('清空失败'))

    await wrapper.vm.handleClearLogs()

    expect(ElMessage.error).toHaveBeenCalledWith('清空日志失败，请重试')
  })

  it('应该正确构建查询参数', async () => {
    wrapper.vm.dateRange = ['2024-01-01 00:00:00', '2024-01-01 23:59:59']
    wrapper.vm.queryParams.level = 'ERROR'
    wrapper.vm.queryParams.type = 'SYSTEM'
    wrapper.vm.queryParams.keyword = '错误'

    await wrapper.vm.loadLogs()

    expect(systemApi.getSystemLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'ERROR',
        type: 'SYSTEM',
        keyword: '错误',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-01 23:59:59'
      })
    )
  })
})