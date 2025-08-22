import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '../BaseInput.vue'

describe('BaseInput', () => {
  it('渲染基础输入框', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'test value',
        placeholder: '请输入内容'
      }
    })
    
    const input = wrapper.find('.form-input')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('test value')
    expect(input.attributes('placeholder')).toBe('请输入内容')
  })

  it('支持标签和必填标识', () => {
    const wrapper = mount(BaseInput, {
      props: {
        label: '用户名',
        required: true
      }
    })
    
    const label = wrapper.find('.form-label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('用户名')
    expect(label.classes()).toContain('required')
  })

  it('支持不同输入框类型', () => {
    const wrapper = mount(BaseInput, {
      props: {
        type: 'email'
      }
    })
    
    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('支持密码类型和可见性切换', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        type: 'password',
        modelValue: 'password123'
      }
    })
    
    const input = wrapper.find('input')
    const toggle = wrapper.find('.password-toggle')
    
    expect(input.attributes('type')).toBe('password')
    expect(toggle.exists()).toBe(true)
    
    // 点击切换密码可见性
    await toggle.trigger('click')
    expect(input.attributes('type')).toBe('text')
    
    // 再次点击切换回密码类型
    await toggle.trigger('click')
    expect(input.attributes('type')).toBe('password')
  })

  it('支持前置和后置图标', () => {
    const wrapper = mount(BaseInput, {
      props: {
        prefixIcon: 'fas fa-user',
        suffixIcon: 'fas fa-search'
      }
    })
    
    expect(wrapper.find('.input-prefix-icon').exists()).toBe(true)
    expect(wrapper.find('.input-suffix-icon').exists()).toBe(true)
    expect(wrapper.find('.input-prefix-icon').classes()).toContain('fa-user')
    expect(wrapper.find('.input-suffix-icon').classes()).toContain('fa-search')
  })

  it('支持清除功能', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'test content',
        clearable: true
      }
    })
    
    const clearBtn = wrapper.find('.input-clear')
    expect(clearBtn.exists()).toBe(true)
    
    await clearBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('处理输入事件', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })
    
    const input = wrapper.find('input')
    await input.setValue('new value')
    
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    expect(wrapper.emitted('input')?.[0][0]).toBe('new value')
  })

  it('处理数字类型输入', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        type: 'number',
        modelValue: 0
      }
    })
    
    const input = wrapper.find('input')
    await input.setValue('123')
    
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([123])
  })

  it('支持禁用状态', () => {
    const wrapper = mount(BaseInput, {
      props: {
        disabled: true
      }
    })
    
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.form-group').classes()).toContain('disabled')
  })

  it('支持只读状态', () => {
    const wrapper = mount(BaseInput, {
      props: {
        readonly: true
      }
    })
    
    const input = wrapper.find('input')
    expect(input.attributes('readonly')).toBeDefined()
    expect(wrapper.find('.form-group').classes()).toContain('readonly')
  })

  it('支持验证状态', () => {
    const wrapper = mount(BaseInput, {
      props: {
        validateStatus: 'error',
        errorMessage: '输入格式错误'
      }
    })
    
    expect(wrapper.find('.form-group').classes()).toContain('error')
    expect(wrapper.find('.form-input').classes()).toContain('error')
    expect(wrapper.find('.form-error').exists()).toBe(true)
    expect(wrapper.find('.form-error').text()).toBe('输入格式错误')
  })

  it('支持帮助文本', () => {
    const wrapper = mount(BaseInput, {
      props: {
        helpText: '请输入6-20位字符'
      }
    })
    
    const helpText = wrapper.find('.form-help')
    expect(helpText.exists()).toBe(true)
    expect(helpText.text()).toBe('请输入6-20位字符')
  })

  it('支持最大最小长度限制', () => {
    const wrapper = mount(BaseInput, {
      props: {
        maxlength: 10,
        minlength: 3
      }
    })
    
    const input = wrapper.find('input')
    expect(input.attributes('maxlength')).toBe('10')
    expect(input.attributes('minlength')).toBe('3')
  })

  it('处理焦点和失焦事件', async () => {
    const wrapper = mount(BaseInput)
    const input = wrapper.find('input')
    
    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
    
    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('处理键盘事件', async () => {
    const wrapper = mount(BaseInput)
    const input = wrapper.find('input')
    
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('暴露焦点方法', () => {
    const wrapper = mount(BaseInput)
    const vm = wrapper.vm as any
    
    expect(typeof vm.focus).toBe('function')
    expect(typeof vm.blur).toBe('function')
    expect(typeof vm.select).toBe('function')
  })

  it('清除按钮在有值且可清除时显示', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'test',
        clearable: true
      }
    })
    
    expect(wrapper.find('.input-clear').exists()).toBe(true)
  })

  it('清除按钮在无值时不显示', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        clearable: true
      }
    })
    
    expect(wrapper.find('.input-clear').exists()).toBe(false)
  })

  it('清除按钮在禁用状态下不显示', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'test',
        clearable: true,
        disabled: true
      }
    })
    
    expect(wrapper.find('.input-clear').exists()).toBe(false)
  })
})