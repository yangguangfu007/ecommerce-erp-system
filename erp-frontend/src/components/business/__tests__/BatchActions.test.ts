import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElCheckbox, ElDialog, ElIcon, ElProgress, ElCollapse, ElCollapseItem } from 'element-plus'
import BatchActions from '../BatchActions.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElCheckbox: { name: 'ElCheckbox', template: '<input type="checkbox" />' },
  ElDialog: { name: 'ElDialog', template: '<div><slot /></div>' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' },
  ElProgress: { name: 'ElProgress', template: '<div class="progress" />' },
  ElCollapse: { name: 'ElCollapse', template: '<div><slot /></div>' },
  ElCollapseItem: { name: 'ElCollapseItem', template: '<div><slot /></div>' },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

describe('BatchActions', () => {
  const mockActions = [
    {
      key: 'delete',
      label: '删除',
      type: 'danger' as const,
      confirmMessage: '确定要删除选中的项目吗？'
    },
    {
      key: 'export',
      label: '导出',
      type: 'primary' as const
    }
  ]

  it('应该正确渲染批量操作组件', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    expect(wrapper.find('.batch-actions').exists()).toBe(true)
  })

  it('应该在没有选中项时隐藏操作栏', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    const actionBar = wrapper.find('.batch-action-bar')
    expect(actionBar.classes()).not.toContain('batch-action-bar-visible')
  })

  it('应该在有选中项时显示操作栏', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    const actionBar = wrapper.find('.batch-action-bar')
    expect(actionBar.classes()).toContain('batch-action-bar-visible')
  })

  it('应该正确显示选中数量', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    expect(wrapper.text()).toContain('已选择 3 项')
  })

  it('应该正确计算全选状态', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    expect(wrapper.vm.isAllSelected).toBe(true)
  })

  it('应该正确计算半选状态', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    expect(wrapper.vm.isIndeterminate).toBe(true)
  })

  it('应该触发全选事件', async () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    await wrapper.vm.handleSelectAll(true)
    expect(wrapper.emitted('select-all')).toBeTruthy()
    expect(wrapper.emitted('select-all')[0]).toEqual([true])
  })

  it('应该触发清空选择事件', async () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    await wrapper.vm.handleClearSelection()
    expect(wrapper.emitted('clear-selection')).toBeTruthy()
  })

  it('应该显示确认对话框', async () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    await wrapper.vm.handleAction(mockActions[0])
    expect(wrapper.vm.confirmDialogVisible).toBe(true)
    expect(wrapper.vm.currentAction).toEqual(mockActions[0])
  })

  it('应该直接执行不需要确认的操作', async () => {
    const actionWithoutConfirm = {
      key: 'export',
      label: '导出',
      type: 'primary' as const
    }

    const wrapper = mount(BatchActions, {
      props: {
        actions: [actionWithoutConfirm],
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    const mockEmit = vi.fn()
    wrapper.vm.$emit = mockEmit

    await wrapper.vm.handleAction(actionWithoutConfirm)
    
    // 应该显示进度对话框
    expect(wrapper.vm.progressDialogVisible).toBe(true)
  })

  it('应该正确计算进度百分比', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3, 4, 5],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    wrapper.vm.processedCount = 2
    expect(wrapper.vm.progressPercentage).toBe(40) // 2/5 * 100
  })

  it('应该支持需要确认文本的操作', () => {
    const actionWithConfirmText = {
      key: 'delete',
      label: '删除',
      type: 'danger' as const,
      requireConfirmText: true,
      confirmText: 'DELETE'
    }

    const wrapper = mount(BatchActions, {
      props: {
        actions: [actionWithConfirmText],
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    wrapper.vm.currentAction = actionWithConfirmText
    wrapper.vm.confirmInputValue = 'DELETE'
    expect(wrapper.vm.canConfirm).toBe(true)

    wrapper.vm.confirmInputValue = 'wrong'
    expect(wrapper.vm.canConfirm).toBe(false)
  })

  it('应该正确处理错误', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    wrapper.vm.addError(1, '处理失败')
    expect(wrapper.vm.errors).toHaveLength(1)
    expect(wrapper.vm.errors[0]).toEqual({ id: 1, message: '处理失败' })
  })

  it('应该支持更新进度', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    wrapper.vm.updateProgress(2)
    expect(wrapper.vm.processedCount).toBe(2)
  })

  it('应该支持设置完成状态', () => {
    const wrapper = mount(BatchActions, {
      props: {
        actions: mockActions,
        selectedIds: [1, 2, 3],
        totalCount: 10
      },
      global: {
        components: {
          ElButton,
          ElCheckbox,
          ElDialog,
          ElIcon,
          ElProgress,
          ElCollapse,
          ElCollapseItem
        }
      }
    })

    wrapper.vm.setCompleted()
    expect(wrapper.vm.isCompleted).toBe(true)
  })
})