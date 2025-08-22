/* Component Functions - 组件功能 */

// Toast 消息组件 - 已移至 utils.js

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
  closeToastWithAnimation(toast);
}

// 增强模态框组件类
class Modal {
  constructor(options = {}) {
    this.options = {
      title: '',
      content: '',
      size: 'medium', // small, medium, large, fullscreen
      closable: true,
      maskClosable: true,
      keyboard: true,
      centered: true,
      footer: true,
      confirmText: '确认',
      cancelText: '取消',
      confirmType: 'primary',
      onConfirm: null,
      onCancel: null,
      onClose: null,
      ...options
    };
    
    this.element = null;
    this.isVisible = false;
    
    this.create();
  }
  
  create() {
    this.element = document.createElement('div');
    this.element.className = `modal-overlay ${this.options.size}`;
    
    const footerHtml = this.options.footer ? `
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="cancel">${this.options.cancelText}</button>
        <button class="btn btn-${this.options.confirmType}" data-action="confirm">${this.options.confirmText}</button>
      </div>
    ` : '';
    
    this.element.innerHTML = `
      <div class="modal-container ${this.options.centered ? 'centered' : ''}">
        <div class="modal-header">
          <h3 class="modal-title">${this.options.title}</h3>
          ${this.options.closable ? `
            <button class="modal-close" data-action="close">
              <i class="fas fa-times"></i>
            </button>
          ` : ''}
        </div>
        <div class="modal-body">
          ${this.options.content}
        </div>
        ${footerHtml}
      </div>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    // 按钮事件
    this.element.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      
      switch (action) {
        case 'close':
          this.close();
          break;
        case 'cancel':
          this.cancel();
          break;
        case 'confirm':
          this.confirm();
          break;
      }
    });
    
    // 遮罩点击关闭
    if (this.options.maskClosable) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }
    
    // 键盘事件
    if (this.options.keyboard) {
      document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }
  
  handleKeydown(e) {
    if (!this.isVisible) return;
    
    if (e.key === 'Escape' && this.options.closable) {
      this.close();
    }
  }
  
  show() {
    if (this.isVisible) return;
    
    document.body.appendChild(this.element);
    document.body.classList.add('modal-open');
    
    // 触发显示动画
    setTimeout(() => {
      this.element.classList.add('show');
      this.isVisible = true;
      
      // 模态框内容弹跳动画
      const container = this.element.querySelector('.modal-container');
      if (container) {
        container.classList.add('bounce-in');
      }
    }, 10);
    
    return this;
  }
  
  hide() {
    if (!this.isVisible) return;
    
    this.element.classList.remove('show');
    this.isVisible = false;
    
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      document.body.classList.remove('modal-open');
    }, 300);
    
    return this;
  }
  
  close() {
    if (this.options.onClose) {
      const result = this.options.onClose();
      if (result === false) return;
    }
    
    this.hide();
    this.cleanup();
  }
  
  cancel() {
    if (this.options.onCancel) {
      const result = this.options.onCancel();
      if (result === false) return;
    }
    
    this.close();
  }
  
  confirm() {
    if (this.options.onConfirm) {
      const result = this.options.onConfirm();
      if (result === false) return;
    }
    
    this.close();
  }
  
  setTitle(title) {
    const titleElement = this.element.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    return this;
  }
  
  setContent(content) {
    const bodyElement = this.element.querySelector('.modal-body');
    if (bodyElement) {
      bodyElement.innerHTML = content;
    }
    return this;
  }
  
  cleanup() {
    if (this.options.keyboard) {
      document.removeEventListener('keydown', this.handleKeydown.bind(this));
    }
  }
  
  destroy() {
    this.hide();
    this.cleanup();
  }
}

// 表单验证组件类
class FormValidator {
  constructor(formElement, options = {}) {
    this.form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
    this.options = {
      validateOnSubmit: true,
      validateOnBlur: true,
      validateOnInput: false,
      showErrors: true,
      errorClass: 'error',
      errorMessageClass: 'form-error',
      ...options
    };
    
    this.rules = {};
    this.errors = {};
    this.isValid = true;
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
    this.parseRules();
  }
  
  bindEvents() {
    if (this.options.validateOnSubmit) {
      this.form.addEventListener('submit', (e) => {
        if (!this.validate()) {
          e.preventDefault();
        }
      });
    }
    
    if (this.options.validateOnBlur) {
      this.form.addEventListener('blur', (e) => {
        if (e.target.matches('input, textarea, select')) {
          this.validateField(e.target);
        }
      }, true);
    }
    
    if (this.options.validateOnInput) {
      this.form.addEventListener('input', (e) => {
        if (e.target.matches('input, textarea')) {
          this.validateField(e.target);
        }
      });
    }
  }
  
  parseRules() {
    const fields = this.form.querySelectorAll('[data-rules]');
    fields.forEach(field => {
      const rulesStr = field.dataset.rules;
      try {
        this.rules[field.name] = JSON.parse(rulesStr);
      } catch (e) {
        console.warn('Invalid rules format for field:', field.name);
      }
    });
  }
  
  addRule(fieldName, rules) {
    this.rules[fieldName] = rules;
    return this;
  }
  
  removeRule(fieldName) {
    delete this.rules[fieldName];
    return this;
  }
  
  validate() {
    this.errors = {};
    this.isValid = true;
    
    Object.keys(this.rules).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.validateField(field);
      }
    });
    
    if (this.options.showErrors) {
      this.displayErrors();
    }
    
    return this.isValid;
  }
  
  validateField(field) {
    const fieldName = field.name;
    const rules = this.rules[fieldName];
    
    if (!rules) return true;
    
    const value = field.value.trim();
    const fieldErrors = [];
    
    // 必填验证
    if (rules.required && !value) {
      fieldErrors.push(rules.required.message || `${this.getFieldLabel(field)}不能为空`);
    }
    
    // 如果字段为空且不是必填，跳过其他验证
    if (!value && !rules.required) {
      this.clearFieldError(field);
      return true;
    }
    
    // 最小长度验证
    if (rules.minLength && value.length < rules.minLength.value) {
      fieldErrors.push(rules.minLength.message || `${this.getFieldLabel(field)}至少需要${rules.minLength.value}个字符`);
    }
    
    // 最大长度验证
    if (rules.maxLength && value.length > rules.maxLength.value) {
      fieldErrors.push(rules.maxLength.message || `${this.getFieldLabel(field)}不能超过${rules.maxLength.value}个字符`);
    }
    
    // 最小值验证
    if (rules.min && parseFloat(value) < rules.min.value) {
      fieldErrors.push(rules.min.message || `${this.getFieldLabel(field)}不能小于${rules.min.value}`);
    }
    
    // 最大值验证
    if (rules.max && parseFloat(value) > rules.max.value) {
      fieldErrors.push(rules.max.message || `${this.getFieldLabel(field)}不能大于${rules.max.value}`);
    }
    
    // 正则表达式验证
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern.value);
      if (!regex.test(value)) {
        fieldErrors.push(rules.pattern.message || `${this.getFieldLabel(field)}格式不正确`);
      }
    }
    
    // 邮箱验证
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        fieldErrors.push(rules.email.message || '请输入有效的邮箱地址');
      }
    }
    
    // 手机号验证
    if (rules.phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        fieldErrors.push(rules.phone.message || '请输入有效的手机号码');
      }
    }
    
    // 自定义验证函数
    if (rules.custom && typeof rules.custom.validator === 'function') {
      const customResult = rules.custom.validator(value, field);
      if (customResult !== true) {
        fieldErrors.push(customResult || rules.custom.message || '验证失败');
      }
    }
    
    // 确认密码验证
    if (rules.confirm) {
      const confirmField = this.form.querySelector(`[name="${rules.confirm.field}"]`);
      if (confirmField && value !== confirmField.value) {
        fieldErrors.push(rules.confirm.message || '两次输入的密码不一致');
      }
    }
    
    if (fieldErrors.length > 0) {
      this.errors[fieldName] = fieldErrors;
      this.isValid = false;
      this.showFieldError(field, fieldErrors[0]);
    } else {
      this.clearFieldError(field);
    }
    
    return fieldErrors.length === 0;
  }
  
  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add(this.options.errorClass);
    field.classList.add(this.options.errorClass);
    
    let errorElement = formGroup.querySelector(`.${this.options.errorMessageClass}`);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = this.options.errorMessageClass;
      formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }
  
  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove(this.options.errorClass);
    field.classList.remove(this.options.errorClass);
    
    const errorElement = formGroup.querySelector(`.${this.options.errorMessageClass}`);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }
  
  displayErrors() {
    Object.keys(this.errors).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field && this.errors[fieldName].length > 0) {
        this.showFieldError(field, this.errors[fieldName][0]);
      }
    });
  }
  
  clearErrors() {
    this.errors = {};
    this.isValid = true;
    
    const errorFields = this.form.querySelectorAll(`.${this.options.errorClass}`);
    errorFields.forEach(field => {
      field.classList.remove(this.options.errorClass);
    });
    
    const errorMessages = this.form.querySelectorAll(`.${this.options.errorMessageClass}`);
    errorMessages.forEach(message => {
      message.textContent = '';
    });
  }
  
  getFieldLabel(field) {
    const label = this.form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
  }
  
  getErrors() {
    return this.errors;
  }
  
  isFormValid() {
    return this.isValid;
  }
}

// 兼容旧版本的模态框函数
function showModal(title, content, options = {}) {
  const modal = new Modal({
    title,
    content,
    ...options
  });
  
  modal.show();
  return modal;
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
    
    // 执行取消回调
    if (window.modalCancelCallback) {
      window.modalCancelCallback();
      window.modalCancelCallback = null;
    }
  }
}

function confirmModal() {
  // 执行确认回调
  if (window.modalConfirmCallback) {
    window.modalConfirmCallback();
    window.modalConfirmCallback = null;
  }
  closeModal();
}

// 确认对话框
function showConfirm(message, onConfirm, onCancel) {
  showModal('确认操作', `<p>${message}</p>`, {
    onConfirm,
    onCancel
  });
}

// 侧边栏切换
function toggleSidebar() {
  const container = document.querySelector('.app-container');
  const sidebar = document.querySelector('.app-sidebar');
  
  if (container) {
    container.classList.toggle('sidebar-collapsed');
    
    // 保存侧边栏状态
    const isCollapsed = container.classList.contains('sidebar-collapsed');
    Utils.Storage.set('sidebarCollapsed', isCollapsed);
  }
  
  // 移动端显示遮罩
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('show');
    
    // 创建或移除遮罩
    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('show')) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = closeSidebar;
        document.body.appendChild(overlay);
      }
      setTimeout(() => overlay.classList.add('show'), 10);
      
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      closeSidebar();
    }
  }
}

// 关闭侧边栏
function closeSidebar() {
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.remove('show');
  }
  
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
  
  // 恢复背景滚动
  document.body.style.overflow = '';
}

// 侧边栏滑动手势支持
let sidebarTouchStart = null;
let sidebarTouchCurrent = null;
let sidebarIsOpen = false;

function initSidebarGestures() {
  const sidebar = document.querySelector('.app-sidebar');
  if (!sidebar) return;
  
  // 检测是否为移动设备
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;
  
  // 从左边缘滑动打开侧边栏
  document.addEventListener('touchstart', (e) => {
    if (e.touches[0].clientX < 20 && !sidebarIsOpen) {
      sidebarTouchStart = e.touches[0].clientX;
    }
  });
  
  document.addEventListener('touchmove', (e) => {
    if (sidebarTouchStart !== null) {
      sidebarTouchCurrent = e.touches[0].clientX;
      const diff = sidebarTouchCurrent - sidebarTouchStart;
      
      if (diff > 50) {
        toggleSidebar();
        sidebarIsOpen = true;
        sidebarTouchStart = null;
      }
    }
  });
  
  document.addEventListener('touchend', () => {
    sidebarTouchStart = null;
    sidebarTouchCurrent = null;
  });
  
  // 侧边栏内部滑动关闭
  sidebar.addEventListener('touchstart', (e) => {
    if (sidebar.classList.contains('show')) {
      sidebarTouchStart = e.touches[0].clientX;
    }
  });
  
  sidebar.addEventListener('touchmove', (e) => {
    if (sidebarTouchStart !== null && sidebar.classList.contains('show')) {
      sidebarTouchCurrent = e.touches[0].clientX;
      const diff = sidebarTouchStart - sidebarTouchCurrent;
      
      if (diff > 100) {
        closeSidebar();
        sidebarIsOpen = false;
        sidebarTouchStart = null;
      }
    }
  });
  
  sidebar.addEventListener('touchend', () => {
    sidebarTouchStart = null;
    sidebarTouchCurrent = null;
  });
}

// 响应式表格转换
function initResponsiveTable() {
  const tables = document.querySelectorAll('.data-table');
  
  tables.forEach(table => {
    if (window.innerWidth <= 479) {
      convertTableToCards(table);
    }
  });
}

function convertTableToCards(table) {
  const container = table.closest('.data-table-container');
  if (!container) return;
  
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'mobile-table-cards';
  
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    const card = document.createElement('div');
    card.className = 'mobile-card';
    
    let cardHTML = '<div class="mobile-card-header">';
    cardHTML += `<div class="mobile-card-title">${cells[1]?.textContent || 'Item'}</div>`;
    
    // 添加选择框（如果有）
    const checkbox = cells[0]?.querySelector('input[type="checkbox"]');
    if (checkbox) {
      cardHTML += `<input type="checkbox" ${checkbox.checked ? 'checked' : ''} value="${checkbox.value}">`;
    }
    
    cardHTML += '</div><div class="mobile-card-body">';
    
    // 跳过第一列（选择框）和第二列（已用作标题）
    for (let i = 2; i < cells.length - 1; i++) {
      if (headers[i] && cells[i]) {
        cardHTML += `
          <div class="mobile-card-field">
            <div class="mobile-card-label">${headers[i]}</div>
            <div class="mobile-card-value">${cells[i].innerHTML}</div>
          </div>
        `;
      }
    }
    
    cardHTML += '</div>';
    
    // 添加操作按钮
    const actionsCell = cells[cells.length - 1];
    if (actionsCell && actionsCell.querySelector('.btn')) {
      cardHTML += '<div class="mobile-card-actions">';
      cardHTML += actionsCell.innerHTML;
      cardHTML += '</div>';
    }
    
    card.innerHTML = cardHTML;
    cardsContainer.appendChild(card);
  });
  
  // 替换表格
  const tableWrapper = table.closest('.table-wrapper');
  if (tableWrapper) {
    tableWrapper.style.display = 'none';
    tableWrapper.parentNode.insertBefore(cardsContainer, tableWrapper.nextSibling);
  }
}

// 子菜单切换
function toggleSubmenu(element) {
  const navItem = element.closest('.nav-item');
  const submenu = navItem.querySelector('.submenu');
  const arrow = element.querySelector('.submenu-arrow');
  
  if (submenu) {
    navItem.classList.toggle('expanded');
    
    if (navItem.classList.contains('expanded')) {
      submenu.style.maxHeight = submenu.scrollHeight + 'px';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      submenu.style.maxHeight = '0';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

// 密码显示/隐藏切换
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleButton = document.querySelector('.password-toggle i');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleButton.className = 'fas fa-eye-slash';
  } else {
    passwordInput.type = 'password';
    toggleButton.className = 'fas fa-eye';
  }
}

// 数据表格组件类
class DataTable {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      columns: [],
      data: [],
      pagination: true,
      pageSize: 10,
      sortable: true,
      selectable: true,
      searchable: true,
      loading: false,
      empty: {
        icon: 'fas fa-inbox',
        title: '暂无数据',
        description: '当前没有找到相关数据，请尝试其他操作'
      },
      actions: [],
      batchActions: [],
      onSort: null,
      onPageChange: null,
      onSearch: null,
      onSelect: null,
      onBatchAction: null,
      ...options
    };
    
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalRecords = 0;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.selectedRows = new Set();
    this.searchKeyword = '';
    this.filters = {};
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="data-table-container">
        ${this.renderHeader()}
        ${this.renderFilters()}
        ${this.renderTable()}
        ${this.renderPagination()}
      </div>
    `;
  }
  
