-- H2数据库测试模式下的表结构定义
-- 用于Mapper层单元测试

-- 平台信息表
CREATE TABLE IF NOT EXISTS platforms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    platform_name VARCHAR(100) NOT NULL COMMENT '平台名称',
    platform_type VARCHAR(50) NOT NULL COMMENT '平台类型',
    platform_code VARCHAR(50) NOT NULL COMMENT '平台代码',
    description TEXT COMMENT '平台描述',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '平台状态',
    official_url VARCHAR(255) COMMENT '平台官网地址',
    api_base_url VARCHAR(255) COMMENT 'API基础地址',
    supported_features TEXT COMMENT '支持的功能列表（JSON格式）',
    config_template TEXT COMMENT '平台配置模板（JSON格式）',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
    last_updated TIMESTAMP COMMENT '最后更新时间',
    remarks TEXT COMMENT '备注信息',
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标识：0-未删除，1-已删除',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_platform_code (platform_code, deleted)
) COMMENT='平台信息表';

-- 平台配置表
CREATE TABLE IF NOT EXISTS platform_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    platform_id BIGINT NOT NULL COMMENT '平台ID',
    config_name VARCHAR(100) NOT NULL COMMENT '配置名称',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(20) NOT NULL COMMENT '配置类型',
    encrypted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否加密存储',
    required BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否必填',
    description TEXT COMMENT '配置描述',
    default_value TEXT COMMENT '默认值',
    validation_rule VARCHAR(500) COMMENT '验证规则（正则表达式）',
    config_group VARCHAR(50) COMMENT '配置分组',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    last_validated TIMESTAMP COMMENT '最后验证时间',
    validation_status VARCHAR(20) NOT NULL DEFAULT 'NOT_VALIDATED' COMMENT '验证状态',
    validation_error TEXT COMMENT '验证错误信息',
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标识：0-未删除，1-已删除',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    UNIQUE KEY uk_platform_config (platform_id, config_key, deleted),
    INDEX idx_platform_id (platform_id),
    INDEX idx_config_group (config_group),
    INDEX idx_validation_status (validation_status)
) COMMENT='平台配置表';