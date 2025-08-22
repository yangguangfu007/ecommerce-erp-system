/* Main Application - 主应用逻辑 */

// 应用状态管理
const AppState = {
  currentUser: null,
  isLoggedIn: false,
  currentPage: 'login',
  theme: 'light'
};

// 应用初始化
function initApp() {
  // 检查登录状态
  checkLoginStatus();
  
  // 初始化主题
  initTheme();
  
  // 绑定全局事件
  bindGlobalEvents();
  
  // 初始化当前页面
  initCurrentPage();
}

// 检查登录状态
function checkLoginStatus() {
  const token = Utils.Storage.get('userToken');
  const userInfo = Utils.Storage.get('userInfo');
  
  if (token && userInfo) {
    AppState.isLoggedIn = true;
    AppState.currentUser = userInfo;
    
    // 如果在登录页面且已登录，跳转到仪表板
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      window.location.href = 'dashboard.html';
    }
  } else {
    AppState.isLoggedIn = false;
    AppState.currentUser = null;
    
    // 如果不在登录页面且未登录，跳转到登录页
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
      window.location.href = 'index.html';
    }
  }
}

// 初始化主题
function initTheme() {
  const savedTheme = Utils.Storage.get('theme', 'light');
  AppState.theme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// 绑定全局事件
function bindGlobalEvents() {
  // 监听存储变化（多标签页同步）
  window.addEventListener('storage', (e) => {
    if (e.key === 'userToken' && !e.newValue) {
      // 用户在其他标签页退出登录
      window.location.href = 'index.html';
    }
  });
  
  // 监听网络状态
  window.addEventListener('online', () => {
    showToast('网络连接已恢复', 'success');
  });
  
  window.addEventListener('offline', () => {
    showToast('网络连接已断开', 'warning');
  });
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // 页面变为可见时刷新数据
      refreshCurrentPageData();
    }
  });
  
  // 监听窗口大小变化
  window.addEventListener('resize', Utils.Throttle.debounce(() => {
    handleWindowResize();
  }, 250));
  
  // 监听设备方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      handleWindowResize();
    }, 100);
  });
  
  // 初始化响应式功能
  initResponsiveFeatures();
}

// 处理窗口大小变化
function handleWindowResize() {
  const isMobile = window.innerWidth <= 768;
  const sidebar = document.querySelector('.app-sidebar');
  
  // 如果从移动端切换到桌面端，关闭移动端侧边栏
  if (!isMobile && sidebar && sidebar.classList.contains('show')) {
    closeSidebar();
  }
  
  // 重新初始化响应式表格
  initResponsiveTable();
  
  // 更新图表大小
  if (typeof Chart !== 'undefined') {
    Chart.helpers.each(Chart.instances, (instance) => {
      instance.resize();
    });
  }
}

// 初始化响应式功能
function initResponsiveFeatures() {
  // 初始化侧边栏手势
  if (typeof initSidebarGestures === 'function') {
    initSidebarGestures();
  }
  
  // 初始化响应式表格
  if (typeof initResponsiveTable === 'function') {
    initResponsiveTable();
  }
  
  // 恢复侧边栏状态
  const sidebarCollapsed = Utils.Storage.get('sidebarCollapsed', false);
  const container = document.querySelector('.app-container');
  if (container && sidebarCollapsed && window.innerWidth > 768) {
    container.classList.add('sidebar-collapsed');
  }
}

// 初始化当前页面
function initCurrentPage() {
  const path = window.location.pathname;
  
  if (path.includes('index.html') || path === '/') {
    AppState.currentPage = 'login';
    initLoginPage();
  } else if (path.includes('dashboard.html')) {
    AppState.currentPage = 'dashboard';
    initDashboardPage();
  } else {
    // 其他页面的初始化
    initOtherPages();
  }
}

// 登录页面初始化
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // 设置表单验证
  setupFormValidation();
  
  // 自动填充演示账号（仅用于原型演示）
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  if (usernameInput && passwordInput) {
    // 添加提示信息
    const hint = document.createElement('div');
    hint.className = 'login-hint';
    hint.innerHTML = `
      <p style="text-align: center; margin-top: 16px; font-size: 12px; color: #909399;">
        演示账号：admin / admin123
      </p>
    `;
    loginForm.appendChild(hint);
  }
}

