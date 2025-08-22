<template>
  <div class="multi-store-inventory">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-section">
        <h2 class="page-title">多店铺库存管理</h2>
        <p class="page-description">管理不同店铺的库存分配和调拨</p>
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
          :icon="Transfer" 
          @click="showTransferDialog = true"
          :disabled="selectedInventory.length === 0"
        >
          库存调拨
        </el-button>
      </div>
    </div>

    <!-- 店铺选择和筛选 -->
    <div class="content-card">
      <div class="card-body">
        <div class="store-filters">
          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">选择店铺</label>
              <el-select
                v-model="selectedStoreId"
                placeholder="选择店铺"
                clearable
                style="width: 200px"
                @change="handleStoreChange"
              >
                <el-option
                  v-for="store in storeList"
                  :key="store.id"
                  :label="store.name"
                  :value="store.id"
                />
              </el-select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">商品SKU</label>
              <el-input
                v-model="searchParams.sku"
                placeholder="输入SKU搜索"
                clearable
                style="width: 200px"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">库存状态</label>
              <el-select
                v-model="searchParams.status"
                placeholder="选择状态"
                clearable
                style="width: 150px"
              >
                <el-option label="全部" value="" />
                <el-option label="正常" value="normal" />
                <el-option label="库存不足" value="low" />
                <el-option label="严重不足" value="critical" />
                <el-option label="缺货" value="out_of_stock" />
              </el-select>
            </div>

            <div class="filter-actions">
              <el-button 
                type="primary" 
                :icon="Search" 
                @click="handleSearch"
              >
                搜索
              </el-button>
              <el-button 
                type="default" 
                @click="handleReset"
              >
                重置
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>   
 <!-- 店铺库存统计 -->
    <div class="store-stats-cards">
      <div class="stat-card" v-for="store in storeList" :key="store.id">
        <div class="stat-header">
          <div class="store-info">
            <h4 class="store-name">{{ store.name }}</h4>
            <span class="store-status" :class="store.status">{{ getStoreStatusText(store.status) }}</span>
          </div>
          <div class="store-actions">
            <el-button
              type="text"
              size="small"
              @click="viewStoreInventory(store.id)"
            >
              查看详情
            </el-button>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-row">
            <span class="stat-label">总商品数</span>
            <span class="stat-value">{{ store.stats.totalItems }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">库存总值</span>
            <span class="stat-value">¥{{ formatCurrency(store.stats.totalValue) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">预警商品</span>
            <span class="stat-value warning">{{ store.stats.alertItems }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">缺货商品</span>
            <span class="stat-value danger">{{ store.stats.outOfStockItems }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 库存对比表格 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">库存对比 ({{ pagination.total }})</h3>
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
          <BaseTable
            :data="inventoryList"
            :loading="loading"
            v-model:selection="selectedInventory"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="商品信息" min-width="200" fixed="left">
              <template #default="{ row }">
                <div class="product-info">
                  <div class="product-name">{{ row.productName }}</div>
                  <div class="product-sku">SKU: {{ row.sku }}</div>
                </div>
              </template>
            </el-table-column>

            <!-- 动态生成店铺列 -->
            <el-table-column 
              v-for="store in storeList" 
              :key="store.id"
              :label="store.name"
              width="150"
              align="center"
            >
              <template #default="{ row }">
                <div class="store-inventory">
                  <div class="inventory-quantity">
                    {{ getStoreInventory(row, store.id)?.availableQuantity || 0 }}
                  </div>
                  <div class="inventory-status">
                    <StatusBadge 
                      :status="getStoreInventoryStatus(row, store.id)"
                      :type="getStatusType(getStoreInventoryStatus(row, store.id))"
                      :text="getStatusText(getStoreInventoryStatus(row, store.id))"
                      size="small"
                    />
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="总库存" width="100" align="center">
              <template #default="{ row }">
                <span class="total-inventory">{{ getTotalInventory(row) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="Transfer"
                    @click="transferInventory(row)"
                    title="库存调拨"
                  />
                  <el-button
                    type="default"
                    size="small"
                    :icon="Setting"
                    @click="setAlert(row)"
                    title="设置预警"
                  />
                </div>
              </template>
            </el-table-column>
          </BaseTable>
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

    <!-- 库存调拨对话框 -->
    <el-dialog
      v-model="showTransferDialog"
      title="库存调拨"
      width="600px"
    >
      <div class="transfer-form">
        <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" label-width="100px">
          <el-form-item label="商品信息" v-if="transferForm.sku">
            <div class="product-info">
              <div class="product-name">{{ transferForm.productName }}</div>
              <div class="product-sku">SKU: {{ transferForm.sku }}</div>
            </div>
          </el-form-item>
          
          <el-form-item label="源店铺" prop="fromStoreId">
            <el-select v-model="transferForm.fromStoreId" placeholder="选择源店铺" style="width: 100%">
              <el-option
                v-for="store in storeList"
                :key="store.id"
                :label="store.name"
                :value="store.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="目标店铺" prop="toStoreId">
            <el-select v-model="transferForm.toStoreId" placeholder="选择目标店铺" style="width: 100%">
              <el-option
                v-for="store in storeList"
                :key="store.id"
                :label="store.name"
                :value="store.id"
                :disabled="store.id === transferForm.fromStoreId"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="调拨数量" prop="quantity">
            <el-input-number
              v-model="transferForm.quantity"
              :min="1"
              :max="getMaxTransferQuantity()"
              style="width: 100%"
            />
            <div class="quantity-hint">
              可调拨数量: {{ getMaxTransferQuantity() }}
            </div>
          </el-form-item>

          <el-form-item label="调拨原因" prop="reason">
            <el-input
              v-model="transferForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入调拨原因"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTransferDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmTransfer" :loading="transferLoading">
            确认调拨
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预警设置对话框 -->
    <el-dialog
      v-model="showAlertDialog"
      title="库存预警设置"
      width="500px"
    >
      <div class="alert-form">
        <el-form :model="alertForm" :rules="alertRules" ref="alertFormRef" label-width="120px">
          <el-form-item label="商品信息" v-if="alertForm.sku">
            <div class="product-info">
              <div class="product-name">{{ alertForm.productName }}</div>
              <div class="product-sku">SKU: {{ alertForm.sku }}</div>
            </div>
          </el-form-item>

          <el-form-item label="店铺" v-if="alertForm.storeName">
            <span>{{ alertForm.storeName }}</span>
          </el-form-item>

          <el-form-item label="安全库存" prop="safetyStock">
            <el-input-number
              v-model="alertForm.safetyStock"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="最大库存" prop="maxStock">
            <el-input-number
              v-model="alertForm.maxStock"
              :min="alertForm.safetyStock || 0"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="启用预警">
            <el-switch v-model="alertForm.alertEnabled" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAlertDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAlert" :loading="alertLoading">
            保存设置
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Transfer, Search, Download, Setting } from '@element-plus/icons-vue'
import { inventoryApi } from '@/api/modules/inventory'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'

// 类型定义
interface Store {
  id: string
  name: string
  status: 'active' | 'inactive'
  stats: {
    totalItems: number
    totalValue: number
    alertItems: number
    outOfStockItems: number
  }
}

interface MultiStoreInventory {
  sku: string
  productName: string
  stores: Record<string, {
    availableQuantity: number
    reservedQuantity: number
    totalQuantity: number
    safetyStock: number
    status: string
  }>
}

// 响应式数据
const loading = ref(false)
const transferLoading = ref(false)
const alertLoading = ref(false)
const showTransferDialog = ref(false)
const showAlertDialog = ref(false)
const selectedStoreId = ref('')
const selectedInventory = ref<MultiStoreInventory[]>([])
const inventoryList = ref<MultiStoreInventory[]>([])
const storeList = ref<Store[]>([])

// 搜索参数
const searchParams = reactive({
  sku: '',
  status: ''
})

// 分页参数
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 调拨表单
const transferForm = reactive({
  sku: '',
  productName: '',
  fromStoreId: '',
  toStoreId: '',
  quantity: 1,
  reason: ''
})

const transferRules = {
  fromStoreId: [{ required: true, message: '请选择源店铺', trigger: 'change' }],
  toStoreId: [{ required: true, message: '请选择目标店铺', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入调拨数量', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }]
}

// 预警表单
const alertForm = reactive({
  sku: '',
  productName: '',
  storeId: '',
  storeName: '',
  safetyStock: 0,
  maxStock: 0,
  alertEnabled: true
})

const alertRules = {
  safetyStock: [{ required: true, message: '请输入安全库存', trigger: 'blur' }]
}

// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '库存管理', to: '/inventory' },
  { label: '多店铺库存管理' }
]

// 方法
const loadStoreList = async () => {
  try {
    // 模拟店铺数据
    storeList.value = [
      {
        id: 'store_1',
        name: '沃尔玛旗舰店',
        status: 'active',
        stats: {
          totalItems: 1250,
          totalValue: 2580000,
          alertItems: 15,
          outOfStockItems: 3
        }
      },
      {
        id: 'store_2',
        name: '亚马逊专营店',
        status: 'active',
        stats: {
          totalItems: 980,
          totalValue: 1890000,
          alertItems: 8,
          outOfStockItems: 1
        }
      },
      {
        id: 'store_3',
        name: 'eBay国际店',
        status: 'active',
        stats: {
          totalItems: 750,
          totalValue: 1420000,
          alertItems: 12,
          outOfStockItems: 5
        }
      }
    ]
  } catch (error) {
    ElMessage.error('加载店铺列表失败')
  }
}

const loadInventoryList = async () => {
  loading.value = true
  try {
    // 模拟多店铺库存数据
    const mockData: MultiStoreInventory[] = [
      {
        sku: 'SKU001',
        productName: 'iPhone 15',
        stores: {
          store_1: { availableQuantity: 150, reservedQuantity: 20, totalQuantity: 170, safetyStock: 50, status: 'normal' },
          store_2: { availableQuantity: 80, reservedQuantity: 10, totalQuantity: 90, safetyStock: 30, status: 'normal' },
          store_3: { availableQuantity: 25, reservedQuantity: 5, totalQuantity: 30, safetyStock: 40, status: 'low' }
        }
      },
      {
        sku: 'SKU002',
        productName: 'Samsung Galaxy S24',
        stores: {
          store_1: { availableQuantity: 200, reservedQuantity: 15, totalQuantity: 215, safetyStock: 60, status: 'normal' },
          store_2: { availableQuantity: 120, reservedQuantity: 8, totalQuantity: 128, safetyStock: 40, status: 'normal' },
          store_3: { availableQuantity: 0, reservedQuantity: 0, totalQuantity: 0, safetyStock: 30, status: 'out_of_stock' }
        }
      }
    ]
    
    inventoryList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载库存数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadStoreList()
  loadInventoryList()
}

const handleStoreChange = () => {
  // 店铺切换时可以进行特定店铺的筛选
  handleSearch()
}

const handleSearch = () => {
  pagination.page = 1
  loadInventoryList()
}

const handleReset = () => {
  Object.assign(searchParams, {
    sku: '',
    status: ''
  })
  selectedStoreId.value = ''
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

const handleSelectionChange = (selection: MultiStoreInventory[]) => {
  selectedInventory.value = selection
}

// 店铺相关方法
const getStoreStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '停用'
  }
  return statusMap[status] || status
}

const viewStoreInventory = (storeId: string) => {
  selectedStoreId.value = storeId
  handleSearch()
}

// 库存相关方法
const getStoreInventory = (inventory: MultiStoreInventory, storeId: string) => {
  return inventory.stores[storeId]
}

const getStoreInventoryStatus = (inventory: MultiStoreInventory, storeId: string) => {
  const storeInventory = inventory.stores[storeId]
  return storeInventory?.status || 'unknown'
}

const getTotalInventory = (inventory: MultiStoreInventory) => {
  return Object.values(inventory.stores).reduce((total, store) => total + store.availableQuantity, 0)
}

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

// 调拨相关方法
const transferInventory = (inventory: MultiStoreInventory) => {
  Object.assign(transferForm, {
    sku: inventory.sku,
    productName: inventory.productName,
    fromStoreId: '',
    toStoreId: '',
    quantity: 1,
    reason: ''
  })
  showTransferDialog.value = true
}

const getMaxTransferQuantity = () => {
  if (!transferForm.fromStoreId || !transferForm.sku) return 0
  
  const inventory = inventoryList.value.find(item => item.sku === transferForm.sku)
  if (!inventory) return 0
  
  const storeInventory = inventory.stores[transferForm.fromStoreId]
  return storeInventory?.availableQuantity || 0
}

const confirmTransfer = async () => {
  try {
    transferLoading.value = true
    
    // 模拟调拨API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('库存调拨成功')
    showTransferDialog.value = false
    loadInventoryList()
  } catch (error) {
    ElMessage.error('库存调拨失败')
  } finally {
    transferLoading.value = false
  }
}

// 预警相关方法
const setAlert = (inventory: MultiStoreInventory) => {
  if (!selectedStoreId.value) {
    ElMessage.warning('请先选择店铺')
    return
  }
  
  const store = storeList.value.find(s => s.id === selectedStoreId.value)
  const storeInventory = inventory.stores[selectedStoreId.value]
  
  Object.assign(alertForm, {
    sku: inventory.sku,
    productName: inventory.productName,
    storeId: selectedStoreId.value,
    storeName: store?.name || '',
    safetyStock: storeInventory?.safetyStock || 0,
    maxStock: storeInventory?.totalQuantity || 0,
    alertEnabled: true
  })
  
  showAlertDialog.value = true
}

const confirmAlert = async () => {
  try {
    alertLoading.value = true
    
    // 模拟预警设置API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('预警设置保存成功')
    showAlertDialog.value = false
    loadInventoryList()
  } catch (error) {
    ElMessage.error('预警设置保存失败')
  } finally {
    alertLoading.value = false
  }
}

// 导出功能
const exportInventory = async () => {
  try {
    ElMessage.success('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 工具方法
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN').format(value)
}

// 生命周期
onMounted(() => {
  loadStoreList()
  loadInventoryList()
})
</script>

<style scoped>
.multi-store-inventory {
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

.store-filters {
  margin-bottom: 0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.store-stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.store-info {
  flex: 1;
}

.store-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.store-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.store-status.active {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.store-status.inactive {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.store-actions {
  flex: 0 0 auto;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-value.warning {
  color: var(--el-color-warning);
}

.stat-value.danger {
  color: var(--el-color-danger);
}

.table-wrapper {
  margin-bottom: 16px;
  overflow-x: auto;
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

.store-inventory {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.inventory-quantity {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.inventory-status {
  width: 100%;
  display: flex;
  justify-content: center;
}

.total-inventory {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-color-primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.transfer-form,
.alert-form {
  padding: 0;
}

.quantity-hint {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .multi-store-inventory {
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
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .store-stats-cards {
    grid-template-columns: 1fr;
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
  
  .stat-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .store-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>