/**
 * 业务数据状态管理聚合器
 * 统一管理所有业务数据状态，提供统一的接口和缓存策略
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductStore } from './product'
import { useOrderStore } from './order'
import { useInventoryStore } from './inventory'
import { useNotificationStore } from './notification'
import { useBaseStore } from './base'

// 业务数据同步状态接口
interface BusinessSyncState {
  isInitialized: boolean
  lastSyncTime: number | null
  syncInProgress: boolean
  syncErrors: string[]
  autoSyncEnabled: boolean
  syncInterval: number // 自动同步间隔（毫秒）
}

// 业务数据统计接口
interface BusinessDataStats {
  totalProducts: number
  totalOrders: number
  totalInventoryItems: number
  unreadNotifications: number
  pendingOrders: number
  lowStockItems: number
  alertsCount: number
}

export const useBusinessStore = defineStore('business', () => {
  // 基础状态管理
  const baseStore = useBaseStore({
    loading: false,
    error: null,
    lastUpdated: null
  })

  // 获取各个业务数据 store
  const productStore = useProductStore()
  const orderStore = useOrderStore()
  const inventoryStore = useInventoryStore()
  const notificationStore = useNotificationStore()

  // 业务同步状态
  const syncState = ref<BusinessSyncState>({
    isInitialized: false,
    lastSyncTime: null,
    syncInProgress: false,
    syncErrors: [],
    autoSyncEnabled: false,
    syncInterval: 5 * 60 * 1000 // 5分钟
  })

  // 自动同步定时器
  let autoSyncTimer: number | null = null

  // 计算属性
  const isLoading = computed(() => {
    return baseStore.isLoading.value ||
           productStore.isLoading ||
           orderStore.isLoading ||
           inventoryStore.isLoading ||
           notificationStore.isLoading
  })

  const hasError = computed(() => {
    return baseStore.hasError.value ||
           productStore.hasError ||
           orderStore.hasError ||
           inventoryStore.hasError ||
           notificationStore.hasError
  })

  const errors = computed(() => {
    const allErrors: string[] = []
    
    if (baseStore.state.value.error) allErrors.push(baseStore.state.value.error)
    if (productStore.error) allErrors.push(productStore.error)
    if (orderStore.error) allErrors.push(orderStore.error)
    if (inventoryStore.error) allErrors.push(inventoryStore.error)
    if (notificationStore.error) allErrors.push(notificationStore.error)
    
    return allErrors.concat(syncState.value.syncErrors)
  })

  // 业务数据统计
  const businessStats = computed<BusinessDataStats>(() => ({
    totalProducts: productStore.state.total,
    totalOrders: orderStore.state.total,
    totalInventoryItems: inventoryStore.state.total,
    unreadNotifications: notificationStore.state.unreadCount,
    pendingOrders: orderStore.pendingOrdersCount,
    lowStockItems: inventoryStore.state.lowStockCount,
    alertsCount: inventoryStore.alertsCount
  }))

  // 是否需要刷新数据
  const needsRefresh = computed(() => {
    return productStore.needsRefresh ||
           orderStore.needsRefresh ||
           inventoryStore.needsRefresh ||
           notificationStore.needsRefresh
  })

  // 是否有同步任务在运行
  const hasSyncTaskRunning = computed(() => {
    return !!(syncState.value.syncInProgress ||
           orderStore.hasSyncTaskRunning ||
           inventoryStore.hasSyncTaskRunning)
  })

  // 初始化业务数据
  const initializeBusinessData = async (options: {
    loadProducts?: boolean
    loadOrders?: boolean
    loadInventory?: boolean
    loadNotifications?: boolean
    enableAutoSync?: boolean
  } = {}) => {
    const {
      loadProducts = true,
      loadOrders = true,
      loadInventory = true,
      loadNotifications = true,
      enableAutoSync: shouldEnableAutoSync = false
    } = options

    return await baseStore.withLoading(async () => {
      syncState.value.syncInProgress = true
      syncState.value.syncErrors = []

      try {
        const promises: Promise<any>[] = []

        // 并行加载各模块数据
        if (loadProducts) {
          promises.push(
            productStore.fetchProducts().catch(error => {
              syncState.value.syncErrors.push(`商品数据加载失败: ${error.message}`)
            })
          )
          promises.push(
            productStore.fetchCategories().catch(error => {
              syncState.value.syncErrors.push(`分类数据加载失败: ${error.message}`)
            })
          )
        }

        if (loadOrders) {
          promises.push(
            orderStore.fetchOrders().catch(error => {
              syncState.value.syncErrors.push(`订单数据加载失败: ${error.message}`)
            })
          )
        }

        if (loadInventory) {
          promises.push(
            inventoryStore.fetchInventories().catch(error => {
              syncState.value.syncErrors.push(`库存数据加载失败: ${error.message}`)
            })
          )
          promises.push(
            inventoryStore.fetchCurrentAlerts().catch(error => {
              syncState.value.syncErrors.push(`库存预警加载失败: ${error.message}`)
            })
          )
        }

        if (loadNotifications) {
          promises.push(
            notificationStore.fetchNotifications().catch(error => {
              syncState.value.syncErrors.push(`通知数据加载失败: ${error.message}`)
            })
          )
          promises.push(
            notificationStore.fetchUnreadNotifications().catch(error => {
              syncState.value.syncErrors.push(`未读通知加载失败: ${error.message}`)
            })
          )
        }

        // 等待所有数据加载完成
        await Promise.allSettled(promises)

        syncState.value.isInitialized = true
        syncState.value.lastSyncTime = Date.now()

        // 启用自动同步
        if (shouldEnableAutoSync) {
          enableAutoSync()
        }

        return true
      } catch (error: any) {
        syncState.value.syncErrors.push(`业务数据初始化失败: ${error.message}`)
        throw error
      } finally {
        syncState.value.syncInProgress = false
      }
    })
  }

  // 刷新所有业务数据
  const refreshAllData = async (force = false) => {
    return await baseStore.withLoading(async () => {
      syncState.value.syncInProgress = true
      syncState.value.syncErrors = []

      try {
        const promises: Promise<any>[] = []

        // 如果强制刷新或需要刷新，则刷新数据
        if (force || productStore.needsRefresh) {
          promises.push(
            productStore.refresh().catch(error => {
              syncState.value.syncErrors.push(`商品数据刷新失败: ${error.message}`)
            })
          )
        }

        if (force || orderStore.needsRefresh) {
          promises.push(
            orderStore.refresh().catch(error => {
              syncState.value.syncErrors.push(`订单数据刷新失败: ${error.message}`)
            })
          )
        }

        if (force || inventoryStore.needsRefresh) {
          promises.push(
            inventoryStore.refresh().catch(error => {
              syncState.value.syncErrors.push(`库存数据刷新失败: ${error.message}`)
            })
          )
        }

        if (force || notificationStore.needsRefresh) {
          promises.push(
            notificationStore.refresh().catch(error => {
              syncState.value.syncErrors.push(`通知数据刷新失败: ${error.message}`)
            })
          )
        }

        // 等待所有刷新完成
        await Promise.allSettled(promises)

        syncState.value.lastSyncTime = Date.now()
        return true
      } catch (error: any) {
        syncState.value.syncErrors.push(`数据刷新失败: ${error.message}`)
        throw error
      } finally {
        syncState.value.syncInProgress = false
      }
    })
  }

  // 启用自动同步
  const enableAutoSync = () => {
    if (autoSyncTimer) {
      clearInterval(autoSyncTimer)
    }

    syncState.value.autoSyncEnabled = true
    autoSyncTimer = setInterval(async () => {
      if (!syncState.value.syncInProgress && needsRefresh.value) {
        await refreshAllData()
      }
    }, syncState.value.syncInterval)
  }

  // 禁用自动同步
  const disableAutoSync = () => {
    if (autoSyncTimer) {
      clearInterval(autoSyncTimer)
      autoSyncTimer = null
    }
    syncState.value.autoSyncEnabled = false
  }

  // 设置自动同步间隔
  const setAutoSyncInterval = (interval: number) => {
    syncState.value.syncInterval = interval
    if (syncState.value.autoSyncEnabled) {
      disableAutoSync()
      enableAutoSync()
    }
  }

  // 清除同步错误
  const clearSyncErrors = () => {
    syncState.value.syncErrors = []
  }

  // 获取业务数据摘要
  const getBusinessSummary = () => {
    return {
      stats: businessStats.value,
      syncState: syncState.value,
      cacheStatus: {
        product: {
          valid: productStore.isCacheValid,
          lastFetch: productStore.state.lastFetchTime
        },
        order: {
          valid: orderStore.isCacheValid,
          lastFetch: orderStore.state.lastFetchTime
        },
        inventory: {
          valid: inventoryStore.isCacheValid,
          lastFetch: inventoryStore.state.lastFetchTime
        },
        notification: {
          valid: notificationStore.isCacheValid,
          lastFetch: notificationStore.state.lastFetchTime
        }
      }
    }
  }

  // 失效所有缓存
  const invalidateAllCaches = () => {
    productStore.invalidateCache()
    orderStore.invalidateCache()
    inventoryStore.invalidateCache()
    notificationStore.invalidateCache()
  }

  // 重置所有业务数据
  const resetAllData = () => {
    productStore.reset()
    orderStore.reset()
    inventoryStore.reset()
    notificationStore.reset()
    
    syncState.value.isInitialized = false
    syncState.value.lastSyncTime = null
    syncState.value.syncInProgress = false
    syncState.value.syncErrors = []
    
    disableAutoSync()
    baseStore.resetState()
  }

  // 获取待办事项
  const getTodoItems = computed(() => {
    const todos: Array<{
      type: 'order' | 'inventory' | 'notification'
      title: string
      count: number
      priority: 'high' | 'medium' | 'low'
    }> = []

    // 待处理订单
    if (businessStats.value.pendingOrders > 0) {
      todos.push({
        type: 'order',
        title: '待处理订单',
        count: businessStats.value.pendingOrders,
        priority: 'high'
      })
    }

    // 库存预警
    if (businessStats.value.alertsCount > 0) {
      todos.push({
        type: 'inventory',
        title: '库存预警',
        count: businessStats.value.alertsCount,
        priority: 'high'
      })
    }

    // 低库存商品
    if (businessStats.value.lowStockItems > 0) {
      todos.push({
        type: 'inventory',
        title: '低库存商品',
        count: businessStats.value.lowStockItems,
        priority: 'medium'
      })
    }

    // 未读通知
    if (businessStats.value.unreadNotifications > 0) {
      todos.push({
        type: 'notification',
        title: '未读通知',
        count: businessStats.value.unreadNotifications,
        priority: 'low'
      })
    }

    return todos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  })

  // 监听页面可见性变化，自动刷新数据
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && syncState.value.isInitialized) {
      // 页面重新可见时，检查是否需要刷新数据
      if (needsRefresh.value) {
        refreshAllData()
      }
    }
  }

  // 初始化页面可见性监听
  const initVisibilityListener = () => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  // 清理页面可见性监听
  const cleanupVisibilityListener = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    // 状态
    syncState: computed(() => syncState.value),
    
    // 计算属性
    isLoading,
    hasError,
    errors,
    businessStats,
    needsRefresh,
    hasSyncTaskRunning,
    getTodoItems,
    
    // 子 store 引用
    productStore,
    orderStore,
    inventoryStore,
    notificationStore,
    
    // 初始化和同步
    initializeBusinessData,
    refreshAllData,
    enableAutoSync,
    disableAutoSync,
    setAutoSyncInterval,
    
    // 错误处理
    clearSyncErrors,
    
    // 数据管理
    getBusinessSummary,
    invalidateAllCaches,
    resetAllData,
    
    // 页面可见性监听
    initVisibilityListener,
    cleanupVisibilityListener
  }
})

export type BusinessStore = ReturnType<typeof useBusinessStore>