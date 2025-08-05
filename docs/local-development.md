# 💻 本地开发环境指南

本文档专门为开发人员提供本地开发环境的详细搭建和使用指南。

## 🎯 开发环境概述

本地开发环境支持两种模式：

- **🐳 容器化开发**: 使用 Docker 运行所有服务，开发体验接近生产环境
- **🔧 混合开发**: 基础设施使用 Docker，应用服务本地运行，便于调试

## 📋 环境要求

### 必需软件

| 软件 | 版本 | 用途 | 安装链接 |
|------|------|------|----------|
| **Docker** | 20.10+ | 容器运行时 | [Docker 官网](https://www.docker.com/get-started) |
| **Docker Compose** | 2.0+ | 容器编排 | 随 Docker 安装 |
| **Git** | 2.0+ | 版本控制 | [Git 官网](https://git-scm.com/) |
| **Node.js** | 16+ | 前端开发 | [Node.js 官网](https://nodejs.org/) |

### 可选软件（源码开发）

| 软件 | 版本 | 用途 |
|------|------|------|
| **JDK** | 17+ | 后端开发 |
| **Maven** | 3.9+ | 后端构建 |
| **IntelliJ IDEA** | 2023+ | Java IDE |
| **VS Code** | 最新版 | 通用编辑器 |

### 系统要求

- **内存**: 最少 8GB，推荐 16GB
- **磁盘**: 最少 20GB 可用空间
- **CPU**: 最少 4 核心

## 🚀 快速开始

### 方式一：热重载开发环境（推荐开发者）

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 启动热重载开发环境
make dev-hot

# 或者使用脚本
./scripts/dev-hot-reload.sh

# 3. 特性说明
# - 后端：Spring DevTools 自动重启
# - 前端：Vite HMR 热模块替换
# - 代码修改自动生效，无需手动重启
# - 支持选择性启动服务

# 4. 访问系统
echo "前端界面: http://localhost:3000"
echo "API 网关: http://localhost:8080"
echo "Nacos 控制台: http://localhost:8848/nacos"
```

### 方式二：选择性服务开发

```bash
# 只启动特定服务（热重载模式）
make dev-gateway     # 只启动网关服务
make dev-user        # 只启动用户服务
make dev-product     # 只启动产品服务
make dev-order       # 只启动订单服务
make dev-inventory   # 只启动库存服务

# 使用环境变量启动多个服务
SERVICES="gateway,user,product" ./scripts/dev-hot-reload.sh

# 只启动前端
SERVICES=frontend ./scripts/dev-hot-reload.sh
```

### 方式三：一键启动（推荐新手）

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 一键启动开发环境
make dev

# 或者使用脚本
./scripts/dev-all.sh

# 3. 等待启动完成（约 3-5 分钟）
# 脚本会自动完成以下操作：
# - 启动基础设施服务
# - 启动应用服务
# - 初始化测试数据
# - 执行健康检查

# 4. 访问系统
echo "前端界面: http://localhost:3000"
echo "API 网关: http://localhost:8080"
echo "监控面板: http://localhost:3001"
```

### 方式四：Docker Compose 启动

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 启动所有服务
docker-compose up -d

# 3. 查看服务状态
docker-compose ps

# 4. 查看日志（可选）
docker-compose logs -f
```

## 🔧 开发模式配置

### 热重载开发模式（推荐）

最佳的开发体验，支持代码修改后自动生效：

```bash
# 1. 启动完整热重载环境
make dev-hot

# 2. 选择性启动服务
SERVICES=gateway make dev-hot          # 只启动网关
SERVICES=frontend make dev-hot         # 只启动前端
SERVICES="gateway,user" make dev-hot   # 启动多个服务

# 3. 热重载特性
# - 后端：Spring DevTools 自动重启（约 2-3 秒）
# - 前端：Vite HMR 热模块替换（毫秒级）
# - 配置文件修改自动重载
# - 依赖变更自动检测
```

### 前端开发模式

如果只需要修改前端代码：

```bash
# 方式一：使用热重载脚本
SERVICES=frontend ./scripts/dev-hot-reload.sh

# 方式二：手动启动
# 1. 启动基础设施和后端服务
make dev-infra
docker-compose up -d erp-gateway erp-user-service erp-product-service

# 2. 进入前端目录
cd erp-frontend

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 前端开发服务器将在 http://localhost:3000 启动
# 支持热重载，修改代码后自动刷新
```

### 后端开发模式

如果需要修改后端代码并调试：

```bash
# 方式一：使用热重载脚本（推荐）
SERVICES=gateway ./scripts/dev-hot-reload.sh

# 方式二：手动启动
# 1. 启动基础设施服务
make dev-infra

# 2. 启动服务（以用户服务为例）
cd erp-user-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. 或在 IDE 中直接运行 Application 主类
# 配置 VM options: -Dspring.profiles.active=dev
```

### 选择性构建和部署

支持只构建和部署特定服务：

```bash
# 构建特定服务
make build-gateway      # 只构建网关服务
make build-user         # 只构建用户服务
make build-product      # 只构建产品服务

# 使用选择性构建脚本
SERVICES=gateway ./scripts/build-selective.sh
SERVICES="gateway,user,product" ./scripts/build-selective.sh

# 生产环境构建
BUILD_TYPE=prod SERVICES=all ./scripts/build-selective.sh

# 构建并推送到镜像仓库
PUSH=true REGISTRY=your-registry.com ./scripts/build-selective.sh
```

## 🗄️ 数据库管理

### 连接数据库

```bash
# 方式一：使用 Docker 命令
docker-compose exec mysql mysql -uroot -proot123

# 方式二：使用数据库客户端
# 主机: localhost
# 端口: 3306
# 用户名: root
# 密码: root123
```

### 数据库结构

系统使用多个数据库：

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 主要数据库
USE erp_system;    -- 系统主库
USE erp_user;      -- 用户服务库
USE erp_product;   -- 商品服务库
USE erp_order;     -- 订单服务库
USE erp_inventory; -- 库存服务库
```

### 初始化测试数据

```bash
# 自动初始化（推荐）
cd scripts/testing
node test-data-generator.js

# 手动初始化
docker-compose exec mysql mysql -uroot -proot123 < scripts/sql/init-data.sql
```

## 🧪 测试和调试

### 运行测试

```bash
# 前端测试
cd erp-frontend
npm run test              # 单元测试
npm run test:e2e         # 端到端测试

# 后端测试
mvn test                 # 单元测试
mvn verify              # 集成测试

# 完整测试套件
cd scripts/testing
./test-orchestrator.sh test all
```

### 调试技巧

#### 前端调试

1. **浏览器开发者工具**
   - 打开 Chrome DevTools (F12)
   - 在 Sources 面板设置断点
   - 使用 Console 查看变量

2. **Vue DevTools**
   - 安装 Vue DevTools 浏览器扩展
   - 查看组件状态和 Vuex 数据

#### 后端调试

1. **IDE 调试**
   - 在 IDE 中设置断点
   - 以 Debug 模式启动应用
   - 逐步调试代码

2. **远程调试**
   ```bash
   # 启动应用时添加调试参数
   java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar app.jar
   
   # 在 IDE 中配置远程调试连接到 localhost:5005
   ```

3. **日志调试**
   ```yaml
   # application-dev.yml
   logging:
     level:
       com.erp: DEBUG
       org.springframework.web: DEBUG
   ```

## 📊 监控和日志

### 本地监控

访问以下地址查看系统状态：

- **Grafana 监控**: http://localhost:3001 (admin/admin123)
- **Prometheus 指标**: http://localhost:9090
- **Kibana 日志**: http://localhost:5601
- **Zipkin 链路追踪**: http://localhost:9411

### 查看日志

```bash
# 查看特定服务日志
docker-compose logs -f erp-user-service

# 查看所有服务日志
docker-compose logs -f

# 实时监控日志
tail -f logs/application.log
```

### 健康检查

```bash
# 检查所有服务健康状态
./scripts/deploy/health-check.sh

# 检查特定服务
curl http://localhost:8001/actuator/health

# 查看详细健康信息
curl http://localhost:8001/actuator/health/detailed
```

## 🔧 常用开发命令

### Make 命令（推荐）

```bash
# 开发环境
make dev-hot            # 启动热重载开发环境（推荐）
make dev                # 启动传统开发环境
make dev-infra          # 只启动基础设施服务

# 服务特定开发
make dev-gateway        # 只启动网关服务（热重载）
make dev-user           # 只启动用户服务（热重载）
make dev-product        # 只启动产品服务（热重载）
make dev-order          # 只启动订单服务（热重载）
make dev-inventory      # 只启动库存服务（热重载）

# 构建命令
make build              # 构建所有后端服务
make build-selective    # 选择性构建和部署
make build-frontend     # 构建前端应用

# 服务特定构建
make build-gateway      # 只构建网关服务
make build-user         # 只构建用户服务
make build-product      # 只构建产品服务

# 测试命令
make test               # 运行所有测试
make test-backend       # 运行后端测试
make test-frontend      # 运行前端测试
make test-e2e           # 运行端到端测试

# 维护命令
make clean              # 清理构建产物
make clean-docker       # 清理 Docker 资源
make logs               # 查看服务日志
make health             # 检查服务健康状态
make stop               # 停止所有服务
```

### Docker 相关

```bash
# 查看运行中的容器
docker-compose ps

# 重启特定服务
docker-compose restart erp-user-service

# 查看服务日志
docker-compose logs -f erp-user-service

# 进入容器
docker-compose exec erp-user-service bash

# 清理所有容器和数据
docker-compose down -v
docker system prune -a
```

### 前端开发

```bash
cd erp-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test
```

### 后端开发

```bash
# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包应用
mvn clean package -DskipTests

# 运行应用
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 代码质量检查
mvn checkstyle:check
mvn spotbugs:check
```

## 🛠️ IDE 配置

### IntelliJ IDEA 配置

1. **导入项目**
   - File → Open → 选择项目根目录
   - 等待 Maven 导入完成

2. **配置 JDK**
   - File → Project Structure → Project → SDK → 选择 JDK 17

3. **安装插件**
   - Lombok Plugin
   - MyBatis Plugin
   - Spring Boot Plugin
   - Vue.js Plugin

4. **配置代码格式**
   - File → Settings → Editor → Code Style
   - 导入项目根目录的 `intellij-code-style.xml`

### VS Code 配置

1. **安装扩展**
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - Vue Language Features (Volar)
   - TypeScript Vue Plugin (Volar)

2. **配置设置**
   ```json
   {
     "java.home": "/path/to/jdk-17",
     "maven.executable.path": "/path/to/maven/bin/mvn",
     "typescript.preferences.includePackageJsonAutoImports": "auto"
   }
   ```

## 🔄 开发工作流

### 功能开发流程

1. **创建功能分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-management
   ```

2. **开发和测试**
   ```bash
   # 修改代码
   # 运行测试
   npm run test && mvn test
   
   # 代码质量检查
   npm run lint && mvn checkstyle:check
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add user management feature"
   git push origin feature/user-management
   ```

4. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 等待代码审查
   - 合并到 develop 分支

### 代码规范

- **提交信息**: 使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- **代码格式**: 使用项目配置的 Prettier 和 ESLint
- **测试覆盖**: 新功能必须包含单元测试
- **文档更新**: 重要功能需要更新相关文档

## ❓ 常见问题

### Q1: Docker 容器启动失败

**A**: 检查以下几点：
```bash
# 检查 Docker 服务状态
docker --version
docker-compose --version

# 检查端口占用
netstat -tulpn | grep :3306

# 检查磁盘空间
df -h

# 清理 Docker 资源
docker system prune -a
```

### Q2: 前端页面无法访问

**A**: 检查前端服务状态：
```bash
# 检查容器状态
docker-compose ps erp-frontend

# 查看前端日志
docker-compose logs erp-frontend

# 重启前端服务
docker-compose restart erp-frontend
```

### Q3: 数据库连接失败

**A**: 检查数据库配置：
```bash
# 检查 MySQL 容器状态
docker-compose ps mysql

# 测试数据库连接
docker-compose exec mysql mysql -uroot -proot123

# 查看数据库日志
docker-compose logs mysql
```

### Q4: 如何重置开发环境

**A**: 完全重置环境：
```bash
# 停止所有服务
docker-compose down -v

# 清理 Docker 资源
docker system prune -a

# 重新启动
docker-compose up -d
```

## 📞 获取帮助

如果遇到问题：

1. 📖 查看 [开发指南](development-guide.md)
2. 🔍 搜索 [GitHub Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues)
3. 💬 提交新的 [Issue](https://github.com/yangguangfu007/ecommerce-erp-system/issues/new)
4. 📧 发送邮件到 yangguangfu007@foxmail.com

---

**🎯 目标**: 让开发者能够快速搭建本地开发环境，专注于业务功能开发！