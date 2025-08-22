/* 平台配置页面逻辑 */

// 当前选择的平台类型
let currentPlatformType = 'walmart';

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initPlatformConfigPage();
});

// 初始化平台配置页面
function initPlatformConfigPage() {
    setupEventListeners();
    loadPlatformConfig();
    updateFormForPlatformType(currentPlatformType);
}

// 设置事件监听器
function setupEventListeners() {
    // 表单提交事件
    const form = document.getElementById('platformConfigForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // 表单字段变化事件
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', validateField);
        input.addEventListener('blur', validateField);
    });
}

// 选择平台类型
function selectPlatformType(type) {
    // 更新UI状态
    document.querySelectorAll('.platform-type-card').forEach(card => {
        card.classList.remove('active');
    });
    
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // 更新当前类型
    currentPlatformType = type;
    
    // 更新表单配置
    updateFormForPlatformType(type);
    
    // 重置连接状态
    resetConnectionStatus();
}

// 根据平台类型更新表单
function updateFormForPlatformType(type) {
    const configs = {
        walmart: {
            name: '沃尔玛商城',
            url: 'https://marketplace.walmart.com',
            apiEndpoint: 'https://marketplace.walmartapis.com',
            apiVersion: 'v3',
            placeholders: {
                clientId: '请输入沃尔玛客户端ID',
                clientSecret: '请输入沃尔玛客户端密钥',
                accessToken: '请输入沃尔玛访问令牌'
            }
        },
        amazon: {
            name: '亚马逊商城',
            url: 'https://sellercentral.amazon.com',
            apiEndpoint: 'https://sellingpartnerapi-na.amazon.com',
            apiVersion: 'v1',
            placeholders: {
                clientId: '请输入亚马逊客户端ID',
                clientSecret: '请输入亚马逊客户端密钥',
                accessToken: '请输入亚马逊访问令牌'
            }
        },
        ebay: {
            name: 'eBay商城',
            url: 'https://www.ebay.com',
            apiEndpoint: 'https://api.ebay.com',
            apiVersion: 'v1',
            placeholders: {
                clientId: '请输入eBay应用ID',
                clientSecret: '请输入eBay应用密钥',
                accessToken: '请输入eBay用户令牌'
            }
        },
        shopify: {
            name: 'Shopify商店',
            url: 'https://your-store.myshopify.com',
            apiEndpoint: 'https://your-store.myshopify.com/admin/api',
            apiVersion: '2023-10',
            placeholders: {
                clientId: '请输入Shopify API密钥',
                clientSecret: '请输入Shopify API密钥',
                accessToken: '请输入Shopify访问令牌'
            }
        }
    };
    
    const config = configs[type];
    if (!config) return;
    
    // 更新表单字段
    document.getElementById('platformName').value = config.name;
    document.getElementById('platformUrl').value = config.url;
    document.getElementById('apiEndpoint').value = config.apiEndpoint;
    document.getElementById('apiVersion').value = config.apiVersion;
    
    // 更新占位符
    document.getElementById('clientId').placeholder = config.placeholders.clientId;
    document.getElementById('clientSecret').placeholder = config.placeholders.clientSecret;
    document.getElementById('accessToken').placeholder = config.placeholders.accessToken;
}

// 加载平台配置
async function loadPlatformConfig() {
    try {
        // 这里应该从API加载现有配置
        const response = await mockApi.getPlatformConfig(currentPlatformType);
        
        if (response.success && response.data) {
            populateForm(response.data);
        }
        
    } catch (error) {
        console.error('Load platform config error:', error);
    }
}

// 填充表单数据
function populateForm(data) {
    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else {
                field.value = data[key];
            }
        }
    });
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    savePlatformConfig();
}

// 保存平台配置
async function savePlatformConfig() {
    try {
        // 验证表单
        if (!validateForm()) {
            return;
        }
        
        // 收集表单数据
        const formData = collectFormData();
        
        // 显示保存状态
        const saveBtn = document.querySelector('.btn-primary');
        LoadingManager.showButtonLoading(saveBtn, '保存中...');
        
        // 调用API保存配置
        const response = await mockApi.savePlatformConfig(currentPlatformType, formData);
        
        if (response.success) {
            showToast('平台配置保存成功', 'success');
            
            // 更新连接状态
            updateConnectionStatus('saved', '配置已保存，请测试连接');
        } else {
            showToast(response.message, 'error');
        }
        
    } catch (error) {
        console.error('Save platform config error:', error);
        showToast('保存配置失败', 'error');
    } finally {
        // 恢复按钮状态
        const saveBtn = document.querySelector('.btn-primary');
        LoadingManager.hideButtonLoading(saveBtn);
    }
}

// 收集表单数据
function collectFormData() {
    const form = document.getElementById('platformConfigForm');
    const formData = new FormData(form);
    const data = {};
    
    // 处理普通字段
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // 处理复选框
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        data[checkbox.name] = checkbox.checked;
    });
    
    // 添加平台类型
    data.platformType = currentPlatformType;
    
    return data;
}

