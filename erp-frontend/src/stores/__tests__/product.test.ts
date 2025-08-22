/**
 * 商品数据状态管理测试
 * 测试商品数据的缓存、更新、同步机制和业务逻辑
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '../product'
import { productApi } from '@/api/modules/product'
import type { Product, Category, ProductStats } from '@/types'

// Mock API 模块
vi.mock('@/api/modules/product')

describe('商品数据状态管理 (Product Store)', () => {
  let productStore: ReturnType<typeof useProductStore>
  
  // Mock 数据
  const mockProducts: Product[] = [
    {
      id: 1,
      sku: 'TEST-001',
      title: '测试商品1',
      description: '这是一个测试商品',
      categoryId: 1,
      brand: '测试品牌',
      price: 99.99,
      costPrice: 50.00,
      weight: 1.5,
      dimensions: '10x10x10',
      images: ['image1.jpg', 'image2.jpg'],
      attributes: { color: '红色', size: 'L' },
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      sku: 'TEST-002',
      title: '测试商品2',
      description: '这是另一个测试商品',
      categoryId: 2,
      brand: '测试品牌2',
      price: 199.99,
      costPrice: 100.00,
      weight: 2.0,
      dimensions: '20x20x20',
      images: ['image3.jpg'],
      attributes: { color: '蓝色', size: 'M' },
      status: 'ACTIVE',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ]

  const mockCategories: Category[] = [
    {
      id: 1,
      name: '电子产品',
      parentId: undefined,
      level: 1,
      path: '/电子产品',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: '服装',
      parentId: undefined,
      level: 1,
      path: '/服装',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]

  const mockStats: ProductStats = {
    totalProducts: 100,
    activeProducts: 85,
    inactiveProducts: 10,
    deletedProducts: 5,
    lowStockProducts: 15,
    outOfStockProducts: 3,
    newProductsToday: 2,
    newProductsThisWeek: 8,
    newProductsThisMonth: 25,
    totalValue: 50000,
    averagePrice: 125.50
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    productStore = useProductStore()
    
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 创建新的 mock 数据副本以避免测试间的数据污染
    const freshMockProducts = mockProducts.map(product => ({ ...product }))
    
    // 设置默认的 API mock 返回值
    vi.mocked(productApi.getProducts).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: {
        list: freshMockProducts,
        total: freshMockProducts.length,
        page: 1,
        size: 20,
        pages: 1
      }
    })

    vi.mocked(productApi.getCategories).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: {
        list: mockCategories,
        total: mockCategories.length,
        page: 1,
        size: 1000,
        pages: 1
      }
    })

    vi.mocked(productApi.getCategoryTree).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockCategories
    })

    vi.mocked(productApi.getProductStats).mockResolvedValue({
      code: 200,
      message: '成功',
      success: true,
      data: mockStats
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(productStore.state.products).toEqual([])
      expect(productStore.state.total).toBe(0)
      expect(productStore.state.currentPage).toBe(1)
      expect(productStore.state.pageSize).toBe(20)
      expect(productStore.state.categories).toEqual([])
      expect(productStore.state.categoryTree).toEqual([])
      expect(productStore.state.searchKeyword).toBe('')
      expect(productStore.state.filters).toEqual({})
      expect(productStore.state.selectedProductIds).toEqual([])
      expect(productStore.state.stats).toBeNull()
      expect(productStore.state.lastFetchTime).toBeNull()
      expect(productStore.state.cacheExpiry).toBe(5 * 60 * 1000)
    })

    it('应该有正确的计算属性初始值', () => {
      expect(productStore.isLoading).toBe(false)
      expect(productStore.hasError).toBe(false)
      expect(productStore.hasProducts).toBe(false)
      expect(productStore.hasCategories).toBe(false)
      expect(productStore.selectedCount).toBe(0)
      expect(productStore.needsRefresh).toBe(true)
      expect(productStore.isCacheValid).toBe(false)
    })
  })

  describe('商品数据获取', () => {
    it('应该能够获取商品列表', async () => {
      const result = await productStore.fetchProducts()
      
      expect(productApi.getProducts).toHaveBeenCalledWith({
        page: 1,
        size: 20
      })
      expect(result.list).toEqual(mockProducts)
      expect(productStore.state.products).toEqual(mockProducts)
      expect(productStore.state.total).toBe(mockProducts.length)
      expect(productStore.state.lastFetchTime).toBeGreaterThan(0)
    })

    it('应该能够使用查询参数获取商品', async () => {
      const query = { sku: 'TEST', status: 'ACTIVE' as const }
      await productStore.fetchProducts(query)
      
      expect(productApi.getProducts).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        ...query
      })
    })

    it('应该能够根据ID获取商品详情', async () => {
      const mockProduct = mockProducts[0]
      vi.mocked(productApi.getProductById).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockProduct
      })
      
      // 先加载商品列表
      await productStore.fetchProducts()
      
      const result = await productStore.fetchProductById(1)
      
      expect(productApi.getProductById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockProduct)
      
      // 应该更新缓存中的商品信息
      expect(productStore.state.products[0]).toEqual(mockProduct)
    })

    it('应该能够根据SKU获取商品', async () => {
      const mockProduct = mockProducts[0]
      vi.mocked(productApi.getProductBySku).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: mockProduct
      })
      
      const result = await productStore.fetchProductBySku('TEST-001')
      
      expect(productApi.getProductBySku).toHaveBeenCalledWith('TEST-001')
      expect(result).toEqual(mockProduct)
    })
  })

  describe('商品CRUD操作', () => {
    it('应该能够创建商品', async () => {
      const newProduct = { ...mockProducts[0], id: 3, sku: 'TEST-003' }
      const createForm = {
        sku: 'TEST-003',
        title: '新商品',
        price: 99.99,
        status: 'ACTIVE' as const,
        images: [],
        attributes: {}
      }
      
      vi.mocked(productApi.createProduct).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: newProduct
      })
      
      const result = await productStore.createProduct(createForm)
      
      expect(productApi.createProduct).toHaveBeenCalledWith(createForm)
      expect(result).toEqual(newProduct)
      expect(productStore.state.products[0]).toEqual(newProduct)
      expect(productStore.state.total).toBe(1)
    })

    it('应该能够更新商品', async () => {
      // 先加载商品列表
      await productStore.fetchProducts()
      
      const updatedProduct = { ...mockProducts[0], title: '更新后的商品' }
      const updateForm = {
        id: 1,
        title: '更新后的商品'
      }
      
      vi.mocked(productApi.updateProduct).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: updatedProduct
      })
      
      const result = await productStore.updateProduct(updateForm)
      
      expect(productApi.updateProduct).toHaveBeenCalledWith(updateForm)
      expect(result).toEqual(updatedProduct)
      expect(productStore.state.products[0]).toEqual(updatedProduct)
    })

    it('应该能够删除商品', async () => {
      // 先加载商品列表
      await productStore.fetchProducts()
      
      vi.mocked(productApi.deleteProduct).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: undefined
      })
      
      const result = await productStore.deleteProduct(1)
      
      expect(productApi.deleteProduct).toHaveBeenCalledWith(1)
      expect(result).toBe(true)
      expect(productStore.state.products).toHaveLength(1)
      expect(productStore.state.total).toBe(1)
    })

    it('应该能够批量删除商品', async () => {
      // 先加载商品列表并选择商品
      await productStore.fetchProducts()
      productStore.selectProduct(1)
      productStore.selectProduct(2)
      
      vi.mocked(productApi.batchOperateProducts).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: { success: 2, failed: 0 }
      })
      
      const result = await productStore.batchDeleteProducts([1, 2])
      
      expect(productApi.batchOperateProducts).toHaveBeenCalledWith({
        productIds: [1, 2],
        operation: 'delete'
      })
      expect(result).toBe(true)
      expect(productStore.state.products).toHaveLength(0)
      expect(productStore.state.selectedProductIds).toHaveLength(0)
    })
  })

  describe('商品搜索功能', () => {
    it('应该能够搜索商品', async () => {
      const searchResults = [mockProducts[0]]
      vi.mocked(productApi.searchProducts).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: searchResults
      })
      
      const result = await productStore.searchProducts('测试')
      
      expect(productApi.searchProducts).toHaveBeenCalledWith('测试', {})
      expect(result).toEqual(searchResults)
      expect(productStore.state.products).toEqual(searchResults)
      expect(productStore.state.searchKeyword).toBe('测试')
    })

    it('应该能够使用过滤条件搜索', async () => {
      const filters = { categoryId: 1, status: 'ACTIVE' as const }
      await productStore.searchProducts('测试', filters)
      
      expect(productApi.searchProducts).toHaveBeenCalledWith('测试', filters)
      expect(productStore.state.filters).toEqual(expect.objectContaining(filters))
    })

    it('应该在空关键词时获取所有商品', async () => {
      await productStore.searchProducts('')
      
      expect(productApi.getProducts).toHaveBeenCalled()
      expect(productApi.searchProducts).not.toHaveBeenCalled()
    })
  })

  describe('分类管理', () => {
    it('应该能够获取分类列表', async () => {
      const result = await productStore.fetchCategories()
      
      expect(productApi.getCategories).toHaveBeenCalledWith({
        page: 1,
        size: 1000
      })
      expect(result).toEqual(mockCategories)
      expect(productStore.state.categories).toEqual(mockCategories)
    })

    it('应该能够获取分类树', async () => {
      const result = await productStore.fetchCategoryTree()
      
      expect(productApi.getCategoryTree).toHaveBeenCalledWith(true)
      expect(result).toEqual(mockCategories)
      expect(productStore.state.categoryTree).toEqual(mockCategories)
    })

    it('应该能够使用缓存的分类数据', async () => {
      // 第一次获取
      await productStore.fetchCategories()
      vi.clearAllMocks()
      
      // 第二次获取应该使用缓存
      const result = await productStore.fetchCategories()
      
      expect(productApi.getCategories).not.toHaveBeenCalled()
      expect(result).toEqual(mockCategories)
    })

    it('应该能够强制刷新分类数据', async () => {
      // 第一次获取
      await productStore.fetchCategories()
      vi.clearAllMocks()
      
      // 强制刷新
      await productStore.fetchCategories(true)
      
      expect(productApi.getCategories).toHaveBeenCalled()
    })
  })

  describe('商品统计', () => {
    it('应该能够获取商品统计信息', async () => {
      const result = await productStore.fetchProductStats()
      
      expect(productApi.getProductStats).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockStats)
      expect(productStore.state.stats).toEqual(mockStats)
    })

    it('应该能够获取指定店铺的统计信息', async () => {
      await productStore.fetchProductStats(1)
      
      expect(productApi.getProductStats).toHaveBeenCalledWith(1)
    })
  })

  describe('筛选和分页', () => {
    it('应该能够设置筛选条件', () => {
      const filters = { categoryId: 1, status: 'ACTIVE' as const }
      productStore.setFilters(filters)
      
      expect(productStore.state.filters).toEqual(filters)
    })

    it('应该能够清除筛选条件', () => {
      productStore.setFilters({ categoryId: 1 })
      productStore.state.searchKeyword = '测试'
      
      productStore.clearFilters()
      
      expect(productStore.state.filters).toEqual({})
      expect(productStore.state.searchKeyword).toBe('')
    })

    it('应该能够设置分页参数', () => {
      productStore.setPagination(2, 50)
      
      expect(productStore.state.currentPage).toBe(2)
      expect(productStore.state.pageSize).toBe(50)
    })
  })

  describe('商品选择功能', () => {
    beforeEach(async () => {
      await productStore.fetchProducts()
    })

    it('应该能够选择商品', () => {
      productStore.selectProduct(1)
      
      expect(productStore.state.selectedProductIds).toContain(1)
      expect(productStore.selectedCount).toBe(1)
    })

    it('应该能够取消选择商品', () => {
      productStore.selectProduct(1)
      productStore.unselectProduct(1)
      
      expect(productStore.state.selectedProductIds).not.toContain(1)
      expect(productStore.selectedCount).toBe(0)
    })

    it('应该能够切换商品选择状态', () => {
      productStore.toggleProductSelection(1)
      expect(productStore.state.selectedProductIds).toContain(1)
      
      productStore.toggleProductSelection(1)
      expect(productStore.state.selectedProductIds).not.toContain(1)
    })

    it('应该能够全选/取消全选', () => {
      productStore.toggleSelectAll()
      expect(productStore.selectedCount).toBe(mockProducts.length)
      
      productStore.toggleSelectAll()
      expect(productStore.selectedCount).toBe(0)
    })

    it('应该能够清空选择', () => {
      productStore.selectProduct(1)
      productStore.selectProduct(2)
      
      productStore.clearSelection()
      
      expect(productStore.selectedCount).toBe(0)
    })

    it('应该能够获取选中的商品', async () => {
      // 先获取商品数据
      await productStore.fetchProducts()
      productStore.selectProduct(1)
      
      const selectedProducts = productStore.getSelectedProducts
      expect(selectedProducts).toHaveLength(1)
      expect(selectedProducts[0].id).toBe(1)
    })
  })

  describe('缓存管理', () => {
    it('应该正确判断缓存是否有效', () => {
      expect(productStore.needsRefresh).toBe(true)
      expect(productStore.isCacheValid).toBe(false)
      
      // 设置最近的获取时间
      productStore.state.lastFetchTime = Date.now()
      expect(productStore.needsRefresh).toBe(false)
      expect(productStore.isCacheValid).toBe(true)
    })

    it('应该在缓存过期时需要刷新', () => {
      // 设置过期的获取时间
      productStore.state.lastFetchTime = Date.now() - (6 * 60 * 1000) // 6分钟前
      
      expect(productStore.needsRefresh).toBe(true)
      expect(productStore.isCacheValid).toBe(false)
    })

    it('应该能够失效缓存', () => {
      productStore.state.lastFetchTime = Date.now()
      
      productStore.invalidateCache()
      
      expect(productStore.state.lastFetchTime).toBeNull()
      expect(productStore.needsRefresh).toBe(true)
    })
  })

  describe('数据刷新和重置', () => {
    it('应该能够刷新数据', async () => {
      // 先设置一些状态
      productStore.state.lastFetchTime = Date.now()
      
      await productStore.refresh()
      
      expect(productApi.getProducts).toHaveBeenCalled()
    })

    it('应该能够重置状态', () => {
      // 先设置一些状态
      productStore.state.products = mockProducts
      productStore.state.total = 100
      productStore.state.currentPage = 2
      productStore.state.categories = mockCategories
      productStore.state.searchKeyword = '测试'
      productStore.state.selectedProductIds = [1, 2]
      
      productStore.reset()
      
      expect(productStore.state.products).toEqual([])
      expect(productStore.state.total).toBe(0)
      expect(productStore.state.currentPage).toBe(1)
      expect(productStore.state.categories).toEqual([])
      expect(productStore.state.searchKeyword).toBe('')
      expect(productStore.state.selectedProductIds).toEqual([])
    })
  })

  describe('错误处理', () => {
    it('应该处理API错误', async () => {
      const error = new Error('网络错误')
      vi.mocked(productApi.getProducts).mockRejectedValue(error)
      
      const result = await productStore.fetchProducts()
      expect(result).toBeNull()
      expect(productStore.hasError).toBe(true)
    })

    it('应该处理创建商品时的错误', async () => {
      const error = new Error('创建失败')
      vi.mocked(productApi.createProduct).mockRejectedValue(error)
      
      const createForm = {
        sku: 'TEST-003',
        title: '新商品',
        price: 99.99,
        status: 'ACTIVE' as const,
        images: [],
        attributes: {}
      }
      
      const result = await productStore.createProduct(createForm)
      expect(result).toBeNull()
      expect(productStore.hasError).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的商品列表', async () => {
      vi.mocked(productApi.getProducts).mockResolvedValue({
        code: 200,
        message: '成功',
        success: true,
        data: {
          list: [],
          total: 0,
          page: 1,
          size: 20,
          pages: 0
        }
      })
      
      await productStore.fetchProducts()
      
      expect(productStore.hasProducts).toBe(false)
      expect(productStore.state.total).toBe(0)
    })

    it('应该处理不存在的商品ID', async () => {
      vi.mocked(productApi.getProductById).mockResolvedValue({
        code: 404,
        message: '商品不存在',
        success: false,
        data: null
      })
      
      const result = await productStore.fetchProductById(999)
      expect(result).toBeNull()
    })

    it('应该处理重复选择同一商品', () => {
      productStore.selectProduct(1)
      productStore.selectProduct(1)
      
      expect(productStore.state.selectedProductIds).toEqual([1])
      expect(productStore.selectedCount).toBe(1)
    })

    it('应该处理取消选择不存在的商品', () => {
      productStore.unselectProduct(999)
      
      expect(productStore.selectedCount).toBe(0)
    })
  })
})