/* 商品列表页面逻辑 */

class ProductListManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalCount = 0;
        this.currentFilters = {};
        this.selectedProducts = new Set();
        this.sortField = '';
        this.sortOrder = 'asc';
        this.editingProductId = null;
        this.productImages = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadProducts();
    }
    
    bindEvents() {
        // 搜索输入框回车事件
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });
        
        // 筛选器变化事件
        document.getElementById('category-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('status-filter').addEventListener('change', () => {
            this.applyFilters();
        });
    }
    
    bindDragDropEvents() {
        const uploadArea = document.querySelector('.image-upload-area');
        if (!uploadArea) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });
        
        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleImageUpload(files);
        }, false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    async loadProducts() {
        this.showLoading();
        
        try {
            const params = {
                page: this.currentPage,
                size: this.pageSize,
                keyword: this.currentFilters.keyword || '',
                category: this.currentFilters.category || '',
                status: this.currentFilters.status || ''
            };
            
            const response = await mockApi.getProducts(params);
            
            if (response.success) {
                this.totalCount = response.data.total;
                this.renderProductTable(response.data.records);
                this.renderPagination(response.data);
                this.updateTableCount();
            } else {
                this.showError('加载商品数据失败');
            }
        } catch (error) {
            console.error('加载商品数据失败:', error);
            this.showError('加载商品数据失败');
        }
        
        this.hideLoading();
    }
    
    renderProductTable(products) {
        const tbody = document.getElementById('products-table-body');
        const table = document.getElementById('products-table');
        const emptyState = document.getElementById('empty-state');
        
        if (products.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            document.getElementById('pagination-container').style.display = 'none';
            return;
        }
        
        table.style.display = 'table';
        emptyState.style.display = 'none';
        document.getElementById('pagination-container').style.display = 'flex';
        
        tbody.innerHTML = products.map(product => `
            <tr data-product-id="${product.id}">
                <td>
                    <input type="checkbox" class="row-select" value="${product.id}" 
                           onchange="productListManager.toggleRowSelection(this)">
                </td>
                <td>
                    <div class="product-image">
                        <img src="${product.images[0] || '../../assets/images/products/placeholder.svg'}" 
                             alt="${product.name}" 
                             onerror="this.src='../../assets/images/products/placeholder.svg'; this.style.opacity='0.7';">
                    </div>
                </td>
                <td>
                    <span class="product-sku">${product.sku}</span>
                </td>
                <td>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-attributes">
                            ${this.formatAttributes(product.attributes)}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="product-category">${product.category}</span>
                </td>
                <td>
                    <span class="product-price">¥${product.price.toFixed(2)}</span>
                </td>
                <td>
                    <span class="product-stock ${this.getStockClass(product.stock)}">${product.stock}</span>
                </td>
                <td>
                    <span class="status-badge ${product.status}">
                        ${product.status === 'active' ? '上架' : '下架'}
                    </span>
                </td>
                <td>
                    <span class="date-text">${this.formatDate(product.createdAt)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="productListManager.editProduct(${product.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="productListManager.viewProduct(${product.id})" title="查看">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="productListManager.deleteProduct(${product.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    formatAttributes(attributes) {
        if (!attributes) return '';
        
        const attrs = [];
        if (attributes.brand) attrs.push(`品牌: ${attributes.brand}`);
        if (attributes.color) attrs.push(`颜色: ${attributes.color}`);
        if (attributes.storage) attrs.push(`存储: ${attributes.storage}`);
        if (attributes.processor) attrs.push(`处理器: ${attributes.processor}`);
        if (attributes.memory) attrs.push(`内存: ${attributes.memory}`);
        
        return attrs.slice(0, 2).join(' | ');
    }
    
    getStockClass(stock) {
        if (stock === 0) return 'stock-out';
        if (stock <= 10) return 'stock-low';
        return 'stock-normal';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }
    
    renderPagination(data) {
        const container = document.getElementById('pagination-controls');
        const totalPages = Math.ceil(data.total / data.size);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = `
            <button class="btn btn-outline" onclick="productListManager.goToPage(${data.current - 1})" 
                    ${data.current <= 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
            <div class="page-numbers">
        `;
        
        // 生成页码按钮
        const startPage = Math.max(1, data.current - 2);
        const endPage = Math.min(totalPages, data.current + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="productListManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === data.current ? 'active' : ''}" 
                        onclick="productListManager.goToPage(${i})">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="productListManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        paginationHTML += `
            </div>
            <button class="btn btn-outline" onclick="productListManager.goToPage(${data.current + 1})" 
                    ${data.current >= totalPages ? 'disabled' : ''}>
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        container.innerHTML = paginationHTML;
        
        // 更新分页信息
        const start = (data.current - 1) * data.size + 1;
        const end = Math.min(data.current * data.size, data.total);
        document.getElementById('pagination-info').textContent = 
            `显示第 ${start}-${end} 条，共 ${data.total} 条记录`;
    }
    
    updateTableCount() {
        document.getElementById('total-count').textContent = this.totalCount;
    }
    
    goToPage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.loadProducts();
    }
    
    applyFilters() {
        this.currentFilters = {
            keyword: document.getElementById('search-input').value.trim(),
            category: document.getElementById('category-filter').value,
            status: document.getElementById('status-filter').value
        };
        
        this.currentPage = 1;
        this.loadProducts();
    }
    
    resetFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('status-filter').value = '';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadProducts();
    }
    
    toggleRowSelection(checkbox) {
        const productId = parseInt(checkbox.value);
        
        if (checkbox.checked) {
            this.selectedProducts.add(productId);
        } else {
            this.selectedProducts.delete(productId);
        }
        
        this.updateBatchActions();
        this.updateSelectAllState();
    }
    
    toggleSelectAll(checkbox) {
        const rowCheckboxes = document.querySelectorAll('.row-select');
        
        rowCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            const productId = parseInt(cb.value);
            
            if (checkbox.checked) {
                this.selectedProducts.add(productId);
            } else {
                this.selectedProducts.delete(productId);
            }
        });
        
        this.updateBatchActions();
    }
    
    updateSelectAllState() {
        const selectAllCheckbox = document.querySelector('.select-all');
        const rowCheckboxes = document.querySelectorAll('.row-select');
        const checkedCount = document.querySelectorAll('.row-select:checked').length;
        
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
    
    updateBatchActions() {
        const batchDeleteBtn = document.getElementById('batch-delete-btn');
        batchDeleteBtn.disabled = this.selectedProducts.size === 0;
    }
    
    showAddProductModal() {
        this.editingProductId = null;
        this.productImages = [];
        document.getElementById('product-modal-title').textContent = '新增商品';
        this.resetProductForm();
        document.getElementById('product-modal-overlay').style.display = 'flex';
        
        // 延迟绑定拖拽事件，确保DOM已渲染
        setTimeout(() => {
            this.bindDragDropEvents();
        }, 100);
    }
    
    editProduct(productId) {
        this.editingProductId = productId;
        document.getElementById('product-modal-title').textContent = '编辑商品';
        
        // 查找商品数据
        const product = mockData.products.find(p => p.id === productId);
        if (product) {
            this.fillProductForm(product);
        }
        
        document.getElementById('product-modal-overlay').style.display = 'flex';
        
        // 延迟绑定拖拽事件，确保DOM已渲染
        setTimeout(() => {
            this.bindDragDropEvents();
        }, 100);
    }
    
    viewProduct(productId) {
        // 这里可以实现查看商品详情的逻辑
        showToast('查看商品详情功能待实现', 'info');
    }
    
    deleteProduct(productId) {
        this.selectedProducts.clear();
        this.selectedProducts.add(productId);
        this.showDeleteModal();
    }
    
    batchDeleteProducts() {
        if (this.selectedProducts.size === 0) {
            showToast('请选择要删除的商品', 'warning');
            return;
        }
        
        this.showDeleteModal();
    }
    
    showDeleteModal() {
        document.getElementById('delete-modal-overlay').style.display = 'flex';
    }
    
    closeDeleteModal() {
        document.getElementById('delete-modal-overlay').style.display = 'none';
    }
    
    confirmDelete() {
        // 模拟删除操作
        showToast(`成功删除 ${this.selectedProducts.size} 个商品`, 'success');
        
        // 从模拟数据中删除
        this.selectedProducts.forEach(productId => {
            const index = mockData.products.findIndex(p => p.id === productId);
            if (index > -1) {
                mockData.products.splice(index, 1);
            }
        });
        
        this.selectedProducts.clear();
        this.closeDeleteModal();
        this.loadProducts();
    }
    
    closeProductModal() {
        document.getElementById('product-modal-overlay').style.display = 'none';
        this.resetProductForm();
    }
    
    resetProductForm() {
        document.getElementById('product-form').reset();
        this.clearFormErrors();
        this.clearImagePreviews();
        this.clearDynamicAttributes();
    }
    
    fillProductForm(product) {
        document.getElementById('product-sku').value = product.sku;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-status').value = product.status;
        
        // 填充图片
        this.productImages = product.images || [];
        this.displayProductImages(this.productImages);
        
        if (product.attributes) {
            document.getElementById('product-brand').value = product.attributes.brand || '';
            document.getElementById('product-color').value = product.attributes.color || '';
            
            // 填充动态属性
            this.displayDynamicAttributes(product.attributes);
        }
    }
    
    saveProduct() {
        if (!this.validateProductForm()) {
            return;
        }
        
        const formData = this.getProductFormData();
        
        if (this.editingProductId) {
            // 编辑商品
            const index = mockData.products.findIndex(p => p.id === this.editingProductId);
            if (index > -1) {
                mockData.products[index] = { ...mockData.products[index], ...formData };
                showToast('商品更新成功', 'success');
            }
        } else {
            // 新增商品
            const newProduct = {
                id: Date.now(),
                ...formData,
                images: ['assets/images/products/placeholder.jpg'],
                createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            mockData.products.unshift(newProduct);
            showToast('商品添加成功', 'success');
        }
        
        this.closeProductModal();
        this.loadProducts();
    }
    
    getProductFormData() {
        const brand = document.getElementById('product-brand').value.trim();
        const color = document.getElementById('product-color').value.trim();
        
        // 获取基本属性
        const attributes = {};
        if (brand) attributes.brand = brand;
        if (color) attributes.color = color;
        
        // 获取动态属性
        const dynamicAttrs = this.getDynamicAttributes();
        Object.assign(attributes, dynamicAttrs);
        
        return {
            sku: document.getElementById('product-sku').value.trim(),
            name: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            status: document.getElementById('product-status').value,
            attributes: attributes,
            images: this.productImages || ['assets/images/products/placeholder.jpg']
        };
    }
    
    validateProductForm() {
        this.clearFormErrors();
        let isValid = true;
        
        const sku = document.getElementById('product-sku').value.trim();
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const price = document.getElementById('product-price').value;
        const stock = document.getElementById('product-stock').value;
        const status = document.getElementById('product-status').value;
        
        // SKU验证
        if (!sku) {
            this.showFieldError('sku', 'SKU不能为空');
            isValid = false;
        } else if (sku.length < 3) {
            this.showFieldError('sku', 'SKU长度不能少于3个字符');
            isValid = false;
        } else if (!/^[A-Z0-9]+$/.test(sku)) {
            this.showFieldError('sku', 'SKU只能包含大写字母和数字');
            isValid = false;
        } else {
            // 检查SKU是否重复
            const existingProduct = mockData.products.find(p => 
                p.sku === sku && p.id !== this.editingProductId
            );
            if (existingProduct) {
                this.showFieldError('sku', 'SKU已存在');
                isValid = false;
            }
        }
        
        // 商品名称验证
        if (!name) {
            this.showFieldError('name', '商品名称不能为空');
            isValid = false;
        } else if (name.length < 2) {
            this.showFieldError('name', '商品名称长度不能少于2个字符');
            isValid = false;
        } else if (name.length > 100) {
            this.showFieldError('name', '商品名称长度不能超过100个字符');
            isValid = false;
        }
        
        // 分类验证
        if (!category) {
            this.showFieldError('category', '请选择商品分类');
            isValid = false;
        }
        
        // 价格验证
        if (!price) {
            this.showFieldError('price', '请输入商品价格');
            isValid = false;
        } else {
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue < 0) {
                this.showFieldError('price', '请输入有效的价格');
                isValid = false;
            } else if (priceValue > 999999.99) {
                this.showFieldError('price', '价格不能超过999,999.99');
                isValid = false;
            }
        }
        
        // 库存验证
        if (!stock && stock !== '0') {
            this.showFieldError('stock', '请输入库存数量');
            isValid = false;
        } else {
            const stockValue = parseInt(stock);
            if (isNaN(stockValue) || stockValue < 0) {
                this.showFieldError('stock', '请输入有效的库存数量');
                isValid = false;
            } else if (stockValue > 999999) {
                this.showFieldError('stock', '库存数量不能超过999,999');
                isValid = false;
            }
        }
        
        // 状态验证
        if (!status) {
            this.showFieldError('status', '请选择商品状态');
            isValid = false;
        }
        
        // 图片验证
        if (!this.productImages || this.productImages.length === 0) {
            showToast('请至少上传一张商品图片', 'warning');
            isValid = false;
        }
        
        // 动态属性验证
        const dynamicAttrs = this.getDynamicAttributes();
        for (const [key, value] of Object.entries(dynamicAttrs)) {
            if (!key.trim() || !value.trim()) {
                showToast('请完善所有属性信息或删除空白属性', 'warning');
                isValid = false;
                break;
            }
        }
        
        return isValid;
    }
    
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`product-${fieldName}`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
    
    clearFormErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        const inputElements = document.querySelectorAll('.form-input, .form-select');
        
        errorElements.forEach(el => {
            el.style.display = 'none';
        });
        
        inputElements.forEach(el => {
            el.classList.remove('error');
        });
    }
    
    exportProducts() {
        // 模拟导出功能
        showToast('商品数据导出功能待实现', 'info');
    }
    
    sortTable(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }
        
        // 更新排序图标
        this.updateSortIcons();
        
        // 重新加载数据（这里简化处理，实际应该在API中处理排序）
        this.loadProducts();
    }
    
    updateSortIcons() {
        // 清除所有排序图标
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        // 设置当前排序字段的图标
        const currentSortIcon = document.querySelector(`th[onclick="sortTable('${this.sortField}')"] i`);
        if (currentSortIcon) {
            currentSortIcon.className = this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    }
    
    showLoading() {
        document.getElementById('loading-state').style.display = 'flex';
        document.getElementById('products-table').style.display = 'none';
        document.getElementById('empty-state').style.display = 'none';
    }
    
    hideLoading() {
        document.getElementById('loading-state').style.display = 'none';
    }
    
    showError(message) {
        showToast(message, 'error');
    }
    
    // 图片路径处理方法
    getImagePath(imagePath) {
        if (!imagePath) return '';
        
        // 如果已经是完整的相对路径或绝对路径，直接返回
        if (imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('../')) {
            return imagePath;
        }
        
        // 获取当前页面的路径深度
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(segment => segment && segment !== 'index.html');
        
        // 计算需要返回的层级数
        let backLevels = 0;
        
        // 如果在子目录中（如 pages/products/），需要返回上级目录
        if (pathSegments.length > 1) {
            backLevels = pathSegments.length - 1;
        }
        
        // 构建正确的相对路径
        const prefix = '../'.repeat(backLevels);
        return prefix + imagePath;
    }
    
    // 处理图片加载错误
    handleImageError(imgElement, fallbackPath) {
        fallbackPath = fallbackPath || 'assets/images/products/placeholder.svg';
        
        if (imgElement.dataset.errorHandled) return; // 防止无限循环
        
        imgElement.dataset.errorHandled = 'true';
        imgElement.src = this.getImagePath(fallbackPath);
        imgElement.alt = '图片加载失败';
        imgElement.style.border = '1px solid #e74c3c';
        imgElement.style.opacity = '0.7';
    }
    
    // 图片处理方法
    displayProductImages(images) {
        const container = document.getElementById('image-preview-list');
        container.innerHTML = '';
        
        images.forEach((imageUrl, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.draggable = true;
            imageItem.dataset.index = index;
            imageItem.innerHTML = `
                <img src="${this.getImagePath(imageUrl)}" alt="商品图片 ${index + 1}" onclick="productListManager.previewImage('${imageUrl}')" onerror="productListManager.handleImageError(this)">
                <button type="button" class="image-remove-btn" onclick="productListManager.removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-index">${index + 1}</div>
                <div class="image-drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
            `;
            
            // 添加拖拽事件
            imageItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                imageItem.classList.add('dragging');
            });
            
            imageItem.addEventListener('dragend', () => {
                imageItem.classList.remove('dragging');
            });
            
            imageItem.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            imageItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const dropIndex = parseInt(imageItem.dataset.index);
                
                if (dragIndex !== dropIndex) {
                    this.reorderImages(dragIndex, dropIndex);
                }
            });
            
            container.appendChild(imageItem);
        });
        
        // 如果没有图片，显示提示
        if (images.length === 0) {
            container.innerHTML = '<div class="no-images-hint">暂无图片，点击下方区域上传</div>';
        }
    }
    
    reorderImages(fromIndex, toIndex) {
        const images = [...this.productImages];
        const [movedImage] = images.splice(fromIndex, 1);
        images.splice(toIndex, 0, movedImage);
        
        this.productImages = images;
        this.displayProductImages(this.productImages);
        showToast('图片顺序已调整', 'success');
    }
    
    clearImagePreviews() {
        document.getElementById('image-preview-list').innerHTML = '';
        this.productImages = [];
    }
    
    removeImage(index) {
        if (!this.productImages) this.productImages = [];
        this.productImages.splice(index, 1);
        this.displayProductImages(this.productImages);
    }
    
    handleImageUpload(files) {
        if (!this.productImages) this.productImages = [];
        
        // 限制最多上传5张图片
        const remainingSlots = 5 - this.productImages.length;
        if (remainingSlots <= 0) {
            showToast('最多只能上传5张图片', 'warning');
            return;
        }
        
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        
        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast('图片大小不能超过5MB', 'warning');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.productImages.push(e.target.result);
                    this.displayProductImages(this.productImages);
                    showToast('图片上传成功', 'success');
                };
                reader.readAsDataURL(file);
            } else {
                showToast('请选择有效的图片文件', 'warning');
            }
        });
        
        // 清空文件输入框
        document.getElementById('image-upload-input').value = '';
    }
    
    previewImage(imageUrl) {
        // 创建图片预览模态框
        const modal = document.createElement('div');
        modal.className = 'image-preview-modal';
        modal.innerHTML = `
            <div class="image-preview-backdrop" onclick="this.parentElement.remove()">
                <div class="image-preview-container" onclick="event.stopPropagation()">
                    <img src="${this.getImagePath(imageUrl)}" alt="图片预览" onerror="productListManager.handleImageError(this)">
                    <button class="image-preview-close" onclick="this.closest('.image-preview-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加ESC键关闭功能
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    // 动态属性处理方法
    displayDynamicAttributes(attributes) {
        this.clearDynamicAttributes();
        
        if (!attributes) return;
        
        // 排除基本属性
        const basicAttrs = ['brand', 'color'];
        Object.keys(attributes).forEach(key => {
            if (!basicAttrs.includes(key)) {
                this.addDynamicAttribute(key, attributes[key]);
            }
        });
    }
    
    clearDynamicAttributes() {
        document.getElementById('dynamic-attributes').innerHTML = '';
    }
    
    addDynamicAttribute(key = '', value = '') {
        const container = document.getElementById('dynamic-attributes');
        const attributeId = Date.now() + Math.random();
        
        const attributeItem = document.createElement('div');
        attributeItem.className = 'dynamic-attribute-item';
        attributeItem.dataset.attributeId = attributeId;
        attributeItem.innerHTML = `
            <input type="text" class="form-input attribute-key-input" placeholder="属性名称" value="${key}">
            <input type="text" class="form-input attribute-value-input" placeholder="属性值" value="${value}">
            <button type="button" class="remove-attribute-btn" onclick="productListManager.removeDynamicAttribute('${attributeId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(attributeItem);
    }
    
    removeDynamicAttribute(attributeId) {
        const item = document.querySelector(`[data-attribute-id="${attributeId}"]`);
        if (item) {
            item.remove();
        }
    }
    
    getDynamicAttributes() {
        const attributes = {};
        const attributeItems = document.querySelectorAll('.dynamic-attribute-item');
        
        attributeItems.forEach(item => {
            const keyInput = item.querySelector('.attribute-key-input');
            const valueInput = item.querySelector('.attribute-value-input');
            
            const key = keyInput.value.trim();
            const value = valueInput.value.trim();
            
            if (key && value) {
                attributes[key] = value;
            }
        });
        
        return attributes;
    }
}

// 全局函数
function showAddProductModal() {
    productListManager.showAddProductModal();
}

function exportProducts() {
    productListManager.exportProducts();
}

function batchDeleteProducts() {
    productListManager.batchDeleteProducts();
}

function resetFilters() {
    productListManager.resetFilters();
}

function applyFilters() {
    productListManager.applyFilters();
}

function toggleSelectAll(checkbox) {
    productListManager.toggleSelectAll(checkbox);
}

function sortTable(field) {
    productListManager.sortTable(field);
}

function closeProductModal() {
    productListManager.closeProductModal();
}

function saveProduct() {
    productListManager.saveProduct();
}

function closeDeleteModal() {
    productListManager.closeDeleteModal();
}

function confirmDelete() {
    productListManager.confirmDelete();
}

// 图片上传相关函数
function triggerImageUpload() {
    document.getElementById('image-upload-input').click();
}

function handleImageUpload(event) {
    productListManager.handleImageUpload(event.target.files);
}

// 动态属性相关函数
function addDynamicAttribute() {
    productListManager.addDynamicAttribute();
}

// 初始化商品列表管理器
let productListManager;

document.addEventListener('DOMContentLoaded', function() {
    productListManager = new ProductListManager();
});