/* 订单列表页面逻辑 */

class OrderListManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalRecords = 0;
        this.currentFilters = {};
        this.sortField = '';
        this.sortOrder = 'desc';
        this.selectedOrders = new Set();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadOrders();
    }
    
    bindEvents() {
        // 筛选器事件
        document.getElementById('keyword-filter').addEventListener('input', this.debounce(() => {
            this.applyFilters();
        }, 500));
        
        document.getElementById('status-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('platform-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('start-date').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('end-date').addEventListener('change', () => {
            this.applyFilters();
        });
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 加载订单数据
    async loadOrders() {
        try {
            showLoading();
            
            const params = {
                page: this.currentPage,
                size: this.pageSize,
                ...this.currentFilters
            };
            
            if (this.sortField) {
                params.sortField = this.sortField;
                params.sortOrder = this.sortOrder;
            }
            
            const response = await mockApi.getOrders(params);
            
            if (response.success) {
                this.totalRecords = response.data.total;
                this.renderOrdersTable(response.data.records);
                this.renderPagination();
                this.updateTableInfo();
            } else {
                showToast('加载订单数据失败', 'error');
            }
        } catch (error) {
            console.error('加载订单数据失败:', error);
            showToast('加载订单数据失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 渲染订单表格
    renderOrdersTable(orders) {
        const tbody = document.getElementById('orders-table-body');
        
        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <div class="empty-text">暂无订单数据</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr data-order-id="${order.id}">
                <td>
                    <input type="checkbox" class="row-checkbox" value="${order.id}" 
                           onchange="orderListManager.toggleRowSelection(this)">
                </td>
                <td>
                    <div class="order-no">
                        <strong>${order.orderNo}</strong>
                        <small class="platform-order-id">${order.platformOrderId}</small>
                    </div>
                </td>
                <td>
                    <span class="platform-badge platform-${order.platform.toLowerCase()}">
                        ${order.platform}
                    </span>
                </td>
                <td>
                    <div class="customer-info">
                        <div class="customer-name">${order.customerName}</div>
                        <div class="customer-phone">${order.customerPhone}</div>
                    </div>
                </td>
                <td>
                    <span class="amount">¥${order.totalAmount.toFixed(2)}</span>
                </td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <div class="datetime">
                        <div class="date">${this.formatDate(order.createdAt)}</div>
                        <div class="time">${this.formatTime(order.createdAt)}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <a href="order-detail.html?id=${order.id}" class="btn btn-sm btn-outline" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn btn-sm btn-primary" onclick="orderListManager.updateOrderStatus(${order.id})" 
                                title="更新状态">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${this.canCancelOrder(order.status) ? `
                            <button class="btn btn-sm btn-danger" onclick="orderListManager.cancelOrder(${order.id})" 
                                    title="取消订单">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'pending': '待支付',
            'paid': '已支付',
            'shipped': '已发货',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }
    
    // 判断是否可以取消订单
    canCancelOrder(status) {
        return ['pending', 'paid'].includes(status);
    }
    
    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }
    
    // 格式化时间
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('zh-CN', { hour12: false });
    }
    
    // 渲染分页
    renderPagination() {
        const totalPages = Math.ceil(this.totalRecords / this.pageSize);
        const pageNumbers = document.getElementById('page-numbers');
        
        let paginationHTML = '';
        
        // 计算显示的页码范围
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, this.currentPage + 2);
        
        // 如果总页数小于等于5，显示所有页码
        if (totalPages <= 5) {
            startPage = 1;
            endPage = totalPages;
        }
        
        // 第一页
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="orderListManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        // 中间页码
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="orderListManager.goToPage(${i})">${i}</button>
            `;
        }
        
        // 最后一页
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="orderListManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        pageNumbers.innerHTML = paginationHTML;
        
        // 更新上一页下一页按钮状态
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages || totalPages === 0;
    }
    
    // 更新表格信息
    updateTableInfo() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.totalRecords);
        
        document.getElementById('page-start').textContent = this.totalRecords > 0 ? start : 0;
        document.getElementById('page-end').textContent = end;
        document.getElementById('total-records').textContent = this.totalRecords;
        document.getElementById('total-count').textContent = this.totalRecords;
    }
    
    // 应用筛选器
    applyFilters() {
        const keyword = document.getElementById('keyword-filter').value.trim();
        const status = document.getElementById('status-filter').value;
        const platform = document.getElementById('platform-filter').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        this.currentFilters = {};
        
        if (keyword) {
            this.currentFilters.keyword = keyword;
        }
        
        if (status) {
            this.currentFilters.status = status;
        }
        
        if (platform) {
            this.currentFilters.platform = platform;
        }
        
        if (startDate) {
            this.currentFilters.startDate = startDate;
        }
        
        if (endDate) {
            this.currentFilters.endDate = endDate;
        }
        
        this.currentPage = 1;
        this.loadOrders();
    }
    
    // 重置筛选器
    resetFilters() {
        document.getElementById('keyword-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('platform-filter').value = '';
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadOrders();
    }
    
    // 排序表格
    sortTable(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }
        
        // 更新排序图标
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const currentIcon = document.querySelector(`[onclick="sortTable('${field}')"] i`);
        if (currentIcon) {
            currentIcon.className = `fas fa-sort-${this.sortOrder === 'asc' ? 'up' : 'down'}`;
        }
        
        this.loadOrders();
    }
    
    // 跳转到指定页面
    goToPage(page) {
        if (page !== this.currentPage) {
            this.currentPage = page;
            this.loadOrders();
        }
    }
    
    // 上一页
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadOrders();
        }
    }
    
    // 下一页
    nextPage() {
        const totalPages = Math.ceil(this.totalRecords / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.loadOrders();
        }
    }
    
    // 切换行选择
    toggleRowSelection(checkbox) {
        const orderId = parseInt(checkbox.value);
        
        if (checkbox.checked) {
            this.selectedOrders.add(orderId);
        } else {
            this.selectedOrders.delete(orderId);
        }
        
        // 更新全选复选框状态
        this.updateSelectAllCheckbox();
    }
    
    // 切换全选
    toggleSelectAll(checkbox) {
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        
        rowCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            const orderId = parseInt(cb.value);
            
            if (checkbox.checked) {
                this.selectedOrders.add(orderId);
            } else {
                this.selectedOrders.delete(orderId);
            }
        });
    }
    
    // 更新全选复选框状态
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.querySelector('.select-all');
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCount === rowCheckboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
            selectAllCheckbox.checked = false;
        }
    }
    
    // 查看订单详情
    async viewOrderDetail(orderId) {
        try {
            showLoading();
            
            // 从mock数据中查找订单
            const order = mockData.orders.find(o => o.id === orderId);
            
            if (!order) {
                showToast('订单不存在', 'error');
                return;
            }
            
            this.renderOrderDetail(order);
            document.getElementById('order-detail-modal').classList.add('show');
            
        } catch (error) {
            console.error('获取订单详情失败:', error);
            showToast('获取订单详情失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 渲染订单详情
    renderOrderDetail(order) {
        const content = document.getElementById('order-detail-content');
        
        content.innerHTML = `
            <div class="order-detail">
                <div class="detail-section">
                    <h4 class="section-title">基本信息</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>订单号:</label>
                            <span>${order.orderNo}</span>
                        </div>
                        <div class="detail-item">
                            <label>平台订单号:</label>
                            <span>${order.platformOrderId}</span>
                        </div>
                        <div class="detail-item">
                            <label>销售平台:</label>
                            <span class="platform-badge platform-${order.platform.toLowerCase()}">${order.platform}</span>
                        </div>
                        <div class="detail-item">
                            <label>订单状态:</label>
                            <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>订单金额:</label>
                            <span class="amount">¥${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <label>创建时间:</label>
                            <span>${order.createdAt}</span>
                        </div>
                        ${order.paidAt ? `
                            <div class="detail-item">
                                <label>支付时间:</label>
                                <span>${order.paidAt}</span>
                            </div>
                        ` : ''}
                        ${order.shippedAt ? `
                            <div class="detail-item">
                                <label>发货时间:</label>
                                <span>${order.shippedAt}</span>
                            </div>
                        ` : ''}
                        ${order.completedAt ? `
                            <div class="detail-item">
                                <label>完成时间:</label>
                                <span>${order.completedAt}</span>
                            </div>
                        ` : ''}
                        ${order.cancelledAt ? `
                            <div class="detail-item">
                                <label>取消时间:</label>
                                <span>${order.cancelledAt}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="section-title">客户信息</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>客户姓名:</label>
                            <span>${order.customerName}</span>
                        </div>
                        <div class="detail-item">
                            <label>联系电话:</label>
                            <span>${order.customerPhone}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>收货地址:</label>
                            <span>${order.shippingAddress.province} ${order.shippingAddress.city} ${order.shippingAddress.district} ${order.shippingAddress.detail}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="section-title">商品信息</h4>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-info">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-sku">SKU: ${item.sku}</div>
                                </div>
                                <div class="item-quantity">数量: ${item.quantity}</div>
                                <div class="item-price">单价: ¥${item.price.toFixed(2)}</div>
                                <div class="item-total">小计: ¥${(item.quantity * item.price).toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 更新订单状态
    updateOrderStatus(orderId) {
        const order = mockData.orders.find(o => o.id === orderId);
        
        if (!order) {
            showToast('订单不存在', 'error');
            return;
        }
        
        document.getElementById('update-order-no').value = order.orderNo;
        document.getElementById('update-status').value = order.status;
        document.getElementById('update-remark').value = '';
        
        // 存储当前订单ID
        this.currentUpdateOrderId = orderId;
        
        document.getElementById('status-update-modal').classList.add('show');
    }
    
    // 确认状态更新
    async confirmStatusUpdate() {
        const newStatus = document.getElementById('update-status').value;
        const remark = document.getElementById('update-remark').value;
        
        if (!newStatus) {
            showToast('请选择新状态', 'warning');
            return;
        }
        
        try {
            showLoading();
            
            // 模拟API调用
            await mockApi.delay(1000);
            
            // 更新mock数据中的订单状态
            const order = mockData.orders.find(o => o.id === this.currentUpdateOrderId);
            if (order) {
                order.status = newStatus;
                
                // 根据状态更新相应的时间字段
                const now = new Date().toLocaleString('zh-CN');
                switch (newStatus) {
                    case 'paid':
                        order.paidAt = now;
                        break;
                    case 'shipped':
                        order.shippedAt = now;
                        break;
                    case 'completed':
                        order.completedAt = now;
                        break;
                    case 'cancelled':
                        order.cancelledAt = now;
                        break;
                }
            }
            
            showToast('订单状态更新成功', 'success');
            this.closeStatusUpdateModal();
            this.loadOrders();
            
        } catch (error) {
            console.error('更新订单状态失败:', error);
            showToast('更新订单状态失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 取消订单
    async cancelOrder(orderId) {
        if (!confirm('确定要取消这个订单吗？')) {
            return;
        }
        
        try {
            showLoading();
            
            // 模拟API调用
            await mockApi.delay(1000);
            
            // 更新mock数据中的订单状态
            const order = mockData.orders.find(o => o.id === orderId);
            if (order) {
                order.status = 'cancelled';
                order.cancelledAt = new Date().toLocaleString('zh-CN');
            }
            
            showToast('订单取消成功', 'success');
            this.loadOrders();
            
        } catch (error) {
            console.error('取消订单失败:', error);
            showToast('取消订单失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 关闭订单详情模态框
    closeOrderDetailModal() {
        document.getElementById('order-detail-modal').classList.remove('show');
    }
    
    // 关闭状态更新模态框
    closeStatusUpdateModal() {
        document.getElementById('status-update-modal').classList.remove('show');
        this.currentUpdateOrderId = null;
    }
    
    // 导出订单
    async exportOrders() {
        try {
            showLoading();
            
            // 模拟导出过程
            await mockApi.delay(2000);
            
            showToast('订单数据导出成功', 'success');
            
        } catch (error) {
            console.error('导出订单失败:', error);
            showToast('导出订单失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 同步订单
    async syncOrders() {
        try {
            showLoading();
            
            // 模拟同步过程
            await mockApi.delay(3000);
            
            showToast('订单同步成功', 'success');
            this.loadOrders();
            
        } catch (error) {
            console.error('同步订单失败:', error);
            showToast('同步订单失败', 'error');
        } finally {
            hideLoading();
        }
    }
}

// 全局函数
function applyFilters() {
    orderListManager.applyFilters();
}

function resetFilters() {
    orderListManager.resetFilters();
}

function sortTable(field) {
    orderListManager.sortTable(field);
}

function previousPage() {
    orderListManager.previousPage();
}

function nextPage() {
    orderListManager.nextPage();
}

function toggleSelectAll(checkbox) {
    orderListManager.toggleSelectAll(checkbox);
}

function closeOrderDetailModal() {
    orderListManager.closeOrderDetailModal();
}

function closeStatusUpdateModal() {
    orderListManager.closeStatusUpdateModal();
}

function confirmStatusUpdate() {
    orderListManager.confirmStatusUpdate();
}

function exportOrders() {
    orderListManager.exportOrders();
}

function syncOrders() {
    orderListManager.syncOrders();
}

function editOrder() {
    showToast('编辑订单功能开发中...', 'info');
}

// 页面加载完成后初始化
let orderListManager;

document.addEventListener('DOMContentLoaded', () => {
    orderListManager = new OrderListManager();
});