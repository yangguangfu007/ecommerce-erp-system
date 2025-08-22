import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import ProductManagement from '../ProductManagement.vue'
import { useProductStore } from '@/stores/product'
import type { Product } from '@/types'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock stores
vi.mock('@/stores/product', () => ({
  useProductStore: vi.fn()
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Mock components
vi.mock('@/components/business/BreadcrumbNav.vue', () => ({
  default: { template: '<div class="breadcrumb-nav">BreadcrumbNav</div>' }
}))

vi.mock('@/components/business/StatusBadge.vue', () => ({
  default: { template: '<div class="status-badge">StatusBadge</div>' }
}))

vi.mock('../components/ProductFormModal.vue', () => ({
  default: { template: '<div class="product-form-modal">ProductFormModal</div>' }
}))

vi.mock('../components/ProductSearchFilter.vue', () => ({
  default: { template: '<div class="product-search-filter">ProductSearchFilter</div>' }
}))

// Global component stubs for Element Plus
const globalStubs = {
  'el-button': { template: '<button class="el-button"><slot /></button>' },
  'el-input': { template: '<input class="el-input" />' },
  'el-select': { template: '<select class="el-select"><slot /></select>' },
  'el-option': { template: '<option class="el-option"><slot /></option>' },
  'el-table': { template: '<div class="el-table"><slot /></div>' },
  'el-table-column': { template: '<div class="el-table-column"><slot /></div>' },
  'el-pagination': { template: '<div class="el-pagination">pagination</div>' },
  'el-dialog': { template: '<div class="el-dialog"><slot /></div>' },
  'el-icon': { template: '<i class="el-icon"><slot /></i>' },
  'BreadcrumbNav': { template: '<div class="breadcrumb-nav">BreadcrumbNav</div>' },
  'StatusBadge': { template: '<div class="status-badge">StatusBadge</div>' },
  'ProductFormModal': { template: '<div class="product-form-modal">ProductFormModal</div>' },
  'ProductSearchFilter': { template: '<div class="product-search-filter">ProductSearchFilter</div>' }
}

describe('商品管理页面测试', () => {
  let mockProductStore: unknown

  // 模拟商品数据
  const mockProducts: Product[] = [
    {
      id: 1,
      sku: 'SKU001',
      title: 'iPhone 15 Pro Max',
      description: '最新款iPhone',
      categoryId: 1,
      categoryName: '手机数码',
      price: 9999.00,
      stock: 50,
      status: 'ACTIVE',
      images: ['image1.jpg'],
      attributes: {
        brand: 'Apple',
        color: '深空黑'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      sku: 'SKU002',
      title: 'MacBook Pro 14英寸',
      description: '专业级笔记本电脑',
      categoryId: 2,
      categoryName: '电脑办公',
      price: 15999.00,
      stock: 25,
      status: 'ACTIVE',
      images: ['image2.jpg'],
      attributes: {
        brand: 'Apple',
        color: '银色'
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ]

  beforeEach(() => {
    // 重置 mock
    vi.clearAllMocks()

    // 创建 mock store
    mockProductStore = {
      state: {
        products: mockProducts,
        total: mockProducts.length,
        currentPage: 1,
        pageSize: 20,
        categories: [],
        categoryTree: [],
        searchKeyword: '',
        filters: {},
        selectedProductIds: [],
        stats: null,
        lastFetchTime: null,
        cacheExpiry: 5 * 60 * 1000
      },
      isLoading: false,
      hasError: false,
      error: null,
      hasProducts: true,
      hasCategories: false,
      selectedCount: 0,
      needsRefresh: false,
      getSelectedProducts: [],
      isCacheValid: true,
      fetchProducts: vi.fn().mockResolvedValue({ data: { list: mockProducts, total: mockProducts.length, page: 1, size: 20 } }),
      fetchProductById: vi.fn(),
      fetchProductBySku: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn().mockResolvedValue(true),
      batchDeleteProducts: vi.fn().mockResolvedValue(true),
      searchProducts: vi.fn(),
      fetchCategories: vi.fn(),
      fetchCategoryTree: vi.fn(),
      fetchProductStats: vi.fn(),
      setFilters: vi.fn(),
      clearFilters: vi.fn(),
      setPagination: vi.fn(),
      selectProduct: vi.fn(),
      unselectProduct: vi.fn(),
      toggleProductSelection: vi.fn(),
      toggleSelectAll: vi.fn(),
      clearSelection: vi.fn(),
      refresh: vi.fn(),
      reset: vi.fn(),
      invalidateCache: vi.fn()
    }

    // Mock useProductStore
    vi.mocked(useProductStore).mockReturnValue(mockProductStore)
  })

  it('应该正确渲染商品管理页面', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查页面标题
    expect(wrapper.find('.page-title').text()).toBe('商品管理')
    
    // 检查表格标题
    expect(wrapper.find('.table-title h3').text()).toBe('商品列表')
    
    // 检查记录数量显示
    expect(wrapper.find('.table-count').text()).toContain('共')
    expect(wrapper.find('.table-count').text()).toContain('条记录')
  })

  it('应该显示正确的操作按钮', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查操作按钮容器存在
    expect(wrapper.find('.table-actions').exists()).toBe(true)
  })

  it('应该显示筛选器组件', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查新的搜索筛选器组件
    expect(wrapper.find('.product-search-filter').exists()).toBe(true)
  })

  it('应该在有商品数据时显示表格', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查表格容器存在
    expect(wrapper.find('.table-wrapper').exists()).toBe(true)
    
    // 检查分页组件
    expect(wrapper.find('.table-pagination').exists()).toBe(true)
    expect(wrapper.find('.pagination-info').exists()).toBe(true)
  })

  it('应该在没有商品数据时显示空状态', () => {
    // 修改 mock store 为空数据
    mockProductStore.state.products = []
    mockProductStore.state.total = 0
    mockProductStore.hasProducts = false

    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查空状态
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-title').text()).toBe('暂无商品数据')
    expect(wrapper.find('.empty-description').text()).toContain('当前没有找到相关商品')
  })

  it('应该在加载时显示加载状态', () => {
    // 修改 mock store 为加载状态
    mockProductStore.isLoading = true

    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查加载状态
    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.loading-text').text()).toBe('数据加载中...')
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('应该正确处理高级搜索', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: {
          ...globalStubs,
          'ProductSearchFilter': { 
            template: '<div class="product-search-filter">ProductSearchFilter</div>',
            emits: ['search', 'reset', 'change']
          }
        }
      }
    })

    // 直接调用组件方法
    await wrapper.vm.handleAdvancedSearch({ category: '手机数码', status: 'ACTIVE' }, 'iPhone')

    // 检查是否调用了相关方法
    expect(mockProductStore.setFilters).toHaveBeenCalledWith({
      keyword: 'iPhone',
      category: '手机数码',
      status: 'ACTIVE'
    })
    expect(mockProductStore.setPagination).toHaveBeenCalledWith(1)
    expect(mockProductStore.fetchProducts).toHaveBeenCalled()
  })

  it('应该正确处理搜索重置', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: {
          ...globalStubs,
          'ProductSearchFilter': { 
            template: '<div class="product-search-filter">ProductSearchFilter</div>',
            emits: ['search', 'reset', 'change']
          }
        }
      }
    })

    // 直接调用组件方法
    await wrapper.vm.handleSearchReset()

    // 检查是否调用了相关方法
    expect(mockProductStore.clearFilters).toHaveBeenCalled()
    expect(mockProductStore.setPagination).toHaveBeenCalledWith(1)
    expect(mockProductStore.fetchProducts).toHaveBeenCalled()
  })

  it('应该正确处理实时搜索变化', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: {
          ...globalStubs,
          'ProductSearchFilter': { 
            template: '<div class="product-search-filter">ProductSearchFilter</div>',
            emits: ['search', 'reset', 'change']
          }
        }
      }
    })

    // 直接调用组件方法
    await wrapper.vm.handleSearchChange({ brand: 'Apple' }, 'iPhone')

    // 检查是否调用了相关方法
    expect(mockProductStore.setFilters).toHaveBeenCalledWith({
      keyword: 'iPhone',
      brand: 'Apple'
    })
    expect(mockProductStore.fetchProducts).toHaveBeenCalled()
  })

  it('应该正确处理新增商品', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 直接调用组件方法
    await wrapper.vm.showAddProductModal()

    // 检查模态框是否显示
    expect(wrapper.vm.productFormVisible).toBe(true)
    expect(wrapper.vm.editingProduct).toBeNull()
  })

  it('应该正确处理商品删除', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 模拟删除商品
    await wrapper.vm.deleteProduct(mockProducts[0])

    // 检查删除对话框是否显示
    expect(wrapper.vm.deleteDialogVisible).toBe(true)
    expect(wrapper.vm.deletingProductIds).toEqual([1])
  })

  it('应该正确处理批量删除', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 设置选中的商品
    wrapper.vm.selectedProductIds = [1, 2]

    // 模拟批量删除
    await wrapper.vm.batchDeleteProducts()

    // 检查删除对话框是否显示
    expect(wrapper.vm.deleteDialogVisible).toBe(true)
    expect(wrapper.vm.deletingProductIds).toEqual([1, 2])
  })

  it('应该正确处理分页变化', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 模拟页面大小变化
    await wrapper.vm.handleSizeChange(50)
    expect(mockProductStore.setPagination).toHaveBeenCalledWith(1, 50)
    expect(mockProductStore.fetchProducts).toHaveBeenCalled()

    // 模拟当前页变化
    await wrapper.vm.handleCurrentChange(2)
    expect(mockProductStore.setPagination).toHaveBeenCalledWith(2)
    expect(mockProductStore.fetchProducts).toHaveBeenCalled()
  })

  it('应该正确格式化商品属性', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 测试属性格式化
    const attributes = {
      brand: 'Apple',
      color: '深空黑',
      storage: '256GB',
      processor: 'A17 Pro'
    }

    const formatted = wrapper.vm.formatAttributes(attributes)
    expect(formatted).toContain('品牌: Apple')
    expect(formatted).toContain('颜色: 深空黑')
    expect(formatted).toContain('|')
  })

  it('应该正确获取库存样式类', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 测试库存样式类
    expect(wrapper.vm.getStockClass(0)).toBe('stock-out')
    expect(wrapper.vm.getStockClass(5)).toBe('stock-low')
    expect(wrapper.vm.getStockClass(50)).toBe('stock-normal')
  })

  it('应该正确获取状态类型', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 测试状态类型
    expect(wrapper.vm.getStatusType('ACTIVE')).toBe('success')
    expect(wrapper.vm.getStatusType('INACTIVE')).toBe('danger')
    expect(wrapper.vm.getStatusType('UNKNOWN')).toBe('info')
  })

  it('应该正确格式化日期', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 测试日期格式化
    const dateString = '2024-01-01T00:00:00Z'
    const formatted = wrapper.vm.formatDate(dateString)
    expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
  })

  it('应该正确处理图片加载错误', () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 创建模拟图片元素
    const mockImg = {
      src: '',
      style: { opacity: '' }
    }

    const mockEvent = {
      target: mockImg
    }

    // 调用错误处理函数
    wrapper.vm.handleImageError(mockEvent)

    // 检查是否设置了默认图片
    expect(mockImg.src).toBe('/src/assets/images/placeholder.jpg')
    expect(mockImg.style.opacity).toBe('0.7')
  })

  it('应该在组件挂载时加载商品数据', () => {
    shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查是否调用了加载方法
    expect(mockProductStore.fetchProducts).toHaveBeenCalled()
  })

  it('应该正确处理导出功能', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 模拟点击导出按钮
    await wrapper.vm.exportProducts()

    // 检查是否显示提示信息
    expect(ElMessage.info).toHaveBeenCalledWith('商品数据导出功能待实现')
  })

  it('应该正确处理查看商品详情', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 模拟查看商品详情
    await wrapper.vm.viewProduct(mockProducts[0])

    // 检查是否显示提示信息
    expect(ElMessage.info).toHaveBeenCalledWith('查看商品详情功能待实现')
  })

  it('应该正确处理跳转到导入页面', async () => {
    const wrapper = shallowMount(ProductManagement, {
      global: {
        stubs: globalStubs
      }
    })

    // 检查 goToImportPage 方法存在
    expect(typeof wrapper.vm.goToImportPage).toBe('function')
    
    // 检查方法可以被调用而不报错
    expect(() => wrapper.vm.goToImportPage()).not.toThrow()
  })
})