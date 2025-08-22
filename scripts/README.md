# 🚀 启动脚本说明

本目录包含了电商ERP系统的各种启动和管理脚本，帮助开发者快速启动和管理系统服务。

## 📁 脚本目录结构

```
scripts/
├── README.md                    # 本文档
├── start-infrastructure.sh      # 基础设施服务启动脚本
├── start-backend.sh            # 后端服务启动脚本
├── start-frontend.sh           # 前端服务启动脚本
├── start-services.sh           # 统一服务管理脚本
├── test-scripts.sh             # 启动脚本测试工具
├── deploy/                     # 部署相关脚本
├── backup/                     # 备份相关脚本
├── sql/                        # 测试相关脚本
```

## 🎯 快速开始

### 一键启动所有服务

```bash
# 启动完整系统（推荐）
./scripts/start-services.sh

# 查看所有服务状态
./scripts/start-services.sh status

# 停止所有服务
./scripts/start-services.sh stop
```

### 分步启动服务

```bash
# 第1步：启动基础设施服务
./scripts/start-infrastructure.sh

# 第2步：启动后端服务
./scripts/start-backend.sh

# 第3步：启动前端服务
./scripts/start-frontend.sh
```

## 📋 脚本详细说明

### 1. start-infrastructure.sh - 基础设施服务

**功能**: 启动MySQL、Redis、Kafka、Nacos等基础服务

```bash
# 基本用法
./scripts/start-infrastructure.sh [命令] [参数]

# 常用命令
./scripts/start-infrastructure.sh start    # 启动服务
./scripts/start-infrastructure.sh stop     # 停止服务
./scripts/start-infrastructure.sh status   # 查看状态
./scripts/start-infrastructure.sh logs     # 查看日志
```

**服务列表**:
- MySQL 8.0.35 (端口: 3306)
- Redis 7.2.3 (端口: 6379)
- Apache Kafka 3.6.0 (端口: 9092)
- Nacos 2.3.0 (端口: 8848)

### 2. start-backend.sh - 后端服务

**功能**: 启动用户服务、网关服务等后端微服务

```bash
# 基本用法
./scripts/start-backend.sh [命令] [服务名]

# 常用命令
./scripts/start-backend.sh start           # 启动所有后端服务
./scripts/start-backend.sh start user      # 启动用户服务
./scripts/start-backend.sh start gateway   # 启动网关服务
./scripts/start-backend.sh status          # 查看状态
./scripts/start-backend.sh logs user       # 查看用户服务日志
```

**服务列表**:
- 用户服务 (端口: 8001)
- 网关服务 (端口: 8080)

### 3. start-frontend.sh - 前端服务

**功能**: 启动Vue.js前端应用

```bash
# 基本用法
./scripts/start-frontend.sh [命令] [参数]

# 常用命令
./scripts/start-frontend.sh start          # 启动前端服务
./scripts/start-frontend.sh stop           # 停止前端服务
./scripts/start-frontend.sh status         # 查看状态
./scripts/start-frontend.sh logs           # 查看日志
./scripts/start-frontend.sh build          # 构建生产版本
./scripts/start-frontend.sh test           # 运行测试
```

**特性**:
- 自动安装依赖
- 支持热重载开发
- 生产构建支持
- 代码检查和格式化

### 4. start-services.sh - 统一管理

**功能**: 统一管理所有服务，按正确顺序启动

```bash
# 基本用法
./scripts/start-services.sh [命令] [服务类型] [参数]

# 启动所有服务
./scripts/start-services.sh start

# 启动特定类型服务
./scripts/start-services.sh start infrastructure
./scripts/start-services.sh start backend
./scripts/start-services.sh start frontend

# 直接调用子脚本
./scripts/start-services.sh infrastructure status
./scripts/start-services.sh backend start user
./scripts/start-services.sh frontend build
```

## 🔧 服务启动顺序

正确的服务启动顺序非常重要：

1. **基础设施服务** (MySQL, Redis, Kafka, Nacos)
2. **后端微服务** (用户服务, 网关服务)
3. **前端应用** (Vue.js开发服务器)

## 📊 日志和PID管理

### 日志文件位置

```
logs/
├── infrastructure.log          # 基础设施启动日志
├── user-service.log           # 用户服务日志
├── gateway.log                # 网关服务日志
└── frontend.log               # 前端服务日志
```

### PID文件位置

```
pids/
├── user-service.pid           # 用户服务进程ID
├── gateway.pid                # 网关服务进程ID
└── frontend.pid               # 前端服务进程ID
```

## 🔍 常用操作示例

### 开发环境启动

```bash
# 完整开发环境启动
./scripts/start-services.sh

# 等价于以下步骤：
./scripts/start-infrastructure.sh
sleep 30  # 等待基础设施稳定
./scripts/start-backend.sh
sleep 10  # 等待后端服务稳定
./scripts/start-frontend.sh
```

### 单独调试某个服务

```bash
# 只启动基础设施和用户服务进行调试
./scripts/start-infrastructure.sh
./scripts/start-backend.sh start user

# 查看用户服务日志
./scripts/start-backend.sh logs user

# 重启用户服务
./scripts/start-backend.sh restart user
```

### 前端开发

```bash
# 启动基础设施和后端
./scripts/start-infrastructure.sh
./scripts/start-backend.sh

# 单独启动前端进行开发
./scripts/start-frontend.sh

# 实时查看前端日志
./scripts/start-frontend.sh follow

# 运行前端测试
./scripts/start-frontend.sh test
```

## 🚨 故障排查

### 常见问题

1. **端口冲突**
   ```bash
   # 查看端口占用
   lsof -i :8080
   
   # 停止所有服务
   ./scripts/start-services.sh stop
   ```

2. **服务启动失败**
   ```bash
   # 查看详细日志
   ./scripts/start-backend.sh logs user
   
   # 检查服务状态
   ./scripts/start-backend.sh status
   ```

3. **基础设施服务未启动**
   ```bash
   # 检查基础设施状态
   ./scripts/start-infrastructure.sh status
   
   # 重启基础设施服务
   ./scripts/start-infrastructure.sh restart
   ```

### 调试技巧

```bash
# 查看所有服务状态
./scripts/start-services.sh status

# 查看所有日志
./scripts/start-services.sh logs all

# 逐步启动进行调试
./scripts/start-infrastructure.sh
# 等待稳定后
./scripts/start-backend.sh start user
# 检查用户服务是否正常
curl http://localhost:8001/actuator/health
```

## 📞 获取帮助

每个脚本都支持 `help` 命令：

```bash
./scripts/start-services.sh help
./scripts/start-infrastructure.sh help
./scripts/start-backend.sh help
./scripts/start-frontend.sh help
```

更多详细信息请参考：
- [启动脚本使用指南](../docs/startup-scripts-guide.md)
- [开发指南](../docs/development-guide.md)
- [快速启动指南](../docs/quick-start-guide.md)

---

通过这些脚本，您可以高效地管理电商ERP系统的各种服务，提高开发效率。