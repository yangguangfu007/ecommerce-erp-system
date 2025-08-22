<template>
  <div class="logistics-management">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">物流列表</h2>
      <div class="page-actions">
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleCreateShipment">
          <el-icon><Plus /></el-icon>
          创建物流单
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <div class="search-filters">
        <div class="search-group">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索订单号或运单号..."
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch" :loading="searchLoading">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="filter-group">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
          
          <el-select
            v-model="searchForm.carrier"
            placeholder="全部承运商"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="carrier in carrierOptions"
              :key="carrier.value"
              :label="carrier.label"
              :value="carrier.value"
            />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 物流列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">物流信息</span>
          <div class="card-actions">
            <el-button text @click="handleExport" :loading="exportLoading">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <!-- 批量操作组件 -->
      <BatchActions
        :actions="batchActions"
        :selected-ids="selectedLogisticsIds"
        :total-count="logisticsList.length"
        @action="handleBatchAction"
        @select-all="handleSelectAll"
        @clear-selection="handleClearSelection"
        ref="batchActionsRef"
      />

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="logisticsList"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="订单信息" min-width="180">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-no">{{ row.orderNumber }}</div>
                <div class="order-id">订单ID: {{ row.orderId }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="运单号" min-width="160">
            <template #default="{ row }">
              <div class="tracking-info">
                <span class="tracking-number">{{ row.trackingNumber }}</span>
                <el-button
                  text
                  size="small"
                  @click="copyTrackingNumber(row.trackingNumber)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="承运商" width="120">
            <template #default="{ row }">
              <span class="carrier-name">{{ getCarrierName(row.carrier) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="物流状态" width="120">
            <template #default="{ row }">
              <StatusBadge :status="row.status" :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </StatusBadge>
            </template>
          </el-table-column>

          <el-table-column label="收货地址" min-width="200">
            <template #default="{ row }">
              <div class="address-info">
                <div class="address-text">
                  {{ formatAddress(row.shippingAddress) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="发货时间" width="160">
            <template #default="{ row }">
              {{ row.createdAt ? formatDateTime(row.createdAt) : '-' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="物流跟踪" placement="top">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleTrackShipment(row)"
                  >
                    <el-icon><Location /></el-icon>
                  </el-button>
                </el-tooltip>
                
                <el-tooltip content="打印面单" placement="top">
                  <el-button
                    size="small"
                    @click="handlePrintLabel(row)"
                  >
                    <el-icon><Printer /></el-icon>
                  </el-button>
                </el-tooltip>
                
                <el-tooltip content="更新状态" placement="top">
                  <el-button
                    size="small"
                    type="success"
                    @click="handleUpdateStatus(row)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="table-footer">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 物流跟踪对话框 -->
    <el-dialog
      v-model="trackingDialogVisible"
      title="物流跟踪"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="trackingInfo" class="tracking-content">
        <div class="tracking-header">
          <div class="tracking-basic">
            <h3>{{ trackingInfo.trackingNumber }}</h3>
            <p class="carrier-info">{{ getCarrierName(trackingInfo.carrier) }}</p>
            <StatusBadge :status="trackingInfo.status" :type="getStatusType(trackingInfo.status)">
              {{ trackingInfo.statusDescription || getStatusText(trackingInfo.status) }}
            </StatusBadge>
          </div>
          <div class="tracking-dates">
            <div v-if="trackingInfo.estimatedDeliveryDate" class="date-item">
              <span class="date-label">预计送达：</span>
              <span class="date-value">{{ formatDateTime(trackingInfo.estimatedDeliveryDate) }}</span>
            </div>
            <div v-if="trackingInfo.actualDeliveryDate" class="date-item">
              <span class="date-label">实际送达：</span>
              <span class="date-value">{{ formatDateTime(trackingInfo.actualDeliveryDate) }}</span>
            </div>
          </div>
        </div>

        <!-- 物流轨迹时间线 -->
        <div class="tracking-timeline">
          <h4>物流轨迹</h4>
          <el-timeline>
            <el-timeline-item
              v-for="event in trackingInfo.events"
              :key="event.id"
              :timestamp="formatDateTime(event.timestamp)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="event-status">{{ event.status }}</div>
                <div class="event-description">{{ event.description }}</div>
                <div v-if="event.location" class="event-location">
                  <el-icon><Location /></el-icon>
                  {{ event.location }}
                </div>
                <div v-if="event.operator" class="event-operator">
                  操作员：{{ event.operator }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      
      <div v-else class="tracking-loading">
        <el-skeleton :rows="5" animated />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="refreshTrackingInfo" :loading="trackingLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="trackingDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 状态更新对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新物流状态"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="当前状态">
          <StatusBadge :status="currentLogistics?.status" :type="getStatusType(currentLogistics?.status)">
            {{ getStatusText(currentLogistics?.status) }}
          </StatusBadge>
        </el-form-item>
        <el-form-item label="新状态" required>
          <el-select v-model="statusForm.status" placeholder="请选择新状态">
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="statusForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入状态更新备注..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateStatus" :loading="updateStatusLoading">
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量更新状态对话框 -->
    <el-dialog
      v-model="batchStatusDialogVisible"
      title="批量更新状态"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="batchStatusForm" label-width="80px">
        <el-form-item label="选中数量">
          <span class="selected-info">{{ selectedLogisticsIds.length }} 个物流订单</span>
        </el-form-item>
        <el-form-item label="新状态" required>
          <el-select v-model="batchStatusForm.status" placeholder="请选择新状态">
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="batchStatusForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入批量更新备注..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchUpdateStatus">
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量切换承运商对话框 -->
    <el-dialog
      v-model="batchCarrierDialogVisible"
      title="批量切换承运商"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="batchCarrierForm" label-width="80px">
        <el-form-item label="选中数量">
          <span class="selected-info">{{ selectedLogisticsIds.length }} 个物流订单</span>
        </el-form-item>
        <el-form-item label="新承运商" required>
          <el-select v-model="batchCarrierForm.carrier" placeholder="请选择承运商">
            <el-option
              v-for="carrier in carrierOptions"
              :key="carrier.value"
              :label="carrier.label"
              :value="carrier.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="batchCarrierForm.service" placeholder="请选择服务类型">
            <el-option label="标准服务" value="STANDARD" />
            <el-option label="快递服务" value="EXPRESS" />
            <el-option label="经济服务" value="ECONOMY" />
            <el-option label="优先服务" value="PRIORITY" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="batchCarrierForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入切换承运商的原因..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchCarrierDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchSwitchCarrier">
            确认切换
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Plus,
  Search,
  Download,
  CopyDocument,
  Location,
  Printer,
  Edit,
  Van
} from '@element-plus/icons-vue'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'
import BatchActions from '@/components/business/BatchActions.vue'
import { logisticsApi } from '@/api/modules/logistics'
import type {
  LogisticsOrder,
  LogisticsQuery,
  LogisticsStatus,
  LogisticsCarrier,
  TrackingInfo
} from '@/api/modules/logistics'
import { formatDateTime } from '@/utils'

// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '物流管理' },
  { label: '物流列表' }
]

// 响应式数据
const loading = ref(false)
const searchLoading = ref(false)
const exportLoading = ref(false)
const trackingLoading = ref(false)
const updateStatusLoading = ref(false)

const logisticsList = ref<LogisticsOrder[]>([])
const selectedLogistics = ref<LogisticsOrder[]>([])
const selectedLogisticsIds = ref<number[]>([])
const batchActionsRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  carrier: '',
  startDate: '',
  endDate: ''
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 物流跟踪对话框
const trackingDialogVisible = ref(false)
const trackingInfo = ref<TrackingInfo | null>(null)
const currentTrackingNumber = ref('')

// 状态更新对话框
const statusDialogVisible = ref(false)
const currentLogistics = ref<LogisticsOrder | null>(null)
const statusForm = reactive({
  status: '',
  notes: ''
})

// 批量操作配置
const batchActions = [
  {
    key: 'batchGenerateLabels',
    label: '批量生成面单',
    type: 'primary',
    icon: 'Printer',
    confirmTitle: '批量生成面单',
    confirmMessage: '确定要为选中的物流订单批量生成面单吗？',
    warning: '此操作将为所有选中的订单生成新的面单，请确认订单信息无误。'
  },
  {
    key: 'batchUpdateStatus',
    label: '批量更新状态',
    type: 'warning',
    icon: 'Edit',
    confirmTitle: '批量更新状态',
    confirmMessage: '确定要批量更新选中订单的状态吗？'
  },
  {
    key: 'batchSwitchCarrier',
    label: '批量切换承运商',
    type: 'info',
    icon: 'Van',
    confirmTitle: '批量切换承运商',
    confirmMessage: '确定要为选中的订单批量切换承运商吗？',
    warning: '切换承运商可能会影响运费和配送时效，请谨慎操作。'
  },
  {
    key: 'batchTrack',
    label: '批量跟踪',
    type: 'success',
    icon: 'Location',
    confirmTitle: '批量跟踪',
    confirmMessage: '确定要批量更新选中订单的跟踪信息吗？'
  }
]

// 批量操作对话框
const batchStatusDialogVisible = ref(false)
const batchCarrierDialogVisible = ref(false)
const batchStatusForm = reactive({
  status: '',
  notes: ''
})
const batchCarrierForm = reactive({
  carrier: '',
  service: '',
  notes: ''
})

// 状态选项
const statusOptions = [
  { label: '已创建', value: 'CREATED' },
  { label: '已取件', value: 'PICKED_UP' },
  { label: '运输中', value: 'IN_TRANSIT' },
  { label: '已送达', value: 'DELIVERED' },
  { label: '异常', value: 'EXCEPTION' },
  { label: '已退回', value: 'RETURNED' }
]

// 承运商选项
const carrierOptions = [
  { label: '云途物流', value: 'YUNEXPRESS' },
  { label: 'DHL', value: 'DHL' },
  { label: 'FedEx', value: 'FEDEX' },
  { label: 'UPS', value: 'UPS' },
  { label: 'USPS', value: 'USPS' },
  { label: 'EMS', value: 'EMS' }
]

// 计算属性
const queryParams = computed((): LogisticsQuery => ({
  page: pagination.page,
  size: pagination.size,
  keyword: searchForm.keyword || undefined,
  status: searchForm.status as LogisticsStatus || undefined,
  carrier: searchForm.carrier as LogisticsCarrier || undefined,
  startDate: searchForm.startDate || undefined,
  endDate: searchForm.endDate || undefined
}))

// 方法
const loadLogisticsList = async () => {
  try {
    loading.value = true
    const response = await logisticsApi.getLogisticsOrders(queryParams.value)
    
    if (response.code === 200) {
      logisticsList.value = response.data.records
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.message || '获取物流列表失败')
    }
  } catch (error) {
    console.error('获取物流列表失败:', error)
    ElMessage.error('获取物流列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadLogisticsList()
}

const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    searchForm.startDate = dates[0]
    searchForm.endDate = dates[1]
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
  handleSearch()
}

const refreshData = () => {
  loadLogisticsList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadLogisticsList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadLogisticsList()
}

const handleSelectionChange = (selection: LogisticsOrder[]) => {
  selectedLogistics.value = selection
  selectedLogisticsIds.value = selection.map(item => item.id)
}

const handleSelectAll = (selected: boolean) => {
  if (selected) {
    selectedLogistics.value = [...logisticsList.value]
    selectedLogisticsIds.value = logisticsList.value.map(item => item.id)
  } else {
    selectedLogistics.value = []
    selectedLogisticsIds.value = []
  }
}

const handleClearSelection = () => {
  selectedLogistics.value = []
  selectedLogisticsIds.value = []
}

const handleCreateShipment = () => {
  ElMessage.info('创建物流单功能开发中...')
}

const handleExport = async () => {
  try {
    exportLoading.value = true
    const response = await logisticsApi.exportLogisticsData(queryParams.value, 'excel')
    
    if (response.code === 200) {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = `物流数据_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

const copyTrackingNumber = async (trackingNumber: string) => {
  try {
    await navigator.clipboard.writeText(trackingNumber)
    ElMessage.success('运单号已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

const handleTrackShipment = async (logistics: LogisticsOrder) => {
  currentTrackingNumber.value = logistics.trackingNumber
  trackingDialogVisible.value = true
  trackingInfo.value = null
  
  await loadTrackingInfo(logistics.trackingNumber, logistics.carrier)
}

const loadTrackingInfo = async (trackingNumber: string, carrier?: LogisticsCarrier) => {
  try {
    trackingLoading.value = true
    const response = await logisticsApi.getTrackingInfo(trackingNumber, carrier)
    
    if (response.code === 200) {
      trackingInfo.value = response.data
    } else {
      ElMessage.error(response.message || '获取跟踪信息失败')
    }
  } catch (error) {
    console.error('获取跟踪信息失败:', error)
    ElMessage.error('获取跟踪信息失败')
  } finally {
    trackingLoading.value = false
  }
}

const refreshTrackingInfo = () => {
  if (currentTrackingNumber.value) {
    loadTrackingInfo(currentTrackingNumber.value)
  }
}

const handlePrintLabel = (logistics: LogisticsOrder) => {
  ElMessage.info(`打印面单功能开发中... 运单号: ${logistics.trackingNumber}`)
}

const handleUpdateStatus = (logistics: LogisticsOrder) => {
  currentLogistics.value = logistics
  statusForm.status = ''
  statusForm.notes = ''
  statusDialogVisible.value = true
}

const confirmUpdateStatus = async () => {
  if (!statusForm.status) {
    ElMessage.warning('请选择新状态')
    return
  }

  if (!currentLogistics.value) {
    return
  }

  try {
    updateStatusLoading.value = true
    const response = await logisticsApi.updateLogisticsOrderStatus(
      currentLogistics.value.id,
      statusForm.status as LogisticsStatus,
      statusForm.notes
    )
    
    if (response.code === 200) {
      ElMessage.success('状态更新成功')
      statusDialogVisible.value = false
      loadLogisticsList()
    } else {
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
  } finally {
    updateStatusLoading.value = false
  }
}

// 批量操作处理
const handleBatchAction = async (actionKey: string, selectedIds: number[]) => {
  switch (actionKey) {
    case 'batchGenerateLabels':
      await handleBatchGenerateLabels(selectedIds)
      break
    case 'batchUpdateStatus':
      await handleBatchUpdateStatusDialog(selectedIds)
      break
    case 'batchSwitchCarrier':
      await handleBatchSwitchCarrierDialog(selectedIds)
      break
    case 'batchTrack':
      await handleBatchTrack(selectedIds)
      break
    default:
      ElMessage.warning('未知的批量操作')
  }
}

// 批量生成面单
const handleBatchGenerateLabels = async (selectedIds: number[]) => {
  try {
    let processedCount = 0
    const errors: any[] = []
    
    for (const id of selectedIds) {
      try {
        const logistics = selectedLogistics.value.find(item => item.id === id)
        if (!logistics) continue
        
        // 调用重新生成面单API
        const response = await logisticsApi.regenerateLabel(id)
        
        if (response.code === 200) {
          processedCount++
          batchActionsRef.value?.updateProgress(processedCount)
        } else {
          errors.push({ id, message: response.message || '生成面单失败' })
          batchActionsRef.value?.addError(id, response.message || '生成面单失败')
        }
      } catch (error) {
        errors.push({ id, message: error.message || '生成面单失败' })
        batchActionsRef.value?.addError(id, error.message || '生成面单失败')
      }
    }
    
    batchActionsRef.value?.setCompleted()
    
    // 刷新列表
    if (processedCount > 0) {
      await loadLogisticsList()
    }
    
  } catch (error) {
    console.error('批量生成面单失败:', error)
    throw error
  }
}

// 批量更新状态对话框
const handleBatchUpdateStatusDialog = async (selectedIds: number[]) => {
  batchStatusForm.status = ''
  batchStatusForm.notes = ''
  batchStatusDialogVisible.value = true
}

// 确认批量更新状态
const confirmBatchUpdateStatus = async () => {
  if (!batchStatusForm.status) {
    ElMessage.warning('请选择状态')
    return
  }
  
  try {
    batchStatusDialogVisible.value = false
    
    const response = await logisticsApi.batchUpdateStatus(
      selectedLogisticsIds.value,
      batchStatusForm.status as LogisticsStatus,
      batchStatusForm.notes
    )
    
    if (response.code === 200) {
      ElMessage.success(`批量更新状态成功，成功 ${response.data.success} 项，失败 ${response.data.failed} 项`)
      await loadLogisticsList()
      handleClearSelection()
    } else {
      ElMessage.error(response.message || '批量更新状态失败')
    }
  } catch (error) {
    console.error('批量更新状态失败:', error)
    ElMessage.error('批量更新状态失败')
  }
}

// 批量切换承运商对话框
const handleBatchSwitchCarrierDialog = async (selectedIds: number[]) => {
  batchCarrierForm.carrier = ''
  batchCarrierForm.service = ''
  batchCarrierForm.notes = ''
  batchCarrierDialogVisible.value = true
}

// 确认批量切换承运商
const confirmBatchSwitchCarrier = async () => {
  if (!batchCarrierForm.carrier) {
    ElMessage.warning('请选择承运商')
    return
  }
  
  try {
    batchCarrierDialogVisible.value = false
    
    let processedCount = 0
    const errors: any[] = []
    
    // 显示进度
    batchActionsRef.value?.updateProgress(0)
    
    for (const id of selectedLogisticsIds.value) {
      try {
        // 这里应该调用切换承运商的API，目前使用批量操作API模拟
        const response = await logisticsApi.batchOperateLogisticsOrders({
          logisticsOrderIds: [id],
          operation: 'updateStatus',
          carrier: batchCarrierForm.carrier as LogisticsCarrier,
          service: batchCarrierForm.service as LogisticsServiceType
        })
        
        if (response.code === 200) {
          processedCount++
        } else {
          errors.push({ id, message: '切换承运商失败' })
        }
        
        batchActionsRef.value?.updateProgress(processedCount)
      } catch (error) {
        errors.push({ id, message: error.message || '切换承运商失败' })
        batchActionsRef.value?.addError(id, error.message || '切换承运商失败')
      }
    }
    
    batchActionsRef.value?.setCompleted()
    
    ElMessage.success(`批量切换承运商完成，成功 ${processedCount} 项，失败 ${errors.length} 项`)
    
    if (processedCount > 0) {
      await loadLogisticsList()
      handleClearSelection()
    }
    
  } catch (error) {
    console.error('批量切换承运商失败:', error)
    ElMessage.error('批量切换承运商失败')
  }
}

// 批量跟踪
const handleBatchTrack = async (selectedIds: number[]) => {
  try {
    let processedCount = 0
    const errors: any[] = []
    
    for (const id of selectedIds) {
      try {
        const logistics = selectedLogistics.value.find(item => item.id === id)
        if (!logistics?.trackingNumber) {
          errors.push({ id, message: '运单号不存在' })
          batchActionsRef.value?.addError(id, '运单号不存在')
          continue
        }
        
        // 刷新跟踪信息
        const response = await logisticsApi.refreshTrackingInfo(
          logistics.trackingNumber,
          logistics.carrier
        )
        
        if (response.code === 200) {
          processedCount++
          batchActionsRef.value?.updateProgress(processedCount)
        } else {
          errors.push({ id, message: response.message || '更新跟踪信息失败' })
          batchActionsRef.value?.addError(id, response.message || '更新跟踪信息失败')
        }
      } catch (error) {
        errors.push({ id, message: error.message || '更新跟踪信息失败' })
        batchActionsRef.value?.addError(id, error.message || '更新跟踪信息失败')
      }
    }
    
    batchActionsRef.value?.setCompleted()
    
    // 刷新列表
    if (processedCount > 0) {
      await loadLogisticsList()
    }
    
  } catch (error) {
    console.error('批量跟踪失败:', error)
    throw error
  }
}

// 工具方法
const getCarrierName = (carrier: LogisticsCarrier): string => {
  const carrierMap: Record<LogisticsCarrier, string> = {
    YUNEXPRESS: '云途物流',
    DHL: 'DHL',
    FEDEX: 'FedEx',
    UPS: 'UPS',
    USPS: 'USPS',
    EMS: 'EMS'
  }
  return carrierMap[carrier] || carrier
}

const getStatusText = (status: LogisticsStatus): string => {
  const statusMap: Record<LogisticsStatus, string> = {
    CREATED: '已创建',
    PICKED_UP: '已取件',
    IN_TRANSIT: '运输中',
    DELIVERED: '已送达',
    EXCEPTION: '异常',
    RETURNED: '已退回'
  }
  return statusMap[status] || status
}

const getStatusType = (status: LogisticsStatus): string => {
  const typeMap: Record<LogisticsStatus, string> = {
    CREATED: 'info',
    PICKED_UP: 'warning',
    IN_TRANSIT: 'primary',
    DELIVERED: 'success',
    EXCEPTION: 'danger',
    RETURNED: 'warning'
  }
  return typeMap[status] || 'info'
}

const formatAddress = (address: any): string => {
  if (!address) return '-'
  
  const parts = []
  if (address.country) parts.push(address.country)
  if (address.state) parts.push(address.state)
  if (address.city) parts.push(address.city)
  if (address.address1) parts.push(address.address1)
  
  return parts.join(', ')
}

// 生命周期
onMounted(() => {
  loadLogisticsList()
})
</script>

<style scoped>
.logistics-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-actions {
  display: flex;
  gap: 12px;
}

.search-card {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group .el-select {
  width: 150px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.table-container {
  overflow-x: auto;
}

.order-info {
  line-height: 1.4;
}

.order-no {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.order-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.tracking-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tracking-number {
  font-family: monospace;
  font-weight: 600;
}

.carrier-name {
  font-weight: 500;
}

.address-info {
  max-width: 200px;
}

.address-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.table-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 物流跟踪对话框样式 */
.tracking-content {
  padding: 0;
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.tracking-basic h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  font-family: monospace;
}

.carrier-info {
  margin: 0 0 8px 0;
  color: var(--el-text-color-secondary);
}

.tracking-dates {
  text-align: right;
}

.date-item {
  margin-bottom: 4px;
  font-size: 13px;
}

.date-label {
  color: var(--el-text-color-secondary);
}

.date-value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.tracking-timeline h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.timeline-content {
  padding-left: 8px;
}

.event-status {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.event-description {
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
  line-height: 1.4;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.event-operator {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tracking-loading {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 批量操作样式 */
.selected-info {
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logistics-management {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .search-filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group .el-select {
    width: 100%;
  }

  .tracking-header {
    flex-direction: column;
    gap: 16px;
  }

  .tracking-dates {
    text-align: left;
  }
}
</style>