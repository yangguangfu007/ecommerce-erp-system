/**
 * 商品数据状态管理
 * 管理商品列表、分类、搜索等业务数据的缓存和同步
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productApi } from '@/api/modules/product'
import { useBaseStore } from './base'
import type { 
  Product, 
  Category, 
  ProductQuery, 
  CreateProductForm, 
  UpdateProductForm,
  ProductStats,
  PageResponse,
  ApiResponse
} from '@/types'

// 商品状态接口
interface ProductState {
  // 商品列表数据
  products: Product[]
  total: number
  currentPage: number
  pageSize: number
  
  // 分类数据
  categories: Category[]
  categoryTree: Category[]
  
  // 搜索和筛选
  searchKeyword: string
  filters: Partial<ProductQuery>
  selectedProductIds: number[]
  
  // 统计数据
  stats: ProductStats | null
  
  // 缓存控制
  lastFetchTime: number | null
  cacheExpiry: number // 缓存过期时间（毫秒）
}

export const useProductStore = defineStore('product', () => {
  // 基础状态管理
  const baseStore = useBaseStore({
    loading: false,
    error: null,
    lastUpdated: null
  })

  // 商品状态
  const state = ref<ProductState>({
    products: [],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    categories: [],
    categoryTree: [],
    searchKeyword: '',
    filters: {},
    selectedProductIds: [],
    stats: null,
    lastFetchTime: null,
    cacheExpiry: 5 * 60 * 1000 // 5分钟缓存
  })

  // 计算属性
  const isLoading = computed(() => baseStore.isLoading.value)
  const hasError = computed(() => baseStore.hasError.value)
  const error = computed(() => baseStore.state.value.error)

  // 是否有商品数据
  const hasProducts = computed(() => state.value.products?.length > 0)
  
  // 是否有分类数据
  const hasCategories = computed(() => state.value.categories?.length > 0)
  
  // 选中的商品数量
  const selectedCount = computed(() => state.value.selectedProductIds?.length || 0)
  
  // 是否需要刷新数据（缓存过期）
  const needsRefresh = computed(() => {
    if (!state.value.lastFetchTime) return true
    return Date.now() - state.value.lastFetchTime > state.value.cacheExpiry
  })

  // 获取商品列表
  const fetchProducts = async (query: Partial<ProductQuery> = {}) => {
    return await baseStore.withLoading(async () => {
      const params: ProductQuery = {
        page: query.page || state.value.currentPage,
        size: query.size || state.value.pageSize,
        ...state.value.filters,
        ...query
      }

      const response: ApiResponse<PageResponse<Product>> = await productApi.getProducts(params)
      
      state.value.products = response.data.records || []
      state.value.total = response.data.total || 0
      state.value.currentPage = response.data.current || 1
      state.value.pageSize = response.data.size || 20
      state.value.lastFetchTime = Date.now()
      
      return response.data
    })
  }

  // 获取商品详情
  const fetchProductById = async (id: number): Promise<Product | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Product> = await productApi.getProductById(id)
      
      // 更新缓存中的商品信息
      const index = state.value.products.findIndex(p => p.id === id)
      if (index !== -1) {
        state.value.products[index] = response.data
      }
      
      return response.data
    })
  }

  // 根据SKU获取商品
  const fetchProductBySku = async (sku: string): Promise<Product | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Product> = await productApi.getProductBySku(sku)
      return response.data
    })
  }

  // 创建商品
  const createProduct = async (productForm: CreateProductForm): Promise<Product | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Product> = await productApi.createProduct(productForm)
      
      // 添加到列表开头
      state.value.products.unshift(response.data)
      state.value.total += 1
      
      return response.data
    })
  }

  // 更新商品
  const updateProduct = async (productForm: UpdateProductForm): Promise<Product | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Product> = await productApi.updateProduct(productForm)
      
      // 更新缓存中的商品信息
      const index = state.value.products.findIndex(p => p.id === productForm.id)
      if (index !== -1) {
        state.value.products[index] = response.data
      }
      
      return response.data
    })
  }

  // 删除商品
  const deleteProduct = async (id: number): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      await productApi.deleteProduct(id)
      
      // 从列表中移除
      const index = state.value.products.findIndex(p => p.id === id)
      if (index !== -1) {
        state.value.products.splice(index, 1)
        state.value.total -= 1
      }
      
      // 从选中列表中移除
      const selectedIndex = state.value.selectedProductIds.indexOf(id)
      if (selectedIndex !== -1) {
        state.value.selectedProductIds.splice(selectedIndex, 1)
      }
      
      return true
    }) !== null
  }

  // 批量删除商品
  const batchDeleteProducts = async (ids: number[]): Promise<boolean> => {
    return await baseStore.withLoading(async () => {
      const response = await productApi.batchOperateProducts({
        productIds: ids,
        operation: 'delete'
      })
      
      // 从列表中移除已删除的商品
      state.value.products = state.value.products.filter(p => !ids.includes(p.id))
      state.value.total -= response.data.success
      
      // 清空选中列表
      state.value.selectedProductIds = []
      
      return response.data.success > 0
    }) !== null
  }

  // 搜索商品
  const searchProducts = async (keyword: string, filters: Partial<ProductQuery> = {}): Promise<Product[]> => {
    state.value.searchKeyword = keyword
    state.value.filters = { ...state.value.filters, ...filters }
    
    if (!keyword.trim() && Object.keys(filters).length === 0) {
      await fetchProducts()
      return state.value.products
    }
    
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Product[]> = await productApi.searchProducts(keyword, filters)
      
      state.value.products = response.data
      state.value.total = response.data.length
      state.value.currentPage = 1
      
      return response.data
    }) || []
  }

  // 获取分类列表
  const fetchCategories = async (refresh = false): Promise<Category[]> => {
    if (!refresh && state.value.categories?.length > 0) {
      return state.value.categories
    }
    
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<PageResponse<Category>> = await productApi.getCategories({
        page: 1,
        size: 1000 // 获取所有分类
      })
      
      state.value.categories = response.data.list
      return response.data.list
    }) || []
  }

  // 获取分类树
  const fetchCategoryTree = async (refresh = false): Promise<Category[]> => {
    if (!refresh && state.value.categoryTree?.length > 0) {
      return state.value.categoryTree
    }
    
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<Category[]> = await productApi.getCategoryTree(true)
      
      state.value.categoryTree = response.data
      return response.data
    }) || []
  }

  // 获取商品统计
  const fetchProductStats = async (storeId?: number): Promise<ProductStats | null> => {
    return await baseStore.withLoading(async () => {
      const response: ApiResponse<ProductStats> = await productApi.getProductStats(storeId)
      
      state.value.stats = response.data
      return response.data
    })
  }

  // 设置筛选条件
  const setFilters = (filters: Partial<ProductQuery>) => {
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

  // 选择商品
  const selectProduct = (id: number) => {
    if (!state.value.selectedProductIds.includes(id)) {
      state.value.selectedProductIds.push(id)
    }
  }

  // 取消选择商品
  const unselectProduct = (id: number) => {
    const index = state.value.selectedProductIds.indexOf(id)
    if (index !== -1) {
      state.value.selectedProductIds.splice(index, 1)
    }
  }

  // 切换商品选择状态
  const toggleProductSelection = (id: number) => {
    if (state.value.selectedProductIds.includes(id)) {
      unselectProduct(id)
    } else {
      selectProduct(id)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (state.value.selectedProductIds?.length === state.value.products?.length) {
      state.value.selectedProductIds = []
    } else {
      state.value.selectedProductIds = state.value.products?.map(p => p.id) || []
    }
  }

  // 清空选择
  const clearSelection = () => {
    state.value.selectedProductIds = []
  }

  // 获取选中的商品
  const getSelectedProducts = computed(() => {
    if (!state.value.products || !state.value.selectedProductIds) {
      return []
    }
    return state.value.products.filter(p => state.value.selectedProductIds.includes(p.id))
  })

  // 刷新数据
  const refresh = async () => {
    state.value.lastFetchTime = null
    await fetchProducts()
  }

  // 重置状态
  const reset = () => {
    state.value.products = []
    state.value.total = 0
    state.value.currentPage = 1
    state.value.categories = []
    state.value.categoryTree = []
    state.value.searchKeyword = ''
    state.value.filters = {}
    state.value.selectedProductIds = []
    state.value.stats = null
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
    hasProducts,
    hasCategories,
    selectedCount,
    needsRefresh,
    getSelectedProducts,
    isCacheValid,
    
    // 商品操作
    fetchProducts,
    fetchProductById,
    fetchProductBySku,
    createProduct,
    updateProduct,
    deleteProduct,
    batchDeleteProducts,
    searchProducts,
    
    // 分类操作
    fetchCategories,
    fetchCategoryTree,
    
    // 统计操作
    fetchProductStats,
    
    // 筛选和搜索
    setFilters,
    clearFilters,
    setPagination,
    
    // 选择操作
    selectProduct,
    unselectProduct,
    toggleProductSelection,
    toggleSelectAll,
    clearSelection,
    
    // 工具方法
    refresh,
    reset,
    invalidateCache
  }
})

export type ProductStore = ReturnType<typeof useProductStore>