// 验证表单
function validateForm() {
    const form = document.getElementById('platformConfigForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // 清除之前的错误状态
    clearFormErrors();
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, '此字段为必填项');
            isValid = false;
        } else if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// 验证单个字段
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    
    // 清除字段错误
    clearFieldError(field);
    
    // 必填验证
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, '此字段为必填项');
        return false;
    }
    
    // 类型验证
    switch (field.type) {
        case 'url':
            if (value && !isValidUrl(value)) {
                showFieldError(field, '请输入有效的URL地址');
                isValid = false;
            }
            break;
            
        case 'number':
            const min = parseInt(field.min);
            const max = parseInt(field.max);
            const numValue = parseInt(value);
            
            if (value && isNaN(numValue)) {
                showFieldError(field, '请输入有效的数字');
                isValid = false;
            } else if (value && min !== undefined && numValue < min) {
                showFieldError(field, `数值不能小于 ${min}`);
                isValid = false;
            } else if (value && max !== undefined && numValue > max) {
                showFieldError(field, `数值不能大于 ${max}`);
                isValid = false;
            }
            break;
    }
    
    return isValid;
}

// URL验证
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 显示字段错误
function showFieldError(field, message) {
    field.classList.add('error');
    
    // 查找或创建错误提示元素
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// 清除字段错误
function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// 清除表单错误
function clearFormErrors() {
    const errorFields = document.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error');
    errorFields.forEach(field => {
        clearFieldError(field);
    });
}

// 测试连接
async function testConnection() {
    try {
        // 验证必要字段
        const requiredForTest = ['apiEndpoint', 'clientId', 'clientSecret'];
        let canTest = true;
        
        requiredForTest.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                showFieldError(field, '测试连接需要此字段');
                canTest = false;
            }
        });
        
        if (!canTest) {
            showToast('请填写必要的连接信息', 'warning');
            return;
        }
        
        // 显示测试状态
        updateConnectionStatus('testing', '正在测试连接...');
        
        const testBtn = document.querySelector('.btn-outline');
        LoadingManager.showButtonLoading(testBtn, '测试中...');
        
        // 收集测试数据
        const testData = {
            platformType: currentPlatformType,
            apiEndpoint: document.getElementById('apiEndpoint').value,
            clientId: document.getElementById('clientId').value,
            clientSecret: document.getElementById('clientSecret').value,
            accessToken: document.getElementById('accessToken').value
        };
        
        // 调用测试API
        const response = await mockApi.testPlatformConnection(testData);
        
        if (response.success) {
            updateConnectionStatus('success', '连接测试成功');
            showToast('平台连接测试成功', 'success');
        } else {
            updateConnectionStatus('error', response.message || '连接测试失败');
            showToast(response.message || '连接测试失败', 'error');
        }
        
    } catch (error) {
        console.error('Test connection error:', error);
        updateConnectionStatus('error', '连接测试异常');
        showToast('连接测试异常', 'error');
    } finally {
        // 恢复按钮状态
        const testBtn = document.querySelector('.btn-outline');
        LoadingManager.hideButtonLoading(testBtn);
    }
}

// 更新连接状态
function updateConnectionStatus(status, message) {
    const statusContainer = document.getElementById('connectionStatus');
    if (!statusContainer) return;
    
    const statusConfig = {
        testing: {
            icon: 'fas fa-spinner fa-spin',
            class: 'status-testing',
            title: '测试中',
            message: message || '正在测试连接...'
        },
        success: {
            icon: 'fas fa-check-circle',
            class: 'status-success',
            title: '连接成功',
            message: message || '平台连接正常'
        },
        error: {
            icon: 'fas fa-times-circle',
            class: 'status-error',
            title: '连接失败',
            message: message || '无法连接到平台'
        },
        saved: {
            icon: 'fas fa-save',
            class: 'status-saved',
            title: '配置已保存',
            message: message || '配置已保存，请测试连接'
        },
        unknown: {
            icon: 'fas fa-question',
            class: 'status-unknown',
            title: '未测试',
            message: message || '请点击"测试连接"按钮验证配置'
        }
    };
    
    const config = statusConfig[status] || statusConfig.unknown;
    
    statusContainer.innerHTML = `
        <div class="status-item">
            <div class="status-icon ${config.class}">
                <i class="${config.icon}"></i>
            </div>
            <div class="status-info">
                <h4>${config.title}</h4>
                <p>${config.message}</p>
            </div>
        </div>
    `;
}

// 重置连接状态
function resetConnectionStatus() {
    updateConnectionStatus('unknown');
}

// 切换密码可见性
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentNode.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// 导入配置
function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);
                populateForm(config);
                showToast('配置导入成功', 'success');
            } catch (error) {
                showToast('配置文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// 导出配置
function exportConfig() {
    const formData = collectFormData();
    
    // 移除敏感信息
    const exportData = { ...formData };
    delete exportData.clientSecret;
    delete exportData.accessToken;
    delete exportData.refreshToken;
    delete exportData.webhookSecret;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentPlatformType}-config.json`;
    link.click();
    
    showToast('配置导出成功', 'success');
}

// 重置配置
function resetConfig() {
    showConfirm(
        '确定要重置配置吗？这将清除所有已填写的信息。',
        () => {
            document.getElementById('platformConfigForm').reset();
            updateFormForPlatformType(currentPlatformType);
            resetConnectionStatus();
            showToast('配置已重置', 'info');
        }
    );
}