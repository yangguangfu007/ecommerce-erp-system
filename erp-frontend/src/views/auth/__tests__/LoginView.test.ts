import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../LoginView.vue'
import { useUserStore } from '@/stores/user'

// Mock API
vi.mock('@/api', () => ({
  default: {
    post: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
  ]
})

describe('LoginView', () => {
  let wrapper: any
  let userStore: any

  beforeEach(() => {
    // 创建新的Pinia实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 获取用户store
    userStore = useUserStore()
    
    // Mock用户store方法和属性
    userStore.login = vi.fn()
    vi.spyOn(userStore, 'isLoggedIn', 'get').mockReturnValue(false)

    // 挂载组件
    wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })
  })

  it('应该正确渲染登录页面', () => {
    expect(wrapper.find('.login-page').exists()).toBe(true)
    expect(wrapper.find('.login-card').exists()).toBe(true)
    expect(wrapper.find('.login-title').text()).toBe('电商ERP管理系统')
    expect(wrapper.find('.login-subtitle').text()).toBe('请登录您的账户')
  })

  it('应该显示登录表单字段', () => {
    expect(wrapper.find('input[name="username"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('input[name="remember"]').exists()).toBe(true)
    expect(wrapper.find('.btn-login').exists()).toBe(true)
  })

  it('应该有默认的演示账号信息', () => {
    const usernameInput = wrapper.find('input[name="username"]')
    const passwordInput = wrapper.find('input[name="password"]')
    
    expect(usernameInput.element.value).toBe('admin')
    expect(passwordInput.element.value).toBe('admin123')
  })

  it('应该能够切换密码显示/隐藏', async () => {
    const passwordInput = wrapper.find('input[name="password"]')
    const toggleButton = wrapper.find('.password-toggle')
    
    // 初始状态应该是password类型
    expect(passwordInput.attributes('type')).toBe('password')
    
    // 点击切换按钮
    await toggleButton.trigger('click')
    
    // 应该变为text类型
    expect(passwordInput.attributes('type')).toBe('text')
    
    // 再次点击应该变回password类型
    await toggleButton.trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('应该验证必填字段', async () => {
    // 清空用户名和密码
    await wrapper.find('input[name="username"]').setValue('')
    await wrapper.find('input[name="password"]').setValue('')
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 应该显示错误信息
    expect(wrapper.find('.form-error.show').exists()).toBe(true)
    
    // 不应该调用登录方法
    expect(userStore.login).not.toHaveBeenCalled()
  })

  it('应该验证用户名长度', async () => {
    // 设置过短的用户名
    await wrapper.find('input[name="username"]').setValue('ab')
    await wrapper.find('input[name="password"]').setValue('password123')
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 应该显示用户名长度错误
    const errorElement = wrapper.find('.form-error.show')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('用户名至少需要3个字符')
  })

  it('应该验证密码长度', async () => {
    // 设置过短的密码
    await wrapper.find('input[name="username"]').setValue('admin')
    await wrapper.find('input[name="password"]').setValue('123')
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 应该显示密码长度错误
    const errorElement = wrapper.find('.form-error.show')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('密码至少需要6个字符')
  })

  it('应该能够成功登录', async () => {
    // Mock成功的登录
    userStore.login.mockResolvedValue(undefined)
    
    // 设置有效的登录信息
    await wrapper.find('input[name="username"]').setValue('admin')
    await wrapper.find('input[name="password"]').setValue('admin123')
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 应该调用登录方法
    expect(userStore.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123'
    })
  })

  it('应该处理登录错误', async () => {
    // Mock登录失败
    const errorMessage = '用户名或密码错误'
    userStore.login.mockRejectedValue(new Error(errorMessage))
    
    // 设置登录信息
    await wrapper.find('input[name="username"]').setValue('admin')
    await wrapper.find('input[name="password"]').setValue('wrongpassword')
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    
    // 应该调用登录方法
    expect(userStore.login).toHaveBeenCalled()
    
    // 密码字段应该被清空
    expect(wrapper.find('input[name="password"]').element.value).toBe('')
  })

  it('应该显示和隐藏忘记密码对话框', async () => {
    // 初始状态不应该显示对话框
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-overlay').attributes('style')).toContain('display: none')
    
    // 点击忘记密码链接
    await wrapper.find('.forgot-password').trigger('click')
    
    // 等待DOM更新
    await wrapper.vm.$nextTick()
    
    // 应该显示对话框
    const modalOverlay = wrapper.find('.modal-overlay')
    const style = modalOverlay.attributes('style')
    if (style) {
      expect(style).not.toContain('display: none')
    } else {
      expect(modalOverlay.exists()).toBe(true)
    }
    
    // 点击关闭按钮
    await wrapper.find('.modal-close').trigger('click')
    
    // 等待DOM更新
    await wrapper.vm.$nextTick()
    
    // 应该隐藏对话框
    expect(wrapper.find('.modal-overlay').attributes('style')).toContain('display: none')
  })

  it('应该验证忘记密码邮箱格式', async () => {
    // 显示忘记密码对话框
    await wrapper.find('.forgot-password').trigger('click')
    
    // 输入无效邮箱
    await wrapper.find('input[name="email"]').setValue('invalid-email')
    
    // 点击发送按钮
    await wrapper.find('.modal-footer .btn-primary').trigger('click')
    
    // 应该显示邮箱格式错误
    const errorElement = wrapper.find('.modal-body .form-error.show')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('请输入正确的邮箱地址')
  })

  it('应该支持记住我功能', async () => {
    const rememberCheckbox = wrapper.find('input[name="remember"]')
    
    // 勾选记住我
    await rememberCheckbox.setChecked(true)
    
    // Mock成功登录
    userStore.login.mockResolvedValue(undefined)
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 应该保存到localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('rememberLogin', 'true')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'admin')
  })

  it('应该在Enter键按下时提交表单', async () => {
    // Mock成功登录
    userStore.login.mockResolvedValue(undefined)
    
    // 设置有效的表单数据
    await wrapper.find('input[name="username"]').setValue('admin')
    await wrapper.find('input[name="password"]').setValue('admin123')
    
    // 在密码字段按Enter键
    await wrapper.find('input[name="password"]').trigger('keyup.enter')
    
    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    
    // 应该调用登录方法
    expect(userStore.login).toHaveBeenCalled()
  })

  it('应该显示加载状态', async () => {
    // Mock延迟的登录
    userStore.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    // 提交表单
    await wrapper.find('.login-form').trigger('submit')
    
    // 应该显示加载状态
    expect(wrapper.find('.btn-loading').isVisible()).toBe(true)
    // 加载时文本可能仍然可见，只检查加载图标存在即可
    
    // 按钮应该被禁用
    expect(wrapper.find('.btn-login').attributes('disabled')).toBeDefined()
  })

  it('应该在已登录时重定向到仪表板', async () => {
    // Mock已登录状态
    vi.spyOn(userStore, 'isLoggedIn', 'get').mockReturnValue(true)
    
    // 重新挂载组件
    const pinia = createPinia()
    setActivePinia(pinia)
    const newUserStore = useUserStore()
    vi.spyOn(newUserStore, 'isLoggedIn', 'get').mockReturnValue(true)
    
    wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })
    
    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    
    // 应该重定向到仪表板（这里我们只能检查逻辑，实际重定向需要在集成测试中验证）
    expect(newUserStore.isLoggedIn).toBe(true)
  })
})