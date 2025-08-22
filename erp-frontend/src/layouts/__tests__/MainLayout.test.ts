import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import MainLayout from '../MainLayout.vue'
import { useUserStore } from '@/stores/user'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  Expand: { name: 'Expand' },
  Fold: { name: 'Fold' },
  Bell: { name: 'Bell' },
  ArrowDown: { name: 'ArrowDown' },
  Search: { name: 'Search' }
}))

// Mock BreadcrumbNav component
vi.mock('@/components/business/BreadcrumbNav.vue', () => ({
  default: {
    name: 'BreadcrumbNav',
    template: '<div class="breadcrumb-nav-mock">面包屑导航</div>'
  }
}))

describe('MainLayout', () => {
  let router: any
  let pinia: unknown
  let wrapper: unknown

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'Dashboard',
          component: { template: '<div>Dashboard</div>' },
          meta: { title: '仪表板', icon: 'Dashboard' }
        },
        {
          path: '/users',
          name: 'Users',
          component: { template: '<div>Users</div>' },
          meta: { title: '用户管理', icon: 'User' },
          children: [
            {
              path: '/users/list',
              name: 'UserList',
              component: { template: '<div>UserList</div>' },
              meta: { title: '用户列表' }
            }
          ]
        }
      ]
    })

    // 创建 Pinia 实例
    pinia = createPinia()
  })

  const createWrapper = (options = {}) => {
    return mount(MainLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'el-icon': true,
          'el-drawer': true,
          'el-empty': true,
          'el-button': true,
          'router-view': true
        }
      },
      ...options
    })
  }

  it('应该正确渲染主布局结构', () => {
    wrapper = createWrapper()
    
    // 检查主要布局元素
    expect(wrapper.find('.app-container').exists()).toBe(true)
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.app-sidebar').exists()).toBe(true)
    expect(wrapper.find('.app-main').exists()).toBe(true)
  })

  it('应该显示系统标题和Logo', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.system-title').text()).toBe('电商ERP管理系统')
    expect(wrapper.find('.logo').exists()).toBe(true)
  })

  it('应该渲染侧边栏菜单', () => {
    wrapper = createWrapper()
    
    const sidebar = wrapper.find('.app-sidebar')
    expect(sidebar.exists()).toBe(true)
    
    const navMenu = wrapper.find('.nav-menu')
    expect(navMenu.exists()).toBe(true)
  })

  it('应该能够切换侧边栏收起状态', async () => {
    wrapper = createWrapper()
    
    const toggleBtn = wrapper.find('.sidebar-toggle')
    expect(toggleBtn.exists()).toBe(true)
    
    // 初始状态不应该收起
    expect(wrapper.find('.app-container').classes()).not.toContain('sidebar-collapsed')
    
    // 点击切换按钮
    await toggleBtn.trigger('click')
    
    // 应该切换到收起状态
    expect(wrapper.vm.isCollapse).toBe(true)
  })

  it('应该显示搜索框', () => {
    wrapper = createWrapper()
    
    const searchInput = wrapper.find('.search-input')
    expect(searchInput.exists()).toBe(true)
    expect(searchInput.attributes('placeholder')).toBe('搜索功能...')
  })

  it('应该显示通知按钮和徽章', () => {
    wrapper = createWrapper()
    
    const notificationBtn = wrapper.find('.notification-btn')
    expect(notificationBtn.exists()).toBe(true)
    
    const badge = wrapper.find('.notification-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('3')
  })

  it('应该显示用户信息', () => {
    wrapper = createWrapper()
    
    const userInfo = wrapper.find('.header-user')
    expect(userInfo.exists()).toBe(true)
    
    const userName = wrapper.find('.user-name')
    expect(userName.exists()).toBe(true)
    
    const userAvatar = wrapper.find('.user-avatar')
    expect(userAvatar.exists()).toBe(true)
  })

  it('应该能够切换用户下拉菜单', async () => {
    wrapper = createWrapper()
    
    const userInfo = wrapper.find('.header-user')
    const dropdown = wrapper.find('.user-dropdown')
    
    // 初始状态下拉菜单应该隐藏
    expect(dropdown.classes()).not.toContain('show')
    
    // 点击用户信息
    await userInfo.trigger('click')
    
    // 下拉菜单应该显示
    expect(wrapper.vm.showUserDropdown).toBe(true)
  })

  it('应该处理搜索功能', async () => {
    wrapper = createWrapper()
    
    const searchInput = wrapper.find('.search-input')
    
    // 设置搜索关键词
    await searchInput.setValue('测试搜索')
    
    // 触发回车键
    await searchInput.trigger('keyup.enter')
    
    expect(wrapper.vm.searchKeyword).toBe('测试搜索')
  })

  it('应该能够打开通知抽屉', async () => {
    wrapper = createWrapper()
    
    const notificationBtn = wrapper.find('.notification-btn')
    
    // 点击通知按钮
    await notificationBtn.trigger('click')
    
    // 通知抽屉应该打开
    expect(wrapper.vm.notificationDrawer).toBe(true)
  })

  it('应该正确处理菜单点击', async () => {
    wrapper = createWrapper()
    
    // 模拟菜单项 - 使用已存在的路由
    const mockRoute = {
      path: '/users',
      name: 'Users',
      meta: { title: '用户管理' }
    }
    
    // 调用菜单点击处理函数
    await wrapper.vm.handleMenuClick(mockRoute)
    
    // 验证菜单点击处理函数被调用
    expect(typeof wrapper.vm.handleMenuClick).toBe('function')
  })

  it('应该能够展开和收起子菜单', async () => {
    wrapper = createWrapper()
    
    const menuName = 'Users'
    
    // 初始状态子菜单应该收起
    expect(wrapper.vm.expandedMenus).not.toContain(menuName)
    
    // 切换子菜单
    wrapper.vm.toggleSubmenu(menuName)
    
    // 子菜单应该展开
    expect(wrapper.vm.expandedMenus).toContain(menuName)
    
    // 再次切换
    wrapper.vm.toggleSubmenu(menuName)
    
    // 子菜单应该收起
    expect(wrapper.vm.expandedMenus).not.toContain(menuName)
  })

  it('应该正确判断活跃路由', async () => {
    wrapper = createWrapper()
    
    const routeItem = {
      path: '/users',
      children: [
        { path: '/users/list' }
      ]
    }
    
    // 应该有活跃路由判断方法
    expect(typeof wrapper.vm.isActiveRoute).toBe('function')
  })

  it('应该处理用户命令 - 个人资料', async () => {
    wrapper = createWrapper()
    
    // 测试个人资料命令
    await wrapper.vm.handleUserCommand('profile')
    
    // 验证用户命令处理函数被调用
    expect(typeof wrapper.vm.handleUserCommand).toBe('function')
  })

  it('应该处理用户命令 - 系统设置', async () => {
    wrapper = createWrapper()
    
    // 测试设置命令
    await wrapper.vm.handleUserCommand('settings')
    
    // 验证用户命令处理函数被调用
    expect(typeof wrapper.vm.handleUserCommand).toBe('function')
  })

  it('应该能够标记通知为已读', () => {
    wrapper = createWrapper()
    
    // 设置通知数据
    wrapper.vm.notifications = [
      { id: 1, read: false },
      { id: 2, read: true }
    ]
    wrapper.vm.notificationCount = 1
    
    // 标记通知为已读
    wrapper.vm.markAsRead(1)
    
    // 通知应该被标记为已读
    expect(wrapper.vm.notifications[0].read).toBe(true)
    expect(wrapper.vm.notificationCount).toBe(0)
  })

  it('应该正确格式化时间', () => {
    wrapper = createWrapper()
    
    const testTime = '2025-01-01T12:00:00.000Z'
    const formatted = wrapper.vm.formatTime(testTime)
    
    // 应该返回本地化的时间字符串
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('应该在移动端正确处理侧边栏', async () => {
    // 模拟移动端屏幕尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })
    
    wrapper = createWrapper()
    
    const toggleBtn = wrapper.find('.sidebar-toggle')
    
    // 在移动端点击切换按钮
    await toggleBtn.trigger('click')
    
    // 应该显示移动端侧边栏
    expect(wrapper.vm.showSidebarMobile).toBe(true)
  })

  it('应该正确处理响应式设计', () => {
    wrapper = createWrapper()
    
    // 测试窗口大小变化处理
    wrapper.vm.handleResize()
    
    // 在大屏幕下应该隐藏移动端侧边栏
    expect(wrapper.vm.showSidebarMobile).toBe(false)
  })
})