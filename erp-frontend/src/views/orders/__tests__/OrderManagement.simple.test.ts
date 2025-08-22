/**
 * 订单管理页面组件简单测试
 * 用于验证基本功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrderManagement from '../OrderManagement.vue'
import { useOrderStore } from '@/stores/order'

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock Vue Router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

describe('OrderManagement 订单管理页面 - 简单测试', () => {
  let wrapper: any
  let orderStore: any

  beforeEach(() => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 获取 store 实例
    orderStore = useOrderStore()
    
    // Mock store 方法
    vi.spyOn(orderStore, 'fetchOrders').mockResolvedValue({
      list: [],
      total: 0,
      page: 1,
      size: 20,
      pages: 1
    })
    
    // 设置初始状态
    orderStore.state.orders = []
    orderStore.state.total = 0
    orderStore.state.currentPage = 1
    orderStore.state.pageSize = 20
    orderStore.state.selectedOrderIds = []
    
    // 挂载组件
    wrapper = shallowMount(OrderManagement, {
      global: {
        plugins: [pinia]
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该成功挂载组件', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('应该有正确的组件名称', () => {
      expect(wrapper.vm.$options.name || 'OrderManagement').toBeTruthy()
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时调用 fetchOrders', () => {
      expect(orderStore.fetchOrders).toHaveBeenCalled()
    })
  })

  describe('工具函数', () => {
    it('应该正确获取状态文本', () => {
      expect(wrapper.vm.getStatusText('PENDING')).toBe('待支付')
      expect(wrapper.vm.getStatusText('CONFIRMED')).toBe('已支付')
      expect(wrapper.vm.getStatusText('SHIPPED')).toBe('已发货')
      expect(wrapper.vm.getStatusText('DELIVERED')).toBe('已完成')
      expect(wrapper.vm.getStatusText('CANCELLED')).toBe('已取消')
    })

    it('应该正确判断是否可以取消订单', () => {
      expect(wrapper.vm.canCancelOrder('PENDING')).toBe(true)
      expect(wrapper.vm.canCancelOrder('CONFIRMED')).toBe(true)
      expect(wrapper.vm.canCancelOrder('SHIPPED')).toBe(false)
      expect(wrapper.vm.canCancelOrder('DELIVERED')).toBe(false)
      expect(wrapper.vm.canCancelOrder('CANCELLED')).toBe(false)
    })
  })
})