// 处理登录
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  // 清除之前的错误状态
  clearFormErrors();
  
  // 表单验证
  let hasError = false;
  
  if (!username) {
    showFieldError('username', '请输入用户名');
    AnimationManager.shake('#username');
    hasError = true;
  } else if (username.length < 3) {
    showFieldError('username', '用户名至少需要3个字符');
    AnimationManager.shake('#username');
    hasError = true;
  }
  
  if (!password) {
    showFieldError('password', '请输入密码');
    AnimationManager.shake('#password');
    hasError = true;
  } else if (password.length < 6) {
    showFieldError('password', '密码至少需要6个字符');
    AnimationManager.shake('#password');
    hasError = true;
  }
  
  if (hasError) {
    return;
  }
  
  // 显示加载状态
  const submitBtn = document.querySelector('.btn-login');
  LoadingManager.showButtonLoading(submitBtn, '登录中...');
  
  try {
    // 调用登录API
    const response = await mockApi.login(username, password);
    
    if (response.success) {
      // 保存登录信息
      Utils.Storage.set('userToken', response.data.token);
      Utils.Storage.set('userInfo', response.data.user);
      
      if (remember) {
        Utils.Storage.set('rememberLogin', true);
      }
      
      // 更新应用状态
      AppState.isLoggedIn = true;
      AppState.currentUser = response.data.user;
      
      showToast(response.message, 'success');
      
      // 页面切换动画
      AnimationManager.transitionPage(() => {
        window.location.href = 'dashboard.html';
      });
      
    } else {
      showToast(response.message, 'error');
      AnimationManager.shake('.login-form');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showToast('登录失败，请稍后重试', 'error');
    AnimationManager.shake('.login-form');
  } finally {
    // 恢复按钮状态
    LoadingManager.hideButtonLoading(submitBtn);
  }
}

// 仪表板页面初始化
function initDashboardPage() {
  // 加载仪表板数据
  loadDashboardData();
  
  // 设置定时刷新
  setInterval(loadDashboardData, 5 * 60 * 1000); // 每5分钟刷新一次
  
  // 设置数据动态更新效果
  setInterval(simulateDataUpdate, 30 * 1000); // 每30秒模拟数据更新
}

// 加载仪表板数据
async function loadDashboardData() {
  try {
    // 显示骨架屏
    const statsContainer = document.querySelector('#dashboard-stats');
    const chartsContainer = document.querySelector('#dashboard-charts');
    
    if (statsContainer) {
      AnimationManager.showSkeleton(statsContainer);
    }
    
    const response = await mockApi.getDashboardData();
    
    if (response.success) {
      // 渲染数据并添加动画
      setTimeout(() => {
        renderDashboardStats(response.data.stats);
        renderDashboardCharts(response.data.charts);
        
        // 添加入场动画
        enhanceStatCards();
        
        // 图表容器动画
        if (chartsContainer) {
          AnimationManager.fadeIn(chartsContainer, 300);
        }
      }, 500); // 模拟加载时间
    }
    
  } catch (error) {
    console.error('Dashboard data load error:', error);
    showToast('仪表板数据加载失败', 'error');
  }
}

// 渲染仪表板统计数据
function renderDashboardStats(stats) {
  const statsContainer = document.querySelector('#dashboard-stats');
  if (!statsContainer) return;
  
  const statCards = [
    {
      title: '今日订单',
      value: stats.todayOrders,
      change: stats.todayOrdersChange,
      icon: 'fas fa-shopping-cart',
      color: 'primary',
      changeText: '较昨日'
    },
    {
      title: '今日销售额',
      value: '¥' + Utils.NumberFormat.currency(stats.todaySales),
      change: stats.todaySalesChange,
      icon: 'fas fa-dollar-sign',
      color: 'success',
      changeText: '较昨日'
    },
    {
      title: '商品总数',
      value: Utils.NumberFormat.number(stats.totalProducts),
      change: stats.totalProductsChange,
      icon: 'fas fa-box',
      color: 'warning',
      changeText: '较上月'
    },
    {
      title: '库存预警',
      value: stats.lowStockAlerts,
      change: stats.lowStockAlertsChange,
      icon: 'fas fa-exclamation-triangle',
      color: 'danger',
      changeText: '较昨日'
    }
  ];
  
  statsContainer.innerHTML = statCards.map(card => `
    <div class="stat-card ${card.color}">
      <div class="stat-header">
        <h3 class="stat-title">${card.title}</h3>
        <div class="stat-icon ${card.color}">
          <i class="${card.icon}"></i>
        </div>
      </div>
      <div class="stat-value">${card.value}</div>
      <div class="stat-change ${card.change >= 0 ? 'positive' : 'negative'}">
        <i class="stat-change-icon fas fa-arrow-${card.change >= 0 ? 'up' : 'down'}"></i>
        ${Utils.NumberFormat.percent(Math.abs(card.change))}
        <span class="stat-change-text">${card.changeText}</span>
      </div>
    </div>
  `).join('');
}

