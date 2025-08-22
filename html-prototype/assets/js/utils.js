/* Utility Functions - 工具函数 */

// DOM 操作工具
const DOM = {
  // 获取元素
  get: (selector) => document.querySelector(selector),
  getAll: (selector) => document.querySelectorAll(selector),
  
  // 创建元素
  create: (tag, className = '', content = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  },
  
  // 添加事件监听
  on: (element, event, handler) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.addEventListener(event, handler);
    }
  },
  
  // 移除事件监听
  off: (element, event, handler) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.removeEventListener(event, handler);
    }
  },
  
  // 显示/隐藏元素
  show: (element) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.style.display = '';
    }
  },
  
  hide: (element) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.style.display = 'none';
    }
  },
  
  // 切换类名
  toggleClass: (element, className) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.toggle(className);
    }
  },
  
  // 添加类名
  addClass: (element, className) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.add(className);
    }
  },
  
  // 移除类名
  removeClass: (element, className) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.remove(className);
    }
  }
};

// 本地存储工具
const Storage = {
  // 设置数据
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  // 获取数据
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  // 删除数据
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  // 清空所有数据
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// 日期时间工具
const DateTime = {
  // 格式化日期
  format: (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  
  // 相对时间
  relative: (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  },
  
  // 获取今天开始时间
  startOfDay: (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  },
  
  // 获取今天结束时间
  endOfDay: (date = new Date()) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }
};

// 数字格式化工具
const NumberFormat = {
  // 格式化货币
  currency: (amount, currency = '') => {
    const formatted = Number(amount).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return currency ? `${currency}${formatted}` : formatted;
  },
  
  // 格式化数字
  number: (num) => {
    return Number(num).toLocaleString('zh-CN');
  },
  
  // 格式化百分比
  percent: (num, decimals = 1) => {
    return `${Number(num).toFixed(decimals)}%`;
  },
  
  // 格式化文件大小
  fileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
};

// 字符串工具
const StringUtils = {
  // 截断字符串
  truncate: (str, length = 50, suffix = '...') => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },
  
  // 首字母大写
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // 转换为驼峰命名
  camelCase: (str) => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  },
  
  // 转换为短横线命名
  kebabCase: (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },
  
  // 生成随机字符串
  random: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// URL 工具
const URLUtils = {
  // 获取查询参数
  getParams: () => {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  },
  
  // 获取单个查询参数
  getParam: (name, defaultValue = null) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || defaultValue;
  },
  
  // 设置查询参数
  setParam: (name, value) => {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
  },
  
  // 删除查询参数
  removeParam: (name) => {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  }
};

// 防抖和节流工具
const Throttle = {
  // 防抖
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 节流
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// 验证工具
const Validator = {
  // 验证邮箱
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  // 验证手机号
  phone: (phone) => {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },
  
  // 验证身份证号
  idCard: (idCard) => {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  },
  
  // 验证密码强度
  password: (password) => {
    // 至少8位，包含大小写字母和数字
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  },
  
  // 验证URL
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// 错误处理工具
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
  },
  
  // 处理API错误
  handleApiError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // 服务器响应错误
      const status = error.response.status;
      const message = error.response.data?.message || '服务器错误';
      
      switch (status) {
        case 400:
          ErrorHandler.showError('请求参数错误');
          break;
        case 401:
          ErrorHandler.showError('未授权，请重新登录');
          // 可以在这里处理登录跳转
          break;
        case 403:
          ErrorHandler.showError('权限不足');
          break;
        case 404:
          ErrorHandler.showError('请求的资源不存在');
          break;
        case 500:
          ErrorHandler.showError('服务器内部错误');
          break;
        default:
          ErrorHandler.showError(message);
      }
    } else if (error.request) {
      // 网络错误
      ErrorHandler.showError('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      ErrorHandler.showError(error.message || '未知错误');
    }
  }
};

// 浏览器检测工具
const BrowserDetect = {
  // 获取浏览器信息
  getBrowser: () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.includes('Chrome')) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return { browser, version };
  },
  
  // 检查是否为移动设备
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // 检查是否为触摸设备
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // 检查浏览器支持
  checkSupport: () => {
    const features = {
      flexbox: CSS.supports('display', 'flex'),
      grid: CSS.supports('display', 'grid'),
      customProperties: CSS.supports('--custom', 'property'),
      fetch: typeof fetch !== 'undefined',
      promises: typeof Promise !== 'undefined',
      localStorage: typeof Storage !== 'undefined'
    };
    
    return features;
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

// 确认对话框组件
function showConfirmDialog(title, message, type = 'info') {
  return new Promise((resolve) => {
    const dialogId = 'confirmDialog_' + Date.now();
    const typeClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
    const iconClass = type === 'danger' ? 'fa-exclamation-triangle' : 'fa-question-circle';
    
    const dialogHTML = `
      <div class="modal-overlay" id="${dialogId}" onclick="closeConfirmDialog('${dialogId}', false)">
        <div class="modal-container confirm-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fas ${iconClass}"></i>
              ${title}
            </h3>
          </div>
          
          <div class="modal-body">
            <p class="confirm-message">${message}</p>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeConfirmDialog('${dialogId}', false)">取消</button>
            <button type="button" class="btn ${typeClass}" onclick="closeConfirmDialog('${dialogId}', true)">确认</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // 存储resolve函数
    window[`confirmResolve_${dialogId}`] = resolve;
  });
}

function closeConfirmDialog(dialogId, result) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.remove();
  }
  
  const resolveFunc = window[`confirmResolve_${dialogId}`];
  if (resolveFunc) {
    resolveFunc(result);
    delete window[`confirmResolve_${dialogId}`];
  }
}

// 格式化日期时间
function formatDateTime(dateString) {
  if (!dateString || dateString === '-') return '-';
  
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

// 导出工具对象
window.Utils = {
  DOM,
  Storage,
  DateTime,
  NumberFormat,
  StringUtils,
  URLUtils,
  Throttle,
  Validator,
  ErrorHandler,
  BrowserDetect
};

// 导出全局函数
window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;
window.formatDateTime = formatDateTime;

