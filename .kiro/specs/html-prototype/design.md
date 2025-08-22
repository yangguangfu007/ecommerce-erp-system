# HTML原型设计文档

## 概述

本设计文档基于电商ERP系统的需求，设计完整的HTML静态原型实现方案。该原型将使用现代HTML5、CSS3和JavaScript技术，创建高保真的用户界面展示，包含完整的交互效果和响应式设计。原型将作为前端开发的视觉参考和用户体验验证工具，帮助团队在开发前确认界面设计和用户流程的合理性。

## 架构设计

### 技术栈选择

- **HTML5**: 语义化标签，提供良好的结构和可访问性
- **CSS3**: 现代样式特性，包括Flexbox、Grid、动画和响应式设计
- **Vanilla JavaScript**: 原生JavaScript实现交互效果，无框架依赖
- **Font Awesome**: 图标库，提供丰富的界面图标
- **Chart.js**: 轻量级图表库，用于数据可视化展示
- **Mock Data**: 静态JSON数据，模拟真实业务数据

### 项目结构设计

```
html-prototype/
├── index.html                  # 主入口页面（登录页）
├── dashboard.html              # 仪表板页面
├── assets/
│   ├── css/
│   │   ├── reset.css          # CSS重置样式
│   │   ├── variables.css      # CSS变量定义
│   │   ├── components.css     # 组件样式
│   │   ├── layout.css         # 布局样式
│   │   ├── pages.css          # 页面特定样式
│   │   ├── responsive.css     # 响应式样式
│   │   └── themes.css         # 主题样式
│   ├── js/
│   │   ├── app.js            # 主应用逻辑
│   │   ├── components.js     # 组件逻辑
│   │   ├── utils.js          # 工具函数
│   │   ├── mock-data.js      # 模拟数据
│   │   └── charts.js         # 图表配置
│   ├── images/
│   │   ├── logo.png          # 系统Logo
│   │   ├── avatars/          # 用户头像
│   │   └── products/         # 商品图片
│   └── fonts/                # 自定义字体
├── pages/
│   ├── users/
│   │   ├── user-list.html    # 用户列表页
│   │   ├── user-detail.html  # 用户详情页
│   │   └── role-management.html # 角色管理页
│   ├── products/
│   │   ├── product-list.html # 商品列表页
│   │   ├── product-detail.html # 商品详情页
│   │   └── product-import.html # 商品导入页
│   ├── orders/
│   │   ├── order-list.html   # 订单列表页
│   │   └── order-detail.html # 订单详情页
│   ├── inventory/
│   │   ├── inventory-list.html # 库存列表页
│   │   └── inventory-alerts.html # 库存预警页
│   ├── platforms/
│   │   ├── platform-list.html # 平台列表页
│   │   └── platform-config.html # 平台配置页
│   ├── logistics/
│   │   ├── logistics-list.html # 物流列表页
│   │   └── shipping-labels.html # 面单管理页
│   ├── notifications/
│   │   ├── notification-center.html # 通知中心页
│   │   └── notification-templates.html # 通知模板页
│   └── settings/
│       ├── system-config.html # 系统配置页
│       └── system-logs.html  # 系统日志页
├── components/
│   ├── header.html           # 顶部导航组件
│   ├── sidebar.html          # 侧边菜单组件
│   ├── breadcrumb.html       # 面包屑组件
│   ├── pagination.html       # 分页组件
│   ├── modal.html            # 模态框组件
│   └── table.html            # 表格组件
└── README.md                 # 项目说明文档
```

## 组件和接口设计

### 核心组件设计

#### 1. 布局组件 (Layout Components)

**主布局容器**
```html
<!-- components/layout.html -->
<div class="app-container">
  <header class="app-header">
    <!-- 顶部导航栏 -->
  </header>
  <aside class="app-sidebar">
    <!-- 侧边菜单 -->
  </aside>
  <main class="app-main">
    <nav class="breadcrumb">
      <!-- 面包屑导航 -->
    </nav>
    <div class="page-content">
      <!-- 页面内容区域 -->
    </div>
  </main>
</div>
```

