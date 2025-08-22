import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { platformApi } from '../platform'
import type {
  Platform,
  PlatformConfig,
  Store,
  ConnectionTestResult,
  SyncDataResult,
  PageResponse
} from '../platform'

// Mock API
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}))

// Mock 数据
const mockPlatform: Platform = {
  id: 1,
  name: 'Walmart Marketplace',
  type: 'WALMART',
  description: '沃尔玛电商平台',
  config: {
    apiUrl: 'https://marketplace.walmartapis.com',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret'
  },
  status: 'CONNECTED',
  lastSyncTime: '2024-01-01T12:00:00Z',
  isEnabled: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockConnectionTestResult: ConnectionTestResult = {
  success: true,
  message: '连接测试成功',
  responseTime: 150,
  details: { version: '1.0', status: 'ok' },
  timestamp: '2024-01-01T12:00:00Z'
}

const mockStore: Store = {
  id: 1,
  name: '测试店铺',
  description: '测试店铺描述',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockSyncDataResult: SyncDataResult = {
  taskId: 'task-123',
  status: 'COMPLETED',
  progress: 100,
  totalRecords: 100,
  processedRecords: 100,
  successRecords: 100,
  failedRecords: 0,
  errors: [],
  startTime: '2024-01-01T12:00:00Z',
  endTime: '2024-01-01T12:05:00Z',
  message: '数据同步成功'
}

const mockPageResponse = <T>(list: T[], total: number = list.length): PageResponse<T> => ({
  list,
  total,
  page: 1,
  size: 10,
  pages: Math.ceil(total / 10)
})

describe('platformApi', () => {
  let mockApi: any

  beforeEach(async () => {
    // 设置 Pinia 实例
    setActivePinia(createPinia())
    // 获取 mock API 实例
    mockApi = (await import('@/api')).default
    vi.clearAllMocks()
  })

  describe('平台配置API', () => {
    it('应该能够获取平台列表', async () => {
      const platformList = [mockPlatform]
      const query = { page: 1, size: 10 }
      
      mockApi.get.mockResolvedValue({
        data: mockPageResponse(platformList)
      })

      const result = await platformApi.getPlatforms(query)

      expect(mockApi.get).toHaveBeenCalledWith('/platforms', { params: query })
      expect(result.data).toEqual(mockPageResponse(platformList))
    })

    it('应该能够根据ID获取平台详情', async () => {
      mockApi.get.mockResolvedValue({ data: mockPlatform })

      const result = await platformApi.getPlatformById(1)

      expect(mockApi.get).toHaveBeenCalledWith('/platforms/1')
      expect(result.data).toEqual(mockPlatform)
    })

    it('应该能够创建新平台', async () => {
      const platformData = {
        name: 'New Platform',
        type: 'AMAZON' as const,
        description: '亚马逊平台',
        config: {
          apiUrl: 'https://api.amazon.com',
          clientId: 'amazon-client-id',
          clientSecret: 'amazon-client-secret'
        },
        isEnabled: true
      }

      mockApi.post.mockResolvedValue({ data: { ...platformData, id: 2 } })

      const result = await platformApi.createPlatform(platformData)

      expect(mockApi.post).toHaveBeenCalledWith('/platforms', platformData)
      expect(result.data.id).toBe(2)
    })

    it('应该能够更新平台配置', async () => {
      const updateData = { id: 1, name: 'Updated Platform' }
      const updatedPlatform = { ...mockPlatform, name: 'Updated Platform' }
      mockApi.put.mockResolvedValue({ data: updatedPlatform })

      const result = await platformApi.updatePlatform(updateData)

      expect(mockApi.put).toHaveBeenCalledWith('/platforms/1', { name: 'Updated Platform' })
      expect(result.data.name).toBe('Updated Platform')
    })

    it('应该能够删除平台', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined })

      const result = await platformApi.deletePlatform(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/platforms/1')
      expect(result.data).toBeUndefined()
    })
  })

  describe('连接测试API', () => {
    it('应该能够测试平台连接', async () => {
      mockApi.post.mockResolvedValue({ data: mockConnectionTestResult })

      const result = await platformApi.testPlatformConnection(1)

      expect(mockApi.post).toHaveBeenCalledWith('/platforms/1/test-connection')
      expect(result.data).toEqual(mockConnectionTestResult)
    })

    it('应该能够测试平台配置连接', async () => {
      const config = {
        apiUrl: 'https://test.api.com',
        clientId: 'test-client',
        clientSecret: 'test-secret'
      }

      mockApi.post.mockResolvedValue({ data: mockConnectionTestResult })

      const result = await platformApi.testPlatformConfig(config, 'WALMART')

      expect(mockApi.post).toHaveBeenCalledWith('/platforms/test-config', { config, type: 'WALMART' })
      expect(result.data).toEqual(mockConnectionTestResult)
    })
  })

  describe('状态监控API', () => {
    it('应该能够获取平台状态', async () => {
      const statusData = { status: 'CONNECTED' as const, lastSyncTime: '2024-01-01T12:00:00Z' }
      mockApi.get.mockResolvedValue({ data: statusData })

      const result = await platformApi.getPlatformStatus(1)

      expect(mockApi.get).toHaveBeenCalledWith('/platforms/1/status')
      expect(result.data).toEqual(statusData)
    })

    it('应该能够获取所有平台状态概览', async () => {
      const platformList = [mockPlatform]
      mockApi.get.mockResolvedValue({ data: platformList })

      const result = await platformApi.getAllPlatformStatus()

      expect(mockApi.get).toHaveBeenCalledWith('/platforms/status/overview')
      expect(result.data).toEqual(platformList)
    })
  })

  describe('店铺管理API', () => {
    it('应该能够获取店铺列表', async () => {
      const query = {
        page: 1,
        size: 10,
        platformId: 1,
        status: 'ACTIVE' as const
      }
      const storeList = [mockStore]

      mockApi.get.mockResolvedValue({
        data: mockPageResponse(storeList)
      })

      const result = await platformApi.getStores(query)

      expect(mockApi.get).toHaveBeenCalledWith('/stores', { params: query })
      expect(result.data).toEqual(mockPageResponse(storeList))
    })

    it('应该能够根据ID获取店铺详情', async () => {
      mockApi.get.mockResolvedValue({ data: mockStore })

      const result = await platformApi.getStoreById(1)

      expect(mockApi.get).toHaveBeenCalledWith('/stores/1')
      expect(result.data).toEqual(mockStore)
    })

    it('应该能够创建新店铺', async () => {
      const storeData = {
        platformId: 1,
        storeName: '新店铺',
        platformStoreId: 'new-store-123',
        status: 'ACTIVE' as const
      }

      mockApi.post.mockResolvedValue({ data: { ...storeData, id: 2 } })

      const result = await platformApi.createStore(storeData)

      expect(mockApi.post).toHaveBeenCalledWith('/stores', storeData)
      expect(result.data.id).toBe(2)
    })

    it('应该能够更新店铺配置', async () => {
      const updateData = { id: 1, storeName: '更新后的店铺' }
      const updatedStore = { ...mockStore, name: '更新后的店铺' }
      mockApi.put.mockResolvedValue({ data: updatedStore })

      const result = await platformApi.updateStore(updateData)

      expect(mockApi.put).toHaveBeenCalledWith('/stores/1', { storeName: '更新后的店铺' })
      expect(result.data.name).toBe('更新后的店铺')
    })

    it('应该能够删除店铺', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined })

      const result = await platformApi.deleteStore(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/stores/1')
      expect(result.data).toBeUndefined()
    })
  })

  describe('数据同步API', () => {
    it('应该能够启动数据同步', async () => {
      const syncRequest = {
        platformId: 1,
        syncType: 'PRODUCTS' as const,
        force: false
      }

      mockApi.post.mockResolvedValue({ data: mockSyncDataResult })

      const result = await platformApi.startDataSync(syncRequest)

      expect(mockApi.post).toHaveBeenCalledWith('/sync/start', syncRequest)
      expect(result.data).toEqual(mockSyncDataResult)
    })

    it('应该能够获取同步任务状态', async () => {
      const taskId = 'task-123'

      mockApi.get.mockResolvedValue({ data: mockSyncDataResult })

      const result = await platformApi.getSyncTaskStatus(taskId)

      expect(mockApi.get).toHaveBeenCalledWith('/sync/tasks/task-123')
      expect(result.data).toEqual(mockSyncDataResult)
    })

    it('应该能够获取同步日志', async () => {
      const syncLogs = [mockSyncDataResult]
      const query = { page: 1, size: 10, platformId: 1 }

      mockApi.get.mockResolvedValue({
        data: mockPageResponse(syncLogs)
      })

      const result = await platformApi.getSyncLogs(query)

      expect(mockApi.get).toHaveBeenCalledWith('/sync/logs', { params: query })
      expect(result.data).toEqual(mockPageResponse(syncLogs))
    })

    it('应该能够停止同步任务', async () => {
      const taskId = 'task-123'
      mockApi.post.mockResolvedValue({ data: undefined })

      const result = await platformApi.stopSyncTask(taskId)

      expect(mockApi.post).toHaveBeenCalledWith('/sync/tasks/task-123/stop')
      expect(result.data).toBeUndefined()
    })

    it('应该能够获取活跃的同步任务', async () => {
      const activeTasks = [mockSyncDataResult]
      mockApi.get.mockResolvedValue({ data: activeTasks })

      const result = await platformApi.getActiveSyncTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/sync/tasks/active')
      expect(result.data).toEqual(activeTasks)
    })
  })
})