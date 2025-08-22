import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CellText from '../CellText.vue'

describe('CellText', () => {
  it('应该正确渲染文本值', () => {
    const wrapper = mount(CellText, {
      props: {
        value: '测试文本'
      }
    })
    
    expect(wrapper.text()).toBe('测试文本')
    expect(wrapper.find('.cell-text').exists()).toBe(true)
  })

  it('应该处理空值', () => {
    const wrapper = mount(CellText, {
      props: {
        value: null
      }
    })
    
    expect(wrapper.text()).toBe('-')
  })

  it('应该处理未定义值', () => {
    const wrapper = mount(CellText, {
      props: {
        value: undefined
      }
    })
    
    expect(wrapper.text()).toBe('-')
  })

  it('应该使用自定义格式化器', () => {
    const formatter = (value: any) => `格式化: ${value}`
    
    const wrapper = mount(CellText, {
      props: {
        value: '测试',
        column: { formatter }
      }
    })
    
    expect(wrapper.text()).toBe('格式化: 测试')
  })

  it('应该将非字符串值转换为字符串', () => {
    const wrapper = mount(CellText, {
      props: {
        value: 123
      }
    })
    
    expect(wrapper.text()).toBe('123')
  })

  it('应该设置正确的 title 属性', () => {
    const wrapper = mount(CellText, {
      props: {
        value: '长文本内容'
      }
    })
    
    const span = wrapper.find('.cell-text')
    expect(span.attributes('title')).toBe('长文本内容')
  })
})