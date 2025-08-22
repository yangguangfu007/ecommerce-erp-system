-- 库存服务数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS erp_inventory DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_inventory;

-- 库存表
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    available_quantity INT DEFAULT 0 COMMENT '可用库存数量',
    reserved_quantity INT DEFAULT 0 COMMENT '预留库存数量',
    total_quantity INT DEFAULT 0 COMMENT '总库存数量',
    safety_stock INT DEFAULT 0 COMMENT '安全库存',
    warehouse_location VARCHAR(100) COMMENT '仓库位置',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记：0-未删除，1-已删除',
    UNIQUE KEY uk_sku_store (sku, store_id),
    INDEX idx_sku (sku),
    INDEX idx_store_id (store_id),
    INDEX idx_available_quantity (available_quantity),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

-- 库存变动记录表
CREATE TABLE inventory_transaction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    transaction_id VARCHAR(100) NOT NULL COMMENT '事务ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    transaction_type ENUM('INBOUND', 'OUTBOUND', 'RESERVE', 'RELEASE', 'ADJUST') NOT NULL COMMENT '变动类型',
    quantity INT NOT NULL COMMENT '变动数量',
    before_quantity INT NOT NULL COMMENT '变动前数量',
    after_quantity INT NOT NULL COMMENT '变动后数量',
    reference_id VARCHAR(100) COMMENT '关联业务ID(订单ID等)',
    reference_type VARCHAR(50) COMMENT '关联业务类型',
    reason VARCHAR(500) COMMENT '变动原因',
    operator VARCHAR(100) COMMENT '操作人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记：0-未删除，1-已删除',
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_sku (sku),
    INDEX idx_store_id (store_id),
    INDEX idx_reference_id (reference_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存变动记录表';

-- 库存预警配置表
CREATE TABLE inventory_alert_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    store_id BIGINT COMMENT '店铺ID，NULL表示全局配置',
    alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK') NOT NULL COMMENT '预警类型',
    threshold_value INT NOT NULL COMMENT '阈值',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    notification_emails TEXT COMMENT '通知邮箱列表，逗号分隔',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_sku_store_type (sku, store_id, alert_type),
    INDEX idx_sku (sku),
    INDEX idx_store_id (store_id),
    INDEX idx_alert_type (alert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存预警配置表';

-- 库存盘点表
CREATE TABLE inventory_check (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    check_id VARCHAR(100) NOT NULL COMMENT '盘点单号',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    system_quantity INT NOT NULL COMMENT '系统库存数量',
    actual_quantity INT NOT NULL COMMENT '实际盘点数量',
    difference_quantity INT NOT NULL COMMENT '差异数量',
    check_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' COMMENT '盘点状态',
    check_reason VARCHAR(500) COMMENT '盘点原因',
    checker VARCHAR(100) NOT NULL COMMENT '盘点人',
    approver VARCHAR(100) COMMENT '审批人',
    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '盘点时间',
    approve_time TIMESTAMP NULL COMMENT '审批时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_check_id (check_id),
    INDEX idx_sku (sku),
    INDEX idx_store_id (store_id),
    INDEX idx_check_status (check_status),
    INDEX idx_check_time (check_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存盘点表';

-- 库存分配规则表
CREATE TABLE inventory_allocation_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    store_id BIGINT NOT NULL COMMENT '店铺ID',
    allocation_type ENUM('PERCENTAGE', 'FIXED', 'PRIORITY') NOT NULL COMMENT '分配类型',
    allocation_value INT NOT NULL COMMENT '分配值(百分比或固定数量)',
    priority_level INT DEFAULT 0 COMMENT '优先级(数字越小优先级越高)',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_sku_store (sku, store_id),
    INDEX idx_sku (sku),
    INDEX idx_store_id (store_id),
    INDEX idx_priority_level (priority_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存分配规则表';

-- 插入初始化数据

-- 插入库存数据（假设店铺ID：1-沃尔玛，2-亚马逊，3-eBay）
INSERT INTO inventory (sku, store_id, available_quantity, reserved_quantity, total_quantity, safety_stock, warehouse_location) VALUES
-- iPhone 14 128GB 黑色
('IP14-128-BLK', 1, 85, 15, 100, 20, 'A-01-001'),
('IP14-128-BLK', 2, 120, 30, 150, 25, 'A-01-002'),
('IP14-128-BLK', 3, 45, 5, 50, 15, 'A-01-003'),

-- iPhone 14 256GB 白色
('IP14-256-WHT', 1, 60, 10, 70, 15, 'A-01-004'),
('IP14-256-WHT', 2, 90, 20, 110, 20, 'A-01-005'),
('IP14-256-WHT', 3, 25, 5, 30, 10, 'A-01-006'),

-- MacBook Air M2 256GB
('MBA-M2-256', 1, 35, 5, 40, 10, 'B-02-001'),
('MBA-M2-256', 2, 55, 15, 70, 15, 'B-02-002'),
('MBA-M2-256', 3, 18, 2, 20, 8, 'B-02-003'),

-- 海尔冰箱 BCD-215STPH
('HAIER-BCD-215', 1, 12, 3, 15, 5, 'C-03-001'),
('HAIER-BCD-215', 2, 8, 2, 10, 3, 'C-03-002'),
('HAIER-BCD-215', 3, 5, 0, 5, 2, 'C-03-003'),

-- Nike Air Max 270 男鞋
('NIKE-AIR-MAX', 1, 180, 20, 200, 30, 'D-04-001'),
('NIKE-AIR-MAX', 2, 240, 60, 300, 50, 'D-04-002'),
('NIKE-AIR-MAX', 3, 75, 15, 90, 20, 'D-04-003');

-- 插入库存变动记录（初始入库记录）
INSERT INTO inventory_transaction (transaction_id, sku, store_id, transaction_type, quantity, before_quantity, after_quantity, reference_type, reason, operator) VALUES
-- iPhone 14 128GB 黑色 初始入库
('TXN-2024010001', 'IP14-128-BLK', 1, 'INBOUND', 100, 0, 100, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010002', 'IP14-128-BLK', 2, 'INBOUND', 150, 0, 150, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010003', 'IP14-128-BLK', 3, 'INBOUND', 50, 0, 50, 'PURCHASE', '初始库存入库', 'system'),

-- iPhone 14 256GB 白色 初始入库
('TXN-2024010004', 'IP14-256-WHT', 1, 'INBOUND', 70, 0, 70, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010005', 'IP14-256-WHT', 2, 'INBOUND', 110, 0, 110, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010006', 'IP14-256-WHT', 3, 'INBOUND', 30, 0, 30, 'PURCHASE', '初始库存入库', 'system'),

-- MacBook Air M2 256GB 初始入库
('TXN-2024010007', 'MBA-M2-256', 1, 'INBOUND', 40, 0, 40, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010008', 'MBA-M2-256', 2, 'INBOUND', 70, 0, 70, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010009', 'MBA-M2-256', 3, 'INBOUND', 20, 0, 20, 'PURCHASE', '初始库存入库', 'system'),

-- 海尔冰箱 初始入库
('TXN-2024010010', 'HAIER-BCD-215', 1, 'INBOUND', 15, 0, 15, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010011', 'HAIER-BCD-215', 2, 'INBOUND', 10, 0, 10, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010012', 'HAIER-BCD-215', 3, 'INBOUND', 5, 0, 5, 'PURCHASE', '初始库存入库', 'system'),

-- Nike Air Max 270 初始入库
('TXN-2024010013', 'NIKE-AIR-MAX', 1, 'INBOUND', 200, 0, 200, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010014', 'NIKE-AIR-MAX', 2, 'INBOUND', 300, 0, 300, 'PURCHASE', '初始库存入库', 'system'),
('TXN-2024010015', 'NIKE-AIR-MAX', 3, 'INBOUND', 90, 0, 90, 'PURCHASE', '初始库存入库', 'system');

-- 插入一些预留记录（模拟订单预留）
INSERT INTO inventory_transaction (transaction_id, sku, store_id, transaction_type, quantity, before_quantity, after_quantity, reference_id, reference_type, reason, operator) VALUES
('TXN-2024010016', 'IP14-128-BLK', 1, 'RESERVE', 15, 100, 85, 'ORD-2024010001', 'ORDER', '订单预留库存', 'system'),
('TXN-2024010017', 'IP14-128-BLK', 2, 'RESERVE', 30, 150, 120, 'ORD-2024010002', 'ORDER', '订单预留库存', 'system'),
('TXN-2024010018', 'IP14-256-WHT', 1, 'RESERVE', 10, 70, 60, 'ORD-2024010003', 'ORDER', '订单预留库存', 'system'),
('TXN-2024010019', 'MBA-M2-256', 2, 'RESERVE', 15, 70, 55, 'ORD-2024010004', 'ORDER', '订单预留库存', 'system'),
('TXN-2024010020', 'NIKE-AIR-MAX', 1, 'RESERVE', 20, 200, 180, 'ORD-2024010005', 'ORDER', '订单预留库存', 'system');

-- 插入库存预警配置
INSERT INTO inventory_alert_config (sku, store_id, alert_type, threshold_value, notification_emails) VALUES
-- 全局默认配置
('DEFAULT', NULL, 'LOW_STOCK', 10, 'admin@example.com'),
('DEFAULT', NULL, 'OUT_OF_STOCK', 0, 'admin@example.com,warehouse@example.com'),

-- 特定商品配置
('IP14-128-BLK', NULL, 'LOW_STOCK', 20, 'admin@example.com,mobile@example.com'),
('IP14-256-WHT', NULL, 'LOW_STOCK', 15, 'admin@example.com,mobile@example.com'),
('MBA-M2-256', NULL, 'LOW_STOCK', 8, 'admin@example.com,computer@example.com'),
('HAIER-BCD-215', NULL, 'LOW_STOCK', 3, 'admin@example.com,appliance@example.com'),
('NIKE-AIR-MAX', NULL, 'LOW_STOCK', 25, 'admin@example.com,sports@example.com');

-- 插入库存分配规则
INSERT INTO inventory_allocation_rule (sku, store_id, allocation_type, allocation_value, priority_level) VALUES
-- iPhone 14 128GB 黑色分配规则
('IP14-128-BLK', 1, 'PERCENTAGE', 30, 2),
('IP14-128-BLK', 2, 'PERCENTAGE', 50, 1),
('IP14-128-BLK', 3, 'PERCENTAGE', 20, 3),

-- iPhone 14 256GB 白色分配规则
('IP14-256-WHT', 1, 'PERCENTAGE', 35, 2),
('IP14-256-WHT', 2, 'PERCENTAGE', 45, 1),
('IP14-256-WHT', 3, 'PERCENTAGE', 20, 3),

-- MacBook Air M2分配规则
('MBA-M2-256', 1, 'PERCENTAGE', 25, 3),
('MBA-M2-256', 2, 'PERCENTAGE', 60, 1),
('MBA-M2-256', 3, 'PERCENTAGE', 15, 2),

-- 海尔冰箱分配规则
('HAIER-BCD-215', 1, 'PERCENTAGE', 50, 1),
('HAIER-BCD-215', 2, 'PERCENTAGE', 35, 2),
('HAIER-BCD-215', 3, 'PERCENTAGE', 15, 3),

-- Nike运动鞋分配规则
('NIKE-AIR-MAX', 1, 'PERCENTAGE', 35, 2),
('NIKE-AIR-MAX', 2, 'PERCENTAGE', 50, 1),
('NIKE-AIR-MAX', 3, 'PERCENTAGE', 15, 3);

-- 插入一些盘点记录
INSERT INTO inventory_check (check_id, sku, store_id, system_quantity, actual_quantity, difference_quantity, check_status, check_reason, checker, approver, check_time, approve_time) VALUES
('CHK-2024010001', 'IP14-128-BLK', 1, 100, 98, -2, 'APPROVED', '月度盘点', 'warehouse_staff', 'warehouse_manager', '2024-01-15 10:00:00', '2024-01-15 14:30:00'),
('CHK-2024010002', 'NIKE-AIR-MAX', 2, 300, 302, 2, 'APPROVED', '月度盘点', 'warehouse_staff', 'warehouse_manager', '2024-01-15 11:00:00', '2024-01-15 15:00:00'),
('CHK-2024010003', 'MBA-M2-256', 3, 20, 19, -1, 'PENDING', '月度盘点', 'warehouse_staff', NULL, '2024-01-20 09:00:00', NULL);