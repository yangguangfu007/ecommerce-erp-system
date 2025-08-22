import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '../BaseCard.vue'

describe('BaseCard', () => {
  it('渲染基础卡片', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<div class="card-content">卡片内容</div>'
      }
    })
    
    expect(wrapper.find('.base-card').exists()).toBe(true)
    expect(wrapper.find('.card-body').exists()).toBe(true)
    expect(wrapper.find('.card-content').exists()).toBe(true)
    expect(wrapper.find('.card-content').text()).toBe('卡片内容')
  })

  it('支持标题和副标题', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: '卡片标题',
        subtitle: '卡片副标题'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.find('.card-title').exists()).toBe(true)
    expect(wrapper.find('.card-subtitle').exists()).toBe(true)
    expect(wrapper.find('.card-title').text()).toBe('卡片标题')
    expect(wrapper.find('.card-subtitle').text()).toBe('卡片副标题')
  })

  it('支持自定义标题插槽', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        title: '<div class="custom-title">自定义标题</div>'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.find('.custom-title').exists()).toBe(true)
    expect(wrapper.find('.custom-title').text()).toBe('自定义标题')
  })

  it('支持额外内容插槽', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: '卡片标题'
      },
      slots: {
        extra: '<button class="extra-button">操作</button>'
      }
    })
    
    expect(wrapper.find('.card-extra').exists()).toBe(true)
    expect(wrapper.find('.extra-button').exists()).toBe(true)
    expect(wrapper.find('.extra-button').text()).toBe('操作')
  })

  it('支持底部插槽', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '卡片内容',
        footer: '<div class="card-actions">底部操作</div>'
      }
    })
    
    expect(wrapper.find('.card-footer').exists()).toBe(true)
    expect(wrapper.find('.card-actions').exists()).toBe(true)
    expect(wrapper.find('.card-actions').text()).toBe('底部操作')
  })

  it('支持隐藏头部', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: '标题',
        showHeader: false
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })

  it('支持不同尺寸', () => {
    const smallWrapper = mount(BaseCard, {
      props: {
        size: 'small'
      }
    })
    
    const largeWrapper = mount(BaseCard, {
      props: {
        size: 'large'
      }
    })
    
    expect(smallWrapper.find('.base-card').classes()).toContain('card-small')
    expect(largeWrapper.find('.base-card').classes()).toContain('card-large')
  })

  it('支持边框控制', () => {
    const borderedWrapper = mount(BaseCard, {
      props: {
        bordered: true
      }
    })
    
    const noBorderWrapper = mount(BaseCard, {
      props: {
        bordered: false
      }
    })
    
    expect(borderedWrapper.find('.base-card').classes()).toContain('card-bordered')
    expect(noBorderWrapper.find('.base-card').classes()).not.toContain('card-bordered')
  })

  it('支持不同阴影模式', () => {
    const hoverShadowWrapper = mount(BaseCard, {
      props: {
        shadow: 'hover'
      }
    })
    
    const neverShadowWrapper = mount(BaseCard, {
      props: {
        shadow: 'never'
      }
    })
    
    expect(hoverShadowWrapper.find('.base-card').classes()).toContain('card-shadow-hover')
    expect(neverShadowWrapper.find('.base-card').classes()).toContain('card-shadow-never')
  })

  it('支持可悬停效果', () => {
    const wrapper = mount(BaseCard, {
      props: {
        hoverable: true
      }
    })
    
    expect(wrapper.find('.base-card').classes()).toContain('card-hoverable')
  })

  it('支持加载状态', () => {
    const wrapper = mount(BaseCard, {
      props: {
        loading: true
      }
    })
    
    expect(wrapper.find('.base-card').classes()).toContain('card-loading')
  })

  it('支持自定义类名', () => {
    const wrapper = mount(BaseCard, {
      props: {
        customClass: 'my-custom-card'
      }
    })
    
    expect(wrapper.find('.base-card').classes()).toContain('my-custom-card')
  })

  it('支持内容区域无内边距', () => {
    const wrapper = mount(BaseCard, {
      props: {
        bodyNoPadding: true
      }
    })
    
    expect(wrapper.find('.card-body').classes()).toContain('no-padding')
  })

  it('默认显示头部', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: '标题'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
  })

  it('没有标题和插槽时不显示头部', () => {
    const wrapper = mount(BaseCard)
    
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })

  it('有标题插槽时显示头部', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        title: '插槽标题'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
  })

  it('有额外内容插槽时显示头部', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        extra: '额外内容'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
  })

  it('统计卡片样式', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: `
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">总用户数</div>
              <div class="stat-value">1,234</div>
              <div class="stat-trend">
                <span class="trend-up">+12%</span>
                <span class="trend-text">较上月</span>
              </div>
            </div>
          </div>
        `
      }
    })
    
    expect(wrapper.find('.stat-card').exists()).toBe(true)
    expect(wrapper.find('.stat-icon').exists()).toBe(true)
    expect(wrapper.find('.stat-content').exists()).toBe(true)
    expect(wrapper.find('.stat-title').exists()).toBe(true)
    expect(wrapper.find('.stat-value').exists()).toBe(true)
    expect(wrapper.find('.stat-trend').exists()).toBe(true)
  })
})