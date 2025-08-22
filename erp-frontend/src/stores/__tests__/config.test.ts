/**
 * Pinia 状态管理配置测试
 * 测试状态管理的全局配置和初始化功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import {
  setStoreGlobalConfig,
  getStoreGlobalConfig,
  setupStore,
  createStoreOptions,
  StoreManager,
  storeManager,
  initializeStores
} from '../config'
import type { StoreGlobalConfig } from '../config'

// Mock Vue app
const createMockApp = () => {
  const app = createApp({})
  app.use = vi.fn()
  return app
}

describe('Pinia 状态管理配置', () => {
  beforeEach(() => {
    // 重置全局配置到默认状态
    setStoreGlobalConfig({
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
    })
  })

  describe('全局配置管理', () => {
    it('应该能够设置全局配置', () => {
      const config: Partial<StoreGlobalConfig> = {
        persistence: {
          enabled: false,
          storage: sessionStorage,
          prefix: 'custom-store',
          serialize: JSON.stringify,
          deserialize: JSON.parse
        },
        debug: {
          enabled: false,
          logActions: false,
          logMutations: false,
          logSubscriptions: false,
          maxLogEntries: 50
        }
      }

      setStoreGlobalConfig(config)
      const globalConfig = getStoreGlobalConfig()

      expect(globalConfig.persistence.enabled).toBe(false)
      expect(globalConfig.persistence.storage).toBe(sessionStorage)
      expect(globalConfig.persistence.prefix).toBe('custom-store')
      expect(globalConfig.debug.enabled).toBe(false)
      expect(globalConfig.debug.maxLogEntries).toBe(50)
    })

    it('应该能够获取默认全局配置', () => {
      const config = getStoreGlobalConfig()

      expect(config.persistence).toBeDefined()
      expect(config.sync).toBeDefined()
      expect(config.debug).toBeDefined()
      expect(config.migration).toBeDefined()
      expect(config.devtools).toBeDefined()

      expect(config.persistence.enabled).toBe(true)
      expect(config.persistence.storage).toBe(localStorage)
      expect(config.persistence.prefix).toBe('erp-store')
    })

    it('应该能够部分更新配置', () => {
      const originalConfig = getStoreGlobalConfig()
      
      setStoreGlobalConfig({
        debug: {
          enabled: false,
          logActions: false,
          logMutations: true,
          logSubscriptions: true,
          maxLogEntries: 200
        }
      })

      const updatedConfig = getStoreGlobalConfig()

      // 验证只有 debug 配置被更新
      expect(updatedConfig.debug.enabled).toBe(false)
      expect(updatedConfig.debug.logActions).toBe(false)
      expect(updatedConfig.debug.logMutations).toBe(true)
      expect(updatedConfig.debug.maxLogEntries).toBe(200)

      // 验证其他配置保持不变
      expect(updatedConfig.persistence.enabled).toBe(originalConfig.persistence.enabled)
      expect(updatedConfig.sync.enabled).toBe(originalConfig.sync.enabled)
    })
  })

  describe('Pinia 实例设置', () => {
    it('应该能够创建和配置 Pinia 实例', () => {
      const app = createMockApp()
      
      const pinia = setupStore(app)

      expect(pinia).toBeDefined()
      expect(app.use).toHaveBeenCalledWith(pinia)
    })

    it('应该能够使用自定义配置创建 Pinia 实例', () => {
      const app = createMockApp()
      const customConfig: Partial<StoreGlobalConfig> = {
        persistence: {
          enabled: false,
          storage: sessionStorage,
          prefix: 'custom-store',
          serialize: JSON.stringify,
          deserialize: JSON.parse
        }
      }

      const pinia = setupStore(app, customConfig)

      expect(pinia).toBeDefined()
      expect(app.use).toHaveBeenCalledWith(pinia)

      const config = getStoreGlobalConfig()
      expect(config.persistence.enabled).toBe(false)
      expect(config.persistence.storage).toBe(sessionStorage)
      expect(config.persistence.prefix).toBe('custom-store')
    })
  })

  describe('存储选项创建', () => {
    it('应该能够创建默认存储选项', () => {
      const options = createStoreOptions('test-store')

      expect(options).toBeDefined()
      expect(options.persist).toBeDefined()
      expect(options.sync).toBeDefined()
      expect(options.validation).toEqual([])
      expect(options.migration).toBeDefined()
      expect(options.debug).toBeDefined()

      if (typeof options.persist === 'object' && options.persist) {
        expect(options.persist.key).toBe('erp-store-test-store')
      }
    })

    it('应该能够创建自定义存储选项', () => {
      const customOptions = {
        persist: {
          key: 'custom-key',
          storage: sessionStorage
        },
        validation: [
          { field: 'test', required: true }
        ]
      }

      const options = createStoreOptions('test-store', customOptions)

      expect(options.persist).toEqual(customOptions.persist)
      expect(options.validation).toEqual(customOptions.validation)
    })

    it('应该能够禁用持久化', () => {
      const options = createStoreOptions('test-store', { persist: false })

      expect(options.persist).toBe(false)
    })
  })

  describe('存储管理器', () => {
    let manager: StoreManager

    beforeEach(() => {
      manager = StoreManager.getInstance()
    })

    it('应该是单例模式', () => {
      const manager1 = StoreManager.getInstance()
      const manager2 = StoreManager.getInstance()

      expect(manager1).toBe(manager2)
    })

    it('应该能够注册存储', () => {
      const mockStore = {
        $id: 'test-store',
        state: { data: 'test' }
      }

      manager.registerStore('test-store', mockStore)

      const retrieved = manager.getStore('test-store')
      expect(retrieved).toBe(mockStore)
    })

    it('应该能够获取所有存储', () => {
      const store1 = { $id: 'store1', state: {} }
      const store2 = { $id: 'store2', state: {} }

      manager.registerStore('store1', store1)
      manager.registerStore('store2', store2)

      const allStores = manager.getAllStores()
      expect(allStores).toContain(store1)
      expect(allStores).toContain(store2)
    })

    it('应该能够重置所有存储', () => {
      const mockStore = {
        $id: 'test-store',
        $reset: vi.fn()
      }

      manager.registerStore('test-store', mockStore)
      manager.resetAllStores()

      expect(mockStore.$reset).toHaveBeenCalled()
    })

    it('应该能够销毁管理器', () => {
      const mockStore = { $id: 'test-store' }
      manager.registerStore('test-store', mockStore)

      manager.destroy()

      const allStores = manager.getAllStores()
      expect(allStores).toHaveLength(0)
    })
  })

  describe('状态管理初始化', () => {
    it('应该能够初始化状态管理', () => {
      const app = createMockApp()
      
      const pinia = initializeStores(app)

      expect(pinia).toBeDefined()
      expect(app.use).toHaveBeenCalledWith(pinia)
    })

    it('应该能够使用自定义配置初始化', () => {
      const app = createMockApp()
      const customConfig: Partial<StoreGlobalConfig> = {
        debug: {
          enabled: false,
          logActions: false,
          logMutations: false,
          logSubscriptions: false,
          maxLogEntries: 10
        }
      }

      const pinia = initializeStores(app, customConfig)

      expect(pinia).toBeDefined()
      
      const config = getStoreGlobalConfig()
      expect(config.debug.enabled).toBe(false)
      expect(config.debug.maxLogEntries).toBe(10)
    })
  })

  describe('全局存储管理器实例', () => {
    it('应该提供全局存储管理器实例', () => {
      expect(storeManager).toBeDefined()
      expect(storeManager).toBeInstanceOf(StoreManager)
    })

    it('应该与 StoreManager.getInstance() 返回相同实例', () => {
      const instance = StoreManager.getInstance()
      expect(storeManager).toBe(instance)
    })
  })

  describe('配置验证', () => {
    it('应该验证持久化配置', () => {
      const config = getStoreGlobalConfig()

      expect(config.persistence.serialize).toBeInstanceOf(Function)
      expect(config.persistence.deserialize).toBeInstanceOf(Function)
      expect(typeof config.persistence.prefix).toBe('string')
      expect(typeof config.persistence.enabled).toBe('boolean')
    })

    it('应该验证同步配置', () => {
      const config = getStoreGlobalConfig()

      expect(typeof config.sync.enabled).toBe('boolean')
      expect(typeof config.sync.interval).toBe('number')
      expect(typeof config.sync.retryCount).toBe('number')
      expect(typeof config.sync.retryDelay).toBe('number')
      expect(typeof config.sync.syncOnMount).toBe('boolean')
      expect(typeof config.sync.syncOnFocus).toBe('boolean')
    })

    it('应该验证调试配置', () => {
      const config = getStoreGlobalConfig()

      expect(typeof config.debug.enabled).toBe('boolean')
      expect(typeof config.debug.logActions).toBe('boolean')
      expect(typeof config.debug.logMutations).toBe('boolean')
      expect(typeof config.debug.logSubscriptions).toBe('boolean')
      expect(typeof config.debug.maxLogEntries).toBe('number')
    })

    it('应该验证迁移配置', () => {
      const config = getStoreGlobalConfig()

      expect(typeof config.migration.version).toBe('number')
      expect(typeof config.migration.migrations).toBe('object')
    })

    it('应该验证开发工具配置', () => {
      const config = getStoreGlobalConfig()

      expect(typeof config.devtools.enabled).toBe('boolean')
      expect(typeof config.devtools.logStoreChanges).toBe('boolean')
      expect(typeof config.devtools.logActions).toBe('boolean')
    })
  })
})