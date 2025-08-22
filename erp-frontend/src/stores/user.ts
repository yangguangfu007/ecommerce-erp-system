import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { userApi } from '@/api/modules/user'
import { useBaseStore, createStateDebugger } from './base'
import { createStoreOptions, storeManager } from './config'
import type { UserState } from './types'
import type { User, Role, Permission, Store } from '@/types'

// 登录请求接口
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
}

// 登录响应接口
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userInfo: User
}

export const useUserStore = defineStore('user', () => {
  // 创建调试器
  const stateDebugger = createStateDebugger('user', {
    logActions: true,
    logMutations: true,
    maxLogEntries: 50
  })

  // 初始状态
  const initialState: UserState = {
    loading: false,
    error: null,
    lastUpdated: null,
    token: '',
    refreshToken: '',
    user: null,
    stores: [],
    currentStoreId: null
  }

  // 使用基础存储功能
  const baseStore = useBaseStore(initialState)

  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<User | null>(null)
  const stores = ref<Store[]>([])
  const currentStoreId = ref<number | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const currentStore = computed(() => 
    stores.value.find(store => store.id === currentStoreId.value)
  )
  const userPermissions = computed(() => user.value?.permissions || [])
  const userRoles = computed(() => user.value?.roles || [])

  // 登录
  const login = async (loginData: LoginRequest): Promise<void> => {
    stateDebugger.logAction('login', { username: loginData.username })
    
    baseStore.setLoading(true)
    baseStore.clearError()
    
    try {
      // 使用用户API进行登录
      const response = await userApi.login(loginData)
      const { accessToken, refreshToken: refresh, userInfo } = response.data

      token.value = accessToken
      refreshToken.value = refresh
      user.value = userInfo
      
      // 调试信息
      console.log('登录成功，用户信息:', userInfo)
      console.log('用户权限:', userInfo.permissions)
      
      // 缓存用户信息
      cacheUserInfo()
      
      // 获取用户店铺信息
      try {
        await fetchUserStores()
      } catch (error) {
        console.warn('Failed to fetch user stores:', error)
        stores.value = []
        currentStoreId.value = null
      }
      
      baseStore.updateTimestamp()
    } catch (error: any) {
      baseStore.setError(error?.message || '登录失败')
      throw error
    } finally {
      baseStore.setLoading(false)
    }
  }

  // 登出
  const logout = async (): Promise<void> => {
    stateDebugger.logAction('logout')
    
    try {
      // 只有在有token的情况下才调用后端登出接口
      if (token.value) {
        await userApi.logout()
      }
    } catch (error: any) {
      console.error('Logout error:', error)
      // 如果是401错误，说明token已经无效，这是正常情况
      if (error?.response?.status !== 401) {
        console.warn('登出时发生非认证错误:', error.message)
      }
    } finally {
      // 无论后端调用是否成功，都要清除本地状态
      token.value = ''
      refreshToken.value = ''
      user.value = null
      stores.value = []
      currentStoreId.value = null
      
      // 清除缓存
      clearUserInfoCache()
      
      baseStore.updateTimestamp()
    }
  }

  // 刷新token
  const refreshAccessToken = async (): Promise<string> => {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh', {
        refreshToken: refreshToken.value
      })
      token.value = response.data.token
      return response.data.token
    } catch (error) {
      // 刷新失败，清除登录状态
      await logout()
      throw error
    }
  }

  // 获取用户信息
  const fetchUserInfo = async (): Promise<void> => {
    stateDebugger.logAction('fetchUserInfo')
    
    baseStore.setLoading(true)
    baseStore.clearError()
    
    try {
      const response = await userApi.getCurrentUser()
      user.value = response.data
      baseStore.updateTimestamp()
    } catch (error: any) {
      baseStore.setError(error?.message || '获取用户信息失败')
      throw error
    } finally {
      baseStore.setLoading(false)
    }
  }

  // 获取用户店铺信息
  const fetchUserStores = async (): Promise<void> => {
    stateDebugger.logAction('fetchUserStores')
    
    baseStore.setLoading(true)
    baseStore.clearError()
    
    try {
      const response = await api.get<Store[]>('/users/stores')
      stores.value = response.data
      
      // 如果当前没有选中店铺且有可用店铺，选择第一个
      if (!currentStoreId.value && stores.value.length > 0) {
        currentStoreId.value = stores.value[0].id
      }
      
      baseStore.updateTimestamp()
    } catch (error: any) {
      baseStore.setError(error?.message || '获取店铺信息失败')
      throw error
    } finally {
      baseStore.setLoading(false)
    }
  }

  // 切换店铺
  const switchStore = (storeId: number): void => {
    const store = stores.value.find(s => s.id === storeId)
    if (store) {
      currentStoreId.value = storeId
    }
  }

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    const hasIt = userPermissions.value.includes(permission)
    console.log(`检查权限 ${permission}:`, hasIt, '用户权限列表:', userPermissions.value)
    return hasIt
  }

  // 检查角色
  const hasRole = (roleCode: string): boolean => {
    return userRoles.value.some(role => role.code === roleCode)
  }

  // 检查多个权限（AND关系）
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  // 检查多个权限（OR关系）
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  // 更新用户信息
  const updateUserInfo = async (userData: Partial<User>): Promise<void> => {
    stateDebugger.logAction('updateUserInfo', userData)
    
    baseStore.setLoading(true)
    baseStore.clearError()
    
    try {
      const response = await api.put<User>('/users/profile', userData)
      user.value = response.data
      baseStore.updateTimestamp()
    } catch (error: unknown) {
      baseStore.setError(error?.message || '更新用户信息失败')
      throw error
    } finally {
      baseStore.setLoading(false)
    }
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    stateDebugger.logAction('changePassword')
    
    baseStore.setLoading(true)
    baseStore.clearError()
    
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      })
      baseStore.updateTimestamp()
    } catch (error: unknown) {
      baseStore.setError(error?.message || '修改密码失败')
      throw error
    } finally {
      baseStore.setLoading(false)
    }
  }

  // 缓存用户信息到本地存储
  const cacheUserInfo = () => {
    if (user.value) {
      const cacheData = {
        user: user.value,
        timestamp: Date.now()
      }
      localStorage.setItem('erp-user-cache', JSON.stringify(cacheData))
    }
  }

  // 从本地存储加载用户信息缓存
  const loadUserInfoCache = (): boolean => {
    try {
      const cached = localStorage.getItem('erp-user-cache')
      if (cached) {
        const cacheData = JSON.parse(cached)
        const now = Date.now()
        const cacheAge = now - cacheData.timestamp
        
        // 缓存有效期为1小时
        if (cacheAge < 3600000) {
          user.value = cacheData.user
          return true
        }
      }
    } catch (error) {
      console.error('Failed to load user info cache:', error)
    }
    return false
  }

  // 清除用户信息缓存
  const clearUserInfoCache = () => {
    localStorage.removeItem('erp-user-cache')
  }

  // 重置状态
  const resetState = () => {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    stores.value = []
    currentStoreId.value = null
    baseStore.clearError()
    baseStore.updateTimestamp()
  }

  // 验证状态
  const validateState = (): boolean => {
    return !!token.value && !!user.value
  }

  // 注册到存储管理器
  const store = {
    // 状态
    token,
    refreshToken,
    user,
    stores,
    currentStoreId,
    
    // 基础状态
    ...baseStore,
    
    // 计算属性
    isLoggedIn,
    currentStore,
    userPermissions,
    userRoles,
    
    // 方法
    login,
    logout,
    refreshAccessToken,
    fetchUserInfo,
    fetchUserStores,
    switchStore,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    updateUserInfo,
    changePassword,
    cacheUserInfo,
    loadUserInfoCache,
    clearUserInfoCache,
    resetState,
    validateState
  }

  storeManager.registerStore('user', store)
  
  return store
}, createStoreOptions('user', {
  persist: {
    key: 'erp-user',
    paths: ['token', 'refreshToken', 'user', 'stores', 'currentStoreId']
  }
}))