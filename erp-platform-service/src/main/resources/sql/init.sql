-- 平台对接服务数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS erp_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_platform;

-- 平台基础信息表
CREATE TABLE IF NOT EXISTS platforms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    platform_name VARCHAR(100) NOT NULL COMMENT '平台名称',
    platform_type VARCHAR(50) NOT NULL COMMENT '平台类型',
    platform_code VARCHAR(50) NOT NULL UNIQUE COMMENT '平台代码',
    description VARCHAR(500) COMMENT '平台描述',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' COMMENT '平台状态',
    official_url VARCHAR(200) COMMENT '平台官网地址',
    api_base_url VARCHAR(200) COMMENT 'API基础地址',
    supported_features JSON COMMENT '支持的功能列表(JSON格式)',
    config_template JSON COMMENT '平台配置模板(JSON格式)',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    last_updated DATETIME COMMENT '最后更新时间',
    remarks VARCHAR(1000) COMMENT '备注信息',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标志',
    version INT DEFAULT 1 COMMENT '版本号',
    INDEX idx_platform_type (platform_type),
    INDEX idx_platform_code (platform_code),
    INDEX idx_status (status),
    INDEX idx_enabled (enabled),
    INDEX idx_sort_order (sort_order),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台基础信息表';

-- 平台配置表
CREATE TABLE IF NOT EXISTS platform_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    platform_id BIGINT NOT NULL COMMENT '平台ID',
    config_name VARCHAR(100) NOT NULL COMMENT '配置名称',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(50) NOT NULL COMMENT '配置类型',
    encrypted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否加密存储',
    required BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否必填',
    description VARCHAR(500) COMMENT '配置描述',
    default_value VARCHAR(500) COMMENT '默认值',
    validation_rule VARCHAR(200) COMMENT '验证规则(正则表达式)',
    config_group VARCHAR(50) COMMENT '配置分组',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    last_validated DATETIME COMMENT '最后验证时间',
    validation_status VARCHAR(50) COMMENT '验证状态',
    validation_error VARCHAR(500) COMMENT '验证错误信息',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标志',
    version INT DEFAULT 1 COMMENT '版本号',
    INDEX idx_platform_id (platform_id),
    INDEX idx_config_key (config_key),
    INDEX idx_config_type (config_type),
    INDEX idx_config_group (config_group),
    INDEX idx_enabled (enabled),
    INDEX idx_validation_status (validation_status),
    INDEX idx_deleted (deleted),
    UNIQUE KEY uk_platform_config (platform_id, config_key, deleted),
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台配置表';

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

-- 店铺权限表
CREATE TABLE IF NOT EXISTS store_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    permission_type ENUM('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER') NOT NULL COMMENT '权限类型',
    can_read BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否可读',
    can_write BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否可写',
    can_delete BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否可删除',
    can_manage BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否可管理',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    INDEX idx_user_id (user_id),
    INDEX idx_store_id (store_id),
    INDEX idx_permission_type (permission_type),
    UNIQUE KEY uk_user_store (user_id, store_id),
    FOREIGN KEY (store_id) REFERENCES platform_stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店铺权限表';

-- 店铺数据隔离配置表
CREATE TABLE IF NOT EXISTS store_data_isolation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    data_type ENUM('ORDER', 'PRODUCT', 'INVENTORY', 'CUSTOMER', 'REPORT') NOT NULL COMMENT '数据类型',
    isolation_level ENUM('STRICT', 'MODERATE', 'LOOSE') NOT NULL COMMENT '隔离级别',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    config_params TEXT COMMENT '配置参数(JSON格式)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    INDEX idx_store_id (store_id),
    INDEX idx_data_type (data_type),
    INDEX idx_isolation_level (isolation_level),
    INDEX idx_enabled (enabled),
    UNIQUE KEY uk_store_data_type (store_id, data_type),
    FOREIGN KEY (store_id) REFERENCES platform_stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店铺数据隔离配置表';

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

