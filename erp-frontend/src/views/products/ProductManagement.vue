<template>
  <div class="product-management">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
    </div>

    <!-- 数据表格容器 -->
    <div class="data-table-container">
      <div class="table-header">
        <div class="table-title">
          <h3>商品列表</h3>
          <span class="table-count">共 <strong>{{ productStore.state.total }}</strong> 条记录</span>
        </div>
        <div class="table-actions">
          <el-button type="primary" @click="showAddProductModal">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
          <el-button @click="goToImportPage">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="exportProducts">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedProductIds.length === 0"
            @click="batchDeleteProducts"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 高级搜索筛选器 -->
      <ProductSearchFilter
        :show-search="true"
        :filters="searchFilters"
        :quick-filters="quickFilters"
        :initial-values="initialSearchValues"
        :search-debounce="300"
        :real-time-search="true"
        search-placeholder="搜索商品名称、SKU或品牌..."
        @search="handleAdvancedSearch"
        @reset="handleSearchReset"
        @change="handleSearchChange"
      />

      <!-- 表格内容 -->
      <div class="table-wrapper">
        <!-- 加载状态 -->
        <div v-if="productStore.isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <div class="loading-text">数据加载中...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!productStore.hasProducts" class="empty-state">
          <div class="empty-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="empty-title">暂无商品数据</div>
          <div class="empty-description">当前没有找到相关商品，请尝试调整筛选条件或添加新商品</div>
          <el-button type="primary" @click="showAddProductModal">添加商品</el-button>
        </div>

        <!-- 数据表格 -->
        <el-table
          v-else
          :data="productStore.state.products"
          class="data-table"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          stripe
          border
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="商品图片" width="100">
            <template #default="{ row }">
              <div class="product-image">
                <img 
                  :src="getProductImage(row?.images)" 
                  :alt="row?.name || '商品图片'"
                  @error="handleImageError"
                />
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="sku" label="SKU" sortable="custom" min-width="120">
            <template #default="{ row }">
              <span class="product-sku">{{ row?.sku || '' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="title" label="商品名称" sortable="custom" min-width="200">
            <template #default="{ row }">
              <div class="product-info">
                <div class="product-name">{{ row?.title || row?.name || '' }}</div>
                <div class="product-attributes">
                  {{ formatAttributes(row?.attributes) }}
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="categoryName" label="分类" sortable="custom" width="120">
            <template #default="{ row }">
              <span class="product-category">{{ row?.categoryName || '未分类' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="price" label="价格" sortable="custom" width="120">
            <template #default="{ row }">
              <span class="product-price">¥{{ row?.price?.toFixed(2) || '0.00' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="stock" label="库存" sortable="custom" width="100">
            <template #default="{ row }">
              <span :class="getStockClass(row?.stock)">{{ row?.stock || '暂无' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" sortable="custom" width="100">
            <template #default="{ row }">
              <StatusBadge :status="row?.status" :type="getStatusType(row?.status)" />
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180">
            <template #default="{ row }">
              <span class="date-text">{{ formatDate(row?.createTime || row?.createdAt) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" @click="editProduct(row)" title="编辑">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" @click="viewProduct(row)" title="查看">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteProduct(row)" 
                  title="删除"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div v-if="productStore.hasProducts" class="table-pagination">
        <div class="pagination-info">
          显示第 {{ (productStore.state.currentPage - 1) * productStore.state.pageSize + 1 }}-{{ Math.min(productStore.state.currentPage * productStore.state.pageSize, productStore.state.total) }} 条，共 {{ productStore.state.total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="productStore.state.currentPage"
          v-model:page-size="productStore.state.pageSize"
          :total="productStore.state.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 商品表单模态框 -->
    <ProductFormModal
      v-model:visible="productFormVisible"
      :product="editingProduct"
      @success="handleProductSaved"
    />

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      :before-close="handleDeleteDialogClose"
    >
      <div class="delete-content">
        <div class="delete-icon">
          <el-icon color="#F56C6C" size="48"><WarningFilled /></el-icon>
        </div>
        <div class="delete-message">
          <p>确定要删除选中的商品吗？</p>
          <p class="delete-warning">此操作不可撤销，请谨慎操作。</p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleting">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Upload,
  Download, 
  Delete, 
  Edit, 
  View, 
  Box,
  WarningFilled
} from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'
import ProductFormModal from './components/ProductFormModal.vue'
import ProductSearchFilter from './components/ProductSearchFilter.vue'
import type { Product } from '@/types'

/**
 * 商品列表页面组件
 * 提供商品列表展示、搜索筛选、批量操作等功能
 */

// 状态管理
const productStore = useProductStore()

// 路由
const router = useRouter()

// 响应式数据
const selectedProductIds = ref<number[]>([])
const productFormVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const deleteDialogVisible = ref(false)
const deleting = ref(false)
const deletingProductIds = ref<number[]>([])

/**
 * 获取当前日期
 */
const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

/**
 * 获取几天前的日期
 */
const getDateDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// 搜索筛选相关
const searchFilters = ref([])
const quickFilters = ref([
  {
    key: 'active',
    label: '上架商品',
    filters: { status: 'ACTIVE' }
  },
  {
    key: 'inactive',
    label: '下架商品',
    filters: { status: 'INACTIVE' }
  },
  {
    key: 'lowStock',
    label: '低库存',
    filters: { stockStatus: 'lowStock' }
  },
  {
    key: 'newProducts',
    label: '新品',
    filters: { dateRange: [getDateDaysAgo(7), getCurrentDate()] }
  },
  {
    key: 'highPrice',
    label: '高价商品',
    filters: { minPrice: 1000 }
  }
])

const initialSearchValues = ref({})

// 面包屑导航
const breadcrumbItems = [
  { title: '首页', to: '/dashboard' },
  { title: '商品管理', to: '/products' },
  { title: '商品列表' }
]

// 生命周期
onMounted(() => {
  loadProducts()
})

// 方法定义

/**
 * 加载商品列表
 */
const loadProducts = async (searchParams?: Record<string, any>) => {
  try {
    await productStore.fetchProducts(searchParams || {})
  } catch (error) {
    console.error('加载商品列表失败:', error)
    ElMessage.error('加载商品列表失败')
  }
}

/**
 * 处理高级搜索
 */
const handleAdvancedSearch = (filters: Record<string, any>, keyword: string) => {
  const searchParams = {
    keyword,
    ...filters
  }
  
  productStore.setFilters(searchParams)
  productStore.setPagination(1)
  loadProducts(searchParams)
}

/**
 * 处理搜索重置
 */
const handleSearchReset = () => {
  productStore.clearFilters()
  productStore.setPagination(1)
  loadProducts()
}

/**
 * 处理搜索变化
 */
const handleSearchChange = (filters: Record<string, unknown>, keyword: string) => {
  // 实时搜索时的处理逻辑
  const searchParams = {
    keyword,
    ...filters
  }
  
  productStore.setFilters(searchParams)
  loadProducts(searchParams)
}

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: Product[]) => {
  selectedProductIds.value = selection.map(item => item.id)
}

/**
 * 处理排序变化
 */
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  // 这里可以实现排序逻辑
  console.log('排序变化:', prop, order)
}

/**
 * 处理页面大小变化
 */
const handleSizeChange = (size: number) => {
  productStore.setPagination(productStore.state.currentPage, size)
  loadProducts()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  productStore.setPagination(page)
  loadProducts()
}

/**
 * 显示添加商品模态框
 */
const showAddProductModal = () => {
  editingProduct.value = null
  productFormVisible.value = true
}

/**
 * 编辑商品
 */
const editProduct = (product: Product) => {
  editingProduct.value = product
  productFormVisible.value = true
}

/**
 * 查看商品详情
 */
const viewProduct = (product: Product) => {
  // 这里可以实现查看商品详情的逻辑
  ElMessage.info('查看商品详情功能待实现')
}

/**
 * 删除单个商品
 */
const deleteProduct = (product: Product) => {
  deletingProductIds.value = [product.id]
  deleteDialogVisible.value = true
}

/**
 * 批量删除商品
 */
const batchDeleteProducts = () => {
  if (selectedProductIds.value.length === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }
  deletingProductIds.value = [...selectedProductIds.value]
  deleteDialogVisible.value = true
}

/**
 * 确认删除
 */
const confirmDelete = async () => {
  deleting.value = true
  try {
    if (deletingProductIds.value.length === 1) {
      await productStore.deleteProduct(deletingProductIds.value[0])
      ElMessage.success('商品删除成功')
    } else {
      await productStore.batchDeleteProducts(deletingProductIds.value)
      ElMessage.success(`成功删除 ${deletingProductIds.value.length} 个商品`)
    }
    
    selectedProductIds.value = []
    deleteDialogVisible.value = false
    await loadProducts()
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error('删除商品失败')
  } finally {
    deleting.value = false
  }
}

/**
 * 处理删除对话框关闭
 */
const handleDeleteDialogClose = () => {
  if (!deleting.value) {
    deleteDialogVisible.value = false
    deletingProductIds.value = []
  }
}

/**
 * 处理商品保存成功
 */
const handleProductSaved = () => {
  productFormVisible.value = false
  editingProduct.value = null
  loadProducts()
}

/**
 * 导出商品数据
 */
const exportProducts = () => {
  ElMessage.info('商品数据导出功能待实现')
}

/**
 * 跳转到商品导入页面
 */
const goToImportPage = () => {
  router.push('/products/import')
}

/**
 * 获取商品图片
 */
const getProductImage = (images: string[] | null | undefined): string => {
  if (!images || images.length === 0) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGN0ZBIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEQ0RGRTYiLz4KPHBhdGggZD0iTTI1IDI1SDM1VjM1SDI1VjI1WiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K'
  }
  return images[0]
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGN0ZBIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEQ0RGRTYiLz4KPHBhdGggZD0iTTI1IDI1SDM1VjM1SDI1VjI1WiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K'
  img.style.opacity = '0.7'
}

/**
 * 格式化商品属性
 */
const formatAttributes = (attributes: Record<string, unknown> | undefined): string => {
  if (!attributes) return ''
  
  const attrs: string[] = []
  if (attributes.brand) attrs.push(`品牌: ${attributes.brand}`)
  if (attributes.color) attrs.push(`颜色: ${attributes.color}`)
  if (attributes.storage) attrs.push(`存储: ${attributes.storage}`)
  if (attributes.processor) attrs.push(`处理器: ${attributes.processor}`)
  if (attributes.memory) attrs.push(`内存: ${attributes.memory}`)
  
  return attrs.slice(0, 2).join(' | ')
}

/**
 * 获取库存样式类
 */
const getStockClass = (stock: number | undefined): string => {
  if (!stock || stock === 0) return 'stock-out'
  if (stock <= 10) return 'stock-low'
  return 'stock-normal'
}

/**
 * 获取状态类型
 */
const getStatusType = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
/* 页面头部样式 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0;
}

/* 数据表格容器样式 */
.data-table-container {
  background: var(--bg-color-primary);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color-light);
}

.table-title h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color-primary);
  margin: 0 0 4px;
}

.table-count {
  font-size: 13px;
  color: var(--text-color-secondary);
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 筛选器样式 */
.table-filters {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-light);
  background: var(--bg-color-tertiary);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-input {
  width: 240px;
}

.filter-select {
  width: 140px;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-secondary);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  color: var(--text-color-primary);
  line-height: 1.4;
}

.product-attributes {
  font-size: 12px;
  color: var(--text-color-secondary);
  line-height: 1.3;
}

.product-sku {
  font-family: var(--font-family-mono);
  font-size: 13px;
  color: var(--text-color-regular);
}

.product-category {
  color: var(--text-color-regular);
}

.product-price {
  font-weight: 500;
  color: var(--text-color-primary);
}

.stock-out {
  color: var(--danger-color);
  font-weight: 500;
}

.stock-low {
  color: var(--warning-color);
  font-weight: 500;
}

.stock-normal {
  color: var(--success-color);
  font-weight: 500;
}

.date-text {
  color: var(--text-color-secondary);
  font-size: 13px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 分页样式 */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color-light);
}

.pagination-info {
  font-size: 13px;
  color: var(--text-color-secondary);
}

/* 加载和空状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-color-secondary);
}

.loading-spinner {
  margin-bottom: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--text-color-placeholder);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color-regular);
  margin-bottom: 12px;
}

.empty-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 24px;
}

/* 删除确认对话框样式 */
.delete-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.delete-icon {
  flex-shrink: 0;
}

.delete-message p {
  margin: 0 0 8px;
  color: var(--text-color-primary);
}

.delete-warning {
  color: var(--text-color-secondary);
  font-size: 13px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-input,
  .filter-select {
    width: 100%;
  }
  
  .table-pagination {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>