**CSS布局样式**
```css
/* assets/css/layout.css */
.app-container {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

.app-header {
  grid-area: header;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-sidebar {
  grid-area: sidebar;
  background: #304156;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.app-main {
  grid-area: main;
  background: #f0f2f5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
```

#### 2. 导航组件 (Navigation Components)

**顶部导航栏**
```html
<!-- components/header.html -->
<header class="app-header">
  <div class="header-left">
    <button class="sidebar-toggle" onclick="toggleSidebar()">
      <i class="fas fa-bars"></i>
    </button>
    <img src="assets/images/logo.png" alt="ERP系统" class="logo">
    <h1 class="system-title">电商ERP管理系统</h1>
  </div>
  
  <div class="header-right">
    <div class="header-search">
      <input type="text" placeholder="搜索功能..." class="search-input">
      <i class="fas fa-search"></i>
    </div>
    
    <div class="header-notifications">
      <button class="notification-btn" onclick="showNotifications()">
        <i class="fas fa-bell"></i>
        <span class="notification-badge">3</span>
      </button>
    </div>
    
    <div class="header-user">
      <img src="assets/images/avatars/admin.jpg" alt="用户头像" class="user-avatar">
      <span class="user-name">管理员</span>
      <div class="user-dropdown">
        <a href="#" onclick="showProfile()">个人资料</a>
        <a href="#" onclick="showSettings()">系统设置</a>
        <a href="#" onclick="logout()">退出登录</a>
      </div>
    </div>
  </div>
</header>
```

**侧边菜单**
```html
<!-- components/sidebar.html -->
<aside class="app-sidebar">
  <nav class="sidebar-nav">
    <ul class="nav-menu">
      <li class="nav-item active">
        <a href="dashboard.html" class="nav-link">
          <i class="fas fa-tachometer-alt"></i>
          <span>仪表板</span>
        </a>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-users"></i>
          <span>用户管理</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/users/user-list.html">用户列表</a></li>
          <li><a href="pages/users/role-management.html">角色管理</a></li>
        </ul>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-box"></i>
          <span>商品管理</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/products/product-list.html">商品列表</a></li>
          <li><a href="pages/products/product-import.html">商品导入</a></li>
        </ul>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-shopping-cart"></i>
          <span>订单管理</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/orders/order-list.html">订单列表</a></li>
        </ul>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-warehouse"></i>
          <span>库存管理</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/inventory/inventory-list.html">库存列表</a></li>
          <li><a href="pages/inventory/inventory-alerts.html">库存预警</a></li>
        </ul>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-store"></i>
          <span>平台管理</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/platforms/platform-list.html">平台列表</a></li>
          <li><a href="pages/platforms/platform-config.html">平台配置</a></li>
        </ul>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-truck"></i>
          <span>物流管理</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/logistics/logistics-list.html">物流列表</a></li>
          <li><a href="pages/logistics/shipping-labels.html">面单管理</a></li>
        </ul>
      </li>
      
      <li class="nav-item">
        <a href="pages/notifications/notification-center.html" class="nav-link">
          <i class="fas fa-bell"></i>
          <span>通知中心</span>
        </a>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link" onclick="toggleSubmenu(this)">
          <i class="fas fa-cog"></i>
          <span>系统设置</span>
          <i class="fas fa-chevron-down submenu-arrow"></i>
        </a>
        <ul class="submenu">
          <li><a href="pages/settings/system-config.html">系统配置</a></li>
          <li><a href="pages/settings/system-logs.html">系统日志</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</aside>
```

#### 3. 数据展示组件 (Data Display Components)

