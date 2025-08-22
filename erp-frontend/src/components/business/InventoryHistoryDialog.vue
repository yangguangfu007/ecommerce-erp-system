<template>
  <el-dialog
    v-model="visible"
    title="库存调整历史"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 商品信息 -->
    <div class="product-info-section">
      <div class="product-card">
        <div class="product-image">
          <img 
            :src="inventory?.productImage || '/placeholder-product.png'" 
            :alt="inventory?.productName"
            @error="handleImageError"
          />
        </div>
        <div class="product-details">
          <div class="product-name">{{ inventory?.productName }}</div>
          <div class="product-sku">SKU: {{ inventory?.sku }}</div>
          <div class="product-location" v-if="inventory?.warehouseLocation">
            位置: {{ inventory.warehouseLocation }}
          </div>
        </div>
        <div class="current-stock">
          <div class="stock-label">当前库存</div>
          <div class="stock-value">{{ inventory?.availableQuantity || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="调整类型">
          <el-select 
            v-model="filterForm.type" 
            placeholder="全部类型"
            clearable
            style="width: 120px"
            @change="loadHistory"
          >
            <el-option label="入库" value="IN" />
            <el-option label="出库" value="OUT" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadHistory"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :icon="Search" 
            @click="loadHistory"
            :loading="loading"
          >
            查询
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 历史记录时间线 -->
    <div class="history-section">
      <div class="section-header">
        <h4 class="section-title">
          调整历史 
          <span class="record-count">({{ pagination.total }} 条记录)</span>
        </h4>
        <div class="section-actions">
          <el-button 
            type="text" 
            :icon="Download" 
            @click="exportHistory"
            size="small"
          >
            导出历史
          </el-button>
        </div>
      </div>

      <div v-loading="loading" class="timeline-container">
        <div v-if="historyList.length === 0" class="empty-state">
          <el-empty description="暂无调整记录" />
        </div>
        
        <el-timeline v-else class="history-timeline">
          <el-timeline-item
            v-for="record in historyList"
            :key="record.id"
            :timestamp="formatDateTime(record.createdAt)"
            placement="top"
            :type="getTimelineType(record.type)"
            :icon="getTimelineIcon(record.type)"
            size="large"
          >
            <div class="timeline-content">
              <div class="timeline-header">
                <div class="operation-info">
                  <span class="operation-type" :class="getOperationClass(record.type)">
                    {{ record.type === 'IN' ? '入库' : '出库' }}
                  </span>
                  <span class="operation-quantity">
                    {{ record.type === 'IN' ? '+' : '-' }}{{ record.quantity }}
                  </span>
                </div>
                <div class="operation-reason">
                  <el-tag :type="getReasonTagType(record.reason)" size="small">
                    {{ getReasonText(record.reason) }}
                  </el-tag>
                </div>
              </div>

              <div class="timeline-body">
                <div class="stock-change">
                  <span class="stock-before">{{ record.beforeQuantity }}</span>
                  <i class="fas fa-arrow-right"></i>
                  <span class="stock-after">{{ record.afterQuantity }}</span>
                </div>
                
                <div class="operation-details">
                  <div v-if="record.note" class="detail-item">
                    <span class="detail-label">说明:</span>
                    <span class="detail-value">{{ record.note }}</span>
                  </div>
                  
                  <div v-if="record.referenceNumber" class="detail-item">
                    <span class="detail-label">参考单号:</span>
                    <span class="detail-value">{{ record.referenceNumber }}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">操作人:</span>
                    <span class="detail-value">{{ record.operatorName }}</span>
                  </div>
                </div>
              </div>

              <!-- 审核状态 -->
              <div v-if="record.auditStatus" class="audit-section">
                <div class="audit-status">
                  <el-tag 
                    :type="getAuditStatusType(record.auditStatus)" 
                    size="small"
                  >
                    {{ getAuditStatusText(record.auditStatus) }}
                  </el-tag>
                </div>
                
                <div v-if="record.auditNote" class="audit-note">
                  <span class="audit-label">审核意见:</span>
                  <span class="audit-text">{{ record.auditNote }}</span>
                </div>
                
                <div v-if="record.auditorName" class="audit-info">
                  <span class="audit-label">审核人:</span>
                  <span class="audit-text">{{ record.auditorName }}</span>
                  <span class="audit-time">{{ formatDateTime(record.auditTime) }}</span>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import { inventoryApi } from '@/api/modules/inventory'
import type { Inventory, InventoryHistory } from '@/types/inventory'

// Props
interface Props {
  modelValue: boolean
  inventory?: Inventory | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  inventory: null
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const historyList = ref<InventoryHistory[]>([])

// 筛选表单
const filterForm = reactive({
  type: '',
  dateRange: null as [string, string] | null
})

// 分页参数
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 方法
const loadHistory = async () => {
  if (!props.inventory?.id) return
  
  loading.value = true
  
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      type: filterForm.type || undefined,
      startDate: filterForm.dateRange?.[0],
      endDate: filterForm.dateRange?.[1]
    }
    
    const response = await inventoryApi.getInventoryHistory(props.inventory.id, params)
    historyList.value = response.records || []
    pagination.total = response.total || 0
  } catch (error) {
    ElMessage.error('加载历史记录失败')
    historyList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.type = ''
  filterForm.dateRange = null
  pagination.page = 1
  loadHistory()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadHistory()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadHistory()
}

const exportHistory = async () => {
  if (!props.inventory?.id) return
  
  try {
    const params = {
      type: filterForm.type || undefined,
      startDate: filterForm.dateRange?.[0],
      endDate: filterForm.dateRange?.[1]
    }
    
    // 这里应该调用导出API
    ElMessage.success('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleClose = () => {
  visible.value = false
  resetFilter()
  historyList.value = []
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-product.png'
}

// 格式化方法
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimelineType = (type: string) => {
  return type === 'IN' ? 'success' : 'warning'
}

const getTimelineIcon = (type: string) => {
  return type === 'IN' ? 'Plus' : 'Minus'
}

const getOperationClass = (type: string) => {
  return type === 'IN' ? 'operation-in' : 'operation-out'
}

const getReasonText = (reason: string) => {
  const reasonMap: Record<string, string> = {
    PURCHASE: '采购入库',
    RETURN: '退货入库',
    SALE: '销售出库',
    DAMAGE: '损坏出库',
    TRANSFER: '调拨',
    STOCKTAKING: '盘点调整',
    OTHER: '其他'
  }
  return reasonMap[reason] || reason
}

const getReasonTagType = (reason: string) => {
  const typeMap: Record<string, string> = {
    PURCHASE: 'success',
    RETURN: 'info',
    SALE: 'primary',
    DAMAGE: 'danger',
    TRANSFER: 'warning',
    STOCKTAKING: 'info',
    OTHER: 'info'
  }
  return typeMap[reason] || 'info'
}

const getAuditStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return typeMap[status] || 'info'
}

const getAuditStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已审核',
    REJECTED: '已拒绝'
  }
  return textMap[status] || status
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal && props.inventory?.id) {
    loadHistory()
  }
})
</script>

