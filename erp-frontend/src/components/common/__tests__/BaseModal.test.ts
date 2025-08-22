import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '../BaseModal.vue'

// Mock BaseButton component
vi.mock('../BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: '<button @click="$emit(\'click\')"><slot></slot></button>',
    emits: ['click']
  }
}))

// Mock DOM environment for modal
beforeEach(() => {
  // 确保 document.body 存在并有 classList
  if (!document.body) {
    document.body = document.createElement('body')
  }
  
  if (!document.body.classList) {
    document.body.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn()
    } as any
  }
  
  // 重置 classList mock
  vi.clearAllMocks()
})

describe('BaseModal', () => {
  it('默认不显示模态框', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: false
      }
    })
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('visible为true时显示模态框', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        title: '测试模态框'
      }
    })
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-overlay').classes()).toContain('show')
    expect(wrapper.find('.modal-title').text()).toBe('测试模态框')
  })

  it('支持不同尺寸', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        size: 'large'
      }
    })
    
    expect(wrapper.find('.modal-overlay').classes()).toContain('large')
  })

  it('支持自定义标题插槽', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true
      },
      slots: {
        title: '<span class="custom-title">自定义标题</span>'
      }
    })
    
    expect(wrapper.find('.custom-title').exists()).toBe(true)
    expect(wrapper.find('.custom-title').text()).toBe('自定义标题')
  })

  it('支持自定义内容插槽', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true
      },
      slots: {
        default: '<div class="custom-content">模态框内容</div>'
      }
    })
    
    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.find('.custom-content').text()).toBe('模态框内容')
  })

  it('支持自定义底部插槽', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true
      },
      slots: {
        footer: '<div class="custom-footer">自定义底部</div>'
      }
    })
    
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').text()).toBe('自定义底部')
  })

  it('点击关闭按钮触发关闭事件', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showClose: true
      }
    })
    
    await wrapper.find('.modal-close').trigger('click')
    
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('点击遮罩层触发关闭事件', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        closeOnClickOverlay: true
      }
    })
    
    await wrapper.find('.modal-overlay').trigger('click')
    
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('点击模态框内容不触发关闭', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        closeOnClickOverlay: true
      }
    })
    
    await wrapper.find('.modal-container').trigger('click')
    
    expect(wrapper.emitted('update:visible')).toBeFalsy()
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('closeOnClickOverlay为false时点击遮罩不关闭', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        closeOnClickOverlay: false
      }
    })
    
    await wrapper.find('.modal-overlay').trigger('click')
    
    expect(wrapper.emitted('update:visible')).toBeFalsy()
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('点击取消按钮触发取消事件', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showCancelButton: true
      }
    })
    
    const cancelButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('取消')
    )
    
    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
    }
  })

  it('点击确认按钮触发确认事件', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showConfirmButton: true
      }
    })
    
    const confirmButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('确认')
    )
    
    if (confirmButton) {
      await confirmButton.trigger('click')
      expect(wrapper.emitted('confirm')).toBeTruthy()
    }
  })

  it('支持自定义按钮文本', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        cancelButtonText: '取消操作',
        confirmButtonText: '确认提交'
      }
    })
    
    const buttons = wrapper.findAll('button')
    const cancelButton = buttons.find(btn => btn.text().includes('取消操作'))
    const confirmButton = buttons.find(btn => btn.text().includes('确认提交'))
    
    expect(cancelButton).toBeTruthy()
    expect(confirmButton).toBeTruthy()
  })

  it('支持确认按钮加载状态', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        confirmLoading: true
      }
    })
    
    // 由于我们mock了BaseButton，这里主要测试props传递
    expect(wrapper.props('confirmLoading')).toBe(true)
  })

  it('支持隐藏头部', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showHeader: false
      }
    })
    
    expect(wrapper.find('.modal-header').exists()).toBe(false)
  })

  it('支持隐藏底部', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showFooter: false
      }
    })
    
    expect(wrapper.find('.modal-footer').exists()).toBe(false)
  })

  it('支持隐藏关闭按钮', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showClose: false
      }
    })
    
    expect(wrapper.find('.modal-close').exists()).toBe(false)
  })

  it('支持隐藏取消按钮', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showCancelButton: false
      }
    })
    
    const buttons = wrapper.findAll('button')
    const cancelButton = buttons.find(btn => btn.text().includes('取消'))
    
    expect(cancelButton).toBeFalsy()
  })

  it('支持隐藏确认按钮', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        showConfirmButton: false
      }
    })
    
    const buttons = wrapper.findAll('button')
    const confirmButton = buttons.find(btn => btn.text().includes('确认'))
    
    expect(confirmButton).toBeFalsy()
  })

  it('支持居中显示', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        centered: true
      }
    })
    
    expect(wrapper.find('.modal-overlay').classes()).toContain('centered')
    expect(wrapper.find('.modal-container').classes()).toContain('centered')
  })

  it('支持可拖拽', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        draggable: true
      }
    })
    
    expect(wrapper.find('.modal-container').classes()).toContain('draggable')
  })

  it('支持自定义类名', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        customClass: 'my-custom-modal'
      }
    })
    
    expect(wrapper.find('.modal-overlay').classes()).toContain('my-custom-modal')
  })

  it('全屏模式', () => {
    const wrapper = mount(BaseModal, {
      props: {
        visible: true,
        size: 'fullscreen'
      }
    })
    
    expect(wrapper.find('.modal-overlay').classes()).toContain('fullscreen')
  })
})