**数据表格组件**
```html
<!-- components/table.html -->
<div class="data-table-container">
  <div class="table-header">
    <div class="table-title">
      <h3>数据列表</h3>
      <span class="table-count">共 <strong>156</strong> 条记录</span>
    </div>
    <div class="table-actions">
      <button class="btn btn-primary" onclick="showAddModal()">
        <i class="fas fa-plus"></i> 新增
      </button>
      <button class="btn btn-secondary" onclick="exportData()">
        <i class="fas fa-download"></i> 导出
      </button>
      <button class="btn btn-danger" onclick="batchDelete()">
        <i class="fas fa-trash"></i> 批量删除
      </button>
    </div>
  </div>
  
  <div class="table-filters">
    <div class="filter-group">
      <input type="text" placeholder="搜索关键词..." class="filter-input">
      <select class="filter-select">
        <option value="">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">禁用</option>
      </select>
      <button class="btn btn-outline" onclick="resetFilters()">重置</button>
      <button class="btn btn-primary" onclick="applyFilters()">搜索</button>
    </div>
  </div>
  
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th>
            <input type="checkbox" class="select-all" onchange="toggleSelectAll(this)">
          </th>
          <th class="sortable" onclick="sortTable('id')">
            ID <i class="fas fa-sort"></i>
          </th>
          <th class="sortable" onclick="sortTable('name')">
            名称 <i class="fas fa-sort"></i>
          </th>
          <th class="sortable" onclick="sortTable('status')">
            状态 <i class="fas fa-sort"></i>
          </th>
          <th class="sortable" onclick="sortTable('created_at')">
            创建时间 <i class="fas fa-sort"></i>
          </th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="table-body">
        <!-- 动态生成的表格行 -->
      </tbody>
    </table>
  </div>
  
  <div class="table-pagination">
    <div class="pagination-info">
      显示第 1-10 条，共 156 条记录
    </div>
    <div class="pagination-controls">
      <button class="btn btn-outline" onclick="previousPage()" disabled>
        <i class="fas fa-chevron-left"></i> 上一页
      </button>
      <div class="page-numbers">
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <span class="page-ellipsis">...</span>
        <button class="page-btn">16</button>
      </div>
      <button class="btn btn-outline" onclick="nextPage()">
        下一页 <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</div>
```

**统计卡片组件**
```html
<!-- components/stat-card.html -->
<div class="stat-card">
  <div class="stat-icon">
    <i class="fas fa-shopping-cart"></i>
  </div>
  <div class="stat-content">
    <div class="stat-title">今日订单</div>
    <div class="stat-value">1,234</div>
    <div class="stat-trend">
      <span class="trend-up">
        <i class="fas fa-arrow-up"></i> +12.5%
      </span>
      <span class="trend-text">较昨日</span>
    </div>
  </div>
</div>
```

#### 4. 表单组件 (Form Components)

**通用表单组件**
```html
<!-- components/form.html -->
<form class="app-form">
  <div class="form-section">
    <h3 class="section-title">基本信息</h3>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label required">用户名</label>
        <input type="text" class="form-input" placeholder="请输入用户名" required>
        <div class="form-error">用户名不能为空</div>
      </div>
      
      <div class="form-group">
        <label class="form-label required">邮箱</label>
        <input type="email" class="form-input" placeholder="请输入邮箱地址" required>
        <div class="form-error">请输入正确的邮箱格式</div>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">手机号</label>
        <input type="tel" class="form-input" placeholder="请输入手机号">
      </div>
      
      <div class="form-group">
        <label class="form-label required">状态</label>
        <select class="form-select" required>
          <option value="">请选择状态</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group full-width">
        <label class="form-label">备注</label>
        <textarea class="form-textarea" rows="4" placeholder="请输入备注信息"></textarea>
      </div>
    </div>
  </div>
  
  <div class="form-actions">
    <button type="button" class="btn btn-secondary" onclick="cancelForm()">取消</button>
    <button type="submit" class="btn btn-primary">保存</button>
  </div>
</form>
```

