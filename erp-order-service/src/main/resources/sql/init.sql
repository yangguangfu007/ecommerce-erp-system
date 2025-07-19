-- 订单服务数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS erp_order DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_order;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_id VARCHAR(100) UNIQUE NOT NULL COMMENT '订单编号',
    platform_order_id VARCHAR(100) COMMENT '平台订单ID',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    customer_name VARCHAR(100) COMMENT '客户姓名',
    customer_email VARCHAR(100) COMMENT '客户邮箱',
    customer_phone VARCHAR(50) COMMENT '客户电话',
    shipping_address JSON COMMENT '收货地址',
    billing_address JSON COMMENT '账单地址',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    currency VARCHAR(10) DEFAULT 'USD' COMMENT '货币类型',
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING' COMMENT '订单状态',
    platform_status VARCHAR(50) COMMENT '平台状态',
    order_date TIMESTAMP NOT NULL COMMENT '下单时间',
    confirm_date TIMESTAMP NULL COMMENT '确认时间',
    ship_date TIMESTAMP NULL COMMENT '发货时间',
    delivery_date TIMESTAMP NULL COMMENT '送达时间',
    tracking_number VARCHAR(100) COMMENT '物流单号',
    shipping_method VARCHAR(50) COMMENT '配送方式',
    payment_method VARCHAR(50) COMMENT '支付方式',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING' COMMENT '支付状态',
    notes TEXT COMMENT '订单备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) COMMENT '创建人',
    updated_by VARCHAR(100) COMMENT '更新人',
    INDEX idx_order_id (order_id),
    INDEX idx_platform_order_id (platform_order_id),
    INDEX idx_store_id (store_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_tracking_number (tracking_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    product_title VARCHAR(500) COMMENT '商品标题',
    product_image VARCHAR(500) COMMENT '商品图片',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '单价',
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '小计',
    discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '折扣金额',
    tax_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '税费',
    platform_item_id VARCHAR(100) COMMENT '平台商品ID',
    attributes JSON COMMENT '商品属性',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_sku (sku),
    INDEX idx_platform_item_id (platform_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- 订单状态变更记录表
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    from_status VARCHAR(50) COMMENT '原状态',
    to_status VARCHAR(50) NOT NULL COMMENT '新状态',
    reason VARCHAR(500) COMMENT '变更原因',
    operator VARCHAR(100) COMMENT '操作人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_to_status (to_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单状态变更记录表';

-- 订单库存锁定记录表
CREATE TABLE IF NOT EXISTS order_inventory_locks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '锁定ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    quantity INT NOT NULL COMMENT '锁定数量',
    lock_status ENUM('LOCKED', 'RELEASED', 'CONSUMED') DEFAULT 'LOCKED' COMMENT '锁定状态',
    lock_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '锁定时间',
    release_time TIMESTAMP NULL COMMENT '释放时间',
    expire_time TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY uk_order_sku (order_id, sku),
    INDEX idx_order_id (order_id),
    INDEX idx_sku (sku),
    INDEX idx_lock_status (lock_status),
    INDEX idx_expire_time (expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单库存锁定记录表';

-- 订单事件表（用于消息队列重试）
CREATE TABLE IF NOT EXISTS order_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '事件ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    event_type VARCHAR(50) NOT NULL COMMENT '事件类型',
    event_data JSON COMMENT '事件数据',
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '处理状态',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retry INT DEFAULT 3 COMMENT '最大重试次数',
    next_retry_time TIMESTAMP NULL COMMENT '下次重试时间',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_event_type (event_type),
    INDEX idx_status (status),
    INDEX idx_next_retry_time (next_retry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单事件表';

-- 插入测试数据
INSERT INTO orders (order_id, platform_order_id, store_id, customer_name, customer_email, customer_phone, 
                   shipping_address, total_amount, currency, status, order_date) VALUES
('ORD-2024-001', 'WM-12345', 1, 'John Doe', 'john.doe@email.com', '+1-555-0123',
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zipCode": "10001", "country": "US"}',
 99.99, 'USD', 'PENDING', '2024-01-15 10:30:00'),
('ORD-2024-002', 'WM-12346', 1, 'Jane Smith', 'jane.smith@email.com', '+1-555-0124',
 '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zipCode": "90210", "country": "US"}',
 149.99, 'USD', 'CONFIRMED', '2024-01-15 11:45:00');

INSERT INTO order_items (order_id, sku, product_title, quantity, unit_price, total_price) VALUES
(1, 'SKU-001', 'Wireless Bluetooth Headphones', 1, 99.99, 99.99),
(2, 'SKU-002', 'Smart Phone Case', 2, 24.99, 49.98),
(2, 'SKU-003', 'USB-C Cable', 1, 19.99, 19.99);