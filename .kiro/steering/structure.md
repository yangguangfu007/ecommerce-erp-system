# 项目结构与组织

## 根目录结构

```
ecommerce-erp-system/
├── README.md                    # 项目文档
├── pom.xml                      # Maven父POM
├── package.json                 # 根目录package.json，用于E2E工具
├── Makefile                     # 构建编排命令
├── docker-compose.yml           # 本地开发环境
├── checkstyle.xml              # Java代码规范配置
├── .gitignore                  # Git忽略规则
└── .kiro/                      # Kiro AI助手配置
```

## 后端服务 (微服务)

每个服务遵循相同的Maven结构：

```
erp-{service-name}/
├── pom.xml                     # 服务特定的Maven配置
├── Dockerfile                  # 容器构建配置
├── src/
│   ├── main/
│   │   ├── java/com/erp/       # Java源代码
│   │   └── resources/          # 配置文件
│   └── test/                   # 单元测试和集成测试
├── target/                     # 构建输出 (生成)
└── logs/                       # 服务日志 (运行时)
```

### 服务模块

- **erp-common**: 共享工具类、DTO和通用配置
- **erp-gateway**: Spring Cloud Gateway (API网关)
- **erp-user-service**: 用户管理和认证
- **erp-product-service**: 商品目录管理
- **erp-order-service**: 订单处理和管理
- **erp-inventory-service**: 库存跟踪和预警
- **erp-platform-service**: 外部平台集成 (沃尔玛)
- **erp-logistics-service**: 物流和配送 (云途)
- **erp-notification-service**: 通知和消息

## 前端应用

```
erp-frontend/
├── package.json                # NPM依赖和脚本
├── vite.config.ts             # Vite构建配置
├── tsconfig.json              # TypeScript配置
├── playwright.config.ts       # E2E测试配置
├── src/
│   ├── main.ts                # 应用入口点
│   ├── App.vue                # 根Vue组件
│   ├── api/                   # API客户端模块
│   │   ├── modules/           # 服务特定的API调用
│   │   ├── request.ts         # HTTP客户端配置
│   │   └── types.ts           # API类型定义
│   ├── components/            # 可复用Vue组件
│   │   ├── business/          # 业务特定组件
│   │   ├── common/            # 通用UI组件
│   │   └── charts/            # 图表组件
│   ├── views/                 # 页面级组件
│   │   ├── dashboard/         # 仪表板页面
│   │   ├── orders/            # 订单管理页面
│   │   ├── products/          # 商品管理页面
│   │   ├── inventory/         # 库存页面
│   │   └── auth/              # 认证页面
│   ├── stores/                # Pinia状态管理
│   ├── router/                # Vue Router配置
│   ├── types/                 # TypeScript类型定义
│   ├── utils/                 # 工具函数
│   └── styles/                # 全局样式和主题
├── tests/                     # 测试文件
│   ├── e2e/                   # 端到端测试
│   └── api/                   # API集成测试
└── dist/                      # 构建输出 (生成)
```

## 基础设施与部署

```
k8s/                           # Kubernetes清单
├── infrastructure/            # 数据库、缓存、消息队列
├── monitoring/               # Prometheus、Grafana配置
└── namespace.yaml            # Kubernetes命名空间

helm/                         # Helm图表
└── erp-system/              # 主应用图表
    ├── Chart.yaml           # 图表元数据
    ├── values.yaml          # 默认值
    ├── values-dev.yaml      # 开发环境
    ├── values-prod.yaml     # 生产环境
    └── templates/           # Kubernetes模板

scripts/                     # 自动化脚本
├── deploy/                  # 部署脚本
├── backup/                  # 数据库备份脚本
├── sql/                     # 数据库初始化
└── start-*.sh              # 服务启动脚本
```

## 文档

```
docs/                        # 项目文档
├── project-overview.md      # 系统架构概述
├── quick-start-guide.md     # 快速开始指南
├── development-guide.md     # 开发设置和指南
├── deployment-guide.md      # 生产环境部署指南
├── api-documentation.md     # API参考文档
├── user-guide.md           # 最终用户文档
└── troubleshooting.md      # 常见问题和解决方案
```

## 命名规范

### Java (后端)
- **包名**: `com.erp.{service}.{layer}` (例如: `com.erp.user.controller`)
- **类名**: PascalCase (例如: `UserController`, `OrderService`)
- **方法名**: camelCase (例如: `getUserById`, `createOrder`)
- **常量**: UPPER_SNAKE_CASE (例如: `MAX_RETRY_COUNT`)

### TypeScript/Vue (前端)
- **文件名**: kebab-case (例如: `user-list.vue`, `order-service.ts`)
- **组件名**: PascalCase (例如: `UserList`, `OrderForm`)
- **变量名**: camelCase (例如: `userName`, `orderList`)
- **常量**: UPPER_SNAKE_CASE (例如: `API_BASE_URL`)

### 数据库
- **表名**: snake_case (例如: `user_accounts`, `order_items`)
- **列名**: snake_case (例如: `user_id`, `created_at`)
- **索引**: `idx_{table}_{column}` (例如: `idx_users_email`)

## 配置管理

- **环境变量**: 本地开发使用`.env`文件
- **Spring配置文件**: `dev`, `test`, `prod`用于不同环境
- **Nacos配置**: 微服务的集中化配置
- **Kubernetes ConfigMaps**: 环境特定配置

## 端口分配

- **前端**: 3000 (开发服务器)
- **网关**: 8080 (API网关)
- **服务**: 8001-8007 (各个微服务)
- **基础设施**: 3306 (MySQL), 6379 (Redis), 9092 (Kafka)
- **监控**: 9090 (Prometheus), 3001 (Grafana)