-- 插入平台基础数据
INSERT INTO platforms (platform_name, platform_type, platform_code, description, status, official_url, api_base_url, supported_features, config_template, enabled, sort_order) VALUES
('沃尔玛市场', 'WALMART', 'walmart', '沃尔玛全球电商平台，支持商品上传、订单管理、库存同步等功能', 'ACTIVE', 'https://marketplace.walmart.com', 'https://marketplace.walmartapis.com', '["product_upload", "order_sync", "inventory_sync", "price_update"]', '{"clientId":"", "clientSecret":"", "environment":"sandbox"}', TRUE, 1),
('亚马逊', 'AMAZON', 'amazon', '亚马逊全球电商平台，支持多站点商品销售和管理', 'ACTIVE', 'https://sellercentral.amazon.com', 'https://mws.amazonservices.com', '["product_upload", "order_sync", "inventory_sync", "fba_management"]', '{"accessKey":"", "secretKey":"", "sellerId":"", "marketplaceId":""}', TRUE, 2),
('eBay', 'EBAY', 'ebay', 'eBay全球在线拍卖及购物网站', 'ACTIVE', 'https://www.ebay.com', 'https://api.ebay.com', '["product_upload", "order_sync", "inventory_sync", "auction_management"]', '{"appId":"", "devId":"", "certId":"", "token":""}', TRUE, 3),
('速卖通', 'ALIEXPRESS', 'aliexpress', '阿里巴巴旗下跨境电商平台', 'INACTIVE', 'https://www.aliexpress.com', 'https://gw.api.alibaba.com', '["product_upload", "order_sync", "inventory_sync"]', '{"appKey":"", "appSecret":"", "accessToken":""}', TRUE, 4);

-- 插入平台配置数据
INSERT INTO platform_configs (platform_id, config_name, config_key, config_value, config_type, encrypted, required, description, config_group, sort_order, enabled) VALUES
-- 沃尔玛配置
(1, '客户端ID', 'clientId', '', 'STRING', FALSE, TRUE, '沃尔玛API客户端ID', 'auth', 1, TRUE),
(1, '客户端密钥', 'clientSecret', '', 'PASSWORD', TRUE, TRUE, '沃尔玛API客户端密钥', 'auth', 2, TRUE),
(1, '环境设置', 'environment', 'sandbox', 'STRING', FALSE, TRUE, 'API环境：sandbox或production', 'auth', 3, TRUE),
(1, '连接超时', 'connectTimeout', '30000', 'NUMBER', FALSE, FALSE, 'API连接超时时间（毫秒）', 'config', 4, TRUE),
(1, '读取超时', 'readTimeout', '60000', 'NUMBER', FALSE, FALSE, 'API读取超时时间（毫秒）', 'config', 5, TRUE),
-- 亚马逊配置
(2, '访问密钥', 'accessKey', '', 'STRING', FALSE, TRUE, '亚马逊MWS访问密钥', 'auth', 1, TRUE),
(2, '秘密密钥', 'secretKey', '', 'PASSWORD', TRUE, TRUE, '亚马逊MWS秘密密钥', 'auth', 2, TRUE),
(2, '卖家ID', 'sellerId', '', 'STRING', FALSE, TRUE, '亚马逊卖家ID', 'auth', 3, TRUE),
(2, '市场ID', 'marketplaceId', 'ATVPDKIKX0DER', 'STRING', FALSE, TRUE, '亚马逊市场ID', 'auth', 4, TRUE),
-- eBay配置
(3, '应用ID', 'appId', '', 'STRING', FALSE, TRUE, 'eBay应用ID', 'auth', 1, TRUE),
(3, '开发者ID', 'devId', '', 'STRING', FALSE, TRUE, 'eBay开发者ID', 'auth', 2, TRUE),
(3, '证书ID', 'certId', '', 'PASSWORD', TRUE, TRUE, 'eBay证书ID', 'auth', 3, TRUE),
(3, '用户令牌', 'token', '', 'PASSWORD', TRUE, TRUE, 'eBay用户令牌', 'auth', 4, TRUE);

-- 创建索引优化查询性能
CREATE INDEX idx_platform_stores_composite ON platform_stores(platform_type, status, last_sync_time);
CREATE INDEX idx_order_sync_composite ON platform_order_sync_logs(store_id, sync_status, sync_time);
CREATE INDEX idx_product_upload_composite ON platform_product_upload_logs(store_id, upload_status, upload_time);
CREATE INDEX idx_inventory_sync_composite ON platform_inventory_sync_logs(store_id, sync_status, sync_time);
CREATE INDEX idx_store_permissions_composite ON store_permissions(user_id, store_id, permission_type);
CREATE INDEX idx_data_isolation_composite ON store_data_isolation(store_id, data_type, enabled);

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