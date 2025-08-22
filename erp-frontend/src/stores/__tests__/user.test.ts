/**
 * 用户状态管理测试
 * 测试用户登录、登出、权限检查等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { LoginRequest, LoginResponse } from '../user'
import type { User, Role, Permission, Store } from '@/types'

// Mock API - 必须在导入之前定义
vi.mock('@/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn()
  }
}))

// 导入需要测试的模块
import { useUserStore } from '../user'
import api from '@/api'

// 获取 mock API 实例
const mockApi = api as any

describe('用户状态管理', () => {
  let userStore: ReturnType<typeof useUserStore>

  // 测试数据
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    nickname: '测试用户',
    avatar: 'https://example.com/avatar.jpg',
    roles: [
      {
        id: 1,
        name: '管理员',
        code: 'admin',
        description: '系统管理员',
        permissions: [
          {
            id: 1,
            name: '用户查看',
            code: 'user:view',
            resource: 'user',
            action: 'view',
            description: '查看用户信息'
          },
          {
            id: 2,
            name: '用户编辑',
            code: 'user:edit',
            resource: 'user',
            action: 'edit',
            description: '编辑用户信息'
          }
        ],
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    permissions: ['user:view', 'user:edit', 'product:view'],
    status: 'ACTIVE',
    lastLoginTime: '2024-01-01T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockLoginResponse: LoginResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    userInfo: mockUser
  }

  beforeEach(() => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 创建用户存储实例
    userStore = useUserStore()
    
    // 重置 mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 清理
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(userStore.token).toBe('')
      expect(userStore.refreshToken).toBe('')
      expect(userStore.user).toBe(null)
      expect(userStore.stores).toEqual([])
      expect(userStore.currentStoreId).toBe(null)
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('应该有正确的计算属性', () => {
      expect(userStore.currentStore).toBe(undefined)
      expect(userStore.userPermissions).toEqual([])
      expect(userStore.userRoles).toEqual([])
    })
  })

  describe('登录功能', () => {
    it('应该能够成功登录', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      }

      mockApi.post.mockResolvedValue({
        data: mockLoginResponse
      })

      await userStore.login(loginData)

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', loginData, { skipAuth: true })
      expect(userStore.token).toBe('mock-access-token')
      expect(userStore.refreshToken).toBe('mock-refresh-token')
      expect(userStore.user).toEqual(mockUser)
      expect(userStore.isLoggedIn).toBe(true)
    })

    it('应该处理登录失败', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword'
      }

      const loginError = new Error('登录失败')
      mockApi.post.mockRejectedValue(loginError)

      await expect(userStore.login(loginData)).rejects.toThrow()
      
      expect(userStore.token).toBe('')
      expect(userStore.user).toBe(null)
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('应该在登录时设置加载状态', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      }

      // 模拟延迟响应
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockApi.post.mockReturnValue(delayedPromise)

      const loginPromise = userStore.login(loginData)
      
      // 检查加载状态
      expect(userStore.isLoading).toBe(true)
      
      // 解决 Promise
      resolvePromise!({ data: mockLoginResponse })
      await loginPromise
      
      expect(userStore.isLoading).toBe(false)
    })
  })

  describe('登出功能', () => {
    beforeEach(async () => {
      // 先登录
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      await userStore.login({ username: 'testuser', password: 'password123' })
      vi.clearAllMocks()
    })

    it('应该能够成功登出', async () => {
      mockApi.post.mockResolvedValue({})

      await userStore.logout()

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout', {}, { skipErrorHandler: true })
      expect(userStore.token).toBe('')
      expect(userStore.refreshToken).toBe('')
      expect(userStore.user).toBe(null)
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('应该在登出API失败时仍然清除本地状态', async () => {
      mockApi.post.mockRejectedValue(new Error('网络错误'))

      await userStore.logout()

      expect(userStore.token).toBe('')
      expect(userStore.user).toBe(null)
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('Token 刷新功能', () => {
    beforeEach(async () => {
      // 先登录
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      await userStore.login({ username: 'testuser', password: 'password123' })
      vi.clearAllMocks()
    })

    it('应该能够刷新访问令牌', async () => {
      const newToken = 'new-access-token'
      mockApi.post.mockResolvedValue({
        data: { token: newToken }
      })

      const result = await userStore.refreshAccessToken()

      expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'mock-refresh-token'
      })
      expect(result).toBe(newToken)
      expect(userStore.token).toBe(newToken)
    })

    it('应该在刷新失败时清除登录状态', async () => {
      mockApi.post.mockRejectedValue(new Error('刷新失败'))

      await expect(userStore.refreshAccessToken()).rejects.toThrow()

      expect(userStore.token).toBe('')
      expect(userStore.user).toBe(null)
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('用户信息管理', () => {
    beforeEach(async () => {
      // 先登录
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      await userStore.login({ username: 'testuser', password: 'password123' })
      vi.clearAllMocks()
    })

    it('应该能够获取用户信息', async () => {
      const updatedUser = { ...mockUser, nickname: '更新的昵称' }
      mockApi.get.mockResolvedValue({ data: updatedUser })

      await userStore.fetchUserInfo()

      expect(mockApi.get).toHaveBeenCalledWith('/users/profile')
      expect(userStore.user?.nickname).toBe('更新的昵称')
    })

    it('应该能够更新用户信息', async () => {
      const updateData = { nickname: '新昵称', email: 'new@example.com' }
      const updatedUser = { ...mockUser, ...updateData }
      mockApi.put.mockResolvedValue({ data: updatedUser })

      await userStore.updateUserInfo(updateData)

      expect(mockApi.put).toHaveBeenCalledWith('/users/profile', updateData)
      expect(userStore.user?.nickname).toBe('新昵称')
      expect(userStore.user?.email).toBe('new@example.com')
    })

    it('应该能够修改密码', async () => {
      mockApi.post.mockResolvedValue({})

      await userStore.changePassword('oldpass', 'newpass')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
        oldPassword: 'oldpass',
        newPassword: 'newpass'
      })
    })

    it('应该能够获取用户店铺信息', async () => {
      const mockStores: Store[] = [
        {
          id: 1,
          storeName: '测试店铺1',
          platform: 'walmart',
          platformStoreId: 'store1',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      
      mockApi.get.mockResolvedValue({ data: mockStores })

      await userStore.fetchUserStores()

      expect(mockApi.get).toHaveBeenCalledWith('/users/stores')
      expect(userStore.stores).toEqual(mockStores)
      expect(userStore.currentStoreId).toBe(1) // 应该自动选择第一个店铺
    })
  })

  describe('权限检查功能', () => {
    beforeEach(async () => {
      // 先登录
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      await userStore.login({ username: 'testuser', password: 'password123' })
      vi.clearAllMocks()
    })

    it('应该正确检查单个权限', () => {
      expect(userStore.hasPermission('user:view')).toBe(true)
      expect(userStore.hasPermission('user:edit')).toBe(true)
      expect(userStore.hasPermission('user:delete')).toBe(false)
    })

    it('应该正确检查角色', () => {
      expect(userStore.hasRole('admin')).toBe(true)
      expect(userStore.hasRole('user')).toBe(false)
    })

    it('应该正确检查多个权限（AND关系）', () => {
      expect(userStore.hasAllPermissions(['user:view', 'user:edit'])).toBe(true)
      expect(userStore.hasAllPermissions(['user:view', 'user:delete'])).toBe(false)
    })

    it('应该正确检查多个权限（OR关系）', () => {
      expect(userStore.hasAnyPermission(['user:view', 'user:delete'])).toBe(true)
      expect(userStore.hasAnyPermission(['user:delete', 'admin:delete'])).toBe(false)
    })

    it('应该在未登录时返回false', () => {
      // 登出
      userStore.token = ''
      userStore.user = null

      expect(userStore.hasPermission('user:view')).toBe(false)
      expect(userStore.hasRole('admin')).toBe(false)
    })
  })

  describe('店铺管理功能', () => {
    beforeEach(async () => {
      // 先登录
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      await userStore.login({ username: 'testuser', password: 'password123' })
      
      // 设置测试店铺数据
      userStore.stores = [
        {
          id: 1,
          storeName: '测试店铺1',
          platform: 'walmart',
          platformStoreId: 'store1',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          storeName: '测试店铺2',
          platform: 'amazon',
          platformStoreId: 'store2',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      
      // 清除当前店铺ID以测试初始状态
      userStore.currentStoreId = null
      
      vi.clearAllMocks()
    })

    it('应该能够切换店铺', () => {
      userStore.switchStore(1)
      expect(userStore.currentStoreId).toBe(1)
      expect(userStore.currentStore?.storeName).toBe('测试店铺1')

      userStore.switchStore(2)
      expect(userStore.currentStoreId).toBe(2)
      expect(userStore.currentStore?.storeName).toBe('测试店铺2')
    })

    it('应该忽略无效的店铺ID', () => {
      userStore.switchStore(1)
      expect(userStore.currentStoreId).toBe(1)

      userStore.switchStore(999) // 不存在的店铺ID
      expect(userStore.currentStoreId).toBe(1) // 应该保持不变
    })

    it('应该正确计算当前店铺', () => {
      expect(userStore.currentStore).toBe(undefined)

      userStore.switchStore(1)
      expect(userStore.currentStore?.id).toBe(1)
      expect(userStore.currentStore?.storeName).toBe('测试店铺1')
    })
  })

  describe('计算属性', () => {
    it('应该正确计算登录状态', () => {
      expect(userStore.isLoggedIn).toBe(false)

      userStore.token = 'test-token'
      expect(userStore.isLoggedIn).toBe(false) // 还需要用户信息

      userStore.user = mockUser
      expect(userStore.isLoggedIn).toBe(true)

      userStore.token = ''
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('应该正确计算用户权限', () => {
      expect(userStore.userPermissions).toEqual([])

      userStore.user = mockUser
      expect(userStore.userPermissions).toEqual(['user:view', 'user:edit', 'product:view'])
    })

    it('应该正确计算用户角色', () => {
      expect(userStore.userRoles).toEqual([])

      userStore.user = mockUser
      expect(userStore.userRoles).toEqual(mockUser.roles)
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const networkError = new Error('网络连接失败')
      mockApi.post.mockRejectedValue(networkError)

      await expect(userStore.login({
        username: 'test',
        password: 'test'
      })).rejects.toThrow('网络连接失败')

      expect(userStore.hasError).toBe(true)
    })

    it('应该处理API错误响应', async () => {
      const apiError = new Error('用户名或密码错误')
      mockApi.post.mockRejectedValue(apiError)

      await expect(userStore.login({
        username: 'test',
        password: 'wrong'
      })).rejects.toThrow('用户名或密码错误')
    })

    it('应该能够清除错误状态', async () => {
      // 先产生错误
      mockApi.post.mockRejectedValue(new Error('测试错误'))
      await expect(userStore.login({
        username: 'test',
        password: 'test'
      })).rejects.toThrow()

      expect(userStore.hasError).toBe(true)

      // 清除错误
      userStore.clearError()
      expect(userStore.hasError).toBe(false)
    })
  })

  describe('状态持久化', () => {
    it('应该持久化关键状态', () => {
      // 验证持久化的关键状态字段
      expect(userStore.token).toBeDefined()
      expect(userStore.refreshToken).toBeDefined()
      expect(userStore.user).toBeDefined()
      expect(userStore.stores).toBeDefined()
      expect(userStore.currentStoreId).toBeDefined()
    })
  })

  describe('状态重置', () => {
    beforeEach(async () => {
      // 先登录并设置一些状态
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      await userStore.login({ username: 'testuser', password: 'password123' })
      userStore.switchStore(1)
    })

    it('应该能够重置状态', () => {
      expect(userStore.isLoggedIn).toBe(true)
      expect(userStore.currentStoreId).toBe(1)

      userStore.resetState()

      expect(userStore.token).toBe('')
      expect(userStore.refreshToken).toBe('')
      expect(userStore.user).toBe(null)
      expect(userStore.stores).toEqual([])
      expect(userStore.currentStoreId).toBe(null)
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('状态验证', () => {
    it('应该验证状态的有效性', () => {
      // 设置有效状态
      userStore.token = 'valid-token'
      userStore.user = mockUser

      expect(userStore.validateState()).toBe(true)
    })
  })

  describe('用户信息缓存', () => {
    beforeEach(() => {
      // 清除 localStorage
      localStorage.clear()
    })

    it('应该能够缓存用户信息', () => {
      userStore.user = mockUser
      userStore.cacheUserInfo()

      const cached = localStorage.getItem('erp-user-cache')
      expect(cached).toBeTruthy()
      
      const cacheData = JSON.parse(cached!)
      expect(cacheData.user).toEqual(mockUser)
      expect(cacheData.timestamp).toBeTypeOf('number')
    })

    it('应该能够加载有效的用户信息缓存', () => {
      // 设置有效缓存
      const cacheData = {
        user: mockUser,
        timestamp: Date.now() - 1000 // 1秒前
      }
      localStorage.setItem('erp-user-cache', JSON.stringify(cacheData))

      const loaded = userStore.loadUserInfoCache()
      
      expect(loaded).toBe(true)
      expect(userStore.user).toEqual(mockUser)
    })

    it('应该忽略过期的用户信息缓存', () => {
      // 设置过期缓存（2小时前）
      const cacheData = {
        user: mockUser,
        timestamp: Date.now() - 7200000
      }
      localStorage.setItem('erp-user-cache', JSON.stringify(cacheData))

      const loaded = userStore.loadUserInfoCache()
      
      expect(loaded).toBe(false)
      expect(userStore.user).toBe(null)
    })

    it('应该能够清除用户信息缓存', () => {
      // 先设置缓存
      userStore.user = mockUser
      userStore.cacheUserInfo()
      expect(localStorage.getItem('erp-user-cache')).toBeTruthy()

      // 清除缓存
      userStore.clearUserInfoCache()
      expect(localStorage.getItem('erp-user-cache')).toBe(null)
    })

    it('应该在登录时自动缓存用户信息', async () => {
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      mockApi.get.mockResolvedValue({ data: [] }) // 空店铺列表

      await userStore.login({ username: 'testuser', password: 'password123' })

      const cached = localStorage.getItem('erp-user-cache')
      expect(cached).toBeTruthy()
      
      const cacheData = JSON.parse(cached!)
      expect(cacheData.user).toEqual(mockUser)
    })

    it('应该在登出时清除用户信息缓存', async () => {
      // 先登录并设置缓存
      mockApi.post.mockResolvedValue({ data: mockLoginResponse })
      mockApi.get.mockResolvedValue({ data: [] })
      await userStore.login({ username: 'testuser', password: 'password123' })
      expect(localStorage.getItem('erp-user-cache')).toBeTruthy()

      // 登出
      mockApi.post.mockResolvedValue({})
      await userStore.logout()

      expect(localStorage.getItem('erp-user-cache')).toBe(null)
    })
  })
})