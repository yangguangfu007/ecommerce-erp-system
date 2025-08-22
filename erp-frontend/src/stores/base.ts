/**
 * Pinia 状态管理基础工具
 * 提供状态管理的通用功能和工具函数
 */

import { ref, computed, watch, nextTick } from 'vue'
import type { 
  BaseState, 
  StateAction, 
  StatePayload, 
  StoreOptions,
  StateUpdateCallback,
  StateSubscriptionOptions,
  StorageAdapter
} from './types'

/**
 * 创建基础状态
 * @returns 基础状态对象
 */
export function createBaseState(): BaseState {
  return {
    loading: false,
    error: null,
    lastUpdated: null
  }
}

/**
 * 创建基础状态管理功能
 * @param initialState 初始状态
 * @param options 配置选项
 */
export function useBaseStore<T extends BaseState>(
  initialState: T,
  options: StoreOptions = {}
) {
  // 状态
  const state = ref<T>({ ...initialState })
  
  // 计算属性
  const isLoading = computed(() => state.value.loading)
  const hasError = computed(() => !!state.value.error)
  const isStale = computed(() => {
    if (!state.value.lastUpdated) return true
    const now = Date.now()
    const staleTime = options.sync?.interval || 300000 // 5分钟
    return now - state.value.lastUpdated > staleTime
  })

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    state.value.loading = loading
    if (options.debug?.logMutations) {
      console.log(`[Store] setLoading: ${loading}`)
    }
  }

  // 设置错误信息
  const setError = (error: string | null) => {
    state.value.error = error
    if (options.debug?.logMutations) {
      console.log(`[Store] setError: ${error}`)
    }
  }

  // 清除错误
  const clearError = () => {
    state.value.error = null
    if (options.debug?.logMutations) {
      console.log('[Store] clearError')
    }
  }

  // 更新时间戳
  const updateTimestamp = () => {
    state.value.lastUpdated = Date.now()
    if (options.debug?.logMutations) {
      console.log(`[Store] updateTimestamp: ${state.value.lastUpdated}`)
    }
  }

  // 重置状态
  const resetState = () => {
    Object.assign(state.value, initialState)
    if (options.debug?.logMutations) {
      console.log('[Store] resetState')
    }
  }

  // 批量更新状态
  const patchState = (partialState: Partial<T>) => {
    Object.assign(state.value, partialState)
    updateTimestamp()
    if (options.debug?.logMutations) {
      console.log('[Store] patchState:', partialState)
    }
  }

  // 执行异步操作的包装器
  const withLoading = async <R>(
    operation: () => Promise<R>,
    errorHandler?: (error: any) => void
  ): Promise<R | null> => {
    try {
      setLoading(true)
      clearError()
      const result = await operation()
      updateTimestamp()
      return result
    } catch (error: any) {
      const errorMessage = error?.message || '操作失败'
      setError(errorMessage)
      
      if (errorHandler) {
        errorHandler(error)
      } else if (options.debug?.logActions) {
        console.error('[Store] Operation failed:', error)
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }

  // 状态订阅
  const subscribe = (
    callback: StateUpdateCallback,
    subscriptionOptions: StateSubscriptionOptions = {}
  ) => {
    return watch(
      state,
      (newState, oldState) => {
        callback(newState, oldState)
      },
      {
        immediate: subscriptionOptions.immediate || false,
        deep: subscriptionOptions.deep !== false,
        flush: subscriptionOptions.flush || 'post'
      }
    )
  }

  // 状态验证
  const validateState = (): boolean => {
    if (!options.validation) return true
    
    for (const rule of options.validation) {
      const value = (state.value as any)[rule.field]
      
      // 必填验证
      if (rule.required && (value === null || value === undefined || value === '')) {
        setError(`字段 ${rule.field} 是必填的`)
        return false
      }
      
      // 类型验证
      if (rule.type && value !== null && value !== undefined) {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== rule.type) {
          setError(`字段 ${rule.field} 类型错误，期望 ${rule.type}，实际 ${actualType}`)
          return false
        }
      }
      
      // 自定义验证
      if (rule.validator && value !== null && value !== undefined) {
        const result = rule.validator(value)
        if (result !== true) {
          setError(typeof result === 'string' ? result : `字段 ${rule.field} 验证失败`)
          return false
        }
      }
    }
    
    clearError()
    return true
  }

  return {
    // 状态
    state,
    
    // 计算属性
    isLoading,
    hasError,
    isStale,
    
    // 方法
    setLoading,
    setError,
    clearError,
    updateTimestamp,
    resetState,
    patchState,
    withLoading,
    subscribe,
    validateState
  }
}