  renderHeader() {
    const { title, actions } = this.options;
    if (!title && !actions.length) return '';
    
    return `
      <div class="table-header">
        <div class="table-title">
          ${title ? `<h3>${title}</h3>` : ''}
          <span class="table-count">共 <strong>${this.totalRecords}</strong> 条记录</span>
        </div>
        <div class="table-actions">
          ${actions.map(action => `
            <button class="btn ${action.type || 'btn-primary'}" onclick="${action.onClick}">
              ${action.icon ? `<i class="${action.icon}"></i>` : ''} ${action.text}
            </button>
          `).join('')}
          ${this.options.batchActions.length > 0 ? this.renderBatchActions() : ''}
        </div>
      </div>
    `;
  }
  
  renderBatchActions() {
    return `
      <div class="batch-actions" style="display: none;">
        ${this.options.batchActions.map(action => `
          <button class="btn ${action.type || 'btn-secondary'}" onclick="dataTable.executeBatchAction('${action.key}')">
            ${action.icon ? `<i class="${action.icon}"></i>` : ''} ${action.text}
          </button>
        `).join('')}
      </div>
    `;
  }
  
  renderFilters() {
    if (!this.options.searchable && !this.options.filters) return '';
    
    return `
      <div class="table-filters">
        <div class="filter-group">
          ${this.options.searchable ? `
            <input type="text" placeholder="搜索关键词..." class="filter-input search-input" value="${this.searchKeyword}">
          ` : ''}
          ${this.options.filters ? this.renderCustomFilters() : ''}
          <button class="btn btn-outline" onclick="dataTable.resetFilters()">重置</button>
          <button class="btn btn-primary" onclick="dataTable.applyFilters()">搜索</button>
        </div>
      </div>
    `;
  }
  
