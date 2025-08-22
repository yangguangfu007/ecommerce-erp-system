<template>
  <div class="order-detail">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 订单头部信息 -->
    <div v-if="order" class="order-header">
      <div class="order-header-left">
        <h2 class="order-title">
          <span>{{ order.orderId }}</span>
          <StatusBadge :status="order.status" :type="'order'" />
        </h2>
        <div class="order-meta">
          <span class="order-platform">
            平台：
            <span :class="`platform-badge platform-${(order.store?.platform || '').toLowerCase()}`">
              {{ order.store?.platform || 'Unknown' }}
            </span>
          </span>
          <span class="order-time">创建时间：{{ formatDateTime(order.orderDate) }}</span>
        </div>
      </div>
      <div class="order-header-right">
        <div class="order-actions">
          <el-button @click="goBack">
            <i class="fas fa-arrow-left"></i>
            返回列表
          </el-button>
          <el-button @click="handlePrintOrder">
            <i class="fas fa-print"></i>
            打印订单
          </el-button>
          <el-button 
            v-if="canEditOrder(order.status)"
            type="primary"
            @click="handleEditOrder"
          >
            <i class="fas fa-edit"></i>
            编辑订单
          </el-button>
        </div>
      </div>
    </div>

    <!-- 订单详情内容 -->
    <div v-if="order" class="order-detail-content">
      <!-- 基本信息卡片 -->
      <BaseCard class="detail-card">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-info-circle"></i>
              基本信息
            </h3>
          </div>
        </template>
        <div class="detail-grid">
          <div class="detail-item">
            <label>订单号</label>
            <span>{{ order.orderId }}</span>
          </div>
          <div class="detail-item">
            <label>平台订单号</label>
            <span>{{ order.platformOrderId }}</span>
          </div>
          <div class="detail-item">
            <label>销售平台</label>
            <span :class="`platform-badge platform-${(order.store?.platform || '').toLowerCase()}`">
              {{ order.store?.platform || 'Unknown' }}
            </span>
          </div>
          <div class="detail-item">
            <label>订单状态</label>
            <StatusBadge :status="order.status" :type="'order'" />
          </div>
          <div class="detail-item">
            <label>订单金额</label>
            <span class="amount">¥{{ order.totalAmount?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="detail-item">
            <label>创建时间</label>
            <span>{{ formatDateTime(order.orderDate) }}</span>
          </div>
          <div v-if="order.shipDate" class="detail-item">
            <label>发货时间</label>
            <span>{{ formatDateTime(order.shipDate) }}</span>
          </div>
          <div v-if="order.trackingNumber" class="detail-item">
            <label>物流单号</label>
            <span>{{ order.trackingNumber }}</span>
          </div>
        </div>
      </BaseCard>

      <!-- 客户信息卡片 -->
      <BaseCard class="detail-card">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-user"></i>
              客户信息
            </h3>
          </div>
        </template>
        <div class="detail-grid">
          <div class="detail-item">
            <label>客户姓名</label>
            <span>{{ order.customerName }}</span>
          </div>
          <div class="detail-item">
            <label>联系邮箱</label>
            <span>{{ order.customerEmail || '未提供' }}</span>
          </div>
          <div v-if="order.shippingAddress?.phone" class="detail-item">
            <label>联系电话</label>
            <span>{{ order.shippingAddress.phone }}</span>
          </div>
          <div class="detail-item full-width">
            <label>收货地址</label>
            <span>
              {{ order.shippingAddress.country }} 
              {{ order.shippingAddress.state }} 
              {{ order.shippingAddress.city }} 
              {{ order.shippingAddress.address1 }}
              {{ order.shippingAddress.address2 ? ' ' + order.shippingAddress.address2 : '' }}
              {{ order.shippingAddress.postalCode }}
            </span>
          </div>
        </div>
      </BaseCard>

      <!-- 商品信息卡片 -->
      <BaseCard class="detail-card">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-box"></i>
              商品信息
            </h3>
          </div>
        </template>
        <div class="order-items-table">
          <BaseTable
            :data="order.items"
            :columns="itemColumns"
            :show-pagination="false"
          >
            <template #productTitle="{ row }">
              <div class="item-info">
                <div class="item-name">{{ row.productTitle }}</div>
                <div class="item-sku">SKU: {{ row.sku }}</div>
              </div>
            </template>
            <template #unitPrice="{ row }">
              <span class="item-price">¥{{ row.unitPrice?.toFixed(2) || '0.00' }}</span>
            </template>
            <template #totalPrice="{ row }">
              <span class="item-total">¥{{ row.totalPrice?.toFixed(2) || '0.00' }}</span>
            </template>
          </BaseTable>
          <div class="order-total">
            <div class="total-row">
              <span class="total-label">订单总额：</span>
              <span class="total-amount">¥{{ order.totalAmount?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 操作历史卡片 -->
      <BaseCard class="detail-card">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-history"></i>
              操作历史
            </h3>
          </div>
        </template>
        <div class="order-history">
          <div class="timeline">
            <div 
              v-for="event in orderHistory" 
              :key="event.id"
              :class="['timeline-item', event.type]"
            >
              <div class="timeline-marker">
                <i :class="['fas', event.icon]"></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4 class="timeline-title">{{ event.title }}</h4>
                  <span class="timeline-time">{{ formatDateTime(event.time) }}</span>
                </div>
                <div class="timeline-description">{{ event.description }}</div>
                <div v-if="event.remark" class="timeline-remark">{{ event.remark }}</div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 状态更新卡片 -->
      <BaseCard v-if="canUpdateStatus(order.status)" class="detail-card">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-tasks"></i>
              状态操作
            </h3>
          </div>
        </template>
        <div class="status-actions">
          <el-form 
            ref="statusFormRef"
            :model="statusForm"
            :rules="statusFormRules"
            label-width="100px"
            class="status-form"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="更新状态" prop="status">
                  <el-select 
                    v-model="statusForm.status" 
                    placeholder="请选择新状态"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="option in getAvailableStatusOptions(order.status)"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注" prop="notes">
                  <el-input
                    v-model="statusForm.notes"
                    placeholder="请输入状态更新备注"
                    maxlength="200"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label=" ">
                  <el-button 
                    type="primary" 
                    :loading="statusUpdateLoading"
                    @click="handleUpdateStatus"
                  >
                    <i class="fas fa-save"></i>
                    更新状态
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </BaseCard>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-loading text="数据加载中..." />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="loadOrderDetail">重新加载</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import type { Order, OrderStatus, TableColumn } from '@/types'

// 路由
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()

// 响应式数据
const order = ref<Order | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const statusUpdateLoading = ref(false)

// 状态更新表单
const statusFormRef = ref<FormInstance>()
const statusForm = reactive({
  status: '' as OrderStatus,
  notes: ''
})

// 表单验证规则
const statusFormRules: FormRules = {
  status: [
    { required: true, message: '请选择新状态', trigger: 'change' }
  ]
}

// 面包屑导航
const breadcrumbItems = computed(() => [
  { label: '首页', to: '/dashboard' },
  { label: '订单管理' },
  { label: '订单列表', to: '/orders' },
  { label: '订单详情' }
])

// 获取订单ID
const orderId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string)
})

// 商品表格列配置
const itemColumns: TableColumn[] = [
  {
    prop: 'productTitle',
    label: '商品信息',
    minWidth: '200px',
    showOverflowTooltip: true
  },
  {
    prop: 'sku',
    label: 'SKU',
    width: '150px'
  },
  {
    prop: 'unitPrice',
    label: '单价',
    width: '100px'
  },
  {
    prop: 'quantity',
    label: '数量',
    width: '80px'
  },
  {
    prop: 'totalPrice',
    label: '小计',
    width: '100px'
  }
]

// 订单历史记录
const orderHistory = computed(() => {
  if (!order.value) return []
  
  const events = []
  
  // 订单创建
  events.push({
    id: 1,
    type: 'created',
    icon: 'fa-plus-circle',
    title: '订单创建',
    time: order.value.orderDate,
    description: `订单 ${order.value.orderId} 已创建，等待处理`,
    remark: null
  })
  
  // 根据订单状态添加相应事件
  if (order.value.status === 'CONFIRMED' || order.value.status === 'SHIPPED' || order.value.status === 'DELIVERED') {
    events.push({
      id: 2,
      type: 'confirmed',
      icon: 'fa-check-circle',
      title: '订单确认',
      time: order.value.updatedAt,
      description: '订单已确认，准备发货',
      remark: null
    })
  }
  
  if (order.value.status === 'SHIPPED' || order.value.status === 'DELIVERED') {
    events.push({
      id: 3,
      type: 'shipped',
      icon: 'fa-truck',
      title: '订单发货',
      time: order.value.shipDate || order.value.updatedAt,
      description: '订单已发货，商品正在配送中',
      remark: order.value.trackingNumber ? `物流单号：${order.value.trackingNumber}` : null
    })
  }
  
  if (order.value.status === 'DELIVERED') {
    events.push({
      id: 4,
      type: 'delivered',
      icon: 'fa-check-circle',
      title: '订单完成',
      time: order.value.updatedAt,
      description: '订单已完成，交易成功',
      remark: null
    })
  }
  
  if (order.value.status === 'CANCELLED') {
    events.push({
      id: 5,
      type: 'cancelled',
      icon: 'fa-times-circle',
      title: '订单取消',
      time: order.value.updatedAt,
      description: '订单已取消',
      remark: '订单已被取消'
    })
  }
  
  // 按时间倒序排列
  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
})

// 工具函数
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const canEditOrder = (status: OrderStatus): boolean => {
  return ['PENDING', 'CONFIRMED'].includes(status)
}

const canUpdateStatus = (status: OrderStatus): boolean => {
  return status !== 'DELIVERED' && status !== 'CANCELLED'
}

const getAvailableStatusOptions = (currentStatus: OrderStatus) => {
  const allOptions = [
    { label: '待处理', value: 'PENDING' },
    { label: '已确认', value: 'CONFIRMED' },
    { label: '已发货', value: 'SHIPPED' },
    { label: '已完成', value: 'DELIVERED' },
    { label: '已取消', value: 'CANCELLED' }
  ]
  
  // 根据当前状态过滤可选状态
  switch (currentStatus) {
    case 'PENDING':
      return allOptions.filter(opt => ['CONFIRMED', 'CANCELLED'].includes(opt.value))
    case 'CONFIRMED':
      return allOptions.filter(opt => ['SHIPPED', 'CANCELLED'].includes(opt.value))
    case 'SHIPPED':
      return allOptions.filter(opt => ['DELIVERED'].includes(opt.value))
    default:
      return []
  }
}

// 事件处理
const goBack = () => {
  router.push('/orders')
}

const handleEditOrder = () => {
  ElMessage.info('编辑订单功能开发中...')
}

const handlePrintOrder = () => {
  if (!order.value) return
  
  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器设置')
    return
  }
  
  const printContent = generatePrintContent()
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

const generatePrintContent = (): string => {
  if (!order.value) return ''
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>订单详情 - ${order.value.orderId}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { text-align: right; font-weight: bold; font-size: 16px; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>电商ERP管理系统</h1>
            <h2>订单详情</h2>
        </div>
        
        <div class="order-info">
            <p><strong>订单号：</strong>${order.value.orderId}</p>
            <p><strong>平台订单号：</strong>${order.value.platformOrderId}</p>
            <p><strong>销售平台：</strong>${order.value.store?.platform || 'Unknown'}</p>
            <p><strong>订单状态：</strong>${order.value.status}</p>
            <p><strong>创建时间：</strong>${formatDateTime(order.value.orderDate)}</p>
        </div>
        
        <div class="section">
            <h3>客户信息</h3>
            <p><strong>客户姓名：</strong>${order.value.customerName}</p>
            <p><strong>联系邮箱：</strong>${order.value.customerEmail || '未提供'}</p>
            <p><strong>收货地址：</strong>${order.value.shippingAddress.country} ${order.value.shippingAddress.state} ${order.value.shippingAddress.city} ${order.value.shippingAddress.address1} ${order.value.shippingAddress.address2 || ''} ${order.value.shippingAddress.postalCode}</p>
        </div>
        
        <div class="section">
            <h3>商品信息</h3>
            <table>
                <thead>
                    <tr>
                        <th>商品名称</th>
                        <th>SKU</th>
                        <th>单价</th>
                        <th>数量</th>
                        <th>小计</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.value.items.map(item => `
                        <tr>
                            <td>${item.productTitle}</td>
                            <td>${item.sku}</td>
                            <td>¥${item.unitPrice?.toFixed(2) || '0.00'}</td>
                            <td>${item.quantity}</td>
                            <td>¥${item.totalPrice?.toFixed(2) || '0.00'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">
                <p>订单总额：¥${order.value.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
        </div>
        
        <div class="section">
            <p style="text-align: center; color: #666; font-size: 12px;">
                打印时间：${new Date().toLocaleString('zh-CN')}
            </p>
        </div>
    </body>
    </html>
  `
}

const handleUpdateStatus = async () => {
  if (!statusFormRef.value || !order.value) return
  
  try {
    await statusFormRef.value.validate()
    
    if (statusForm.status === order.value.status) {
      ElMessage.warning('状态未发生变化')
      return
    }
    
    await ElMessageBox.confirm(
      `确定要将订单状态从"${order.value.status}"更新为"${statusForm.status}"吗？`,
      '确认更新',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    statusUpdateLoading.value = true
    
    await orderStore.updateOrderStatus({
      id: order.value.id,
      status: statusForm.status,
      notes: statusForm.notes
    })
    
    ElMessage.success('订单状态更新成功')
    
    // 重新加载订单详情
    await loadOrderDetail()
    
    // 重置表单
    statusForm.status = '' as OrderStatus
    statusForm.notes = ''
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新订单状态失败:', error)
      ElMessage.error('更新订单状态失败')
    }
  } finally {
    statusUpdateLoading.value = false
  }
}

const loadOrderDetail = async () => {
  if (!orderId.value) {
    error.value = '无效的订单ID'
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const result = await orderStore.fetchOrderById(orderId.value)
    if (result) {
      order.value = result
    } else {
      error.value = '订单不存在'
    }
  } catch (err) {
    console.error('加载订单详情失败:', err)
    error.value = '加载订单详情失败'
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

/* 订单头部样式 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header-left {
  flex: 1;
}

.order-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.order-meta {
  display: flex;
  gap: 24px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.order-platform,
.order-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-header-right {
  flex-shrink: 0;
}

.order-actions {
  display: flex;
  gap: 12px;
}

/* 订单详情内容 */
.order-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 20px 24px 0 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-title i {
  color: var(--el-color-primary);
}

/* 详情网格布局 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 24px 24px 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.detail-item span {
  font-size: 14px;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.amount {
  font-weight: 600;
  color: var(--el-color-success);
  font-size: 16px;
}

/* 平台徽章样式 */
.platform-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: white;
}

.platform-badge.platform-walmart {
  background-color: #0071ce;
}

.platform-badge.platform-amazon {
  background-color: #ff9900;
}

.platform-badge.platform-ebay {
  background-color: #e53238;
}

.platform-badge.platform-unknown {
  background-color: #909399;
}

/* 商品表格样式 */
.order-items-table {
  padding: 0 24px 24px 24px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-sku {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.item-price,
.item-total {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-total {
  color: var(--el-color-success);
}

.order-total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
  text-align: right;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.total-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-success);
}

/* 时间线样式 */
.order-history {
  padding: 20px 24px 24px 24px;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--el-border-color-light);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -22px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-marker i {
  font-size: 8px;
  color: white;
}

.timeline-item.created .timeline-marker {
  background: var(--el-color-info);
}

.timeline-item.confirmed .timeline-marker {
  background: var(--el-color-primary);
}

.timeline-item.shipped .timeline-marker {
  background: var(--el-color-warning);
}

.timeline-item.delivered .timeline-marker {
  background: var(--el-color-success);
}

.timeline-item.cancelled .timeline-marker {
  background: var(--el-color-danger);
}

.timeline-content {
  padding-left: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.timeline-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.timeline-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.timeline-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.timeline-remark {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

/* 状态操作样式 */
.status-actions {
  padding: 20px 24px 24px 24px;
}

.status-form {
  background: var(--el-bg-color-page);
  padding: 20px;
  border-radius: 6px;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-detail {
    padding: 12px;
  }
  
  .order-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .order-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    padding-left: 20px;
  }
  
  .timeline-marker {
    left: -16px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .status-form :deep(.el-row) {
    flex-direction: column;
  }
  
  .status-form :deep(.el-col) {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>