-- 创建用户服务数据库
CREATE DATABASE IF NOT EXISTS erp_user DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_user;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(200) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '用户状态：0-禁用，1-启用',
    locked TINYINT DEFAULT 0 COMMENT '账户锁定状态：0-未锁定，1-已锁定',
    password_error_count INT DEFAULT 0 COMMENT '密码错误次数',
    lock_time DATETIME COMMENT '账户锁定时间',
    last_login_time DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(50) COMMENT '最后登录IP',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '角色状态：0-禁用，1-启用',
    sort INT DEFAULT 0 COMMENT '排序',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_role_code (role_code),
    INDEX idx_status (status),
    INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT PRIMARY KEY COMMENT '权限ID',
    permission_code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    permission_name VARCHAR(50) NOT NULL COMMENT '权限名称',
    type TINYINT NOT NULL COMMENT '权限类型：1-菜单，2-按钮，3-接口',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    path VARCHAR(200) COMMENT '权限路径',
    description VARCHAR(200) COMMENT '权限描述',
    status TINYINT DEFAULT 1 COMMENT '权限状态：0-禁用，1-启用',
    sort INT DEFAULT 0 COMMENT '排序',
    icon VARCHAR(50) COMMENT '图标',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_permission_code (permission_code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT PRIMARY KEY COMMENT '关联ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGINT PRIMARY KEY COMMENT '关联ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 插入初始数据

-- 插入默认角色
INSERT INTO sys_role (id, role_code, role_name, description, status, sort, create_by) VALUES
(1, 'ADMIN', '系统管理员', '系统管理员角色，拥有所有权限', 1, 1, 1),
(2, 'USER', '普通用户', '普通用户角色，拥有基本权限', 1, 2, 1),
(3, 'MANAGER', '业务经理', '业务经理角色，负责业务管理和运营', 1, 3, 1),
(4, 'OPERATOR', '运营人员', '运营人员角色，负责订单和商品管理', 1, 4, 1),
(5, 'WAREHOUSE', '仓库管理员', '仓库管理员角色，负责库存和物流管理', 1, 5, 1)
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 插入默认权限
INSERT INTO sys_permission (id, permission_code, permission_name, type, parent_id, path, description, status, sort, icon, create_by) VALUES
-- 菜单权限（type=1）
-- 主菜单
(200, 'menu:dashboard', '仪表板', 1, 0, '/dashboard', '系统仪表板菜单', 1, 1, 'Dashboard', 1),
(201, 'menu:user-management', '用户管理', 1, 0, '/users', '用户管理菜单', 1, 2, 'User', 1),
(202, 'menu:product-management', '商品管理', 1, 0, '/products', '商品管理菜单', 1, 3, 'Goods', 1),
(203, 'menu:order-management', '订单管理', 1, 0, '/orders', '订单管理菜单', 1, 4, 'Document', 1),
(204, 'menu:inventory-management', '库存管理', 1, 0, '/inventory', '库存管理菜单', 1, 5, 'Box', 1),
(205, 'menu:platform-management', '平台管理', 1, 0, '/platforms', '平台管理菜单', 1, 6, 'Connection', 1),
(206, 'menu:logistics-management', '物流管理', 1, 0, '/logistics', '物流管理菜单', 1, 7, 'Van', 1),
(207, 'menu:notification-management', '通知管理', 1, 0, '/notifications', '通知管理菜单', 1, 8, 'Bell', 1),
(208, 'menu:report-management', '报表管理', 1, 0, '/reports', '报表管理菜单', 1, 9, 'DataAnalysis', 1),
(209, 'menu:system-management', '系统管理', 1, 0, '/system', '系统管理菜单', 1, 10, 'Setting', 1),

-- 平台管理子菜单
(210, 'menu:platform-list', '平台列表', 1, 205, '/platforms', '平台列表菜单', 1, 1, 'List', 1),
(211, 'menu:platform-config', '平台配置', 1, 205, '/platforms/config', '平台配置菜单', 1, 2, 'Tools', 1),

-- 用户管理子菜单
(220, 'menu:user-list', '用户列表', 1, 201, '/users', '用户列表菜单', 1, 1, 'UserFilled', 1),
(221, 'menu:role-management', '角色管理', 1, 201, '/roles', '角色管理菜单', 1, 2, 'Avatar', 1),
(222, 'menu:permission-management', '权限管理', 1, 201, '/permissions', '权限管理菜单', 1, 3, 'Key', 1),

-- 商品管理子菜单
(230, 'menu:product-list', '商品列表', 1, 202, '/products', '商品列表菜单', 1, 1, 'GoodsFilled', 1),
(231, 'menu:category-management', '分类管理', 1, 202, '/categories', '分类管理菜单', 1, 2, 'Menu', 1),

-- 订单管理子菜单
(240, 'menu:order-list', '订单列表', 1, 203, '/orders', '订单列表菜单', 1, 1, 'DocumentCopy', 1),
(241, 'menu:order-processing', '订单处理', 1, 203, '/orders/processing', '订单处理菜单', 1, 2, 'Edit', 1),

-- 库存管理子菜单
(250, 'menu:inventory-list', '库存列表', 1, 204, '/inventory', '库存列表菜单', 1, 1, 'Postcard', 1),
(251, 'menu:inventory-alert', '库存预警', 1, 204, '/inventory/alerts', '库存预警菜单', 1, 2, 'Warning', 1),

-- 物流管理子菜单
(260, 'menu:logistics-orders', '物流订单', 1, 206, '/logistics', '物流订单菜单', 1, 1, 'Truck', 1),
(261, 'menu:shipping-labels', '面单管理', 1, 206, '/logistics/labels', '面单管理菜单', 1, 2, 'Tickets', 1),

-- 通知管理子菜单
(270, 'menu:notification-list', '通知列表', 1, 207, '/notifications', '通知列表菜单', 1, 1, 'Message', 1),
(271, 'menu:notification-templates', '通知模板', 1, 207, '/notifications/templates', '通知模板菜单', 1, 2, 'Document', 1),

-- 报表管理子菜单
(280, 'menu:sales-report', '销售报表', 1, 208, '/reports/sales', '销售报表菜单', 1, 1, 'TrendCharts', 1),
(281, 'menu:inventory-report', '库存报表', 1, 208, '/reports/inventory', '库存报表菜单', 1, 2, 'PieChart', 1),

-- 系统管理子菜单
(290, 'menu:system-config', '系统配置', 1, 209, '/system/config', '系统配置菜单', 1, 1, 'Tools', 1),
(291, 'menu:system-logs', '系统日志', 1, 209, '/system/logs', '系统日志菜单', 1, 2, 'Document', 1),

-- 接口权限（type=3）
-- 用户管理
(1, 'user:view', '查看用户', 3, 0, '/api/users', '查看用户列表和详情', 1, 1, '', 1),
(2, 'user:create', '创建用户', 3, 0, '/api/users', '创建新用户', 1, 2, '', 1),
(3, 'user:update', '更新用户', 3, 0, '/api/users', '更新用户信息', 1, 3, '', 1),
(4, 'user:delete', '删除用户', 3, 0, '/api/users', '删除用户', 1, 4, '', 1),
(5, 'user:assign-role', '分配角色', 3, 0, '/api/users', '为用户分配角色', 1, 5, '', 1),

-- 角色管理
(10, 'role:view', '查看角色', 3, 0, '/api/roles', '查看角色列表和详情', 1, 10, '', 1),
(11, 'role:create', '创建角色', 3, 0, '/api/roles', '创建新角色', 1, 11, '', 1),
(12, 'role:update', '更新角色', 3, 0, '/api/roles', '更新角色信息', 1, 12, '', 1),
(13, 'role:delete', '删除角色', 3, 0, '/api/roles', '删除角色', 1, 13, '', 1),
(14, 'role:assign-permission', '分配权限', 3, 0, '/api/roles', '为角色分配权限', 1, 14, '', 1),

-- 权限管理
(20, 'permission:view', '查看权限', 3, 0, '/api/permissions', '查看权限列表和详情', 1, 20, '', 1),
(21, 'permission:create', '创建权限', 3, 0, '/api/permissions', '创建新权限', 1, 21, '', 1),
(22, 'permission:update', '更新权限', 3, 0, '/api/permissions', '更新权限信息', 1, 22, '', 1),
(23, 'permission:delete', '删除权限', 3, 0, '/api/permissions', '删除权限', 1, 23, '', 1),

-- 商品管理
(30, 'product:view', '查看商品', 3, 0, '/api/products', '查看商品列表和详情', 1, 30, '', 1),
(31, 'product:create', '创建商品', 3, 0, '/api/products', '创建新商品', 1, 31, '', 1),
(32, 'product:update', '更新商品', 3, 0, '/api/products', '更新商品信息', 1, 32, '', 1),
(33, 'product:delete', '删除商品', 3, 0, '/api/products', '删除商品', 1, 33, '', 1),

-- 订单管理
(40, 'order:view', '查看订单', 3, 0, '/api/orders', '查看订单列表和详情', 1, 40, '', 1),
(41, 'order:update', '更新订单', 3, 0, '/api/orders', '更新订单状态', 1, 41, '', 1),
(42, 'order:ship', '订单发货', 3, 0, '/api/orders', '处理订单发货', 1, 42, '', 1),

-- 库存管理
(50, 'inventory:view', '查看库存', 3, 0, '/api/inventory', '查看库存信息', 1, 50, '', 1),
(51, 'inventory:update', '调整库存', 3, 0, '/api/inventory', '调整库存数量', 1, 51, '', 1),
(52, 'inventory:alert', '库存预警', 3, 0, '/api/inventory', '查看库存预警信息', 1, 52, '', 1),

-- 平台管理
(60, 'platform:view', '查看平台', 3, 0, '/api/platforms', '查看平台列表和详情', 1, 60, '', 1),
(61, 'platform:create', '创建平台', 3, 0, '/api/platforms', '创建新平台', 1, 61, '', 1),
(62, 'platform:update', '更新平台', 3, 0, '/api/platforms', '更新平台信息', 1, 62, '', 1),
(63, 'platform:delete', '删除平台', 3, 0, '/api/platforms', '删除平台', 1, 63, '', 1),
(64, 'platform:config', '平台配置', 3, 0, '/api/platforms', '配置平台参数', 1, 64, '', 1),

-- 物流管理
(70, 'logistics:view', '查看物流', 3, 0, '/api/logistics', '查看物流信息', 1, 70, '', 1),
(71, 'logistics:update', '更新物流', 3, 0, '/api/logistics', '更新物流状态', 1, 71, '', 1),
(72, 'logistics:label', '面单管理', 3, 0, '/api/logistics', '管理物流面单', 1, 72, '', 1),
(73, 'logistics:exception', '异常处理', 3, 0, '/api/logistics', '处理物流异常', 1, 73, '', 1),

-- 店铺管理
(80, 'store:view', '查看店铺', 3, 0, '/api/stores', '查看店铺信息', 1, 80, '', 1),
(81, 'store:create', '创建店铺', 3, 0, '/api/stores', '创建新店铺', 1, 81, '', 1),
(82, 'store:update', '更新店铺', 3, 0, '/api/stores', '更新店铺信息', 1, 82, '', 1),
(83, 'store:delete', '删除店铺', 3, 0, '/api/stores', '删除店铺', 1, 83, '', 1),

-- 通知管理
(90, 'notification:view', '查看通知', 3, 0, '/api/notifications', '查看通知列表', 1, 90, '', 1),
(91, 'notification:send', '发送通知', 3, 0, '/api/notifications', '发送通知消息', 1, 91, '', 1),
(92, 'notification:stats', '通知统计', 3, 0, '/api/notifications', '查看通知统计', 1, 92, '', 1),

-- 报表管理
(100, 'report:view', '查看报表', 3, 0, '/api/reports', '查看报表信息', 1, 100, '', 1),
(101, 'report:query', '数据查询', 3, 0, '/api/reports', '执行数据查询', 1, 101, '', 1),
(102, 'report:export', '导出报表', 3, 0, '/api/reports', '导出报表数据', 1, 102, '', 1),

-- 系统管理
(110, 'system:monitor', '系统监控', 3, 0, '/api/system', '查看系统监控信息', 1, 110, '', 1),
(111, 'system:setting', '系统设置', 3, 0, '/api/system', '修改系统设置', 1, 111, '', 1),

-- 商品导入
(120, 'product:import', '商品导入', 3, 0, '/api/products', '导入商品数据', 1, 120, '', 1)
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- 插入角色权限关联
INSERT INTO sys_role_permission (id, role_id, permission_id, create_by) VALUES
-- 系统管理员拥有所有权限（菜单权限 + 接口权限）
-- 菜单权限
(1000, 1, 200, 1), (1001, 1, 201, 1), (1002, 1, 202, 1), (1003, 1, 203, 1), (1004, 1, 204, 1),
(1005, 1, 205, 1), (1006, 1, 206, 1), (1007, 1, 207, 1), (1008, 1, 208, 1), (1009, 1, 209, 1),
(1010, 1, 210, 1), (1011, 1, 211, 1), (1012, 1, 220, 1), (1013, 1, 221, 1), (1014, 1, 222, 1),
(1015, 1, 230, 1), (1016, 1, 231, 1), (1017, 1, 240, 1), (1018, 1, 241, 1), (1019, 1, 250, 1),
(1020, 1, 251, 1), (1021, 1, 260, 1), (1022, 1, 261, 1), (1023, 1, 270, 1), (1024, 1, 271, 1),
(1025, 1, 280, 1), (1026, 1, 281, 1), (1027, 1, 290, 1), (1028, 1, 291, 1),

-- 接口权限
(1, 1, 1, 1), (2, 1, 2, 1), (3, 1, 3, 1), (4, 1, 4, 1), (5, 1, 5, 1),
(10, 1, 10, 1), (11, 1, 11, 1), (12, 1, 12, 1), (13, 1, 13, 1), (14, 1, 14, 1),
(20, 1, 20, 1), (21, 1, 21, 1), (22, 1, 22, 1), (23, 1, 23, 1),
(30, 1, 30, 1), (31, 1, 31, 1), (32, 1, 32, 1), (33, 1, 33, 1),
(40, 1, 40, 1), (41, 1, 41, 1), (42, 1, 42, 1),
(50, 1, 50, 1), (51, 1, 51, 1), (52, 1, 52, 1),
(60, 1, 60, 1), (61, 1, 61, 1), (62, 1, 62, 1), (63, 1, 63, 1), (64, 1, 64, 1),
(70, 1, 70, 1), (71, 1, 71, 1), (72, 1, 72, 1), (73, 1, 73, 1),
(80, 1, 80, 1), (81, 1, 81, 1), (82, 1, 82, 1), (83, 1, 83, 1),
(90, 1, 90, 1), (91, 1, 91, 1), (92, 1, 92, 1),
(100, 1, 100, 1), (101, 1, 101, 1), (102, 1, 102, 1),
(110, 1, 110, 1), (111, 1, 111, 1),
(120, 1, 120, 1),

-- 业务经理权限（全面业务管理权限）
-- 菜单权限
(2000, 3, 200, 1), (2001, 3, 201, 1), (2002, 3, 202, 1), (2003, 3, 203, 1), (2004, 3, 204, 1),
(2005, 3, 205, 1), (2006, 3, 206, 1), (2007, 3, 207, 1), (2008, 3, 208, 1),
(2009, 3, 210, 1), (2010, 3, 211, 1), (2011, 3, 220, 1), (2012, 3, 230, 1), (2013, 3, 231, 1),
(2014, 3, 240, 1), (2015, 3, 241, 1), (2016, 3, 250, 1), (2017, 3, 251, 1), (2018, 3, 260, 1),
(2019, 3, 261, 1), (2020, 3, 270, 1), (2021, 3, 271, 1), (2022, 3, 280, 1), (2023, 3, 281, 1),

-- 接口权限
(300, 3, 1, 1), (301, 3, 30, 1), (302, 3, 31, 1), (303, 3, 32, 1), (304, 3, 33, 1), (305, 3, 120, 1),
(306, 3, 40, 1), (307, 3, 41, 1), (308, 3, 42, 1), (309, 3, 50, 1), (310, 3, 51, 1), (311, 3, 52, 1),
(312, 3, 60, 1), (313, 3, 61, 1), (314, 3, 62, 1), (315, 3, 64, 1), (316, 3, 70, 1), (317, 3, 71, 1),
(318, 3, 72, 1), (319, 3, 80, 1), (320, 3, 81, 1), (321, 3, 82, 1), (322, 3, 90, 1), (323, 3, 91, 1),
(324, 3, 100, 1), (325, 3, 101, 1), (326, 3, 102, 1),

-- 运营人员权限（商品、订单、平台管理）
-- 菜单权限
(3000, 4, 200, 1), (3001, 4, 202, 1), (3002, 4, 203, 1), (3003, 4, 205, 1), (3004, 4, 208, 1),
(3005, 4, 210, 1), (3006, 4, 211, 1), (3007, 4, 230, 1), (3008, 4, 231, 1), (3009, 4, 240, 1),
(3010, 4, 241, 1), (3011, 4, 280, 1), (3012, 4, 281, 1),

-- 接口权限
(400, 4, 30, 1), (401, 4, 31, 1), (402, 4, 32, 1), (403, 4, 33, 1), (404, 4, 120, 1),
(405, 4, 40, 1), (406, 4, 41, 1), (407, 4, 42, 1),
(408, 4, 60, 1), (409, 4, 61, 1), (410, 4, 62, 1), (411, 4, 64, 1),
(412, 4, 80, 1), (413, 4, 81, 1), (414, 4, 82, 1),
(415, 4, 100, 1), (416, 4, 101, 1),

-- 仓库管理员权限（订单、库存、物流管理）
-- 菜单权限
(3000, 4, 200, 1), (3001, 4, 203, 1), (3002, 4, 204, 1), (3003, 4, 206, 1), (3004, 4, 207, 1),
(3005, 4, 240, 1), (3006, 4, 241, 1), (3007, 4, 250, 1), (3008, 4, 251, 1), (3009, 4, 260, 1),
(3010, 4, 261, 1), (3011, 4, 270, 1), (3012, 4, 271, 1),

-- 接口权限
(400, 4, 40, 1), (401, 4, 41, 1), (402, 4, 42, 1),
(403, 4, 50, 1), (404, 4, 51, 1), (405, 4, 52, 1),
(406, 4, 70, 1), (407, 4, 71, 1), (408, 4, 72, 1), (409, 4, 73, 1),
(410, 4, 90, 1), (411, 4, 91, 1),

-- 普通用户权限（基本查看权限）
-- 菜单权限
(4000, 2, 200, 1), (4001, 2, 202, 1), (4002, 2, 203, 1), (4003, 2, 204, 1), (4004, 2, 208, 1),
(4005, 2, 230, 1), (4006, 2, 240, 1), (4007, 2, 250, 1), (4008, 2, 280, 1), (4009, 2, 281, 1),

-- 接口权限
(500, 2, 30, 1), (501, 2, 40, 1), (502, 2, 50, 1), (503, 2, 100, 1)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 插入默认用户
-- 密码说明：admin123 -> $2a$10$KVwIa4oKsXV5RbvzgcwCq.L./Vud.BljT1vLsz7A0TDZz0KbVBOBW
-- 密码说明：manager123 -> $2a$10$7yQgdWSPY53HdXnXcpVDLeFidEeCaEOiS2/H/YmXnAA04Ok.x60xy  
-- 密码说明：user123 -> $2a$10$38cm9USVtBc0MpJX/lPwguFFs9727T5foioW6fCI7PzXuF/jIzwf.
INSERT INTO sys_user (id, username, password, real_name, email, phone, status, locked, create_by) VALUES
(1, 'admin', '$2a$10$KVwIa4oKsXV5RbvzgcwCq.L./Vud.BljT1vLsz7A0TDZz0KbVBOBW', '系统管理员', 'admin@erp.com', '13800138000', 1, 0, 1),
(2, 'manager', '$2a$10$7yQgdWSPY53HdXnXcpVDLeFidEeCaEOiS2/H/YmXnAA04Ok.x60xy', '业务经理', 'manager@erp.com', '13800138001', 1, 0, 1),
(3, 'user', '$2a$10$38cm9USVtBc0MpJX/lPwguFFs9727T5foioW6fCI7PzXuF/jIzwf.', '普通用户', 'user@erp.com', '13800138002', 1, 0, 1)
ON DUPLICATE KEY UPDATE real_name = VALUES(real_name);

-- 插入用户角色关联
INSERT INTO sys_user_role (id, user_id, role_id, create_by) VALUES
(1, 1, 1, 1),  -- admin -> 系统管理员
(2, 2, 3, 1),  -- manager -> 业务经理
(3, 3, 2, 1)   -- user -> 普通用户
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- 登录日志表
CREATE TABLE IF NOT EXISTS sys_login_log (
    id BIGINT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    login_ip VARCHAR(50) COMMENT '登录IP',
    login_location VARCHAR(100) COMMENT '登录地址',
    browser VARCHAR(50) COMMENT '浏览器类型',
    os VARCHAR(50) COMMENT '操作系统',
    status TINYINT DEFAULT 1 COMMENT '登录状态：0-失败，1-成功',
    login_type TINYINT DEFAULT 1 COMMENT '登录类型：1-正常登录，2-记住我登录',
    login_time DATETIME NOT NULL COMMENT '登录时间',
    logout_time DATETIME COMMENT '登出时间',
    failure_reason VARCHAR(200) COMMENT '失败原因',
    user_agent VARCHAR(500) COMMENT '用户代理',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_login_ip (login_ip),
    INDEX idx_login_time (login_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- 审计日志表
CREATE TABLE IF NOT EXISTS sys_audit_log (
    id BIGINT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) COMMENT '操作模块',
    operation_type VARCHAR(20) COMMENT '操作类型：CREATE-创建，UPDATE-更新，DELETE-删除，QUERY-查询',
    operation_desc VARCHAR(200) COMMENT '操作描述',
    method VARCHAR(10) COMMENT '请求方法',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response TEXT COMMENT '响应结果',
    operation_ip VARCHAR(50) COMMENT '操作IP',
    operation_location VARCHAR(100) COMMENT '操作地址',
    browser VARCHAR(50) COMMENT '浏览器类型',
    os VARCHAR(50) COMMENT '操作系统',
    status TINYINT DEFAULT 1 COMMENT '操作状态：0-失败，1-成功',
    error_msg VARCHAR(500) COMMENT '错误信息',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    duration BIGINT COMMENT '执行时长（毫秒）',
    user_agent VARCHAR(500) COMMENT '用户代理',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_module (module),
    INDEX idx_operation_type (operation_type),
    INDEX idx_operation_time (operation_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';