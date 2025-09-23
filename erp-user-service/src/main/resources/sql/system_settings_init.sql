-- 系统设置相关表结构初始化脚本

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_configs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `category` VARCHAR(50) NOT NULL COMMENT '配置分类：SYSTEM-系统配置，BUSINESS-业务配置，SECURITY-安全配置，NOTIFICATION-通知配置，INTEGRATION-集成配置',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键名',
    `config_value` JSON COMMENT '配置值（JSON格式，支持复杂对象）',
    `value_type` VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '配置类型：string-字符串，number-数字，boolean-布尔值，json-JSON对象',
    `description` VARCHAR(500) COMMENT '配置描述',
    `editable` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否可编辑：1-可编辑，0-不可编辑',
    `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT COMMENT '创建人ID',
    `update_by` BIGINT COMMENT '更新人ID',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    `version` INT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`, `deleted`),
    KEY `idx_category` (`category`),
    KEY `idx_enabled` (`enabled`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 系统日志表
CREATE TABLE IF NOT EXISTS `system_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `log_level` VARCHAR(10) NOT NULL COMMENT '日志级别：DEBUG-调试，INFO-信息，WARN-警告，ERROR-错误',
    `message` TEXT NOT NULL COMMENT '日志消息',
    `module_name` VARCHAR(50) NOT NULL COMMENT '模块名称',
    `user_id` BIGINT COMMENT '操作用户ID',
    `username` VARCHAR(50) COMMENT '用户名',
    `client_ip` VARCHAR(45) COMMENT '客户端IP地址',
    `user_agent` VARCHAR(500) COMMENT '用户代理信息',
    `request_uri` VARCHAR(500) COMMENT '请求URI',
    `request_method` VARCHAR(10) COMMENT '请求方法：GET、POST、PUT、DELETE等',
    `request_params` JSON COMMENT '请求参数（JSON格式）',
    `response_status` INT COMMENT '响应状态码',
    `execution_time` BIGINT COMMENT '执行时间（毫秒）',
    `exception_message` TEXT COMMENT '异常信息',
    `stack_trace` TEXT COMMENT '异常堆栈信息',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT COMMENT '创建人ID',
    `update_by` BIGINT COMMENT '更新人ID',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    `version` INT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_log_level` (`log_level`),
    KEY `idx_module_name` (`module_name`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_create_time` (`create_time`),
    KEY `idx_response_status` (`response_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- 系统状态表
CREATE TABLE IF NOT EXISTS `system_status` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `service_name` VARCHAR(100) NOT NULL COMMENT '服务名称',
    `service_status` VARCHAR(20) NOT NULL COMMENT '服务状态：UP-正常，DOWN-异常，DEGRADED-降级',
    `service_url` VARCHAR(500) COMMENT '服务地址',
    `response_time` BIGINT COMMENT '响应时间（毫秒）',
    `last_check_time` DATETIME COMMENT '最后检查时间',
    `health_details` JSON COMMENT '健康检查详情（JSON格式）',
    `error_message` TEXT COMMENT '错误信息',
    `failure_count` INT NOT NULL DEFAULT 0 COMMENT '连续失败次数',
    `monitor_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用监控：1-启用，0-禁用',
    `monitor_interval` INT NOT NULL DEFAULT 60 COMMENT '监控间隔（秒）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT COMMENT '创建人ID',
    `update_by` BIGINT COMMENT '更新人ID',
    `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    `version` INT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_service_name` (`service_name`, `deleted`),
    KEY `idx_service_status` (`service_status`),
    KEY `idx_last_check_time` (`last_check_time`),
    KEY `idx_monitor_enabled` (`monitor_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统状态表';

-- 插入默认系统配置数据
INSERT INTO `system_configs` (`category`, `config_key`, `config_value`, `value_type`, `description`, `editable`, `enabled`, `sort_order`) VALUES
('SYSTEM', 'system.name', '{"value": "ERP管理系统"}', 'json', '系统名称', 1, 1, 1),
('SYSTEM', 'system.version', '{"value": "1.0.0"}', 'json', '系统版本', 0, 1, 2),
('SYSTEM', 'system.timezone', '{"value": "Asia/Shanghai"}', 'json', '系统时区', 1, 1, 3),
('SYSTEM', 'system.language', '{"value": "zh-CN"}', 'json', '系统语言', 1, 1, 4),
('SECURITY', 'security.session.timeout', '{"value": 3600}', 'json', '会话超时时间（秒）', 1, 1, 10),
('SECURITY', 'security.password.min.length', '{"value": 6}', 'json', '密码最小长度', 1, 1, 11),
('SECURITY', 'security.login.max.attempts', '{"value": 5}', 'json', '最大登录尝试次数', 1, 1, 12),
('BUSINESS', 'business.order.auto.confirm', '{"value": true}', 'json', '订单自动确认', 1, 1, 20),
('BUSINESS', 'business.inventory.low.threshold', '{"value": 10}', 'json', '库存预警阈值', 1, 1, 21),
('NOTIFICATION', 'notification.email.enabled', '{"value": true}', 'json', '邮件通知启用', 1, 1, 30),
('NOTIFICATION', 'notification.sms.enabled', '{"value": false}', 'json', '短信通知启用', 1, 1, 31)
ON DUPLICATE KEY UPDATE 
    `config_value` = VALUES(`config_value`),
    `description` = VALUES(`description`),
    `update_time` = CURRENT_TIMESTAMP;

-- 插入默认系统状态监控数据
INSERT INTO `system_status` (`service_name`, `service_status`, `service_url`, `monitor_enabled`, `monitor_interval`) VALUES
('用户服务', 'UP', 'http://localhost:8001/actuator/health', 1, 60),
('网关服务', 'UP', 'http://localhost:8080/actuator/health', 1, 60),
('商品服务', 'UP', 'http://localhost:8002/actuator/health', 1, 60),
('订单服务', 'UP', 'http://localhost:8003/actuator/health', 1, 60),
('库存服务', 'UP', 'http://localhost:8004/actuator/health', 1, 60),
('平台服务', 'UP', 'http://localhost:8005/actuator/health', 1, 60),
('物流服务', 'UP', 'http://localhost:8006/actuator/health', 1, 60),
('通知服务', 'UP', 'http://localhost:8007/actuator/health', 1, 60),
('MySQL数据库', 'UP', 'jdbc:mysql://localhost:3306', 1, 120),
('Redis缓存', 'UP', 'redis://localhost:6379', 1, 120),
('Kafka消息队列', 'UP', 'kafka://localhost:9092', 1, 120)
ON DUPLICATE KEY UPDATE 
    `service_url` = VALUES(`service_url`),
    `monitor_enabled` = VALUES(`monitor_enabled`),
    `monitor_interval` = VALUES(`monitor_interval`),
    `update_time` = CURRENT_TIMESTAMP;