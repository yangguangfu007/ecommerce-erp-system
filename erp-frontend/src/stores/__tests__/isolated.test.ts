/**
 * 隔离测试 - 不使用全局测试设置
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia, defineStore } from 'pinia'
import { ref, computed } from 'vue'

describe('隔离测试', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('应该能够创建简单的 Pinia store', () => {
    // 使用 options API 而不是 composition API
    const useTestStore = defineStore('isolated-test', {
      state: () => ({
        count: 0
      }),
      getters: {
        doubled: (state) => state.count * 2
      },
      actions: {
        increment() {
          this.count++
        }
      }
    })
    
    const store = useTestStore()
    
    // 基本检查
    expect(store).toBeDefined()
    expect(typeof store).toBe('object')
    
    // 检查值 - options API 不需要 .value
    expect(store.count).toBe(0)
    expect(store.doubled).toBe(0)
    
    // 测试方法
    store.increment()
    expect(store.count).toBe(1)
    expect(store.doubled).toBe(2)
  })
})