import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { productApi, type ProductQuery, type CreateProductForm, type UpdateProductForm } from '../product'
import api from '@/api'
import type { Product, Category } from '@/types'

// Mock API service
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}))

// Mock数据
const mockProduct: Product = {
  id: 1,
  sku: 'TEST-001',
  title: '测试商品',
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
}

const mockCategory: Category = {
  id: 1,
  name: '测试分类',
  parentId: undefined,
  level: 1,
  path: '/1',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
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

describe('productApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('商品基础CRUD操作', () => {
    it('应该能够获取商品列表', async () => {
      const mockQuery: ProductQuery = { page: 1, size: 10, keyword: '测试' }
      const mockResponse = mockApiResponse(mockPageResponse([mockProduct]))
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProducts(mockQuery)

      expect(api.get).toHaveBeenCalledWith('/products', { params: mockQuery })
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(1)
      expect(result.data.list[0]).toEqual(mockProduct)
    })

    it('应该能够根据ID获取商品详情', async () => {
      const productId = 1
      const mockResponse = mockApiResponse(mockProduct)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProductById(productId)

      expect(api.get).toHaveBeenCalledWith(`/products/${productId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toEqual(mockProduct)
    })

    it('应该能够根据SKU获取商品详情', async () => {
      const sku = 'TEST-001'
      const mockResponse = mockApiResponse(mockProduct)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProductBySku(sku)

      expect(api.get).toHaveBeenCalledWith(`/products/sku/${sku}`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toEqual(mockProduct)
    })

    it('应该能够创建新商品', async () => {
      const createForm: CreateProductForm = {
        sku: 'NEW-001',
        title: '新商品',
        description: '新商品描述',
        categoryId: 1,
        brand: '新品牌',
        price: 199.99,
        costPrice: 100.00,
        weight: 2.0,
        dimensions: '20x20x20',
        images: ['new-image.jpg'],
        attributes: { color: '蓝色', size: 'XL' },
        status: 'ACTIVE',
        tags: ['新品', '热销'],
        specifications: [{ name: '材质', value: '棉质' }]
      }
      const mockResponse = mockApiResponse({ ...mockProduct, ...createForm, id: 2 })
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.createProduct(createForm)

      expect(api.post).toHaveBeenCalledWith('/products', createForm)
      expect(result).toEqual(mockResponse)
      expect(result.data.sku).toBe(createForm.sku)
    })

    it('应该能够更新商品信息', async () => {
      const updateForm: UpdateProductForm = {
        id: 1,
        title: '更新后的商品',
        price: 299.99,
        status: 'INACTIVE'
      }
      const updatedProduct = { ...mockProduct, ...updateForm }
      const mockResponse = mockApiResponse(updatedProduct)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.updateProduct(updateForm)

      expect(api.put).toHaveBeenCalledWith('/products/1', {
        title: '更新后的商品',
        price: 299.99,
        status: 'INACTIVE'
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该能够删除商品', async () => {
      const productId = 1
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await productApi.deleteProduct(productId)

      expect(api.delete).toHaveBeenCalledWith(`/products/${productId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('商品搜索功能', () => {
    it('应该能够搜索商品', async () => {
      const keyword = '测试'
      const filters = { categoryId: 1, status: 'ACTIVE' as const }
      const limit = 20
      const mockResponse = mockApiResponse([mockProduct])
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.searchProducts(keyword, filters, limit)

      expect(api.get).toHaveBeenCalledWith('/products/search', {
        params: { keyword, ...filters, limit }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(1)
    })

    it('应该能够获取搜索建议', async () => {
      const keyword = '测试'
      const limit = 10
      const mockSuggestions = [
        { type: 'product' as const, value: '测试商品', label: '测试商品', count: 5 },
        { type: 'category' as const, value: '测试分类', label: '测试分类', count: 3 }
      ]
      const mockResponse = mockApiResponse(mockSuggestions)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getSearchSuggestions(keyword, limit)

      expect(api.get).toHaveBeenCalledWith('/products/search/suggestions', {
        params: { keyword, limit }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('应该能够进行高级搜索', async () => {
      const searchParams = {
        keyword: '测试商品',
        categoryIds: [1, 2],
        brands: ['品牌A', '品牌B'],
        priceRange: { min: 10, max: 100 },
        attributes: { color: '红色', size: 'L' },
        tags: ['热销', '新品'],
        hasStock: true,
        status: ['ACTIVE']
      }
      const mockResponse = mockApiResponse(mockPageResponse([mockProduct]))
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.advancedSearchProducts(searchParams)

      expect(api.post).toHaveBeenCalledWith('/products/search/advanced', searchParams)
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(1)
    })
  })

  describe('商品批量操作', () => {
    it('应该能够批量操作商品', async () => {
      const operation = {
        productIds: [1, 2, 3],
        operation: 'activate' as const
      }
      const mockResponse = mockApiResponse({ success: 3, failed: 0 })
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.batchOperateProducts(operation)

      expect(api.post).toHaveBeenCalledWith('/products/batch', operation)
      expect(result).toEqual(mockResponse)
      expect(result.data.success).toBe(3)
    })

    it('应该能够批量更新商品价格', async () => {
      const updates = [
        { id: 1, price: 99.99, costPrice: 50.00 },
        { id: 2, price: 199.99, costPrice: 100.00 }
      ]
      const mockResponse = mockApiResponse({ success: 2, failed: 0 })
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.batchUpdatePrices(updates)

      expect(api.put).toHaveBeenCalledWith('/products/batch/prices', { updates })
      expect(result).toEqual(mockResponse)
      expect(result.data.success).toBe(2)
    })

    it('应该能够批量更新商品库存', async () => {
      const updates = [
        { sku: 'TEST-001', quantity: 100, operation: 'SET' as const },
        { sku: 'TEST-002', quantity: 50, operation: 'ADD' as const }
      ]
      const mockResponse = mockApiResponse({ success: 2, failed: 0 })
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.batchUpdateStock(updates)

      expect(api.put).toHaveBeenCalledWith('/products/batch/stock', { updates })
      expect(result).toEqual(mockResponse)
      expect(result.data.success).toBe(2)
    })
  })

  describe('商品导入导出', () => {
    it('应该能够导入商品数据', async () => {
      const file = new File(['test content'], 'products.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const options = { updateExisting: true, skipErrors: false }
      const mockImportResult = {
        total: 10,
        success: 8,
        failed: 2,
        errors: [
          { row: 3, sku: 'TEST-003', field: 'price', message: '价格格式错误', value: 'invalid' }
        ],
        successProducts: [mockProduct]
      }
      const mockResponse = mockApiResponse(mockImportResult)
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.importProducts(file, options)

      expect(api.post).toHaveBeenCalledWith('/products/import', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data.success).toBe(8)
      expect(result.data.failed).toBe(2)
    })

    it('应该能够获取导入模板', async () => {
      const mockResponse = mockApiResponse({ downloadUrl: 'https://example.com/template.xlsx' })
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getImportTemplate()

      expect(api.get).toHaveBeenCalledWith('/products/import/template')
      expect(result).toEqual(mockResponse)
      expect(result.data.downloadUrl).toBeTruthy()
    })

    it('应该能够导出商品数据', async () => {
      const query = { categoryId: 1, status: 'ACTIVE' as const }
      const format = 'excel' as const
      const mockResponse = mockApiResponse({ downloadUrl: 'https://example.com/export.xlsx' })
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.exportProducts(query, format)

      expect(api.post).toHaveBeenCalledWith('/products/export', { ...query, format })
      expect(result).toEqual(mockResponse)
      expect(result.data.downloadUrl).toBeTruthy()
    })

    it('应该能够验证导入数据', async () => {
      const file = new File(['test content'], 'products.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const mockValidationResult = {
        valid: false,
        errors: [
          { row: 2, sku: 'TEST-002', field: 'price', message: '价格不能为空', value: null }
        ],
        preview: [
          { sku: 'TEST-001', title: '测试商品1', price: 99.99 },
          { sku: 'TEST-002', title: '测试商品2', price: null }
        ]
      }
      const mockResponse = mockApiResponse(mockValidationResult)
      
      vi.mocked(api.upload).mockResolvedValue(mockResponse)

      const result = await productApi.validateImportData(file)

      expect(api.upload).toHaveBeenCalledWith('/products/import/validate', file)
      expect(result).toEqual(mockResponse)
      expect(result.data.valid).toBe(false)
      expect(result.data.errors).toHaveLength(1)
    })
  })

  describe('商品分类管理', () => {
    it('应该能够获取分类列表', async () => {
      const query = { page: 1, size: 10, name: '测试分类' }
      const mockResponse = mockApiResponse(mockPageResponse([mockCategory]))
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getCategories(query)

      expect(api.get).toHaveBeenCalledWith('/categories', { params: query })
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(1)
    })

    it('应该能够获取分类树形结构', async () => {
      const includeProductCount = true
      const mockCategoryTree = [
        {
          ...mockCategory,
          children: [
            { ...mockCategory, id: 2, name: '子分类', parentId: 1, level: 2, path: '/1/2' }
          ]
        }
      ]
      const mockResponse = mockApiResponse(mockCategoryTree)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getCategoryTree(includeProductCount)

      expect(api.get).toHaveBeenCalledWith('/categories/tree', { params: { includeProductCount } })
      expect(result).toEqual(mockResponse)
      expect(result.data[0].children).toHaveLength(1)
    })

    it('应该能够根据ID获取分类详情', async () => {
      const categoryId = 1
      const mockResponse = mockApiResponse(mockCategory)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getCategoryById(categoryId)

      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toEqual(mockCategory)
    })

    it('应该能够创建新分类', async () => {
      const createForm = {
        name: '新分类',
        parentId: 1,
        description: '新分类描述',
        image: 'category.jpg',
        sortOrder: 1,
        status: 'ACTIVE' as const,
        attributes: [1, 2, 3]
      }
      const newCategory = { ...mockCategory, ...createForm, id: 2 }
      const mockResponse = mockApiResponse(newCategory)
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.createCategory(createForm)

      expect(api.post).toHaveBeenCalledWith('/categories', createForm)
      expect(result).toEqual(mockResponse)
      expect(result.data.name).toBe(createForm.name)
    })

    it('应该能够更新分类信息', async () => {
      const updateForm = {
        id: 1,
        name: '更新后的分类',
        description: '更新后的描述',
        status: 'INACTIVE' as const
      }
      const updatedCategory = { ...mockCategory, ...updateForm }
      const mockResponse = mockApiResponse(updatedCategory)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.updateCategory(updateForm)

      expect(api.put).toHaveBeenCalledWith('/categories/1', {
        name: '更新后的分类',
        description: '更新后的描述',
        status: 'INACTIVE'
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该能够删除分类', async () => {
      const categoryId = 1
      const moveProductsTo = 2
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await productApi.deleteCategory(categoryId, moveProductsTo)

      expect(api.delete).toHaveBeenCalledWith(`/categories/${categoryId}`, {
        params: { moveProductsTo }
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该能够移动分类', async () => {
      const categoryId = 1
      const newParentId = 2
      const sortOrder = 5
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.moveCategory(categoryId, newParentId, sortOrder)

      expect(api.put).toHaveBeenCalledWith(`/categories/${categoryId}/move`, { newParentId, sortOrder })
      expect(result).toEqual(mockResponse)
    })

    it('应该能够获取分类路径', async () => {
      const categoryId = 1
      const mockPath = [
        { ...mockCategory, id: 0, name: '根分类', level: 0, path: '/0' },
        { ...mockCategory, id: 1, name: '测试分类', level: 1, path: '/0/1' }
      ]
      const mockResponse = mockApiResponse(mockPath)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getCategoryPath(categoryId)

      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}/path`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('商品属性管理', () => {
    it('应该能够获取商品属性列表', async () => {
      const categoryId = 1
      const mockAttributes = [
        {
          id: 1,
          name: '颜色',
          type: 'SELECT' as const,
          options: ['红色', '蓝色', '绿色'],
          required: true,
          categoryId: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      const mockResponse = mockApiResponse(mockAttributes)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProductAttributes(categoryId)

      expect(api.get).toHaveBeenCalledWith('/products/attributes', { params: { categoryId } })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(1)
    })

    it('应该能够根据ID获取商品属性详情', async () => {
      const attributeId = 1
      const mockAttribute = {
        id: 1,
        name: '颜色',
        type: 'SELECT' as const,
        options: ['红色', '蓝色', '绿色'],
        required: true,
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      const mockResponse = mockApiResponse(mockAttribute)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProductAttributeById(attributeId)

      expect(api.get).toHaveBeenCalledWith(`/products/attributes/${attributeId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toEqual(mockAttribute)
    })

    it('应该能够创建商品属性', async () => {
      const attributeData = {
        name: '尺寸',
        type: 'SELECT' as const,
        options: ['S', 'M', 'L', 'XL'],
        required: true,
        categoryId: 1
      }
      const newAttribute = {
        ...attributeData,
        id: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      const mockResponse = mockApiResponse(newAttribute)
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.createProductAttribute(attributeData)

      expect(api.post).toHaveBeenCalledWith('/products/attributes', attributeData)
      expect(result).toEqual(mockResponse)
      expect(result.data.name).toBe(attributeData.name)
    })

    it('应该能够更新商品属性', async () => {
      const attributeId = 1
      const updateData = {
        name: '更新后的颜色',
        options: ['红色', '蓝色', '绿色', '黄色'],
        required: false
      }
      const updatedAttribute = {
        id: 1,
        ...updateData,
        type: 'SELECT' as const,
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      const mockResponse = mockApiResponse(updatedAttribute)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.updateProductAttribute(attributeId, updateData)

      expect(api.put).toHaveBeenCalledWith(`/products/attributes/${attributeId}`, updateData)
      expect(result).toEqual(mockResponse)
      expect(result.data.name).toBe(updateData.name)
    })

    it('应该能够删除商品属性', async () => {
      const attributeId = 1
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await productApi.deleteProductAttribute(attributeId)

      expect(api.delete).toHaveBeenCalledWith(`/products/attributes/${attributeId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('商品标签管理', () => {
    it('应该能够获取所有商品标签', async () => {
      const mockTags = ['热销', '新品', '促销', '限量']
      const mockResponse = mockApiResponse(mockTags)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProductTags()

      expect(api.get).toHaveBeenCalledWith('/products/tags')
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(4)
    })

    it('应该能够为商品添加标签', async () => {
      const productId = 1
      const tags = ['热销', '新品']
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productApi.addProductTags(productId, tags)

      expect(api.post).toHaveBeenCalledWith(`/products/${productId}/tags`, { tags })
      expect(result).toEqual(mockResponse)
    })

    it('应该能够移除商品标签', async () => {
      const productId = 1
      const tags = ['促销']
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await productApi.removeProductTags(productId, tags)

      expect(api.delete).toHaveBeenCalledWith(`/products/${productId}/tags`, { data: { tags } })
      expect(result).toEqual(mockResponse)
    })

    it('应该能够根据标签搜索商品', async () => {
      const tags = ['热销', '新品']
      const matchAll = true
      const mockResponse = mockApiResponse([mockProduct])
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.searchProductsByTags(tags, matchAll)

      expect(api.get).toHaveBeenCalledWith('/products/search/tags', {
        params: { tags: tags.join(','), matchAll }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('商品状态管理', () => {
    it('应该能够激活商品', async () => {
      const productId = 1
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.activateProduct(productId)

      expect(api.put).toHaveBeenCalledWith(`/products/${productId}/activate`)
      expect(result).toEqual(mockResponse)
    })

    it('应该能够禁用商品', async () => {
      const productId = 1
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.deactivateProduct(productId)

      expect(api.put).toHaveBeenCalledWith(`/products/${productId}/deactivate`)
      expect(result).toEqual(mockResponse)
    })

    it('应该能够永久删除商品', async () => {
      const productId = 1
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await productApi.permanentDeleteProduct(productId)

      expect(api.delete).toHaveBeenCalledWith(`/products/${productId}/permanent`)
      expect(result).toEqual(mockResponse)
    })

    it('应该能够恢复已删除的商品', async () => {
      const productId = 1
      const mockResponse = mockApiResponse(undefined)
      
      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const result = await productApi.restoreProduct(productId)

      expect(api.put).toHaveBeenCalledWith(`/products/${productId}/restore`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('商品统计和分析', () => {
    it('应该能够获取商品统计信息', async () => {
      const storeId = 1
      const mockStats = {
        totalProducts: 1000,
        activeProducts: 800,
        inactiveProducts: 150,
        deletedProducts: 50,
        lowStockProducts: 25,
        outOfStockProducts: 10,
        newProductsToday: 5,
        newProductsThisWeek: 30,
        newProductsThisMonth: 120,
        totalValue: 50000.00,
        averagePrice: 50.00
      }
      const mockResponse = mockApiResponse(mockStats)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getProductStats(storeId)

      expect(api.get).toHaveBeenCalledWith('/products/stats', { params: { storeId } })
      expect(result).toEqual(mockResponse)
      expect(result.data.totalProducts).toBe(1000)
    })

    it('应该能够获取热销商品', async () => {
      const limit = 10
      const days = 30
      const mockTopSelling = [
        { ...mockProduct, salesCount: 100, salesAmount: 9999.00 }
      ]
      const mockResponse = mockApiResponse(mockTopSelling)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getTopSellingProducts(limit, days)

      expect(api.get).toHaveBeenCalledWith('/products/top-selling', { params: { limit, days } })
      expect(result).toEqual(mockResponse)
      expect(result.data[0].salesCount).toBe(100)
    })

    it('应该能够获取低库存商品', async () => {
      const threshold = 10
      const limit = 50
      const mockLowStock = [
        { ...mockProduct, currentStock: 5 }
      ]
      const mockResponse = mockApiResponse(mockLowStock)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getLowStockProducts(threshold, limit)

      expect(api.get).toHaveBeenCalledWith('/products/low-stock', { params: { threshold, limit } })
      expect(result).toEqual(mockResponse)
      expect(result.data[0].currentStock).toBe(5)
    })

    it('应该能够获取商品价格分析', async () => {
      const categoryId = 1
      const mockPriceAnalysis = {
        averagePrice: 75.50,
        medianPrice: 65.00,
        priceRanges: [
          { range: '0-50', count: 200 },
          { range: '50-100', count: 500 },
          { range: '100+', count: 300 }
        ],
        categoryComparison: [
          { categoryName: '电子产品', averagePrice: 150.00 },
          { categoryName: '服装', averagePrice: 45.00 }
        ]
      }
      const mockResponse = mockApiResponse(mockPriceAnalysis)
      
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await productApi.getPriceAnalysis(categoryId)

      expect(api.get).toHaveBeenCalledWith('/products/price-analysis', { params: { categoryId } })
      expect(result).toEqual(mockResponse)
      expect(result.data.averagePrice).toBe(75.50)
    })
  })
})