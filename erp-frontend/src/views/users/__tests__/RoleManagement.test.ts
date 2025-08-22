import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import RoleManagement from '../RoleManagement.vue'
import { userApi } from '@/api/modules/user'
import type { Role, Permission } from '@/types'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Plus: { name: 'Plus' },
  Refresh: { name: 'Refresh' }
}))

// Mock user API
vi.mock('@/api/modules/user', () => ({
  userApi: {
    getRoles: vi.fn(),
    getPermissionTree: vi.fn(),
    getRolePermissions: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
    assignRolePermissions: vi.fn()
  }
}))

// Mock 角色数据
const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    permissions: [
      { id: 1, name: '用户管理', code: 'user:*', resource: 'user', action: '*' },
      { id: 2, name: '商品管理', code: 'product:*', resource: 'product', action: '*' }
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    name: '管理员',
    code: 'admin',
    description: '系统管理员，拥有大部分权限',
    permissions: [
      { id: 1, name: '用户管理', code: 'user:*', resource: 'user', action: '*' }
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    name: '运营人员',
    code: 'operator',
    description: '负责日常运营管理',
    permissions: [
      { id: 3, name: '商品查看', code: 'product:read', resource: 'product', action: 'read' }
    ],
    status: 'INACTIVE',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  }
]

// Mock 权限树数据
const mockPermissionTree: Permission[] = [
  {
    id: 1,
    name: '用户管理',
    code: 'user:*',
    resource: 'user',
    action: '*',
    children: [
      { id: 11, name: '用户查看', code: 'user:read', resource: 'user', action: 'read' },
      { id: 12, name: '用户创建', code: 'user:create', resource: 'user', action: 'create' },
      { id: 13, name: '用户更新', code: 'user:update', resource: 'user', action: 'update' },
      { id: 14, name: '用户删除', code: 'user:delete', resource: 'user', action: 'delete' }
    ]
  },
  {
    id: 2,
    name: '商品管理',
    code: 'product:*',
    resource: 'product',
    action: '*',
    children: [
      { id: 21, name: '商品查看', code: 'product:read', resource: 'product', action: 'read' },
      { id: 22, name: '商品创建', code: 'product:create', resource: 'product', action: 'create' }
    ]
  }
]

// 通用的组件挂载配置
const mountOptions = {
  global: {
    stubs: {
      'el-button': true,
      'el-icon': true,
      'el-tag': true,
      'el-empty': true,
      'el-dialog': true,
      'el-form': true,
      'el-form-item': true,
      'el-input': true,
      'el-radio-group': true,
      'el-radio': true,
      'el-tree': true
    }
  }
}

