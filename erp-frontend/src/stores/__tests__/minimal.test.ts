/**
 * 最小化测试 - 测试基本的 Vue 响应式和 Pinia
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia, defineStore } from 'pinia'
import { ref, computed } from 'vue'

describe('最小化测试', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('应该能够创建基本的 ref', () => {
    const count = ref(0)
    expect(count.value).toBe(0)
    
    count.value = 1
    expect(count.value).toBe(1)
  })

  it('应该能够创建基本的 computed', () => {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    
    expect(doubled.value).toBe(0)
    
    count.value = 5
    expect(doubled.value).toBe(10)
  })

  it('应该能够创建最简单的 Pinia store', () => {
    const useTestStore = defineStore('test', () => {
      const count = ref(0)
      const increment = () => {
        count.value++
      }
      
      return {
        count,
        increment
      }
    })
    
    const store = useTestStore()
    
    // 调试信息
    console.log('Store:', store)
    console.log('Store keys:', Object.keys(store))
    console.log('Count property:', store.count)
    console.log('Count type:', typeof store.count)
    
    expect(store).toBeDefined()
    expect(store.count).toBeDefined()
    expect(store.count.value).toBe(0)
    
    store.increment()
    expect(store.count.value).toBe(1)
  })

  it('应该能够创建带计算属性的 Pinia store', () => {
    const useTestStore = defineStore('test2', () => {
      const count = ref(0)
      const doubled = computed(() => count.value * 2)
      
      const increment = () => {
        count.value++
      }
      
      return {
        count,
        doubled,
        increment
      }
    })
    
    const store = useTestStore()
    
    expect(store.count.value).toBe(0)
    expect(store.doubled.value).toBe(0)
    
    store.increment()
    expect(store.count.value).toBe(1)
    expect(store.doubled.value).toBe(2)
  })
})