// 存储图表实例
let salesTrendChart = null;
let orderStatusChart = null;

// 渲染仪表板图表
function renderDashboardCharts(charts) {
  // 渲染销售趋势图
  renderSalesTrendChart(charts.salesTrend);
  
  // 渲染订单状态饼图
  renderOrderStatusChart(charts.orderStatus);
  
  // 渲染热销商品排行
  renderTopProductsList(charts.topProducts);
}

// 渲染销售趋势图
function renderSalesTrendChart(data) {
  const canvas = document.getElementById('salesTrendChart');
  if (!canvas) return;
  
  // 销毁之前的图表实例
  if (salesTrendChart) {
    salesTrendChart.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  salesTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: '销售额 (¥)',
        data: data.data,
        borderColor: '#409EFF',
        backgroundColor: 'rgba(64, 158, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#409EFF',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#409EFF',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return '销售额: ¥' + Utils.NumberFormat.currency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#909399'
          }
        },
        y: {
          grid: {
            color: 'rgba(144, 147, 153, 0.1)'
          },
          ticks: {
            color: '#909399',
            callback: function(value) {
              return '¥' + (value / 1000) + 'K';
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// 渲染订单状态饼图
function renderOrderStatusChart(data) {
  const canvas = document.getElementById('orderStatusChart');
  if (!canvas) return;
  
  // 销毁之前的图表实例
  if (orderStatusChart) {
    orderStatusChart.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  orderStatusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: [
          '#E6A23C', // 待支付
          '#409EFF', // 已支付
          '#67C23A', // 已发货
          '#909399', // 已完成
          '#F56C6C'  // 已取消
        ],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            color: '#606266'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#409EFF',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
            }
          }
        }
      }
    }
  });
}

// 渲染热销商品排行
function renderTopProductsList(products) {
  const container = document.getElementById('topProductsList');
  if (!container) return;
  
  container.innerHTML = products.map((product, index) => `
    <div class="top-product-item">
      <div class="product-rank rank-${index + 1}">${index + 1}</div>
      <div class="product-details">
        <div class="product-name-rank">${product.name}</div>
        <div class="product-sales-info">销量: ${product.sales} 件</div>
      </div>
      <div class="product-revenue">¥${Utils.NumberFormat.currency(product.revenue)}</div>
    </div>
  `).join('');
}

// 刷新图表数据的函数
function refreshSalesTrend() {
  showToast('正在刷新销售趋势数据...', 'info');
  loadDashboardData();
}

function refreshOrderStatus() {
  showToast('正在刷新订单状态数据...', 'info');
  loadDashboardData();
}

function refreshTopProducts() {
  showToast('正在刷新热销商品数据...', 'info');
  loadDashboardData();
}

// 其他页面初始化
function initOtherPages() {
  // 根据页面路径初始化对应的功能
  const path = window.location.pathname;
  
  if (path.includes('user-list.html')) {
    initUserListPage();
  } else if (path.includes('product-list.html')) {
    initProductListPage();
  } else if (path.includes('order-list.html')) {
    initOrderListPage();
  }
  // 可以继续添加其他页面的初始化
}

// 用户列表页面初始化
function initUserListPage() {
  if (typeof loadUserList === 'function') {
    loadUserList();
  }
}

// 商品列表页面初始化
function initProductListPage() {
  console.log('初始化商品列表页面');
  // 商品列表页面有自己的初始化逻辑，这里不需要额外处理
}

// 订单列表页面初始化
function initOrderListPage() {
  console.log('初始化订单列表页面');
  // 订单列表页面有自己的初始化逻辑，这里不需要额外处理
}

