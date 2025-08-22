<template>
  <div class="inventory-management">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-section">
        <h2 class="page-title">库存列表</h2>
        <p class="page-description">管理商品库存信息，监控库存状态和预警</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="default" 
          :icon="Refresh" 
          @click="refreshData"
          :loading="loading"
        >
          刷新
        </el-button>
        <el-button 
          type="primary" 
          :icon="Edit" 
          @click="showBatchAdjustDialog = true"
          :disabled="selectedInventory.length === 0"
        >
          批量调整
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="content-card">
      <div class="card-body">
        <SearchFilter
          v-model:keyword="searchParams.keyword"
          :filters="filterOptions"
          v-model:activeFilters="searchParams"
          @search="handleSearch"
          @reset="handleReset"
          placeholder="搜索商品名称或SKU..."
        />
      </div>
    </div>

    <!-- 批量操作栏 -->
    <BatchOperations
      v-if="selectedInventory.length > 0"
      :selected-count="selectedInventory.length"
      :actions="batchActions"
      @action="handleBatchAction"
      @clear="clearSelection"
    />

    <!-- 库存列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">库存信息 ({{ pagination.total }})</h3>
        <div class="card-actions">
          <el-button 
            type="text" 
            :icon="Download" 
            @click="exportInventory"
          >
            导出
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="table-wrapper">
          <!-- 调试信息 -->
          <div v-if="inventoryList.length === 0 && !loading" style="padding: 20px; text-align: center; color: #999;">
            暂无库存数据 (总数: {{ pagination.total }})
          </div>
          <div v-if="inventoryList.length > 0" style="padding: 10px; background: #f0f9ff; margin-bottom: 10px;">
            已加载 {{ inventoryList.length }} 条库存记录
          </div>
          
          <el-table
            :data="inventoryList"
            :loading="loading"
            @selection-change="handleSelectionChange"
            style="width: 100%"
            stripe
            border
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="SKU" prop="sku" width="150">
            </el-table-column>
            
            <el-table-column label="商品名称" prop="productName" min-width="200">
            </el-table-column>

            <el-table-column label="总库存" prop="totalQuantity" width="100" align="center">
            </el-table-column>

            <el-table-column label="可用库存" prop="availableQuantity" width="100" align="center">
            </el-table-column>

            <el-table-column label="预留库存" prop="reservedQuantity" width="100" align="center">
            </el-table-column>

            <el-table-column label="安全库存" prop="safetyStock" width="100" align="center">
            </el-table-column>

            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="adjustStock(row)">
                  调整
                </el-button>
                <el-button type="default" size="small" @click="viewHistory(row)">
                  历史
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="table-footer">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 库存调整对话框 -->
    <InventoryAdjustDialog
      v-model="showAdjustDialog"
      :current-inventory="currentInventory"
      :is-edit="true"
      @confirm="handleAdjustConfirm"
    />

    <!-- 批量调整对话框 -->
    <InventoryAdjustDialog
      v-model="showBatchAdjustDialog"
      :selected-items="selectedInventory"
      :is-edit="false"
      @confirm="handleBatchAdjustConfirm"
    />

    <!-- 库存历史对话框 -->
    <InventoryHistoryDialog
      v-model="showHistoryDialog"
      :inventory="currentInventory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Edit, Download, Clock } from '@element-plus/icons-vue'
import { useInventoryStore } from '@/stores/inventory'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import SearchFilter from '@/components/business/SearchFilter.vue'
import BatchOperations from '@/components/business/BatchOperations.vue'

import StatusBadge from '@/components/business/StatusBadge.vue'
import InventoryAdjustDialog from '@/components/business/InventoryAdjustDialog.vue'
import InventoryHistoryDialog from '@/components/business/InventoryHistoryDialog.vue'

// 类型定义
interface InventoryItem {
  id: string
  sku: string
  productName: string
  productImage?: string
  totalQuantity: number
  availableQuantity: number
  reservedQuantity: number
  safetyStock: number
  status: 'normal' | 'low' | 'critical' | 'out_of_stock'
  updateTime: string
  warehouseLocation?: string
}

// Store
const inventoryStore = useInventoryStore()

// 响应式数据
const loading = ref(false)
const showAdjustDialog = ref(false)
const showBatchAdjustDialog = ref(false)
const showHistoryDialog = ref(false)
const selectedInventory = ref<InventoryItem[]>([])
const currentInventory = ref<InventoryItem | null>(null)

// 防止重复请求的标志
const isInitialized = ref(false)

// 搜索参数
const searchParams = reactive({
  keyword: '',
  status: '',
  minStock: '',
  maxStock: '',
  alertOnly: false
})

// 分页参数
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 调试信息
console.log('库存管理组件初始化完成')
console.log('初始状态 - loading:', loading.value)
console.log('初始状态 - pagination:', pagination)



// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '库存管理', to: '/inventory' },
  { label: '库存列表' }
]

// 筛选选项
const filterOptions = [
  {
    key: 'status',
    label: '库存状态',
    type: 'select',
    options: [
      { label: '全部状态', value: '' },
      { label: '正常', value: 'normal' },
      { label: '库存不足', value: 'low' },
      { label: '严重不足', value: 'critical' },
      { label: '缺货', value: 'out_of_stock' }
    ]
  },
  {
    key: 'alertOnly',
    label: '仅显示预警',
    type: 'switch'
  }
]

// 批量操作选项
const batchActions = [
  { key: 'adjust', label: '批量调整', icon: 'Edit' },
  { key: 'export', label: '导出选中', icon: 'Download' }
]



// 计算属性
const inventoryList = computed(() => {
  return inventoryStore.inventoryList
})

// 方法
const loadInventoryList = async () => {
  if (loading.value) {
    console.log('正在加载中，跳过重复请求')
    return
  }
  
  loading.value = true
  try {
    const params = {
      ...searchParams,
      page: pagination.page,
      size: pagination.size
    }
    
    console.log('发起库存列表请求，参数:', params)
    const response = await inventoryStore.getInventoryList(params)
    console.log('库存列表响应:', response)
    
    if (response && response.total !== undefined) {
      pagination.total = response.total
      console.log('更新分页信息，总数:', response.total)
    }
    
    console.log('当前库存列表数据:', inventoryList.value)
    isInitialized.value = true
  } catch (error) {
    console.error('加载库存列表详细错误:', error)
    ElMessage.error('加载库存列表失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadInventoryList()
}

const handleSearch = () => {
  pagination.page = 1
  loadInventoryList()
}

const handleReset = () => {
  Object.assign(searchParams, {
    keyword: '',
    status: '',
    minStock: '',
    maxStock: '',
    alertOnly: false
  })
  pagination.page = 1
  loadInventoryList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadInventoryList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadInventoryList()
}

const handleSelectionChange = (selection: InventoryItem[]) => {
  selectedInventory.value = selection
}

const clearSelection = () => {
  selectedInventory.value = []
}

const handleBatchAction = async (action: string) => {
  switch (action) {
    case 'adjust':
      showBatchAdjustDialog.value = true
      break
    case 'export':
      await exportSelectedInventory()
      break
  }
}

// 状态相关方法
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    normal: 'success',
    low: 'warning',
    critical: 'danger',
    out_of_stock: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    normal: '正常',
    low: '库存不足',
    critical: '严重不足',
    out_of_stock: '缺货'
  }
  return textMap[status] || '未知'
}

// 时间格式化
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN')
}

// 库存调整
const adjustStock = (inventory: InventoryItem) => {
  currentInventory.value = inventory
  showAdjustDialog.value = true
}

const handleAdjustConfirm = async (adjustmentData: any) => {
  try {
    await inventoryStore.adjustInventory(currentInventory.value!.id, adjustmentData)
    ElMessage.success('库存调整成功')
    loadInventoryList()
  } catch (error) {
    ElMessage.error('库存调整失败')
  }
}

const handleBatchAdjustConfirm = async (batchData: any) => {
  try {
    await inventoryStore.batchAdjustInventory(batchData.items)
    ElMessage.success('批量调整成功')
    clearSelection()
    loadInventoryList()
  } catch (error) {
    ElMessage.error('批量调整失败')
  }
}

// 查看历史
const viewHistory = (inventory: InventoryItem) => {
  currentInventory.value = inventory
  showHistoryDialog.value = true
}

// 导出功能
const exportInventory = async () => {
  try {
    await inventoryStore.exportInventory(searchParams)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const exportSelectedInventory = async () => {
  try {
    const inventoryIds = selectedInventory.value.map(item => item.id)
    await inventoryStore.exportSelectedInventory(inventoryIds)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 生命周期
onMounted(() => {
  console.log('库存管理页面已挂载，开始加载数据...')
  if (!isInitialized.value) {
    loadInventoryList()
  }
})
</script>

<style scoped>
.inventory-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-title-section {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 20px;
}

.table-wrapper {
  margin-bottom: 16px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.product-sku {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.stock-number {
  font-weight: 600;
  font-size: 16px;
}

.stock-number.available {
  color: var(--el-color-success);
}

.stock-number.reserved {
  color: var(--el-color-warning);
}

.threshold-number {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-detail {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.current-stock {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.batch-adjust-content {
  margin-bottom: 20px;
}

.selected-items {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.selected-items h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.item-list {
  max-height: 200px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.item-row:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-sku {
  flex: 0 0 120px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.item-stock {
  flex: 0 0 80px;
  text-align: right;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .inventory-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>