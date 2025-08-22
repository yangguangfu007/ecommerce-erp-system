import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { inventoryApi } from '../inventory'
import type { 
  Inventory, 
  InventoryTransaction, 
  Store, 
  Product, 
  User 
} from '@/types'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

// Mock API service
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  upload: vi.fn()
}

vi.mock('@/api', () => ({
  default: mockApi
}))

// Mock user store for API error handling
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    logout: vi.fn()
  })
}))

// Mock数据
const mockStore: Store = {
  id: 1,
  storeName: '测试店铺',
  platform: 'walmart',
  platformStoreId: 'store123',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockProduct: Product = {
  id: 1,
  sku: 'TEST-001',
  title: '测试商品',
  description: '这是一个测试商品',
  price: 99.99,
  costPrice: 50.00,
  images: ['image1.jpg'],
  attributes: { color: '红色', size: 'L' },
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  nickname: '测试用户',
  roles: [],
  permissions: [],
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockInventory: Inventory = {
  id: 1,
  sku: 'TEST-001',
  storeId: 1,
  availableQuantity: 100,
  reservedQuantity: 10,
  totalQuantity: 110,
  safetyStock: 20,
  warehouseLocation: 'A-01-01',
  product: mockProduct,
  store: mockStore,
  lastUpdated: '2024-01-01T00:00:00Z'
}

const mockInventoryTransaction: InventoryTransaction = {
  id: 1,
  sku: 'TEST-001',
  type: 'IN',
  quantity: 50,
  reason: '采购入库',
  operatorId: 1,
  operator: mockUser,
  createdAt: '2024-01-01T00:00:00Z'
}

const mockApiResponse = <T>(data: T) => ({
  code: 200,
  message: '成功',
  data,
  success: true
})

const mockPageResponse = <T>(items: T[]) => ({
  list: items,
  total: items.length,
  page: 1,
  size: 10,
  pages: 1
})

describe('inventoryApi', () => {
  beforeEach(() => {
    // 设置 Pinia
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('库存基础查询API', () => {
    it('应该能够获取库存列表', async () => {
      const mockQuery = { 
        page: 1, 
        size: 10, 
        sku: 'TEST-001',
        storeId: 1,
        lowStock: true
      }
      const mockResponse = mockApiResponse(mockPageResponse([mockInventory]))
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryList(mockQuery)

      expect(mockApi.get).toHaveBeenCalledWith('/inventory', { params: mockQuery })
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(1)
      expect(result.data.list[0]).toEqual(mockInventory)
    })

    it('应该能够根据ID获取库存详情', async () => {
      const inventoryId = 1
      const mockResponse = mockApiResponse(mockInventory)
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryById(inventoryId)

      expect(mockApi.get).toHaveBeenCalledWith(`/inventory/${inventoryId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toEqual(mockInventory)
    })

    it('应该能够根据SKU获取库存详情', async () => {
      const sku = 'TEST-001'
      const storeId = 1
      const mockResponse = mockApiResponse(mockInventory)
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryById(sku)

      expect(mockApi.get).toHaveBeenCalledWith(`/inventory/${sku}`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toEqual(mockInventory)
    })
  })

  describe('库存调整API', () => {
    it('应该能够调整库存', async () => {
      const adjustmentForm = {
        sku: 'TEST-001',
        storeId: 1,
        adjustmentType: 'IN' as const,
        quantity: 50,
        reason: '采购入库',
        notes: '测试调整',
        warehouseLocation: 'A-01-01'
      }
      const adjustedInventory = { ...mockInventory, availableQuantity: 150 }
      const mockResponse = mockApiResponse(adjustedInventory)
      
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await inventoryApi.adjustInventory(adjustmentForm)

      expect(mockApi.post).toHaveBeenCalledWith('/inventory/adjust', adjustmentForm)
      expect(result).toEqual(mockResponse)
      expect(result.data.availableQuantity).toBe(150)
    })

    it('应该能够批量调整库存', async () => {
      const operation = {
        items: [
          {
            sku: 'TEST-001',
            storeId: 1,
            operation: 'ADD' as const,
            quantity: 50,
            reason: '采购入库',
            notes: '批量调整1'
          }
        ],
        operatorNotes: '批量库存调整操作'
      }
      const mockResponse = mockApiResponse({ success: 1, failed: 0, errors: [] })
      
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await inventoryApi.batchAdjustInventory(operation)

      expect(mockApi.post).toHaveBeenCalledWith('/inventory/batch/adjust', operation)
      expect(result).toEqual(mockResponse)
      expect(result.data.success).toBe(1)
    })
  })

  describe('库存预警API', () => {
    it('应该能够获取库存预警列表', async () => {
      const query = { 
        page: 1, 
        size: 10, 
        alertType: 'LOW_STOCK' as const,
        storeId: 1,
        enabled: true
      }
      const mockAlert = {
        id: 1,
        sku: 'TEST-001',
        storeId: 1,
        alertType: 'LOW_STOCK' as const,
        threshold: 10,
        enabled: true,
        notificationChannels: ['EMAIL', 'SYSTEM'] as const,
        recipients: ['admin@example.com'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      const mockResponse = mockApiResponse(mockPageResponse([mockAlert]))
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryAlerts(query)

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/alerts', { params: query })
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(1)
    })
  }) 
 describe('库存历史API', () => {
    it('应该能够获取库存变动历史', async () => {
      const query = {
        page: 1,
        size: 10,
        sku: 'TEST-001',
        storeId: 1,
        transactionType: 'IN' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }
      const mockResponse = mockApiResponse(mockPageResponse([mockInventoryTransaction]))
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryHistory(query)

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/history', { params: query })
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(1)
    })

    it('应该能够根据SKU获取库存变动历史', async () => {
      const sku = 'TEST-001'
      const storeId = 1
      const limit = 50
      const mockResponse = mockApiResponse([mockInventoryTransaction])
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryHistory(sku, { pageSize: limit })

      expect(mockApi.get).toHaveBeenCalledWith(`/inventory/${sku}/history`, {
        params: { pageSize: limit }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('多店铺库存管理API', () => {
    it('应该能够获取多店铺库存汇总', async () => {
      const sku = 'TEST-001'
      const mockMultiStoreInventory = [
        { ...mockInventory, storeName: '店铺1' },
        { ...mockInventory, id: 2, storeId: 2, storeName: '店铺2', availableQuantity: 80 }
      ]
      const mockResponse = mockApiResponse(mockMultiStoreInventory)
      
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await inventoryApi.getInventoryStats({ storeId: sku })

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/stats', { params: { storeId: sku } })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('应该能够进行店铺间库存调拨', async () => {
      const allocationParams = {
        fromStoreId: 1,
        toStoreId: 2,
        items: [
          {
            sku: 'TEST-001',
            quantity: 20,
            reason: '店铺间调拨',
            notes: '补充店铺2库存'
          }
        ]
      }
      const mockResponse = mockApiResponse({
        success: true,
        transactionIds: [101, 102],
        message: '调拨成功'
      })
      
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await inventoryApi.transferInventory(allocationParams)

      expect(mockApi.post).toHaveBeenCalledWith('/inventory/transfer', allocationParams)
      expect(result).toEqual(mockResponse)
      expect(result.data.success).toBe(true)
    })
  })})
