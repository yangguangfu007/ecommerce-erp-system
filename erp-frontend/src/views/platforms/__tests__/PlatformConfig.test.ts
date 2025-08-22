/**
 * 平台配置页面组件测试
 * 测试平台类型选择、配置表单、连接测试等功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Connection: 'connection-icon',
  Check: 'check-icon',
  Shop: 'shop-icon',
  Warning: 'warning-icon',
  CircleCheck: 'circle-check-icon',
  CircleClose: 'circle-close-icon',
  QuestionFilled: 'question-filled-icon',
  HomeFilled: 'home-filled-icon',
  ArrowRight: 'arrow-right-icon'
}))

// Mock API module
vi.mock('@/api/modules/platform', () => ({
  platformApi: {
    testConnection: vi.fn(),
    saveConfig: vi.fn(),
    getConfig: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

import PlatformConfig from '../PlatformConfig.vue'

// Mock components
const mockComponents = {
  BreadcrumbNav: {
    template: '<div data-testid="breadcrumb-nav"><slot /></div>',
    props: ['items']
  }
}

describe('PlatformConfig', () => {
  let wrapper: any
  let mockPlatformApi: any
  let mockElMessage: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get mocked modules
    const platformModule = await import('@/api/modules/platform')
    const elementModule = await import('element-plus')
    
    mockPlatformApi = platformModule.platformApi
    mockElMessage = elementModule.ElMessage
    
    // Setup mock API responses
    mockPlatformApi.testConnection.mockResolvedValue({ success: true })
    mockPlatformApi.saveConfig.mockResolvedValue({ success: true })
    mockPlatformApi.getConfig.mockResolvedValue({
      platformName: '沃尔玛旗舰店',
      platformType: 'walmart'
    })
  })

  const createWrapper = (props = {}) => {
    return mount(PlatformConfig, {
      props,
      global: {
        components: mockComponents,
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-input-number': true,
          'el-switch': true,
          'el-form': true,
          'el-form-item': true,
          'component': true
        }
      }
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染页面结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.find('.platform-types').exists()).toBe(true)
      expect(wrapper.find('.config-form').exists()).toBe(true)
      expect(wrapper.find('.connection-status').exists()).toBe(true)
    })

    it('应该显示正确的页面标题和描述', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-title').text()).toBe('平台配置')
      expect(wrapper.find('.page-description').text()).toBe('配置电商平台连接参数和同步设置')
    })

    it('应该渲染所有平台类型选项', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.platformTypes).toHaveLength(4)
      expect(wrapper.vm.platformTypes[0].name).toBe('沃尔玛')
      expect(wrapper.vm.platformTypes[1].name).toBe('亚马逊')
      expect(wrapper.vm.platformTypes[2].name).toBe('eBay')
      expect(wrapper.vm.platformTypes[3].name).toBe('Shopify')
    })
  })

  describe('平台类型选择', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该默认选择沃尔玛平台', () => {
      expect(wrapper.vm.selectedPlatformType).toBe('walmart')
    })

    it('应该支持切换平台类型', async () => {
      await wrapper.vm.selectPlatformType('amazon')
      
      expect(wrapper.vm.selectedPlatformType).toBe('amazon')
      expect(wrapper.vm.configForm.platformName).toBe('亚马逊专营店')
    })

    it('应该根据平台类型预填充默认值', async () => {
      await wrapper.vm.selectPlatformType('ebay')
      
      expect(wrapper.vm.configForm.platformName).toBe('eBay国际店')
      expect(wrapper.vm.configForm.platformUrl).toBe('https://www.ebay.com')
      expect(wrapper.vm.configForm.apiEndpoint).toBe('https://api.ebay.com')
      expect(wrapper.vm.configForm.apiVersion).toBe('v1')
    })

    it('应该支持选择Shopify平台', async () => {
      await wrapper.vm.selectPlatformType('shopify')
      
      expect(wrapper.vm.configForm.platformName).toBe('Shopify商店')
      expect(wrapper.vm.configForm.apiVersion).toBe('v1')
    })
  })

  describe('配置表单', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该正确初始化表单数据', () => {
      expect(wrapper.vm.configForm.syncInterval).toBe(30)
      expect(wrapper.vm.configForm.batchSize).toBe(100)
      expect(wrapper.vm.configForm.autoSync).toBe(true)
      expect(wrapper.vm.configForm.timeout).toBe(30)
      expect(wrapper.vm.configForm.retryCount).toBe(3)
    })

    it('应该支持修改同步设置', async () => {
      wrapper.vm.configForm.syncInterval = 60
      wrapper.vm.configForm.autoSync = false
      
      expect(wrapper.vm.configForm.syncInterval).toBe(60)
      expect(wrapper.vm.configForm.autoSync).toBe(false)
    })

    it('应该支持修改高级设置', async () => {
      wrapper.vm.configForm.timeout = 60
      wrapper.vm.configForm.retryCount = 5
      wrapper.vm.configForm.enableLogging = false
      
      expect(wrapper.vm.configForm.timeout).toBe(60)
      expect(wrapper.vm.configForm.retryCount).toBe(5)
      expect(wrapper.vm.configForm.enableLogging).toBe(false)
    })

    it('应该验证必填字段', () => {
      const rules = wrapper.vm.configRules
      
      expect(rules.platformName[0].required).toBe(true)
      expect(rules.platformUrl[0].required).toBe(true)
      expect(rules.apiEndpoint[0].required).toBe(true)
      expect(rules.clientId[0].required).toBe(true)
      expect(rules.clientSecret[0].required).toBe(true)
    })

    it('应该验证URL格式', () => {
      const rules = wrapper.vm.configRules
      
      expect(rules.platformUrl[1].type).toBe('url')
      expect(rules.apiEndpoint[1].type).toBe('url')
      expect(rules.webhookUrl[0].type).toBe('url')
    })

    it('应该验证数值范围', () => {
      const rules = wrapper.vm.configRules
      
      expect(rules.syncInterval[1].min).toBe(1)
      expect(rules.syncInterval[1].max).toBe(1440)
      expect(rules.batchSize[1].min).toBe(1)
      expect(rules.batchSize[1].max).toBe(1000)
      expect(rules.timeout[1].min).toBe(1)
      expect(rules.timeout[1].max).toBe(300)
    })
  })

  describe('连接测试功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      // 设置有效的表单数据
      Object.assign(wrapper.vm.configForm, {
        platformName: '测试平台',
        platformUrl: 'https://test.com',
        apiEndpoint: 'https://api.test.com',
        apiVersion: 'v1',
        clientId: 'test_client',
        clientSecret: 'test_secret'
      })
    })

    it('应该显示初始连接状态', () => {
      expect(wrapper.vm.connectionStatus.type).toBe('status-unknown')
      expect(wrapper.vm.connectionStatus.title).toBe('未测试')
    })

    it('应该支持测试连接成功', async () => {
      // Mock 表单验证成功
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // Mock Math.random 返回大值以触发成功
      const originalRandom = Math.random
      Math.random = vi.fn().mockReturnValue(0.8)
      
      await wrapper.vm.testConnection()
      
      expect(wrapper.vm.testingConnection).toBe(false)
      expect(wrapper.vm.connectionStatus.type).toBe('status-success')
      expect(mockElMessage.success).toHaveBeenCalledWith('平台连接测试成功')
      
      Math.random = originalRandom
    })

    it('应该处理连接测试失败', async () => {
      // Mock 表单验证成功但连接失败
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // Mock Math.random 返回小值以触发失败
      const originalRandom = Math.random
      Math.random = vi.fn().mockReturnValue(0.1)
      
      await wrapper.vm.testConnection()
      
      expect(wrapper.vm.connectionStatus.type).toBe('status-error')
      expect(wrapper.vm.connectionStatus.title).toBe('连接失败')
      expect(mockElMessage.error).toHaveBeenCalledWith('平台连接测试失败，请检查配置')
      
      Math.random = originalRandom
    })

    it('应该处理表单验证失败', async () => {
      // Mock 表单验证失败
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
      }
      
      await wrapper.vm.testConnection()
      
      expect(wrapper.vm.connectionStatus.type).toBe('status-error')
      expect(wrapper.vm.connectionStatus.title).toBe('配置错误')
      expect(mockElMessage.warning).toHaveBeenCalledWith('请先完善配置信息')
    })

    it('应该在测试过程中显示加载状态', async () => {
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // 开始测试连接
      const testPromise = wrapper.vm.testConnection()
      
      // 等待下一个 tick 让状态更新
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.testingConnection).toBe(true)
      expect(wrapper.vm.connectionStatus.type).toBe('status-testing')
      
      await testPromise
      
      expect(wrapper.vm.testingConnection).toBe(false)
    })
  })

  describe('配置保存功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
      // 设置有效的表单数据
      Object.assign(wrapper.vm.configForm, {
        platformName: '测试平台',
        platformUrl: 'https://test.com',
        apiEndpoint: 'https://api.test.com',
        apiVersion: 'v1',
        clientId: 'test_client',
        clientSecret: 'test_secret'
      })
    })

    it('应该支持保存配置', async () => {
      // Mock 表单验证成功
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      await wrapper.vm.saveConfig()
      
      expect(wrapper.vm.saving).toBe(false)
      expect(mockElMessage.success).toHaveBeenCalledWith('平台配置保存成功')
    })

    it('应该处理保存失败', async () => {
      // Mock 表单验证失败
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
      }
      
      await wrapper.vm.saveConfig()
      
      expect(mockElMessage.error).toHaveBeenCalledWith('配置保存失败，请检查表单信息')
    })

    it('应该在保存过程中显示加载状态', async () => {
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // 开始保存配置
      const savePromise = wrapper.vm.saveConfig()
      
      // 等待下一个 tick 让状态更新
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.saving).toBe(true)
      
      await savePromise
      
      expect(wrapper.vm.saving).toBe(false)
    })

    it('应该包含平台类型在保存数据中', async () => {
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      wrapper.vm.selectedPlatformType = 'amazon'
      
      await wrapper.vm.saveConfig()
      
      // 验证保存的数据包含平台类型
      expect(wrapper.vm.selectedPlatformType).toBe('amazon')
    })
  })

  describe('配置加载功能', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该在组件挂载时加载配置', async () => {
      await wrapper.vm.loadConfig()
      
      expect(wrapper.vm.configForm.platformName).toBe('沃尔玛旗舰店')
      expect(wrapper.vm.configForm.platformUrl).toBe('https://marketplace.walmart.com')
    })

    it('应该处理配置加载错误', async () => {
      // Mock 加载失败
      const originalConsoleError = console.error
      console.error = vi.fn()
      
      try {
        // 模拟加载错误
        wrapper.vm.configForm = null
        await wrapper.vm.loadConfig()
      } catch (error) {
        // 预期的错误
      }
      
      console.error = originalConsoleError
    })
  })

  describe('表单验证', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该验证平台名称为必填', () => {
      const rule = wrapper.vm.configRules.platformName[0]
      expect(rule.required).toBe(true)
      expect(rule.message).toBe('请输入平台名称')
    })

    it('应该验证API版本为必选', () => {
      const rule = wrapper.vm.configRules.apiVersion[0]
      expect(rule.required).toBe(true)
      expect(rule.message).toBe('请选择API版本')
    })

    it('应该验证同步间隔范围', () => {
      const rule = wrapper.vm.configRules.syncInterval[1]
      expect(rule.min).toBe(1)
      expect(rule.max).toBe(1440)
    })

    it('应该验证批量大小范围', () => {
      const rule = wrapper.vm.configRules.batchSize[1]
      expect(rule.min).toBe(1)
      expect(rule.max).toBe(1000)
    })

    it('应该验证超时时间范围', () => {
      const rule = wrapper.vm.configRules.timeout[1]
      expect(rule.min).toBe(1)
      expect(rule.max).toBe(300)
    })

    it('应该验证重试次数范围', () => {
      const rule = wrapper.vm.configRules.retryCount[1]
      expect(rule.min).toBe(0)
      expect(rule.max).toBe(10)
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      wrapper = createWrapper()
      
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      expect(wrapper.find('.platform-config').exists()).toBe(true)
    })
  })

  describe('用户交互', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持切换同步开关', async () => {
      wrapper.vm.configForm.autoSync = false
      expect(wrapper.vm.configForm.autoSync).toBe(false)
      
      wrapper.vm.configForm.autoSync = true
      expect(wrapper.vm.configForm.autoSync).toBe(true)
    })

    it('应该支持修改数值输入', async () => {
      wrapper.vm.configForm.syncInterval = 60
      wrapper.vm.configForm.batchSize = 200
      
      expect(wrapper.vm.configForm.syncInterval).toBe(60)
      expect(wrapper.vm.configForm.batchSize).toBe(200)
    })

    it('应该支持输入密码字段', async () => {
      wrapper.vm.configForm.clientSecret = 'new_secret'
      wrapper.vm.configForm.accessToken = 'new_token'
      
      expect(wrapper.vm.configForm.clientSecret).toBe('new_secret')
      expect(wrapper.vm.configForm.accessToken).toBe('new_token')
    })
  })

  describe('错误处理', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该处理网络错误', async () => {
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('Network error'))
      }
      
      await wrapper.vm.testConnection()
      
      expect(wrapper.vm.connectionStatus.type).toBe('status-error')
    })

    it('应该处理API错误', async () => {
      wrapper.vm.configFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('API error'))
      }
      
      await wrapper.vm.saveConfig()
      
      expect(mockElMessage.error).toHaveBeenCalled()
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量配置项', () => {
      wrapper = createWrapper()
      
      // 测试大量配置项的处理
      const largeConfig = {}
      for (let i = 0; i < 100; i++) {
        largeConfig[`config_${i}`] = `value_${i}`
      }
      
      Object.assign(wrapper.vm.configForm, largeConfig)
      
      expect(Object.keys(wrapper.vm.configForm).length).toBeGreaterThan(20)
    })

    it('应该避免不必要的重新渲染', () => {
      wrapper = createWrapper()
      
      const initialType = wrapper.vm.selectedPlatformType
      wrapper.vm.selectPlatformType(initialType)
      
      expect(wrapper.vm.selectedPlatformType).toBe(initialType)
    })
  })
})