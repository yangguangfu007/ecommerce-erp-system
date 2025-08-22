import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userApi } from '../user'
import api from '@/api'
import type { 
  User, 
  Role, 
  Permission, 
  UserQuery, 
  CreateUserForm, 
  UpdateUserForm, 
  LoginForm,
  ChangePasswordForm,
  BatchUserOperation,
  UserStats,
  PageResponse,
  ApiResponse
} from '@/types'

// Mock API service
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}))

// Mock data
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
      code: 'ADMIN',
      description: '系统管理员',
      permissions: [],
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  permissions: ['user:view', 'user:create', 'user:update', 'user:delete'],
  status: 'ACTIVE',
  lastLoginTime: '2024-01-01T12:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockRole: Role = {
  id: 1,
  name: '管理员',
  code: 'ADMIN',
  description: '系统管理员',
  permissions: [
    {
      id: 1,
      name: '用户查看',
      code: 'user:view',
      resource: 'user',
      action: 'view',
      description: '查看用户信息'
    }
  ],
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockPermission: Permission = {
  id: 1,
  name: '用户查看',
  code: 'user:view',
  resource: 'user',
  action: 'view',
  description: '查看用户信息'
}

const mockApiResponse = <T>(data: T): ApiResponse<T> => ({
  code: 200,
  message: '操作成功',
  data,
  success: true,
  timestamp: Date.now()
})

