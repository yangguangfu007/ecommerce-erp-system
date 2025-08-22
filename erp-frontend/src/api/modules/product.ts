import api from '@/api'
import type { ApiResponse, PageResponse, PageRequest, Product, Category, ProductStatus } from '@/types'

// 商品查询参数接口（与后端接口一致）
export interface ProductQuery extends PageRequest {
  keyword?: string       // 关键词搜索
  categoryId?: number    // 分类ID（后端数字类型）
  brand?: string
  status?: ProductStatus // 商品状态枚举
}

// 商品创建表单接口（与后端接口一致）
export interface CreateProductForm {
  sku: string
  name: string           // 商品名称（后端字段）
  description?: string
  categoryId: number     // 分类ID（后端数字类型）
  brand?: string
  price: number
  costPrice?: number
  weight?: number
  dimensions?: string    // 尺寸信息（后端字符串格式）
  images?: string[]
  attributes?: Record<string, any>
  status: ProductStatus  // 商品状态枚举
}

// 商品更新表单接口（与后端接口一致）
export interface UpdateProductForm {
  id: number
  sku?: string
  name?: string          // 商品名称（后端字段）
  description?: string
  categoryId?: number    // 分类ID（后端数字类型）
  brand?: string
  price?: number
  costPrice?: number
  weight?: number
  dimensions?: string    // 尺寸信息（后端字符串格式）
  images?: string[]
  attributes?: Record<string, any>
  status?: ProductStatus // 商品状态枚举
}

// 商品规格接口
export interface ProductSpecification {
  name: string
  value: string
  unit?: string
}

// 商品属性接口
export interface ProductAttribute {
  id: number
  name: string
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN'
  options?: string[]
  required: boolean
  categoryId?: number
  createdAt: string
  updatedAt: string
}

// 分类查询参数接口
export interface CategoryQuery extends PageRequest {
  name?: string
  parentId?: number
  level?: number
  status?: 'ACTIVE' | 'INACTIVE'
  keyword?: string
}

// 分类创建表单接口
export interface CreateCategoryForm {
  name: string
  parentId?: number
  description?: string
  image?: string
  sortOrder?: number
  status: 'ACTIVE' | 'INACTIVE'
  attributes?: number[]
}

// 分类更新表单接口
export interface UpdateCategoryForm {
  id: number
  name?: string
  parentId?: number
  description?: string
  image?: string
  sortOrder?: number
  status?: 'ACTIVE' | 'INACTIVE'
  attributes?: number[]
}

// 商品统计信息接口
export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  deletedProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  newProductsToday: number
  newProductsThisWeek: number
  newProductsThisMonth: number
  totalValue: number
  averagePrice: number
}

// 批量操作参数接口
export interface BatchProductOperation {
  productIds: number[]
  operation: 'activate' | 'deactivate' | 'delete' | 'updateCategory' | 'updatePrice' | 'addTags' | 'removeTags'
  categoryId?: number
  priceAdjustment?: {
    type: 'FIXED' | 'PERCENTAGE'
    value: number
  }
  tags?: string[]
}

// 商品导入结果接口
export interface ProductImportResult {
  total: number
  success: number
  failed: number
  errors: ProductImportError[]
  successProducts: Product[]
}

// 商品导入错误接口
export interface ProductImportError {
  row: number
  sku?: string
  field: string
  message: string
  value: any
}

// 商品搜索建议接口
export interface ProductSearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'tag'
  value: string
  label: string
  count?: number
}

/**
 * 商品管理API模块
 * 提供商品相关的所有API接口功能
 */
