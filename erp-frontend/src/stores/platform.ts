import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { platformApi } from '@/api/modules/platform'
import type { Platform, PlatformQuery, PlatformStats, SyncDataResult } from '@/api/modules/platform'
import type { PageResponse } from '@/types'

/**
 * 平台管理状态管理
 * 负责管理平台列表、状态监控、同步任务等数据
 */
export const usePlatformStore = defineStore('platform', () => {
  // ==================== 状态定义 ====================
  
  // 平台列表数据
  const platforms = ref<Platform[]>([])
  const platformsLoading = ref(false)
  const platformsTotal = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  
  // 平台统计数据
  const platformStats = ref<PlatformStats | null>(null)
  const statsLoading = ref(false)
  
  // 同步任务数据
  const activeSyncTasks = ref<SyncDataResult[]>([])
  const syncTasksLoading = ref(false)
  
  // 选中的平台
  const selectedPlatforms = ref<number[]>([])
  
  // 搜索和筛选条件
  const searchKeyword = ref('')
  const statusFilter = ref('')
  const typeFilter = ref('')
  
  // ==================== 计算属性 ====================
  
  // 连接正常的平台数量
  const connectedPlatformsCount = computed(() => {
    return platforms.value.filter(p => p.status === 'CONNECTED').length
  })
  
  // 连接异常的平台数量
  const errorPlatformsCount = computed(() => {
    return platforms.value.filter(p => p.status === 'ERROR').length
  })
  
  // 正在同步的平台数量
  const syncingPlatformsCount = computed(() => {
    return platforms.value.filter(p => p.status === 'SYNCING').length
  })
  
  // 平台健康度百分比
  const platformHealthPercentage = computed(() => {
    if (platforms.value.length === 0) return 0
    return Math.round((connectedPlatformsCount.value / platforms.value.length) * 100)
  })
  
  // 筛选后的平台列表
  const filteredPlatforms = computed(() => {
    let result = platforms.value
    
    // 关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.type.toLowerCase().includes(keyword)
      )
    }
    
    // 状态筛选
    if (statusFilter.value) {
      result = result.filter(p => p.status === statusFilter.value)
    }
    
    // 类型筛选
    if (typeFilter.value) {
      result = result.filter(p => p.type === typeFilter.value)
    }
    
    return result
  })
  
  // ==================== 操作方法 ====================
  
  /**
   * 获取平台列表
   */
  const fetchPlatforms = async (query?: Partial<PlatformQuery>) => {
    try {
      platformsLoading.value = true
      
      const params: PlatformQuery = {
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value || undefined,
        status: statusFilter.value as any || undefined,
        type: typeFilter.value as any || undefined,
        ...query
      }
      
      const response = await platformApi.getPlatforms(params)
      
      platforms.value = response.data.records
      platformsTotal.value = response.data.total
      currentPage.value = response.data.current
      
    } catch (error) {
      console.error('获取平台列表失败:', error)
      throw error
    } finally {
      platformsLoading.value = false
    }
  }
  
  /**
   * 获取平台统计信息
   */
  const fetchPlatformStats = async () => {
    try {
      statsLoading.value = true
      const response = await platformApi.getPlatformStats()
      platformStats.value = response.data
    } catch (error) {
      console.error('获取平台统计失败:', error)
      throw error
    } finally {
      statsLoading.value = false
    }
  }
  
  /**
   * 获取活跃同步任务
   */
  const fetchActiveSyncTasks = async () => {
    try {
      syncTasksLoading.value = true
      const response = await platformApi.getActiveSyncTasks()
      activeSyncTasks.value = response.data
    } catch (error) {
      console.error('获取同步任务失败:', error)
      throw error
    } finally {
      syncTasksLoading.value = false
    }
  }
  
  /**
   * 刷新平台状态
   */
  const refreshPlatformStatus = async (platformId?: number) => {
    try {
      if (platformId) {
        // 刷新单个平台状态
        await platformApi.refreshPlatformStatus(platformId)
        // 更新本地状态
        const platform = platforms.value.find(p => p.id === platformId)
        if (platform) {
          const statusResponse = await platformApi.getPlatformStatus(platformId)
          platform.status = statusResponse.data.status
          platform.lastSyncTime = statusResponse.data.lastSyncTime
          platform.errorMessage = statusResponse.data.errorMessage
        }
      } else {
        // 批量刷新所有平台状态
        const platformIds = platforms.value.map(p => p.id)
        await platformApi.batchRefreshPlatformStatus(platformIds)
        // 重新获取平台列表
        await fetchPlatforms()
      }
    } catch (error) {
      console.error('刷新平台状态失败:', error)
      throw error
    }
  }
  
  /**
   * 测试平台连接
   */
  const testPlatformConnection = async (platformId: number) => {
    try {
      const response = await platformApi.testPlatformConnection(platformId)
      return response.data
    } catch (error) {
      console.error('测试平台连接失败:', error)
      throw error
    }
  }
  
  /**
   * 启动数据同步
   */
  const startDataSync = async (platformId: number, syncType: 'PRODUCTS' | 'ORDERS' | 'INVENTORY' | 'ALL' = 'ALL') => {
    try {
      const response = await platformApi.startDataSync({
        platformId,
        syncType,
        force: false
      })
      
      // 更新活跃同步任务列表
      activeSyncTasks.value.push(response.data)
      
      // 更新平台状态为同步中
      const platform = platforms.value.find(p => p.id === platformId)
      if (platform) {
        platform.status = 'SYNCING'
      }
      
      return response.data
    } catch (error) {
      console.error('启动数据同步失败:', error)
      throw error
    }
  }
  
  /**
   * 停止同步任务
   */
  const stopSyncTask = async (taskId: string) => {
    try {
      await platformApi.stopSyncTask(taskId)
      
      // 从活跃任务列表中移除
      const index = activeSyncTasks.value.findIndex(task => task.taskId === taskId)
      if (index > -1) {
        activeSyncTasks.value.splice(index, 1)
      }
      
    } catch (error) {
      console.error('停止同步任务失败:', error)
      throw error
    }
  }
  
  /**
   * 设置搜索条件
   */
  const setSearchConditions = (keyword: string, status: string, type: string) => {
    searchKeyword.value = keyword
    statusFilter.value = status
    typeFilter.value = type
  }
  
  /**
   * 重置搜索条件
   */
  const resetSearchConditions = () => {
    searchKeyword.value = ''
    statusFilter.value = ''
    typeFilter.value = ''
  }
  
  /**
   * 设置选中的平台
   */
  const setSelectedPlatforms = (platformIds: number[]) => {
    selectedPlatforms.value = platformIds
  }
  
  /**
   * 清空选中的平台
   */
  const clearSelectedPlatforms = () => {
    selectedPlatforms.value = []
  }
  
  /**
   * 设置分页参数
   */
  const setPagination = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
  }
  
  /**
   * 重置所有状态
   */
  const resetState = () => {
    platforms.value = []
    platformStats.value = null
    activeSyncTasks.value = []
    selectedPlatforms.value = []
    resetSearchConditions()
    currentPage.value = 1
    pageSize.value = 10
  }
  
  return {
    // 状态
    platforms,
    platformsLoading,
    platformsTotal,
    currentPage,
    pageSize,
    platformStats,
    statsLoading,
    activeSyncTasks,
    syncTasksLoading,
    selectedPlatforms,
    searchKeyword,
    statusFilter,
    typeFilter,
    
    // 计算属性
    connectedPlatformsCount,
    errorPlatformsCount,
    syncingPlatformsCount,
    platformHealthPercentage,
    filteredPlatforms,
    
    // 方法
    fetchPlatforms,
    fetchPlatformStats,
    fetchActiveSyncTasks,
    refreshPlatformStatus,
    testPlatformConnection,
    startDataSync,
    stopSyncTask,
    setSearchConditions,
    resetSearchConditions,
    setSelectedPlatforms,
    clearSelectedPlatforms,
    setPagination,
    resetState
  }
})

export default usePlatformStore