#### 5. 模态框组件 (Modal Components)

**通用模态框**
```html
<!-- components/modal.html -->
<div class="modal-overlay" id="modal-overlay" onclick="closeModal()">
  <div class="modal-container" onclick="event.stopPropagation()">
    <div class="modal-header">
      <h3 class="modal-title">标题</h3>
      <button class="modal-close" onclick="closeModal()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="modal-body">
      <!-- 模态框内容 -->
    </div>
    
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="confirmModal()">确认</button>
    </div>
  </div>
</div>
```

## 数据模型设计

### 模拟数据结构

```javascript
// assets/js/mock-data.js
const mockData = {
  // 用户数据
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800138000',
      status: 'active',
      roles: ['管理员'],
      avatar: 'assets/images/avatars/admin.jpg',
      createdAt: '2024-01-15 10:30:00',
      lastLogin: '2024-02-05 14:20:00'
    },
    {
      id: 2,
      username: 'operator',
      email: 'operator@example.com',
      phone: '13800138001',
      status: 'active',
      roles: ['运营人员'],
      avatar: 'assets/images/avatars/operator.jpg',
      createdAt: '2024-01-20 09:15:00',
      lastLogin: '2024-02-05 11:45:00'
    }
  ],

  // 商品数据
  products: [
    {
      id: 1,
      sku: 'SKU001',
      name: 'iPhone 15 Pro Max',
      category: '手机数码',
      price: 9999.00,
      stock: 50,
      status: 'active',
      images: ['assets/images/products/iphone15.jpg'],
      attributes: {
        brand: 'Apple',
        color: '深空黑色',
        storage: '256GB'
      },
      createdAt: '2024-01-10 08:00:00'
    },
    {
      id: 2,
      sku: 'SKU002',
      name: 'MacBook Pro 14英寸',
      category: '电脑办公',
      price: 15999.00,
      stock: 25,
      status: 'active',
      images: ['assets/images/products/macbook.jpg'],
      attributes: {
        brand: 'Apple',
        processor: 'M3 Pro',
        memory: '16GB'
      },
      createdAt: '2024-01-12 10:30:00'
    }
  ],

  // 订单数据
  orders: [
    {
      id: 1,
      orderNo: 'ORD202402050001',
      platformOrderId: 'WM123456789',
      platform: 'Walmart',
      status: 'paid',
      totalAmount: 9999.00,
      customerName: '张三',
      customerPhone: '13800138000',
      shippingAddress: {
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区深南大道10000号'
      },
      items: [
        {
          productId: 1,
          sku: 'SKU001',
          name: 'iPhone 15 Pro Max',
          quantity: 1,
          price: 9999.00
        }
      ],
      createdAt: '2024-02-05 10:30:00',
      paidAt: '2024-02-05 10:35:00'
    }
  ],

  // 库存数据
  inventory: [
    {
      id: 1,
      sku: 'SKU001',
      productName: 'iPhone 15 Pro Max',
      totalStock: 50,
      availableStock: 45,
      reservedStock: 5,
      alertThreshold: 10,
      status: 'normal',
      lastUpdated: '2024-02-05 14:20:00'
    },
    {
      id: 2,
      sku: 'SKU002',
      productName: 'MacBook Pro 14英寸',
      totalStock: 25,
      availableStock: 20,
      reservedStock: 5,
      alertThreshold: 5,
      status: 'low',
      lastUpdated: '2024-02-05 13:15:00'
    }
  ],

  // 平台数据
  platforms: [
    {
      id: 1,
      name: 'Walmart Marketplace',
      type: 'walmart',
      status: 'connected',
      lastSyncTime: '2024-02-05 14:00:00',
      stores: [
        {
          id: 1,
          name: '主店铺',
          storeId: 'WM_STORE_001',
          status: 'active'
        }
      ]
    },
    {
      id: 2,
      name: 'Amazon',
      type: 'amazon',
      status: 'disconnected',
      lastSyncTime: '2024-02-04 18:30:00',
      stores: []
    }
  ],

  // 物流数据
  logistics: [
    {
      id: 1,
      orderId: 1,
      orderNo: 'ORD202402050001',
      trackingNumber: 'YE123456789CN',
      carrier: 'YunExpress',
      status: 'shipped',
      shippingAddress: '广东省深圳市南山区科技园南区深南大道10000号',
      createdAt: '2024-02-05 15:30:00',
      shippedAt: '2024-02-05 16:00:00'
    }
  ],

  // 通知数据
  notifications: [
    {
      id: 1,
      title: '库存预警',
      content: 'SKU002 库存不足，当前库存：20件',
      type: 'warning',
      isRead: false,
      createdAt: '2024-02-05 14:30:00'
    },
    {
      id: 2,
      title: '新订单提醒',
      content: '收到新订单 ORD202402050001',
      type: 'info',
      isRead: false,
      createdAt: '2024-02-05 10:30:00'
    },
    {
      id: 3,
      title: '系统更新',
      content: '系统将于今晚22:00进行维护更新',
      type: 'system',
      isRead: true,
      createdAt: '2024-02-04 16:00:00'
    }
  ],

  // 仪表板统计数据
  dashboard: {
    stats: {
      todayOrders: 1234,
      todayOrdersChange: 12.5,
      todaySales: 156789.50,
      todaySalesChange: -3.2,
      totalProducts: 5678,
      totalProductsChange: 8.7,
      lowStockAlerts: 23,
      lowStockAlertsChange: 15.3
    },
    charts: {
      salesTrend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [120000, 135000, 148000, 162000, 175000, 189000]
      },
      orderStatus: {
        labels: ['待支付', '已支付', '已发货', '已完成', '已取消'],
        data: [45, 123, 89, 567, 23]
      },
      topProducts: [
        { name: 'iPhone 15 Pro Max', sales: 234, revenue: 2339766 },
        { name: 'MacBook Pro 14英寸', sales: 89, revenue: 1423911 },
        { name: 'iPad Air', sales: 156, revenue: 936000 }
      ]
    }
  }
};

// 工具函数
const mockApi = {
  // 模拟API延迟
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 获取用户列表
  getUsers: async (params = {}) => {
    await mockApi.delay();
    let users = [...mockData.users];
    
    // 模拟搜索
    if (params.keyword) {
      users = users.filter(user => 
        user.username.includes(params.keyword) || 
        user.email.includes(params.keyword)
      );
    }
    
    // 模拟分页
    const page = params.page || 1;
    const size = params.size || 10;
    const start = (page - 1) * size;
    const end = start + size;
    
    return {
      records: users.slice(start, end),
      total: users.length,
      current: page,
      size: size
    };
  },
  
  // 获取商品列表
  getProducts: async (params = {}) => {
    await mockApi.delay();
    let products = [...mockData.products];
    
    if (params.keyword) {
      products = products.filter(product => 
        product.name.includes(params.keyword) || 
        product.sku.includes(params.keyword)
      );
    }
    
    const page = params.page || 1;
    const size = params.size || 10;
    const start = (page - 1) * size;
    const end = start + size;
    
    return {
      records: products.slice(start, end),
      total: products.length,
      current: page,
      size: size
    };
  },
  
  // 获取订单列表
  getOrders: async (params = {}) => {
    await mockApi.delay();
    let orders = [...mockData.orders];
    
    if (params.status) {
      orders = orders.filter(order => order.status === params.status);
    }
    
    const page = params.page || 1;
    const size = params.size || 10;
    const start = (page - 1) * size;
    const end = start + size;
    
    return {
      records: orders.slice(start, end),
      total: orders.length,
      current: page,
      size: size
    };
  },
  
  // 获取仪表板数据
  getDashboardData: async () => {
    await mockApi.delay();
    return mockData.dashboard;
  }
};
```

