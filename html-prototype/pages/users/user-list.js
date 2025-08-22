/* 用户列表页面功能 */

// 页面状态管理
const userListState = {
  currentPage: 1,
  pageSize: 10,
  totalRecords: 0,
  searchKeyword: '',
  statusFilter: '',
  sortField: '',
  sortOrder: 'asc',
  selectedUsers: [],
  isLoading: false
};

// 页面初始化 - 移除重复的监听器，在文件末尾统一处理

// 初始化用户列表页面
function initUserListPage() {
  try {
    // 设置当前页面菜单激活状态
    if (typeof setActiveMenu === 'function') {
      setActiveMenu('user-management', 'user-list');
    }
    
    // 生成面包屑导航
    if (typeof generateBreadcrumb === 'function') {
      generateBreadcrumb([
        { name: '首页', url: '../../dashboard.html' },
        { name: '用户管理', url: '#' },
        { name: '用户列表', url: '#', active: true }
      ]);
    }
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载用户数据
    loadUserData();
  } catch (error) {
    console.error('初始化用户列表页面失败:', error);
    showToast('页面初始化失败', 'error');
  }
}

// 绑定事件监听器
function bindEventListeners() {
  // 搜索框回车事件
  const searchInput = document.querySelector('.filter-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  }
  
  // 状态筛选变化事件
  const statusSelect = document.querySelector('.filter-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', function() {
      applyFilters();
    });
  }
  
  // 全选复选框事件
  const selectAllCheckbox = document.querySelector('.select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      toggleSelectAll(this);
    });
  }
}

// 加载用户数据
async function loadUserData() {
  try {
    userListState.isLoading = true;
    showLoadingState();
    
    const params = {
      page: userListState.currentPage,
      size: userListState.pageSize,
      keyword: userListState.searchKeyword,
      status: userListState.statusFilter
    };
    
    const response = await mockApi.getUsers(params);
    
    if (response.success) {
      userListState.totalRecords = response.data.total;
      renderUserTable(response.data.records);
      renderPagination(response.data);
      updateTableInfo(response.data);
    } else {
      showErrorState('加载用户数据失败');
    }
  } catch (error) {
    console.error('加载用户数据出错:', error);
    showErrorState('加载用户数据出错');
  } finally {
    userListState.isLoading = false;
  }
}

