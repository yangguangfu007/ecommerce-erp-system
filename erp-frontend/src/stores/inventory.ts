/**
 * 库存数据状态管理
 * 管理库存列表、预警、调整等业务数据的缓存和同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { inventoryApi } from '@/api/modules/inventory'
import { useBaseStore } from './base'
import type { 
  Inventory, 
  InventoryTransaction,
  InventoryQuery, 
  InventoryAdjustmentForm,
  UpdateInventoryForm,
  InventoryAlertConfig,
  InventoryStats,
  InventorySyncResult,
  PageResponse,
  ApiResponse
} from '@/types'

// 库存状态接口
interface InventoryState {
  // 库存列表数据
  inventories: Inventory[]
  total: number
  currentPage: number
  pageSize: number
  
  // 预警数据
  alerts: Array<Inventory & { alertType: string; alertMessage: string }>
  alertConfigs: InventoryAlertConfig[]
  lowStockCount: number
  outOfStockCount: number
  
  // 搜索和筛选
  searchKeyword: string
  filters: Partial<InventoryQuery>
  selectedInventoryIds: number[]
  
  // 统计数据
  stats: InventoryStats | null
  
  // 历史记录
  transactions: InventoryTransaction[]
  transactionTotal: number
  
  // 同步状态
  syncTasks: InventorySyncResult[]
  activeSyncTask: InventorySyncResult | null
  
  // 缓存控制
  lastFetchTime: number | null
  cacheExpiry: number // 缓存过期时间（毫秒）
}

export const useInventoryStore = defineStore('inventory', () => {
  // 基础状态管理
  const baseStore = useBaseStore({
    loading: false,
    error: null,
    lastUpdated: null
  })

  // 库存状态
  const state = ref<InventoryState>({
    inventories: [],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    alerts: [],
    alertConfigs: [],
    lowStockCount: 0,
    outOfStockCount: 0,
    searchKeyword: '',
    filters: {},
    selectedInventoryIds: [],
    stats: null,
    transactions: [],
    transactionTotal: 0,
    syncTasks: [],
    activeSyncTask: null,
    lastFetchTime: null,
    cacheExpiry: 2 * 60 * 1000 // 2分钟缓存（库存数据变化频繁）
  })

  // 计算属性
  const isLoading = computed(() => baseStore.isLoading.value)
  const hasError = computed(() => baseStore.hasError.value)
  const error = computed(() => baseStore.state.value.error)

  // 是否有库存数据
  const hasInventories = computed(() => state.value.inventories.length > 0)
  
  // 选中的库存数量
  const selectedCount = computed(() => state.value.selectedInventoryIds.length)
  
  // 是否需要刷新数据（缓存过期）
  const needsRefresh = computed(() => {
    if (!state.value.lastFetchTime) return true
    return Date.now() - state.value.lastFetchTime > state.value.cacheExpiry
  })

  // 预警总数
  const alertsCount = computed(() => state.value.alerts.length)
  
  // 是否有同步任务在运行
  const hasSyncTaskRunning = computed(() => {
    return state.value.activeSyncTask?.status === 'RUNNING' || 
           state.value.syncTasks.some(task => task.status === 'RUNNING')
  })

  // 获取库存列表
  const fetchInventories = async (query: Partial<InventoryQuery> = {}) => {
    // 防止重复请求
    if (baseStore.isLoading.value) {
      console.log('Store: 正在加载中，跳过重复请求')
      return {
        records: state.value.inventories,
        total: state.value.total,
        current: state.value.currentPage,
        size: state.value.pageSize
      }
    }

    return await baseStore.withLoading(async () => {
      const params: InventoryQuery = {
        page: query.page || state.value.currentPage,
        size: query.size || state.value.pageSize,
        ...state.value.filters,
        ...query
      }

      console.log('Store: fetchInventories 请求参数:', params)
      const response = await inventoryApi.getInventoryList(params)
      console.log('Store: API 响应:', response)
      
      // 处理后端返回的数据结构
      console.log('Store: 开始处理API响应数据')
      if (Array.isArray(response.data)) {
        console.log('Store: 响应数据是数组，长度:', response.data.length)
        // 如果返回的是数组，直接使用
        const processedData = response.data.map(item => ({
          id: item.id,
          sku: item.sku,
          productName: item.productName || `商品-${item.sku}`, // 如果没有商品名称，使用SKU
          productImage: item.productImage,
          storeId: item.storeId,
          storeName: item.storeName || `店铺-${item.storeId}`,
          availableQuantity: item.availableQuantity,
          reservedQuantity: item.reservedQuantity,
          totalQuantity: item.totalQuantity,
          safetyStock: item.safetyStock,
          status: getInventoryStatus(item),
          warehouseLocation: item.warehouseLocation,
          cost: item.cost || 0,
          totalValue: (item.cost || 0) * item.totalQuantity,
          lastUpdated: item.updatedAt || item.createdAt || new Date().toISOString(),
          createTime: item.createdAt || new Date().toISOString(),
          updateTime: item.updatedAt || new Date().toISOString()
        }))
        
        console.log('Store: 处理后的数据:', processedData)
        state.value.inventories = processedData
        state.value.total = response.data.length
        state.value.currentPage = params.page || 1
        state.value.pageSize = params.size || 20
        console.log('Store: 更新状态完成，inventories长度:', state.value.inventories.length)
      } else {
        console.log('Store: 响应数据是分页格式')
        // 如果返回的是分页格式
        state.value.inventories = response.data.records || response.data.content || []
        state.value.total = response.data.total || 0
        state.value.currentPage = response.data.current || response.data.page || 1
        state.value.pageSize = response.data.size || 20
      }
      
      state.value.lastFetchTime = Date.now()
      
      // 更新库存统计
      updateInventoryStats()
      
      return {
        records: state.value.inventories,
        total: state.value.total,
        current: state.value.currentPage,
        size: state.value.pageSize
      }
    })
  }

  // 根据库存数据判断状态
  const getInventoryStatus = (inventory: any): string => {
    if (inventory.availableQuantity <= 0) {
      return 'out_of_stock'
    } else if (inventory.availableQuantity <= inventory.safetyStock * 0.5) {
      return 'critical'
    } else if (inventory.availableQuantity <= inventory.safetyStock) {
      return 'low'
    } else {
      return 'normal'
    }
  }

  // 获取库存列表（兼容方法）
  const getInventoryList = async (params: any) => {
    console.log('Store: getInventoryList 被调用，参数:', params)
    
    // 防止重复调用
    if (baseStore.isLoading.value) {
      console.log('Store: getInventoryList 正在加载中，返回缓存数据')
      return {
        records: state.value.inventories,
        total: state.value.total,
        current: state.value.currentPage,
        size: state.value.pageSize
      }
    }
    
    const result = await fetchInventories(params)
    console.log('Store: getInventoryList 返回结果:', result)
    console.log('Store: 当前库存数据:', state.value.inventories)
    return result
  }

  // 获取库存详情
  const fetchInventoryById = async (id: number): Promise<Inventory | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Inventory> = await inventoryApi.getInventoryById(id)
      
      // 更新缓存中的库存信息
      const index = state.value.inventories.findIndex(i => i.id === id)
      if (index !== -1) {
        state.value.inventories[index] = response.data
      }
      
      return response.data
    })
  }

  // 根据SKU获取库存
  const fetchInventoryBySku = async (sku: string, storeId?: number): Promise<Inventory | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Inventory> = await inventoryApi.getInventoryBySku(sku, storeId)
      return response.data
    })
  }

  // 批量获取库存
  const fetchInventoriesBySkus = async (skus: string[], storeId?: number): Promise<Inventory[]> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Inventory[]> = await inventoryApi.getInventoriesBySkus(skus, storeId)
      return response.data
    }) || []
  }

  // 调整库存
  const adjustInventory = async (id: string, adjustmentData: any): Promise<Inventory | null> => {
    return await baseStore.withLoading(async () => {
      await inventoryApi.adjustInventory(id, adjustmentData)
      
      // 刷新数据以获取最新库存
      await fetchInventories({ page: state.value.currentPage })
      
      return null
    })
  }

  // 批量调整库存
  const batchAdjustInventory = async (items: Array<{ id: string; adjustment: any }>): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await inventoryApi.batchAdjustInventory(items)
      
      // 刷新数据以获取最新库存
      await fetchInventories({ page: state.value.currentPage })
      
      return true
    }) !== null
  }

  // 更新库存信息
  const updateInventory = async (inventoryForm: UpdateInventoryForm): Promise<Inventory | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Inventory> = await inventoryApi.updateInventory(inventoryForm)
      
      // 更新缓存中的库存信息
      const index = state.value.inventories.findIndex(i => i.id === inventoryForm.id)
      if (index !== -1) {
        state.value.inventories[index] = response.data
      }
      
      return response.data
    })
  }

  // 设置安全库存
  const setSafetyStock = async (sku: string, safetyStock: number, storeId?: number): Promise<Inventory | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Inventory> = await inventoryApi.setSafetyStock(sku, safetyStock, storeId)
      
      // 更新缓存中的库存信息
      const index = state.value.inventories.findIndex(i => i.sku === sku && (!storeId || i.storeId === storeId))
      if (index !== -1) {
        state.value.inventories[index] = response.data
      }
      
      return response.data
    })
  }

  // 搜索库存
  const searchInventories = async (keyword: string, filters: Partial<InventoryQuery> = {}): Promise<Inventory[]> => {
    state.value.searchKeyword = keyword
    state.value.filters = { ...state.value.filters, ...filters }
    
    if (!keyword.trim() && Object.keys(filters).length === 0) {
      await fetchInventories()
      return state.value.inventories
    }
    
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Inventory[]> = await inventoryApi.searchInventories(keyword, filters)
      
      state.value.inventories = response.data
      state.value.total = response.data.length
      state.value.currentPage = 1
      
      // 更新库存统计
      updateInventoryStats()
      
      return response.data
    }) || []
  }

  // 获取库存预警
  const fetchCurrentAlerts = async (storeId?: number): Promise<Array<Inventory & { alertType: string; alertMessage: string }>> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Array<Inventory & { alertType: string; alertMessage: string }>> = 
        await inventoryApi.getCurrentAlerts(storeId)
      
      state.value.alerts = response.data
      return response.data
    }) || []
  }

  // 获取预警配置
  const fetchAlertConfigs = async (query: {
    page: number
    size: number
    alertType?: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
    storeId?: number
    enabled?: boolean
  } = { page: 1, size: 100 }): Promise<InventoryAlertConfig[]> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<PageResponse<InventoryAlertConfig>> = 
        await inventoryApi.getInventoryAlerts(query)
      
      state.value.alertConfigs = response.data.list
      return response.data.list
    }) || []
  }

  // 创建预警配置
  const createAlertConfig = async (alertConfig: Omit<InventoryAlertConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryAlertConfig | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<InventoryAlertConfig> = await inventoryApi.createInventoryAlert(alertConfig)
      
      // 添加到配置列表
      state.value.alertConfigs.push(response.data)
      
      return response.data
    })
  }

  // 更新预警配置
  const updateAlertConfig = async (id: number, alertConfig: Partial<InventoryAlertConfig>): Promise<InventoryAlertConfig | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<InventoryAlertConfig> = await inventoryApi.updateInventoryAlert(id, alertConfig)
      
      // 更新配置列表
      const index = state.value.alertConfigs.findIndex(config => config.id === id)
      if (index !== -1) {
        state.value.alertConfigs[index] = response.data
      }
      
      return response.data
    })
  }

  // 删除预警配置
  const deleteAlertConfig = async (id: number): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await inventoryApi.deleteInventoryAlert(id)
      
      // 从配置列表中移除
      const index = state.value.alertConfigs.findIndex(config => config.id === id)
      if (index !== -1) {
        state.value.alertConfigs.splice(index, 1)
      }
      
      return true
    }) !== null
  }

  // 获取库存历史
  const fetchInventoryHistory = async (query: {
    page: number
    size: number
    sku?: string
    storeId?: number
    transactionType?: 'IN' | 'OUT' | 'ADJUST'
    operatorId?: number
    orderId?: string
    startDate?: string
    endDate?: string
    reason?: string
  }): Promise<InventoryTransaction[]> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<PageResponse<InventoryTransaction>> = 
        await inventoryApi.getInventoryHistory(query)
      
      state.value.transactions = response.data.list
      state.value.transactionTotal = response.data.total
      
      return response.data.list
    }) || []
  }

  // 获取库存统计
  const fetchInventoryStats = async (storeId?: number): Promise<InventoryStats | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<InventoryStats> = await inventoryApi.getInventoryStats(storeId)
      
      state.value.stats = response.data
      return response.data
    })
  }

  // 同步库存
  const syncInventory = async (params: {
    storeId?: number
    skus?: string[]
    syncType: 'full' | 'incremental'
    forceUpdate?: boolean
  }): Promise<InventorySyncResult | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<InventorySyncResult> = await inventoryApi.syncInventory(params)
      
      // 添加到同步任务列表
      state.value.syncTasks.unshift(response.data)
      state.value.activeSyncTask = response.data
      
      return response.data
    })
  }

  // 获取同步状态
  const getSyncStatus = async (taskId: string): Promise<InventorySyncResult | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<InventorySyncResult> = await inventoryApi.getSyncStatus(taskId)
      
      // 更新同步任务状态
      const index = state.value.syncTasks.findIndex(task => task.taskId === taskId)
      if (index !== -1) {
        state.value.syncTasks[index] = response.data
      }
      
      // 更新活跃同步任务
      if (state.value.activeSyncTask?.taskId === taskId) {
        state.value.activeSyncTask = response.data
      }
      
      return response.data
    })
  }

  // 更新库存统计
  const updateInventoryStats = () => {
    let lowStockCount = 0
    let outOfStockCount = 0
    
    state.value.inventories.forEach(inventory => {
      if (inventory.availableQuantity <= 0) {
        outOfStockCount++
      } else if (inventory.availableQuantity <= inventory.safetyStock) {
        lowStockCount++
      }
    })
    
    state.value.lowStockCount = lowStockCount
    state.value.outOfStockCount = outOfStockCount
  }

  // 设置筛选条件
  const setFilters = (filters: Partial<InventoryQuery>) => {
    state.value.filters = { ...state.value.filters, ...filters }
  }

  // 清除筛选条件
  const clearFilters = () => {
    state.value.filters = {}
    state.value.searchKeyword = ''
  }

  // 设置分页
  const setPagination = (page: number, size?: number) => {
    state.value.currentPage = page
    if (size) {
      state.value.pageSize = size
    }
  }

  // 选择库存
  const selectInventory = (id: number) => {
    if (!state.value.selectedInventoryIds.includes(id)) {
      state.value.selectedInventoryIds.push(id)
    }
  }

  // 取消选择库存
  const unselectInventory = (id: number) => {
    const index = state.value.selectedInventoryIds.indexOf(id)
    if (index !== -1) {
      state.value.selectedInventoryIds.splice(index, 1)
    }
  }

  // 切换库存选择状态
  const toggleInventorySelection = (id: number) => {
    if (state.value.selectedInventoryIds.includes(id)) {
      unselectInventory(id)
    } else {
      selectInventory(id)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (state.value.selectedInventoryIds.length === state.value.inventories.length) {
      state.value.selectedInventoryIds = []
    } else {
      state.value.selectedInventoryIds = state.value.inventories.map(i => i.id)
    }
  }

  // 清空选择
  const clearSelection = () => {
    state.value.selectedInventoryIds = []
  }

  // 获取选中的库存
  const getSelectedInventories = computed(() => {
    return state.value.inventories.filter(i => state.value.selectedInventoryIds.includes(i.id))
  })

  // 库存列表（兼容属性）
  const inventoryList = computed(() => {
    return state.value.inventories
  })

  // 刷新数据
  const refresh = async () => {
    state.value.lastFetchTime = null
    await Promise.all([
      fetchInventories(),
      fetchCurrentAlerts()
    ])
  }

  // 导出库存数据
  const exportInventory = async (params: any): Promise<void> => {
    return await baseStore.withLoading(async () => {
      const blob = await inventoryApi.exportInventory(params)
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inventory_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
  }

  // 导出选中库存数据
  const exportSelectedInventory = async (ids: string[]): Promise<void> => {
    return await baseStore.withLoading(async () => {
      const blob = await inventoryApi.batchExport(ids)
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `selected_inventory_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
  }

  // 重置状态
  const reset = () => {
    state.value.inventories = []
    state.value.total = 0
    state.value.currentPage = 1
    state.value.alerts = []
    state.value.alertConfigs = []
    state.value.lowStockCount = 0
    state.value.outOfStockCount = 0
    state.value.searchKeyword = ''
    state.value.filters = {}
    state.value.selectedInventoryIds = []
    state.value.stats = null
    state.value.transactions = []
    state.value.transactionTotal = 0
    state.value.syncTasks = []
    state.value.activeSyncTask = null
    state.value.lastFetchTime = null
    baseStore.resetState()
  }

  // 缓存管理
  const invalidateCache = () => {
    state.value.lastFetchTime = null
  }

  const isCacheValid = computed(() => {
    return !needsRefresh.value
  })

  return {
    // 状态
    state: computed(() => state.value),
    
    // 计算属性
    isLoading,
    hasError,
    error,
    hasInventories,
    selectedCount,
    needsRefresh,
    alertsCount,
    hasSyncTaskRunning,
    getSelectedInventories,
    inventoryList,
    isCacheValid,
    
    // 库存操作
    fetchInventories,
    getInventoryList,
    fetchInventoryById,
    fetchInventoryBySku,
    fetchInventoriesBySkus,
    adjustInventory,
    batchAdjustInventory,
    updateInventory,
    setSafetyStock,
    searchInventories,
    exportInventory,
    exportSelectedInventory,
    
    // 预警操作
    fetchCurrentAlerts,
    fetchAlertConfigs,
    createAlertConfig,
    updateAlertConfig,
    deleteAlertConfig,
    
    // 历史操作
    fetchInventoryHistory,
    
    // 统计操作
    fetchInventoryStats,
    
    // 同步操作
    syncInventory,
    getSyncStatus,
    
    // 筛选和搜索
    setFilters,
    clearFilters,
    setPagination,
    
    // 选择操作
    selectInventory,
    unselectInventory,
    toggleInventorySelection,
    toggleSelectAll,
    clearSelection,
    
    // 工具方法
    refresh,
    reset,
    invalidateCache
  }
})

export type InventoryStore = ReturnType<typeof useInventoryStore>