  renderCustomFilters() {
    if (!this.options.filters) return '';
    
    return this.options.filters.map(filter => {
      switch (filter.type) {
        case 'select':
          return `
            <select class="filter-select" data-filter="${filter.key}">
              <option value="">${filter.placeholder || '全部'}</option>
              ${filter.options.map(option => `
                <option value="${option.value}" ${this.filters[filter.key] === option.value ? 'selected' : ''}>
                  ${option.label}
                </option>
              `).join('')}
            </select>
          `;
        case 'input':
          return `
            <input type="text" placeholder="${filter.placeholder}" class="filter-input" data-filter="${filter.key}" value="${this.filters[filter.key] || ''}">
          `;
        default:
          return '';
      }
    }).join('');
  }
  
  renderTable() {
    if (this.options.loading) {
      return this.renderLoading();
    }
    
    if (!this.options.data || this.options.data.length === 0) {
      return this.renderEmpty();
    }
    
    return `
      <div class="table-wrapper">
        <table class="data-table">
          ${this.renderTableHeader()}
          ${this.renderTableBody()}
        </table>
      </div>
    `;
  }
  
  renderTableHeader() {
    const { columns, selectable } = this.options;
    
    return `
      <thead>
        <tr>
          ${selectable ? `
            <th style="width: 50px;">
              <input type="checkbox" class="select-all" onchange="dataTable.toggleSelectAll(this)">
            </th>
          ` : ''}
          ${columns.map(column => `
            <th class="${column.sortable !== false && this.options.sortable ? 'sortable' : ''}" 
                ${column.sortable !== false && this.options.sortable ? `onclick="dataTable.sort('${column.key}')"` : ''}
                ${column.width ? `style="width: ${column.width};"` : ''}>
              ${column.title}
              ${column.sortable !== false && this.options.sortable ? `
                <i class="fas ${this.getSortIcon(column.key)}"></i>
              ` : ''}
            </th>
          `).join('')}
          ${this.hasRowActions() ? '<th style="width: 120px;">操作</th>' : ''}
        </tr>
      </thead>
    `;
  }
  
  renderTableBody() {
    const { columns, selectable } = this.options;
    
    return `
      <tbody>
        ${this.options.data.map((row, index) => `
          <tr data-row-id="${row.id || index}">
            ${selectable ? `
              <td>
                <input type="checkbox" class="row-select" value="${row.id || index}" 
                       onchange="dataTable.toggleRowSelect(this)" 
                       ${this.selectedRows.has(row.id || index) ? 'checked' : ''}>
              </td>
            ` : ''}
            ${columns.map(column => `
              <td ${column.align ? `style="text-align: ${column.align};"` : ''}>
                ${this.renderCellContent(row, column)}
              </td>
            `).join('')}
            ${this.hasRowActions() ? `
              <td>
                <div class="row-actions">
                  ${this.renderRowActions(row)}
                </div>
              </td>
            ` : ''}
          </tr>
        `).join('')}
      </tbody>
    `;
  }
  
  renderCellContent(row, column) {
    const value = this.getNestedValue(row, column.key);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.type === 'status') {
      return `<span class="status-badge status-${value}">${value}</span>`;
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleString('zh-CN') : '-';
    }
    
    if (column.type === 'currency') {
      return value ? `¥${parseFloat(value).toFixed(2)}` : '-';
    }
    