// 渲染用户表格
function renderUserTable(users) {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="empty-title">暂无用户数据</div>
            <div class="empty-description">当前没有找到符合条件的用户，请尝试调整筛选条件</div>
            <button class="btn btn-primary" onclick="resetFilters()">重置筛选</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = users.map(user => `
    <tr data-user-id="${user.id}">
      <td>
        <input type="checkbox" class="row-select" value="${user.id}" onchange="handleRowSelect(this)">
      </td>
      <td>${user.id}</td>
      <td>
        <div class="user-info">
          <img src="${user.avatar}" alt="头像" class="user-avatar-small" onerror="this.src='../../assets/images/avatars/admin.svg'">
          <div class="user-details">
            <div class="user-name">${user.username}</div>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
      </td>
      <td>${user.phone || '-'}</td>
      <td>
        <span class="status-badge status-${user.status}">
          ${user.status === 'active' ? '启用' : '禁用'}
        </span>
      </td>
      <td>
        <div class="user-roles">
          ${user.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
        </div>
      </td>
      <td>${formatDateTime(user.createdAt)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline" onclick="viewUser(${user.id})" title="查看详情">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})" title="编辑">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-${user.status === 'active' ? 'warning' : 'success'}" 
                  onclick="toggleUserStatus(${user.id}, '${user.status}')" 
                  title="${user.status === 'active' ? '禁用' : '启用'}">
            <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 渲染分页组件
function renderPagination(data) {
  const paginationControls = document.querySelector('.pagination-controls');
  if (!paginationControls) return;
  
  const totalPages = Math.ceil(data.total / data.size);
  const currentPage = data.current;
  
  if (totalPages <= 1) {
    paginationControls.innerHTML = '';
    return;
  }
  
  let paginationHTML = `
    <button class="btn btn-outline" onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i> 上一页
    </button>
    <div class="page-numbers">
  `;
  
  // 生成页码按钮
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  if (startPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="page-ellipsis">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="page-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }
  
  paginationHTML += `
    </div>
    <button class="btn btn-outline" onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
      下一页 <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  paginationControls.innerHTML = paginationHTML;
}

// 更新表格信息
function updateTableInfo(data) {
  const tableCount = document.querySelector('.table-count strong');
  const paginationInfo = document.querySelector('.pagination-info');
  
  if (tableCount) {
    tableCount.textContent = data.total;
  }
  
  if (paginationInfo) {
    const start = (data.current - 1) * data.size + 1;
    const end = Math.min(data.current * data.size, data.total);
    paginationInfo.textContent = `显示第 ${start}-${end} 条，共 ${data.total} 条记录`;
  }
}

// 显示加载状态
function showLoadingState() {
  const tbody = document.getElementById('userTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="loading-state">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <div class="loading-text">正在加载用户数据...</div>
          </div>
        </td>
      </tr>
    `;
  }
}

// 显示错误状态
function showErrorState(message) {
  const tbody = document.getElementById('userTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="error-state">
            <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-title">加载失败</div>
            <div class="error-description">${message}</div>
            <button class="btn btn-primary" onclick="loadUserData()">重新加载</button>
          </div>
        </td>
      </tr>
    `;
  }
}

// 应用筛选条件
function applyFilters() {
  const searchInput = document.querySelector('.filter-input');
  const statusSelect = document.querySelector('.filter-select');
  
  userListState.searchKeyword = searchInput ? searchInput.value.trim() : '';
  userListState.statusFilter = statusSelect ? statusSelect.value : '';
  userListState.currentPage = 1; // 重置到第一页
  
  loadUserData();
}

// 重置筛选条件
function resetFilters() {
  const searchInput = document.querySelector('.filter-input');
  const statusSelect = document.querySelector('.filter-select');
  
  if (searchInput) searchInput.value = '';
  if (statusSelect) statusSelect.value = '';
  
  userListState.searchKeyword = '';
  userListState.statusFilter = '';
  userListState.currentPage = 1;
  
  loadUserData();
}

// 跳转到指定页面
function goToPage(page) {
  if (page < 1 || userListState.isLoading) return;
  
  userListState.currentPage = page;
  loadUserData();
}

// 表格排序
function sortTable(field) {
  if (userListState.sortField === field) {
    userListState.sortOrder = userListState.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    userListState.sortField = field;
    userListState.sortOrder = 'asc';
  }
  
  // 更新排序图标
  updateSortIcons(field, userListState.sortOrder);
  
  // 重新加载数据（这里简化处理，实际应该在API中处理排序）
  loadUserData();
}

// 更新排序图标
function updateSortIcons(activeField, order) {
  const sortableHeaders = document.querySelectorAll('.sortable');
  sortableHeaders.forEach(header => {
    const icon = header.querySelector('i');
    if (icon) {
      const onclickAttr = header.getAttribute('onclick');
      if (onclickAttr) {
        const match = onclickAttr.match(/sortTable\('([^']+)'\)/);
        const field = match ? match[1] : null;
        if (field === activeField) {
          icon.className = `fas fa-sort-${order === 'asc' ? 'up' : 'down'}`;
        } else {
          icon.className = 'fas fa-sort';
        }
      }
    }
  });
}

// 全选/取消全选
function toggleSelectAll(checkbox) {
  const rowCheckboxes = document.querySelectorAll('.row-select');
  const isChecked = checkbox.checked;
  
  rowCheckboxes.forEach(cb => {
    cb.checked = isChecked;
  });
  
  // 更新选中的用户列表
  if (isChecked) {
    userListState.selectedUsers = Array.from(rowCheckboxes).map(cb => parseInt(cb.value));
  } else {
    userListState.selectedUsers = [];
  }
  
  updateBatchActions();
}

// 处理行选择
function handleRowSelect(checkbox) {
  const userId = parseInt(checkbox.value);
  
  if (checkbox.checked) {
    if (!userListState.selectedUsers.includes(userId)) {
      userListState.selectedUsers.push(userId);
    }
  } else {
    userListState.selectedUsers = userListState.selectedUsers.filter(id => id !== userId);
  }
  
  // 更新全选复选框状态
  const selectAllCheckbox = document.querySelector('.select-all');
  const rowCheckboxes = document.querySelectorAll('.row-select');
  const checkedCount = userListState.selectedUsers.length;
  
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = checkedCount === rowCheckboxes.length;
    selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
  }
  
  updateBatchActions();
}

