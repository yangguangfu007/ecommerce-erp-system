<template>
  <div class="inventory-history">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-section">
        <h2 class="page-title">库存历史</h2>
        <p class="page-description">查看库存变动记录和操作日志</p>
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
          :icon="Download" 
          @click="exportHistory"
        >
          导出历史
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="content-card">
      <div class="card-body">
        <div class="search-filters">
          <div class="filter-row">
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
              <label class="filter-label">变动类型</label>
              <el-select
                v-model="searchParams.type"
                placeholder="选择类型"
                clearable
                style="width: 150px"
              >
                <el-option label="全部" value="" />
                <el-option label="入库" value="IN" />
                <el-option label="出库" value="OUT" />
              </el-select>
            </div>

            <div class="filter-group">
              <label class="filter-label">变动原因</label>
              <el-select
                v-model="searchParams.reason"
                placeholder="选择原因"
                clearable
                style="width: 150px"
              >
                <el-option label="全部" value="" />
                <el-option label="采购入库" value="PURCHASE" />
                <el-option label="销售出库" value="SALE" />
                <el-option label="退货入库" value="RETURN" />
                <el-option label="损坏出库" value="DAMAGE" />
                <el-option label="调拨" value="TRANSFER" />
                <el-option label="盘点调整" value="STOCKTAKING" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </div>

            <div class="filter-group">
              <label class="filter-label">时间范围</label>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 240px"
                @change="handleDateRangeChange"
              />
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

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon in">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalInQuantity }}</div>
          <div class="stat-label">总入库数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon out">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalOutQuantity }}</div>
          <div class="stat-label">总出库数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon net">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.netQuantity }}</div>
          <div class="stat-label">净变动数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon transactions">
          <i class="fas fa-list"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalTransactions }}</div>
          <div class="stat-label">变动记录数</div>
        </div>
      </div>
    </div>

    <!-- 趋势图表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">库存变动趋势</h3>
        <div class="card-actions">
          <el-radio-group v-model="trendGranularity" @change="loadTrendData">
            <el-radio-button label="day">按天</el-radio-button>
            <el-radio-button label="week">按周</el-radio-button>
            <el-radio-button label="month">按月</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="card-body">
        <ChartContainer
          :chart-data="trendChartData"
          :chart-options="trendChartOptions"
          height="300px"
        />
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">变动记录 ({{ pagination.total }})</h3>
        <div class="card-actions">
          <el-button 
            type="text" 
            :icon="Download" 
            @click="exportSelectedHistory"
            :disabled="selectedHistory.length === 0"
          >
            导出选中
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="table-wrapper">
          <BaseTable
            :data="historyList"
            :loading="loading"
            v-model:selection="selectedHistory"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="时间" prop="createdAt" width="160" sortable>
              <template #default="{ row }">
                <div class="time-info">
                  <div>{{ formatDate(row.createdAt) }}</div>
                  <div class="time-detail">{{ formatTime(row.createdAt) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="商品信息" min-width="200">
              <template #default="{ row }">
                <div class="product-info">
                  <div class="product-name">{{ row.productName }}</div>
                  <div class="product-sku">SKU: {{ row.sku }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="变动类型" prop="type" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.type === 'IN' ? 'success' : 'danger'"
                  size="small"
                >
                  <i :class="row.type === 'IN' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ row.type === 'IN' ? '入库' : '出库' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="变动数量" prop="quantity" width="120" align="center">
              <template #default="{ row }">
                <span 
                  class="quantity-change"
                  :class="row.type === 'IN' ? 'positive' : 'negative'"
                >
                  {{ row.type === 'IN' ? '+' : '-' }}{{ row.quantity }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="变动前" prop="beforeQuantity" width="100" align="center">
              <template #default="{ row }">
                <span class="stock-number">{{ row.beforeQuantity }}</span>
              </template>
            </el-table-column>

            <el-table-column label="变动后" prop="afterQuantity" width="100" align="center">
              <template #default="{ row }">
                <span class="stock-number">{{ row.afterQuantity }}</span>
              </template>
            </el-table-column>

            <el-table-column label="变动原因" prop="reason" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="info">
                  {{ getReasonText(row.reason) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作人" prop="operatorName" width="100" align="center" />

            <el-table-column label="参考单号" prop="referenceNumber" width="140" align="center">
              <template #default="{ row }">
                <span v-if="row.referenceNumber" class="reference-number">
                  {{ row.referenceNumber }}
                </span>
                <span v-else class="no-reference">-</span>
              </template>
            </el-table-column>

            <el-table-column label="备注" prop="note" min-width="150">
              <template #default="{ row }">
                <span v-if="row.note" class="note-text">{{ row.note }}</span>
                <span v-else class="no-note">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="viewDetail(row)"
                  title="查看详情"
                >
                  详情
                </el-button>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="变动记录详情"
      width="600px"
    >
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>商品名称：</label>
              <span>{{ currentRecord.productName }}</span>
            </div>
            <div class="detail-item">
              <label>商品SKU：</label>
              <span>{{ currentRecord.sku }}</span>
            </div>
            <div class="detail-item">
              <label>变动类型：</label>
              <el-tag 
                :type="currentRecord.type === 'IN' ? 'success' : 'danger'"
                size="small"
              >
                {{ currentRecord.type === 'IN' ? '入库' : '出库' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>变动数量：</label>
              <span 
                class="quantity-change"
                :class="currentRecord.type === 'IN' ? 'positive' : 'negative'"
              >
                {{ currentRecord.type === 'IN' ? '+' : '-' }}{{ currentRecord.quantity }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>库存变化</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>变动前库存：</label>
              <span>{{ currentRecord.beforeQuantity }}</span>
            </div>
            <div class="detail-item">
              <label>变动后库存：</label>
              <span>{{ currentRecord.afterQuantity }}</span>
            </div>
            <div class="detail-item">
              <label>变动原因：</label>
              <span>{{ getReasonText(currentRecord.reason) }}</span>
            </div>
            <div class="detail-item">
              <label>参考单号：</label>
              <span>{{ currentRecord.referenceNumber || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>操作信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>操作人：</label>
              <span>{{ currentRecord.operatorName }}</span>
            </div>
            <div class="detail-item">
              <label>操作时间：</label>
              <span>{{ currentRecord.createdAt }}</span>
            </div>
            <div class="detail-item full-width">
              <label>备注：</label>
              <span>{{ currentRecord.note || '无' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Search } from '@element-plus/icons-vue'
import { inventoryApi } from '@/api/modules/inventory'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import ChartContainer from '@/components/business/ChartContainer.vue'
import type { InventoryHistory } from '@/types/inventory'

// 响应式数据
const loading = ref(false)
const showDetailDialog = ref(false)
const selectedHistory = ref<InventoryHistory[]>([])
const currentRecord = ref<InventoryHistory | null>(null)
const historyList = ref<InventoryHistory[]>([])
const dateRange = ref<[string, string] | null>(null)
const trendGranularity = ref('day')

// 搜索参数
const searchParams = reactive({
  sku: '',
  type: '',
  reason: '',
  startDate: '',
  endDate: ''
})

// 分页参数
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  totalInQuantity: 0,
  totalOutQuantity: 0,
  netQuantity: 0,
  totalTransactions: 0
})

// 趋势图表数据
const trendChartData = ref<any>({
  labels: [],
  datasets: []
})

const trendChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '数量'
      }
    },
    x: {
      title: {
        display: true,
        text: '时间'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  }
})

// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '库存管理', to: '/inventory' },
  { label: '库存历史' }
]

// 方法
const loadHistoryList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.size
    }
    
    // 模拟API调用 - 实际应该调用 inventoryApi.getInventoryHistory
    const mockResponse = {
      records: generateMockHistoryData(),
      total: 156,
      current: pagination.page,
      size: pagination.size
    }
    
    historyList.value = mockResponse.records
    pagination.total = mockResponse.total
    
    // 计算统计数据
    calculateStats()
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async () => {
  try {
    // 模拟趋势数据
    const mockTrendData = generateMockTrendData()
    
    trendChartData.value = {
      labels: mockTrendData.map(item => item.date),
      datasets: [
        {
          label: '入库数量',
          data: mockTrendData.map(item => item.inQuantity),
          borderColor: '#67c23a',
          backgroundColor: 'rgba(103, 194, 58, 0.1)',
          fill: true
        },
        {
          label: '出库数量',
          data: mockTrendData.map(item => item.outQuantity),
          borderColor: '#f56c6c',
          backgroundColor: 'rgba(245, 108, 108, 0.1)',
          fill: true
        },
        {
          label: '净变动',
          data: mockTrendData.map(item => item.quantity),
          borderColor: '#409eff',
          backgroundColor: 'rgba(64, 158, 255, 0.1)',
          fill: false,
          type: 'line'
        }
      ]
    }
  } catch (error) {
    ElMessage.error('加载趋势数据失败')
  }
}

const calculateStats = () => {
  const inRecords = historyList.value.filter(item => item.type === 'IN')
  const outRecords = historyList.value.filter(item => item.type === 'OUT')
  
  stats.totalInQuantity = inRecords.reduce((sum, item) => sum + item.quantity, 0)
  stats.totalOutQuantity = outRecords.reduce((sum, item) => sum + item.quantity, 0)
  stats.netQuantity = stats.totalInQuantity - stats.totalOutQuantity
  stats.totalTransactions = historyList.value.length
}

const refreshData = () => {
  loadHistoryList()
  loadTrendData()
}

const handleSearch = () => {
  pagination.page = 1
  loadHistoryList()
}

const handleReset = () => {
  Object.assign(searchParams, {
    sku: '',
    type: '',
    reason: '',
    startDate: '',
    endDate: ''
  })
  dateRange.value = null
  pagination.page = 1
  loadHistoryList()
}

const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    searchParams.startDate = dates[0]
    searchParams.endDate = dates[1]
  } else {
    searchParams.startDate = ''
    searchParams.endDate = ''
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadHistoryList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadHistoryList()
}

const handleSelectionChange = (selection: InventoryHistory[]) => {
  selectedHistory.value = selection
}

const viewDetail = (record: InventoryHistory) => {
  currentRecord.value = record
  showDetailDialog.value = true
}

const exportHistory = async () => {
  try {
    ElMessage.success('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const exportSelectedHistory = async () => {
  try {
    ElMessage.success('导出选中记录功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 工具方法
const formatDate = (dateStr: string) => {
  return dateStr.split(' ')[0]
}

const formatTime = (dateStr: string) => {
  return dateStr.split(' ')[1]
}

const getReasonText = (reason: string) => {
  const reasonMap: Record<string, string> = {
    PURCHASE: '采购入库',
    SALE: '销售出库',
    RETURN: '退货入库',
    DAMAGE: '损坏出库',
    TRANSFER: '调拨',
    STOCKTAKING: '盘点调整',
    OTHER: '其他'
  }
  return reasonMap[reason] || reason
}

// 模拟数据生成
const generateMockHistoryData = (): InventoryHistory[] => {
  const mockData: InventoryHistory[] = []
  const reasons = ['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'TRANSFER', 'STOCKTAKING', 'OTHER']
  const products = [
    { sku: 'SKU001', name: 'iPhone 15' },
    { sku: 'SKU002', name: 'Samsung Galaxy S24' },
    { sku: 'SKU003', name: 'MacBook Pro' },
    { sku: 'SKU004', name: 'iPad Air' },
    { sku: 'SKU005', name: 'AirPods Pro' }
  ]
  
  for (let i = 0; i < 20; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    const type = Math.random() > 0.5 ? 'IN' : 'OUT'
    const quantity = Math.floor(Math.random() * 100) + 1
    const beforeQuantity = Math.floor(Math.random() * 500) + 100
    
    mockData.push({
      id: `hist_${i + 1}`,
      inventoryId: `inv_${i + 1}`,
      sku: product.sku,
      productName: product.name,
      type,
      quantity,
      beforeQuantity,
      afterQuantity: type === 'IN' ? beforeQuantity + quantity : beforeQuantity - quantity,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      note: Math.random() > 0.5 ? `操作备注 ${i + 1}` : '',
      referenceNumber: Math.random() > 0.3 ? `REF${String(i + 1).padStart(6, '0')}` : '',
      operatorId: 'user_1',
      operatorName: '管理员',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
    })
  }
  
  return mockData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

const generateMockTrendData = () => {
  const data = []
  const days = trendGranularity.value === 'day' ? 30 : trendGranularity.value === 'week' ? 12 : 6
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    if (trendGranularity.value === 'day') {
      date.setDate(date.getDate() - i)
    } else if (trendGranularity.value === 'week') {
      date.setDate(date.getDate() - i * 7)
    } else {
      date.setMonth(date.getMonth() - i)
    }
    
    const inQuantity = Math.floor(Math.random() * 200) + 50
    const outQuantity = Math.floor(Math.random() * 150) + 30
    
    data.push({
      date: date.toLocaleDateString(),
      quantity: inQuantity - outQuantity,
      inQuantity,
      outQuantity
    })
  }
  
  return data
}

// 生命周期
onMounted(() => {
  loadHistoryList()
  loadTrendData()
})
</script>

<style scoped>
.inventory-history {
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

.search-filters {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.in {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.out {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-icon.net {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.transactions {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
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

.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-detail {
  font-size: 12px;
  color: var(--el-text-color-regular);
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

.quantity-change {
  font-weight: 600;
  font-size: 16px;
}

.quantity-change.positive {
  color: var(--el-color-success);
}

.quantity-change.negative {
  color: var(--el-color-danger);
}

.stock-number {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.reference-number {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-color-primary);
}

.no-reference,
.no-note {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.note-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
  min-width: 80px;
}

.detail-item span {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .inventory-history {
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
  
  .stats-cards {
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
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>