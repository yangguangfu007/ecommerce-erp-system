# 电商 ERP 系统

[![GitHub stars](https://img.shields.io/github/stars/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/network)
[![GitHub issues](https://img.shields.io/github/issues/yangguangfu007/ecommerce-erp-system.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/issues)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/yangguangfu007/ecommerce-erp-system/blob/main/LICENSE)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=flat-square)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg?style=flat-square)](https://spring.io/projects/spring-boot)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D.svg?style=flat-square)](https://vuejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg?style=flat-square)](https://kubernetes.io/)

> 🚀 **GitHub 仓库**: [https://github.com/yangguangfu007/ecommerce-erp-system](https://github.com/yangguangfu007/ecommerce-erp-system)

## 项目概述

本项目是一套完整的现代化电商 ERP 系统，采用微服务架构设计，集成了前端 Vue.js 应用、后端 Spring Boot 微服务、Kubernetes 容器化部署和完整的 DevOps 工具链。系统主要用于对接沃尔玛电商平台和云途物流服务，实现订单管理、商品管理、库存管理、物流管理等核心功能的自动化处理。

### 🌟 核心特性

- **🏗️ 微服务架构**: 基于 Spring Cloud 的分布式系统设计
- **🎨 现代化前端**: Vue 3 + TypeScript + Element Plus 响应式界面
- **☁️ 云原生部署**: Kubernetes + Helm + Docker 容器化部署
- **📊 完整监控**: Prometheus + Grafana + ELK 全方位监控
- **🔒 企业级安全**: Spring Security + JWT + RBAC 权限控制
- **🧪 全面测试**: 单元测试 + 集成测试 + 端到端测试
- **🚀 自动化运维**: CI/CD + 自动部署 + 健康检查
- **📈 高可用设计**: 负载均衡 + 熔断降级 + 分布式缓存

## 🎯 项目进度

- [x] **项目架构设计** - ✅ **已完成** 微服务架构设计和技术选型
- [x] **基础设施搭建** - ✅ **已完成** Kubernetes + Docker 环境配置
- [x] **用户服务开发** - ✅ **已完成** 用户管理和权限系统
- [x] **商品服务开发** - ✅ **已完成** 商品管理和分类系统
- [x] **订单服务开发** - ✅ **已完成** 订单处理和状态管理
- [x] **库存服务开发** - ✅ **已完成** 库存管理和预警系统
- [x] **平台对接服务** - ✅ **已完成** 沃尔玛平台集成
- [x] **物流服务开发** - ✅ **已完成** 云途物流集成
- [x] **通知服务开发** - ✅ **已完成** 消息通知系统
- [x] **前端应用开发** - ✅ **已完成** Vue.js 管理界面
- [x] **监控运维系统** - ✅ **已完成** 完整监控和运维工具
- [x] **测试框架** - ✅ **已完成** 全面测试覆盖
- [x] **部署文档** - ✅ **已完成** 完整部署和开发指南

## � 最新更新

### v1.0.0 (2025-07-20) - 正式版发布 🎉

- ✅ **完整系统实现**
  - 🏗️ 完成所有微服务开发（8 个核心服务）
  - 🎨 完成 Vue.js 前端管理界面
  - ☁️ 完成 Kubernetes 生产级部署配置
  - 📊 完成 Prometheus + Grafana 监控系统
  - 🔒 完成企业级安全和权限控制
  - 🧪 完成全面测试框架（单元测试 + 集成测试 + E2E 测试）
  - 📚 完成完整的部署和开发文档
  - 🚀 完成 CI/CD 自动化部署流程

### 核心功能特性

- **用户管理系统**: 完整的用户注册、登录、权限管理（RBAC）
- **商品管理系统**: 商品信息管理、分类管理、批量导入导出
- **订单管理系统**: 订单创建、状态跟踪、批量处理
- **库存管理系统**: 实时库存跟踪、安全库存预警、库存调整
- **平台集成**: 沃尔玛平台订单同步、商品上传、状态更新
- **物流集成**: 云途物流订单创建、运单跟踪、状态同步
- **通知系统**: 邮件通知、短信通知、系统消息推送
- **监控运维**: 系统监控、日志收集、性能分析、自动化运维

## 🛠️ 技术栈

### 后端技术

- **Java**: OpenJDK 17 LTS
- **Spring Boot**: 3.2.0
- **Spring Cloud**: 2023.0.0
- **Spring Cloud Gateway**: API 网关
- **Spring Security**: 安全框架
- **MyBatis Plus**: 数据访问层
- **MySQL**: 8.0.35 主数据库
- **Redis**: 7.2.3 缓存和会话存储
- **Apache Kafka**: 3.6.0 消息队列
- **Nacos**: 2.3.0 服务注册发现和配置中心
- **Sentinel**: 1.8.6 流量控制和熔断降级

### 前端技术

- **Vue.js**: 3.4.0 渐进式前端框架
- **TypeScript**: 5.0+ 类型安全
- **Element Plus**: UI 组件库
- **Vue Router**: 4.x 路由管理
- **Pinia**: 状态管理
- **Axios**: HTTP 客户端
- **Vite**: 构建工具

### 容器化和编排

- **Docker**: 容器化平台
- **Kubernetes**: 容器编排
- **Helm**: Kubernetes 包管理
- **Istio**: 服务网格（可选）

### 监控运维

- **Prometheus**: 监控数据收集
- **Grafana**: 监控面板和可视化
- **Elasticsearch**: 日志存储和搜索
- **Kibana**: 日志可视化分析
- **Zipkin**: 分布式链路追踪
- **AlertManager**: 告警管理

### 测试框架

- **JUnit 5**: 单元测试框架
- **Testcontainers**: 集成测试
- **MockMvc**: Web 层测试
- **Node.js**: 端到端测试
- **Jest**: JavaScript 测试框架

## 📁 项目结构

```
ecommerce-erp-system/
├── README.md                        # 项目说明文档
├── LICENSE                          # 开源许可证
├── .gitignore                       # Git 忽略文件
├── docker-compose.yml               # 本地开发环境
├── erp-frontend/                    # Vue.js 前端应用
│   ├── src/                        # 源代码
│   ├── public/                     # 静态资源
│   ├── package.json                # 前端依赖
│   └── vite.config.ts              # 构建配置
├── k8s/                            # Kubernetes 部署配置
│   ├── infrastructure/             # 基础设施服务
│   │   ├── mysql-deployment.yaml
│   │   ├── redis-deployment.yaml
│   │   └── kafka-deployment.yaml
│   └── monitoring/                 # 监控服务
│       ├── prometheus-deployment.yaml
│       └── grafana-deployment.yaml
├── helm/                           # Helm Charts
│   └── erp-system/                 # ERP 系统 Helm Chart
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       ├── values-prod.yaml
│       └── templates/              # Kubernetes 模板
├── scripts/                        # 运维脚本
│   ├── deploy/                     # 部署脚本
│   │   ├── deploy.sh
│   │   └── health-check.sh
│   ├── backup/                     # 备份脚本
│   │   ├── backup-mysql.sh
│   │   └── restore-mysql.sh
│   ├── monitoring/                 # 监控脚本
│   │   ├── log-collector.sh
│   │   └── auto-restart.sh
│   └── testing/                    # 测试框架
│       ├── integration-test-suite.js
│       ├── e2e-test-runner.sh
│       ├── performance-test.sh
│       ├── data-consistency-checker.sh
│       ├── test-orchestrator.sh
│       ├── test-data-generator.js
│       └── mock-services/          # 模拟服务
└── docs/                           # 文档目录
    ├── deployment-guide.md         # 部署指南
    ├── user-guide.md              # 用户指南
    ├── api-documentation.md       # API 文档
    └── training-materials.md      # 培训材料
```

## 🚀 快速开始

### 环境要求

#### 基础环境

- **Docker**: 20.10+ 和 Docker Compose 2.0+
- **Kubernetes**: 1.25+ (生产环境)
- **Helm**: 3.8+ (Kubernetes 部署)
- **Node.js**: 16+ (前端开发)
- **Git**: 版本控制

#### 开发环境（可选）

- **JDK**: 17+ (后端开发)
- **Maven**: 3.9+ (后端构建)
- **kubectl**: Kubernetes 命令行工具

### ⚡ 一键启动（推荐）

使用我们提供的自动化部署脚本，一键启动完整系统：

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 热重载开发环境（推荐开发者）
make dev-hot
# 特性：代码修改自动生效，无需重启服务

# 3. 一键部署（自动检测平台）
make deploy
# 或者
./scripts/deploy/one-click-deploy.sh

# 4. 传统开发环境
make dev
# 或者
./scripts/deploy/quick-dev.sh

# 5. 等待部署完成，访问系统
# 前端界面: http://localhost:3000
# API 网关: http://localhost:8080
# Nacos 控制台: http://localhost:8848/nacos
# 监控面板: http://localhost:3001 (admin/admin123)
```

### 🎯 选择性开发

支持只启动需要的服务，提高开发效率：

```bash
# 只启动特定服务（热重载模式）
make dev-gateway     # 只启动网关服务
make dev-user        # 只启动用户服务
make dev-product     # 只启动产品服务
make dev-order       # 只启动订单服务
make dev-inventory   # 只启动库存服务

# 启动多个服务
SERVICES="gateway,user,product" ./scripts/dev-hot-reload.sh

# 只启动前端
SERVICES=frontend ./scripts/dev-hot-reload.sh
```

### 🛠️ 可用命令

#### 部署命令

- `make deploy` - 一键部署（自动检测平台）
- `make deploy-quick` - 快速部署（跳过构建）
- `make deploy-dev` - 开发环境设置
- `make build-all` - 构建所有服务（多平台）

#### 开发命令

- `make dev-hot` - 启动热重载开发环境（推荐）
- `make dev` - 启动传统开发环境
- `make dev-backend` - 仅启动后端服务
- `make dev-frontend` - 仅启动前端
- `make dev-infra` - 仅启动基础设施

#### 服务特定开发

- `make dev-gateway` - 只启动网关服务（热重载）
- `make dev-user` - 只启动用户服务（热重载）
- `make dev-product` - 只启动产品服务（热重载）
- `make dev-order` - 只启动订单服务（热重载）
- `make dev-inventory` - 只启动库存服务（热重载）

#### 构建命令

- `make build` - 构建所有后端服务
- `make build-selective` - 选择性构建和部署
- `make build-frontend` - 构建前端应用
- `make docker-build` - 构建 Docker 镜像

#### 服务特定构建

- `make build-gateway` - 只构建网关服务
- `make build-user` - 只构建用户服务
- `make build-product` - 只构建产品服务
- `make build-order` - 只构建订单服务
- `make build-inventory` - 只构建库存服务

#### 测试和维护

- `make test` - 运行所有测试
- `make test-backend` - 运行后端测试
- `make test-frontend` - 运行前端测试
- `make test-e2e` - 运行端到端测试
- `make health` - 检查服务健康状态
- `make logs` - 查看服务日志
- `make stop` - 停止所有服务
- `make clean` - 清理构建产物

### 🐳 Docker Compose 启动

适合本地开发和测试：

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 启动所有服务
docker-compose up -d

# 3. 查看服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f

# 5. 停止服务
docker-compose down
```

### ☸️ Kubernetes 部署

适合生产环境：

```bash
# 1. 使用 Helm 部署
helm install erp-system ./helm/erp-system \
  --namespace erp-system \
  --create-namespace \
  --values ./helm/erp-system/values-prod.yaml

# 2. 检查部署状态
kubectl get pods -n erp-system

# 3. 访问服务
kubectl port-forward svc/erp-gateway 8080:8080 -n erp-system
```

### 🎯 验证部署

部署完成后，可以通过以下方式验证系统是否正常运行：

```bash
# 1. 启动基础设施服务
docker-compose up -d

# 2. 启动Gateway服务
mvn spring-boot:run -f erp-gateway/pom.xml -Dspring-boot.run.profiles=dev

# 3. 验证Gateway服务状态
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/info

# 4. 查看所有可用监控端点
curl http://localhost:8080/actuator

# 5. 查看Gateway路由配置
curl http://localhost:8080/actuator/gateway/routes

# 6. 运行完整健康检查
./scripts/deploy/health-check.sh

# 7. 运行测试套件
cd scripts/testing
./test-orchestrator.sh test all

# 8. 访问前端界面
open http://localhost:5174
```

## 🌐 服务访问信息

### 应用服务

| 服务名称        | 访问地址              | 描述            | 状态    |
| --------------- | --------------------- | --------------- | ------- |
| 🎨 **前端界面** | http://localhost:5174 | Vue.js 管理界面 | ✅ 可用 |
| 🚪 **API 网关** | http://localhost:8080 | 统一 API 入口   | ✅ 可用 |
| 📊 **监控面板** | http://localhost:3001 | Grafana 监控    | ✅ 可用 |
| 📋 **日志分析** | http://localhost:5601 | Kibana 日志     | ✅ 可用 |
| 🔍 **链路追踪** | http://localhost:9411 | Zipkin 追踪     | ✅ 可用 |

### Gateway 监控端点

| 端点名称           | 访问地址                                    | 描述                 |
| ------------------ | ------------------------------------------- | -------------------- |
| 🏥 **健康检查**    | http://localhost:8080/actuator/health      | 服务健康状态         |
| 📋 **系统信息**    | http://localhost:8080/actuator/info        | 应用基本信息         |
| 📊 **系统指标**    | http://localhost:8080/actuator/metrics     | 性能指标监控         |
| 🛣️ **路由信息**    | http://localhost:8080/actuator/gateway     | Gateway 路由配置     |
| 🔧 **配置信息**    | http://localhost:8080/actuator/configprops | 配置属性             |
| 🌐 **环境变量**    | http://localhost:8080/actuator/env         | 环境配置信息         |
| 📝 **日志配置**    | http://localhost:8080/actuator/loggers     | 日志级别管理         |
| 🔄 **熔断器状态**  | http://localhost:8080/actuator/circuitbreakers | 熔断器监控       |
| 🚦 **限流器状态**  | http://localhost:8080/actuator/ratelimiters | 限流器监控          |

### 默认登录信息

| 系统     | 用户名  | 密码       | 角色       |
| -------- | ------- | ---------- | ---------- |
| ERP 系统 | admin   | admin123   | 系统管理员 |
| ERP 系统 | manager | manager123 | 业务经理   |
| ERP 系统 | user    | user123    | 普通用户   |
| Grafana  | admin   | admin123   | 管理员     |

### 基础设施服务

| 服务          | 端口 | 用户名/密码      | 描述         |
| ------------- | ---- | ---------------- | ------------ |
| MySQL         | 3306 | root/root123     | 主数据库     |
| Redis         | 6379 | default/redis123 | 缓存数据库   |
| Kafka         | 9092 | -                | 消息队列     |
| Elasticsearch | 9200 | -                | 搜索引擎     |
| Prometheus    | 9090 | -                | 监控数据收集 |

### 微服务端口（内部）

| 服务     | 端口 | 健康检查         |
| -------- | ---- | ---------------- |
| 用户服务 | 8001 | /actuator/health |
| 商品服务 | 8002 | /actuator/health |
| 订单服务 | 8003 | /actuator/health |
| 库存服务 | 8004 | /actuator/health |
| 平台服务 | 8005 | /actuator/health |
| 物流服务 | 8006 | /actuator/health |
| 通知服务 | 8007 | /actuator/health |

## 📚 文档指南

### 📖 完整文档

| 文档                | 描述                     | 链接                                                   |
| ------------------- | ------------------------ | ------------------------------------------------------ |
| 📋 **项目概览**     | 系统架构和技术栈详细介绍 | [project-overview.md](docs/project-overview.md)        |
| 🚀 **快速启动指南** | 5 分钟快速体验系统       | [quick-start-guide.md](docs/quick-start-guide.md)      |
| 💻 **本地开发指南** | 本地开发环境详细配置     | [local-development.md](docs/local-development.md)      |
| 🛠️ **开发指南**     | 详细的开发流程和最佳实践 | [development-guide.md](docs/development-guide.md)      |
| 🚀 **部署指南**     | 生产环境部署和运维指南   | [deployment-guide.md](docs/deployment-guide.md)        |
| 👥 **用户指南**     | 系统功能使用说明         | [user-guide.md](docs/user-guide.md)                    |
| 📋 **API 文档**     | 完整的 API 接口文档      | [api-documentation.md](docs/api-documentation.md)      |
| 🧪 **测试指南**     | 测试框架使用说明         | [scripts/testing/README.md](scripts/testing/README.md) |

### 🔧 开发相关

#### 代码规范和质量

```bash
# 代码格式检查
npm run lint                    # 前端代码检查
mvn checkstyle:check           # 后端代码规范检查
mvn spotbugs:check            # 静态代码分析

# 代码格式化
npm run format                 # 前端代码格式化
mvn spotless:apply            # 后端代码格式化
```

#### 测试执行

```bash
# 前端测试
cd erp-frontend
npm run test                   # 单元测试
npm run test:e2e              # 端到端测试

# 后端测试
mvn test                      # 单元测试
mvn verify                    # 集成测试

# 完整测试套件
cd scripts/testing
./test-orchestrator.sh test all
```

#### 构建和打包

```bash
# 前端构建
cd erp-frontend
npm run build

# 后端构建
mvn clean package -DskipTests

# Docker 镜像构建
docker-compose build
```

## ⚙️ 系统配置

### 环境配置

系统支持多环境配置，通过环境变量或配置文件进行管理：

```bash
# 开发环境
export SPRING_PROFILES_ACTIVE=dev
export NODE_ENV=development

# 生产环境
export SPRING_PROFILES_ACTIVE=prod
export NODE_ENV=production
```

### 核心配置项

| 配置项     | 环境变量        | 默认值         | 描述             |
| ---------- | --------------- | -------------- | ---------------- |
| 数据库地址 | `DB_HOST`       | localhost      | MySQL 服务器地址 |
| 数据库端口 | `DB_PORT`       | 3306           | MySQL 端口       |
| Redis 地址 | `REDIS_HOST`    | localhost      | Redis 服务器地址 |
| Kafka 地址 | `KAFKA_BROKERS` | localhost:9092 | Kafka 集群地址   |
| JWT 密钥   | `JWT_SECRET`    | -              | JWT 签名密钥     |

## 📊 监控和运维

### 系统监控

- **应用监控**: Spring Boot Actuator + Micrometer
- **基础设施监控**: Prometheus + Grafana
- **日志聚合**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **链路追踪**: Zipkin + Sleuth
- **告警通知**: AlertManager + 钉钉/邮件

### 健康检查

```bash
# 应用健康检查
curl http://localhost:8080/actuator/health

# 详细健康信息
curl http://localhost:8080/actuator/health/detailed

# 系统指标
curl http://localhost:8080/actuator/metrics

# 系统信息
curl http://localhost:8080/actuator/info
```

### 日志管理

```bash
# 查看应用日志
docker-compose logs -f erp-gateway

# 查看所有服务日志
docker-compose logs -f

# 实时日志监控
tail -f logs/application.log
```

## 🚀 部署方案

### 本地开发环境

```bash
# 一键启动开发环境
./scripts/deploy/deploy.sh local

# 或使用 Docker Compose
docker-compose up -d
```

### 测试环境

```bash
# 部署到测试环境
./scripts/deploy/deploy.sh test

# 使用 Kubernetes
kubectl apply -f k8s/ -n erp-system-test
```

### 生产环境

```bash
# 使用 Helm 部署生产环境
helm install erp-system ./helm/erp-system \
  --namespace erp-system \
  --values ./helm/erp-system/values-prod.yaml
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. 服务启动失败

**症状**: 容器启动后立即退出

**排查步骤**:

```bash
# 查看容器日志
docker-compose logs [service-name]

# 检查端口占用
netstat -tulpn | grep [port]

# 检查资源使用
docker stats
```

#### 2. 数据库连接问题

**症状**: 应用无法连接数据库

**排查步骤**:

```bash
# 检查数据库服务状态
docker-compose ps mysql

# 测试数据库连接
docker-compose exec mysql mysql -uroot -proot123

# 检查网络连通性
docker-compose exec erp-gateway ping mysql
```

#### 3. 前端页面无法访问

**症状**: 浏览器无法打开前端页面

**排查步骤**:

```bash
# 检查前端服务状态
docker-compose ps erp-frontend

# 检查端口映射
docker-compose port erp-frontend 80

# 重启前端服务
docker-compose restart erp-frontend
```

### 获取帮助

如果遇到问题无法解决，可以：

1. 📖 查看 [故障排除文档](docs/troubleshooting.md)
2. 🔍 搜索 [GitHub Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues)
3. 💬 提交新的 [Issue](https://github.com/yangguangfu007/ecommerce-erp-system/issues/new)
4. 📧 发送邮件到 yangguangfu007@foxmail.com

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是报告 bug、提出新功能建议，还是提交代码改进。

### 🔄 贡献流程

1. **Fork 项目** 到你的 GitHub 账户
2. **创建特性分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m 'feat: add amazing feature'`)
4. **推送到分支** (`git push origin feature/amazing-feature`)
5. **创建 Pull Request**

### 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 🧪 代码质量

提交前请确保：

- [ ] 代码通过所有测试
- [ ] 代码符合项目规范
- [ ] 添加了必要的文档
- [ ] 更新了相关的 CHANGELOG

```bash
# 运行完整测试套件
npm run test && mvn test
./scripts/testing/test-orchestrator.sh test all

# 代码质量检查
npm run lint && mvn checkstyle:check
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

### 🐛 问题反馈

- **Bug 报告**: [GitHub Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues/new?template=bug_report.md)
- **功能请求**: [GitHub Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues/new?template=feature_request.md)

### 💬 技术交流

- **邮箱**: yangguangfu007@foxmail.com
- **GitHub**: [@yangguangfu007](https://github.com/yangguangfu007)
- **项目主页**: [ecommerce-erp-system](https://github.com/yangguangfu007/ecommerce-erp-system)

### 🆘 获取帮助

1. 📖 首先查看 [文档](docs/)
2. 🔍 搜索 [已有 Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues)
3. 💬 提交新的 [Issue](https://github.com/yangguangfu007/ecommerce-erp-system/issues/new)
4. 📧 发送邮件获取技术支持

---

## 🌟 致谢

感谢所有为这个项目做出贡献的开发者！

[![Contributors](https://contrib.rocks/image?repo=yangguangfu007/ecommerce-erp-system)](https://github.com/yangguangfu007/ecommerce-erp-system/graphs/contributors)

### 🏆 特别感谢

- Spring Boot 和 Vue.js 社区提供的优秀框架
- 所有开源项目的贡献者
- 提供反馈和建议的用户们

---

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

[![Star History Chart](https://api.star-history.com/svg?repos=yangguangfu007/ecommerce-erp-system&type=Date)](https://star-history.com/#yangguangfu007/ecommerce-erp-system&Date)