// 更新批量操作按钮状态
function updateBatchActions() {
  const batchDeleteBtn = document.querySelector('button[onclick="batchDelete()"]');
  if (batchDeleteBtn) {
    batchDeleteBtn.disabled = userListState.selectedUsers.length === 0;
  }
}

// 新增用户
function addUser() {
  showUserModal();
}

// 查看用户详情
function viewUser(userId) {
  const user = mockData.users.find(u => u.id === userId);
  if (user) {
    showUserDetailModal(user);
  }
}

// 编辑用户
function editUser(userId) {
  const user = mockData.users.find(u => u.id === userId);
  if (user) {
    showUserModal(user);
  }
}

// 切换用户状态
async function toggleUserStatus(userId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const statusText = newStatus === 'active' ? '启用' : '禁用';
  
  const confirmed = await showConfirmDialog(
    '确认操作',
    `确定要${statusText}该用户吗？`,
    'warning'
  );
  
  if (confirmed) {
    try {
      // 模拟API调用
      await mockApi.delay(300);
      
      // 更新本地数据
      const user = mockData.users.find(u => u.id === userId);
      if (user) {
        user.status = newStatus;
      }
      
      showToast(`用户${statusText}成功`, 'success');
      loadUserData();
    } catch (error) {
      showToast(`用户${statusText}失败`, 'error');
    }
  }
}

// 删除用户
async function deleteUser(userId) {
  const confirmed = await showConfirmDialog(
    '确认删除',
    '确定要删除该用户吗？删除后无法恢复。',
    'danger'
  );
  
  if (confirmed) {
    try {
      // 模拟API调用
      await mockApi.delay(300);
      
      // 从本地数据中删除
      const index = mockData.users.findIndex(u => u.id === userId);
      if (index > -1) {
        mockData.users.splice(index, 1);
      }
      
      showToast('用户删除成功', 'success');
      loadUserData();
    } catch (error) {
      showToast('用户删除失败', 'error');
    }
  }
}

// 批量删除
async function batchDelete() {
  if (userListState.selectedUsers.length === 0) {
    showToast('请选择要删除的用户', 'warning');
    return;
  }
  
  const confirmed = await showConfirmDialog(
    '批量删除',
    `确定要删除选中的 ${userListState.selectedUsers.length} 个用户吗？删除后无法恢复。`,
    'danger'
  );
  
  if (confirmed) {
    try {
      // 模拟API调用
      await mockApi.delay(500);
      
      // 从本地数据中删除
      userListState.selectedUsers.forEach(userId => {
        const index = mockData.users.findIndex(u => u.id === userId);
        if (index > -1) {
          mockData.users.splice(index, 1);
        }
      });
      
      userListState.selectedUsers = [];
      showToast('批量删除成功', 'success');
      loadUserData();
    } catch (error) {
      showToast('批量删除失败', 'error');
    }
  }
}

// 导出数据
function exportData() {
  showToast('导出功能开发中...', 'info');
}

// 刷新当前页面数据
function refreshCurrentPageData() {
  loadUserData();
}

