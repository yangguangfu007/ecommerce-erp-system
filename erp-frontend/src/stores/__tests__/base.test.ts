/**
 * Pinia 基础状态管理测试
 * 测试基础状态管理功能和工具函数
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  createBaseState,
  useBaseStore,
  createPersistence,
  createStateSync,
  createStateDebugger,
  debounce,
  throttle
} from '../base'
import type { BaseState, StoreOptions, StorageAdapter } from '../types'

// Mock 存储适配器
const createMockStorage = (): StorageAdapter => ({
  data: {} as Record<string, string>,
  getItem: vi.fn(function(this: any, key: string) {
    return this.data[key] || null
  }),
  setItem: vi.fn(function(this: any, key: string, value: string) {
    this.data[key] = value
  }),
  removeItem: vi.fn(function(this: any, key: string) {
    delete this.data[key]
  }),
  clear: vi.fn(function(this: any) {
    this.data = {}
  })
})

describe('基础状态管理', () => {
  describe('createBaseState', () => {
    it('应该创建默认的基础状态', () => {
      const state = createBaseState()
      
      expect(state).toEqual({
        loading: false,
        error: null,
        lastUpdated: null
      })
    })
  })

  describe('useBaseStore', () => {
    interface TestState extends BaseState {
      data: string
      count: number
    }

    let initialState: TestState
    let options: StoreOptions

    beforeEach(() => {
      initialState = {
        loading: false,
        error: null,
        lastUpdated: null,
        data: 'test',
        count: 0
      }

      options = {
        debug: {
          enabled: true,
          logActions: true,
          logMutations: true,
          logSubscriptions: false,
          maxLogEntries: 10
        }
      }
    })

    it('应该创建基础存储实例', () => {
      const store = useBaseStore(initialState, options)
      
      expect(store.state.value).toEqual(initialState)
      expect(store.isLoading.value).toBe(false)
      expect(store.hasError.value).toBe(false)
      expect(store.isStale.value).toBe(true)
    })

    it('应该能够设置加载状态', () => {
      const store = useBaseStore(initialState, options)
      
      store.setLoading(true)
      expect(store.state.value.loading).toBe(true)
      expect(store.isLoading.value).toBe(true)
      
      store.setLoading(false)
      expect(store.state.value.loading).toBe(false)
      expect(store.isLoading.value).toBe(false)
    })

    it('应该能够设置和清除错误', () => {
      const store = useBaseStore(initialState, options)
      
      store.setError('测试错误')
      expect(store.state.value.error).toBe('测试错误')
      expect(store.hasError.value).toBe(true)
      
      store.clearError()
      expect(store.state.value.error).toBe(null)
      expect(store.hasError.value).toBe(false)
    })

    it('应该能够更新时间戳', () => {
      const store = useBaseStore(initialState, options)
      const beforeTime = Date.now()
      
      store.updateTimestamp()
      
      const afterTime = Date.now()
      expect(store.state.value.lastUpdated).toBeGreaterThanOrEqual(beforeTime)
      expect(store.state.value.lastUpdated).toBeLessThanOrEqual(afterTime)
      expect(store.isStale.value).toBe(false)
    })

    it('应该能够重置状态', () => {
      const store = useBaseStore(initialState, options)
      
      // 修改状态
      store.setLoading(true)
      store.setError('错误')
      store.updateTimestamp()
      
      // 重置状态
      store.resetState()
      
      expect(store.state.value).toEqual(initialState)
    })

    it('应该能够批量更新状态', () => {
      const store = useBaseStore(initialState, options)
      const beforeTime = Date.now()
      
      store.patchState({
        data: '更新的数据',
        count: 10,
        loading: true
      })
      
      expect(store.state.value.data).toBe('更新的数据')
      expect(store.state.value.count).toBe(10)
      expect(store.state.value.loading).toBe(true)
      expect(store.state.value.lastUpdated).toBeGreaterThanOrEqual(beforeTime)
    })

    it('应该能够使用 withLoading 包装异步操作', async () => {
      const store = useBaseStore(initialState, options)
      
      const mockOperation = vi.fn().mockResolvedValue('成功结果')
      
      const result = await store.withLoading(mockOperation)
      
      expect(mockOperation).toHaveBeenCalled()
      expect(result).toBe('成功结果')
      expect(store.state.value.loading).toBe(false)
      expect(store.state.value.error).toBe(null)
      expect(store.state.value.lastUpdated).toBeTruthy()
    })

    it('应该能够处理异步操作错误', async () => {
      const store = useBaseStore(initialState, options)
      
      const mockOperation = vi.fn().mockRejectedValue(new Error('操作失败'))
      
      const result = await store.withLoading(mockOperation)
      
      expect(mockOperation).toHaveBeenCalled()
      expect(result).toBe(null)
      expect(store.state.value.loading).toBe(false)
      expect(store.state.value.error).toBe('操作失败')
    })

    it('应该能够使用自定义错误处理器', async () => {
      const store = useBaseStore(initialState, options)
      const errorHandler = vi.fn()
      
      const mockOperation = vi.fn().mockRejectedValue(new Error('操作失败'))
      
      await store.withLoading(mockOperation, errorHandler)
      
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
    })

    it('应该能够订阅状态变化', async () => {
      const store = useBaseStore(initialState, options)
      const callback = vi.fn()
      
      const unsubscribe = store.subscribe(callback)
      
      store.setLoading(true)
      await nextTick()
      
      expect(callback).toHaveBeenCalled()
      
      unsubscribe()
    })

    it('应该能够验证状态', () => {
      const validationOptions: StoreOptions = {
        validation: [
          { field: 'data', required: true, type: 'string' },
          { field: 'count', type: 'number' },
          { 
            field: 'count', 
            validator: (value) => value >= 0 || '计数不能为负数' 
          }
        ]
      }

      const store = useBaseStore(initialState, validationOptions)
      
      // 有效状态
      expect(store.validateState()).toBe(true)
      
      // 无效状态 - 必填字段为空
      store.patchState({ data: '' })
      expect(store.validateState()).toBe(false)
      expect(store.state.value.error).toContain('data')
      
      // 无效状态 - 类型错误
      store.patchState({ data: 'valid', count: 'invalid' as any })
      expect(store.validateState()).toBe(false)
      expect(store.state.value.error).toContain('count')
      
      // 无效状态 - 自定义验证失败
      store.patchState({ data: 'valid', count: -1 })
      expect(store.validateState()).toBe(false)
      expect(store.state.value.error).toBe('计数不能为负数')
    })
  })

  describe('createPersistence', () => {
    let mockStorage: StorageAdapter

    beforeEach(() => {
      mockStorage = createMockStorage()
    })

    it('应该能够保存状态到存储', () => {
      const persistence = createPersistence('test-key', mockStorage)
      const state = { data: 'test', count: 42 }
      
      persistence.saveState(state)
      
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(state)
      )
    })

    it('应该能够保存指定路径的状态', () => {
      const persistence = createPersistence('test-key', mockStorage)
      const state = { 
        data: 'test', 
        count: 42, 
        nested: { value: 'nested' },
        ignore: 'ignored'
      }
      
      persistence.saveState(state, ['data', 'nested.value'])
      
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({
          data: 'test',
          nested: { value: 'nested' }
        })
      )
    })

    it('应该能够从存储加载状态', () => {
      const persistence = createPersistence('test-key', mockStorage)
      const state = { data: 'test', count: 42 }
      
      mockStorage.setItem('test-key', JSON.stringify(state))
      
      const loaded = persistence.loadState()
      expect(loaded).toEqual(state)
    })

    it('应该处理加载不存在的状态', () => {
      const persistence = createPersistence('non-existent', mockStorage)
      
      const loaded = persistence.loadState()
      expect(loaded).toBe(null)
    })

    it('应该处理无效的 JSON 数据', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const persistence = createPersistence('test-key', mockStorage)
      
      mockStorage.setItem('test-key', 'invalid-json')
      
      const loaded = persistence.loadState()
      expect(loaded).toBe(null)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('应该能够清除存储的状态', () => {
      const persistence = createPersistence('test-key', mockStorage)
      
      persistence.clearState()
      
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test-key')
    })
  })

  describe('createStateSync', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该能够创建状态同步器', () => {
      const syncFn = vi.fn().mockResolvedValue(undefined)
      const sync = createStateSync(syncFn, 1000)
      
      expect(sync).toBeDefined()
      expect(sync.startSync).toBeInstanceOf(Function)
      expect(sync.stopSync).toBeInstanceOf(Function)
      expect(sync.syncNow).toBeInstanceOf(Function)
    })

    it('应该能够开始和停止同步', () => {
      const syncFn = vi.fn().mockResolvedValue(undefined)
      const sync = createStateSync(syncFn, 1000)
      
      sync.startSync()
      
      // 快进时间
      vi.advanceTimersByTime(1000)
      expect(syncFn).toHaveBeenCalledTimes(1)
      
      vi.advanceTimersByTime(1000)
      expect(syncFn).toHaveBeenCalledTimes(2)
      
      sync.stopSync()
      
      vi.advanceTimersByTime(1000)
      expect(syncFn).toHaveBeenCalledTimes(2) // 不应该再调用
    })

    it('应该能够立即同步', async () => {
      const syncFn = vi.fn().mockResolvedValue(undefined)
      const sync = createStateSync(syncFn, 1000)
      
      await sync.syncNow()
      
      expect(syncFn).toHaveBeenCalledTimes(1)
    })

    it('应该处理同步错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const syncFn = vi.fn().mockRejectedValue(new Error('同步失败'))
      const sync = createStateSync(syncFn, 1000)
      
      sync.startSync()
      vi.advanceTimersByTime(1000)
      
      // 验证同步函数被调用
      expect(syncFn).toHaveBeenCalled()
      
      sync.stopSync()
      consoleSpy.mockRestore()
    })

    it('应该能够销毁同步器', () => {
      const syncFn = vi.fn().mockResolvedValue(undefined)
      const sync = createStateSync(syncFn, 1000)
      
      sync.startSync()
      sync.destroy()
      
      vi.advanceTimersByTime(1000)
      expect(syncFn).not.toHaveBeenCalled()
    })
  })

  describe('createStateDebugger', () => {
    it('应该能够创建状态调试器', () => {
      const stateDebugger = createStateDebugger('test-store')
      
      expect(stateDebugger).toBeDefined()
      expect(stateDebugger.logAction).toBeInstanceOf(Function)
      expect(stateDebugger.logMutation).toBeInstanceOf(Function)
      expect(stateDebugger.getLogHistory).toBeInstanceOf(Function)
      expect(stateDebugger.clearLogs).toBeInstanceOf(Function)
    })

    it('应该能够记录动作日志', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const stateDebugger = createStateDebugger('test-store')
      
      stateDebugger.logAction('testAction', { param: 'value' })
      
      const history = stateDebugger.getLogHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('ACTION')
      expect(history[0].payload.name).toBe('testAction')
      expect(history[0].payload.payload).toEqual({ param: 'value' })
      
      consoleSpy.mockRestore()
    })

    it('应该能够记录状态变更日志', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const stateDebugger = createStateDebugger('test-store')
      
      stateDebugger.logMutation('setState', { newValue: 'test' })
      
      const history = stateDebugger.getLogHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('MUTATION')
      expect(history[0].payload.name).toBe('setState')
      
      consoleSpy.mockRestore()
    })

    it('应该限制日志条数', () => {
      const stateDebugger = createStateDebugger('test-store', { maxLogEntries: 2 })
      
      stateDebugger.logAction('action1')
      stateDebugger.logAction('action2')
      stateDebugger.logAction('action3')
      
      const history = stateDebugger.getLogHistory()
      expect(history).toHaveLength(2)
      expect(history[0].payload.name).toBe('action2')
      expect(history[1].payload.name).toBe('action3')
    })

    it('应该能够清除日志', () => {
      const stateDebugger = createStateDebugger('test-store')
      
      stateDebugger.logAction('action1')
      stateDebugger.logAction('action2')
      
      expect(stateDebugger.getLogHistory()).toHaveLength(2)
      
      stateDebugger.clearLogs()
      
      expect(stateDebugger.getLogHistory()).toHaveLength(0)
    })
  })

  describe('工具函数', () => {
    describe('debounce', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('应该能够防抖函数调用', () => {
        const fn = vi.fn()
        const debouncedFn = debounce(fn, 100)
        
        debouncedFn('arg1')
        debouncedFn('arg2')
        debouncedFn('arg3')
        
        expect(fn).not.toHaveBeenCalled()
        
        vi.advanceTimersByTime(100)
        
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith('arg3')
      })
    })

    describe('throttle', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('应该能够节流函数调用', () => {
        const fn = vi.fn()
        const throttledFn = throttle(fn, 100)
        
        throttledFn('arg1')
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith('arg1')
        
        throttledFn('arg2')
        expect(fn).toHaveBeenCalledTimes(1) // 仍然是 1 次
        
        vi.advanceTimersByTime(100)
        
        throttledFn('arg3')
        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenCalledWith('arg3')
      })
    })
  })
})