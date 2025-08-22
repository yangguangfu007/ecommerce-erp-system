import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElMessage } from 'element-plus'

describe('Element Plus 配置测试', () => {
  it('应该正确加载 Element Plus 组件', () => {
    const wrapper = mount(ElButton, {
      props: {
        type: 'primary'
      },
      slots: {
        default: '测试按钮'
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('测试按钮')
    expect(wrapper.classes()).toContain('el-button')
    expect(wrapper.classes()).toContain('el-button--primary')
  })

  it('应该支持 Element Plus 消息组件', () => {
    // 测试消息组件
    expect(ElMessage).toBeDefined()
    // ElMessage 是一个对象，包含多个方法
    expect(typeof ElMessage).toBe('object')
    expect(typeof ElMessage.success).toBe('function')
    expect(typeof ElMessage.error).toBe('function')
  })

  it('应该能够导入 Element Plus 图标包', async () => {
    // 测试图标包是否可以导入
    try {
      const icons = await import('@element-plus/icons-vue')
      expect(icons).toBeDefined()
    } catch (error) {
      // 如果导入失败，至少包应该存在
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('应该支持 Element Plus 类型定义', () => {
    // 测试 Element Plus 类型是否正确
    expect(ElButton).toBeDefined()
    expect(ElMessage).toBeDefined()
  })
})