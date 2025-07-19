-- 创建商品数据库
CREATE DATABASE IF NOT EXISTS erp_product DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_product;

-- 商品分类表
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    code VARCHAR(50) NOT NULL COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '分类层级',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    description VARCHAR(500) COMMENT '分类描述',
    icon VARCHAR(200) COMMENT '分类图标',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    UNIQUE KEY uk_code (code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 商品属性模板表
CREATE TABLE IF NOT EXISTS product_attributes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '属性ID',
    name VARCHAR(100) NOT NULL COMMENT '属性名称',
    code VARCHAR(50) NOT NULL COMMENT '属性编码',
    type VARCHAR(20) NOT NULL COMMENT '属性类型',
    category_id BIGINT COMMENT '分类ID',
    required BOOLEAN DEFAULT FALSE COMMENT '是否必填',
    default_value VARCHAR(200) COMMENT '默认值',
    options TEXT COMMENT '可选值列表(JSON格式)',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    UNIQUE KEY uk_code_category (code, category_id),
    INDEX idx_category_id (category_id),
    INDEX idx_sort_order (sort_order),
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品属性模板表';

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    title VARCHAR(500) NOT NULL COMMENT '商品标题',
    description TEXT COMMENT '商品描述',
    category_id BIGINT COMMENT '分类ID',
    brand VARCHAR(100) COMMENT '品牌',
    price DECIMAL(10,2) COMMENT '销售价格',
    cost_price DECIMAL(10,2) COMMENT '成本价格',
    weight DECIMAL(8,3) COMMENT '重量(kg)',
    dimensions VARCHAR(100) COMMENT '尺寸规格',
    images JSON COMMENT '商品图片列表',
    attributes JSON COMMENT '商品属性',
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '商品状态',
    version INT DEFAULT 1 COMMENT '版本号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    UNIQUE KEY uk_sku (sku),
    INDEX idx_category_id (category_id),
    INDEX idx_brand (brand),
    INDEX idx_status (status),
    INDEX idx_price (price),
    FULLTEXT KEY ft_title_desc (title, description),
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 商品历史记录表
CREATE TABLE IF NOT EXISTS product_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '历史记录ID',
    product_id BIGINT COMMENT '商品ID',
    sku VARCHAR(100) NOT NULL COMMENT 'SKU编码',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型',
    before_data JSON COMMENT '修改前数据',
    after_data JSON COMMENT '修改后数据',
    changed_fields VARCHAR(500) COMMENT '修改字段列表',
    operator VARCHAR(50) COMMENT '操作人员',
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    remark VARCHAR(500) COMMENT '操作备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
    INDEX idx_product_id (product_id),
    INDEX idx_sku (sku),
    INDEX idx_operation_type (operation_type),
    INDEX idx_operation_time (operation_time),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品历史记录表';

-- 插入初始分类数据
INSERT INTO product_categories (name, code, parent_id, level, sort_order, description, enabled) VALUES
('电子产品', 'ELECTRONICS', 0, 1, 1, '各类电子产品', TRUE),
('手机数码', 'MOBILE_DIGITAL', 1, 2, 1, '手机及数码产品', TRUE),
('电脑办公', 'COMPUTER_OFFICE', 1, 2, 2, '电脑及办公用品', TRUE),
('家用电器', 'HOME_APPLIANCES', 0, 1, 2, '各类家用电器', TRUE),
('大家电', 'MAJOR_APPLIANCES', 4, 2, 1, '冰箱、洗衣机等大型家电', TRUE),
('小家电', 'SMALL_APPLIANCES', 4, 2, 2, '厨房小家电、生活小家电', TRUE),
('服装鞋帽', 'CLOTHING_SHOES', 0, 1, 3, '服装、鞋子、帽子等', TRUE),
('男装', 'MENS_CLOTHING', 7, 2, 1, '男士服装', TRUE),
('女装', 'WOMENS_CLOTHING', 7, 2, 2, '女士服装', TRUE),
('运动户外', 'SPORTS_OUTDOOR', 0, 1, 4, '运动用品、户外装备', TRUE);

-- 插入初始属性模板数据
INSERT INTO product_attributes (name, code, type, category_id, required, default_value, sort_order, enabled) VALUES
('颜色', 'COLOR', 'SELECT', 2, TRUE, NULL, 1, TRUE),
('存储容量', 'STORAGE', 'SELECT', 2, TRUE, NULL, 2, TRUE),
('屏幕尺寸', 'SCREEN_SIZE', 'TEXT', 2, FALSE, NULL, 3, TRUE),
('品牌型号', 'BRAND_MODEL', 'TEXT', 3, TRUE, NULL, 1, TRUE),
('处理器', 'PROCESSOR', 'TEXT', 3, FALSE, NULL, 2, TRUE),
('内存', 'MEMORY', 'SELECT', 3, FALSE, NULL, 3, TRUE),
('能效等级', 'ENERGY_LEVEL', 'SELECT', 5, FALSE, NULL, 1, TRUE),
('容量', 'CAPACITY', 'TEXT', 5, FALSE, NULL, 2, TRUE),
('尺码', 'SIZE', 'SELECT', 8, TRUE, NULL, 1, TRUE),
('材质', 'MATERIAL', 'TEXT', 8, FALSE, NULL, 2, TRUE);

-- 插入示例商品数据
INSERT INTO products (sku, title, description, category_id, brand, price, cost_price, weight, status) VALUES
('IP14-128-BLK', 'iPhone 14 128GB 黑色', 'Apple iPhone 14 智能手机 128GB存储 黑色', 2, 'Apple', 5999.00, 4500.00, 0.172, 'ACTIVE'),
('IP14-256-WHT', 'iPhone 14 256GB 白色', 'Apple iPhone 14 智能手机 256GB存储 白色', 2, 'Apple', 6899.00, 5200.00, 0.172, 'ACTIVE'),
('MBA-M2-256', 'MacBook Air M2 256GB', 'Apple MacBook Air M2芯片 256GB SSD 13.6英寸', 3, 'Apple', 9499.00, 7200.00, 1.24, 'ACTIVE'),
('HAIER-BCD-215', '海尔冰箱 BCD-215STPH', '海尔215升三门冰箱 风冷无霜', 5, '海尔', 2299.00, 1800.00, 45.5, 'ACTIVE'),
('NIKE-AIR-MAX', 'Nike Air Max 270 男鞋', 'Nike Air Max 270 男子运动鞋 黑白配色', 10, 'Nike', 899.00, 450.00, 0.8, 'ACTIVE');