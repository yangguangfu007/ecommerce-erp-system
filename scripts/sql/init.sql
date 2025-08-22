-- ERP系统数据库初始化脚本
-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建Nacos配置数据库
CREATE DATABASE IF NOT EXISTS nacos_config DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建各个微服务数据库
CREATE DATABASE IF NOT EXISTS erp_user DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS erp_product DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS erp_order DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS erp_inventory DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS erp_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS erp_logistics DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS erp_notification DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER IF NOT EXISTS 'erp_user'@'%' IDENTIFIED BY 'erp_pass';
GRANT ALL PRIVILEGES ON erp_user.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON erp_product.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON erp_order.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON erp_inventory.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON erp_platform.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON erp_logistics.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON erp_notification.* TO 'erp_user'@'%';
GRANT ALL PRIVILEGES ON nacos_config.* TO 'erp_user'@'%';

FLUSH PRIVILEGES;

-- 初始化用户服务数据库
USE erp_user;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    nickname VARCHAR(50) COMMENT '昵称',
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

-- 插入初始数据

-- 插入默认角色
INSERT INTO sys_role (id, role_code, role_name, description, status, sort, create_by) VALUES
(1, 'ADMIN', '系统管理员', '系统管理员角色，拥有所有权限', 1, 1, 1),
(2, 'USER', '普通用户', '普通用户角色，拥有基本权限', 1, 2, 1)
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO sys_user (id, username, password, real_name, nickname, email, phone, status, locked, create_by) VALUES
(1, 'admin', '$2a$10$7JB720yubVSOfvVWbGRCu.VGaLxnqxdWfGD5rtJkjdN.YFqiOrAzG', '系统管理员', '管理员', 'admin@erp.com', '13800138000', 1, 0, 1),
(2, 'test', '$2a$10$7JB720yubVSOfvVWbGRCu.VGaLxnqxdWfGD5rtJkjdN.YFqiOrAzG', '测试用户', '测试', 'test@erp.com', '13800138001', 1, 0, 1)
ON DUPLICATE KEY UPDATE real_name = VALUES(real_name);

-- 插入管理员用户角色关联
INSERT INTO sys_user_role (id, user_id, role_id, create_by) VALUES
(1, 1, 1, 1),
(2, 2, 2, 1)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

SET FOREIGN_KEY_CHECKS = 1;