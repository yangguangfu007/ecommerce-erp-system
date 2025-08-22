import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '../StatusBadge.vue'

describe('StatusBadge', () => {
  it('应该正确渲染基本状态徽章', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        type: 'general'
      }
    })

    expect(wrapper.find('.status-badge').exists()).toBe(true)
    expect(wrapper.find('.status-active').exists()).toBe(true)
    expect(wrapper.text()).toContain('启用')
  })

  it('应该支持自定义文本', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'custom',
        text: '自定义状态'
      }
    })

    expect(wrapper.text()).toContain('自定义状态')
  })

  it('应该正确处理订单状态', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'pending',
        type: 'order'
      }
    })

    expect(wrapper.find('.status-pending').exists()).toBe(true)
    expect(wrapper.text()).toContain('待支付')
  })

  it('应该正确处理库存状态', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'low',
        type: 'inventory'
      }
    })

    expect(wrapper.find('.status-low').exists()).toBe(true)
    expect(wrapper.text()).toContain('偏低')
  })

  it('应该支持显示图标', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'success',
        type: 'general',
        showIcon: true
      }
    })

    expect(wrapper.find('.status-icon').exists()).toBe(true)
  })

  it('应该支持不同尺寸', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        size: 'large'
      }
    })

    expect(wrapper.find('.status-badge-large').exists()).toBe(true)
  })

  it('应该正确处理用户状态', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'inactive',
        type: 'user'
      }
    })

    expect(wrapper.find('.status-inactive').exists()).toBe(true)
    expect(wrapper.text()).toContain('禁用')
  })

  it('应该正确处理平台状态', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'connected',
        type: 'platform'
      }
    })

    expect(wrapper.find('.status-connected').exists()).toBe(true)
    expect(wrapper.text()).toContain('已连接')
  })

  it('应该正确处理物流状态', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'shipped',
        type: 'logistics'
      }
    })

    expect(wrapper.find('.status-shipped').exists()).toBe(true)
    expect(wrapper.text()).toContain('已发货')
  })

  it('应该支持title属性', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        title: '状态提示'
      }
    })

    expect(wrapper.attributes('title')).toBe('状态提示')
  })

  it('应该正确处理下划线状态名', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'outOfStock',
        type: 'inventory'
      }
    })

    expect(wrapper.find('.status-outofstock').exists()).toBe(true)
    expect(wrapper.text()).toContain('缺货')
  })

  it('应该正确处理驼峰状态名', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'inTransit',
        type: 'logistics'
      }
    })

    expect(wrapper.find('.status-intransit').exists()).toBe(true)
    expect(wrapper.text()).toContain('运输中')
  })
})