// 加载用户列表
async function loadUserList(params = {}) {
  try {
    const response = await mockApi.getUsers(params);
    
    if (response.success) {
      renderUserTable(response.data.records);
      renderPagination(response.data);
    }
    
  } catch (error) {
    console.error('User list load error:', error);
    showToast('用户列表加载失败', 'error');
  }
}

// 渲染用户表格
function renderUserTable(users) {
  const tbody = document.querySelector('#userTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td><input type="checkbox" value="${user.id}"></td>
      <td>${user.id}</td>
      <td>
        <div class="user-avatar-cell">
          <img src="${user.avatar}" alt="${user.username}" class="user-avatar-small">
          <div class="user-info">
            <div class="user-name">${user.username}</div>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
      </td>
      <td>${user.phone}</td>
      <td>
        <span class="status-badge status-${user.status}">
          ${user.status === 'active' ? '启用' : '禁用'}
        </span>
      </td>
      <td>${user.roles.join(', ')}</td>
      <td>${user.createdAt}</td>
      <td>
        <button class="btn btn-small btn-primary" onclick="editUser(${user.id})">编辑</button>
        <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">删除</button>
      </td>
    </tr>
  `).join('');
}

// 渲染分页
function renderPagination(data) {
  const pagination = document.querySelector('.pagination-controls');
  if (!pagination) return;
  
  const totalPages = Math.ceil(data.total / data.size);
  const currentPage = data.current;
  
  let paginationHTML = `
    <button class="btn btn-outline" onclick="loadUserList({page: ${currentPage - 1}})" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i> 上一页
    </button>
    <div class="page-numbers">
  `;
  
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="loadUserList({page: ${i}})">
        ${i}
      </button>
    `;
  }
  
  if (totalPages > 5) {
    paginationHTML += '<span class="page-ellipsis">...</span>';
    paginationHTML += `
      <button class="page-btn" onclick="loadUserList({page: ${totalPages}})">
        ${totalPages}
      </button>
    `;
  }
  
  paginationHTML += `
    </div>
    <button class="btn btn-outline" onclick="loadUserList({page: ${currentPage + 1}})" ${currentPage === totalPages ? 'disabled' : ''}>
      下一页 <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = paginationHTML;
  
  // 更新分页信息
  const paginationInfo = document.querySelector('.pagination-info');
  if (paginationInfo) {
    const start = (currentPage - 1) * data.size + 1;
    const end = Math.min(currentPage * data.size, data.total);
    paginationInfo.textContent = `显示第 ${start}-${end} 条，共 ${data.total} 条记录`;
  }
}

// 刷新当前页面数据
function refreshCurrentPageData() {
  switch (AppState.currentPage) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'userList':
      loadUserList();
      break;
    // 可以添加其他页面的刷新逻辑
  }
}

// 用户操作函数
function editUser(userId) {
  showToast(`编辑用户 ${userId} 功能开发中...`, 'info');
}

function deleteUser(userId) {
  showConfirm(
    '确定要删除这个用户吗？',
    () => {
      showToast('删除成功', 'success');
      // 这里应该调用删除API并刷新列表
    }
  );
}

// 添加用户
function addUser() {
  showToast('添加用户功能开发中...', 'info');
}

// 全局错误处理
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showToast('系统发生错误，请刷新页面重试', 'error');
});

// 全局未处理的Promise拒绝
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showToast('系统发生错误，请稍后重试', 'error');
});

// 表单验证辅助函数
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const formGroup = field.closest('.form-group');
  const errorElement = formGroup.querySelector('.form-error');
  
  // 添加错误样式
  field.classList.add('error');
  formGroup.classList.add('error');
  
  // 显示错误信息
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const formGroup = field.closest('.form-group');
  const errorElement = formGroup.querySelector('.form-error');
  
  // 移除错误样式
  field.classList.remove('error');
  formGroup.classList.remove('error');
  
  // 隐藏错误信息
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

function clearFormErrors() {
  const errorFields = document.querySelectorAll('.form-input.error');
  errorFields.forEach(field => {
    clearFieldError(field.id);
  });
}

// 实时表单验证
function setupFormValidation() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  if (usernameInput) {
    usernameInput.addEventListener('blur', () => {
      const value = usernameInput.value.trim();
      if (!value) {
        showFieldError('username', '请输入用户名');
      } else if (value.length < 3) {
        showFieldError('username', '用户名至少需要3个字符');
      } else {
        clearFieldError('username');
      }
    });
    
    usernameInput.addEventListener('input', () => {
      if (usernameInput.classList.contains('error')) {
        const value = usernameInput.value.trim();
        if (value && value.length >= 3) {
          clearFieldError('username');
        }
      }
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('blur', () => {
      const value = passwordInput.value;
      if (!value) {
        showFieldError('password', '请输入密码');
      } else if (value.length < 6) {
        showFieldError('password', '密码至少需要6个字符');
      } else {
        clearFieldError('password');
      }
    });
    
    passwordInput.addEventListener('input', () => {
      if (passwordInput.classList.contains('error')) {
        const value = passwordInput.value;
        if (value && value.length >= 6) {
          clearFieldError('password');
        }
      }
    });
  }
}

// 模拟数据动态更新
function simulateDataUpdate() {
  if (AppState.currentPage !== 'dashboard') return;
  
  // 随机更新统计数据
  const stats = mockData.dashboard.stats;
  
  // 模拟订单数量变化
  const orderChange = Math.floor(Math.random() * 10) - 5; // -5 到 +5
  stats.todayOrders = Math.max(0, stats.todayOrders + orderChange);
  
  // 模拟销售额变化
  const salesChange = (Math.random() - 0.5) * 10000; // -5000 到 +5000
  stats.todaySales = Math.max(0, stats.todaySales + salesChange);
  
  // 模拟库存预警变化
  const alertChange = Math.floor(Math.random() * 3) - 1; // -1 到 +1
  stats.lowStockAlerts = Math.max(0, stats.lowStockAlerts + alertChange);
  
  // 更新变化百分比
  stats.todayOrdersChange = (Math.random() - 0.5) * 20; // -10% 到 +10%
  stats.todaySalesChange = (Math.random() - 0.5) * 20;
  stats.lowStockAlertsChange = (Math.random() - 0.5) * 30;
  
  // 重新渲染统计卡片
  renderDashboardStats(stats);
  
  // 添加更新动画效果
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.style.transform = 'scale(1.02)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 200);
  });
}

// 动画和交互效果管理
const AnimationManager = {
  // 页面切换动画
  transitionPage: (callback) => {
    const main = document.querySelector('.app-main');
    if (!main) {
      if (callback) callback();
      return;
    }
    
    main.classList.add('page-transition-exit');
    
    setTimeout(() => {
      if (callback) callback();
      main.classList.remove('page-transition-exit');
      main.classList.add('page-transition-enter');
      
      setTimeout(() => {
        main.classList.remove('page-transition-enter');
      }, 300);
    }, 300);
  },
  
  // 元素淡入动画
  fadeIn: (element, delay = 0) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    setTimeout(() => {
      element.classList.add('fade-in');
    }, delay);
  },
  
  // 元素滑入动画
  slideIn: (element, direction = 'left', delay = 0) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    setTimeout(() => {
      element.classList.add(`slide-in-${direction}`);
    }, delay);
  },
  
  // 弹跳动画
  bounceIn: (element, delay = 0) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    setTimeout(() => {
      element.classList.add('bounce-in');
    }, delay);
  },
  
  // 摇摆动画（用于错误提示）
  shake: (element) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    element.classList.add('shake');
    setTimeout(() => {
      element.classList.remove('shake');
    }, 500);
  },
  
  // 脉冲动画
  pulse: (element, duration = 2000) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    element.classList.add('pulse');
    setTimeout(() => {
      element.classList.remove('pulse');
    }, duration);
  },
  
  // 数字计数动画
  countUp: (element, start, end, duration = 1000) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const startTime = performance.now();
    const startValue = parseInt(start) || 0;
    const endValue = parseInt(end) || 0;
    const difference = endValue - startValue;
    
    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (difference * easeOutQuart));
      
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = endValue.toLocaleString();
      }
    }
    
    requestAnimationFrame(updateCount);
  },
  
  // 进度条动画
  animateProgress: (element, targetPercent, duration = 1000) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const startTime = performance.now();
    const startPercent = 0;
    
    function updateProgress(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentPercent = startPercent + (targetPercent - startPercent) * easeOutQuart;
      
      element.style.width = currentPercent + '%';
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    }
    
    requestAnimationFrame(updateProgress);
  },
  
  // 骨架屏加载
  showSkeleton: (container) => {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) return;
    
    const skeletonHTML = `
      <div class="skeleton-container">
        <div class="skeleton skeleton-title" style="height: 20px; width: 60%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-line" style="height: 16px; width: 100%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-line" style="height: 16px; width: 80%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-line" style="height: 16px; width: 90%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-button" style="height: 32px; width: 120px;"></div>
      </div>
    `;
    
    container.innerHTML = skeletonHTML;
  },
  
  // 隐藏骨架屏
  hideSkeleton: (container, content) => {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) return;
    
    container.innerHTML = content;
    AnimationManager.fadeIn(container);
  }
};

// 增强的加载指示器
const LoadingManager = {
  // 显示全屏加载
  showFullscreen: (message = '加载中...') => {
    const existing = document.querySelector('.fullscreen-loading');
    if (existing) return;
    
    const loading = document.createElement('div');
    loading.className = 'fullscreen-loading';
    loading.innerHTML = `
      <div class="loading-backdrop"></div>
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-message">${message}</div>
      </div>
    `;
    
    document.body.appendChild(loading);
    
    // 添加样式
    if (!document.querySelector('#fullscreen-loading-styles')) {
      const styles = document.createElement('style');
      styles.id = 'fullscreen-loading-styles';
      styles.textContent = `
        .fullscreen-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
        }
        
        .loading-content {
          position: relative;
          text-align: center;
          z-index: 1;
        }
        
        .spinner-ring {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color-light);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        .loading-message {
          color: var(--text-color-regular);
          font-size: var(--font-size-base);
        }
      `;
      document.head.appendChild(styles);
    }
    
    setTimeout(() => {
      loading.classList.add('fade-in');
    }, 10);
  },
  
  // 隐藏全屏加载
  hideFullscreen: () => {
    const loading = document.querySelector('.fullscreen-loading');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => {
        if (loading.parentNode) {
          loading.parentNode.removeChild(loading);
        }
      }, 300);
    }
  },
  
  // 显示按钮加载状态
  showButtonLoading: (button, text = '处理中...') => {
    if (typeof button === 'string') {
      button = document.querySelector(button);
    }
    
    if (!button) return;
    
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
      <span class="btn-loading-spinner"></span>
      <span class="btn-loading-text">${text}</span>
    `;
    
    // 添加加载样式
    if (!document.querySelector('#button-loading-styles')) {
      const styles = document.createElement('style');
      styles.id = 'button-loading-styles';
      styles.textContent = `
        .btn-loading-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        .btn-loading-text {
          vertical-align: middle;
        }
      `;
      document.head.appendChild(styles);
    }
  },
  
  // 隐藏按钮加载状态
  hideButtonLoading: (button) => {
    if (typeof button === 'string') {
      button = document.querySelector(button);
    }
    
    if (!button) return;
    
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
};