## 错误处理设计

### 错误状态展示

```html
<!-- components/error-states.html -->
<!-- 空数据状态 -->
<div class="empty-state">
  <div class="empty-icon">
    <i class="fas fa-inbox"></i>
  </div>
  <div class="empty-title">暂无数据</div>
  <div class="empty-description">当前没有找到相关数据，请尝试其他操作</div>
  <button class="btn btn-primary" onclick="refreshData()">刷新数据</button>
</div>

<!-- 加载状态 -->
<div class="loading-state">
  <div class="loading-spinner">
    <div class="spinner"></div>
  </div>
  <div class="loading-text">数据加载中...</div>
</div>

<!-- 错误状态 -->
<div class="error-state">
  <div class="error-icon">
    <i class="fas fa-exclamation-triangle"></i>
  </div>
  <div class="error-title">加载失败</div>
  <div class="error-description">数据加载失败，请检查网络连接后重试</div>
  <button class="btn btn-primary" onclick="retryLoad()">重新加载</button>
</div>
```

### JavaScript错误处理

```javascript
// assets/js/utils.js
const ErrorHandler = {
  // 显示成功消息
  showSuccess: (message) => {
    showToast(message, 'success');
  },
  
  // 显示错误消息
  showError: (message) => {
    showToast(message, 'error');
  },
  
  // 显示警告消息
  showWarning: (message) => {
    showToast(message, 'warning');
  },
  
  // 显示信息消息
  showInfo: (message) => {
    showToast(message, 'info');
  }
};

// Toast消息组件
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${getToastIcon(type)}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="closeToast(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  const container = document.querySelector('.toast-container') || createToastContainer();
  container.appendChild(toast);
  
  // 自动关闭
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function closeToast(button) {
  const toast = button.closest('.toast');
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast);
  }
}
```

