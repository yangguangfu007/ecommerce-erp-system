<template>
  <div class="shipping-labels">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>面单生成</h2>
      <p>生成和打印物流面单，支持批量操作</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showGenerateDialog">
          <el-icon><Plus /></el-icon>
          生成面单
        </el-button>
        <el-button 
          type="success" 
          :disabled="selectedOrders.length === 0"
          @click="batchGenerate"
        >
          <el-icon><DocumentAdd /></el-icon>
          批量生成 ({{ selectedOrders.length }})
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号、收件人..."
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-form :model="filters" inline>
        <el-form-item label="订单状态">
          <el-select v-model="filters.orderStatus" placeholder="全部状态" clearable>
            <el-option label="待发货" value="PENDING_SHIPMENT" />
            <el-option label="已发货" value="SHIPPED" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流公司">
          <el-select v-model="filters.carrier" placeholder="全部物流" clearable>
            <el-option 
              v-for="carrier in carriers" 
              :key="carrier.code"
              :label="carrier.name" 
              :value="carrier.code" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilters">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <div class="orders-table">
      <el-table
        :data="orders"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNumber" label="订单号" width="150" />
        <el-table-column label="收件人信息" width="200">
          <template #default="{ row }">
            <div class="recipient-info">
              <div class="name">{{ row.shippingAddress?.name || '未知' }}</div>
              <div class="phone">{{ row.shippingAddress?.phone || '未知' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收件地址" min-width="250">
          <template #default="{ row }">
            <div class="address">
              {{ formatAddress(row.shippingAddress) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="物流费用" width="100">
          <template #default="{ row }">
            ¥{{ (row.cost || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)">
              {{ getOrderStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="面单状态" width="120">
          <template #default="{ row }">
            <el-tag 
              v-if="row.labelUrl" 
              :type="getLabelStatusType(row.status)"
            >
              {{ getLabelStatusText(row.status) }}
            </el-tag>
            <span v-else class="text-gray-400">未生成</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="!row.labelUrl"
              type="primary" 
              size="small"
              @click="generateSingle(row)"
            >
              生成面单
            </el-button>
            <template v-else>
              <el-button 
                type="success" 
                size="small"
                @click="previewLabelFunc(row)"
              >
                预览
              </el-button>
              <el-button 
                type="info" 
                size="small"
                @click="printLabel(row)"
              >
                打印
              </el-button>
              <el-button 
                type="warning" 
                size="small"
                @click="regenerateLabel(row)"
              >
                重新生成
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
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

    <!-- 面单生成对话框 -->
    <el-dialog
      v-model="generateDialogVisible"
      title="生成面单"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物流公司" prop="carrier">
              <el-select v-model="generateForm.carrier" placeholder="选择物流公司">
                <el-option 
                  v-for="carrier in carriers" 
                  :key="carrier.carrier"
                  :label="carrier.name" 
                  :value="carrier.carrier" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面单模板" prop="template">
              <el-select v-model="generateForm.template" placeholder="选择面单模板">
                <el-option 
                  v-for="template in templates" 
                  :key="template.id"
                  :label="template.name" 
                  :value="template.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="发件人信息" prop="senderInfo">
          <el-card class="sender-card">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名" label-width="60px">
                  <el-input v-model="generateForm.senderInfo.name" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="电话" label-width="60px">
                  <el-input v-model="generateForm.senderInfo.phone" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="公司" label-width="60px">
                  <el-input v-model="generateForm.senderInfo.company" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="地址" label-width="60px">
              <el-input 
                v-model="generateForm.senderInfo.address" 
                type="textarea" 
                :rows="2"
              />
            </el-form-item>
          </el-card>
        </el-form-item>

        <el-form-item label="特殊要求">
          <el-checkbox-group v-model="generateForm.specialRequirements">
            <el-checkbox label="fragile">易碎品</el-checkbox>
            <el-checkbox label="urgent">加急</el-checkbox>
            <el-checkbox label="cod">货到付款</el-checkbox>
            <el-checkbox label="insurance">保价</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="generateForm.specialRequirements.includes('insurance')" label="保价金额">
          <el-input-number 
            v-model="generateForm.insuranceAmount" 
            :min="0" 
            :precision="2"
            placeholder="保价金额"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input 
            v-model="generateForm.remarks" 
            type="textarea" 
            :rows="3"
            placeholder="面单备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGenerate" :loading="generating">
          {{ isBatchMode ? '批量生成' : '生成面单' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 面单预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="面单预览"
      width="600px"
    >
      <div v-if="previewLabel" class="label-preview">
        <div class="preview-toolbar">
          <el-button type="primary" @click="printPreviewLabel">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
          <el-button @click="downloadLabel">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
        
        <div class="preview-content">
          <img 
            v-if="previewLabel.labelUrl" 
            :src="previewLabel.labelUrl" 
            alt="面单预览"
            class="label-image"
          />
          <div v-else class="no-preview">
            <el-icon><Document /></el-icon>
            <p>暂无预览图片</p>
          </div>
        </div>

        <div class="label-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="面单号">
              {{ previewLabel.trackingNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="物流公司">
              {{ previewLabel.carrier }}
            </el-descriptions-item>
            <el-descriptions-item label="生成时间">
              {{ formatDateTime(previewLabel.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getLabelStatusType(previewLabel.status)">
                {{ getLabelStatusText(previewLabel.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  DocumentAdd, 
  Refresh, 
  Search, 
  Printer, 
  Download, 
  Document 
} from '@element-plus/icons-vue'
import { logisticsApi } from '@/api/modules/logistics'
import type { 
  LogisticsOrder,
  CreateLabelRequest,
  CreateLabelResponse,
  CarrierConfig,
  ShippingAddress
} from '@/api/modules/logistics'

// 响应式数据
const loading = ref(false)
const generating = ref(false)
const searchKeyword = ref('')
const selectedOrders = ref<LogisticsOrder[]>([])
const orders = ref<LogisticsOrder[]>([])
const carriers = ref<CarrierConfig[]>([])
const templates = ref<any[]>([])

// 对话框状态
const generateDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const previewLabel = ref<LogisticsOrder | null>(null)
const isBatchMode = ref(false)

// 筛选器
const filters = reactive({
  orderStatus: '',
  carrier: '',
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 面单生成表单
const generateForm = reactive({
  carrier: '',
  template: '',
  senderInfo: {
    name: '',
    phone: '',
    company: '',
    address: ''
  },
  specialRequirements: [] as string[],
  insuranceAmount: 0,
  remarks: ''
})

// 表单验证规则
const generateRules = {
  carrier: [
    { required: true, message: '请选择物流公司', trigger: 'change' }
  ],
  template: [
    { required: true, message: '请选择面单模板', trigger: 'change' }
  ]
}

const generateFormRef = ref()

// 计算属性
const filteredOrders = computed(() => {
  if (!searchKeyword.value) return orders.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return orders.value.filter(order => 
    order.orderNumber.toLowerCase().includes(keyword) ||
    order.shippingAddress.name.toLowerCase().includes(keyword) ||
    order.shippingAddress.phone.includes(keyword)
  )
})

// 生命周期
onMounted(() => {
  loadInitialData()
})

// 方法
const loadInitialData = async () => {
  await Promise.all([
    loadOrders(),
    loadCarriers(),
    loadTemplates()
  ])
}

const loadOrders = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      keyword: searchKeyword.value,
      ...filters,
      startDate: filters.dateRange?.[0],
      endDate: filters.dateRange?.[1]
    }
    
    const response = await logisticsApi.getLogisticsOrders(params)
    orders.value = response.data.records
    pagination.total = response.data.total
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

const loadCarriers = async () => {
  try {
    const response = await logisticsApi.getCarrierConfigs()
    carriers.value = response.data
  } catch (error) {
    console.error('加载物流公司失败:', error)
  }
}

const loadTemplates = async () => {
  try {
    // 模拟模板数据，实际应该从 API 获取
    templates.value = [
      { id: 1, name: '标准模板', carrierCode: 'UPS' },
      { id: 2, name: '热敏模板', carrierCode: 'UPS' },
      { id: 3, name: 'A4模板', carrierCode: 'FEDEX' }
    ]
  } catch (error) {
    console.error('加载面单模板失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadOrders()
}

const applyFilters = () => {
  pagination.page = 1
  loadOrders()
}

const resetFilters = () => {
  Object.assign(filters, {
    orderStatus: '',
    carrier: '',
    dateRange: null
  })
  pagination.page = 1
  loadOrders()
}

const refreshData = () => {
  loadOrders()
}

const handleSelectionChange = (selection: LogisticsOrder[]) => {
  selectedOrders.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadOrders()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadOrders()
}

const showGenerateDialog = () => {
  isBatchMode.value = false
  resetGenerateForm()
  generateDialogVisible.value = true
}

const batchGenerate = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要生成面单的订单')
    return
  }
  
  isBatchMode.value = true
  resetGenerateForm()
  generateDialogVisible.value = true
}

const generateSingle = (order: LogisticsOrder) => {
  selectedOrders.value = [order]
  showGenerateDialog()
}

const resetGenerateForm = () => {
  Object.assign(generateForm, {
    carrier: '',
    template: '',
    senderInfo: {
      name: '默认发件人',
      phone: '400-123-4567',
      company: 'ERP系统',
      address: '默认发件地址'
    },
    specialRequirements: [],
    insuranceAmount: 0,
    remarks: ''
  })
}

const confirmGenerate = async () => {
  try {
    await generateFormRef.value?.validate()
    
    generating.value = true
    
    const requests: CreateLabelRequest[] = selectedOrders.value.map(order => ({
      orderId: order.orderId,
      carrier: generateForm.carrier as any,
      service: 'STANDARD' as any,
      shippingAddress: order.shippingAddress,
      packageInfo: {
        weight: order.weight || 1,
        dimensions: order.dimensions,
        declaredValue: order.declaredValue,
        currency: order.currency
      },
      labelFormat: 'PDF'
    }))
    
    if (isBatchMode.value) {
      await logisticsApi.batchCreateLabels(requests)
      ElMessage.success(`成功生成 ${requests.length} 个面单`)
    } else {
      await logisticsApi.createLabel(requests[0])
      ElMessage.success('面单生成成功')
    }
    
    generateDialogVisible.value = false
    loadOrders()
  } catch (error) {
    console.error('生成面单失败:', error)
    ElMessage.error('生成面单失败')
  } finally {
    generating.value = false
  }
}

const previewLabelFunc = (order: LogisticsOrder) => {
  previewLabel.value = order
  previewDialogVisible.value = true
}

const printLabel = async (order: LogisticsOrder) => {
  try {
    await logisticsApi.printLabels([order.id])
    ElMessage.success('打印任务已发送')
  } catch (error) {
    console.error('打印面单失败:', error)
    ElMessage.error('打印面单失败')
  }
}

const printPreviewLabel = () => {
  if (previewLabel.value) {
    printLabel(previewLabel.value)
  }
}

const downloadLabel = async () => {
  if (!previewLabel.value) return
  
  try {
    const response = await logisticsApi.downloadLabel(previewLabel.value.id)
    
    // 直接使用返回的下载链接
    if (response.data.downloadUrl) {
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = `面单_${previewLabel.value.trackingNumber}.pdf`
      link.click()
    }
    
    ElMessage.success('面单下载成功')
  } catch (error) {
    console.error('下载面单失败:', error)
    ElMessage.error('下载面单失败')
  }
}

const regenerateLabel = async (order: LogisticsOrder) => {
  try {
    await ElMessageBox.confirm(
      '重新生成面单将覆盖原有面单，是否继续？',
      '确认重新生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectedOrders.value = [order]
    showGenerateDialog()
  } catch {
    // 用户取消
  }
}

// 工具方法
const formatAddress = (address: ShippingAddress) => {
  if (!address) return '地址信息缺失'
  return `${address.state || ''} ${address.city || ''} ${address.address1 || ''} ${address.address2 || ''}`
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const getOrderStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'CREATED': 'info',
    'PICKED_UP': 'warning',
    'IN_TRANSIT': 'warning',
    'DELIVERED': 'success',
    'EXCEPTION': 'danger',
    'RETURNED': 'info'
  }
  return statusMap[status] || 'info'
}

const getOrderStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'CREATED': '已创建',
    'PICKED_UP': '已取件',
    'IN_TRANSIT': '运输中',
    'DELIVERED': '已送达',
    'EXCEPTION': '异常',
    'RETURNED': '已退回'
  }
  return statusMap[status] || status
}

const getLabelStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'CREATED': 'success',
    'PICKED_UP': 'warning',
    'IN_TRANSIT': 'warning',
    'DELIVERED': 'success',
    'EXCEPTION': 'danger',
    'RETURNED': 'info'
  }
  return statusMap[status] || 'info'
}

const getLabelStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'CREATED': '已生成',
    'PICKED_UP': '已取件',
    'IN_TRANSIT': '运输中',
    'DELIVERED': '已送达',
    'EXCEPTION': '异常',
    'RETURNED': '已退回'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.shipping-labels {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.filters {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.orders-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.recipient-info .name {
  font-weight: 500;
  margin-bottom: 4px;
}

.recipient-info .phone {
  color: #666;
  font-size: 12px;
}

.address {
  line-height: 1.4;
}

.pagination {
  padding: 20px;
  text-align: right;
}

.sender-card {
  width: 100%;
}

.sender-card :deep(.el-card__body) {
  padding: 16px;
}

.label-preview {
  text-align: center;
}

.preview-toolbar {
  margin-bottom: 20px;
  text-align: right;
}

.preview-content {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px dashed #ddd;
  border-radius: 8px;
}

.label-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.no-preview {
  padding: 40px;
  color: #999;
}

.no-preview .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.label-info {
  text-align: left;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>