-- 平台对接服务数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS erp_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_platform;

-- 平台店铺表
CREATE TABLE IF NOT EXISTS platform_stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    store_name VARCHAR(100) NOT NULL COMMENT '店铺名称',
    platform_type VARCHAR(50) NOT NULL COMMENT '平台类型',
    platform_store_id VARCHAR(100) COMMENT '平台店铺ID',
    api_credentials TEXT COMMENT 'API凭证(JSON格式)',
    status ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    last_sync_time DATETIME COMMENT '最后同步时间',
    connection_status BOOLEAN COMMENT '连接状态',
    last_connection_check DATETIME COMMENT '最后连接检查时间',
    config_data TEXT COMMENT '配置信息(JSON格式)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    INDEX idx_platform_type (platform_type),
    INDEX idx_status (status),
    INDEX idx_store_name (store_name),
    INDEX idx_platform_store_id (platform_store_id),
    INDEX idx_last_sync_time (last_sync_time),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台店铺表';

-- 平台订单同步记录表
CREATE TABLE IF NOT EXISTS platform_order_sync_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    platform_order_id VARCHAR(100) NOT NULL COMMENT '平台订单ID',
    sync_status ENUM('SUCCESS', 'FAILED', 'PROCESSING') NOT NULL COMMENT '同步状态',
    sync_time DATETIME NOT NULL COMMENT '同步时间',
    error_message TEXT COMMENT '错误信息',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    order_data JSON COMMENT '订单数据',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_store_id (store_id),
    INDEX idx_platform_order_id (platform_order_id),
    INDEX idx_sync_status (sync_status),
    INDEX idx_sync_time (sync_time),
    FOREIGN KEY (store_id) REFERENCES platform_stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台订单同步记录表';

-- 平台商品上传记录表
CREATE TABLE IF NOT EXISTS platform_product_upload_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    sku VARCHAR(100) NOT NULL COMMENT '商品SKU',
    batch_id VARCHAR(50) COMMENT '批次ID',
    upload_status ENUM('SUCCESS', 'FAILED', 'PROCESSING') NOT NULL COMMENT '上传状态',
    upload_time DATETIME NOT NULL COMMENT '上传时间',
    error_message TEXT COMMENT '错误信息',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    product_data JSON COMMENT '商品数据',
    platform_response JSON COMMENT '平台响应',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_store_id (store_id),
    INDEX idx_sku (sku),
    INDEX idx_batch_id (batch_id),
    INDEX idx_upload_status (upload_status),
    INDEX idx_upload_time (upload_time),
    FOREIGN KEY (store_id) REFERENCES platform_stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台商品上传记录表';

-- 平台库存同步记录表
CREATE TABLE IF NOT EXISTS platform_inventory_sync_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    sku VARCHAR(100) NOT NULL COMMENT '商品SKU',
    sync_type ENUM('MANUAL', 'AUTO') NOT NULL COMMENT '同步类型',
    old_quantity INT COMMENT '原库存数量',
    new_quantity INT NOT NULL COMMENT '新库存数量',
    sync_status ENUM('SUCCESS', 'FAILED', 'PROCESSING') NOT NULL COMMENT '同步状态',
    sync_time DATETIME NOT NULL COMMENT '同步时间',
    error_message TEXT COMMENT '错误信息',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_store_id (store_id),
    INDEX idx_sku (sku),
    INDEX idx_sync_type (sync_type),
    INDEX idx_sync_status (sync_status),
    INDEX idx_sync_time (sync_time),
    FOREIGN KEY (store_id) REFERENCES platform_stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台库存同步记录表';

-- 平台API调用日志表
CREATE TABLE IF NOT EXISTS platform_api_call_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    store_id BIGINT COMMENT '店铺ID',
    api_endpoint VARCHAR(200) NOT NULL COMMENT 'API端点',
    http_method VARCHAR(10) NOT NULL COMMENT 'HTTP方法',
    request_headers JSON COMMENT '请求头',
    request_body TEXT COMMENT '请求体',
    response_status INT COMMENT '响应状态码',
    response_headers JSON COMMENT '响应头',
    response_body TEXT COMMENT '响应体',
    execution_time INT COMMENT '执行时间(毫秒)',
    call_time DATETIME NOT NULL COMMENT '调用时间',
    success BOOLEAN NOT NULL COMMENT '是否成功',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_store_id (store_id),
    INDEX idx_api_endpoint (api_endpoint),
    INDEX idx_call_time (call_time),
    INDEX idx_success (success),
    FOREIGN KEY (store_id) REFERENCES platform_stores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台API调用日志表';

-- 插入初始数据
INSERT INTO platform_stores (store_name, platform_type, platform_store_id, api_credentials, status, config_data, created_by) VALUES
('沃尔玛测试店铺', 'WALMART', 'walmart-test-store-001', '{"clientId":"test-client-id","clientSecret":"test-client-secret"}', 'ACTIVE', '{"autoSync":true,"syncInterval":600}', 'system'),
('亚马逊测试店铺', 'AMAZON', 'amazon-test-store-001', '{"accessKey":"test-access-key","secretKey":"test-secret-key","sellerId":"test-seller-id"}', 'INACTIVE', '{"autoSync":false,"syncInterval":1800}', 'system');

-- 创建索引优化查询性能
CREATE INDEX idx_platform_stores_composite ON platform_stores(platform_type, status, last_sync_time);
CREATE INDEX idx_order_sync_composite ON platform_order_sync_logs(store_id, sync_status, sync_time);
CREATE INDEX idx_product_upload_composite ON platform_product_upload_logs(store_id, upload_status, upload_time);
CREATE INDEX idx_inventory_sync_composite ON platform_inventory_sync_logs(store_id, sync_status, sync_time);

-- 创建视图用于统计查询
CREATE VIEW v_platform_store_stats AS
SELECT 
    ps.id,
    ps.store_name,
    ps.platform_type,
    ps.status,
    ps.connection_status,
    ps.last_sync_time,
    COALESCE(order_stats.total_orders, 0) as total_orders,
    COALESCE(order_stats.success_orders, 0) as success_orders,
    COALESCE(product_stats.total_products, 0) as total_products,
    COALESCE(product_stats.success_products, 0) as success_products,
    COALESCE(inventory_stats.total_syncs, 0) as total_inventory_syncs,
    COALESCE(inventory_stats.success_syncs, 0) as success_inventory_syncs
FROM platform_stores ps
LEFT JOIN (
    SELECT 
        store_id,
        COUNT(*) as total_orders,
        SUM(CASE WHEN sync_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_orders
    FROM platform_order_sync_logs
    WHERE sync_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY store_id
) order_stats ON ps.id = order_stats.store_id
LEFT JOIN (
    SELECT 
        store_id,
        COUNT(*) as total_products,
        SUM(CASE WHEN upload_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_products
    FROM platform_product_upload_logs
    WHERE upload_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY store_id
) product_stats ON ps.id = product_stats.store_id
LEFT JOIN (
    SELECT 
        store_id,
        COUNT(*) as total_syncs,
        SUM(CASE WHEN sync_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_syncs
    FROM platform_inventory_sync_logs
    WHERE sync_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY store_id
) inventory_stats ON ps.id = inventory_stats.store_id;

COMMIT;