// 增强表单提交动画
function enhanceFormSubmission() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        LoadingManager.showButtonLoading(submitBtn);
      }
    });
  });
}

// 增强统计卡片动画
function enhanceStatCards() {
  const statCards = document.querySelectorAll('.stat-card');
  
  statCards.forEach((card, index) => {
    // 延迟显示每个卡片
    AnimationManager.slideIn(card, 'left', index * 100);
    
    // 数字计数动画
    const valueElement = card.querySelector('.stat-value');
    if (valueElement) {
      const value = valueElement.textContent.replace(/[^\d]/g, '');
      if (value) {
        setTimeout(() => {
          AnimationManager.countUp(valueElement, 0, parseInt(value), 1500);
        }, index * 100 + 200);
      }
    }
  });
}

// 增强表格行动画
function enhanceTableRows() {
  const tableRows = document.querySelectorAll('.data-table tbody tr');
  
  tableRows.forEach((row, index) => {
    AnimationManager.fadeIn(row, index * 50);
  });
}

// 快捷操作管理
const QuickActionsManager = {
  // 导航到指定页面
  navigateToPage: (url) => {
    AnimationManager.transitionPage(() => {
      window.location.href = url;
    });
  },
  
  // 刷新快捷操作数据
  refreshActions: async () => {
    try {
      const response = await mockApi.getQuickActionsData();
      if (response.success) {
        QuickActionsManager.renderActions(response.data);
      }
    } catch (error) {
      console.error('Quick actions refresh error:', error);
      showToast('快捷操作数据刷新失败', 'error');
    }
  },
  
  // 渲染快捷操作
  renderActions: (data) => {
    const container = document.getElementById('dashboard-actions');
    if (!container) return;
    
    const actions = [
      {
        title: '订单管理',
        description: '查看和处理订单',
        icon: 'fas fa-shopping-cart',
        color: '#409EFF',
        url: 'pages/orders/order-list.html',
        badge: `${data.pendingOrders || 12} 待处理`
      },
      {
        title: '商品管理',
        description: '管理商品信息',
        icon: 'fas fa-box',
        color: '#67C23A',
        url: 'pages/products/product-list.html',
        badge: `${data.pendingProducts || 3} 待审核`
      },
      {
        title: '库存管理',
        description: '监控库存状态',
        icon: 'fas fa-warehouse',
        color: '#E6A23C',
        url: 'pages/inventory/inventory-list.html',
        badge: `${data.lowStockAlerts || 5} 预警`,
        badgeType: 'warning'
      },
      {
        title: '平台管理',
        description: '管理销售平台',
        icon: 'fas fa-store',
        color: '#F56C6C',
        url: 'pages/platforms/platform-list.html',
        badge: '正常',
        badgeType: 'success'
      },
      {
        title: '物流管理',
        description: '跟踪物流状态',
        icon: 'fas fa-truck',
        color: '#909399',
        url: 'pages/logistics/logistics-list.html',
        badge: `${data.inTransitShipments || 8} 在途`
      },
      {
        title: '用户管理',
        description: '管理系统用户',
        icon: 'fas fa-users',
        color: '#606266',
        url: 'pages/users/user-list.html',
        badge: `${data.pendingUsers || 2} 待激活`
      }
    ];
    
    container.innerHTML = actions.map(action => `
      <div class="action-card interactive-element" onclick="navigateToPage('${action.url}')">
        <div class="action-icon" style="background: ${action.color};">
          <i class="${action.icon}"></i>
        </div>
        <div class="action-content">
          <h3>${action.title}</h3>
          <p>${action.description}</p>
          <span class="action-badge ${action.badgeType || ''}">${action.badge}</span>
        </div>
      </div>
    `).join('');
    
    // 添加入场动画
    const actionCards = container.querySelectorAll('.action-card');
    actionCards.forEach((card, index) => {
      AnimationManager.fadeIn(card, index * 100);
    });
  }
};