    if (column.type === 'image') {
      return value ? `<img src="${value}" alt="" class="table-image" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '-';
    }
    
    return value || '-';
  }
  
  renderRowActions(row) {
    if (!this.options.rowActions) return '';
    
    return this.options.rowActions.map(action => `
      <button class="btn btn-small ${action.type || 'btn-outline'}" 
              onclick="${action.onClick}('${row.id}')" 
              title="${action.title || action.text}">
        ${action.icon ? `<i class="${action.icon}"></i>` : action.text}
      </button>
    `).join('');
  }
  
  renderLoading() {
    return `
      <div class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <div class="loading-text">数据加载中...</div>
      </div>
    `;
  }
  
  renderEmpty() {
    const { empty } = this.options;
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="${empty.icon}"></i>
        </div>
        <div class="empty-title">${empty.title}</div>
        <div class="empty-description">${empty.description}</div>
        ${empty.action ? `
          <button class="btn btn-primary" onclick="${empty.action.onClick}">
            ${empty.action.text}
          </button>
        ` : ''}
      </div>
    `;
  }
  
  renderPagination() {
    if (!this.options.pagination || this.totalPages <= 1) return '';
    
    const startRecord = (this.currentPage - 1) * this.options.pageSize + 1;
    const endRecord = Math.min(this.currentPage * this.options.pageSize, this.totalRecords);
    
    return `
      <div class="table-pagination">
        <div class="pagination-info">
          显示第 ${startRecord}-${endRecord} 条，共 ${this.totalRecords} 条记录
        </div>
        <div class="pagination-controls">
          <button class="btn btn-outline" onclick="dataTable.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> 上一页
          </button>
          <div class="page-numbers">
            ${this.renderPageNumbers()}
          </div>
          <button class="btn btn-outline" onclick="dataTable.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
            下一页 <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  }
  
  renderPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      pages.push(`<button class="page-btn" onclick="dataTable.goToPage(1)">1</button>`);
      if (start > 2) {
        pages.push(`<span class="page-ellipsis">...</span>`);
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(`
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                onclick="dataTable.goToPage(${i})">${i}</button>
      `);
    }
    
    if (end < this.totalPages) {
      if (end < this.totalPages - 1) {
        pages.push(`<span class="page-ellipsis">...</span>`);
      }
      pages.push(`<button class="page-btn" onclick="dataTable.goToPage(${this.totalPages})">${this.totalPages}</button>`);
    }
    
    return pages.join('');
  }
  
  bindEvents() {
    // 搜索输入框事件
    const searchInput = this.container.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('keyup', Utils.Debounce.debounce((e) => {
        if (e.key === 'Enter') {
          this.applyFilters();
        }
      }, 300));
    }
    
    // 过滤器变化事件
    const filterInputs = this.container.querySelectorAll('[data-filter]');
    filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.filters[input.dataset.filter] = input.value;
      });
    });
  }
  
  // 公共方法
  setData(data, totalRecords = null) {
    this.options.data = data;
    this.totalRecords = totalRecords || data.length;
    this.totalPages = Math.ceil(this.totalRecords / this.options.pageSize);
    this.selectedRows.clear();
    this.render();
  }
  
  setLoading(loading) {
    this.options.loading = loading;
    this.render();
  }
  
  toggleSelectAll(checkbox) {
    const rowCheckboxes = this.container.querySelectorAll('.row-select');
    rowCheckboxes.forEach(cb => {
      cb.checked = checkbox.checked;
      const rowId = cb.value;
      if (checkbox.checked) {
        this.selectedRows.add(rowId);
      } else {
        this.selectedRows.delete(rowId);
      }
    });
    this.updateBatchActions();
    this.triggerSelectEvent();
  }
  
  toggleRowSelect(checkbox) {
    const rowId = checkbox.value;
    if (checkbox.checked) {
      this.selectedRows.add(rowId);
    } else {
      this.selectedRows.delete(rowId);
    }
    
    // 更新全选状态
    const selectAllCheckbox = this.container.querySelector('.select-all');
    const rowCheckboxes = this.container.querySelectorAll('.row-select');
    const checkedCount = this.container.querySelectorAll('.row-select:checked').length;
    
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = checkedCount === rowCheckboxes.length;
      selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
    }
    
    this.updateBatchActions();
    this.triggerSelectEvent();
  }
  
  updateBatchActions() {
    const batchActionsContainer = this.container.querySelector('.batch-actions');
    if (batchActionsContainer) {
      batchActionsContainer.style.display = this.selectedRows.size > 0 ? 'flex' : 'none';
    }
  }
  
  sort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    if (this.options.onSort) {
      this.options.onSort(column, this.sortDirection);
    } else {
      this.localSort(column, this.sortDirection);
    }
    
    this.render();
  }
  
  localSort(column, direction) {
    this.options.data.sort((a, b) => {
      const aValue = this.getNestedValue(a, column);
      const bValue = this.getNestedValue(b, column);
      
      if (aValue === bValue) return 0;
      
      let result;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue;
      } else {
        result = String(aValue).localeCompare(String(bValue));
      }
      
      return direction === 'asc' ? result : -result;
    });
  }
  
  getSortIcon(column) {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
  
  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.selectedRows.clear();
    
    if (this.options.onPageChange) {
      this.options.onPageChange(page, this.options.pageSize);
    }
    
    this.render();
  }
  
  applyFilters() {
    const searchInput = this.container.querySelector('.search-input');
    if (searchInput) {
      this.searchKeyword = searchInput.value.trim();
    }
    
    this.currentPage = 1;
    this.selectedRows.clear();
    
    if (this.options.onSearch) {
      this.options.onSearch(this.searchKeyword, this.filters);
    } else {
      this.localFilter();
    }
    
    this.render();
  }
  
  resetFilters() {
    this.searchKeyword = '';
    this.filters = {};
    this.currentPage = 1;
    this.selectedRows.clear();
    
    // 重置表单
    const searchInput = this.container.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    const filterInputs = this.container.querySelectorAll('[data-filter]');
    filterInputs.forEach(input => {
      input.value = '';
    });
    
    if (this.options.onSearch) {
      this.options.onSearch('', {});
    } else {
      this.localFilter();
    }
    
    this.render();
  }
  
  localFilter() {
    // 这里应该实现本地过滤逻辑
    // 实际项目中通常由后端处理
    console.log('Local filter:', this.searchKeyword, this.filters);
  }
  
  executeBatchAction(actionKey) {
    const action = this.options.batchActions.find(a => a.key === actionKey);
    if (action && this.options.onBatchAction) {
      this.options.onBatchAction(actionKey, Array.from(this.selectedRows));
    }
  }
  
  getSelectedRows() {
    return Array.from(this.selectedRows);
  }
  
  clearSelection() {
    this.selectedRows.clear();
    const checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    this.updateBatchActions();
  }
  
  refresh() {
    this.render();
  }
  
  // 工具方法
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
  
  hasRowActions() {
    return this.options.rowActions && this.options.rowActions.length > 0;
  }
  
  triggerSelectEvent() {
    if (this.options.onSelect) {
      this.options.onSelect(Array.from(this.selectedRows));
    }
  }
}

// 全局数据表格实例
let dataTable = null;

// 兼容旧版本的函数
function toggleSelectAll(checkbox) {
  if (dataTable) {
    dataTable.toggleSelectAll(checkbox);
  }
}

function updateBatchActions() {
  if (dataTable) {
    dataTable.updateBatchActions();
  }
}

// 表格排序
function sortTable(column) {
  const table = document.querySelector('.data-table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const header = table.querySelector(`th[onclick*="${column}"]`);
  const icon = header.querySelector('.fas');
  
  // 获取当前排序状态
  let isAsc = icon.classList.contains('fa-sort-up');
  
  // 重置所有排序图标
  table.querySelectorAll('th .fas').forEach(i => {
    i.className = 'fas fa-sort';
  });
  
  // 设置当前列的排序图标
  icon.className = isAsc ? 'fas fa-sort-down' : 'fas fa-sort-up';
  
  // 排序行
  rows.sort((a, b) => {
    const aValue = a.cells[getColumnIndex(column)].textContent.trim();
    const bValue = b.cells[getColumnIndex(column)].textContent.trim();
    
    // 数字排序
    if (!isNaN(aValue) && !isNaN(bValue)) {
      return isAsc ? bValue - aValue : aValue - bValue;
    }
    
    // 字符串排序
    return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
  });
  
  // 重新插入排序后的行
  rows.forEach(row => tbody.appendChild(row));
}

// 获取列索引
function getColumnIndex(column) {
  const columnMap = {
    'id': 1,
    'name': 2,
    'status': 3,
    'created_at': 4
  };
  return columnMap[column] || 1;
}

// 分页控制
function previousPage() {
  const currentPage = getCurrentPage();
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function nextPage() {
  const currentPage = getCurrentPage();
  const totalPages = getTotalPages();
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

function goToPage(page) {
  // 更新页码按钮状态
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const pageBtn = document.querySelector(`.page-btn:nth-child(${page})`);
  if (pageBtn) {
    pageBtn.classList.add('active');
  }
  
  // 更新分页按钮状态
  const prevBtn = document.querySelector('[onclick="previousPage()"]');
  const nextBtn = document.querySelector('[onclick="nextPage()"]');
  
  if (prevBtn) {
    prevBtn.disabled = page === 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = page === getTotalPages();
  }
  
  // 这里应该调用API加载对应页面的数据
  loadPageData(page);
}

function getCurrentPage() {
  const activeBtn = document.querySelector('.page-btn.active');
  return activeBtn ? parseInt(activeBtn.textContent) : 1;
}

function getTotalPages() {
  const pageButtons = document.querySelectorAll('.page-btn');
  return pageButtons.length;
}

// 加载页面数据（模拟）
function loadPageData(page) {
  console.log(`Loading page ${page} data...`);
  // 这里应该调用相应的API
}

// 搜索功能
function applyFilters() {
  const keyword = document.querySelector('.filter-input').value;
  const status = document.querySelector('.filter-select').value;
  
  console.log('Applying filters:', { keyword, status });
  // 这里应该调用API进行搜索
  showToast('搜索功能已触发', 'info');
}

function resetFilters() {
  document.querySelector('.filter-input').value = '';
  document.querySelector('.filter-select').value = '';
  applyFilters();
}

// 批量操作
function batchDelete() {
  const checkedBoxes = document.querySelectorAll('.data-table tbody input[type="checkbox"]:checked');
  if (checkedBoxes.length === 0) {
    showToast('请选择要删除的项目', 'warning');
    return;
  }
  
  showConfirm(
    `确定要删除选中的 ${checkedBoxes.length} 个项目吗？`,
    () => {
      console.log('Batch delete confirmed');
      showToast('删除成功', 'success');
      // 这里应该调用API进行批量删除
    }
  );
}

// 导出数据
function exportData() {
  showToast('导出功能开发中...', 'info');
  // 这里应该实现数据导出功能
}

// 主题切换
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  Utils.Storage.set('theme', newTheme);
  
  showToast(`已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`, 'success');
}

// 设置主题
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  Utils.Storage.set('theme', theme);
  
  const themeNames = {
    light: '浅色',
    dark: '深色',
    blue: '蓝色',
    green: '绿色',
    purple: '紫色',
    orange: '橙色',
    red: '红色',
    'high-contrast': '高对比度',
    auto: '自动'
  };
  
  showToast(`已切换到${themeNames[theme]}主题`, 'success');
}

// 初始化主题
function initTheme() {
  const savedTheme = Utils.Storage.get('theme', 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// 显示通知
function showNotifications() {
  showToast('通知功能开发中...', 'info');
  // 这里应该显示通知列表
}

// 显示个人资料
function showProfile() {
  showToast('个人资料功能开发中...', 'info');
  // 这里应该显示个人资料页面
}

// 显示系统设置
function showSettings() {
  showToast('系统设置功能开发中...', 'info');
  // 这里应该显示系统设置页面
}

// 退出登录
function logout() {
  showConfirm(
    '确定要退出登录吗？',
    () => {
      // 清除登录状态
      Utils.Storage.remove('userToken');
      Utils.Storage.remove('userInfo');
      
      // 跳转到登录页
      window.location.href = 'index.html';
    }
  );
}

// 响应式处理
function handleResize() {
  const width = window.innerWidth;
  const container = document.querySelector('.app-container');
  const sidebar = document.querySelector('.app-sidebar');
  
  if (width <= 768) {
    // 移动端：隐藏侧边栏
    if (container) {
      container.classList.add('sidebar-collapsed');
    }
    if (sidebar) {
      sidebar.classList.remove('show');
    }
  } else {
    // 桌面端：显示侧边栏
    if (container) {
      container.classList.remove('sidebar-collapsed');
    }
    if (sidebar) {
      sidebar.classList.remove('show');
    }
    
    // 移除遮罩
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// 导航管理
const Navigation = {
  // 页面路由配置
  routes: {
    'dashboard.html': {
      title: '仪表板',
      breadcrumb: [{ text: '仪表板', active: true }],
      menuId: 'dashboard'
    },
    'pages/users/user-list.html': {
      title: '用户列表',
      breadcrumb: [
        { text: '用户管理', href: '#' },
        { text: '用户列表', active: true }
      ],
      menuId: 'user-management',
      submenuId: 'user-list'
    },
    'pages/users/role-management.html': {
      title: '角色管理',
      breadcrumb: [
        { text: '用户管理', href: '#' },
        { text: '角色管理', active: true }
      ],
      menuId: 'user-management',
      submenuId: 'role-management'
    },
    'pages/products/product-list.html': {
      title: '商品列表',
      breadcrumb: [
        { text: '商品管理', href: '#' },
        { text: '商品列表', active: true }
      ],
      menuId: 'product-management',
      submenuId: 'product-list'
    },
    'pages/products/product-import.html': {
      title: '商品导入',
      breadcrumb: [
        { text: '商品管理', href: '#' },
        { text: '商品导入', active: true }
      ],
      menuId: 'product-management',
      submenuId: 'product-import'
    },
    'pages/orders/order-list.html': {
      title: '订单列表',
      breadcrumb: [
        { text: '订单管理', href: '#' },
        { text: '订单列表', active: true }
      ],
      menuId: 'order-management',
      submenuId: 'order-list'
    },
    'pages/inventory/inventory-list.html': {
      title: '库存列表',
      breadcrumb: [
        { text: '库存管理', href: '#' },
        { text: '库存列表', active: true }
      ],
      menuId: 'inventory-management',
      submenuId: 'inventory-list'
    },
    'pages/inventory/inventory-alerts.html': {
      title: '库存预警',
      breadcrumb: [
        { text: '库存管理', href: '#' },
        { text: '库存预警', active: true }
      ],
      menuId: 'inventory-management',
      submenuId: 'inventory-alerts'
    },
    'pages/platforms/platform-list.html': {
      title: '平台列表',
      breadcrumb: [
        { text: '平台管理', href: '#' },
        { text: '平台列表', active: true }
      ],
      menuId: 'platform-management',
      submenuId: 'platform-list'
    },
    'pages/platforms/platform-config.html': {
      title: '平台配置',
      breadcrumb: [
        { text: '平台管理', href: '#' },
        { text: '平台配置', active: true }
      ],
      menuId: 'platform-management',
      submenuId: 'platform-config'
    },
    'pages/logistics/logistics-list.html': {
      title: '物流列表',
      breadcrumb: [
        { text: '物流管理', href: '#' },
        { text: '物流列表', active: true }
      ],
      menuId: 'logistics-management',
      submenuId: 'logistics-list'
    },
    'pages/logistics/shipping-labels.html': {
      title: '面单管理',
      breadcrumb: [
        { text: '物流管理', href: '#' },
        { text: '面单管理', active: true }
      ],
      menuId: 'logistics-management',
      submenuId: 'shipping-labels'
    },
    'pages/notifications/notification-center.html': {
      title: '通知中心',
      breadcrumb: [{ text: '通知中心', active: true }],
      menuId: 'notification-center'
    },
    'pages/settings/system-config.html': {
      title: '系统配置',
      breadcrumb: [
        { text: '系统设置', href: '#' },
        { text: '系统配置', active: true }
      ],
      menuId: 'system-settings',
      submenuId: 'system-config'
    },
    'pages/settings/system-logs.html': {
      title: '系统日志',
      breadcrumb: [
        { text: '系统设置', href: '#' },
        { text: '系统日志', active: true }
      ],
      menuId: 'system-settings',
      submenuId: 'system-logs'
    }
  },

  // 初始化导航
  init() {
    this.updateActiveMenu();
    this.updateBreadcrumb();
    this.restoreSidebarState();
    this.bindNavigationEvents();
  },

  // 更新活跃菜单状态
  updateActiveMenu() {
    const currentPath = this.getCurrentPath();
    const route = this.routes[currentPath];
    
    if (!route) return;

    // 清除所有活跃状态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // 设置当前页面的活跃状态
    const menuItem = document.querySelector(`[data-menu-id="${route.menuId}"]`);
    if (menuItem) {
      const navItem = menuItem.closest('.nav-item');
      navItem.classList.add('active');

      // 如果有子菜单，展开并激活子菜单项
      if (route.submenuId) {
        const submenuItem = document.querySelector(`[data-submenu-id="${route.submenuId}"]`);
        if (submenuItem) {
          // 展开父菜单
          navItem.classList.add('expanded');
          const submenu = navItem.querySelector('.submenu');
          const arrow = navItem.querySelector('.submenu-arrow');
          if (submenu) {
            submenu.style.maxHeight = submenu.scrollHeight + 'px';
          }
          if (arrow) {
            arrow.style.transform = 'rotate(180deg)';
          }

          // 激活子菜单项
          submenuItem.classList.add('active');
        }
      }
    }
  },

  // 更新面包屑导航
  updateBreadcrumb() {
    const currentPath = this.getCurrentPath();
    const route = this.routes[currentPath];
    
    if (!route) return;

    const breadcrumbList = document.querySelector('.breadcrumb-list');
    if (!breadcrumbList) return;

    const breadcrumbHTML = route.breadcrumb.map((item, index) => {
      if (item.active) {
        return `<span class="breadcrumb-item active">${item.text}</span>`;
      } else {
        const separator = index > 0 ? '<span class="breadcrumb-separator">/</span>' : '';
        return `${separator}<a href="${item.href || '#'}" class="breadcrumb-item">${item.text}</a>`;
      }
    }).join('');

    breadcrumbList.innerHTML = breadcrumbHTML;

    // 更新页面标题
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
      pageTitle.textContent = route.title;
    }

    // 更新浏览器标题
    document.title = `${route.title} - 电商ERP管理系统`;
  },

  // 获取当前路径
  getCurrentPath() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // 处理根路径
    if (filename === '' || filename === 'index.html') {
      return 'dashboard.html';
    }
    
    // 处理相对路径
    if (path.includes('pages/')) {
      const relativePath = path.substring(path.indexOf('pages/'));
      return relativePath;
    }
    
    return filename;
  },

  // 恢复侧边栏状态
  restoreSidebarState() {
    const isCollapsed = Utils.Storage.get('sidebarCollapsed', false);
    const container = document.querySelector('.app-container');
    
    if (isCollapsed && container) {
      container.classList.add('sidebar-collapsed');
    }
  },

  // 绑定导航事件
  bindNavigationEvents() {
    // 为所有导航链接添加点击事件
    document.querySelectorAll('.nav-link[href]').forEach(link => {
      link.addEventListener('click', (e) => {
        // 如果是外部链接或者有特殊处理，不阻止默认行为
        if (link.getAttribute('href').startsWith('#') || link.onclick) {
          return;
        }
        
        // 添加页面切换动画
        this.navigateToPage(link.getAttribute('href'));
      });
    });

    // 为子菜单链接添加点击事件
    document.querySelectorAll('.submenu a[href]').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href').startsWith('#')) {
          return;
        }
        
        this.navigateToPage(link.getAttribute('href'));
      });
    });
  },

  // 页面导航
  navigateToPage(href) {
    // 添加页面切换加载效果
    const mainContent = document.querySelector('.app-main');
    if (mainContent) {
      mainContent.style.opacity = '0.7';
      mainContent.style.transition = 'opacity 0.2s ease';
    }

    // 延迟跳转，让用户看到切换效果
    setTimeout(() => {
      window.location.href = href;
    }, 100);
  }
};

// 初始化组件
function initComponents() {
  // 初始化主题
  initTheme();
  
  // 初始化导航
  Navigation.init();
  
  // 监听窗口大小变化
  window.addEventListener('resize', Utils.Throttle.throttle(handleResize, 250));
  
  // 初始化响应式
  handleResize();
  
  // 监听表格复选框变化
  document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && e.target.closest('.data-table tbody')) {
      updateBatchActions();
    }
  });
  
  // 监听键盘事件
  document.addEventListener('keydown', (e) => {
    // ESC 键关闭模态框
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// 测试导航功能
function testNavigation() {
  console.log('Testing navigation system...');
  
  // 测试当前路径检测
  const currentPath = Navigation.getCurrentPath();
  console.log('Current path:', currentPath);
  
  // 测试路由配置
  const route = Navigation.routes[currentPath];
  console.log('Current route:', route);
  
  // 测试面包屑更新
  if (route) {
    console.log('Breadcrumb:', route.breadcrumb);
    console.log('Menu ID:', route.menuId);
    if (route.submenuId) {
      console.log('Submenu ID:', route.submenuId);
    }
  }
  
  console.log('Navigation system test completed.');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initComponents();
  
  // 在开发模式下测试导航
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(testNavigation, 1000);
  }
});

// 进度指示器组件
class ProgressIndicator {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      type: 'linear', // linear, circular
      showPercentage: true,
      showLabel: true,
      animated: true,
      color: 'var(--primary-color)',
      ...options
    };
    
    this.currentProgress = 0;
    this.element = null;
    
    this.create();
  }
  
  create() {
    if (!this.container) return;
    
    this.element = document.createElement('div');
    this.element.className = `progress-indicator progress-${this.options.type}`;
    
    if (this.options.type === 'linear') {
      this.element.innerHTML = `
        <div class="progress-bar">
          <div class="progress-bar-fill" style="background-color: ${this.options.color}; width: 0%;"></div>
        </div>
        ${this.options.showPercentage ? '<div class="progress-percentage">0%</div>' : ''}
        ${this.options.showLabel ? '<div class="progress-label"></div>' : ''}
      `;
    } else if (this.options.type === 'circular') {
      this.element.innerHTML = `
        <div class="progress-circle">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="none" stroke="var(--border-color-light)" stroke-width="4"/>
            <circle cx="30" cy="30" r="25" fill="none" stroke="${this.options.color}" stroke-width="4" 
                    stroke-dasharray="157" stroke-dashoffset="157" class="progress-circle-fill"/>
          </svg>
          ${this.options.showPercentage ? '<div class="progress-percentage">0%</div>' : ''}
        </div>
        ${this.options.showLabel ? '<div class="progress-label"></div>' : ''}
      `;
    }
    
    this.container.appendChild(this.element);
  }
  
  setProgress(percent, label = '') {
    if (!this.element) return;
    
    this.currentProgress = Math.max(0, Math.min(100, percent));
    
    if (this.options.type === 'linear') {
      const fill = this.element.querySelector('.progress-bar-fill');
      if (fill) {
        if (this.options.animated) {
          AnimationManager.animateProgress(fill, this.currentProgress);
        } else {
          fill.style.width = this.currentProgress + '%';
        }
      }
    } else if (this.options.type === 'circular') {
      const circle = this.element.querySelector('.progress-circle-fill');
      if (circle) {
        const circumference = 157; // 2 * π * 25
        const offset = circumference - (this.currentProgress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      }
    }
    
    // 更新百分比显示
    if (this.options.showPercentage) {
      const percentageElement = this.element.querySelector('.progress-percentage');
      if (percentageElement) {
        percentageElement.textContent = Math.round(this.currentProgress) + '%';
      }
    }
    
    // 更新标签
    if (this.options.showLabel && label) {
      const labelElement = this.element.querySelector('.progress-label');
      if (labelElement) {
        labelElement.textContent = label;
      }
    }
  }
  
  complete(message = '完成') {
    this.setProgress(100, message);
    
    setTimeout(() => {
      if (this.element) {
        this.element.classList.add('fade-out');
        setTimeout(() => {
          this.destroy();
        }, 300);
      }
    }, 1000);
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// 全局进度指示器实例
let globalProgressIndicator = null;

// 显示全局进度
function showProgress(label = '处理中...') {
  if (globalProgressIndicator) {
    globalProgressIndicator.destroy();
  }
  
  const container = document.createElement('div');
  container.className = 'global-progress-container';
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background: var(--bg-color-primary);
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    text-align: center;
  `;
  
  document.body.appendChild(container);
  
  globalProgressIndicator = new ProgressIndicator(container, {
    type: 'linear',
    showPercentage: true,
    showLabel: true
  });
  
  globalProgressIndicator.setProgress(0, label);
  
  return globalProgressIndicator;
}

// 更新全局进度
function updateProgress(percent, label) {
  if (globalProgressIndicator) {
    globalProgressIndicator.setProgress(percent, label);
  }
}

// 完成全局进度
function completeProgress(message = '完成') {
  if (globalProgressIndicator) {
    globalProgressIndicator.complete(message);
    
    setTimeout(() => {
      const container = document.querySelector('.global-progress-container');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      globalProgressIndicator = null;
    }, 1500);
  }
}

// 文件上传进度组件
class FileUploadProgress {
  constructor(file, container) {
    this.file = file;
    this.container = container;
    this.element = null;
    this.progress = 0;
    
    this.create();
  }
  
