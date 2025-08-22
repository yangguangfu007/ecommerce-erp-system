/* 平台列表页面逻辑 */

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initPlatformListPage();
});

// 初始化平台列表页面
function initPlatformListPage() {
    loadPlatformList();
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索框回车事件
    const searchInput = document.getElementById('platformSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPlatforms();
            }
        });
    }
}

// 加载平台列表
async function loadPlatformList(params = {}) {
    try {
        // 显示加载状态
        const tbody = document.getElementById('platformTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>加载中...</span>
                        </div>
                    </td>
                </tr>
            `;
        }

        // 模拟API调用
        const response = await mockApi.getPlatforms(params);
        
        if (response.success) {
            renderPlatformTable(response.data.records);
            renderPagination(response.data);
        } else {
            showToast(response.message, 'error');
        }
        
    } catch (error) {
        console.error('Platform list load error:', error);
        showToast('平台列表加载失败', 'error');
    }
}

// 渲染平台表格
function renderPlatformTable(platforms) {
    const tbody = document.getElementById('platformTableBody');
    if (!tbody) return;
    
    if (platforms.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-store"></i>
                        <p>暂无平台数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = platforms.map(platform => `
        <tr>
            <td><input type="checkbox" value="${platform.id}"></td>
            <td>
                <div class="platform-info">
                    <img src="${platform.logo}" alt="${platform.name}" class="platform-logo">
                    <div class="platform-details">
                        <div class="platform-name">${platform.name}</div>
                        <div class="platform-url">${platform.url}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="platform-type-badge ${platform.type}">
                    ${getPlatformTypeName(platform.type)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${platform.status}">
                    <i class="fas fa-${getStatusIcon(platform.status)}"></i>
                    ${getStatusText(platform.status)}
                </span>
            </td>
            <td>
                <div class="sync-info">
                    <div class="sync-time">${platform.lastSync}</div>
                    <div class="sync-status ${platform.syncStatus}">${getSyncStatusText(platform.syncStatus)}</div>
                </div>
            </td>
            <td>
                <span class="count-badge">${Utils.NumberFormat.number(platform.productCount)}</span>
            </td>
            <td>
                <span class="count-badge">${Utils.NumberFormat.number(platform.orderCount)}</span>
            </td>
            <td>${platform.createdAt}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-outline" onclick="syncPlatform(${platform.id})" title="同步数据">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn btn-small btn-primary" onclick="editPlatform(${platform.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-success" onclick="viewPlatformConfig(${platform.id})" title="配置">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deletePlatform(${platform.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取平台类型名称
function getPlatformTypeName(type) {
    const typeMap = {
        'walmart': '沃尔玛',
        'amazon': '亚马逊',
        'ebay': 'eBay',
        'shopify': 'Shopify',
        'taobao': '淘宝',
        'tmall': '天猫'
    };
    return typeMap[type] || type;
}

// 获取状态图标
function getStatusIcon(status) {
    const iconMap = {
        'active': 'check-circle',
        'inactive': 'times-circle',
        'error': 'exclamation-triangle',
        'connecting': 'spinner fa-spin'
    };
    return iconMap[status] || 'question-circle';
}

// 获取状态文本
function getStatusText(status) {
    const textMap = {
        'active': '已连接',
        'inactive': '已禁用',
        'error': '连接异常',
        'connecting': '连接中'
    };
    return textMap[status] || '未知';
}

// 获取同步状态文本
function getSyncStatusText(status) {
    const textMap = {
        'success': '同步成功',
        'failed': '同步失败',
        'syncing': '同步中',
        'pending': '等待同步'
    };
    return textMap[status] || '未知';
}

// 渲染分页
function renderPagination(data) {
    const pagination = document.querySelector('.pagination-controls');
    if (!pagination) return;
    
    const totalPages = Math.ceil(data.total / data.size);
    const currentPage = data.current;
    
    let paginationHTML = `
        <button class="btn btn-outline" onclick="loadPlatformList({page: ${currentPage - 1}})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> 上一页
        </button>
        <div class="page-numbers">
    `;
    
    // 显示页码
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="loadPlatformList({page: 1})">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span class="page-ellipsis">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="loadPlatformList({page: ${i}})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="page-ellipsis">...</span>';
        }
        paginationHTML += `<button class="page-btn" onclick="loadPlatformList({page: ${totalPages}})">${totalPages}</button>`;
    }
    
    paginationHTML += `
        </div>
        <button class="btn btn-outline" onclick="loadPlatformList({page: ${currentPage + 1}})" ${currentPage === totalPages ? 'disabled' : ''}>
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

// 搜索平台
function searchPlatforms() {
    const searchValue = document.getElementById('platformSearch').value.trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    const params = {
        page: 1,
        search: searchValue,
        status: statusFilter,
        type: typeFilter
    };
    
    loadPlatformList(params);
}

// 筛选平台
function filterPlatforms() {
    searchPlatforms();
}

// 刷新平台列表
function refreshPlatformList() {
    showToast('正在刷新平台列表...', 'info');
    loadPlatformList();
}

// 添加平台
function addPlatform() {
    showToast('添加平台功能开发中...', 'info');
    // 这里应该打开添加平台的模态框或跳转到添加页面
}

// 编辑平台
function editPlatform(platformId) {
    showToast(`编辑平台 ${platformId} 功能开发中...`, 'info');
    // 这里应该打开编辑平台的模态框或跳转到编辑页面
}

// 查看平台配置
function viewPlatformConfig(platformId) {
    showToast(`查看平台 ${platformId} 配置功能开发中...`, 'info');
    // 这里应该跳转到平台配置页面
}

// 同步平台数据
async function syncPlatform(platformId) {
    try {
        showToast('正在同步平台数据...', 'info');
        
        // 模拟同步过程
        const response = await mockApi.syncPlatform(platformId);
        
        if (response.success) {
            showToast('平台数据同步成功', 'success');
            loadPlatformList(); // 刷新列表
        } else {
            showToast(response.message, 'error');
        }
        
    } catch (error) {
        console.error('Platform sync error:', error);
        showToast('平台数据同步失败', 'error');
    }
}

// 删除平台
function deletePlatform(platformId) {
    showConfirm(
        '确定要删除这个平台吗？删除后将无法恢复。',
        async () => {
            try {
                const response = await mockApi.deletePlatform(platformId);
                
                if (response.success) {
                    showToast('平台删除成功', 'success');
                    loadPlatformList(); // 刷新列表
                } else {
                    showToast(response.message, 'error');
                }
                
            } catch (error) {
                console.error('Platform delete error:', error);
                showToast('平台删除失败', 'error');
            }
        }
    );
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#platformTableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// 导出平台数据
function exportPlatforms() {
    showToast('导出平台数据功能开发中...', 'info');
    // 这里应该实现导出功能
}

// 批量操作
function batchOperation(operation) {
    const selectedIds = [];
    const checkboxes = document.querySelectorAll('#platformTableBody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedIds.push(checkbox.value);
    });
    
    if (selectedIds.length === 0) {
        showToast('请选择要操作的平台', 'warning');
        return;
    }
    
    switch (operation) {
        case 'sync':
            batchSyncPlatforms(selectedIds);
            break;
        case 'enable':
            batchEnablePlatforms(selectedIds);
            break;
        case 'disable':
            batchDisablePlatforms(selectedIds);
            break;
        case 'delete':
            batchDeletePlatforms(selectedIds);
            break;
    }
}

// 批量同步平台
async function batchSyncPlatforms(platformIds) {
    try {
        showToast(`正在同步 ${platformIds.length} 个平台...`, 'info');
        
        const response = await mockApi.batchSyncPlatforms(platformIds);
        
        if (response.success) {
            showToast('批量同步成功', 'success');
            loadPlatformList();
        } else {
            showToast(response.message, 'error');
        }
        
    } catch (error) {
        console.error('Batch sync error:', error);
        showToast('批量同步失败', 'error');
    }
}

// 批量启用平台
async function batchEnablePlatforms(platformIds) {
    try {
        const response = await mockApi.batchUpdatePlatformStatus(platformIds, 'active');
        
        if (response.success) {
            showToast('批量启用成功', 'success');
            loadPlatformList();
        } else {
            showToast(response.message, 'error');
        }
        
    } catch (error) {
        console.error('Batch enable error:', error);
        showToast('批量启用失败', 'error');
    }
}

// 批量禁用平台
async function batchDisablePlatforms(platformIds) {
    try {
        const response = await mockApi.batchUpdatePlatformStatus(platformIds, 'inactive');
        
        if (response.success) {
            showToast('批量禁用成功', 'success');
            loadPlatformList();
        } else {
            showToast(response.message, 'error');
        }
        
    } catch (error) {
        console.error('Batch disable error:', error);
        showToast('批量禁用失败', 'error');
    }
}

// 批量删除平台
function batchDeletePlatforms(platformIds) {
    showConfirm(
        `确定要删除选中的 ${platformIds.length} 个平台吗？删除后将无法恢复。`,
        async () => {
            try {
                const response = await mockApi.batchDeletePlatforms(platformIds);
                
                if (response.success) {
                    showToast('批量删除成功', 'success');
                    loadPlatformList();
                } else {
                    showToast(response.message, 'error');
                }
                
            } catch (error) {
                console.error('Batch delete error:', error);
                showToast('批量删除失败', 'error');
            }
        }
    );
}