// 待处理事项管理
const PendingTasksManager = {
  // 加载待处理事项
  loadTasks: async () => {
    try {
      const response = await mockApi.getPendingTasks();
      if (response.success) {
        PendingTasksManager.renderTasks(response.data);
      }
    } catch (error) {
      console.error('Pending tasks load error:', error);
      showToast('待处理事项加载失败', 'error');
    }
  },
  
  // 渲染待处理事项
  renderTasks: (tasks) => {
    const container = document.getElementById('pending-tasks-list');
    if (!container) return;
    
    if (!tasks || tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <i class="fas fa-check-circle"></i>
          <p>暂无待处理事项</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = tasks.map(task => `
      <div class="pending-task-item">
        <div class="task-priority ${task.priority}"></div>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-description">${task.description}</div>
        </div>
        <div class="task-time">${task.time}</div>
        <div class="task-actions">
          <button class="task-action-btn" onclick="PendingTasksManager.completeTask('${task.id}')" title="完成">
            <i class="fas fa-check"></i>
          </button>
          <button class="task-action-btn" onclick="PendingTasksManager.viewTask('${task.id}')" title="查看">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `).join('');
  },
  
  // 完成任务
  completeTask: async (taskId) => {
    try {
      const response = await mockApi.completeTask(taskId);
      if (response.success) {
        showToast('任务已完成', 'success');
        PendingTasksManager.loadTasks();
      }
    } catch (error) {
      console.error('Complete task error:', error);
      showToast('任务完成失败', 'error');
    }
  },
  
  // 查看任务详情
  viewTask: (taskId) => {
    showToast(`查看任务 ${taskId} 详情功能开发中...`, 'info');
  },
  
  // 刷新待处理事项
  refresh: () => {
    PendingTasksManager.loadTasks();
  }
};

// 最近操作管理
const RecentActivitiesManager = {
  // 加载最近操作
  loadActivities: async () => {
    try {
      const response = await mockApi.getRecentActivities();
      if (response.success) {
        RecentActivitiesManager.renderActivities(response.data);
      }
    } catch (error) {
      console.error('Recent activities load error:', error);
      showToast('最近操作加载失败', 'error');
    }
  },
  
  // 渲染最近操作
  renderActivities: (activities) => {
    const container = document.getElementById('recent-activities-list');
    if (!container) return;
    
    if (!activities || activities.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <i class="fas fa-history"></i>
          <p>暂无最近操作</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.type}">
          <i class="fas ${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  },
  
  // 获取操作图标
  getActivityIcon: (type) => {
    const icons = {
      create: 'fa-plus',
      update: 'fa-edit',
      delete: 'fa-trash',
      view: 'fa-eye'
    };
    return icons[type] || 'fa-circle';
  },
  
  // 刷新最近操作
  refresh: () => {
    RecentActivitiesManager.loadActivities();
  }
};

// 系统通知管理
const SystemNotificationsManager = {
  // 加载系统通知
  loadNotifications: async () => {
    try {
      const response = await mockApi.getSystemNotifications();
      if (response.success) {
        SystemNotificationsManager.renderNotifications(response.data);
      }
    } catch (error) {
      console.error('System notifications load error:', error);
      showToast('系统通知加载失败', 'error');
    }
  },
  
  // 渲染系统通知
  renderNotifications: (notifications) => {
    const container = document.getElementById('system-notifications-list');
    if (!container) return;
    
    if (!notifications || notifications.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <i class="fas fa-bell-slash"></i>
          <p>暂无系统通知</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = notifications.map(notification => `
      <div class="notification-item ${notification.read ? '' : 'unread'}">
        <div class="notification-type ${notification.type}">
          <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-time">${notification.time}</div>
        </div>
        <div class="notification-actions">
          ${!notification.read ? `
            <button class="notification-action-btn" onclick="SystemNotificationsManager.markAsRead('${notification.id}')" title="标记已读">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
          <button class="notification-action-btn" onclick="SystemNotificationsManager.deleteNotification('${notification.id}')" title="删除">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `).join('');
  },
  
  // 获取通知图标
  getNotificationIcon: (type) => {
    const icons = {
      info: 'fa-info',
      warning: 'fa-exclamation-triangle',
      error: 'fa-exclamation-circle',
      success: 'fa-check-circle'
    };
    return icons[type] || 'fa-bell';
  },
  
  // 标记为已读
  markAsRead: async (notificationId) => {
    try {
      const response = await mockApi.markNotificationAsRead(notificationId);
      if (response.success) {
        SystemNotificationsManager.loadNotifications();
      }
    } catch (error) {
      console.error('Mark notification as read error:', error);
      showToast('标记已读失败', 'error');
    }
  },
  
  // 删除通知
  deleteNotification: async (notificationId) => {
    try {
      const response = await mockApi.deleteNotification(notificationId);
      if (response.success) {
        showToast('通知已删除', 'success');
        SystemNotificationsManager.loadNotifications();
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      showToast('删除通知失败', 'error');
    }
  },
  
  // 全部标记为已读
  markAllAsRead: async () => {
    try {
      const response = await mockApi.markAllNotificationsAsRead();
      if (response.success) {
        showToast('所有通知已标记为已读', 'success');
        SystemNotificationsManager.loadNotifications();
      }
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      showToast('批量标记已读失败', 'error');
    }
  }
};

// 全局函数
function navigateToPage(url) {
  QuickActionsManager.navigateToPage(url);
}

function refreshQuickActions() {
  QuickActionsManager.refreshActions();
}

function refreshPendingTasks() {
  PendingTasksManager.refresh();
}

function refreshRecentActivities() {
  RecentActivitiesManager.refresh();
}

function showAllPendingTasks() {
  showToast('查看全部待处理事项功能开发中...', 'info');
}

function showAllActivities() {
  showToast('查看全部操作记录功能开发中...', 'info');
}

function markAllNotificationsRead() {
  SystemNotificationsManager.markAllAsRead();
}

// 重复的函数定义已删除

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  
  // 初始化动画增强
  setTimeout(() => {
    enhanceFormSubmission();
    enhanceStatCards();
    enhanceTableRows();
  }, 100);
});