// 显示用户模态框
function showUserModal(user = null) {
  const isEdit = !!user;
  const title = isEdit ? '编辑用户' : '新增用户';
  
  // 定义角色和权限映射
  const rolePermissions = {
    '管理员': ['用户管理', '商品管理', '订单管理', '库存管理', '平台管理', '物流管理', '通知管理', '系统设置'],
    '运营人员': ['商品管理', '订单管理', '库存管理', '平台管理', '通知管理'],
    '仓库管理员': ['库存管理', '订单管理', '物流管理'],
    '客服人员': ['订单管理', '通知管理'],
    '销售经理': ['商品管理', '订单管理', '库存管理', '通知管理'],
    '财务人员': ['订单管理', '通知管理'],
    '物流专员': ['物流管理', '订单管理'],
    '产品经理': ['商品管理', '库存管理'],
    '市场专员': ['商品管理', '通知管理'],
    '技术支持': ['系统设置', '通知管理'],
    '数据分析师': ['订单管理', '库存管理', '商品管理'],
    '质检员': ['商品管理', '库存管理']
  };
  
  const modalHTML = `
    <div class="modal-overlay" id="userModal" onclick="closeModal('userModal')">
      <div class="modal-container large-modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="closeModal('userModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form id="userForm" class="app-form">
            <div class="form-section">
              <h4 class="section-title">基本信息</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">用户名</label>
                  <input type="text" name="username" class="form-input" 
                         placeholder="请输入用户名（3-20个字符，仅支持字母、数字、下划线）" 
                         value="${user ? user.username : ''}" required>
                  <div class="form-error" style="display: none;"></div>
                </div>
                
                <div class="form-group">
                  <label class="form-label required">邮箱</label>
                  <input type="email" name="email" class="form-input" 
                         placeholder="请输入邮箱地址" value="${user ? user.email : ''}" required>
                  <div class="form-error" style="display: none;"></div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">手机号</label>
                  <input type="tel" name="phone" class="form-input" 
                         placeholder="请输入手机号（可选）" value="${user ? user.phone || '' : ''}">
                  <div class="form-error" style="display: none;"></div>
                </div>
                
                <div class="form-group">
                  <label class="form-label required">状态</label>
                  <select name="status" class="form-select" required>
                    <option value="">请选择状态</option>
                    <option value="active" ${user && user.status === 'active' ? 'selected' : ''}>启用</option>
                    <option value="inactive" ${user && user.status === 'inactive' ? 'selected' : ''}>禁用</option>
                  </select>
                  <div class="form-error" style="display: none;"></div>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="section-title">角色权限</h4>
              
              <div class="form-row">
                <div class="form-group full-width">
                  <label class="form-label required">用户角色</label>
                  <div class="checkbox-group" id="rolesGroup">
                    ${Object.keys(rolePermissions).map(role => `
                      <label class="checkbox-item">
                        <input type="checkbox" name="roles" value="${role}" 
                               ${user && user.roles.includes(role) ? 'checked' : ''}
                               onchange="updatePermissionPreview()">
                        <span class="checkbox-label">${role}</span>
                      </label>
                    `).join('')}
                  </div>
                  <div class="form-error" style="display: none;"></div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group full-width">
                  <label class="form-label">权限预览</label>
                  <div class="permission-preview" id="permissionPreview">
                    <div class="permission-placeholder">请选择角色以查看对应权限</div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">取消</button>
          <button type="button" class="btn btn-primary" onclick="saveUser(${user ? user.id : 'null'})">保存</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // 初始化权限预览
  setTimeout(() => {
    updatePermissionPreview();
    bindFormValidation();
  }, 100);
}

// 更新权限预览
function updatePermissionPreview() {
  const rolePermissions = {
    '管理员': ['用户管理', '商品管理', '订单管理', '库存管理', '平台管理', '物流管理', '通知管理', '系统设置'],
    '运营人员': ['商品管理', '订单管理', '库存管理', '平台管理', '通知管理'],
    '仓库管理员': ['库存管理', '订单管理', '物流管理'],
    '客服人员': ['订单管理', '通知管理'],
    '销售经理': ['商品管理', '订单管理', '库存管理', '通知管理'],
    '财务人员': ['订单管理', '通知管理'],
    '物流专员': ['物流管理', '订单管理'],
    '产品经理': ['商品管理', '库存管理'],
    '市场专员': ['商品管理', '通知管理'],
    '技术支持': ['系统设置', '通知管理'],
    '数据分析师': ['订单管理', '库存管理', '商品管理'],
    '质检员': ['商品管理', '库存管理']
  };
  
  const selectedRoles = Array.from(document.querySelectorAll('input[name="roles"]:checked'))
    .map(cb => cb.value);
  
  const previewElement = document.getElementById('permissionPreview');
  if (!previewElement) return;
  
  if (selectedRoles.length === 0) {
    previewElement.innerHTML = '<div class="permission-placeholder">请选择角色以查看对应权限</div>';
    return;
  }
  
  // 合并所有选中角色的权限
  const allPermissions = new Set();
  selectedRoles.forEach(role => {
    if (rolePermissions[role]) {
      rolePermissions[role].forEach(permission => allPermissions.add(permission));
    }
  });
  
  const permissionList = Array.from(allPermissions).sort();
  
  previewElement.innerHTML = `
    <div class="permission-list">
      ${permissionList.map(permission => `
        <span class="permission-tag">${permission}</span>
      `).join('')}
    </div>
    <div class="permission-summary">
      已选择 ${selectedRoles.length} 个角色，拥有 ${permissionList.length} 项权限
    </div>
  `;
}

// 绑定表单验证
function bindFormValidation() {
  const form = document.getElementById('userForm');
  if (!form) return;
  
  // 实时验证用户名
  const usernameInput = form.querySelector('input[name="username"]');
  if (usernameInput) {
    usernameInput.addEventListener('blur', function() {
      validateField(this, 'username');
    });
  }
  
  // 实时验证邮箱
  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      validateField(this, 'email');
    });
  }
  
  // 实时验证手机号
  const phoneInput = form.querySelector('input[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('blur', function() {
      validateField(this, 'phone');
    });
  }
}

// 单个字段验证
function validateField(field, fieldName) {
  const value = field.value.trim();
  let errorMessage = '';
  
  switch (fieldName) {
    case 'username':
      if (!value) {
        errorMessage = '用户名不能为空';
      } else if (value.length < 3) {
        errorMessage = '用户名至少需要3个字符';
      } else if (value.length > 20) {
        errorMessage = '用户名不能超过20个字符';
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        errorMessage = '用户名只能包含字母、数字和下划线';
      }
      break;
      
    case 'email':
      if (!value) {
        errorMessage = '邮箱不能为空';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessage = '请输入正确的邮箱格式';
      }
      break;
      
    case 'phone':
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        errorMessage = '请输入正确的手机号格式';
      }
      break;
  }
  
  const errorElement = field.parentNode.querySelector('.form-error');
  if (errorMessage) {
    field.classList.add('error');
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  } else {
    field.classList.remove('error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }
}

// 显示用户详情模态框
function showUserDetailModal(user) {
  const modalHTML = `
    <div class="modal-overlay" id="userDetailModal" onclick="closeModal('userDetailModal')">
      <div class="modal-container" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">用户详情</h3>
          <button class="modal-close" onclick="closeModal('userDetailModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="user-detail-content">
            <div class="user-avatar-section">
              <img src="${user.avatar}" alt="用户头像" class="user-avatar-large" 
                   onerror="this.src='../../assets/images/avatars/admin.svg'">
              <div class="user-basic-info">
                <h4>${user.username}</h4>
                <p>${user.email}</p>
                <span class="status-badge status-${user.status}">
                  ${user.status === 'active' ? '启用' : '禁用'}
                </span>
              </div>
            </div>
            
            <div class="user-detail-info">
              <div class="info-row">
                <label>用户ID：</label>
                <span>${user.id}</span>
              </div>
              <div class="info-row">
                <label>手机号：</label>
                <span>${user.phone || '-'}</span>
              </div>
              <div class="info-row">
                <label>角色：</label>
                <div class="user-roles">
                  ${user.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
                </div>
              </div>
              <div class="info-row">
                <label>创建时间：</label>
                <span>${formatDateTime(user.createdAt)}</span>
              </div>
              <div class="info-row">
                <label>最后登录：</label>
                <span>${formatDateTime(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('userDetailModal')">关闭</button>
          <button type="button" class="btn btn-primary" onclick="closeModal('userDetailModal'); editUser(${user.id})">编辑</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 保存用户
async function saveUser(userId) {
  const form = document.getElementById('userForm');
  if (!form) return;
  
  // 清除之前的错误状态
  clearFormErrors(form);
  
  const formData = new FormData(form);
  const userData = {
    username: formData.get('username'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    status: formData.get('status'),
    roles: formData.getAll('roles')
  };
  
  // 表单验证
  const validationErrors = validateUserForm(userData, userId);
  if (validationErrors.length > 0) {
    showFormErrors(form, validationErrors);
    showToast('请修正表单错误', 'warning');
    return;
  }
  
  try {
    // 显示保存状态
    const saveBtn = document.querySelector('button[onclick*="saveUser"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
    }
    
    // 模拟API调用
    await mockApi.delay(500);
    
    if (userId) {
      // 编辑用户
      const user = mockData.users.find(u => u.id === userId);
      if (user) {
        Object.assign(user, userData);
        showToast('用户更新成功', 'success');
      }
    } else {
      // 新增用户
      const newUser = {
        id: Math.max(...mockData.users.map(u => u.id)) + 1,
        ...userData,
        avatar: '../../assets/images/avatars/admin.svg',
        createdAt: new Date().toLocaleString('zh-CN'),
        lastLogin: '-'
      };
      mockData.users.push(newUser);
      showToast('用户创建成功', 'success');
    }
    
    closeModal('userModal');
    loadUserData();
  } catch (error) {
    showToast('保存失败', 'error');
  } finally {
    // 恢复保存按钮状态
    const saveBtn = document.querySelector('button[onclick*="saveUser"]');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '保存';
    }
  }
}

// 表单验证
function validateUserForm(userData, userId) {
  const errors = [];
  
  // 用户名验证
  if (!userData.username || userData.username.trim().length === 0) {
    errors.push({ field: 'username', message: '用户名不能为空' });
  } else if (userData.username.length < 3) {
    errors.push({ field: 'username', message: '用户名至少需要3个字符' });
  } else if (userData.username.length > 20) {
    errors.push({ field: 'username', message: '用户名不能超过20个字符' });
  } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
    errors.push({ field: 'username', message: '用户名只能包含字母、数字和下划线' });
  } else {
    // 检查用户名是否已存在
    const existingUser = mockData.users.find(u => 
      u.username === userData.username && u.id !== userId
    );
    if (existingUser) {
      errors.push({ field: 'username', message: '用户名已存在' });
    }
  }
  
  // 邮箱验证
  if (!userData.email || userData.email.trim().length === 0) {
    errors.push({ field: 'email', message: '邮箱不能为空' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push({ field: 'email', message: '请输入正确的邮箱格式' });
  } else {
    // 检查邮箱是否已存在
    const existingUser = mockData.users.find(u => 
      u.email === userData.email && u.id !== userId
    );
    if (existingUser) {
      errors.push({ field: 'email', message: '邮箱已存在' });
    }
  }
  
  // 手机号验证
  if (userData.phone && userData.phone.trim().length > 0) {
    if (!/^1[3-9]\d{9}$/.test(userData.phone)) {
      errors.push({ field: 'phone', message: '请输入正确的手机号格式' });
    } else {
      // 检查手机号是否已存在
      const existingUser = mockData.users.find(u => 
        u.phone === userData.phone && u.id !== userId
      );
      if (existingUser) {
        errors.push({ field: 'phone', message: '手机号已存在' });
      }
    }
  }
  
  // 状态验证
  if (!userData.status) {
    errors.push({ field: 'status', message: '请选择用户状态' });
  }
  
  // 角色验证
  if (!userData.roles || userData.roles.length === 0) {
    errors.push({ field: 'roles', message: '请至少选择一个角色' });
  }
  
  return errors;
}

// 显示表单错误
function showFormErrors(form, errors) {
  errors.forEach(error => {
    const field = form.querySelector(`[name="${error.field}"]`);
    if (field) {
      field.classList.add('error');
      
      // 查找或创建错误提示元素
      let errorElement = field.parentNode.querySelector('.form-error');
      if (errorElement) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      }
    }
  });
}

// 清除表单错误
function clearFormErrors(form) {
  const errorFields = form.querySelectorAll('.error');
  errorFields.forEach(field => {
    field.classList.remove('error');
  });
  
  const errorMessages = form.querySelectorAll('.form-error');
  errorMessages.forEach(msg => {
    msg.style.display = 'none';
  });
}

// 关闭模态框
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}
// 辅助函数：显示通知
function showNotifications() {
  showToast('通知功能开发中...', 'info');
}

// 辅助函数：显示个人资料
function showProfile() {
  showToast('个人资料功能开发中...', 'info');
}

// 辅助函数：显示系统设置
function showSettings() {
  showToast('系统设置功能开发中...', 'info');
}

// 辅助函数：退出登录
function logout() {
  showConfirmDialog('确认退出', '确定要退出登录吗？', 'warning').then(confirmed => {
    if (confirmed) {
      // 清除登录信息
      Utils.Storage.remove('userToken');
      Utils.Storage.remove('userInfo');
      
      showToast('已退出登录', 'success');
      
      // 跳转到登录页
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 1000);
    }
  });
}

// 辅助函数：刷新当前页面数据
function refreshCurrentPageData() {
  loadUserData();
}

// 确保在页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUserListPage);
} else {
  // 如果文档已经加载完成，直接初始化
  setTimeout(initUserListPage, 100);
}