-- 添加BaseEntity审计字段的迁移脚本
-- 为platforms表添加缺失的审计字段

USE erp_platform;

-- 为platforms表添加create_by和update_by字段
ALTER TABLE platforms 
ADD COLUMN create_by BIGINT COMMENT '创建人ID' AFTER create_time,
ADD COLUMN update_by BIGINT COMMENT '更新人ID' AFTER update_time;

-- 为platform_configs表添加create_by和update_by字段
ALTER TABLE platform_configs 
ADD COLUMN create_by BIGINT COMMENT '创建人ID' AFTER create_time,
ADD COLUMN update_by BIGINT COMMENT '更新人ID' AFTER update_time;

-- 更新现有数据的审计字段（设置为系统用户ID 1）
UPDATE platforms SET create_by = 1, update_by = 1 WHERE create_by IS NULL;
UPDATE platform_configs SET create_by = 1, update_by = 1 WHERE create_by IS NULL;

COMMIT;