export const productApi = {
  // ==================== 商品基础CRUD操作 ====================

  /**
   * 获取商品列表（分页）
   * @param query 查询参数
   * @returns 商品列表分页数据
   */
  getProducts(query: ProductQuery): Promise<ApiResponse<PageResponse<Product>>> {
    return api.get('/products', { params: query })
  },

  /**
   * 根据ID获取商品详情
   * @param id 商品ID
   * @returns 商品详细信息
   */
  getProductById(id: number): Promise<ApiResponse<Product>> {
    return api.get(`/products/${id}`)
  },

  /**
   * 根据SKU获取商品详情
   * @param sku 商品SKU
   * @returns 商品详细信息
   */
  getProductBySku(sku: string): Promise<ApiResponse<Product>> {
    return api.get(`/products/sku/${sku}`)
  },

  /**
   * 创建新商品
   * @param productForm 商品创建表单
   * @returns 创建的商品信息
   */
  createProduct(productForm: CreateProductForm): Promise<ApiResponse<Product>> {
    return api.post('/products', productForm)
  },

  /**
   * 更新商品信息
   * @param productForm 商品更新表单
   * @returns 更新后的商品信息
   */
  updateProduct(productForm: UpdateProductForm): Promise<ApiResponse<Product>> {
    const { id, ...data } = productForm
    return api.put(`/products/${id}`, data)
  },

  /**
   * 删除商品（软删除）
   * @param id 商品ID
   * @returns 删除结果
   */
  deleteProduct(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/products/${id}`)
  },

  /**
   * 永久删除商品
   * @param id 商品ID
   * @returns 删除结果
   */
  permanentDeleteProduct(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/products/${id}/permanent`)
  },

  /**
   * 恢复已删除的商品
   * @param id 商品ID
   * @returns 恢复结果
   */
  restoreProduct(id: number): Promise<ApiResponse<void>> {
    return api.put(`/products/${id}/restore`)
  },

  /**
   * 激活商品
   * @param id 商品ID
   * @returns 激活结果
   */
  activateProduct(id: number): Promise<ApiResponse<void>> {
    return api.put(`/products/${id}/activate`)
  },

  /**
   * 禁用商品
   * @param id 商品ID
   * @returns 禁用结果
   */
  deactivateProduct(id: number): Promise<ApiResponse<void>> {
    return api.put(`/products/${id}/deactivate`)
  },

  // ==================== 商品搜索功能 ====================

  /**
   * 搜索商品
   * @param keyword 搜索关键词
   * @param filters 搜索过滤条件
   * @param limit 返回数量限制
   * @returns 搜索结果
   */
  searchProducts(
    keyword: string, 
    filters?: Partial<ProductQuery>, 
    limit: number = 20
  ): Promise<ApiResponse<Product[]>> {
    return api.get('/products/search', { 
      params: { keyword, ...filters, limit } 
    })
  },

  /**
   * 获取搜索建议
   * @param keyword 搜索关键词
   * @param limit 返回数量限制
   * @returns 搜索建议列表
   */
  getSearchSuggestions(keyword: string, limit: number = 10): Promise<ApiResponse<ProductSearchSuggestion[]>> {
    return api.get('/products/search/suggestions', { 
      params: { keyword, limit } 
    })
  },

  /**
   * 高级搜索商品
   * @param searchParams 高级搜索参数
   * @returns 搜索结果
   */
  advancedSearchProducts(searchParams: {
    keyword?: string
    categoryIds?: number[]
    brands?: string[]
    priceRange?: { min: number; max: number }
    attributes?: Record<string, any>
    tags?: string[]
    hasStock?: boolean
    status?: string[]
  }): Promise<ApiResponse<PageResponse<Product>>> {
    return api.post('/products/search/advanced', searchParams)
  },

  // ==================== 商品批量操作 ====================

  /**
   * 批量操作商品
   * @param operation 批量操作参数
   * @returns 操作结果
   */
  batchOperateProducts(operation: BatchProductOperation): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.post('/products/batch', operation)
  },

  /**
   * 批量更新商品价格
   * @param updates 价格更新列表
   * @returns 更新结果
   */
  batchUpdatePrices(updates: Array<{ id: number; price: number; costPrice?: number }>): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.put('/products/batch/prices', { updates })
  },

  /**
   * 批量更新商品库存
   * @param updates 库存更新列表
   * @returns 更新结果
   */
  batchUpdateStock(updates: Array<{ sku: string; quantity: number; operation: 'SET' | 'ADD' | 'SUBTRACT' }>): Promise<ApiResponse<{ success: number; failed: number }>> {
    return api.put('/products/batch/stock', { updates })
  },

  // ==================== 商品导入导出 ====================

  /**
   * 导入商品数据
   * @param file Excel文件
   * @param options 导入选项
   * @returns 导入结果
   */
  importProducts(file: File, options?: {
    updateExisting?: boolean
    skipErrors?: boolean
    categoryMapping?: Record<string, number>
  }): Promise<ApiResponse<ProductImportResult>> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }
    return api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * 获取导入模板
   * @returns 模板文件URL
   */
  getImportTemplate(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.get('/products/import/template')
  },

  /**
   * 导出商品数据
   * @param query 查询条件
   * @param format 导出格式
   * @returns 导出文件URL
   */
  exportProducts(query: Partial<ProductQuery>, format: 'excel' | 'csv' = 'excel'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return api.post('/products/export', { ...query, format })
  },

  /**
   * 验证导入数据
   * @param file Excel文件
   * @returns 验证结果
   */
  validateImportData(file: File): Promise<ApiResponse<{
    valid: boolean
    errors: ProductImportError[]
    preview: any[]
  }>> {
    return api.upload('/products/import/validate', file)
  },

  // ==================== 商品统计和分析 ====================

  /**
   * 获取商品统计信息
   * @param storeId 店铺ID（可选）
   * @returns 商品统计数据
   */
  getProductStats(storeId?: number): Promise<ApiResponse<ProductStats>> {
    return api.get('/products/stats', { params: { storeId } })
  },

  /**
   * 获取热销商品
   * @param limit 返回数量限制
   * @param days 统计天数
   * @returns 热销商品列表
   */
  getTopSellingProducts(limit: number = 10, days: number = 30): Promise<ApiResponse<Array<Product & { salesCount: number; salesAmount: number }>>> {
    return api.get('/products/top-selling', { params: { limit, days } })
  },

  /**
   * 获取低库存商品
   * @param threshold 库存阈值
   * @param limit 返回数量限制
   * @returns 低库存商品列表
   */
  getLowStockProducts(threshold?: number, limit: number = 50): Promise<ApiResponse<Array<Product & { currentStock: number }>>> {
    return api.get('/products/low-stock', { params: { threshold, limit } })
  },

  /**
   * 获取商品价格分析
   * @param categoryId 分类ID（可选）
   * @returns 价格分析数据
   */
  getPriceAnalysis(categoryId?: number): Promise<ApiResponse<{
    averagePrice: number
    medianPrice: number
    priceRanges: Array<{ range: string; count: number }>
    categoryComparison?: Array<{ categoryName: string; averagePrice: number }>
  }>> {
    return api.get('/products/price-analysis', { params: { categoryId } })
  },

  // ==================== 商品分类管理 ====================

  /**
   * 获取分类列表（分页）
   * @param query 查询参数
   * @returns 分类列表分页数据
   */
  getCategories(query: CategoryQuery): Promise<ApiResponse<PageResponse<Category>>> {
    return api.get('/categories', { params: query })
  },

  /**
   * 获取分类树形结构
   * @param includeProductCount 是否包含商品数量
   * @returns 分类树形数据
   */
  getCategoryTree(includeProductCount: boolean = false): Promise<ApiResponse<Category[]>> {
    return api.get('/categories/tree', { params: { includeProductCount } })
  },

  /**
   * 根据ID获取分类详情
   * @param id 分类ID
   * @returns 分类详细信息
   */
  getCategoryById(id: number): Promise<ApiResponse<Category>> {
    return api.get(`/categories/${id}`)
  },

  /**
   * 创建新分类
   * @param categoryForm 分类创建表单
   * @returns 创建的分类信息
   */
  createCategory(categoryForm: CreateCategoryForm): Promise<ApiResponse<Category>> {
    return api.post('/categories', categoryForm)
  },

  /**
   * 更新分类信息
   * @param categoryForm 分类更新表单
   * @returns 更新后的分类信息
   */
  updateCategory(categoryForm: UpdateCategoryForm): Promise<ApiResponse<Category>> {
    const { id, ...data } = categoryForm
    return api.put(`/categories/${id}`, data)
  },

  /**
   * 删除分类
   * @param id 分类ID
   * @param moveProductsTo 将商品移动到的分类ID
   * @returns 删除结果
   */
  deleteCategory(id: number, moveProductsTo?: number): Promise<ApiResponse<void>> {
    return api.delete(`/categories/${id}`, { 
      params: { moveProductsTo } 
    })
  },

  /**
   * 移动分类
   * @param id 分类ID
   * @param newParentId 新父分类ID
   * @param sortOrder 排序顺序
   * @returns 移动结果
   */
  moveCategory(id: number, newParentId?: number, sortOrder?: number): Promise<ApiResponse<void>> {
    return api.put(`/categories/${id}/move`, { newParentId, sortOrder })
  },

  /**
   * 获取分类路径
   * @param id 分类ID
   * @returns 分类路径
   */
  getCategoryPath(id: number): Promise<ApiResponse<Category[]>> {
    return api.get(`/categories/${id}/path`)
  },

  // ==================== 商品属性管理 ====================

  /**
   * 获取商品属性列表
   * @param categoryId 分类ID（可选）
   * @returns 属性列表
   */
  getProductAttributes(categoryId?: number): Promise<ApiResponse<ProductAttribute[]>> {
    return api.get('/products/attributes', { params: { categoryId } })
  },

  /**
   * 根据ID获取商品属性详情
   * @param id 属性ID
   * @returns 属性详细信息
   */
  getProductAttributeById(id: number): Promise<ApiResponse<ProductAttribute>> {
    return api.get(`/products/attributes/${id}`)
  },

  /**
   * 创建商品属性
   * @param attributeData 属性数据
   * @returns 创建的属性信息
   */
  createProductAttribute(attributeData: Omit<ProductAttribute, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProductAttribute>> {
    return api.post('/products/attributes', attributeData)
  },

  /**
   * 更新商品属性
   * @param id 属性ID
   * @param attributeData 属性数据
   * @returns 更新后的属性信息
   */
  updateProductAttribute(id: number, attributeData: Partial<ProductAttribute>): Promise<ApiResponse<ProductAttribute>> {
    return api.put(`/products/attributes/${id}`, attributeData)
  },

  /**
   * 删除商品属性
   * @param id 属性ID
   * @returns 删除结果
   */
  deleteProductAttribute(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/products/attributes/${id}`)
  },

  // ==================== 商品标签管理 ====================

  /**
   * 获取所有商品标签
   * @returns 标签列表
   */
  getProductTags(): Promise<ApiResponse<string[]>> {
    return api.get('/products/tags')
  },

  /**
   * 为商品添加标签
   * @param productId 商品ID
   * @param tags 标签列表
   * @returns 添加结果
   */
  addProductTags(productId: number, tags: string[]): Promise<ApiResponse<void>> {
    return api.post(`/products/${productId}/tags`, { tags })
  },

  /**
   * 移除商品标签
   * @param productId 商品ID
   * @param tags 要移除的标签列表
   * @returns 移除结果
   */
  removeProductTags(productId: number, tags: string[]): Promise<ApiResponse<void>> {
    return api.delete(`/products/${productId}/tags`, { data: { tags } })
  },

  /**
   * 根据标签搜索商品
   * @param tags 标签列表
   * @param matchAll 是否匹配所有标签
   * @returns 搜索结果
   */
  searchProductsByTags(tags: string[], matchAll: boolean = false): Promise<ApiResponse<Product[]>> {
    return api.get('/products/search/tags', { 
      params: { tags: tags.join(','), matchAll } 
    })
  }
}

export default productApi