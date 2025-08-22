/**
 * 订单数据状态管理
 * 管理订单列表、状态统计、同步等业务数据的缓存和同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderApi } from '@/api/modules/order'
import { useBaseStore } from './base'
import type { 
  Order, 
  OrderItem,
  OrderStatus,
  OrderQuery, 
  CreateOrderForm, 
  UpdateOrderForm,
  UpdateOrderStatusForm,
  OrderStats,
  OrderSyncResult,
  PageResponse,
  ApiResponse
} from '@/types'

// 订单状态接口
interface OrderState {
  // 订单列表数据
  orders: Order[]
  total: number
  currentPage: number
  pageSize: number
  
  // 订单状态统计
  statusCounts: Record<OrderStatus, number>
  
  // 搜索和筛选
  searchKeyword: string
  filters: Partial<OrderQuery>
  selectedOrderIds: number[]
  
  // 统计数据
  stats: OrderStats | null
  
  // 同步状态
  syncTasks: OrderSyncResult[]
  activeSyncTask: OrderSyncResult | null
  
  // 缓存控制
  lastFetchTime: number | null
  cacheExpiry: number // 缓存过期时间（毫秒）
}

export const useOrderStore = defineStore('order', () => {
  // 基础状态管理
  const baseStore = useBaseStore({
    loading: false,
    error: null,
    lastUpdated: null
  })

  // 订单状态
  const state = ref<OrderState>({
    orders: [] as Order[],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    statusCounts: {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    },
    searchKeyword: '',
    filters: {},
    selectedOrderIds: [],
    stats: null,
    syncTasks: [],
    activeSyncTask: null,
    lastFetchTime: null,
    cacheExpiry: 3 * 60 * 1000 // 3分钟缓存（订单数据更新频繁）
  })

  // 计算属性
  const isLoading = computed(() => baseStore.isLoading.value)
  const hasError = computed(() => baseStore.hasError.value)
  const error = computed(() => baseStore.state.value.error)

  // 是否有订单数据
  const hasOrders = computed(() => state.value.orders.length > 0)
  
  // 选中的订单数量
  const selectedCount = computed(() => state.value.selectedOrderIds.length)
  
  // 是否需要刷新数据（缓存过期）
  const needsRefresh = computed(() => {
    if (!state.value.lastFetchTime) return true
    return Date.now() - state.value.lastFetchTime > state.value.cacheExpiry
  })

  // 待处理订单数量
  const pendingOrdersCount = computed(() => state.value.statusCounts?.PENDING || 0)
  
  // 是否有同步任务在运行
  const hasSyncTaskRunning = computed(() => {
    return state.value.activeSyncTask?.status === 'RUNNING' || 
           state.value.syncTasks.some(task => task.status === 'RUNNING')
  })

  // 获取订单列表
  const fetchOrders = async (query: Partial<OrderQuery> = {}) => {
    return await baseStore.withLoading(async () => {
      const params: OrderQuery = {
        page: query.page || state.value.currentPage,
        size: query.size || state.value.pageSize,
        ...state.value.filters,
        ...query
      }

      const response: ApiResponse<PageResponse<Order>> = await orderApi.getOrders(params)
      
      // 处理后端返回的分页数据结构（MyBatis Plus的IPage结构）
      const pageData = response.data
      state.value.orders = pageData.records || pageData.content || []
      state.value.total = pageData.total || 0
      state.value.currentPage = pageData.current || pageData.page || 1
      state.value.pageSize = pageData.size || 20
      state.value.lastFetchTime = Date.now()
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    })
  }

  // 获取订单详情
  const fetchOrderById = async (id: number): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.getOrderById(id)
      
      // 更新缓存中的订单信息
      const index = state.value.orders.findIndex(o => o.id === id)
      if (index !== -1) {
        state.value.orders[index] = response.data
      }
      
      return response.data
    })
  }

  // 根据订单号获取订单
  const fetchOrderByOrderId = async (orderId: string): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.getOrderByOrderId(orderId)
      return response.data
    })
  }

  // 创建订单
  const createOrder = async (orderForm: CreateOrderForm): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.createOrder(orderForm)
      
      // 添加到列表开头
      state.value.orders.unshift(response.data)
      state.value.total += 1
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    })
  }

  // 更新订单
  const updateOrder = async (orderForm: UpdateOrderForm): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.updateOrder(orderForm)
      
      // 更新缓存中的订单信息
      const index = state.value.orders.findIndex(o => o.id === orderForm.id)
      if (index !== -1) {
        state.value.orders[index] = response.data
      }
      
      return response.data
    })
  }

  // 更新订单状态
  const updateOrderStatus = async (statusForm: UpdateOrderStatusForm): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.updateOrderStatus(statusForm)
      
      // 更新缓存中的订单信息
      const index = state.value.orders.findIndex(o => o.id === statusForm.id)
      if (index !== -1) {
        state.value.orders[index] = response.data
      }
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    })
  }

  // 确认订单
  const confirmOrder = async (id: number, notes?: string): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.confirmOrder(id, notes)
      
      // 更新缓存中的订单信息
      const index = state.value.orders.findIndex(o => o.id === id)
      if (index !== -1) {
        state.value.orders[index] = response.data
      }
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    })
  }

  // 取消订单
  const cancelOrder = async (id: number, reason: string, notes?: string): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.cancelOrder(id, reason, notes)
      
      // 更新缓存中的订单信息
      const index = state.value.orders.findIndex(o => o.id === id)
      if (index !== -1) {
        state.value.orders[index] = response.data
      }
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    })
  }

  // 发货订单
  const shipOrder = async (id: number, trackingNumber: string, carrier?: string, notes?: string): Promise<Order | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order> = await orderApi.shipOrder(id, trackingNumber, carrier, notes)
      
      // 更新缓存中的订单信息
      const index = state.value.orders.findIndex(o => o.id === id)
      if (index !== -1) {
        state.value.orders[index] = response.data
      }
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    })
  }

  // 批量操作订单
  const batchOperateOrders = async (operation: {
    orderIds: number[]
    operation: 'updateStatus' | 'cancel' | 'ship' | 'confirm' | 'delete'
    status?: OrderStatus
    trackingNumber?: string
    reason?: string
    notes?: string
  }): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      const response = await orderApi.batchOperateOrders(operation)
      
      // 根据操作类型更新缓存
      if (operation.operation === 'delete') {
        // 从列表中移除已删除的订单
        state.value.orders = state.value.orders.filter(o => !operation.orderIds.includes(o.id))
        state.value.total -= response.data.success
      } else {
        // 刷新数据以获取最新状态
        await fetchOrders({ page: state.value.currentPage })
      }
      
      // 清空选中列表
      state.value.selectedOrderIds = []
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data.success > 0
    }) !== null
  }

  // 搜索订单
  const searchOrders = async (keyword: string, filters: Partial<OrderQuery> = {}): Promise<Order[]> => {
    state.value.searchKeyword = keyword
    state.value.filters = { ...state.value.filters, ...filters }
    
    if (!keyword.trim() && Object.keys(filters).length === 0) {
      await fetchOrders()
      return state.value.orders
    }
    
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Order[]> = await orderApi.searchOrders(keyword)
      
      state.value.orders = response.data
      state.value.total = response.data.length
      state.value.currentPage = 1
      
      // 更新状态统计
      updateStatusCounts()
      
      return response.data
    }) || []
  }

  // 获取订单统计
  const fetchOrderStats = async (storeId?: number, startDate?: string, endDate?: string): Promise<OrderStats | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<OrderStats> = await orderApi.getOrderStats(storeId, startDate, endDate)
      
      state.value.stats = response.data
      return response.data
    })
  }

  // 同步订单
  const syncOrders = async (params: {
    storeId?: number
    startDate?: string
    endDate?: string
    syncType: 'full' | 'incremental'
    platformOrderIds?: string[]
  }): Promise<OrderSyncResult | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<OrderSyncResult> = await orderApi.syncOrders(params)
      
      // 添加到同步任务列表
      state.value.syncTasks.unshift(response.data)
      state.value.activeSyncTask = response.data
      
      return response.data
    })
  }

  // 获取同步状态
  const getSyncStatus = async (taskId: string): Promise<OrderSyncResult | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<OrderSyncResult> = await orderApi.getSyncStatus(taskId)
      
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

  // 更新状态统计
  const updateStatusCounts = () => {
    const counts: Record<OrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    }
    
    state.value.orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1
    })
    
    state.value.statusCounts = counts
  }

  // 设置筛选条件
  const setFilters = (filters: Partial<OrderQuery>) => {
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

  // 选择订单
  const selectOrder = (id: number) => {
    if (!state.value.selectedOrderIds.includes(id)) {
      state.value.selectedOrderIds.push(id)
    }
  }

  // 取消选择订单
  const unselectOrder = (id: number) => {
    const index = state.value.selectedOrderIds.indexOf(id)
    if (index !== -1) {
      state.value.selectedOrderIds.splice(index, 1)
    }
  }

  // 切换订单选择状态
  const toggleOrderSelection = (id: number) => {
    if (state.value.selectedOrderIds.includes(id)) {
      unselectOrder(id)
    } else {
      selectOrder(id)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (state.value.selectedOrderIds.length === state.value.orders.length) {
      state.value.selectedOrderIds = []
    } else {
      state.value.selectedOrderIds = state.value.orders.map(o => o.id)
    }
  }

  // 清空选择
  const clearSelection = () => {
    state.value.selectedOrderIds = []
  }

  // 获取选中的订单
  const getSelectedOrders = computed(() => {
    return state.value.orders.filter(o => state.value.selectedOrderIds.includes(o.id))
  })

  // 刷新数据
  const refresh = async () => {
    state.value.lastFetchTime = null
    await fetchOrders()
  }

  // 重置状态
  const reset = () => {
    state.value.orders = []
    state.value.total = 0
    state.value.currentPage = 1
    state.value.statusCounts = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    }
    state.value.searchKeyword = ''
    state.value.filters = {}
    state.value.selectedOrderIds = []
    state.value.stats = null
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
    hasOrders,
    selectedCount,
    needsRefresh,
    pendingOrdersCount,
    hasSyncTaskRunning,
    getSelectedOrders,
    isCacheValid,
    
    // 订单操作
    fetchOrders,
    fetchOrderById,
    fetchOrderByOrderId,
    createOrder,
    updateOrder,
    updateOrderStatus,
    confirmOrder,
    cancelOrder,
    shipOrder,
    batchOperateOrders,
    searchOrders,
    
    // 统计操作
    fetchOrderStats,
    
    // 同步操作
    syncOrders,
    getSyncStatus,
    
    // 筛选和搜索
    setFilters,
    clearFilters,
    setPagination,
    
    // 选择操作
    selectOrder,
    unselectOrder,
    toggleOrderSelection,
    toggleSelectAll,
    clearSelection,
    
    // 工具方法
    refresh,
    reset,
    invalidateCache
  }
})

export type OrderStore = ReturnType<typeof useOrderStore>