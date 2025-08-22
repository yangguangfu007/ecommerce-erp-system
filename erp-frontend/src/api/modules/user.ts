import api from '@/api'
import type { ApiResponse, PageResponse, PageRequest, User, Role, Permission } from '@/types'

// 用户查询参数接口（与后端接口一致）
export interface UserQuery extends PageRequest {
  username?: string      // 用户名查询
  realName?: string      // 真实姓名查询（后端字段）
  status?: number        // 状态查询：0-禁用，1-启用（后端数字类型）
}

// 用户创建表单接口（与后端接口一致）
export interface CreateUserForm {
  username: string
  realName: string       // 真实姓名（后端字段）
  nickname?: string
  email: string
  phone: string
  password: string
  status: number         // 状态：0-禁用，1-启用（后端数字类型）
  remark?: string
}

// 用户更新表单接口
export interface UpdateUserForm {
  id: number
  username?: string
  email?: string
  nickname?: string
  avatar?: string
  roleIds?: number[]
  status?: 'ACTIVE' | 'INACTIVE'
}

// 用户密码修改表单接口
export interface ChangePasswordForm {
  id: number
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 登录表单接口
export interface LoginForm {
  username: string
  password: string
}

// 登录响应接口（与后端响应一致）
export interface LoginResponse {
  accessToken: string    // 访问令牌（后端返回字段）
  refreshToken: string   // 刷新令牌（后端返回字段）
  tokenType: string      // 令牌类型（后端返回字段）
  expiresIn: number      // 过期时间秒数（后端返回字段）
  userInfo: User         // 用户信息（后端返回的完整用户对象）
}

// 用户统计信息接口
export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

// 批量操作参数接口
export interface BatchUserOperation {
  userIds: number[]
  operation: 'activate' | 'deactivate' | 'delete' | 'assignRole' | 'removeRole'
  roleId?: number
}

/**
 * 用户管理API模块
 * 提供用户相关的所有API接口功能
 */
export const userApi = {
  /**
   * 用户登录
   * @param loginForm 登录表单数据
   * @returns 登录响应信息
   */
  login(loginForm: LoginForm): Promise<ApiResponse<LoginResponse>> {
    return api.post('/auth/login', loginForm, { skipAuth: true })
  },

  /**
   * 用户登出
   * @returns 登出结果
   */
  logout(): Promise<ApiResponse<void>> {
    return api.post('/auth/logout', {}, { skipErrorHandler: true })
  },

  /**
   * 刷新token
   * @param refreshToken 刷新token
   * @returns 新的token信息
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return api.post('/auth/refresh', { refreshToken }, { skipAuth: true })
  },

  /**
   * 获取当前用户信息
   * @returns 当前用户详细信息
   */
  getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get('/auth/me')
  },

  /**
   * 更新当前用户信息
   * @param userInfo 用户信息
   * @returns 更新结果
   */
  updateCurrentUser(userInfo: Partial<User>): Promise<ApiResponse<User>> {
    return api.put('/users/profile', userInfo)
  },

  /**
   * 修改当前用户密码
   * @param passwordForm 密码修改表单
   * @returns 修改结果
   */
  changeCurrentUserPassword(passwordForm: Omit<ChangePasswordForm, 'id'>): Promise<ApiResponse<void>> {
    return api.put('/users/profile/password', passwordForm)
  },

  /**
   * 获取用户列表（分页）
   * @param query 查询参数
   * @returns 用户列表分页数据
   */
  getUsers(query: UserQuery): Promise<ApiResponse<PageResponse<User>>> {
    return api.get('/users', { params: query })
  },

  /**
   * 根据ID获取用户详情
   * @param id 用户ID
   * @returns 用户详细信息
   */
  getUserById(id: number): Promise<ApiResponse<User>> {
    return api.get(`/users/${id}`)
  },

  /**
   * 创建新用户
   * @param userForm 用户创建表单
   * @returns 创建的用户信息
   */
  createUser(userForm: CreateUserForm): Promise<ApiResponse<User>> {
    return api.post('/users', userForm)
  },