<style scoped>
.product-info-section {
  margin-bottom: 24px;
}

.product-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  gap: 16px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  border: 1px solid var(--el-border-color-light);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.product-sku {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 2px;
}

.product-location {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.current-stock {
  text-align: center;
}

.stock-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.stock-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.filter-form {
  margin: 0;
}

.history-section {
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.record-count {
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-regular);
}

.section-actions {
  display: flex;
  gap: 8px;
}

.timeline-container {
  min-height: 300px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.history-timeline {
  padding: 0 20px;
}

.timeline-content {
  background: white;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.operation-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operation-type {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.operation-type.operation-in {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.operation-type.operation-out {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.operation-quantity {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.timeline-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.stock-change {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.stock-before {
  color: var(--el-text-color-regular);
}

.stock-after {
  color: var(--el-color-primary);
}

.operation-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: var(--el-text-color-regular);
  min-width: 60px;
}

.detail-value {
  color: var(--el-text-color-primary);
  flex: 1;
}

.audit-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.audit-status {
  margin-bottom: 8px;
}

.audit-note,
.audit-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 4px;
}

.audit-label {
  color: var(--el-text-color-regular);
  min-width: 60px;
}

.audit-text {
  color: var(--el-text-color-primary);
  flex: 1;
}

.audit-time {
  color: var(--el-text-color-secondary);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .timeline-body {
    flex-direction: column;
    gap: 12px;
  }
  
  .stock-change {
    justify-content: center;
  }
  
  .filter-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
}
</style>