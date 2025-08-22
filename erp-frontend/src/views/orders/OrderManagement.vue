<template>
  <div class="order-management">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>订单列表</h2>
        <p class="page-description">管理和查看所有订单信息，支持订单状态更新和详情查看</p>
      </div>
    </div>

    <!-- 数据表格容器 -->
    <div class="data-table-container">
      <!-- 表格头部 -->
      <div class="table-header">
        <div class="table-title">
          <h3>订单数据</h3>
          <span class="table-count">共 <strong>{{ orderStore.state.total }}</strong> 条记录</span>
        </div>
        <div class="table-actions">
          <el-button 
            class="btn btn-secondary"
            :loading="exportLoading"
            @click="handleExportOrders"
            :icon="Download"
          >
            导出订单
          </el-button>
          <el-button 
            type="primary"
            class="btn btn-primary"
            data-test="sync-orders-btn"
            @click="showSyncDialog = true"
            :icon="RefreshRight"
          >
            同步订单
          </el-button>
        </div>
      </div>
      
      <!-- 筛选器 -->
      <div class="table-filters">
        <div class="filter-group">
          <div class="filter-item">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索订单号或客户姓名..."
              class="filter-input"
              clearable
              @input="handleFilterChange"
            />
          </div>
          <div class="filter-item">
            <el-select
              v-model="filterForm.status"
              placeholder="全部状态"
              class="filter-select"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部状态" value="" />
              <el-option label="待支付" value="PENDING" />
              <el-option label="已支付" value="CONFIRMED" />
              <el-option label="已发货" value="SHIPPED" />
              <el-option label="已完成" value="DELIVERED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </div>
          <div class="filter-item">
            <el-select
              v-model="filterForm.platform"
              placeholder="全部平台"
              class="filter-select"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部平台" value="" />
              <el-option label="Walmart" value="Walmart" />
              <el-option label="Amazon" value="Amazon" />
              <el-option label="eBay" value="eBay" />
            </el-select>
          </div>
          <div class="filter-item">
            <el-date-picker
              v-model="filterForm.startDate"
              type="date"
              placeholder="开始日期"
              class="filter-input"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
          </div>
          <div class="filter-item">
            <el-date-picker
              v-model="filterForm.endDate"
              type="date"
              placeholder="结束日期"
              class="filter-input"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
          </div>
          <div class="filter-actions">
            <el-button class="btn btn-outline" @click="handleResetFilters">重置</el-button>
            <el-button type="primary" class="btn btn-primary" @click="handleApplyFilters">搜索</el-button>
            <el-button 
              class="btn btn-outline" 
              @click="showAdvancedFilters = !showAdvancedFilters"
              :icon="Filter"
            >
              高级筛选
            </el-button>
          </div>
        </div>
        
        <!-- 高级筛选器 -->
        <div v-show="showAdvancedFilters" class="advanced-filters">
          <div class="filter-group">
            <div class="filter-item">
              <el-select
                v-model="filterForm.storeId"
                placeholder="选择店铺"
                class="filter-select"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="全部店铺" value="" />
                <el-option 
                  v-for="store in availableStores" 
                  :key="store.id" 
                  :label="store.name" 
                  :value="store.id" 
                />
              </el-select>
            </div>
            <div class="filter-item">
              <el-input
                v-model="filterForm.minAmount"
                placeholder="最小金额"
                class="filter-input"
                type="number"
                clearable
                @input="handleFilterChange"
              />
            </div>
            <div class="filter-item">
              <el-input
                v-model="filterForm.maxAmount"
                placeholder="最大金额"
                class="filter-input"
                type="number"
                clearable
                @input="handleFilterChange"
              />
            </div>
            <div class="filter-item">
              <el-select
                v-model="filterForm.paymentStatus"
                placeholder="支付状态"
                class="filter-select"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="全部支付状态" value="" />
                <el-option label="未支付" value="UNPAID" />
                <el-option label="已支付" value="PAID" />
                <el-option label="部分退款" value="PARTIAL_REFUND" />
                <el-option label="已退款" value="REFUNDED" />
              </el-select>
            </div>
            <div class="filter-item">
              <el-select
                v-model="filterForm.shippingStatus"
                placeholder="物流状态"
                class="filter-select"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="全部物流状态" value="" />
                <el-option label="未发货" value="NOT_SHIPPED" />
                <el-option label="已发货" value="SHIPPED" />
                <el-option label="运输中" value="IN_TRANSIT" />
                <el-option label="已送达" value="DELIVERED" />
                <el-option label="异常" value="EXCEPTION" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 快速操作面板 -->
      <div class="quick-actions-panel" v-if="orderStore.state.orders && orderStore.state.orders.length > 0">
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-label">待处理订单：</span>
            <span class="stat-value pending">{{ getOrderCountByStatus('PENDING') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">今日订单：</span>
            <span class="stat-value">{{ getTodayOrderCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总金额：</span>
            <span class="stat-value amount">¥{{ getTotalAmount().toFixed(2) }}</span>
          </div>
        </div>
        <div class="quick-actions">
          <el-button 
            size="small" 
            type="primary"
            @click="handleQuickConfirmPending"
            :disabled="getOrderCountByStatus('PENDING') === 0"
            :icon="Check"
          >
            确认待处理
          </el-button>
          <el-button 
            size="small" 
            @click="handleQuickExportToday"
            :icon="Download"
          >
            导出今日
          </el-button>
          <el-button 
            size="small" 
            @click="handleRefreshOrders"
            :icon="Refresh"
          >
            刷新数据
          </el-button>
        </div>
      </div>

      <!-- 批量操作组件 -->
      <BatchOperations
        :selected-count="orderStore.selectedCount"
        :selected-items="orderStore.getSelectedOrders.value"
        item-name="个订单"
        @batch-operation="handleBatchOperation"
        @operation-complete="handleOperationComplete"
        @operation-cancelled="handleOperationCancelled"
      >
        <template #actions="{ selectedCount }">
          <el-button 
            size="small" 
            @click="handleBatchConfirm"
            :disabled="batchOperationLoading"
          >
            批量确认
          </el-button>
          <el-button 
            size="small" 
            @click="handleBatchCancel"
            :disabled="batchOperationLoading"
          >
            批量取消
          </el-button>
          <el-button 
            size="small" 
            @click="handleBatchShip"
            :disabled="batchOperationLoading"
          >
            批量发货
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleBatchDelete"
            :disabled="batchOperationLoading"
          >
            批量删除
          </el-button>
        </template>
      </BatchOperations>
      
      <!-- 表格包装器 -->
      <div class="table-wrapper">
        <el-table
          :data="orderStore.state.orders || []"
          :loading="orderStore.isLoading"
          class="data-table"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          v-loading="orderStore.isLoading"
          element-loading-text="数据加载中..."
          empty-text="暂无订单数据"
        >
          <!-- 选择列 -->
          <el-table-column type="selection" width="55" />
          
          <!-- 订单号列 -->
          <el-table-column prop="orderId" label="订单号" min-width="180" sortable="custom">
            <template #default="{ row }">
              <div class="order-no" v-if="row">
                <strong class="order-id-link" @click="handleViewDetail(row.id)">{{ row.orderId }}</strong>
                <small class="platform-order-id">{{ row.platformOrderId }}</small>
              </div>
            </template>
          </el-table-column>
          
          <!-- 平台列 -->
          <el-table-column prop="platform" label="平台" width="100" sortable="custom">
            <template #default="{ row }">
              <span v-if="row" :class="`platform-badge platform-${(row.store?.platform || row.platform || '').toLowerCase()}`">
                {{ row.store?.platform || row.platform || 'Unknown' }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 客户信息列 -->
          <el-table-column prop="customerName" label="客户姓名" min-width="160" sortable="custom">
            <template #default="{ row }">
              <div class="customer-info" v-if="row">
                <div class="customer-name">{{ row.customerName }}</div>
                <div class="customer-phone">{{ row.shippingAddress?.phone || row.customerEmail }}</div>
              </div>
            </template>
          </el-table-column>
          
          <!-- 订单金额列 -->
          <el-table-column prop="totalAmount" label="订单金额" width="120" sortable="custom">
            <template #default="{ row }">
              <span v-if="row" class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <!-- 订单状态列 -->
          <el-table-column prop="status" label="订单状态" width="120" sortable="custom">
            <template #default="{ row }">
              <span v-if="row" :class="`status-badge status-${row.status.toLowerCase()}`">
                {{ getStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 创建时间列 -->
          <el-table-column prop="orderDate" label="创建时间" width="160" sortable="custom">
            <template #default="{ row }">
              <div class="datetime" v-if="row">
                <div class="date">{{ formatDate(row.orderDate) }}</div>
                <div class="time">{{ formatTime(row.orderDate) }}</div>
              </div>
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons" v-if="row">
                <el-button 
                  size="small" 
                  plain
                  @click="handleViewDetail(row.id)"
                  title="查看详情"
                  :icon="View"
                />
                <el-button 
                  size="small" 
                  type="primary"
                  @click="handleUpdateStatus(row)"
                  title="更新状态"
                  :icon="Edit"
                />
                <el-button 
                  v-if="canCancelOrder(row.status)"
                  size="small" 
                  type="danger"
                  @click="handleCancelOrder(row)"
                  title="取消订单"
                  :icon="Close"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页组件 -->
      <div class="table-pagination">
        <div class="pagination-info">
          显示第 <span>{{ paginationStart }}</span>-<span>{{ paginationEnd }}</span> 条，共 <span>{{ orderStore.state.total }}</span> 条记录
        </div>
        <div class="pagination-controls">
          <el-pagination
            v-model:current-page="orderStore.state.currentPage"
            v-model:page-size="orderStore.state.pageSize"
            :total="orderStore.state.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="prev, pager, next, sizes, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 订单同步对话框 -->
    <el-dialog
      v-model="showSyncDialog"
      title="订单同步"
      width="1000px"
      class="sync-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <OrderSyncPanel
        ref="syncPanelRef"
        :stores="availableStores"
        @sync-started="handleSyncStarted"
        @sync-completed="handleSyncCompleted"
        @sync-failed="handleSyncFailed"
        @sync-cancelled="handleSyncCancelled"
      />
      
      <template #footer>
        <div class="sync-dialog-footer">
          <el-button @click="showSyncDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDetailDialog.visible"
      title="订单详情"
      width="800px"
      class="order-detail-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="orderDetailDialog.order" class="order-detail-content">
        <!-- 订单基本信息 -->
        <div class="detail-section">
          <h4 class="section-title">订单信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>订单号：</label>
              <span>{{ orderDetailDialog.order.orderId }}</span>
            </div>
            <div class="detail-item">
              <label>平台订单号：</label>
              <span>{{ orderDetailDialog.order.platformOrderId }}</span>
            </div>
            <div class="detail-item">
              <label>订单状态：</label>
              <span :class="`status-badge status-${orderDetailDialog.order.status.toLowerCase()}`">
                {{ getStatusText(orderDetailDialog.order.status) }}
              </span>
            </div>
            <div class="detail-item">
              <label>订单金额：</label>
              <span class="amount">¥{{ orderDetailDialog.order.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <label>下单时间：</label>
              <span>{{ formatDateTime(orderDetailDialog.order.orderDate) }}</span>
            </div>
            <div class="detail-item">
              <label>平台：</label>
              <span :class="`platform-badge platform-${(orderDetailDialog.order.store?.platform || orderDetailDialog.order.platform || '').toLowerCase()}`">
                {{ orderDetailDialog.order.store?.platform || orderDetailDialog.order.platform || 'Unknown' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 客户信息 -->
        <div class="detail-section">
          <h4 class="section-title">客户信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>客户姓名：</label>
              <span>{{ orderDetailDialog.order.customerName }}</span>
            </div>
            <div class="detail-item">
              <label>联系邮箱：</label>
              <span>{{ orderDetailDialog.order.customerEmail }}</span>
            </div>
            <div class="detail-item">
              <label>联系电话：</label>
              <span>{{ orderDetailDialog.order.shippingAddress?.phone || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 收货地址 -->
        <div class="detail-section" v-if="orderDetailDialog.order.shippingAddress">
          <h4 class="section-title">收货地址</h4>
          <div class="address-info">
            <p><strong>{{ orderDetailDialog.order.shippingAddress.name }}</strong></p>
            <p>{{ orderDetailDialog.order.shippingAddress.address1 }}</p>
            <p v-if="orderDetailDialog.order.shippingAddress.address2">{{ orderDetailDialog.order.shippingAddress.address2 }}</p>
            <p>{{ orderDetailDialog.order.shippingAddress.city }}, {{ orderDetailDialog.order.shippingAddress.state }} {{ orderDetailDialog.order.shippingAddress.zipCode }}</p>
            <p>{{ orderDetailDialog.order.shippingAddress.country }}</p>
            <p v-if="orderDetailDialog.order.shippingAddress.phone">电话：{{ orderDetailDialog.order.shippingAddress.phone }}</p>
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="detail-section">
          <h4 class="section-title">订单商品</h4>
          <el-table :data="orderDetailDialog.order?.items || []" class="order-items-table">
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="单价" width="100" align="right">
              <template #default="{ row }">
                ¥{{ row.unitPrice.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="小计" width="100" align="right">
              <template #default="{ row }">
                ¥{{ row.totalPrice.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 物流信息 -->
        <div class="detail-section" v-if="orderDetailDialog.order.shipping">
          <h4 class="section-title">物流信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>配送方式：</label>
              <span>{{ orderDetailDialog.order.shipping.method || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>物流公司：</label>
              <span>{{ orderDetailDialog.order.shipping.carrier || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>运单号：</label>
              <span>{{ orderDetailDialog.order.shipping.trackingNumber || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>运费：</label>
              <span>¥{{ (orderDetailDialog.order.shipping.cost || 0).toFixed(2) }}</span>
            </div>
            <div class="detail-item" v-if="orderDetailDialog.order.shipping.estimatedDelivery">
              <label>预计送达：</label>
              <span>{{ formatDateTime(orderDetailDialog.order.shipping.estimatedDelivery) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="modal-footer">
          <el-button @click="orderDetailDialog.visible = false">关闭</el-button>
          <el-button 
            type="primary" 
            @click="handleUpdateStatus(orderDetailDialog.order)"
            v-if="orderDetailDialog.order"
          >
            更新状态
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 状态更新对话框 -->
    <el-dialog
      v-model="statusUpdateDialog.visible"
      title="更新订单状态"
      width="500px"
      class="modal-container"
      :close-on-click-modal="false"
    >
      <el-form
        ref="statusFormRef"
        :model="statusUpdateDialog.form"
        :rules="statusUpdateRules"
        label-width="100px"
      >
        <el-form-item label="订单号" class="form-group">
          <el-input 
            v-model="statusUpdateDialog.form.orderNo" 
            class="form-input"
            readonly 
          />
        </el-form-item>
        
        <el-form-item label="新状态" prop="status" class="form-group">
          <el-select 
            v-model="statusUpdateDialog.form.status" 
            placeholder="请选择状态"
            class="form-select"
          >
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="CONFIRMED" />
            <el-option label="已发货" value="SHIPPED" />
            <el-option label="已完成" value="DELIVERED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注" class="form-group">
          <el-input
            v-model="statusUpdateDialog.form.notes"
            type="textarea"
            class="form-textarea"
            :rows="3"
            placeholder="请输入状态更新备注..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="modal-footer">
          <el-button class="btn btn-secondary" @click="statusUpdateDialog.visible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="btn btn-primary"
            @click="handleConfirmStatusUpdate"
            :loading="statusUpdateDialog.loading"
          >
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
}

.action-buttons .el-button {
  padding: 5px 8px;
  min-width: auto;
  height: 28px;
  border-radius: 4px;
}

.action-buttons .el-button--small {
  font-size: 12px;
  padding: 5px 8px;
}

.action-buttons .el-button .el-icon {
  margin-right: 0;
  font-size: 14px;
}

/* 只显示图标的按钮样式 */
.action-buttons .el-button:not(.el-button--text) {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 查看按钮 - plain样式 */
.action-buttons .el-button--plain {
  color: #606266;
  background-color: #fff;
  border-color: #dcdfe6;
}

.action-buttons .el-button--plain:hover {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

/* 主要按钮样式 */
.action-buttons .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.action-buttons .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 危险按钮样式 */
.action-buttons .el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

.action-buttons .el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}

/* 状态徽章样式 */
.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-pending {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.status-confirmed {
  background-color: #edf2fc;
  color: #909399;
  border: 1px solid #d3d4d6;
}

.status-shipped {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.status-delivered {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.status-cancelled {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

/* 平台徽章样式 */
.platform-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.platform-walmart {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.platform-amazon {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.platform-ebay {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

/* 订单号样式 */
.order-no {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-id-link {
  color: #409eff;
  cursor: pointer;
  font-weight: 600;
}

.order-id-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.platform-order-id {
  color: #909399;
  font-size: 12px;
}

/* 客户信息样式 */
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-weight: 500;
  color: #303133;
}

.customer-phone {
  color: #909399;
  font-size: 12px;
}

/* 金额样式 */
.amount {
  font-weight: 600;
  color: #e6a23c;
}

/* 时间样式 */
.datetime {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  color: #303133;
  font-size: 13px;
}

.time {
  color: #909399;
  font-size: 12px;
}

/* 快速统计面板样式 */
.quick-actions-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.quick-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.stat-value.pending {
  color: #e6a23c;
}

.stat-value.amount {
  color: #67c23a;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

/* 订单详情对话框样式 */
.order-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  margin-right: 8px;
}

.detail-item span {
  color: #303133;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.address-info {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
}

.address-info p {
  margin: 4px 0;
  color: #303133;
}

.order-items-table {
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .action-buttons .el-button {
    width: 24px;
    height: 24px;
    padding: 0;
  }
  
  .action-buttons .el-button .el-icon {
    font-size: 12px;
  }
  
  .quick-actions-panel {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .quick-stats {
    justify-content: space-around;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    height: 24px;
    justify-content: center;
  }
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Download, 
  Refresh, 
  View, 
  Edit, 
  Close,
  Check,
  RefreshRight,
  Filter
} from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'
import BatchOperations from '@/components/business/BatchOperations.vue'
import OrderSyncPanel from '@/components/business/OrderSyncPanel.vue'
import type { Order, OrderStatus, OrderQuery, Store, OrderSyncResult } from '@/types'

// 路由
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()

// 面包屑导航
const breadcrumbItems = [
  { label: '首页', to: '/dashboard' },
  { label: '订单管理' },
  { label: '订单列表' }
]

// 筛选表单
const filterForm = reactive<Partial<OrderQuery>>({
  keyword: '',
  status: '',
  platform: '',
  startDate: '',
  endDate: '',
  storeId: '',
  minAmount: '',
  maxAmount: '',
  paymentStatus: '',
  shippingStatus: ''
})

// 高级筛选显示状态
const showAdvancedFilters = ref(false)

// 订单详情对话框
const orderDetailDialog = reactive({
  visible: false,
  loading: false,
  order: null as Order | null
})

// 状态更新对话框
const statusUpdateDialog = reactive({
  visible: false,
  loading: false,
  form: {
    id: 0,
    orderNo: '',
    status: '' as OrderStatus,
    notes: ''
  }
})

// 表单引用
const statusFormRef = ref()
const syncPanelRef = ref()

// 对话框状态
const showSyncDialog = ref(false)

// 加载状态
const exportLoading = ref(false)
const batchOperationLoading = ref(false)

// 可用店铺列表（模拟数据，实际应从API获取）
const availableStores = ref<Store[]>([
  { id: 1, name: 'Walmart旗舰店', platform: 'Walmart', status: 'ACTIVE' },
  { id: 2, name: 'Amazon官方店', platform: 'Amazon', status: 'ACTIVE' },
  { id: 3, name: 'eBay专营店', platform: 'eBay', status: 'ACTIVE' }
])

// 状态更新表单验证规则
const statusUpdateRules = {
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

// 防抖定时器
let filterTimer: NodeJS.Timeout | null = null

// 计算属性
const canCancelOrder = (status: OrderStatus) => {
  return ['PENDING', 'CONFIRMED'].includes(status)
}

// 分页信息计算
const paginationStart = computed(() => {
  const { currentPage, pageSize, total } = orderStore.state
  if (total === 0) return 0
  return (currentPage - 1) * pageSize + 1
})

const paginationEnd = computed(() => {
  const { currentPage, pageSize, total } = orderStore.state
  return Math.min(currentPage * pageSize, total)
})

// 获取状态文本 - 匹配HTML原型
const getStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    PENDING: '待支付',
    CONFIRMED: '已支付', 
    SHIPPED: '已发货',
    DELIVERED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态徽章类型
const getStatusBadgeType = (status: OrderStatus): string => {
  const typeMap: Record<OrderStatus, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    SHIPPED: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'danger'
  }
  return typeMap[status] || 'default'
}

// 获取平台徽章类型
const getPlatformBadgeType = (platform: string): string => {
  const typeMap: Record<string, string> = {
    Walmart: 'primary',
    Amazon: 'warning',
    eBay: 'success'
  }
  return typeMap[platform] || 'default'
}

// 格式化日期 - 匹配HTML原型格式
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric', 
    day: 'numeric'
  })
}

// 格式化时间 - 匹配HTML原型格式
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化完整日期时间
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 事件处理函数

// 筛选变化处理（防抖）
const handleFilterChange = () => {
  if (filterTimer) {
    clearTimeout(filterTimer)
  }
  filterTimer = setTimeout(() => {
    handleApplyFilters()
  }, 500)
}

// 应用筛选
const handleApplyFilters = async () => {
  orderStore.setFilters(filterForm)
  orderStore.setPagination(1)
  await orderStore.fetchOrders()
}

// 重置筛选
const handleResetFilters = async () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key as keyof typeof filterForm] = ''
  })
  orderStore.clearFilters()
  orderStore.setPagination(1)
  await orderStore.fetchOrders()
}

// 分页变化
const handlePageChange = async (page: number) => {
  orderStore.setPagination(page)
  await orderStore.fetchOrders()
}

// 页面大小变化
const handleSizeChange = async (size: number) => {
  orderStore.setPagination(1, size)
  await orderStore.fetchOrders()
}

// 选择变化
const handleSelectionChange = (selection: Order[]) => {
  orderStore.clearSelection()
  selection.forEach(order => {
    orderStore.selectOrder(order.id)
  })
}

// 排序变化
const handleSortChange = async ({ prop, order }: { prop: string; order: string }) => {
  const sortOrder = order === 'ascending' ? 'asc' : 'desc'
  orderStore.setFilters({ 
    sortField: prop, 
    sortOrder 
  })
  await orderStore.fetchOrders()
}

// 查看详情
const handleViewDetail = async (orderId: number) => {
  try {
    orderDetailDialog.loading = true
    orderDetailDialog.visible = true
    
    // 从store中获取订单详情，如果没有则从API获取
    const order = orderStore.state.orders.find(o => o.id === orderId)
    if (order) {
      orderDetailDialog.order = order
    } else {
      // 这里应该调用API获取订单详情
      // const orderDetail = await orderStore.getOrderDetail(orderId)
      // orderDetailDialog.order = orderDetail
      
      // 临时使用现有数据
      orderDetailDialog.order = orderStore.state.orders[0] || null
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
    orderDetailDialog.visible = false
  } finally {
    orderDetailDialog.loading = false
  }
}

// 更新状态
const handleUpdateStatus = (order: Order) => {
  statusUpdateDialog.form.id = order.id
  statusUpdateDialog.form.orderNo = order.orderId
  statusUpdateDialog.form.status = order.status
  statusUpdateDialog.form.notes = ''
  statusUpdateDialog.visible = true
}

// 确认状态更新
const handleConfirmStatusUpdate = async () => {
  if (!statusFormRef.value) return
  
  try {
    await statusFormRef.value.validate()
    
    statusUpdateDialog.loading = true
    
    await orderStore.updateOrderStatus({
      id: statusUpdateDialog.form.id,
      status: statusUpdateDialog.form.status,
      notes: statusUpdateDialog.form.notes
    })
    
    ElMessage.success('订单状态更新成功')
    statusUpdateDialog.visible = false
    
  } catch (error) {
    console.error('更新订单状态失败:', error)
    ElMessage.error('更新订单状态失败')
  } finally {
    statusUpdateDialog.loading = false
  }
}

// 取消订单
const handleCancelOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.orderId} 吗？`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await orderStore.cancelOrder(order.id, '用户取消')
    ElMessage.success('订单取消成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 批量操作处理
const handleBatchOperation = async (operation: string, params: any) => {
  try {
    batchOperationLoading.value = true
    
    const operationParams = {
      orderIds: orderStore.state.selectedOrderIds,
      operation: operation as 'updateStatus' | 'cancel' | 'ship' | 'confirm' | 'delete',
      ...params
    }
    
    await orderStore.batchOperateOrders(operationParams)
    
  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
  } finally {
    batchOperationLoading.value = false
  }
}

// 批量操作完成处理
const handleOperationComplete = (result: { success: number; failed: number; errors: unknown[] }) => {
  batchOperationLoading.value = false
  
  if (result.failed === 0) {
    ElMessage.success(`批量操作成功，共处理 ${result.success} 个订单`)
  } else {
    ElMessage.warning(`批量操作完成，成功 ${result.success} 个，失败 ${result.failed} 个`)
  }
  
  // 刷新订单列表
  orderStore.fetchOrders()
}

// 批量操作取消处理
const handleOperationCancelled = () => {
  batchOperationLoading.value = false
  ElMessage.info('批量操作已取消')
}

// 批量确认（兼容旧版本）
const handleBatchConfirm = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量确认选中的 ${orderStore.selectedCount} 个订单吗？`,
      '批量确认订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await handleBatchOperation('confirm', {})
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量确认失败:', error)
      ElMessage.error('批量确认失败')
    }
  }
}

// 批量取消（兼容旧版本）
const handleBatchCancel = () => {
  handleBatchOperation('cancel', { reason: '批量取消' })
}

// 批量发货
const handleBatchShip = () => {
  handleBatchOperation('ship', {})
}

// 批量删除（兼容旧版本）
const handleBatchDelete = () => {
  handleBatchOperation('delete', {})
}

// 导出订单
const handleExportOrders = async () => {
  try {
    exportLoading.value = true
    
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('订单数据导出成功')
    
  } catch (error) {
    console.error('导出订单失败:', error)
    ElMessage.error('导出订单失败')
  } finally {
    exportLoading.value = false
  }
}

// 快速操作函数
const getOrderCountByStatus = (status: OrderStatus): number => {
  return orderStore.state.orders?.filter(order => order.status === status).length || 0
}

const getTodayOrderCount = (): number => {
  const today = new Date().toDateString()
  return orderStore.state.orders?.filter(order => 
    new Date(order.orderDate).toDateString() === today
  ).length || 0
}

const getTotalAmount = (): number => {
  return orderStore.state.orders?.reduce((total, order) => total + order.totalAmount, 0) || 0
}

const handleQuickConfirmPending = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量确认所有待处理订单吗？共 ${getOrderCountByStatus('PENDING')} 个订单`,
      '批量确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const pendingOrders = orderStore.state.orders?.filter(order => order.status === 'PENDING') || []
    const orderIds = pendingOrders.map(order => order.id)
    
    await orderStore.batchOperateOrders({
      orderIds,
      operation: 'confirm'
    })
    
    ElMessage.success(`成功确认 ${orderIds.length} 个订单`)
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量确认失败:', error)
      ElMessage.error('批量确认失败')
    }
  }
}

const handleQuickExportToday = async () => {
  try {
    exportLoading.value = true
    
    const today = new Date().toDateString()
    const todayOrders = orderStore.state.orders?.filter(order => 
      new Date(order.orderDate).toDateString() === today
    ) || []
    
    if (todayOrders.length === 0) {
      ElMessage.warning('今日暂无订单数据')
      return
    }
    
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success(`成功导出今日 ${todayOrders.length} 个订单`)
    
  } catch (error) {
    console.error('导出今日订单失败:', error)
    ElMessage.error('导出今日订单失败')
  } finally {
    exportLoading.value = false
  }
}

const handleRefreshOrders = async () => {
  try {
    await orderStore.fetchOrders()
    ElMessage.success('订单数据已刷新')
  } catch (error) {
    console.error('刷新订单数据失败:', error)
    ElMessage.error('刷新订单数据失败')
  }
}

// 同步事件处理
const handleSyncStarted = (task: OrderSyncResult) => {
  ElMessage.success(`同步任务已启动，任务ID: ${task.taskId.substring(0, 8)}...`)
}

const handleSyncCompleted = (task: OrderSyncResult) => {
  ElMessage.success(`同步完成！成功 ${task.successCount} 个，失败 ${task.failedCount} 个`)
  // 刷新订单列表
  orderStore.fetchOrders()
}

const handleSyncFailed = (task: OrderSyncResult, error: unknown) => {
  ElMessage.error(`同步失败：${error.message || '未知错误'}`)
}

const handleSyncCancelled = (taskId: string) => {
  ElMessage.info(`同步任务 ${taskId.substring(0, 8)}... 已取消`)
}

// 生命周期
onMounted(async () => {
  await orderStore.fetchOrders()
})

// 导出组件方法和数据供模板使用
defineExpose({
  filterForm,
  orderDetailDialog,
  statusUpdateDialog,
  showAdvancedFilters,
  handleFilterChange,
  handleResetFilters,
  handleApplyFilters,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange,
  handleSortChange,
  handleViewDetail,
  handleUpdateStatus,
  handleConfirmStatusUpdate,
  handleCancelOrder,
  handleBatchOperation,
  handleOperationComplete,
  handleOperationCancelled,
  handleBatchConfirm,
  handleBatchCancel,
  handleBatchShip,
  handleBatchDelete,
  handleExportOrders,
  handleSyncStarted,
  handleSyncCompleted,
  handleSyncFailed,
  handleSyncCancelled,
  getStatusText,
  canCancelOrder,
  formatDate,
  formatTime,
  formatDateTime,
  paginationStart,
  paginationEnd,
  getOrderCountByStatus,
  getTodayOrderCount,
  getTotalAmount,
  handleQuickConfirmPending,
  handleQuickExportToday,
  handleRefreshOrders
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-description {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.table-title h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.table-count {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.table-count strong {
  color: var(--el-color-primary);
}

.table-actions {
  display: flex;
  gap: 12px;
}

/* 筛选器样式 - 匹配HTML原型 */
.table-filters {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
}

.advanced-filters {
  padding: 16px 0 0 0;
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 16px;
}

/* 快速操作面板样式 */
.quick-actions-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid var(--el-border-color-light);
  margin: 0 -20px 0 -20px;
}

.quick-stats {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-value.pending {
  color: var(--el-color-warning);
}

.stat-value.amount {
  color: var(--el-color-success);
}

.quick-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-item {
  flex: 0 0 auto;
}

.filter-input {
  width: 200px;
}

.filter-select {
  width: 140px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}



/* 表格包装器样式 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 1200px;
}

/* 订单号样式 */
.order-no {
  line-height: 1.4;
}

.order-no strong {
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: block;
}

.order-id-link {
  cursor: pointer;
  color: var(--el-color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.order-id-link:hover {
  color: var(--el-color-primary-light-3);
  text-decoration: underline;
}

.platform-order-id {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
  display: block;
}

/* 客户信息样式 */
.customer-info {
  line-height: 1.4;
}

.customer-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.customer-phone {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

/* 金额样式 */
.amount {
  font-weight: 600;
  color: var(--el-color-success);
}

/* 时间样式 */
.datetime {
  line-height: 1.4;
}

.date {
  color: var(--el-text-color-primary);
}

.time {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 平台徽章样式 - 匹配HTML原型 */
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

/* 状态徽章样式 - 匹配HTML原型 */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: white;
}

.status-badge.status-pending {
  background-color: #e6a23c;
}

.status-badge.status-confirmed {
  background-color: #409eff;
}

.status-badge.status-shipped {
  background-color: #67c23a;
}

.status-badge.status-delivered {
  background-color: #67c23a;
}

.status-badge.status-cancelled {
  background-color: #f56c6c;
}

/* 按钮样式 - 匹配HTML原型 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.btn-secondary {
  background-color: #909399;
  border-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
}

.btn-outline {
  background-color: transparent;
  border-color: #dcdfe6;
  color: #606266;
}

.btn-outline:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.btn-danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  min-width: 32px;
}

/* 分页组件样式 - 匹配HTML原型 */
.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

.pagination-info {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.pagination-controls {
  display: flex;
  align-items: center;
}

/* 模态框样式 - 匹配HTML原型 */
.modal-container {
  border-radius: 8px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 20px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
}

/* 表格行样式 */
:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: var(--el-table-row-hover-bg-color);
}

/* 空状态样式 */
:deep(.el-table__empty-block) {
  padding: 60px 0;
}

:deep(.el-table__empty-text) {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

:deep(.el-table__empty-text::before) {
  content: '📦';
  display: block;
  font-size: 48px;
  margin-bottom: 16px;
}

/* 加载状态样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-loading-spinner) {
  margin-top: -25px;
}

:deep(.el-loading-text) {
  color: var(--el-color-primary);
  font-size: 14px;
}

/* 表格滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 订单详情对话框样式 */
.order-detail-dialog {
  border-radius: 8px;
}

.order-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.detail-item label {
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin-right: 8px;
  min-width: 80px;
}

.detail-item span {
  color: var(--el-text-color-primary);
}

.address-info {
  background: var(--el-bg-color-page);
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
}

.address-info p {
  margin: 0 0 4px 0;
}

.address-info p:last-child {
  margin-bottom: 0;
}

.order-items-table {
  margin-top: 8px;
}

.order-items-table :deep(.el-table__header) {
  background-color: var(--el-bg-color-page);
}

/* 同步对话框样式 */
.sync-dialog {
  border-radius: 8px;
}

.sync-dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-management {
    padding: 12px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    flex: 1;
  }
  
  .filter-input,
  .filter-select {
    width: 100%;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
  

  
  .table-pagination {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .data-table {
    min-width: 800px;
  }
  
  .filter-group {
    gap: 8px;
  }
  
  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .btn-sm {
    padding: 3px 6px;
    font-size: 11px;
  }
}
</style>