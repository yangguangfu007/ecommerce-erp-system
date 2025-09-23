-- 通知中心数据库迁移脚本
-- 更新现有表结构以符合新的设计

USE erp_notification;

-- 创建新的notifications表
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

-- 更新notification_templates表结构
-- 添加缺失的字段（忽略错误如果字段已存在）
SET @sql = 'ALTER TABLE `notification_templates` ADD COLUMN `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT ''是否启用：1-启用，0-禁用'' AFTER `variables`';
SET @sql_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'enabled');
SET @sql = IF(@sql_check = 0, @sql, 'SELECT ''Column enabled already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'ALTER TABLE `notification_templates` ADD COLUMN `template_config` JSON COMMENT ''模板配置'' AFTER `enabled`';
SET @sql_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'template_config');
SET @sql = IF(@sql_check = 0, @sql, 'SELECT ''Column template_config already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'ALTER TABLE `notification_templates` ADD COLUMN `category` VARCHAR(50) COMMENT ''模板分类'' AFTER `description`';
SET @sql_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'category');
SET @sql = IF(@sql_check = 0, @sql, 'SELECT ''Column category already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'ALTER TABLE `notification_templates` ADD COLUMN `sort_order` INT NOT NULL DEFAULT 0 COMMENT ''排序号'' AFTER `category`';
SET @sql_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'sort_order');
SET @sql = IF(@sql_check = 0, @sql, 'SELECT ''Column sort_order already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新status字段为enabled字段（如果status字段存在且enabled字段存在）
UPDATE `notification_templates` SET `enabled` = CASE WHEN `status` = 'ACTIVE' THEN 1 ELSE 0 END 
WHERE EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'status')
AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'enabled');

-- 删除旧的status字段（如果存在）
SET @sql = 'ALTER TABLE `notification_templates` DROP COLUMN `status`';
SET @sql_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'erp_notification' AND TABLE_NAME = 'notification_templates' AND COLUMN_NAME = 'status');
SET @sql = IF(@sql_check > 0, @sql, 'SELECT ''Column status does not exist''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 创建notification_rules表
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
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知规则表';

-- 插入默认通知模板（如果不存在）
INSERT IGNORE INTO `notification_templates` (`template_code`, `template_name`, `notification_type`, `title`, `content`, `variables`, `enabled`, `description`, `category`, `sort_order`) VALUES
('SYSTEM_WELCOME', '系统欢迎通知', 'SYSTEM', '欢迎使用ERP系统', '欢迎您，${userName}！您已成功登录ERP系统。', '["userName"]', 1, '用户首次登录系统时的欢迎通知', '系统通知', 1),
('ORDER_CREATED', '订单创建通知', 'SYSTEM', '新订单创建', '您有一个新订单：${orderNumber}，金额：${amount}元', '["orderNumber", "amount"]', 1, '订单创建时的通知', '订单通知', 2),
('INVENTORY_LOW', '库存预警通知', 'SYSTEM', '库存不足预警', '商品${productName}库存不足，当前库存：${currentStock}，请及时补货', '["productName", "currentStock"]', 1, '库存不足时的预警通知', '库存通知', 3),
('PLATFORM_ERROR', '平台异常通知', 'SYSTEM', '平台连接异常', '平台${platformName}连接异常，请检查配置', '["platformName"]', 1, '平台连接异常时的通知', '平台通知', 4);

-- 插入默认通知规则（如果不存在）
INSERT IGNORE INTO `notification_rules` (`rule_name`, `description`, `event_type`, `business_type`, `rule_conditions`, `template_id`, `recipients`, `recipient_type`, `enabled`, `priority`) VALUES
('用户登录通知', '用户首次登录时发送欢迎通知', 'USER_LOGIN', 'USER', '[{"field":"isFirstLogin","operator":"eq","value":true,"logic":"AND"}]', 1, '["ADMIN"]', 'ROLE', 1, 1),
('订单创建通知', '订单创建时通知相关人员', 'ORDER_CREATED', 'ORDER', '[{"field":"amount","operator":"gt","value":1000,"logic":"AND"}]', 2, '["ORDER_MANAGER"]', 'ROLE', 1, 2),
('库存预警通知', '库存不足时发送预警', 'INVENTORY_LOW', 'INVENTORY', '[{"field":"stock","operator":"lt","value":10,"logic":"AND"}]', 3, '["INVENTORY_MANAGER"]', 'ROLE', 1, 3);