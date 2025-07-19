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
(3, 'OPERATOR', '运营人员', '运营人员角色，负责订单和商品管理', 1, 3, 1),
(4, 'WAREHOUSE', '仓库管理员', '仓库管理员角色，负责库存和物流管理', 1, 4, 1)
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 插入默认权限
INSERT INTO sys_permission (id, permission_code, permission_name, type, parent_id, path, description, status, sort, create_by) VALUES
-- 用户管理
(1, 'user:view', '查看用户', 3, 0, '/api/users', '查看用户列表和详情', 1, 1, 1),
(2, 'user:create', '创建用户', 3, 0, '/api/users', '创建新用户', 1, 2, 1),
(3, 'user:update', '更新用户', 3, 0, '/api/users', '更新用户信息', 1, 3, 1),
(4, 'user:delete', '删除用户', 3, 0, '/api/users', '删除用户', 1, 4, 1),
(5, 'user:assign-role', '分配角色', 3, 0, '/api/users', '为用户分配角色', 1, 5, 1),

-- 角色管理
(10, 'role:view', '查看角色', 3, 0, '/api/roles', '查看角色列表和详情', 1, 10, 1),
(11, 'role:create', '创建角色', 3, 0, '/api/roles', '创建新角色', 1, 11, 1),
(12, 'role:update', '更新角色', 3, 0, '/api/roles', '更新角色信息', 1, 12, 1),
(13, 'role:delete', '删除角色', 3, 0, '/api/roles', '删除角色', 1, 13, 1),
(14, 'role:assign-permission', '分配权限', 3, 0, '/api/roles', '为角色分配权限', 1, 14, 1),

-- 权限管理
(20, 'permission:view', '查看权限', 3, 0, '/api/permissions', '查看权限列表和详情', 1, 20, 1),
(21, 'permission:create', '创建权限', 3, 0, '/api/permissions', '创建新权限', 1, 21, 1),
(22, 'permission:update', '更新权限', 3, 0, '/api/permissions', '更新权限信息', 1, 22, 1),
(23, 'permission:delete', '删除权限', 3, 0, '/api/permissions', '删除权限', 1, 23, 1),

-- 商品管理
(30, 'product:view', '查看商品', 3, 0, '/api/products', '查看商品列表和详情', 1, 30, 1),
(31, 'product:create', '创建商品', 3, 0, '/api/products', '创建新商品', 1, 31, 1),
(32, 'product:update', '更新商品', 3, 0, '/api/products', '更新商品信息', 1, 32, 1),
(33, 'product:delete', '删除商品', 3, 0, '/api/products', '删除商品', 1, 33, 1),

-- 订单管理
(40, 'order:view', '查看订单', 3, 0, '/api/orders', '查看订单列表和详情', 1, 40, 1),
(41, 'order:update', '更新订单', 3, 0, '/api/orders', '更新订单状态', 1, 41, 1),
(42, 'order:ship', '订单发货', 3, 0, '/api/orders', '处理订单发货', 1, 42, 1),

-- 库存管理
(50, 'inventory:view', '查看库存', 3, 0, '/api/inventory', '查看库存信息', 1, 50, 1),
(51, 'inventory:update', '调整库存', 3, 0, '/api/inventory', '调整库存数量', 1, 51, 1)
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- 插入角色权限关联
INSERT INTO sys_role_permission (id, role_id, permission_id, create_by) VALUES
-- 系统管理员拥有所有权限
(1, 1, 1, 1), (2, 1, 2, 1), (3, 1, 3, 1), (4, 1, 4, 1), (5, 1, 5, 1),
(10, 1, 10, 1), (11, 1, 11, 1), (12, 1, 12, 1), (13, 1, 13, 1), (14, 1, 14, 1),
(20, 1, 20, 1), (21, 1, 21, 1), (22, 1, 22, 1), (23, 1, 23, 1),
(30, 1, 30, 1), (31, 1, 31, 1), (32, 1, 32, 1), (33, 1, 33, 1),
(40, 1, 40, 1), (41, 1, 41, 1), (42, 1, 42, 1),
(50, 1, 50, 1), (51, 1, 51, 1),

-- 运营人员权限
(100, 3, 30, 1), (101, 3, 31, 1), (102, 3, 32, 1), (103, 3, 33, 1),
(104, 3, 40, 1), (105, 3, 41, 1), (106, 3, 42, 1),

-- 仓库管理员权限
(200, 4, 40, 1), (201, 4, 41, 1), (202, 4, 42, 1),
(203, 4, 50, 1), (204, 4, 51, 1)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 插入默认管理员用户
INSERT INTO sys_user (id, username, password, real_name, email, phone, status, locked, create_by) VALUES
(1, 'admin', '$2a$10$7JB720yubVSOfvVWbGRCu.VGaLxnqxdWfGD5rtJkjdN.YFqiOrAzG', '系统管理员', 'admin@erp.com', '13800138000', 1, 0, 1)
ON DUPLICATE KEY UPDATE real_name = VALUES(real_name);

-- 插入管理员用户角色关联
INSERT INTO sys_user_role (id, user_id, role_id, create_by) VALUES
(1, 1, 1, 1)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);