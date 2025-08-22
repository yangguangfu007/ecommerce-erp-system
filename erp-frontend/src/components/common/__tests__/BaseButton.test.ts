import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('渲染基础按钮', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: '点击按钮'
      }
    })
    
    expect(wrapper.find('.btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('点击按钮')
    expect(wrapper.classes()).toContain('btn-secondary') // 默认类型
  })

  it('支持不同按钮类型', () => {
    const wrapper = mount(BaseButton, {
      props: {
        type: 'primary'
      },
      slots: {
        default: '主要按钮'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('支持不同按钮尺寸', () => {
    const wrapper = mount(BaseButton, {
      props: {
        size: 'large'
      },
      slots: {
        default: '大按钮'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-large')
  })

  it('支持禁用状态', () => {
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true
      },
      slots: {
        default: '禁用按钮'
      }
    })
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('btn-disabled')
  })

  it('支持加载状态', () => {
    const wrapper = mount(BaseButton, {
      props: {
        loading: true
      },
      slots: {
        default: '加载按钮'
      }
    })
    
    expect(wrapper.find('.btn-loading-icon').exists()).toBe(true)
    expect(wrapper.classes()).toContain('btn-loading')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('支持图标', () => {
    const wrapper = mount(BaseButton, {
      props: {
        icon: 'fas fa-plus'
      },
      slots: {
        default: '添加'
      }
    })
    
    expect(wrapper.find('.btn-icon').exists()).toBe(true)
    expect(wrapper.find('.btn-icon').classes()).toContain('fas')
    expect(wrapper.find('.btn-icon').classes()).toContain('fa-plus')
  })

  it('处理点击事件', async () => {
    const handleClick = vi.fn()
    const wrapper = mount(BaseButton, {
      props: {
        onClick: handleClick
      },
      slots: {
        default: '点击我'
      }
    })
    
    await wrapper.find('button').trigger('click')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态下不触发点击事件', async () => {
    const handleClick = vi.fn()
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true,
        onClick: handleClick
      },
      slots: {
        default: '禁用按钮'
      }
    })
    
    await wrapper.find('button').trigger('click')
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('加载状态下不触发点击事件', async () => {
    const handleClick = vi.fn()
    const wrapper = mount(BaseButton, {
      props: {
        loading: true,
        onClick: handleClick
      },
      slots: {
        default: '加载按钮'
      }
    })
    
    await wrapper.find('button').trigger('click')
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('支持原生按钮类型', () => {
    const wrapper = mount(BaseButton, {
      props: {
        nativeType: 'submit'
      },
      slots: {
        default: '提交'
      }
    })
    
    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })

  it('支持圆角按钮', () => {
    const wrapper = mount(BaseButton, {
      props: {
        round: true
      },
      slots: {
        default: '圆角按钮'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-round')
  })

  it('支持圆形按钮', () => {
    const wrapper = mount(BaseButton, {
      props: {
        circle: true,
        icon: 'fas fa-plus'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-circle')
  })

  it('加载状态时隐藏图标显示加载图标', () => {
    const wrapper = mount(BaseButton, {
      props: {
        loading: true,
        icon: 'fas fa-plus'
      },
      slots: {
        default: '加载中'
      }
    })
    
    expect(wrapper.find('.btn-loading-icon').exists()).toBe(true)
    expect(wrapper.find('.btn-icon').exists()).toBe(false)
  })
})