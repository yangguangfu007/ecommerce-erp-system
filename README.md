# 电商 ERP 系统

[![GitHub stars](https://img.shields.io/github/stars/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/network)
[![GitHub issues](https://img.shields.io/github/issues/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/issues)
[![GitHub license](https://img.shields.io/github/license/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/blob/main/LICENSE)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=flat-square)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg?style=flat-square)](https://spring.io/projects/spring-boot)

> 🚀 **GitHub 仓库**: [https://github.com/yangguangfu007/ecommerce-erp-system](https://github.com/yangguangfu007/ecommerce-erp-system)

## 项目概述

本项目是一套基于 Spring Boot 3.2 和 Spring Cloud 2023 的微服务架构电商 ERP 系统，主要用于对接沃尔玛电商平台和云途物流服务，实现订单管理、商品管理、库存管理、物流管理等核心功能的自动化处理。

## 🎯 项目进度

- [x] **项目架构设计** - 完成微服务架构设计和技术选型
- [x] **基础设施搭建** - 完成 Docker 环境和基础服务配置
- [x] **用户服务开发** - ✅ **已完成** (2025-07-19)
  - [x] 用户管理系统核心功能
  - [x] 基于 RBAC 的权限管理系统
  - [x] JWT 认证和 Spring Security 集成
  - [x] 安全审计和日志记录
  - [x] 异常登录检测和账户锁定
- [ ] **商品服务开发** - 🚧 计划中
- [ ] **订单服务开发** - 🚧 计划中
- [ ] **库存服务开发** - 🚧 计划中
- [ ] **平台对接服务开发** - 🚧 计划中
- [ ] **物流服务开发** - 🚧 计划中
- [ ] **通知服务开发** - 🚧 计划中

## 📈 最新更新

### v0.1.0 (2025-07-19)

- ✅ **用户服务核心功能实现**
  - 完成用户注册、登录、密码修改等基础功能
  - 实现基于 RBAC 的角色权限管理系统
  - 集成 Spring Security 和 JWT 认证机制
  - 添加权限注解和 AOP 切面进行权限校验
  - 实现安全审计和日志记录功能
  - 添加登录异常检测和账户锁定机制
  - 完善单元测试覆盖，测试通过率 100%

## 技术栈

### 后端技术

- **Java**: OpenJDK 17 LTS
- **Spring Boot**: 3.2.0
- **Spring Cloud**: 2023.0.0
- **Spring Cloud Gateway**: API 网关
- **Spring Security**: 安全框架
- **MyBatis Plus**: 数据访问层
- **MySQL**: 8.0.35 主数据库
- **Redis**: 7.2.3 缓存
- **Apache Kafka**: 3.6.0 消息队列
- **Nacos**: 2.3.0 服务注册发现
- **Sentinel**: 1.8.6 流量控制

### 监控运维

- **Prometheus**: 监控数据收集
- **Grafana**: 监控面板
- **Elasticsearch**: 日志存储和搜索
- **Kibana**: 日志可视化
- **Zipkin**: 分布式链路追踪

## 项目结构

```
erp-system/
├── pom.xml                          # 父POM文件
├── docker-compose.yml               # 本地开发环境
├── checkstyle.xml                   # 代码规范配置
├── README.md                        # 项目说明
├── erp-common/                      # 公共模块
├── erp-gateway/                     # API网关
├── erp-user-service/               # 用户服务 (端口:8001)
├── erp-product-service/            # 商品服务 (端口:8002)
├── erp-order-service/              # 订单服务 (端口:8003)
├── erp-inventory-service/          # 库存服务 (端口:8004)
├── erp-platform-service/           # 平台对接服务 (端口:8005)
├── erp-logistics-service/          # 物流服务 (端口:8006)
├── erp-notification-service/       # 通知服务 (端口:8007)
├── monitoring/                     # 监控配置
└── scripts/                       # 脚本文件
    ├── sql/                       # 数据库脚本
    ├── docker/                    # Docker脚本
    └── deploy/                    # 部署脚本
```

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.9+
- Docker & Docker Compose
- Git

### 本地开发环境搭建

1. **克隆项目**

   ```bash
   git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
   cd ecommerce-erp-system
   ```

2. **启动基础设施**

   ```bash
   # 启动所有基础设施服务
   docker-compose up -d

   # 查看服务状态
   docker-compose ps
   ```

3. **编译项目**

   ```bash
   # 编译所有模块
   mvn clean compile

   # 运行测试
   mvn test

   # 代码质量检查
   mvn clean compile -Pcode-quality
   ```

4. **启动服务**

   ```bash
   # 启动网关服务
   cd erp-gateway
   mvn spring-boot:run

   # 启动用户服务
   cd erp-user-service
   mvn spring-boot:run

   # 其他服务类似...
   ```

### 服务端口说明

| 服务                 | 端口 | 描述         |
| -------------------- | ---- | ------------ |
| API Gateway          | 8080 | API 网关     |
| User Service         | 8001 | 用户服务     |
| Product Service      | 8002 | 商品服务     |
| Order Service        | 8003 | 订单服务     |
| Inventory Service    | 8004 | 库存服务     |
| Platform Service     | 8005 | 平台对接服务 |
| Logistics Service    | 8006 | 物流服务     |
| Notification Service | 8007 | 通知服务     |

### 基础设施服务

| 服务          | 端口      | 用户名/密码              | 描述         |
| ------------- | --------- | ------------------------ | ------------ |
| MySQL         | 3306      | root/root123             | 数据库       |
| Redis         | 6379      | -/redis123               | 缓存         |
| Nacos         | 8848      | nacos/nacos              | 服务注册中心 |
| Kafka         | 9092      | -                        | 消息队列     |
| Elasticsearch | 9200      | -                        | 搜索引擎     |
| Kibana        | 5601      | -                        | 日志可视化   |
| Prometheus    | 9090      | -                        | 监控         |
| Grafana       | 3000      | admin/admin123           | 监控面板     |
| Zipkin        | 9411      | -                        | 链路追踪     |
| MinIO         | 9000/9001 | minioadmin/minioadmin123 | 对象存储     |

## 开发指南

### 代码规范

项目使用 Checkstyle 进行代码规范检查，配置文件为`checkstyle.xml`。

```bash
# 运行代码规范检查
mvn checkstyle:check

# 运行静态代码分析
mvn spotbugs:check
```

### 测试

```bash
# 运行所有测试
mvn test

# 生成测试覆盖率报告
mvn jacoco:report

# 查看覆盖率报告
open target/site/jacoco/index.html
```

### Docker 构建

```bash
# 构建Docker镜像
mvn clean package docker:build

# 推送到镜像仓库
mvn docker:push
```

## 配置说明

### 数据库配置

各服务的数据库配置在`application.yml`中：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/erp_user?useSSL=false&serverTimezone=UTC
    username: erp_user
    password: erp_pass
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Nacos 配置

服务注册发现配置：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: erp-system
```

### Kafka 配置

消息队列配置：

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      retries: 3
      batch-size: 16384
    consumer:
      group-id: erp-system
      auto-offset-reset: earliest
```

## 监控和运维

### 健康检查

所有服务都提供健康检查端点：

```bash
# 检查服务健康状态
curl http://localhost:8001/actuator/health

# 查看服务信息
curl http://localhost:8001/actuator/info

# 查看监控指标
curl http://localhost:8001/actuator/prometheus
```

### 日志查看

```bash
# 查看Docker容器日志
docker-compose logs -f [service-name]

# 查看应用日志
tail -f logs/application.log
```

## 部署

### 本地部署

使用 Docker Compose 进行本地部署：

```bash
# 构建并启动所有服务
docker-compose up --build -d

# 停止所有服务
docker-compose down

# 清理数据卷
docker-compose down -v
```

### 生产部署

生产环境建议使用 Kubernetes 进行部署，相关配置文件在`k8s/`目录下。

## 故障排除

### 常见问题

1. **服务启动失败**

   - 检查端口是否被占用
   - 检查数据库连接是否正常
   - 查看应用日志

2. **Nacos 连接失败**

   - 确认 Nacos 服务是否启动
   - 检查网络连接
   - 验证配置是否正确

3. **数据库连接失败**
   - 确认 MySQL 服务是否启动
   - 检查数据库用户权限
   - 验证连接字符串

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看[LICENSE](LICENSE)文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues)
- 邮箱: yangguangfu007@foxmail.com
- GitHub: [@yangguangfu007](https://github.com/yangguangfu007)
