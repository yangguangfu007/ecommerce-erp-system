import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserManagement from '../UserManagement.vue'
import { userApi } from '@/api/modules/user'
import type { User, Role } from '@/types'

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock API
vi.mock('@/api/modules/user', () => ({
  userApi: {
    getUsers: vi.fn(),
    getRoles: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    activateUser: vi.fn(),
    deactivateUser: vi.fn(),
    batchOperateUsers: vi.fn()
  }
}))

// Mock utils
vi.mock('@/utils', () => ({
  formatDateTime: vi.fn((date) => {
    if (!date) return ''
    return '2024-01-01 12:00:00'
  })
}))

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Plus: { name: 'Plus' },
  Refresh: { name: 'Refresh' },
  Download: { name: 'Download' },
  Delete: { name: 'Delete' },
  Search: { name: 'Search' },
  View: { name: 'View' },
  Edit: { name: 'Edit' },
  CircleClose: { name: 'CircleClose' },
  CircleCheck: { name: 'CircleCheck' }
}))

describe('用户管理页面测试', () => {
  let wrapper: VueWrapper<unknown>
  
  // Mock 数据
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      nickname: '管理员',
      avatar: '',
      roles: [
        { id: 1, name: '管理员', code: 'admin', description: '', permissions: [], status: 'ACTIVE', createdAt: '', updatedAt: '' }
      ],
      permissions: ['user:view', 'user:create', 'user:update', 'user:delete'],
      status: 'ACTIVE',
      lastLoginTime: '2024-01-01T12:00:00Z',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z'
    }
  ]

  const mockRoles: Role[] = [
    {
      id: 1,
      name: '管理员',
      code: 'admin',
      description: '系统管理员',
      permissions: [
        { id: 1, name: '用户查看', code: 'user:view', resource: 'user', action: 'view' },
        { id: 2, name: '用户创建', code: 'user:create', resource: 'user', action: 'create' }
      ],
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置默认的 API 响应
    vi.mocked(userApi.getUsers).mockResolvedValue({
      code: 200,
      message: '成功',
      data: {
        list: mockUsers,
        total: 1,
        page: 1,
        size: 10,
        pages: 1
      },
      success: true
    })

    vi.mocked(userApi.getRoles).mockResolvedValue({
      code: 200,
      message: '成功',
      data: mockRoles,
      success: true
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件基础测试', () => {
    it('应该正确渲染用户管理组件', async () => {
      wrapper = shallowMount(UserManagement, {
        global: {
          stubs: {
            'el-button': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-form': true,
            'el-form-item': true,
            'el-row': true,
            'el-col': true,
            'el-checkbox': true,
            'el-checkbox-group': true,
            'el-avatar': true,
            'el-tag': true,
            'el-icon': true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.user-management').exists()).toBe(true)
    })

    it('应该正确渲染页面标题', async () => {
      wrapper = shallowMount(UserManagement, {
        global: {
          stubs: {
            'el-button': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-form': true,
            'el-form-item': true,
            'el-row': true,
            'el-col': true,
            'el-checkbox': true,
            'el-checkbox-group': true,
            'el-avatar': true,
            'el-tag': true,
            'el-icon': true
          }
        }
      })
      
      expect(wrapper.find('.page-title').text()).toBe('用户列表')
    })

    it('应该在组件挂载时调用API加载数据', async () => {
      wrapper = shallowMount(UserManagement, {
        global: {
          stubs: {
            'el-button': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-form': true,
            'el-form-item': true,
            'el-row': true,
            'el-col': true,
            'el-checkbox': true,
            'el-checkbox-group': true,
            'el-avatar': true,
            'el-tag': true,
            'el-icon': true
          }
        }
      })
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(userApi.getUsers).toHaveBeenCalled()
      expect(userApi.getRoles).toHaveBeenCalled()
    })

    it('应该正确处理API错误', async () => {
      vi.mocked(userApi.getUsers).mockRejectedValue(new Error('网络错误'))
      
      wrapper = shallowMount(UserManagement, {
        global: {
          stubs: {
            'el-button': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-form': true,
            'el-form-item': true,
            'el-row': true,
            'el-col': true,
            'el-checkbox': true,
            'el-checkbox-group': true,
            'el-avatar': true,
            'el-tag': true,
            'el-icon': true
          }
        }
      })
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(ElMessage.error).toHaveBeenCalledWith('获取用户列表失败')
    })

    it('应该正确显示用户数据统计', async () => {
      wrapper = shallowMount(UserManagement, {
        global: {
          stubs: {
            'el-button': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-form': true,
            'el-form-item': true,
            'el-row': true,
            'el-col': true,
            'el-checkbox': true,
            'el-checkbox-group': true,
            'el-avatar': true,
            'el-tag': true,
            'el-icon': true
          }
        }
      })
      
      // 等待数据加载
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // 检查分页信息是否正确显示
      const paginationInfo = wrapper.find('.pagination-info')
      expect(paginationInfo.text()).toContain('显示第 1-1 条，共 1 条记录')
    })
  })


})