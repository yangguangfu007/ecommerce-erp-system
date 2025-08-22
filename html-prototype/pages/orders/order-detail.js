/* 订单详情页面逻辑 */

class OrderDetailManager {
    constructor() {
        this.orderId = null;
        this.orderData = null;
        
        this.init();
    }
    
    init() {
        // 从URL参数获取订单ID
        this.orderId = this.getOrderIdFromUrl();
        
        if (this.orderId) {
            this.loadOrderDetail();
        } else {
            showToast('订单ID参数缺失', 'error');
            setTimeout(() => {
                window.location.href = 'order-list.html';
            }, 2000);
        }
    }
    
    // 从URL参数获取订单ID
    getOrderIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    // 加载订单详情
    async loadOrderDetail() {
        try {
            showLoading();
            
            // 从mock数据中查找订单
            const order = mockData.orders.find(o => o.id == this.orderId);
            
            if (!order) {
                showToast('订单不存在', 'error');
                setTimeout(() => {
                    window.location.href = 'order-list.html';
                }, 2000);
                return;
            }
            
            this.orderData = order;
            this.renderOrderDetail();
            
        } catch (error) {
            console.error('加载订单详情失败:', error);
            showToast('加载订单详情失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 渲染订单详情
    renderOrderDetail() {
        const order = this.orderData;
        
        // 更新页面标题和头部信息
        document.title = `订单详情 - ${order.orderNo} - 电商ERP管理系统`;
        document.getElementById('order-number').textContent = order.orderNo;
        document.getElementById('order-status-badge').textContent = this.getStatusText(order.status);
        document.getElementById('order-status-badge').className = `status-badge status-${order.status}`;
        document.getElementById('order-platform').textContent = `平台：${order.platform}`;
        document.getElementById('order-time').textContent = `创建时间：${order.createdAt}`;
        
        // 基本信息
        document.getElementById('detail-order-no').textContent = order.orderNo;
        document.getElementById('detail-platform-order-id').textContent = order.platformOrderId;
        document.getElementById('detail-platform').innerHTML = `<span class="platform-badge platform-${order.platform.toLowerCase()}">${order.platform}</span>`;
        document.getElementById('detail-status').innerHTML = `<span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span>`;
        document.getElementById('detail-amount').textContent = `¥${order.totalAmount.toFixed(2)}`;
        document.getElementById('detail-created-at').textContent = order.createdAt;
        
        // 显示相应的时间字段
        this.showTimeFields(order);
        
        // 客户信息
        document.getElementById('detail-customer-name').textContent = order.customerName;
        document.getElementById('detail-customer-phone').textContent = order.customerPhone;
        document.getElementById('detail-shipping-address').textContent = 
            `${order.shippingAddress.province} ${order.shippingAddress.city} ${order.shippingAddress.district} ${order.shippingAddress.detail}`;
        
        // 商品信息
        this.renderOrderItems(order.items);
        document.getElementById('order-total-amount').textContent = `¥${order.totalAmount.toFixed(2)}`;
        
        // 操作历史
        this.renderOrderHistory(order);
        
        // 设置状态选择器的当前值
        document.getElementById('new-status').value = order.status;
    }
    
    // 显示时间字段
    showTimeFields(order) {
        // 隐藏所有时间字段
        document.getElementById('paid-time-item').style.display = 'none';
        document.getElementById('shipped-time-item').style.display = 'none';
        document.getElementById('completed-time-item').style.display = 'none';
        document.getElementById('cancelled-time-item').style.display = 'none';
        
        // 根据订单状态显示相应的时间字段
        if (order.paidAt) {
            document.getElementById('paid-time-item').style.display = 'block';
            document.getElementById('detail-paid-at').textContent = order.paidAt;
        }
        
        if (order.shippedAt) {
            document.getElementById('shipped-time-item').style.display = 'block';
            document.getElementById('detail-shipped-at').textContent = order.shippedAt;
        }
        
        if (order.completedAt) {
            document.getElementById('completed-time-item').style.display = 'block';
            document.getElementById('detail-completed-at').textContent = order.completedAt;
        }
        
        if (order.cancelledAt) {
            document.getElementById('cancelled-time-item').style.display = 'block';
            document.getElementById('detail-cancelled-at').textContent = order.cancelledAt;
        }
    }
    
    // 渲染订单商品
    renderOrderItems(items) {
        const tbody = document.getElementById('order-items-tbody');
        
        tbody.innerHTML = items.map(item => `
            <tr>
                <td>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                    </div>
                </td>
                <td>
                    <span class="item-sku">${item.sku}</span>
                </td>
                <td>
                    <span class="item-price">¥${item.price.toFixed(2)}</span>
                </td>
                <td>
                    <span class="item-quantity">${item.quantity}</span>
                </td>
                <td>
                    <span class="item-total">¥${(item.quantity * item.price).toFixed(2)}</span>
                </td>
            </tr>
        `).join('');
    }
    
    // 渲染操作历史
    renderOrderHistory(order) {
        const timeline = document.getElementById('order-timeline');
        const events = this.generateOrderEvents(order);
        
        timeline.innerHTML = events.map(event => `
            <div class="timeline-item ${event.type}">
                <div class="timeline-marker">
                    <i class="fas ${event.icon}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4 class="timeline-title">${event.title}</h4>
                        <span class="timeline-time">${event.time}</span>
                    </div>
                    <div class="timeline-description">${event.description}</div>
                    ${event.remark ? `<div class="timeline-remark">${event.remark}</div>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    // 生成订单事件
    generateOrderEvents(order) {
        const events = [];
        
        // 订单创建
        events.push({
            type: 'created',
            icon: 'fa-plus-circle',
            title: '订单创建',
            time: order.createdAt,
            description: `订单 ${order.orderNo} 已创建，等待支付`,
            remark: null
        });
        
        // 订单支付
        if (order.paidAt) {
            events.push({
                type: 'paid',
                icon: 'fa-credit-card',
                title: '订单支付',
                time: order.paidAt,
                description: `订单已支付，金额：¥${order.totalAmount.toFixed(2)}`,
                remark: null
            });
        }
        
        // 订单发货
        if (order.shippedAt) {
            events.push({
                type: 'shipped',
                icon: 'fa-truck',
                title: '订单发货',
                time: order.shippedAt,
                description: '订单已发货，商品正在配送中',
                remark: null
            });
        }
        
        // 订单完成
        if (order.completedAt) {
            events.push({
                type: 'completed',
                icon: 'fa-check-circle',
                title: '订单完成',
                time: order.completedAt,
                description: '订单已完成，交易成功',
                remark: null
            });
        }
        
        // 订单取消
        if (order.cancelledAt) {
            events.push({
                type: 'cancelled',
                icon: 'fa-times-circle',
                title: '订单取消',
                time: order.cancelledAt,
                description: '订单已取消',
                remark: '用户主动取消'
            });
        }
        
        // 按时间倒序排列
        return events.sort((a, b) => new Date(b.time) - new Date(a.time));
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
    
    // 更新订单状态
    async updateOrderStatus() {
        const newStatus = document.getElementById('new-status').value;
        const remark = document.getElementById('status-remark').value.trim();
        
        if (!newStatus) {
            showToast('请选择新状态', 'warning');
            return;
        }
        
        if (newStatus === this.orderData.status) {
            showToast('状态未发生变化', 'warning');
            return;
        }
        
        try {
            showLoading();
            
            // 模拟API调用
            await mockApi.delay(1000);
            
            // 更新订单状态
            const oldStatus = this.orderData.status;
            this.orderData.status = newStatus;
            
            // 根据状态更新相应的时间字段
            const now = new Date().toLocaleString('zh-CN');
            switch (newStatus) {
                case 'paid':
                    this.orderData.paidAt = now;
                    break;
                case 'shipped':
                    this.orderData.shippedAt = now;
                    break;
                case 'completed':
                    this.orderData.completedAt = now;
                    break;
                case 'cancelled':
                    this.orderData.cancelledAt = now;
                    break;
            }
            
            // 同步更新mock数据
            const orderIndex = mockData.orders.findIndex(o => o.id == this.orderId);
            if (orderIndex !== -1) {
                mockData.orders[orderIndex] = { ...this.orderData };
            }
            
            // 重新渲染页面
            this.renderOrderDetail();
            
            // 清空备注输入框
            document.getElementById('status-remark').value = '';
            
            showToast(`订单状态已从"${this.getStatusText(oldStatus)}"更新为"${this.getStatusText(newStatus)}"`, 'success');
            
        } catch (error) {
            console.error('更新订单状态失败:', error);
            showToast('更新订单状态失败', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // 打印订单
    printOrder() {
        // 创建打印窗口
        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintContent();
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
    
    // 生成打印内容
    generatePrintContent() {
        const order = this.orderData;
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>订单详情 - ${order.orderNo}</title>
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
                    <p><strong>订单号：</strong>${order.orderNo}</p>
                    <p><strong>平台订单号：</strong>${order.platformOrderId}</p>
                    <p><strong>销售平台：</strong>${order.platform}</p>
                    <p><strong>订单状态：</strong>${this.getStatusText(order.status)}</p>
                    <p><strong>创建时间：</strong>${order.createdAt}</p>
                </div>
                
                <div class="section">
                    <h3>客户信息</h3>
                    <p><strong>客户姓名：</strong>${order.customerName}</p>
                    <p><strong>联系电话：</strong>${order.customerPhone}</p>
                    <p><strong>收货地址：</strong>${order.shippingAddress.province} ${order.shippingAddress.city} ${order.shippingAddress.district} ${order.shippingAddress.detail}</p>
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
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.sku}</td>
                                    <td>¥${item.price.toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                    <td>¥${(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        <p>订单总额：¥${order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="section">
                    <p style="text-align: center; color: #666; font-size: 12px;">
                        打印时间：${new Date().toLocaleString('zh-CN')}
                    </p>
                </div>
            </body>
            </html>
        `;
    }
}

// 全局函数
function goBack() {
    window.location.href = 'order-list.html';
}

function printOrder() {
    orderDetailManager.printOrder();
}

function editOrder() {
    showToast('编辑订单功能开发中...', 'info');
}

function updateOrderStatus() {
    orderDetailManager.updateOrderStatus();
}

// 页面加载完成后初始化
let orderDetailManager;

document.addEventListener('DOMContentLoaded', () => {
    orderDetailManager = new OrderDetailManager();
});