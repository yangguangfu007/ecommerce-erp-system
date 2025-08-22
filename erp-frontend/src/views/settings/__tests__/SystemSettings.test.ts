import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import SystemSettings from '../SystemSettings.vue'
import { systemApi } from '@/api/modules/system'

// Mock API
vi.mock('@/api/modules/system', () => ({
  systemApi: {
    getSystemConfigsByType: vi.fn(),
    batchUpdateSystemConfigs: vi.fn(),
    resetAllSystemConfigs: vi.fn(),
    testSystemConnection: vi.fn()
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
  formatDateTime: vi.fn((date) => date)
}))

describe('SystemSettings', () => {
  let wrapper: any

  const mockSystemConfigs = [
    {
      id: 1,
      key: 'general.systemName',
      value: '电商ERP管理系统',
      name: '系统名称',
      type: 'GENERAL',
      valueType: 'STRING',
      isEditable: true,
      isRequired: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      key: 'general.companyName',
      value: '示例科技有限公司',
      name: '公司名称',
      type: 'GENERAL',
      valueType: 'STRING',
      isEditable: true,
      isRequired: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock API responses
    vi.mocked(systemApi.getSystemConfigsByType).mockResolvedValue({
      code: 200,
      message: '查询成功',
      data: mockSystemConfigs
    })
    
    vi.mocked(systemApi.batchUpdateSystemConfigs).mockResolvedValue({
      code: 200,
      message: '更新成功',
      data: mockSystemConfigs
    })
    
    vi.mocked(systemApi.resetAllSystemConfigs).mockResolvedValue({
      code: 200,
      message: '重置成功',
      data: { count: 10 }
    })
    
    vi.mocked(systemApi.testSystemConnection).mockResolvedValue({
      code: 200,
      message: '测试成功',
      data: {
        success: true,
        message: '连接成功',
        duration: 100
      }
    })

    wrapper = mount(SystemSettings, {
      global: {
        stubs: {
          'el-tabs': true,
          'el-tab-pane': true,
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-switch': true,
          'el-button': true,
          'el-row': true,
          'el-col': true,
          'el-icon': true
        }
      }
    })
  })

  it('应该正确渲染系统设置页面', () => {
    expect(wrapper.find('.system-settings').exists()).toBe(true)
    expect(wrapper.find('.page-header').exists()).toBe(true)
    expect(wrapper.find('.config-tabs').exists()).toBe(true)
  })

  it('应该显示正确的页面标题', () => {
    const pageTitle = wrapper.find('.page-title h2')
    expect(pageTitle.text()).toBe('系统配置')
  })

  it('应该包含配置标签页组件', () => {
    // 检查是否包含标签页组件
    expect(wrapper.find('.config-tabs').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'el-tabs' }).exists()).toBe(true)
  })

  it('应该正确初始化基本配置数据', () => {
    const vm = wrapper.vm
    expect(vm.generalConfig.systemName).toBe('电商ERP管理系统')
    expect(vm.generalConfig.companyName).toBe('示例科技有限公司')
    expect(vm.generalConfig.contactEmail).toBe('admin@example.com')
  })

  it('应该正确初始化功能设置数据', () => {
    const vm = wrapper.vm
    expect(vm.featureSettings).toHaveLength(5)
    expect(vm.featureSettings[0].key).toBe('autoSync')
    expect(vm.featureSettings[0].enabled).toBe(true)
  })

  it('应该正确初始化安全配置数据', () => {
    const vm = wrapper.vm
    expect(vm.securityConfig.minPasswordLength).toBe(8)
    expect(vm.securityConfig.maxLoginAttempts).toBe(5)
    expect(vm.securityConfig.sessionTimeout).toBe(120)
  })

  it('应该正确初始化通知配置数据', () => {
    const vm = wrapper.vm
    expect(vm.notificationConfig.emailHost).toBe('smtp.example.com')
    expect(vm.notificationConfig.emailPort).toBe(587)
    expect(vm.notificationConfig.emailSsl).toBe(true)
  })

  it('应该在组件挂载时加载配置', async () => {
    await wrapper.vm.$nextTick()
    expect(systemApi.getSystemConfigsByType).toHaveBeenCalledWith('GENERAL')
    expect(systemApi.getSystemConfigsByType).toHaveBeenCalledWith('SECURITY')
    expect(systemApi.getSystemConfigsByType).toHaveBeenCalledWith('NOTIFICATION')
  })

  it('应该能够保存配置', async () => {
    const saveButton = wrapper.find('[data-test="save-button"]')
    
    // 模拟表单验证通过
    wrapper.vm.generalFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.securityFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.notificationFormRef = { validate: vi.fn().mockResolvedValue(true) }

    await wrapper.vm.handleSave()

    expect(systemApi.batchUpdateSystemConfigs).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('系统配置保存成功')
  })

  it('应该在表单验证失败时显示错误信息', async () => {
    // 模拟表单验证失败
    wrapper.vm.generalFormRef = { validate: vi.fn().mockRejectedValue(false) }
    wrapper.vm.securityFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.notificationFormRef = { validate: vi.fn().mockResolvedValue(true) }

    await wrapper.vm.handleSave()

    expect(ElMessage.error).toHaveBeenCalledWith('请检查表单填写是否正确')
    expect(systemApi.batchUpdateSystemConfigs).not.toHaveBeenCalled()
  })

  it('应该能够重置配置', async () => {
    // Mock 确认对话框
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')

    await wrapper.vm.handleReset()

    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要重置系统配置吗？此操作将恢复所有配置为默认值。',
      '重置确认',
      expect.any(Object)
    )
    expect(systemApi.resetAllSystemConfigs).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('系统配置已重置为默认值')
  })

  it('应该在用户取消重置时不执行重置操作', async () => {
    // Mock 用户取消确认
    vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')

    await wrapper.vm.handleReset()

    expect(systemApi.resetAllSystemConfigs).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该能够测试邮件连接', async () => {
    await wrapper.vm.testEmailConnection()

    expect(systemApi.testSystemConnection).toHaveBeenCalledWith('email', {
      host: 'smtp.example.com',
      port: 587,
      ssl: true,
      username: 'noreply@example.com',
      password: ''
    })
    expect(ElMessage.success).toHaveBeenCalledWith('邮件连接测试成功 (100ms)')
  })

  it('应该在邮件连接测试失败时显示错误信息', async () => {
    vi.mocked(systemApi.testSystemConnection).mockResolvedValue({
      code: 200,
      message: '测试失败',
      data: {
        success: false,
        message: '连接超时',
        duration: 5000
      }
    })

    await wrapper.vm.testEmailConnection()

    expect(ElMessage.error).toHaveBeenCalledWith('邮件连接测试失败: 连接超时')
  })

  it('应该正确处理API错误', async () => {
    vi.mocked(systemApi.batchUpdateSystemConfigs).mockRejectedValue(new Error('网络错误'))

    // 模拟表单验证通过
    wrapper.vm.generalFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.securityFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.notificationFormRef = { validate: vi.fn().mockResolvedValue(true) }

    await wrapper.vm.handleSave()

    expect(ElMessage.error).toHaveBeenCalledWith('保存配置失败，请重试')
  })

  it('应该正确设置加载状态', async () => {
    expect(wrapper.vm.saveLoading).toBe(false)
    expect(wrapper.vm.resetLoading).toBe(false)
    expect(wrapper.vm.testingEmail).toBe(false)
  })

  it('应该包含正确的时区选项', () => {
    const vm = wrapper.vm
    expect(vm.timezoneOptions).toHaveLength(5)
    expect(vm.timezoneOptions[0].value).toBe('Asia/Shanghai')
    expect(vm.timezoneOptions[0].label).toBe('北京时间 (UTC+8)')
  })

  it('应该正确验证表单规则', () => {
    const vm = wrapper.vm
    
    // 检查基本配置验证规则
    expect(vm.generalRules.systemName).toBeDefined()
    expect(vm.generalRules.companyName).toBeDefined()
    expect(vm.generalRules.contactEmail).toBeDefined()
    
    // 检查安全配置验证规则
    expect(vm.securityRules.minPasswordLength).toBeDefined()
    expect(vm.securityRules.maxLoginAttempts).toBeDefined()
    
    // 检查通知配置验证规则
    expect(vm.notificationRules.emailHost).toBeDefined()
    expect(vm.notificationRules.emailPort).toBeDefined()
  })

  it('应该正确构建配置数据', async () => {
    // 模拟表单验证通过
    wrapper.vm.generalFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.securityFormRef = { validate: vi.fn().mockResolvedValue(true) }
    wrapper.vm.notificationFormRef = { validate: vi.fn().mockResolvedValue(true) }

    await wrapper.vm.handleSave()

    const callArgs = vi.mocked(systemApi.batchUpdateSystemConfigs).mock.calls[0][0]
    expect(callArgs.configs).toBeInstanceOf(Array)
    expect(callArgs.configs.length).toBeGreaterThan(0)
    
    // 检查配置项格式
    const firstConfig = callArgs.configs[0]
    expect(firstConfig).toHaveProperty('key')
    expect(firstConfig).toHaveProperty('value')
    expect(firstConfig).toHaveProperty('description')
  })
})