  create() {
    this.element = document.createElement('div');
    this.element.className = 'file-upload-item';
    this.element.innerHTML = `
      <div class="file-info">
        <div class="file-name">${this.file.name}</div>
        <div class="file-size">${this.formatFileSize(this.file.size)}</div>
      </div>
      <div class="file-progress">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: 0%;"></div>
        </div>
        <div class="progress-percentage">0%</div>
      </div>
      <div class="file-status">准备上传</div>
    `;
    
    this.container.appendChild(this.element);
  }
  
  updateProgress(percent, status = '') {
    this.progress = percent;
    
    const fill = this.element.querySelector('.progress-bar-fill');
    const percentage = this.element.querySelector('.progress-percentage');
    const statusElement = this.element.querySelector('.file-status');
    
    if (fill) {
      fill.style.width = percent + '%';
    }
    
    if (percentage) {
      percentage.textContent = Math.round(percent) + '%';
    }
    
    if (status && statusElement) {
      statusElement.textContent = status;
    }
    
    // 完成时添加成功样式
    if (percent >= 100) {
      this.element.classList.add('upload-complete');
      if (statusElement && !status) {
        statusElement.textContent = '上传完成';
      }
    }
  }
  
  setError(message) {
    this.element.classList.add('upload-error');
    const statusElement = this.element.querySelector('.file-status');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 模拟文件上传进度
function simulateFileUpload(file, container, callback) {
  const uploadProgress = new FileUploadProgress(file, container);
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      uploadProgress.updateProgress(progress);
      
      if (callback) {
        setTimeout(() => callback(null, { success: true }), 500);
      }
    } else {
      uploadProgress.updateProgress(progress, '上传中...');
    }
  }, 200);
  