const mockPageResponse = <T>(list: T[], total: number = list.length): PageResponse<T> => ({
  list,
  total,
  page: 1,
  size: 10,
  pages: Math.ceil(total / 10)
})

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('认证相关API', () => {
    it('应该能够登录用户', async () => {
      const loginForm: LoginForm = {
        username: 'testuser',
        password: 'password123',
        captcha: 'abc123',
        rememberMe: true
      }

      const loginResponse = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
        permissions: ['user:view', 'user:create'],
        expiresIn: 3600
      }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(loginResponse))

      const result = await userApi.login(loginForm)

      expect(api.post).toHaveBeenCalledWith('/auth/login', loginForm, { skipAuth: true })
      expect(result.data).toEqual(loginResponse)
      expect(result.code).toBe(200)
    })

    it('应该能够登出用户', async () => {
      vi.mocked(api.post).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout', {}, { skipErrorHandler: true })
      expect(result.code).toBe(200)
    })

    it('应该能够刷新token', async () => {
      const refreshToken = 'mock-refresh-token'
      const loginResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        user: mockUser,
        permissions: ['user:view'],
        expiresIn: 3600
      }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(loginResponse))

      const result = await userApi.refreshToken(refreshToken)

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken }, { skipAuth: true })
      expect(result.data).toEqual(loginResponse)
    })
  })

  describe('当前用户相关API', () => {
    it('应该能够获取当前用户信息', async () => {
      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockUser))

      const result = await userApi.getCurrentUser()

      expect(api.get).toHaveBeenCalledWith('/users/profile')
      expect(result.data).toEqual(mockUser)
    })

    it('应该能够更新当前用户信息', async () => {
      const userInfo = { nickname: '新昵称', email: 'new@example.com' }
      const updatedUser = { ...mockUser, ...userInfo }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(updatedUser))

      const result = await userApi.updateCurrentUser(userInfo)

      expect(api.put).toHaveBeenCalledWith('/users/profile', userInfo)
      expect(result.data).toEqual(updatedUser)
    })

    it('应该能够修改当前用户密码', async () => {
      const passwordForm = {
        oldPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.changeCurrentUserPassword(passwordForm)

      expect(api.put).toHaveBeenCalledWith('/users/profile/password', passwordForm)
      expect(result.code).toBe(200)
    })
  })

  describe('用户管理API', () => {
    it('应该能够获取用户列表', async () => {
      const query: UserQuery = {
        page: 1,
        size: 10,
        username: 'test',
        status: 'ACTIVE',
        keyword: '测试'
      }

      const userList = [mockUser]
      const pageResponse = mockPageResponse(userList, 1)

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(pageResponse))

      const result = await userApi.getUsers(query)

      expect(api.get).toHaveBeenCalledWith('/users', { params: query })
      expect(result.data).toEqual(pageResponse)
      expect(result.data.list).toHaveLength(1)
    })

    it('应该能够根据ID获取用户详情', async () => {
      const userId = 1

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockUser))

      const result = await userApi.getUserById(userId)

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result.data).toEqual(mockUser)
    })

    it('应该能够创建新用户', async () => {
      const userForm: CreateUserForm = {
        username: 'newuser',
        email: 'newuser@example.com',
        nickname: '新用户',
        password: 'password123',
        confirmPassword: 'password123',
        avatar: 'https://example.com/avatar.jpg',
        roleIds: [1],
        status: 'ACTIVE'
      }

      const newUser = { ...mockUser, id: 2, ...userForm }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(newUser))

      const result = await userApi.createUser(userForm)

      expect(api.post).toHaveBeenCalledWith('/users', userForm)
      expect(result.data).toEqual(newUser)
    })

    it('应该能够更新用户信息', async () => {
      const userForm: UpdateUserForm = {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com',
        nickname: '更新用户',
        roleIds: [1, 2],
        status: 'ACTIVE'
      }

      const updatedUser = { ...mockUser, ...userForm }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(updatedUser))

      const result = await userApi.updateUser(userForm)

      expect(api.put).toHaveBeenCalledWith(`/users/${userForm.id}`, {
        username: userForm.username,
        email: userForm.email,
        nickname: userForm.nickname,
        roleIds: userForm.roleIds,
        status: userForm.status
      })
      expect(result.data).toEqual(updatedUser)
    })

    it('应该能够删除用户', async () => {
      const userId = 1

      vi.mocked(api.delete).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.deleteUser(userId)

      expect(api.delete).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result.code).toBe(200)
    })

    it('应该能够修改用户密码（管理员操作）', async () => {
      const passwordForm: ChangePasswordForm = {
        id: 1,
        oldPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.changeUserPassword(passwordForm)

      expect(api.put).toHaveBeenCalledWith(`/users/${passwordForm.id}/password`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      })
      expect(result.code).toBe(200)
    })

    it('应该能够重置用户密码', async () => {
      const userId = 1
      const newPassword = 'resetpass123'

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.resetUserPassword(userId, newPassword)

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}/password/reset`, { newPassword })
      expect(result.code).toBe(200)
    })

    it('应该能够激活用户', async () => {
      const userId = 1

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.activateUser(userId)

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}/activate`)
      expect(result.code).toBe(200)
    })

    it('应该能够禁用用户', async () => {
      const userId = 1

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.deactivateUser(userId)

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}/deactivate`)
      expect(result.code).toBe(200)
    })
  })

  describe('用户搜索和统计API', () => {
    it('应该能够搜索用户', async () => {
      const keyword = '测试'
      const limit = 5
      const searchResults = [mockUser]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(searchResults))

      const result = await userApi.searchUsers(keyword, limit)

      expect(api.get).toHaveBeenCalledWith('/users/search', { 
        params: { keyword, limit } 
      })
      expect(result.data).toEqual(searchResults)
    })

    it('应该能够获取用户统计信息', async () => {
      const stats: UserStats = {
        totalUsers: 100,
        activeUsers: 85,
        inactiveUsers: 15,
        newUsersToday: 5,
        newUsersThisWeek: 20,
        newUsersThisMonth: 50
      }

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(stats))

      const result = await userApi.getUserStats()

      expect(api.get).toHaveBeenCalledWith('/users/stats')
      expect(result.data).toEqual(stats)
    })
  })

  describe('批量操作API', () => {
    it('应该能够批量操作用户', async () => {
      const operation: BatchUserOperation = {
        userIds: [1, 2, 3],
        operation: 'activate'
      }

      const operationResult = { success: 3, failed: 0 }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(operationResult))

      const result = await userApi.batchOperateUsers(operation)

      expect(api.post).toHaveBeenCalledWith('/users/batch', operation)
      expect(result.data).toEqual(operationResult)
    })

    it('应该能够批量分配角色', async () => {
      const operation: BatchUserOperation = {
        userIds: [1, 2, 3],
        operation: 'assignRole',
        roleId: 2
      }

      const operationResult = { success: 2, failed: 1 }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(operationResult))

      const result = await userApi.batchOperateUsers(operation)

      expect(api.post).toHaveBeenCalledWith('/users/batch', operation)
      expect(result.data).toEqual(operationResult)
    })
  })

  describe('导入导出API', () => {
    it('应该能够导出用户数据', async () => {
      const query = { status: 'ACTIVE' as const }
      const exportResult = { downloadUrl: 'https://example.com/export.xlsx' }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(exportResult))

      const result = await userApi.exportUsers(query)

      expect(api.post).toHaveBeenCalledWith('/users/export', query)
      expect(result.data).toEqual(exportResult)
    })

    it('应该能够导入用户数据', async () => {
      const file = new File(['test content'], 'users.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const importResult = { success: 10, failed: 2, errors: [] }

      vi.mocked(api.upload).mockResolvedValue(mockApiResponse(importResult))

      const result = await userApi.importUsers(file)

      expect(api.upload).toHaveBeenCalledWith('/users/import', file)
      expect(result.data).toEqual(importResult)
    })
  })

  describe('角色管理API', () => {
    it('应该能够获取所有角色列表', async () => {
      const roles = [mockRole]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(roles))

      const result = await userApi.getRoles()

      expect(api.get).toHaveBeenCalledWith('/roles')
      expect(result.data).toEqual(roles)
    })

    it('应该能够获取角色列表（分页）', async () => {
      const query = { page: 1, size: 10, name: '管理', status: 'ACTIVE' }
      const roles = [mockRole]
      const pageResponse = mockPageResponse(roles, 1)

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(pageResponse))

      const result = await userApi.getRolesPaginated(query)

      expect(api.get).toHaveBeenCalledWith('/roles/paginated', { params: query })
      expect(result.data).toEqual(pageResponse)
    })

    it('应该能够根据ID获取角色详情', async () => {
      const roleId = 1

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockRole))

      const result = await userApi.getRoleById(roleId)

      expect(api.get).toHaveBeenCalledWith(`/roles/${roleId}`)
      expect(result.data).toEqual(mockRole)
    })

    it('应该能够创建新角色', async () => {
      const roleData = {
        name: '新角色',
        code: 'NEW_ROLE',
        description: '新创建的角色',
        permissions: [mockPermission],
        status: 'ACTIVE' as const
      }

      const newRole = { ...mockRole, id: 2, ...roleData }

      vi.mocked(api.post).mockResolvedValue(mockApiResponse(newRole))

      const result = await userApi.createRole(roleData)

      expect(api.post).toHaveBeenCalledWith('/roles', roleData)
      expect(result.data).toEqual(newRole)
    })

    it('应该能够更新角色信息', async () => {
      const roleId = 1
      const roleData = { name: '更新角色', description: '更新后的角色' }
      const updatedRole = { ...mockRole, ...roleData }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(updatedRole))

      const result = await userApi.updateRole(roleId, roleData)

      expect(api.put).toHaveBeenCalledWith(`/roles/${roleId}`, roleData)
      expect(result.data).toEqual(updatedRole)
    })

    it('应该能够删除角色', async () => {
      const roleId = 1

      vi.mocked(api.delete).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.deleteRole(roleId)

      expect(api.delete).toHaveBeenCalledWith(`/roles/${roleId}`)
      expect(result.code).toBe(200)
    })
  })

  describe('用户角色关联API', () => {
    it('应该能够获取用户的角色列表', async () => {
      const userId = 1
      const userRoles = [mockRole]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(userRoles))

      const result = await userApi.getUserRoles(userId)

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}/roles`)
      expect(result.data).toEqual(userRoles)
    })

    it('应该能够为用户分配角色', async () => {
      const userId = 1
      const roleIds = [1, 2, 3]

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.assignUserRoles(userId, roleIds)

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}/roles`, { roleIds })
      expect(result.code).toBe(200)
    })

    it('应该能够移除用户角色', async () => {
      const userId = 1
      const roleIds = [2, 3]

      vi.mocked(api.delete).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.removeUserRoles(userId, roleIds)

      expect(api.delete).toHaveBeenCalledWith(`/users/${userId}/roles`, { data: { roleIds } })
      expect(result.code).toBe(200)
    })
  })

  describe('权限管理API', () => {
    it('应该能够获取所有权限列表', async () => {
      const permissions = [mockPermission]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(permissions))

      const result = await userApi.getPermissions()

      expect(api.get).toHaveBeenCalledWith('/permissions')
      expect(result.data).toEqual(permissions)
    })

    it('应该能够获取权限树形结构', async () => {
      const permissionTree = [mockPermission]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(permissionTree))

      const result = await userApi.getPermissionTree()

      expect(api.get).toHaveBeenCalledWith('/permissions/tree')
      expect(result.data).toEqual(permissionTree)
    })

    it('应该能够根据ID获取权限详情', async () => {
      const permissionId = 1

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(mockPermission))

      const result = await userApi.getPermissionById(permissionId)

      expect(api.get).toHaveBeenCalledWith(`/permissions/${permissionId}`)
      expect(result.data).toEqual(mockPermission)
    })

    it('应该能够获取角色的权限列表', async () => {
      const roleId = 1
      const rolePermissions = [mockPermission]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(rolePermissions))

      const result = await userApi.getRolePermissions(roleId)

      expect(api.get).toHaveBeenCalledWith(`/roles/${roleId}/permissions`)
      expect(result.data).toEqual(rolePermissions)
    })

    it('应该能够为角色分配权限', async () => {
      const roleId = 1
      const permissionIds = [1, 2, 3]

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      const result = await userApi.assignRolePermissions(roleId, permissionIds)

      expect(api.put).toHaveBeenCalledWith(`/roles/${roleId}/permissions`, { permissionIds })
      expect(result.code).toBe(200)
    })

    it('应该能够获取用户的所有权限', async () => {
      const userId = 1
      const userPermissions = ['user:view', 'user:create', 'user:update']

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(userPermissions))

      const result = await userApi.getUserPermissions(userId)

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}/permissions`)
      expect(result.data).toEqual(userPermissions)
    })

    it('应该能够检查用户是否有指定权限', async () => {
      const userId = 1
      const permission = 'user:view'
      const hasPermission = true

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(hasPermission))

      const result = await userApi.checkUserPermission(userId, permission)

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}/permissions/check`, { 
        params: { permission } 
      })
      expect(result.data).toBe(hasPermission)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      const errorResponse = {
        code: 400,
        message: '用户名已存在',
        data: null,
        success: false
      }

      vi.mocked(api.get).mockRejectedValue(new Error('用户名已存在'))

      await expect(userApi.getCurrentUser()).rejects.toThrow('用户名已存在')
    })

    it('应该正确处理网络错误', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('网络连接失败'))

      await expect(userApi.login({ username: 'test', password: 'test' })).rejects.toThrow('网络连接失败')
    })
  })

  describe('参数验证', () => {
    it('搜索用户时应该使用默认limit值', async () => {
      const keyword = '测试'
      const searchResults = [mockUser]

      vi.mocked(api.get).mockResolvedValue(mockApiResponse(searchResults))

      await userApi.searchUsers(keyword)

      expect(api.get).toHaveBeenCalledWith('/users/search', { 
        params: { keyword, limit: 10 } 
      })
    })

    it('更新用户时应该正确分离ID和数据', async () => {
      const userForm: UpdateUserForm = {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com'
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(mockUser))

      await userApi.updateUser(userForm)

      expect(api.put).toHaveBeenCalledWith('/users/1', {
        username: 'updateduser',
        email: 'updated@example.com'
      })
    })

    it('修改密码时应该正确分离ID和数据', async () => {
      const passwordForm: ChangePasswordForm = {
        id: 1,
        oldPassword: 'old123',
        newPassword: 'new123',
        confirmPassword: 'new123'
      }

      vi.mocked(api.put).mockResolvedValue(mockApiResponse(undefined))

      await userApi.changeUserPassword(passwordForm)

      expect(api.put).toHaveBeenCalledWith('/users/1/password', {
        oldPassword: 'old123',
        newPassword: 'new123',
        confirmPassword: 'new123'
      })
    })
  })
})