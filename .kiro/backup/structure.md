---
inclusion: always
---

# 项目结构与架构模式

## 微服务架构（8个核心服务）

```
ecommerce-erp-system/
├── erp-common/              # 共享工具类、DTO、常量
├── erp-gateway/             # API网关 (端口 8080)
├── erp-user-service/        # 用户/权限管理 (端口 8001)
├── erp-product-service/     # 商品目录 (端口 8002)
├── erp-order-service/       # 订单处理 (端口 8003)
├── erp-inventory-service/   # 库存管理 (端口 8004)
├── erp-platform-service/    # 电商平台集成 (端口 8005)
├── erp-logistics-service/   # 物流/跟踪 (端口 8006)
├── erp-notification-service/# 邮件/短信通知 (端口 8007)
├── erp-frontend/            # Vue 3 + TypeScript SPA
├── scripts/                 # 自动化脚本
└── docker-compose.yml       # 本地开发环境
```

## 标准服务结构模式

每个微服务都遵循以下精确结构：

```
erp-{service}-service/
├── src/main/java/com/erp/{service}/
│   ├── {Service}Application.java    # @SpringBootApplication 主类
│   ├── controller/                  # @RestController 控制器类
│   ├── service/                     # 业务逻辑接口
│   │   └── impl/                    # @Service 实现类
│   ├── entity/                      # @Entity JPA实体类 (驼峰命名)
│   ├── dto/                         # 数据传输对象
│   ├── mapper/                      # MyBatis @Mapper 接口
│   ├── config/                      # @Configuration 配置类
│   └── event/                       # Kafka事件处理器
├── src/main/resources/
│   ├── application.yml              # Spring配置
│   ├── mapper/                      # MyBatis XML映射器
│   └── sql/init.sql                 # 数据库模式 (snake_case)
├── src/test/java/                   # 单元测试（中文@DisplayName）
├── Dockerfile                       # 多阶段构建
└── pom.xml                          # Maven依赖
```

## 命名规范（严格遵守）

### Java类
- 控制器: `{Entity}Controller` (例如：`UserController`)
- 服务: `{Entity}Service` 接口 + `{Entity}ServiceImpl`
- 实体: `{Entity}` (例如：`User`, `Product`)
- DTO: `{Entity}DTO` (例如：`UserDTO`)
- 映射器: `{Entity}Mapper` (例如：`UserMapper`)

### 数据库模式
- 表: `snake_case` (例如：`user_roles`, `order_items`)
- 主键: `id` (Long类型，自增)
- 时间戳: `created_at`, `updated_at` (必需)
- 外键: `{table}_id` (例如：`user_id`)

### API端点
- 模式: `/api/{service}/{resource}`
- 示例: `/api/users`, `/api/products/{id}`, `/api/orders/{id}/items`

## 前端结构（Vue 3 + TypeScript）

```
erp-frontend/
├── src/
│   ├── views/                       # 页面组件 (PascalCase)
│   │   ├── auth/LoginView.vue       # 认证页面
│   │   ├── dashboard/DashboardView.vue
│   │   ├── users/UserManagement.vue # 业务模块
│   │   ├── products/ProductManagement.vue
│   │   ├── orders/OrderManagement.vue
│   │   ├── inventory/InventoryManagement.vue
│   │   └── settings/SystemSettings.vue
│   ├── components/
│   │   ├── common/                  # 基础组件 (BaseButton, BaseTable)
│   │   └── business/                # 业务特定组件
│   ├── stores/                      # Pinia状态管理 (user.ts, product.ts)
│   ├── api/modules/                 # 按域划分的API服务层
│   ├── types/                       # TypeScript接口
│   ├── layouts/MainLayout.vue       # 布局组件
│   └── styles/                      # SCSS变量和主题
```

## 配置模式

### Spring Boot配置文件
- `application.yml` - 基础配置
- `application-dev.yml` - 开发环境（默认）
- `application-prod.yml` - 生产环境
- `application-test.yml` - 测试环境

### 环境变量
- 数据库: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`
- Redis: `REDIS_HOST`, `REDIS_PORT`
- Kafka: `KAFKA_BOOTSTRAP_SERVERS`

## 架构模式（必需）

- **每服务一数据库**: 每个服务拥有自己的数据
- **API网关**: 单一入口点 (erp-gateway:8080)
- **事件驱动**: Kafka用于异步服务间通信
- **CQRS**: 复杂域的读写分离模型
- **断路器**: Resilience4j用于容错
- **分布式追踪**: 跨服务请求关联