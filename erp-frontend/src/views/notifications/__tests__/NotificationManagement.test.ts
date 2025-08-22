import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import NotificationManagement from '../NotificationManagement.vue'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/notification'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2小时前')
}))

vi.mock('date-fns/locale', () => ({
  zhCN: {}
}))

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用。',
    type: 'info',
    category: 'system',
    priority: 'medium',
    isRead: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sender: '系统管理员'
  },
  {
    id: '2',
    title: '订单异常提醒',
    content: '订单 #12345 支付超时，请及时处理。',
    type: 'warning',
    category: 'order',
    priority: 'high',
    isRead: true,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    sender: '订单系统',
    actions: [
      {
        id: 'view-order',
        label: '查看订单',
        type: 'primary',
        action: 'view-order',
        params: { orderId: '12345' }
      }
    ]
  },
  {
    id: '3',
    title: '库存不足警告',
    content: '商品 SKU001 库存不足，当前库存：5件，建议及时补货。',
    type: 'error',
    category: 'inventory',
    priority: 'urgent',
    isRead: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    sender: '库存系统'
  }
]

const mockStats = {
  total: 3,
  unread: 2,
  byCategory: {
    system: 1,
    order: 1,
    inventory: 1
  },
  byType: {
    info: 1,
    warning: 1,
    error: 1
  },
  byPriority: {
    medium: 1,
    high: 1,
    urgent: 1
  }
}