describe('RoleManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置默认的 API 返回值
    vi.mocked(userApi.getRoles).mockResolvedValue({
      code: 200,
      message: '成功',
      data: mockRoles,
      success: true
    })
    
    vi.mocked(userApi.getPermissionTree).mockResolvedValue({
      code: 200,
      message: '成功',
      data: mockPermissionTree,
      success: true
    })
    
    vi.mocked(userApi.getRolePermissions).mockResolvedValue({
      code: 200,
      message: '成功',
      data: mockRoles[0].permissions,
      success: true
    })
  })

  it('应该正确渲染角色管理页面', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 等待组件挂载和数据加载
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查页面标题
    expect(wrapper.find('.page-title').text()).toBe('角色管理')
    
    // 检查组件是否正确渲染
    expect(wrapper.find('.role-management').exists()).toBe(true)
    expect(wrapper.find('.page-header').exists()).toBe(true)
    expect(wrapper.find('.content-card').exists()).toBe(true)
  })

  it('应该正确加载角色数据', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 等待数据加载
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查是否调用了API
    expect(userApi.getRoles).toHaveBeenCalled()
    
    // 检查角色数据是否正确设置
    expect(wrapper.vm.roleList).toEqual(mockRoles)
  })

  it('应该正确处理添加角色操作', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 调用添加角色方法
    wrapper.vm.handleAddRole()
    
    // 检查对话框是否打开
    expect(wrapper.vm.roleDialogVisible).toBe(true)
    expect(wrapper.vm.isEditMode).toBe(false)
    
    // 检查表单是否重置
    expect(wrapper.vm.roleForm.name).toBe('')
    expect(wrapper.vm.roleForm.code).toBe('')
    expect(wrapper.vm.roleForm.description).toBe('')
    expect(wrapper.vm.roleForm.status).toBe('ACTIVE')
  })

  it('应该正确处理编辑角色操作', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 调用编辑角色方法
    wrapper.vm.handleEditRole(mockRoles[0])
    
    // 检查对话框是否打开
    expect(wrapper.vm.roleDialogVisible).toBe(true)
    expect(wrapper.vm.isEditMode).toBe(true)
    
    // 检查表单是否填充了角色数据
    expect(wrapper.vm.roleForm.name).toBe('超级管理员')
    expect(wrapper.vm.roleForm.code).toBe('super_admin')
    expect(wrapper.vm.roleForm.description).toBe('拥有系统所有权限')
    expect(wrapper.vm.roleForm.status).toBe('ACTIVE')
  })

  it('应该正确处理查看权限操作', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 调用查看权限方法
    await wrapper.vm.handleViewPermissions(mockRoles[0])
    
    // 等待权限数据加载
    await wrapper.vm.$nextTick()
    
    // 检查权限对话框是否打开
    expect(wrapper.vm.permissionDialogVisible).toBe(true)
    expect(wrapper.vm.currentRole).toEqual(mockRoles[0])
    
    // 检查是否调用了获取权限的API
    expect(userApi.getRolePermissions).toHaveBeenCalledWith(1)
  })

  it('应该正确处理删除角色操作', async () => {
    // Mock 确认对话框
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
    vi.mocked(userApi.deleteRole).mockResolvedValue({
      code: 200,
      message: '删除成功',
      data: undefined,
      success: true
    })
    
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 调用删除角色方法
    await wrapper.vm.handleDeleteRole(mockRoles[0])
    
    // 检查是否显示了确认对话框
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除角色 "超级管理员" 吗？删除后将无法恢复。',
      '确认删除',
      expect.any(Object)
    )
    
    // 检查是否调用了删除API
    expect(userApi.deleteRole).toHaveBeenCalledWith(1)
    
    // 检查是否显示了成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('角色删除成功')
  })

  it('应该正确处理创建角色表单提交', async () => {
    vi.mocked(userApi.createRole).mockResolvedValue({
      code: 200,
      message: '创建成功',
      data: mockRoles[0],
      success: true
    })
    
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 设置表单数据
    wrapper.vm.roleDialogVisible = true
    wrapper.vm.isEditMode = false
    wrapper.vm.roleForm.name = '测试角色'
    wrapper.vm.roleForm.code = 'test_role'
    wrapper.vm.roleForm.description = '测试角色描述'
    wrapper.vm.roleForm.status = 'ACTIVE'
    
    // Mock 表单验证通过
    wrapper.vm.roleFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    } as any
    
    await wrapper.vm.$nextTick()
    
    // 提交表单
    await wrapper.vm.handleSubmitRole()
    
    // 检查是否调用了创建API
    expect(userApi.createRole).toHaveBeenCalledWith({
      name: '测试角色',
      code: 'test_role',
      description: '测试角色描述',
      status: 'ACTIVE'
    })
    
    // 检查是否显示了成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('角色创建成功')
  })

  it('应该正确处理更新角色表单提交', async () => {
    vi.mocked(userApi.updateRole).mockResolvedValue({
      code: 200,
      message: '更新成功',
      data: mockRoles[0],
      success: true
    })
    
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 设置编辑模式
    wrapper.vm.roleDialogVisible = true
    wrapper.vm.isEditMode = true
    wrapper.vm.currentRole = mockRoles[0]
    wrapper.vm.roleForm.name = '更新后的角色名'
    wrapper.vm.roleForm.code = 'super_admin'
    wrapper.vm.roleForm.description = '更新后的描述'
    wrapper.vm.roleForm.status = 'ACTIVE'
    
    // Mock 表单验证通过
    wrapper.vm.roleFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    } as unknown
    
    await wrapper.vm.$nextTick()
    
    // 提交表单
    await wrapper.vm.handleSubmitRole()
    
    // 检查是否调用了更新API
    expect(userApi.updateRole).toHaveBeenCalledWith(1, {
      name: '更新后的角色名',
      code: 'super_admin',
      description: '更新后的描述',
      status: 'ACTIVE'
    })
    
    // 检查是否显示了成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('角色更新成功')
  })

  it('应该正确处理权限配置提交', async () => {
    vi.mocked(userApi.assignRolePermissions).mockResolvedValue({
      code: 200,
      message: '权限配置成功',
      data: undefined,
      success: true
    })
    
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 设置权限配置状态
    wrapper.vm.permissionDialogVisible = true
    wrapper.vm.currentRole = mockRoles[0]
    wrapper.vm.selectedPermissions = [1, 2, 11, 12]
    
    await wrapper.vm.$nextTick()
    
    // 提交权限配置
    await wrapper.vm.handleSubmitPermissions()
    
    // 检查是否调用了权限分配API
    expect(userApi.assignRolePermissions).toHaveBeenCalledWith(1, [1, 2, 11, 12])
    
    // 检查是否显示了成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('权限配置成功')
  })

  it('应该正确处理刷新操作', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 清除之前的调用记录
    vi.clearAllMocks()
    
    // 调用刷新方法
    wrapper.vm.refreshRoleList()
    
    // 检查是否显示了刷新消息
    expect(ElMessage.info).toHaveBeenCalledWith('正在刷新角色列表...')
    
    // 检查是否重新调用了获取角色列表API
    expect(userApi.getRoles).toHaveBeenCalled()
  })

  it('应该正确处理空数据状态', async () => {
    // Mock 空数据返回
    vi.mocked(userApi.getRoles).mockResolvedValue({
      code: 200,
      message: '成功',
      data: [],
      success: true
    })
    
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查角色列表是否为空
    expect(wrapper.vm.roleList).toEqual([])
  })

  it('应该正确处理API错误', async () => {
    // Mock API 错误
    vi.mocked(userApi.getRoles).mockRejectedValue(new Error('网络错误'))
    
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查是否显示了错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('加载角色列表失败')
  })

  it('应该正确处理权限选择', async () => {
    const wrapper = shallowMount(RoleManagement, mountOptions)
    
    // 模拟权限选择
    const mockPermission = mockPermissionTree[0]
    const mockChecked = {
      checkedKeys: [1, 11, 12],
      checkedNodes: [mockPermission]
    }
    
    wrapper.vm.handlePermissionCheck(mockPermission, mockChecked)
    
    // 检查选中的权限是否更新
    expect(wrapper.vm.selectedPermissions).toEqual([1, 11, 12])
  })
})