  return uploadProgress;
}
// 设置活跃菜单项
function setActiveMenu(menuId, submenuId = null) {
  // 清除所有活跃状态
  const allNavLinks = document.querySelectorAll('.nav-link');
  allNavLinks.forEach(link => {
    link.classList.remove('active');
    const navItem = link.closest('.nav-item');
    if (navItem) {
      navItem.classList.remove('active');
    }
  });
  
  const allSubmenuLinks = document.querySelectorAll('.submenu a');
  allSubmenuLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // 设置主菜单活跃状态
  const mainMenu = document.querySelector(`[data-menu-id="${menuId}"]`);
  if (mainMenu) {
    mainMenu.classList.add('active');
    const navItem = mainMenu.closest('.nav-item');
    if (navItem) {
      navItem.classList.add('active');
      
      // 如果有子菜单，展开它
      if (navItem.classList.contains('has-submenu')) {
        navItem.classList.add('expanded');
        const submenu = navItem.querySelector('.submenu');
        const arrow = navItem.querySelector('.submenu-arrow');
        if (submenu) {
          submenu.style.maxHeight = submenu.scrollHeight + 'px';
        }
        if (arrow) {
          arrow.style.transform = 'rotate(180deg)';
        }
      }
    }
  }
  
  // 设置子菜单活跃状态
  if (submenuId) {
    const submenuLink = document.querySelector(`[data-submenu-id="${submenuId}"]`);
    if (submenuLink) {
      submenuLink.classList.add('active');
    }
  }
}

