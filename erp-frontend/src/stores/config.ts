/**
 * Pinia 状态管理配置
 * 提供状态管理的全局配置和初始化功能
 */

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { App } from 'vue'
import type { 
  StoreOptions, 
  StateSyncConfig, 
  StateDebugConfig,
  StateMigrationConfig,
  DEFAULT_SYNC_CONFIG,
  DEFAULT_DEBUG_CONFIG
} from './types'

// 全局状态管理配置
export interface StoreGlobalConfig {
  // 持久化配置
  persistence: {
    enabled: boolean
    storage: Storage
    prefix: string
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
  
  // 同步配置
  sync: StateSyncConfig
  
  // 调试配置
  debug: StateDebugConfig
  
  // 迁移配置
  migration: StateMigrationConfig
  
  // 开发工具配置
  devtools: {
    enabled: boolean
    logStoreChanges: boolean
    logActions: boolean
  }
}

// 默认全局配置
const defaultGlobalConfig: StoreGlobalConfig = {
  persistence: {
    enabled: true,
    storage: localStorage,
    prefix: 'erp-store',
    serialize: JSON.stringify,
    deserialize: JSON.parse
  },
  
  sync: {
    enabled: false,
    interval: 30000,
    retryCount: 3,
    retryDelay: 1000,
    syncOnMount: true,
    syncOnFocus: true
  },
  
  debug: {
    enabled: import.meta.env.DEV,
    logActions: true,
    logMutations: true,
    logSubscriptions: false,
    maxLogEntries: 100
  },
  
  migration: {
    version: 1,
    migrations: {}
  },
  
  devtools: {
    enabled: import.meta.env.DEV,
    logStoreChanges: true,
    logActions: true
  }
}

// 全局配置实例
let globalConfig: StoreGlobalConfig = { ...defaultGlobalConfig }

/**
 * 设置全局状态管理配置
 * @param config 配置对象
 */
export function setStoreGlobalConfig(config: Partial<StoreGlobalConfig>) {
  globalConfig = {
    ...globalConfig,
    ...config,
    persistence: { ...globalConfig.persistence, ...config.persistence },
    sync: { ...globalConfig.sync, ...config.sync },
    debug: { ...globalConfig.debug, ...config.debug },
    migration: { ...globalConfig.migration, ...config.migration },
    devtools: { ...globalConfig.devtools, ...config.devtools }
  }
}

/**
 * 获取全局状态管理配置
 * @returns 全局配置对象
 */
export function getStoreGlobalConfig(): StoreGlobalConfig {
  return { ...globalConfig }
}

/**
 * 创建并配置 Pinia 实例
 * @param app Vue 应用实例
 * @param config 可选的配置覆盖
 */
export function setupStore(app: App, config?: Partial<StoreGlobalConfig>) {
  // 应用配置覆盖
  if (config) {
    setStoreGlobalConfig(config)
  }

  // 创建 Pinia 实例
  const pinia = createPinia()

  // 配置持久化插件
  if (globalConfig.persistence.enabled) {
    pinia.use(piniaPluginPersistedstate)
  }

  // 配置开发工具
  if (globalConfig.devtools.enabled && import.meta.env.DEV) {
    // 添加状态变更日志
    pinia.use(({ store, options }) => {
      if (globalConfig.devtools.logStoreChanges) {
        store.$subscribe((mutation, state) => {
          console.log(`[${store.$id}] State changed:`, {
            type: mutation.type,
            storeId: mutation.storeId,
            state: { ...state }
          })
        })
      }

      if (globalConfig.devtools.logActions) {
        store.$onAction(({ name, store, args, after, onError }) => {
          const startTime = Date.now()
          console.log(`[${store.$id}] Action "${name}" started with args:`, args)

          after((result) => {
            const duration = Date.now() - startTime
            console.log(`[${store.$id}] Action "${name}" completed in ${duration}ms with result:`, result)
          })

          onError((error) => {
            const duration = Date.now() - startTime
            console.error(`[${store.$id}] Action "${name}" failed after ${duration}ms:`, error)
          })
        })
      }
    })
  }

  // 配置状态迁移
  if (globalConfig.migration.version > 1) {
    pinia.use(({ store, options }) => {
      // 检查是否需要迁移
      const persistKey = (typeof options.persist === 'object' && options.persist?.key) || `${globalConfig.persistence.prefix}-${store.$id}`
      const storedData = globalConfig.persistence.storage.getItem(persistKey)
      
      if (storedData) {
        try {
          const parsed = globalConfig.persistence.deserialize(storedData)
          const storedVersion = parsed.__version || 1
          
          if (storedVersion < globalConfig.migration.version) {
            console.log(`[${store.$id}] Migrating state from version ${storedVersion} to ${globalConfig.migration.version}`)
            
            let migratedState = parsed
            for (let version = storedVersion; version < globalConfig.migration.version; version++) {
              const migration = globalConfig.migration.migrations[version + 1]
              if (migration) {
                migratedState = migration(migratedState)
              }
            }
            
            // 添加版本标记
            migratedState.__version = globalConfig.migration.version
            
            // 保存迁移后的状态
            const serialized = globalConfig.persistence.serialize(migratedState)
            globalConfig.persistence.storage.setItem(persistKey, serialized)
            
            console.log(`[${store.$id}] State migration completed`)
          }
        } catch (error) {
          console.error(`[${store.$id}] State migration failed:`, error)
        }
      }
    })
  }

  // 安装到 Vue 应用
  app.use(pinia)

  return pinia
}

/**
 * 创建存储选项
 * @param storeId 存储ID
 * @param options 选项覆盖
 */
export function createStoreOptions(
  storeId: string,
  options: Partial<StoreOptions> = {}
): StoreOptions {
  const config = getStoreGlobalConfig()
  
  return {
    persist: options.persist !== undefined ? options.persist : {
      key: `${config.persistence.prefix}-${storeId}`,
      storage: config.persistence.storage
    },
    
    sync: {
      ...config.sync,
      ...options.sync
    },
    
    validation: options.validation || [],
    
    migration: {
      ...config.migration,
      ...options.migration
    },
    
    debug: {
      ...config.debug,
      ...options.debug
    }
  }
}

/**
 * 状态管理工具类
 */
export class StoreManager {
  private static instance: StoreManager
  private stores: Map<string, any> = new Map()
  private syncTimers: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): StoreManager {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager()
    }
    return StoreManager.instance
  }

  /**
   * 注册存储
   * @param storeId 存储ID
   * @param store 存储实例
   */
  registerStore(storeId: string, store: any) {
    this.stores.set(storeId, store)
    
    // 如果启用了同步，设置同步定时器
    const config = getStoreGlobalConfig()
    if (config.sync.enabled && store.sync) {
      const timer = setInterval(() => {
        store.sync().catch((error: any) => {
          console.error(`[${storeId}] Sync failed:`, error)
        })
      }, config.sync.interval)
      
      this.syncTimers.set(storeId, timer)
    }
  }

  /**
   * 获取存储
   * @param storeId 存储ID
   */
  getStore(storeId: string) {
    return this.stores.get(storeId)
  }

  /**
   * 获取所有存储
   */
  getAllStores() {
    return Array.from(this.stores.values())
  }

  /**
   * 清除所有存储的持久化数据
   */
  clearAllPersistedData() {
    const config = getStoreGlobalConfig()
    const storage = config.persistence.storage
    const prefix = config.persistence.prefix
    
    // 获取所有相关的存储键
    const keys: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key)
      }
    }
    
    // 清除所有相关数据
    keys.forEach(key => storage.removeItem(key))
    
    console.log(`Cleared ${keys.length} persisted store entries`)
  }

  /**
   * 重置所有存储状态
   */
  resetAllStores() {
    this.stores.forEach((store, storeId) => {
      if (store.$reset) {
        store.$reset()
        console.log(`[${storeId}] State reset`)
      }
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    // 清除所有同步定时器
    this.syncTimers.forEach((timer) => {
      clearInterval(timer)
    })
    this.syncTimers.clear()
    
    // 清除存储引用
    this.stores.clear()
  }
}

/**
 * 获取存储管理器实例
 */
export const storeManager = StoreManager.getInstance()

/**
 * 状态管理初始化函数
 * @param app Vue 应用实例
 * @param config 可选配置
 */
export function initializeStores(app: App, config?: Partial<StoreGlobalConfig>) {
  // 设置 Pinia
  const pinia = setupStore(app, config)
  
  // 监听页面可见性变化，进行状态同步
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && globalConfig.sync.syncOnFocus) {
        storeManager.getAllStores().forEach((store) => {
          if (store.sync) {
            store.sync().catch((error: any) => {
              console.error('Focus sync failed:', error)
            })
          }
        })
      }
    })
  }

  return pinia
}

// 导出默认配置常量
export { defaultGlobalConfig }