/**
 * 创建状态持久化工具
 * @param key 存储键名
 * @param storage 存储适配器
 */
export function createPersistence(
  key: string,
  storage: StorageAdapter = localStorage
) {
  // 保存状态到存储
  const saveState = (state: any, paths?: string[]) => {
    try {
      let dataToSave = state
      
      // 如果指定了路径，只保存指定的字段
      if (paths && paths.length > 0) {
        dataToSave = {}
        for (const path of paths) {
          const keys = path.split('.')
          let source = state
          let target = dataToSave
          
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i]
            if (!(key in target)) {
              target[key] = {}
            }
            source = source[key]
            target = target[key]
          }
          
          const lastKey = keys[keys.length - 1]
          if (source && lastKey in source) {
            target[lastKey] = source[lastKey]
          }
        }
      }
      
      const serialized = JSON.stringify(dataToSave)
      storage.setItem(key, serialized)
    } catch (error) {
      console.error(`[Persistence] Failed to save state for key "${key}":`, error)
    }
  }

  // 从存储加载状态
  const loadState = (): any => {
    try {
      const serialized = storage.getItem(key)
      if (serialized) {
        return JSON.parse(serialized)
      }
    } catch (error) {
      console.error(`[Persistence] Failed to load state for key "${key}":`, error)
    }
    return null
  }

  // 清除存储的状态
  const clearState = () => {
    try {
      storage.removeItem(key)
    } catch (error) {
      console.error(`[Persistence] Failed to clear state for key "${key}":`, error)
    }
  }

  return {
    saveState,
    loadState,
    clearState
  }
}

/**
 * 创建状态同步工具
 * @param syncFn 同步函数
 * @param interval 同步间隔（毫秒）
 */
export function createStateSync(
  syncFn: () => Promise<void>,
  interval: number = 30000
) {
  let syncTimer: number | null = null
  let isDestroyed = false

  // 开始同步
  const startSync = () => {
    if (isDestroyed || syncTimer) return
    
    syncTimer = setInterval(async () => {
      try {
        await syncFn()
      } catch (error) {
        console.error('[StateSync] Sync failed:', error)
      }
    }, interval)
  }

  // 停止同步
  const stopSync = () => {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
    }
  }

  // 立即同步
  const syncNow = async () => {
    try {
      await syncFn()
    } catch (error) {
      console.error('[StateSync] Manual sync failed:', error)
      throw error
    }
  }

  // 销毁同步器
  const destroy = () => {
    stopSync()
    isDestroyed = true
  }

  return {
    startSync,
    stopSync,
    syncNow,
    destroy
  }
}

/**
 * 创建状态调试工具
 * @param storeName 存储名称
 * @param options 调试选项
 */
export function createStateDebugger(
  storeName: string,
  options: { logActions?: boolean; logMutations?: boolean; maxLogEntries?: number } = {}
) {
  const logs: Array<{ type: string; payload: any; timestamp: number }> = []
  const maxEntries = options.maxLogEntries || 100

  // 记录日志
  const log = (type: string, payload: any) => {
    const entry = {
      type,
      payload,
      timestamp: Date.now()
    }
    
    logs.push(entry)
    
    // 限制日志条数
    if (logs.length > maxEntries) {
      logs.shift()
    }
    
    // 控制台输出
    if (import.meta.env.DEV) {
      console.log(`[${storeName}] ${type}:`, payload)
    }
  }

  // 记录动作
  const logAction = (actionName: string, payload?: any) => {
    if (options.logActions !== false) {
      log('ACTION', { name: actionName, payload })
    }
  }

  // 记录状态变更
  const logMutation = (mutationName: string, payload?: any) => {
    if (options.logMutations !== false) {
      log('MUTATION', { name: mutationName, payload })
    }
  }

  // 获取日志历史
  const getLogHistory = () => [...logs]

  // 清除日志
  const clearLogs = () => {
    logs.length = 0
  }

  return {
    logAction,
    logMutation,
    getLogHistory,
    clearLogs
  }
}

/**
 * 防抖工具函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流工具函数
 * @param fn 要节流的函数
 * @param delay 延迟时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}