  /**
   * 更新用户信息
   * @param userForm 用户更新表单
   * @returns 更新后的用户信息
   */
  updateUser(userForm: UpdateUserForm): Promise<ApiResponse<User>> {
    const { id, ...data } = userForm
    return api.put(`/users/${id}`, data)
  },

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  deleteUser(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/users/${id}`)
  },

  /**
   * 修改用户密码（管理员操作）
   * @param passwordForm 密码修改表单
   * @returns 修改结果
   */
  changeUserPassword(passwordForm: ChangePasswordForm): Promise<ApiResponse<void>> {
    const { id, ...data } = passwordForm
    return api.put(`/users/${id}/password`, data)
  },

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   * @returns 重置结果
   */
  resetUserPassword(id: number, newPassword: string): Promise<ApiResponse<void>> {
    return api.put(`/users/${id}/password/reset`, { newPassword })
  },

  /**
   * 激活用户
   * @param id 用户ID
   * @returns 激活结果
   */
  activateUser(id: number): Promise<ApiResponse<void>> {
    return api.put(`/users/${id}/activate`)
  },

  /**
   * 禁用用户
   * @param id 用户ID
   * @returns 禁用结果
   */
  deactivateUser(id: number): Promise<ApiResponse<void>> {
    return api.put(`/users/${id}/deactivate`)
  },

  /**
   * 搜索用户
   * @param keyword 搜索关键词
   * @param limit 返回数量限制
   * @returns 搜索结果
   */
  searchUsers(keyword: string, limit: number = 10): Promise<ApiResponse<User[]>> {
    return api.get('/users/search', { 
      params: { keyword, limit } 
    })
  },

  /**
   * 获取用户统计信息
   * @returns 用户统计数据
   */
  getUserStats(): Promise<ApiResponse<UserStats>> {
    return api.get('/users/stats')
  },

  /**
   * 批量操作用户
   * @param operation 批量操作参数
   * @returns 操作结果
   */
  batchOperateUsers(operation: BatchUserOperation): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.post('/users/batch', operation)
  },

  /**
   * 导出用户数据
   * @param query 查询条件
   * @returns 导出文件URL
   */
  exportUsers(query: Partial<UserQuery>): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/users/export', query)
  },

  /**
   * 导入用户数据
   * @param file Excel文件
   * @returns 导入结果
   */
  importUsers(file: File): Promise<ApiResponse<{ success: number; failed: number; errors: unknown[] }>> {
    return api.upload('/users/import', file)
  },

  // ==================== 角色管理相关API ====================

  /**
   * 获取所有角色列表
   * @returns 角色列表
   */
  getRoles(): Promise<ApiResponse<PageResponse<Role>>> {
    return api.get('/roles')
  },

  /**
   * 获取角色列表（分页）
   * @param query 查询参数
   * @returns 角色列表分页数据
   */
  getRolesPaginated(query: PageRequest & { name?: string; status?: string }): Promise<ApiResponse<PageResponse<Role>>> {
    return api.get('/roles/paginated', { params: query })
  },

  /**
   * 根据ID获取角色详情
   * @param id 角色ID
   * @returns 角色详细信息
   */
  getRoleById(id: number): Promise<ApiResponse<Role>> {
    return api.get(`/roles/${id}`)
  },

  /**
   * 创建新角色
   * @param roleData 角色数据
   * @returns 创建的角色信息
   */
  createRole(roleData: Omit<Role, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<Role>> {
    return api.post('/roles', roleData)
  },

  /**
   * 更新角色信息
   * @param id 角色ID
   * @param roleData 角色数据
   * @returns 更新后的角色信息
   */
  updateRole(id: number, roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    return api.put(`/roles/${id}`, roleData)
  },

  /**
   * 删除角色
   * @param id 角色ID
   * @returns 删除结果
   */
  deleteRole(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/roles/${id}`)
  },

  /**
   * 获取用户的角色列表
   * @param userId 用户ID
   * @returns 用户角色列表
   */
  getUserRoles(userId: number): Promise<ApiResponse<Role[]>> {
    return api.get(`/users/${userId}/roles`)
  },

  /**
   * 为用户分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID列表
   * @returns 分配结果
   */
  assignUserRoles(userId: number, roleIds: number[]): Promise<ApiResponse<void>> {
    return api.put(`/users/${userId}/roles`, { roleIds })
  },

  /**
   * 移除用户角色
   * @param userId 用户ID
   * @param roleIds 要移除的角色ID列表
   * @returns 移除结果
   */
  removeUserRoles(userId: number, roleIds: number[]): Promise<ApiResponse<void>> {
    return api.delete(`/users/${userId}/roles`, { data: { roleIds } })
  },

  // ==================== 权限管理相关API ====================

  /**
   * 获取所有权限列表
   * @returns 权限列表
   */
  getPermissions(): Promise<ApiResponse<Permission[]>> {
    return api.get('/permissions')
  },

  /**
   * 获取权限树形结构
   * @returns 权限树形数据
   */
  getPermissionTree(): Promise<ApiResponse<Permission[]>> {
    return api.get('/permissions/tree')
  },

  /**
   * 根据ID获取权限详情
   * @param id 权限ID
   * @returns 权限详细信息
   */
  getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    return api.get(`/permissions/${id}`)
  },

  /**
   * 获取角色的权限列表
   * @param roleId 角色ID
   * @returns 角色权限列表
   */
  getRolePermissions(roleId: number): Promise<ApiResponse<Permission[]>> {
    return api.get(`/permissions/by-role/${roleId}`)
  },

  /**
   * 为角色分配权限
   * @param roleId 角色ID
   * @param permissionIds 权限ID列表
   * @returns 分配结果
   */
  assignRolePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<void>> {
    return api.put(`/roles/${roleId}/permissions`, permissionIds)
  },

  /**
   * 获取用户的所有权限
   * @param userId 用户ID
   * @returns 用户权限列表
   */
  getUserPermissions(userId: number): Promise<ApiResponse<string[]>> {
    return api.get(`/users/${userId}/permissions`)
  },

  /**
   * 检查用户是否有指定权限
   * @param userId 用户ID
   * @param permission 权限代码
   * @returns 权限检查结果
   */
  checkUserPermission(userId: number, permission: string): Promise<ApiResponse<boolean>> {
    return api.get(`/users/${userId}/permissions/check`, { 
      params: { permission } 
    })
  }
}

export default userApi