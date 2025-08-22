<template>
  <div class="logistics-exception-handling">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">物流异常处理</h2>
      <div class="page-actions">
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleCreateException">
          <el-icon><Plus /></el-icon>
          新增异常
        </el-button>
      </div>
    </div>

    <!-- 异常统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon exception">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ exceptionStats.total }}</div>
          <div class="stats-label">总异常数</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon pending">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ exceptionStats.pending }}</div>
          <div class="stats-label">待处理</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon processing">
          <el-icon><Loading /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ exceptionStats.processing }}</div>
          <div class="stats-label">处理中</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon resolved">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ exceptionStats.resolved }}</div>
          <div class="stats-label">已解决</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <div class="search-filters">
        <div class="search-group">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索运单号或订单号..."
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
            v-model="searchForm.exceptionType"
            placeholder="异常类型"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="type in exceptionTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
          
          <el-select
            v-model="searchForm.status"
            placeholder="处理状态"
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

    <!-- 异常列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">异常列表</span>
          <div class="card-actions">
            <el-button text @click="handleBatchProcess" :disabled="!selectedExceptions.length">
              <el-icon><Operation /></el-icon>
              批量处理
            </el-button>
            <el-button text @click="handleExport" :loading="exportLoading">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="exceptionList"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="异常信息" min-width="200">
            <template #default="{ row }">
              <div v-if="row" class="exception-info">
                <div class="exception-type">
                  <el-tag :type="getExceptionTypeColor(row.exceptionType || '')">
                    {{ getExceptionTypeText(row.exceptionType || '') }}
                  </el-tag>
                </div>
                <div class="exception-desc">{{ row.description || '-' }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="运单信息" min-width="180">
            <template #default="{ row }">
              <div v-if="row" class="tracking-info">
                <div class="tracking-number">{{ row.trackingNumber || '-' }}</div>
                <div class="order-number">订单: {{ row.orderNumber || '-' }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="处理状态" width="120">
            <template #default="{ row }">
              <StatusBadge v-if="row" :status="row.status || ''" :type="getStatusType(row.status || '')">
                {{ getStatusText(row.status || '') }}
              </StatusBadge>
            </template>
          </el-table-column>

          <el-table-column label="报告时间" width="160">
            <template #default="{ row }">
              {{ row ? formatDateTime(row.reportedAt) : '-' }}
            </template>
          </el-table-column>

          <el-table-column label="处理时间" width="160">
            <template #default="{ row }">
              {{ row && row.resolvedAt ? formatDateTime(row.resolvedAt) : '-' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div v-if="row" class="action-buttons">
                <el-tooltip content="查看详情" placement="top">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleViewDetails(row)"
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                </el-tooltip>
                
                <el-tooltip content="处理异常" placement="top">
                  <el-button
                    size="small"
                    type="warning"
                    @click="handleProcessException(row)"
                    :disabled="row.status === 'RESOLVED' || row.status === 'CLOSED'"
                  >
                    <el-icon><Tools /></el-icon>
                  </el-button>
                </el-tooltip>
                
                <el-tooltip content="重新发货" placement="top">
                  <el-button
                    size="small"
                    type="success"
                    @click="handleReship(row)"
                    :disabled="row.status === 'RESOLVED' || row.status === 'CLOSED'"
                  >
                    <el-icon><Refresh /></el-icon>
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

    <!-- 异常详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="异常详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentException" class="exception-details">
        <div class="details-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="异常类型">
              <el-tag :type="getExceptionTypeColor(currentException.exceptionType)">
                {{ getExceptionTypeText(currentException.exceptionType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="处理状态">
              <StatusBadge :status="currentException.status" :type="getStatusType(currentException.status)">
                {{ getStatusText(currentException.status) }}
              </StatusBadge>
            </el-descriptions-item>
            <el-descriptions-item label="运单号">{{ currentException.trackingNumber }}</el-descriptions-item>
            <el-descriptions-item label="订单号">{{ currentException.orderNumber }}</el-descriptions-item>
            <el-descriptions-item label="报告时间">{{ formatDateTime(currentException.reportedAt) }}</el-descriptions-item>
            <el-descriptions-item label="解决时间">{{ currentException.resolvedAt ? formatDateTime(currentException.resolvedAt) : '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="details-section">
          <h4>异常描述</h4>
          <div class="exception-description">
            {{ currentException.description }}
          </div>
        </div>

        <div v-if="currentException.resolution" class="details-section">
          <h4>处理方案</h4>
          <div class="exception-resolution">
            {{ currentException.resolution }}
          </div>
        </div>

        <div class="details-section">
          <h4>处理历史</h4>
          <el-timeline>
            <el-timeline-item
              v-for="record in exceptionHistory"
              :key="record.id"
              :timestamp="formatDateTime(record.createdAt)"
              placement="top"
            >
              <div class="history-content">
                <div class="history-action">{{ record.action }}</div>
                <div class="history-description">{{ record.description }}</div>
                <div class="history-operator">操作员：{{ record.operator }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理异常对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理异常"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="异常类型">
          <el-tag :type="getExceptionTypeColor(currentException?.exceptionType)">
            {{ getExceptionTypeText(currentException?.exceptionType) }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="处理方式" prop="action" required>
          <el-radio-group v-model="processForm.action">
            <el-radio value="RESOLVE">标记为已解决</el-radio>
            <el-radio value="RESHIP">重新发货</el-radio>
            <el-radio value="REFUND">申请退款</el-radio>
            <el-radio value="CONTACT_CUSTOMER">联系客户</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="处理说明" prop="resolution" required>
          <el-input
            v-model="processForm.resolution"
            type="textarea"
            :rows="4"
            placeholder="请详细描述处理方案和结果..."
          />
        </el-form-item>

        <el-form-item v-if="processForm.action === 'RESHIP'" label="新运单号" prop="newTrackingNumber">
          <el-input
            v-model="processForm.newTrackingNumber"
            placeholder="请输入新的运单号"
          />
        </el-form-item>

        <el-form-item v-if="processForm.action === 'REFUND'" label="退款金额" prop="refundAmount">
          <el-input-number
            v-model="processForm.refundAmount"
            :min="0"
            :precision="2"
            placeholder="请输入退款金额"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcessException" :loading="processLoading">
            确认处理
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重新发货对话框 -->
    <el-dialog
      v-model="reshipDialogVisible"
      title="重新发货"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="reshipForm" :rules="reshipRules" ref="reshipFormRef" label-width="100px">
        <el-form-item label="原运单号">
          <span>{{ currentException?.trackingNumber }}</span>
        </el-form-item>
        
        <el-form-item label="承运商" prop="carrier" required>
          <el-select v-model="reshipForm.carrier" placeholder="请选择承运商">
            <el-option
              v-for="carrier in carrierOptions"
              :key="carrier.value"
              :label="carrier.label"
              :value="carrier.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="新运单号" prop="trackingNumber" required>
          <el-input
            v-model="reshipForm.trackingNumber"
            placeholder="请输入新的运单号"
          />
        </el-form-item>

        <el-form-item label="发货备注" prop="notes">
          <el-input
            v-model="reshipForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入发货备注..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reshipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReship" :loading="reshipLoading">
            确认发货
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
  Warning,
  Clock,
  Loading,
  Check,
  Operation,
  View,
  Tools
} from '@element-plus/icons-vue'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'
import { logisticsApi } from '@/api/modules/logistics'
import type {
  LogisticsException,
  ExceptionQueryParams,
  ExceptionProcessRequest,
  ReshipRequest
} from '@/types/logistics'
import { formatDateTime } from '@/utils'

// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '物流管理' },
  { label: '异常处理' }
]

// 响应式数据
const loading = ref(false)
const searchLoading = ref(false)
const exportLoading = ref(false)
const processLoading = ref(false)
const reshipLoading = ref(false)

const exceptionList = ref<LogisticsException[]>([])
const selectedExceptions = ref<LogisticsException[]>([])
const currentException = ref<LogisticsException | null>(null)
const exceptionHistory = ref<any[]>([])

// 异常统计
const exceptionStats = ref({
  total: 0,
  pending: 0,
  processing: 0,
  resolved: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  exceptionType: '',
  status: '',
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

// 对话框状态
const detailsDialogVisible = ref(false)
const processDialogVisible = ref(false)
const reshipDialogVisible = ref(false)

// 处理表单
const processForm = reactive({
  action: '',
  resolution: '',
  newTrackingNumber: '',
  refundAmount: 0
})

const processFormRef = ref()

// 重新发货表单
const reshipForm = reactive({
  carrier: '',
  trackingNumber: '',
  notes: ''
})

const reshipFormRef = ref()

// 异常类型选项
const exceptionTypeOptions = [
  { label: '延迟配送', value: 'DELAY' },
  { label: '包裹丢失', value: 'LOST' },
  { label: '包裹损坏', value: 'DAMAGED' },
  { label: '拒收', value: 'REFUSED' },
  { label: '其他', value: 'OTHER' }
]

// 状态选项
const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已关闭', value: 'CLOSED' }
]

// 承运商选项
const carrierOptions = [
  { label: '云途物流', value: 'YUNEXPRESS' },
  { label: 'DHL', value: 'DHL' },
  { label: 'FedEx', value: 'FEDEX' },
  { label: 'UPS', value: 'UPS' }
]

// 表单验证规则
const processRules = {
  action: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
  resolution: [{ required: true, message: '请输入处理说明', trigger: 'blur' }],
  newTrackingNumber: [
    { required: true, message: '请输入新运单号', trigger: 'blur', when: () => processForm.action === 'RESHIP' }
  ],
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur', when: () => processForm.action === 'REFUND' }
  ]
}

const reshipRules = {
  carrier: [{ required: true, message: '请选择承运商', trigger: 'change' }],
  trackingNumber: [{ required: true, message: '请输入运单号', trigger: 'blur' }]
}

// 计算属性
const queryParams = computed((): ExceptionQueryParams => ({
  page: pagination.page,
  size: pagination.size,
  keyword: searchForm.keyword || undefined,
  exceptionType: searchForm.exceptionType || undefined,
  status: searchForm.status || undefined,
  startDate: searchForm.startDate || undefined,
  endDate: searchForm.endDate || undefined
}))

// 方法
const loadExceptionList = async () => {
  try {
    loading.value = true
    const response = await logisticsApi.getLogisticsExceptions(queryParams.value)
    
    if (response.code === 200) {
      exceptionList.value = response.data.records
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.message || '获取异常列表失败')
    }
  } catch (error) {
    console.error('获取异常列表失败:', error)
    ElMessage.error('获取异常列表失败')
  } finally {
    loading.value = false
  }
}

const loadExceptionStats = async () => {
  try {
    const response = await logisticsApi.getExceptionStats()
    
    if (response.code === 200) {
      exceptionStats.value = response.data
    }
  } catch (error) {
    console.error('获取异常统计失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadExceptionList()
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
  loadExceptionList()
  loadExceptionStats()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadExceptionList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadExceptionList()
}

const handleSelectionChange = (selection: LogisticsException[]) => {
  selectedExceptions.value = selection
}

const handleCreateException = () => {
  ElMessage.info('新增异常功能开发中...')
}

const handleExport = async () => {
  try {
    exportLoading.value = true
    const response = await logisticsApi.exportExceptionData(queryParams.value, 'excel')
    
    if (response.code === 200) {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = `异常数据_${new Date().toISOString().split('T')[0]}.xlsx`
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

const handleBatchProcess = () => {
  ElMessage.info('批量处理功能开发中...')
}

const handleViewDetails = async (exception: LogisticsException) => {
  currentException.value = exception
  detailsDialogVisible.value = true
  
  // 加载处理历史
  try {
    const response = await logisticsApi.getExceptionHistory(exception.id)
    if (response.code === 200) {
      exceptionHistory.value = response.data
    }
  } catch (error) {
    console.error('获取处理历史失败:', error)
  }
}

const handleProcessException = (exception: LogisticsException) => {
  currentException.value = exception
  processForm.action = ''
  processForm.resolution = ''
  processForm.newTrackingNumber = ''
  processForm.refundAmount = 0
  processDialogVisible.value = true
}

const confirmProcessException = async () => {
  if (!processFormRef.value) return
  
  try {
    await processFormRef.value.validate()
    
    processLoading.value = true
    const request: ExceptionProcessRequest = {
      exceptionId: currentException.value!.id,
      action: processForm.action,
      resolution: processForm.resolution,
      newTrackingNumber: processForm.newTrackingNumber || undefined,
      refundAmount: processForm.refundAmount || undefined
    }
    
    const response = await logisticsApi.processException(request)
    
    if (response.code === 200) {
      ElMessage.success('异常处理成功')
      processDialogVisible.value = false
      loadExceptionList()
      loadExceptionStats()
    } else {
      ElMessage.error(response.message || '异常处理失败')
    }
  } catch (error) {
    console.error('异常处理失败:', error)
    ElMessage.error('异常处理失败')
  } finally {
    processLoading.value = false
  }
}

const handleReship = (exception: LogisticsException) => {
  currentException.value = exception
  reshipForm.carrier = ''
  reshipForm.trackingNumber = ''
  reshipForm.notes = ''
  reshipDialogVisible.value = true
}

const confirmReship = async () => {
  if (!reshipFormRef.value) return
  
  try {
    await reshipFormRef.value.validate()
    
    reshipLoading.value = true
    const request: ReshipRequest = {
      exceptionId: currentException.value!.id,
      orderId: currentException.value!.orderId,
      carrier: reshipForm.carrier,
      trackingNumber: reshipForm.trackingNumber,
      notes: reshipForm.notes
    }
    
    const response = await logisticsApi.reshipOrder(request)
    
    if (response.code === 200) {
      ElMessage.success('重新发货成功')
      reshipDialogVisible.value = false
      loadExceptionList()
      loadExceptionStats()
    } else {
      ElMessage.error(response.message || '重新发货失败')
    }
  } catch (error) {
    console.error('重新发货失败:', error)
    ElMessage.error('重新发货失败')
  } finally {
    reshipLoading.value = false
  }
}

// 工具方法
const getExceptionTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    DELAY: '延迟配送',
    LOST: '包裹丢失',
    DAMAGED: '包裹损坏',
    REFUSED: '拒收',
    OTHER: '其他'
  }
  return typeMap[type] || type
}

const getExceptionTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    DELAY: 'warning',
    LOST: 'danger',
    DAMAGED: 'danger',
    REFUSED: 'info',
    OTHER: ''
  }
  return colorMap[type] || ''
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    RESOLVED: '已解决',
    CLOSED: '已关闭'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    RESOLVED: 'success',
    CLOSED: 'info'
  }
  return typeMap[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadExceptionList()
  loadExceptionStats()
})
</script>

<style scoped>
.logistics-exception-handling {
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

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stats-icon.exception {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.stats-icon.pending {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.stats-icon.processing {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.stats-icon.resolved {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
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

.exception-info {
  line-height: 1.4;
}

.exception-type {
  margin-bottom: 4px;
}

.exception-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tracking-info {
  line-height: 1.4;
}

.tracking-number {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-family: monospace;
}

.order-number {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
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

/* 异常详情对话框样式 */
.exception-details {
  padding: 0;
}

.details-section {
  margin-bottom: 24px;
}

.details-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.exception-description,
.exception-resolution {
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.history-content {
  padding-left: 8px;
}

.history-action {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.history-description {
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
  line-height: 1.4;
}

.history-operator {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Web端专用样式 */
.logistics-exception-handling {
  min-width: 1200px; /* 确保Web端最小宽度 */
}

.stats-cards {
  min-width: 800px; /* 统计卡片最小宽度 */
}

.table-container {
  min-width: 1000px; /* 表格最小宽度 */
  overflow-x: auto;
}
</style>