## 测试策略

### 浏览器兼容性测试

```javascript
// assets/js/browser-check.js
const BrowserCheck = {
  // 检查浏览器支持
  checkSupport: () => {
    const features = {
      flexbox: CSS.supports('display', 'flex'),
      grid: CSS.supports('display', 'grid'),
      customProperties: CSS.supports('--custom', 'property'),
      fetch: typeof fetch !== 'undefined',
      promises: typeof Promise !== 'undefined'
    };
    
    const unsupported = Object.keys(features).filter(key => !features[key]);
    
    if (unsupported.length > 0) {
      showBrowserWarning(unsupported);
    }
    
    return unsupported.length === 0;
  },
  
  // 获取浏览器信息
  getBrowserInfo: () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.includes('Chrome')) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)[1];
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)[1];
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)[1];
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+)/)[1];
    }
    
    return { browser, version };
  }
};

function showBrowserWarning(unsupportedFeatures) {
  const warning = document.createElement('div');
  warning.className = 'browser-warning';
  warning.innerHTML = `
    <div class="warning-content">
      <i class="fas fa-exclamation-triangle"></i>
      <div class="warning-text">
        <h4>浏览器兼容性提醒</h4>
        <p>您的浏览器不支持以下特性：${unsupportedFeatures.join(', ')}</p>
        <p>建议使用最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器以获得最佳体验。</p>
      </div>
      <button onclick="closeBrowserWarning()" class="warning-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.insertBefore(warning, document.body.firstChild);
}

function closeBrowserWarning() {
  const warning = document.querySelector('.browser-warning');
  if (warning) {
    warning.remove();
  }
}

// 页面加载时检查浏览器支持
document.addEventListener('DOMContentLoaded', () => {
  BrowserCheck.checkSupport();
});
```

### 响应式测试

```css
/* assets/css/responsive.css */
/* 响应式断点测试 */
.responsive-test {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  display: none;
}

.responsive-test.show {
  display: block;
}

/* 断点指示器 */
.responsive-test::before {
  content: 'XS';
}

@media (min-width: 576px) {
  .responsive-test::before {
    content: 'SM';
  }
}

