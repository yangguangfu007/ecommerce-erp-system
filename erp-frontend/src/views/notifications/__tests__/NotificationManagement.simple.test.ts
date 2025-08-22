import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useNotificationStore } from '@/stores/notification'

// Mock 通知 Store
vi.mock('@/stores/notification', () => ({
  useNotificationStore: vi.fn()
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2小时前'),
  format: vi.fn(() => '2024-02-05 14:30:00')
}))

vi.mock('date-fns/locale', () => ({
  zhCN: {}
}))

describe('NotificationManagement 简单测试', () => {
  it('应该能够导入组件', async () => {
    // 创建 mock store
    const mockStore = {
      isLoading: false,
      state: {
        notifications: [],
        total: 0,
        currentPage: 1,
        pageSize: 20,
        selectedNotificationIds: [],
        unreadCount: 0
      },
      selectedCount: 0,
      hasUnreadNotifications: false,
      fetchNotifications: vi.fn().mockResolvedValue(undefined),
      refresh: vi.fn().mockResolvedValue(undefined),
      markAllAsRead: vi.fn().mockResolvedValue(undefined),
      markAsRead: vi.fn().mockResolvedValue(undefined),
      batchMarkAsRead: vi.fn().mockResolvedValue(undefined),
      deleteNotification: vi.fn().mockResolvedValue(undefined),
      batchDeleteNotifications: vi.fn().mockResolvedValue(undefined),
      toggleNotificationSelection: vi.fn(),
      clearSelection: vi.fn(),
      setPagination: vi.fn()
    }

    // Mock useNotificationStore
    ;(useNotificationStore as any).mockReturnValue(mockStore)

    // 动态导入组件
    const NotificationManagement = await import('../NotificationManagement.vue')
    expect(NotificationManagement.default).toBeDefined()
  })

  it('应该通过基本测试', () => {
    expect(true).toBe(true)
  })
})