// 生成面包屑导航
function generateBreadcrumb(breadcrumbs) {
  const breadcrumbContainer = document.querySelector('.breadcrumb-list');
  if (!breadcrumbContainer || !breadcrumbs || breadcrumbs.length === 0) {
    return;
  }
  
  const breadcrumbHTML = breadcrumbs.map((item, index) => {
    const isLast = index === breadcrumbs.length - 1;
    const isActive = item.active || isLast;
    
    if (isActive) {
      return `<span class="breadcrumb-item active">${item.name}</span>`;
    } else {
      return `<a href="${item.url}" class="breadcrumb-item">${item.name}</a>`;
    }
  }).join('<i class="breadcrumb-separator fas fa-chevron-right"></i>');
  
  breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// 格式化日期时间
function formatDateTime(dateString) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

// 显示确认对话框
function showConfirmDialog(title, message, type = 'warning') {
  return new Promise((resolve) => {
    const modal = new Modal({
      title: title,
      content: `<p style="margin: 16px 0; font-size: 14px;">${message}</p>`,
      confirmText: '确认',
      cancelText: '取消',
      confirmType: type === 'danger' ? 'btn-danger' : 'btn-primary',
      onConfirm: () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
      onClose: () => {
        resolve(false);
      }
    });
    
    modal.show();
  });
}

// 关闭模态框 - 兼容旧版本调用
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

// 显示加载状态
function showLoading(message = '加载中...') {
  const existing = document.querySelector('.global-loading');
  if (existing) return;
  
  const loading = document.createElement('div');
  loading.className = 'global-loading';
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
  if (!document.querySelector('#global-loading-styles')) {
    const styles = document.createElement('style');
    styles.id = 'global-loading-styles';
    styles.textContent = `
      .global-loading {
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
        border: 4px solid var(--border-color-light, #e0e0e0);
        border-top: 4px solid var(--primary-color, #409EFF);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }
      
      .loading-message {
        color: var(--text-color-regular, #606266);
        font-size: var(--font-size-base, 14px);
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styles);
  }
  
  setTimeout(() => {
    loading.classList.add('fade-in');
  }, 10);
}

// 隐藏加载状态
function hideLoading() {
  const loading = document.querySelector('.global-loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => {
      if (loading.parentNode) {
        loading.parentNode.removeChild(loading);
      }
    }, 300);
  }
}

// 退出登录函数
function logout() {
  showConfirmDialog('确认退出', '确定要退出登录吗？', 'warning').then(confirmed => {
    if (confirmed) {
      // 清除登录信息
      if (typeof Utils !== 'undefined' && Utils.Storage) {
        Utils.Storage.remove('userToken');
        Utils.Storage.remove('userInfo');
      }
      
      showToast('已退出登录', 'success');
      
      // 跳转到登录页
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  });
}

// 响应式表格初始化
function initResponsiveTable() {
  const tables = document.querySelectorAll('.data-table');
  
  tables.forEach(table => {
    if (window.innerWidth <= 768) {
      convertTableToCards(table);
    }
  });
}

// 将表格转换为卡片（移动端）
function convertTableToCards(table) {
  const container = table.closest('.data-table-container');
  if (!container) return;
  
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'mobile-table-cards';
  
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    const card = document.createElement('div');
    card.className = 'mobile-card';
    
    let cardHTML = '<div class="mobile-card-header">';
    cardHTML += `<div class="mobile-card-title">${cells[1]?.textContent || 'Item'}</div>`;
    
    // 添加选择框（如果有）
    const checkbox = cells[0]?.querySelector('input[type="checkbox"]');
    if (checkbox) {
      cardHTML += `<input type="checkbox" ${checkbox.checked ? 'checked' : ''} value="${checkbox.value}">`;
    }
    
    cardHTML += '</div><div class="mobile-card-body">';
    
    // 跳过第一列（选择框）和第二列（已用作标题）
    for (let i = 2; i < cells.length - 1; i++) {
      if (headers[i] && cells[i]) {
        cardHTML += `
          <div class="mobile-card-field">
            <div class="mobile-card-label">${headers[i]}</div>
            <div class="mobile-card-value">${cells[i].innerHTML}</div>
          </div>
        `;
      }
    }
    
    cardHTML += '</div>';
    
    // 添加操作按钮
    const actionsCell = cells[cells.length - 1];
    if (actionsCell && actionsCell.querySelector('.btn')) {
      cardHTML += '<div class="mobile-card-actions">';
      cardHTML += actionsCell.innerHTML;
      cardHTML += '</div>';
    }
    
    card.innerHTML = cardHTML;
    cardsContainer.appendChild(card);
  });
  
  // 替换表格
  const tableWrapper = table.closest('.table-wrapper');
  if (tableWrapper) {
    tableWrapper.style.display = 'none';
    tableWrapper.parentNode.insertBefore(cardsContainer, tableWrapper.nextSibling);
  }
}

// 显示个人资料
function showProfile() {
  showToast('个人资料功能开发中...', 'info');
}

// 显示系统设置
function showSettings() {
  showToast('系统设置功能开发中...', 'info');
}

// 显示通知
function showNotifications() {
  showToast('通知功能开发中...', 'info');
}

// 密码显示/隐藏切换
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleButton = document.querySelector('.password-toggle i');
  
  if (passwordInput && toggleButton) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleButton.className = 'fas fa-eye-slash';
    } else {
      passwordInput.type = 'password';
      toggleButton.className = 'fas fa-eye';
    }
  }
}

// 侧边栏切换
function toggleSidebar() {
  const container = document.querySelector('.app-container');
  const sidebar = document.querySelector('.app-sidebar');
  
  if (container) {
    container.classList.toggle('sidebar-collapsed');
    
    // 保存侧边栏状态
    const isCollapsed = container.classList.contains('sidebar-collapsed');
    if (typeof Utils !== 'undefined' && Utils.Storage) {
      Utils.Storage.set('sidebarCollapsed', isCollapsed);
    }
  }
  
  // 移动端显示遮罩
  if (window.innerWidth <= 768 && sidebar) {
    sidebar.classList.toggle('show');
    
    // 创建或移除遮罩
    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('show')) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = closeSidebar;
        document.body.appendChild(overlay);
      }
      setTimeout(() => overlay.classList.add('show'), 10);
      
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      closeSidebar();
    }
  }
}

// 关闭侧边栏
function closeSidebar() {
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.remove('show');
  }
  
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
  
  // 恢复背景滚动
  document.body.style.overflow = '';
}