-- 创建通知服务数据库
CREATE DATABASE IF NOT EXISTS erp_notification DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_notification;

-- 通知模板表
CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_code VARCHAR(100) NOT NULL UNIQUE COMMENT '模板编码',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    notification_type VARCHAR(20) NOT NULL COMMENT '通知类型：EMAIL, SMS, SYSTEM',
    title VARCHAR(500) COMMENT '模板标题',
    content TEXT NOT NULL COMMENT '模板内容',
    variables JSON COMMENT '模板变量（JSON格式）',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE, INACTIVE',
    description VARCHAR(500) COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_template_code (template_code),
    INDEX idx_notification_type (notification_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- 通知记录表
CREATE TABLE IF NOT EXISTS notification_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_id BIGINT COMMENT '模板ID',
    notification_type VARCHAR(20) NOT NULL COMMENT '通知类型：EMAIL, SMS, SYSTEM',
    recipient VARCHAR(200) NOT NULL COMMENT '接收者',
    title VARCHAR(500) COMMENT '标题',
    content TEXT COMMENT '内容',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '发送状态：PENDING, SENDING, SUCCESS, FAILED',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retry_count INT DEFAULT 3 COMMENT '最大重试次数',
    send_time TIMESTAMP NULL COMMENT '发送时间',
    error_message TEXT COMMENT '错误信息',
    business_type VARCHAR(50) COMMENT '业务类型',
    business_id VARCHAR(100) COMMENT '业务ID',
    ext_params JSON COMMENT '扩展参数（JSON格式）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_template_id (template_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_recipient (recipient),
    INDEX idx_status (status),
    INDEX idx_business (business_type, business_id),
    INDEX idx_send_time (send_time),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知记录表';

-- 通知配置表
CREATE TABLE IF NOT EXISTS notification_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    notification_type VARCHAR(20) NOT NULL COMMENT '通知类型：EMAIL, SMS, SYSTEM',
    business_type VARCHAR(50) NOT NULL COMMENT '业务类型',
    enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    recipient VARCHAR(200) COMMENT '接收地址（邮箱或手机号）',
    frequency_limit INT DEFAULT 0 COMMENT '通知频率限制（分钟）',
    silent_time_start VARCHAR(10) COMMENT '静默时间开始（HH:mm）',
    silent_time_end VARCHAR(10) COMMENT '静默时间结束（HH:mm）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_user_type_business (user_id, notification_type, business_type),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_business_type (business_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知配置表';

-- 插入默认通知模板
INSERT INTO notification_templates (template_code, template_name, notification_type, title, content, description) VALUES
('ORDER_STATUS_CHANGE_EMAIL', '订单状态变更邮件通知', 'EMAIL', '订单状态更新通知', '您的订单 ${orderNumber} 状态已更新为：${orderStatus}。\n\n订单详情：\n商品：${productName}\n数量：${quantity}\n金额：${amount}\n\n如有疑问，请联系客服。', '订单状态变更时发送的邮件通知'),
('ORDER_STATUS_CHANGE_SMS', '订单状态变更短信通知', 'SMS', NULL, '您的订单${orderNumber}状态已更新为${orderStatus}，请及时查看。', '订单状态变更时发送的短信通知'),
('ORDER_STATUS_CHANGE_SYSTEM', '订单状态变更系统通知', 'SYSTEM', '订单状态更新', '订单 ${orderNumber} 状态已更新为：${orderStatus}', '订单状态变更时发送的系统内通知'),
('INVENTORY_ALERT_EMAIL', '库存预警邮件通知', 'EMAIL', '库存预警通知', 'SKU：${sku}\n商品名称：${productName}\n当前库存：${currentStock}\n安全库存：${safetyStock}\n\n请及时补货！', '库存不足时发送的邮件预警'),
('INVENTORY_ALERT_SMS', '库存预警短信通知', 'SMS', NULL, 'SKU ${sku} 库存不足，当前库存${currentStock}，请及时补货。', '库存不足时发送的短信预警'),
('INVENTORY_ALERT_SYSTEM', '库存预警系统通知', 'SYSTEM', '库存预警', 'SKU ${sku} 库存不足，当前库存：${currentStock}，安全库存：${safetyStock}', '库存不足时发送的系统内预警'),
('SYSTEM_ERROR_EMAIL', '系统异常邮件通知', 'EMAIL', '系统异常告警', '系统发生异常：\n\n异常类型：${errorType}\n异常信息：${errorMessage}\n发生时间：${occurTime}\n\n请及时处理！', '系统异常时发送的邮件告警'),
('SECURITY_ALERT_EMAIL', '安全事件邮件通知', 'EMAIL', '安全事件告警', '检测到安全事件：\n\n事件类型：${eventType}\n事件描述：${eventDescription}\n发生时间：${occurTime}\n用户：${username}\nIP地址：${ipAddress}\n\n请立即处理！', '安全事件发生时发送的邮件告警'),
('SECURITY_ALERT_SYSTEM', '安全事件系统通知', 'SYSTEM', '安全事件告警', '检测到安全事件：${eventType}，用户：${username}，IP：${ipAddress}', '安全事件发生时发送的系统内告警');

-- 插入默认通知配置（示例）
INSERT INTO notification_configs (user_id, notification_type, business_type, enabled, recipient) VALUES
(1, 'EMAIL', 'ORDER_STATUS_CHANGE', 1, 'admin@example.com'),
(1, 'SYSTEM', 'ORDER_STATUS_CHANGE', 1, '1'),
(1, 'EMAIL', 'INVENTORY_ALERT', 1, 'admin@example.com'),
(1, 'SYSTEM', 'INVENTORY_ALERT', 1, '1'),
(1, 'EMAIL', 'SYSTEM_ERROR', 1, 'admin@example.com'),
(1, 'EMAIL', 'SECURITY_ALERT', 1, 'admin@example.com'),
(1, 'SYSTEM', 'SECURITY_ALERT', 1, '1');