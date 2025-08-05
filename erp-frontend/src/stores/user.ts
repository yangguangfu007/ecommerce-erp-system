import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

// 用户信息接口
export interface User {
  id: number
  username: string
  email: string
  nickname: string
  avatar?: string
  roles: Role[]
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE'
  lastLoginTime?: string
}

// 角色接口
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: Permission[]
}

// 权限接口
export interface Permission {
  id: number
  name: string
  code: string
  resource: string
  action: string
}

// 店铺信息接口
export interface Store {
  id: number
  storeName: string
  platform: string
  platformStoreId: string
  status: 'ACTIVE' | 'INACTIVE'
}

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
    try {
      const response = await api.post<LoginResponse>('/auth/login', loginData)
      const { accessToken, refreshToken: refresh, userInfo } = response.data

      token.value = accessToken
      refreshToken.value = refresh
      user.value = userInfo
      
      // TODO: 后续从用户信息API获取店铺信息
      stores.value = []
      currentStoreId.value = null
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout', { refreshToken: refreshToken.value })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 清除本地状态
      token.value = ''
      refreshToken.value = ''
      user.value = null
      stores.value = []
      currentStoreId.value = null
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
    try {
      const response = await api.get<User>('/auth/me')
      user.value = response.data
    } catch (error) {
      throw error
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
    return userPermissions.value.includes(permission)
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
    try {
      const response = await api.put<User>('/users/profile', userData)
      user.value = response.data
    } catch (error) {
      throw error
    }
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      })
    } catch (error) {
      throw error
    }
  }

  return {
    // 状态
    token,
    refreshToken,
    user,
    stores,
    currentStoreId,
    
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
    switchStore,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    updateUserInfo,
    changePassword
  }
}, {
  persist: {
    key: 'erp-user'
  }
})