@media (min-width: 768px) {
  .responsive-test::before {
    content: 'MD';
  }
}

@media (min-width: 992px) {
  .responsive-test::before {
    content: 'LG';
  }
}

@media (min-width: 1200px) {
  .responsive-test::before {
    content: 'XL';
  }
}

@media (min-width: 1600px) {
  .responsive-test::before {
    content: 'XXL';
  }
}
```

## 性能优化设计

### 图片优化

```javascript
// assets/js/image-optimization.js
const ImageOptimizer = {
  // 懒加载图片
  lazyLoadImages: () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  },
  
  // 图片预加载
  preloadImages: (urls) => {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  },
  
  // 响应式图片
  setupResponsiveImages: () => {
    const images = document.querySelectorAll('img[data-responsive]');
    images.forEach(img => {
      const sizes = JSON.parse(img.dataset.responsive);
      const srcset = Object.keys(sizes)
        .map(size => `${sizes[size]} ${size}w`)
        .join(', ');
      img.srcset = srcset;
    });
  }
};
```

### 代码分割和缓存

```javascript
// assets/js/module-loader.js
const ModuleLoader = {
  cache: new Map(),
  
  // 动态加载模块
  loadModule: async (moduleName) => {
    if (ModuleLoader.cache.has(moduleName)) {
      return ModuleLoader.cache.get(moduleName);
    }
    
    try {
      const module = await import(`./modules/${moduleName}.js`);
      ModuleLoader.cache.set(moduleName, module);
      return module;
    } catch (error) {
      console.error(`Failed to load module: ${moduleName}`, error);
      throw error;
    }
  },
  
  // 预加载关键模块
  preloadModules: (moduleNames) => {
    moduleNames.forEach(name => {
      ModuleLoader.loadModule(name).catch(console.error);
    });
  }
};

// 页面加载完成后预加载关键模块
document.addEventListener('DOMContentLoaded', () => {
  ModuleLoader.preloadModules(['charts', 'forms', 'tables']);
});
```

## 部署配置

### 静态文件服务配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 启用gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # HTML文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # 处理单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Docker部署配置

```dockerfile
# Dockerfile
FROM nginx:alpine

# 复制静态文件
COPY . /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 设置权限
RUN chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  html-prototype:
    build: .
    ports:
      - "3000:80"
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80
```

## 开发工具和规范

### 代码格式化配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "lf",
  "htmlWhitespaceSensitivity": "css"
}
```

### ESLint配置

```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

### 构建脚本

```json
// package.json
{
  "name": "erp-html-prototype",
  "version": "1.0.0",
  "description": "电商ERP系统HTML原型",
  "scripts": {
    "dev": "live-server --port=3000 --open=/index.html",
    "build": "npm run lint && npm run optimize",
    "lint": "eslint assets/js/**/*.js",
    "lint:fix": "eslint assets/js/**/*.js --fix",
    "optimize": "npm run optimize:css && npm run optimize:js && npm run optimize:images",
    "optimize:css": "cleancss -o dist/assets/css/app.min.css assets/css/*.css",
    "optimize:js": "uglifyjs assets/js/*.js -o dist/assets/js/app.min.js",
    "optimize:images": "imagemin assets/images/**/* --out-dir=dist/assets/images",
    "serve": "http-server dist -p 3000 -o",
    "deploy": "npm run build && docker build -t erp-prototype ."
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.8.0",
    "live-server": "^1.2.2",
    "clean-css-cli": "^5.6.0",
    "uglify-js": "^3.17.0",
    "imagemin-cli": "^7.0.0",
    "http-server": "^14.1.0"
  }
}
```

这个设计文档提供了完整的HTML原型实现方案，包括技术架构、组件设计、数据模型、错误处理、性能优化和部署配置。原型将展示电商ERP系统的所有核心功能界面，为前端开发提供详细的视觉参考和交互指导。