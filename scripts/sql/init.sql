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