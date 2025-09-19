-- 测试环境初始化数据
-- 清理现有数据
DELETE FROM platform_configs WHERE 1=1;
DELETE FROM platforms WHERE 1=1;

-- 插入测试平台数据
INSERT INTO platforms (id, platform_name, platform_type, platform_code, description, status, official_url, api_base_url, supported_features, config_template, enabled, sort_order, last_updated, create_time, update_time, deleted) VALUES
(1, '沃尔玛市场', 'WALMART', 'walmart', '沃尔玛美国市场平台', 'ACTIVE', 'https://marketplace.walmart.com', 'https://marketplace.walmartapis.com', '["product_upload", "order_sync", "inventory_sync"]', '{"clientId":"","clientSecret":"","environment":"sandbox"}', TRUE, 1, NOW(), NOW(), NOW(), 0),
(2, '亚马逊美国站', 'AMAZON', 'amazon', '亚马逊美国市场平台', 'ACTIVE', 'https://sellercentral.amazon.com', 'https://mws.amazonservices.com', '["product_upload", "order_sync", "inventory_sync", "fba_management"]', '{"accessKey":"","secretKey":"","sellerId":"","marketplaceId":""}', TRUE, 2, NOW(), NOW(), NOW(), 0),
(3, 'eBay美国站', 'EBAY', 'ebay', 'eBay美国市场平台', 'INACTIVE', 'https://www.ebay.com', 'https://api.ebay.com', '["product_upload", "order_sync", "inventory_sync"]', '{"appId":"","devId":"","certId":"","token":""}', TRUE, 3, NOW(), NOW(), NOW(), 0),
(4, '测试平台', 'OTHER', 'test', '用于测试的平台', 'MAINTENANCE', 'https://test.example.com', 'https://api.test.example.com', '["test_feature"]', '{"testKey":"testValue"}', FALSE, 4, NOW(), NOW(), NOW(), 0);

-- 插入测试平台配置数据
INSERT INTO platform_configs (id, platform_id, config_name, config_key, config_value, config_type, encrypted, required, description, config_group, sort_order, enabled, validation_status, create_time, update_time, deleted) VALUES
-- 沃尔玛配置
(1, 1, '客户端ID', 'api_key', 'walmart_api_key_123', 'STRING', FALSE, TRUE, '沃尔玛API客户端ID', 'auth', 1, TRUE, 'VALID', NOW(), NOW(), 0),
(2, 1, '客户端密钥', 'api_secret', 'walmart_api_secret_456', 'PASSWORD', TRUE, TRUE, '沃尔玛API客户端密钥', 'auth', 2, TRUE, 'VALID', NOW(), NOW(), 0),
(3, 1, '环境设置', 'environment', 'sandbox', 'STRING', FALSE, TRUE, 'API环境：sandbox或production', 'config', 3, TRUE, 'VALID', NOW(), NOW(), 0),
-- 亚马逊配置
(4, 2, '访问密钥', 'access_key', 'amazon_access_key_789', 'STRING', FALSE, TRUE, '亚马逊MWS访问密钥', 'auth', 1, TRUE, 'VALID', NOW(), NOW(), 0),
(5, 2, '秘密密钥', 'secret_key', 'amazon_secret_key_012', 'PASSWORD', TRUE, TRUE, '亚马逊MWS秘密密钥', 'auth', 2, TRUE, 'VALID', NOW(), NOW(), 0),
-- eBay配置
(6, 3, '应用ID', 'app_id', 'ebay_app_id_345', 'STRING', FALSE, TRUE, 'eBay应用ID', 'auth', 1, TRUE, 'NOT_VALIDATED', NOW(), NOW(), 0),
-- 测试配置
(7, 4, '测试配置', 'test_config', 'test_value', 'STRING', FALSE, FALSE, '测试用配置', 'test', 1, TRUE, 'VALID', NOW(), NOW(), 0);