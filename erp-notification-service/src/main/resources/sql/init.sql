-- 通知中心数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS erp_notification DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_notification;

-- 通知表
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
    `content` TEXT NOT NULL COMMENT '通知内容',
    `type` VARCHAR(20) NOT NULL DEFAULT 'SYSTEM' COMMENT '通知类型：SYSTEM-系统通知，EMAIL-邮件，SMS-短信，PUSH-推送',
    `status` VARCHAR(20) NOT NULL DEFAULT 'UNREAD' COMMENT '通知状态：UNREAD-未读，READ-已读，DELETED-已删除',
    `priority` VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '优先级：LOW-低，NORMAL-普通，HIGH-高，URGENT-紧急',
    `recipient_id` BIGINT NOT NULL COMMENT '接收用户ID',
    `recipient_name` VARCHAR(100) NOT NULL COMMENT '接收用户名',
    `sender_id` BIGINT COMMENT '发送者ID',
    `sender_name` VARCHAR(100) COMMENT '发送者名称',
    `business_type` VARCHAR(50) COMMENT '业务类型',
    `business_id` VARCHAR(100) COMMENT '业务ID',
    `template_id` BIGINT COMMENT '模板ID',
    `read_time` DATETIME COMMENT '阅读时间',
    `expire_time` DATETIME COMMENT '过期时间',
    `extra_data` JSON COMMENT '扩展数据',
    `action_url` VARCHAR(500) COMMENT '操作链接',
    `action_text` VARCHAR(50) COMMENT '操作按钮文本',
    `icon` VARCHAR(100) COMMENT '图标',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT COMMENT '创建人ID',
    `update_by` BIGINT COMMENT '更新人ID',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    `version` INT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    INDEX `idx_recipient_id` (`recipient_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_type` (`type`),
    INDEX `idx_business` (`business_type`, `business_id`),
    INDEX `idx_create_time` (`create_time`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 通知模板表
CREATE TABLE IF NOT EXISTS `notification_templates` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `template_code` VARCHAR(100) NOT NULL COMMENT '模板编码（唯一标识）',
    `template_name` VARCHAR(200) NOT NULL COMMENT '模板名称',
    `notification_type` VARCHAR(20) NOT NULL DEFAULT 'SYSTEM' COMMENT '通知类型：SYSTEM-系统通知，EMAIL-邮件，SMS-短信，PUSH-推送',
    `title` VARCHAR(200) NOT NULL COMMENT '模板标题',
    `content` TEXT NOT NULL COMMENT '模板内容',
    `variables` JSON COMMENT '模板变量列表',
    `template_config` JSON COMMENT '模板配置',
    `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
    `description` VARCHAR(500) COMMENT '模板描述',
    `category` VARCHAR(50) COMMENT '模板分类',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT COMMENT '创建人ID',
    `update_by` BIGINT COMMENT '更新人ID',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    `version` INT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_template_code` (`template_code`, `deleted`),
    INDEX `idx_notification_type` (`notification_type`),
    INDEX `idx_enabled` (`enabled`),
    INDEX `idx_category` (`category`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- 通知规则表
CREATE TABLE IF NOT EXISTS `notification_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_name` VARCHAR(200) NOT NULL COMMENT '规则名称',
    `description` VARCHAR(500) COMMENT '规则描述',
    `event_type` VARCHAR(100) NOT NULL COMMENT '事件类型',
    `business_type` VARCHAR(50) COMMENT '业务类型',
    `rule_conditions` JSON COMMENT '规则条件',
    `template_id` BIGINT NOT NULL COMMENT '模板ID',
    `recipients` JSON COMMENT '接收者配置',
    `recipient_type` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '接收者类型：USER-用户，ROLE-角色，GROUP-用户组',
    `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
    `priority` INT NOT NULL DEFAULT 1 COMMENT '优先级（数值越大优先级越高）',
    `execution_limit` INT NOT NULL DEFAULT 0 COMMENT '执行次数限制：0-无限制',
    `execution_count` INT NOT NULL DEFAULT 0 COMMENT '已执行次数',
    `rule_config` JSON COMMENT '规则配置',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT COMMENT '创建人ID',
    `update_by` BIGINT COMMENT '更新人ID',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标志：0-未删除，1-已删除',
    `version` INT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    INDEX `idx_event_type` (`event_type`),
    INDEX `idx_business_type` (`business_type`),
    INDEX `idx_template_id` (`template_id`),
    INDEX `idx_enabled` (`enabled`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_deleted` (`deleted`),
    FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知规则表';

-- 插入默认通知模板
INSERT INTO `notification_templates` (`template_code`, `template_name`, `notification_type`, `title`, `content`, `variables`, `enabled`, `description`, `category`, `sort_order`) VALUES
('SYSTEM_WELCOME', '系统欢迎通知', 'SYSTEM', '欢迎使用ERP系统', '欢迎您，${userName}！您已成功登录ERP系统。', '["userName"]', 1, '用户首次登录系统时的欢迎通知', '系统通知', 1),
('ORDER_CREATED', '订单创建通知', 'SYSTEM', '新订单创建', '您有一个新订单：${orderNumber}，金额：${amount}元', '["orderNumber", "amount"]', 1, '订单创建时的通知', '订单通知', 2),
('INVENTORY_LOW', '库存预警通知', 'SYSTEM', '库存不足预警', '商品${productName}库存不足，当前库存：${currentStock}，请及时补货', '["productName", "currentStock"]', 1, '库存不足时的预警通知', '库存通知', 3),
('PLATFORM_ERROR', '平台异常通知', 'SYSTEM', '平台连接异常', '平台${platformName}连接异常，请检查配置', '["platformName"]', 1, '平台连接异常时的通知', '平台通知', 4);

-- 插入默认通知规则
INSERT INTO `notification_rules` (`rule_name`, `description`, `event_type`, `business_type`, `rule_conditions`, `template_id`, `recipients`, `recipient_type`, `enabled`, `priority`) VALUES
('用户登录通知', '用户首次登录时发送欢迎通知', 'USER_LOGIN', 'USER', '[{"field":"isFirstLogin","operator":"eq","value":true,"logic":"AND"}]', 1, '["ADMIN"]', 'ROLE', 1, 1),
('订单创建通知', '订单创建时通知相关人员', 'ORDER_CREATED', 'ORDER', '[{"field":"amount","operator":"gt","value":1000,"logic":"AND"}]', 2, '["ORDER_MANAGER"]', 'ROLE', 1, 2),
('库存预警通知', '库存不足时发送预警', 'INVENTORY_LOW', 'INVENTORY', '[{"field":"stock","operator":"lt","value":10,"logic":"AND"}]', 3, '["INVENTORY_MANAGER"]', 'ROLE', 1, 3);