describe('NotificationManagement', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useNotificationStore()
    
    // Mock store state
    store.notifications = mockNotifications
    store.stats = mockStats
    store.loading = false
    store.pagination = {
      page: 1,
      pageSize: 20,
      total: 3
    }
    store.hasUnread = true
    
    // Mock store methods
    store.fetchNotifications = vi.fn().mockResolvedValue(undefined)
    store.fetchNotificationDetail = vi.fn().mockResolvedValue(undefined)
    store.markRead = vi.fn().mockResolvedValue(undefined)
    store.deleteNotifications = vi.fn().mockResolvedValue(undefined)
    store.markAllAsRead = vi.fn().mockResolvedValue(undefined)
    store.clearRead = vi.fn().mockResolvedValue(undefined)
    store.updateFilter = vi.fn()
    store.resetFilter = vi.fn()
    store.updatePagination = vi.fn()
    
    wrapper = mount(NotificationManagement, {
      global: {
        stubs: {
          'el-card': { template: '<div><slot /></div>' },
          'el-button': { template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>', props: ['disabled'] },
          'el-tag': { template: '<span><slot /></span>' },
          'el-select': { template: '<select @change="$emit(\'change\', $event.target.value)"><slot /></select>' },
          'el-option': { template: '<option><slot /></option>' },
          'el-input': { template: '<input @input="$emit(\'input\', $event.target.value)" />' },
          'el-checkbox': { template: '<input type="checkbox" @change="$emit(\'change\', $event.target.checked)" />' },
          'el-pagination': { template: '<div class="pagination"></div>' },
          'el-empty': { template: '<div class="empty">暂无通知</div>' },
          'el-dialog': { template: '<div v-if="modelValue" class="dialog"><slot /></div>', props: ['modelValue'] }
        }
      }
    })
  })

  describe('页面渲染', () => {
    it('应该正确渲染页面标题和统计信息', () => {
      expect(wrapper.find('.page-title').text()).toBe('通知中心')
      expect(wrapper.text()).toContain('总计: 3')
      expect(wrapper.text()).toContain('未读: 2')
    })

    it('应该渲染筛选器组件', () => {
      expect(wrapper.find('.filter-section').exists()).toBe(true)
      expect(wrapper.findAll('select')).toHaveLength(4) // 分类、类型、优先级、状态
      expect(wrapper.find('input[type="text"]').exists()).toBe(true) // 搜索框
    })

    it('应该渲染通知列表', () => {
      const notificationItems = wrapper.findAll('.notification-item')
      expect(notificationItems).toHaveLength(3)
      
      // 检查第一个通知
      const firstItem = notificationItems[0]
      expect(firstItem.text()).toContain('系统维护通知')
      expect(firstItem.text()).toContain('系统将于今晚22:00-24:00进行维护')
      expect(firstItem.classes()).toContain('unread')
    })

    it('应该正确显示通知状态和标签', () => {
      const notificationItems = wrapper.findAll('.notification-item')
      
      // 检查未读通知样式
      expect(notificationItems[0].classes()).toContain('unread')
      expect(notificationItems[1].classes()).not.toContain('unread')
      
      // 检查通知标签
      expect(wrapper.text()).toContain('信息')
      expect(wrapper.text()).toContain('警告')
      expect(wrapper.text()).toContain('错误')
    })
  })

  describe('筛选功能', () => {
    it('应该能够按分类筛选', async () => {
      const categorySelect = wrapper.findAll('select')[0]
      await categorySelect.setValue('system')
      await categorySelect.trigger('change')
      
      expect(store.updateFilter).toHaveBeenCalled()
      expect(store.fetchNotifications).toHaveBeenCalled()
    })

    it('应该能够按类型筛选', async () => {
      const typeSelect = wrapper.findAll('select')[1]
      await typeSelect.setValue('warning')
      await typeSelect.trigger('change')
      
      expect(store.updateFilter).toHaveBeenCalled()
      expect(store.fetchNotifications).toHaveBeenCalled()
    })

    it('应该能够按优先级筛选', async () => {
      const prioritySelect = wrapper.findAll('select')[2]
      await prioritySelect.setValue('high')
      await prioritySelect.trigger('change')
      
      expect(store.updateFilter).toHaveBeenCalled()
      expect(store.fetchNotifications).toHaveBeenCalled()
    })

    it('应该能够按读取状态筛选', async () => {
      const statusSelect = wrapper.findAll('select')[3]
      await statusSelect.setValue('unread')
      await statusSelect.trigger('change')
      
      expect(store.updateFilter).toHaveBeenCalled()
      expect(store.fetchNotifications).toHaveBeenCalled()
    })

    it('应该能够搜索通知', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('系统维护')
      await searchInput.trigger('input')
      
      expect(store.updateFilter).toHaveBeenCalled()
      expect(store.fetchNotifications).toHaveBeenCalled()
    })

    it('应该能够重置筛选条件', async () => {
      const resetButton = wrapper.find('button:contains("重置")')
      await resetButton.trigger('click')
      
      expect(store.resetFilter).toHaveBeenCalled()
      expect(store.fetchNotifications).toHaveBeenCalled()
    })
  })

  describe('通知操作', () => {
    it('应该能够点击通知查看详情', async () => {
      const firstNotification = wrapper.find('.item-content')
      await firstNotification.trigger('click')
      
      expect(store.fetchNotificationDetail).toHaveBeenCalledWith('1')
      expect(store.markRead).toHaveBeenCalledWith(['1'], true)
    })

    it('应该能够标记单个通知为已读/未读', async () => {
      const toggleButton = wrapper.find('button:contains("标记已读")')
      await toggleButton.trigger('click')
      
      expect(store.markRead).toHaveBeenCalledWith(['1'], true)
      expect(ElMessage.success).toHaveBeenCalledWith('已标记为已读')
    })

    it('应该能够删除单个通知', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      const deleteButton = wrapper.find('.delete-btn')
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除这条通知吗？',
        '确认删除',
        { type: 'warning' }
      )
      expect(store.deleteNotifications).toHaveBeenCalledWith(['1'])
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })

    it('应该能够全部标记为已读', async () => {
      const markAllButton = wrapper.find('button:contains("全部已读")')
      await markAllButton.trigger('click')
      
      expect(store.markAllAsRead).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('全部标记为已读')
    })

    it('应该能够清空已读通知', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      const clearButton = wrapper.find('button:contains("清空已读")')
      await clearButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要清空所有已读通知吗？',
        '确认清空',
        { type: 'warning' }
      )
      expect(store.clearRead).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('清空成功')
    })
  })

  describe('批量操作', () => {
    beforeEach(async () => {
      // 选择前两个通知
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[0].setChecked(true)
      await checkboxes[1].setChecked(true)
    })

    it('应该显示批量操作栏', () => {
      expect(wrapper.find('.batch-actions').exists()).toBe(true)
      expect(wrapper.text()).toContain('已选择 2 项')
    })

    it('应该能够批量标记为已读', async () => {
      const batchReadButton = wrapper.find('button:contains("标记已读")')
      await batchReadButton.trigger('click')
      
      expect(store.markRead).toHaveBeenCalledWith(['1', '2'], true)
      expect(ElMessage.success).toHaveBeenCalledWith('已标记为已读')
    })

    it('应该能够批量删除', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      const batchDeleteButton = wrapper.find('button:contains("删除")')
      await batchDeleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除选中的 2 条通知吗？',
        '确认删除',
        { type: 'warning' }
      )
      expect(store.deleteNotifications).toHaveBeenCalledWith(['1', '2'])
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })
  })

  describe('分页功能', () => {
    it('应该渲染分页组件', () => {
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('应该能够切换页面大小', async () => {
      await wrapper.vm.handleSizeChange(50)
      
      expect(store.updatePagination).toHaveBeenCalledWith(1, 50)
      expect(store.fetchNotifications).toHaveBeenCalled()
    })

    it('应该能够切换页码', async () => {
      await wrapper.vm.handleCurrentChange(2)
      
      expect(store.updatePagination).toHaveBeenCalledWith(2)
      expect(store.fetchNotifications).toHaveBeenCalled()
    })
  })

  describe('通知详情对话框', () => {
    beforeEach(async () => {
      store.currentNotification = mockNotifications[1]
      await wrapper.setData({ detailDialogVisible: true })
    })

    it('应该显示通知详情', () => {
      expect(wrapper.find('.dialog').exists()).toBe(true)
      expect(wrapper.text()).toContain('订单异常提醒')
      expect(wrapper.text()).toContain('订单 #12345 支付超时')
    })

    it('应该显示通知操作按钮', () => {
      expect(wrapper.text()).toContain('查看订单')
    })

    it('应该能够执行通知操作', async () => {
      const actionButton = wrapper.find('button:contains("查看订单")')
      await actionButton.trigger('click')
      
      expect(ElMessage.info).toHaveBeenCalledWith('执行操作: 查看订单')
    })
  })

  describe('空状态', () => {
    it('应该在没有通知时显示空状态', async () => {
      store.notifications = []
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无通知')
    })
  })

  describe('加载状态', () => {
    it('应该在加载时显示加载状态', async () => {
      store.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.attributes('v-loading')).toBe('true')
    })

    it('应该在没有未读通知时禁用全部已读按钮', async () => {
      store.hasUnread = false
      await wrapper.vm.$nextTick()
      
      const markAllButton = wrapper.find('button:contains("全部已读")')
      expect(markAllButton.attributes('disabled')).toBe('true')
    })
  })

  describe('错误处理', () => {
    it('应该处理获取通知列表失败', async () => {
      store.fetchNotifications.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadNotifications()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加载通知列表失败')
    })

    it('应该处理获取通知详情失败', async () => {
      store.fetchNotificationDetail.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleNotificationClick(mockNotifications[0])
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取通知详情失败')
    })

    it('应该处理标记操作失败', async () => {
      store.markRead.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleToggleRead(mockNotifications[0])
      
      expect(ElMessage.error).toHaveBeenCalledWith('操作失败')
    })

    it('应该处理删除操作失败', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      store.deleteNotifications.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleDeleteSingle('1')
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除失败')
    })
  })

  describe('工具方法', () => {
    it('应该正确格式化通知类型标签', () => {
      expect(wrapper.vm.getTypeLabel('info')).toBe('信息')
      expect(wrapper.vm.getTypeLabel('success')).toBe('成功')
      expect(wrapper.vm.getTypeLabel('warning')).toBe('警告')
      expect(wrapper.vm.getTypeLabel('error')).toBe('错误')
    })

    it('应该正确格式化优先级标签', () => {
      expect(wrapper.vm.getPriorityLabel('low')).toBe('低')
      expect(wrapper.vm.getPriorityLabel('medium')).toBe('中')
      expect(wrapper.vm.getPriorityLabel('high')).toBe('高')
      expect(wrapper.vm.getPriorityLabel('urgent')).toBe('紧急')
    })

    it('应该正确格式化分类标签', () => {
      expect(wrapper.vm.getCategoryLabel('system')).toBe('系统')
      expect(wrapper.vm.getCategoryLabel('order')).toBe('订单')
      expect(wrapper.vm.getCategoryLabel('inventory')).toBe('库存')
      expect(wrapper.vm.getCategoryLabel('logistics')).toBe('物流')
      expect(wrapper.vm.getCategoryLabel('platform')).toBe('平台')
    })

    it('应该正确获取通知类型标签类型', () => {
      expect(wrapper.vm.getTypeTagType('info')).toBe('info')
      expect(wrapper.vm.getTypeTagType('success')).toBe('success')
      expect(wrapper.vm.getTypeTagType('warning')).toBe('warning')
      expect(wrapper.vm.getTypeTagType('error')).toBe('danger')
    })

    it('应该正确获取优先级标签类型', () => {
      expect(wrapper.vm.getPriorityTagType('low')).toBe('info')
      expect(wrapper.vm.getPriorityTagType('medium')).toBe('warning')
      expect(wrapper.vm.getPriorityTagType('high')).toBe('danger')
      expect(wrapper.vm.getPriorityTagType('urgent')).toBe('danger')
    })

    it('应该正确格式化时间', () => {
      expect(wrapper.vm.formatTime('2024-01-15T10:00:00Z')).toBe('2小时前')
    })

    it('应该正确获取通知对象', () => {
      const notification = wrapper.vm.getNotificationById('1')
      expect(notification).toBeDefined()
      expect(notification?.title).toBe('系统维护通知')
      
      const nonExistent = wrapper.vm.getNotificationById('999')
      expect(nonExistent).toBeUndefined()
    })
  })
})