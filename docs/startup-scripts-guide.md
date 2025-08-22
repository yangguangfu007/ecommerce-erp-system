# 🚀 启动脚本使用指南

本文档详细介绍电商ERP系统的启动脚本使用方法，帮助开发者快速启动和管理各种服务。

## 📋 脚本概览

系统提供了四个主要的启动脚本，按照服务启动的顺序设计：

| 脚本名称 | 用途 | 启动顺序 |
|---------|------|----------|
| `start-infrastructure.sh` | 启动基础设施服务 | 第1步 |
| `start-backend.sh` | 启动后端微服务 | 第2步 |
| `start-frontend.sh` | 启动前端服务 | 第3步 |
| `start-services.sh` | 统一管理所有服务 | 主脚本 |

## 🏗️ 基础设施服务脚本

### 功能说明

`start-infrastructure.sh` 负责启动系统的基础设施服务，包括：
- MySQL 8.0.35 (端口: 3306)
- Redis 7.2.3 (端口: 6379)
- Apache Kafka 3.6.0 (端口: 9092)
- Nacos 2.3.0 (端口: 8848)

### 使用方法

```bash
# 启动所有基础设施服务
./scripts/start-infrastructure.sh

# 或者显式指定start命令
./scripts/start-infrastructure.sh start

# 查看服务状态
./scripts/start-infrastructure.sh status

# 停止服务
./scripts/start-infrastructure.sh stop

# 重启服务
./scripts/start-infrastructure.sh restart

# 查看日志
./scripts/start-infrastructure.sh logs           # 查看所有服务日志
./scripts/start-infrastructure.sh logs mysql     # 查看MySQL日志
./scripts/start-infrastructure.sh logs redis     # 查看Redis日志
./scripts/start-infrastructure.sh logs kafka     # 查看Kafka日志
./scripts/start-infrastructure.sh logs nacos     # 查看Nacos日志

# 查看帮助
./scripts/start-infrastructure.sh help
```

### 服务验证

脚本会自动等待各服务启动完成，并提供以下访问地址：
- MySQL: localhost:3306
- Redis: localhost:6379
- Kafka: localhost:9092
- Nacos: http://localhost:8848/nacos (用户名/密码: nacos/nacos)

## 🔧 后端服务脚本

### 功能说明

`start-backend.sh` 负责启动后端微服务，包括：
- 用户服务 (端口: 8001)
- 网关服务 (端口: 8080)

### 使用方法

```bash
# 启动所有后端服务
./scripts/start-backend.sh

# 启动单个服务
./scripts/start-backend.sh start user      # 启动用户服务
./scripts/start-backend.sh start gateway   # 启动网关服务

# 查看服务状态
./scripts/start-backend.sh status

# 停止所有后端服务
./scripts/start-backend.sh stop

# 重启服务
./scripts/start-backend.sh restart
./scripts/start-backend.sh restart user    # 重启用户服务

# 查看日志
./scripts/start-backend.sh logs            # 查看所有服务日志
./scripts/start-backend.sh logs user       # 查看用户服务日志
./scripts/start-backend.sh logs gateway    # 查看网关服务日志

# 查看帮助
./scripts/start-backend.sh help
```

### 依赖检查

脚本会自动检查基础设施服务是否运行，如果基础设施服务未启动，会提示先启动基础设施服务。

### 服务验证

- 网关API: http://localhost:8080/api
- 用户服务: http://localhost:8001
- 健康检查: http://localhost:8001/actuator/health, http://localhost:8080/actuator/health

## 🎨 前端服务脚本

### 功能说明

`start-frontend.sh` 负责启动Vue.js前端应用，支持开发模式和生产构建。

### 使用方法

```bash
# 启动前端开发服务器
./scripts/start-frontend.sh

# 查看服务状态
./scripts/start-frontend.sh status

# 停止前端服务
./scripts/start-frontend.sh stop

# 重启前端服务
./scripts/start-frontend.sh restart

# 查看日志
./scripts/start-frontend.sh logs           # 查看最后50行日志
./scripts/start-frontend.sh logs 100       # 查看最后100行日志

# 实时查看日志
./scripts/start-frontend.sh follow

# 构建生产版本
./scripts/start-frontend.sh build

# 运行测试
./scripts/start-frontend.sh test

# 代码检查和格式化
./scripts/start-frontend.sh lint

# 安装/更新依赖
./scripts/start-frontend.sh install

# 查看帮助
./scripts/start-frontend.sh help
```

### 环境检查

脚本会自动检查：
- Node.js 和 npm 是否安装
- 前端目录和 package.json 是否存在
- 后端服务是否运行（会给出警告但不阻止启动）

### 访问地址

前端服务通常运行在 http://localhost:3000 (当前配置端口)

## 🎯 统一管理脚本

### 功能说明

`start-services.sh` 是主脚本，用于统一管理所有服务，按正确的顺序启动：
1. 基础设施服务
2. 后端服务
3. 前端服务

### 使用方法

```bash
# 启动所有服务（按正确顺序）
./scripts/start-services.sh

# 启动特定类型的服务
./scripts/start-services.sh start infrastructure  # 只启动基础设施
./scripts/start-services.sh start backend         # 只启动后端服务
./scripts/start-services.sh start frontend        # 只启动前端服务

# 查看所有服务状态
./scripts/start-services.sh status

# 停止所有服务
./scripts/start-services.sh stop

# 重启所有服务
./scripts/start-services.sh restart

# 查看日志
./scripts/start-services.sh logs all              # 查看所有服务日志
./scripts/start-services.sh logs infrastructure   # 查看基础设施日志
./scripts/start-services.sh logs backend          # 查看后端服务日志
./scripts/start-services.sh logs frontend         # 查看前端服务日志

# 直接调用子脚本
./scripts/start-services.sh infrastructure status    # 查看基础设施状态
./scripts/start-services.sh backend start user      # 启动用户服务
./scripts/start-services.sh frontend build          # 构建前端

# 查看帮助
./scripts/start-services.sh help
```

## 📊 日志管理

### 日志文件位置

所有服务的日志文件都存储在 `logs/` 目录下：

```
logs/
├── infrastructure.log          # 基础设施启动日志
├── user-service.log           # 用户服务日志
├── gateway.log                # 网关服务日志
└── frontend.log               # 前端服务日志
```

### PID文件管理

服务进程ID存储在 `pids/` 目录下：

```
pids/
├── user-service.pid           # 用户服务PID
├── gateway.pid                # 网关服务PID
└── frontend.pid               # 前端服务PID
```

### 日志查看技巧

```bash
# 实时查看所有服务日志
tail -f logs/*.log

# 查看特定服务的错误日志
grep -i error logs/user-service.log

# 查看最近的启动日志
tail -n 100 logs/infrastructure.log
```

## 🔍 故障排查

### 常见问题

#### 1. 端口冲突

**现象**: 服务启动失败，提示端口被占用

**解决方案**:
```bash
# 查看端口占用
lsof -i :8080
lsof -i :8001

# 终止占用端口的进程
kill -9 $(lsof -t -i :8080)

# 或者使用脚本停止服务
./scripts/start-services.sh stop
```

#### 2. 基础设施服务未启动

**现象**: 后端服务启动失败，提示数据库连接错误

**解决方案**:
```bash
# 检查基础设施服务状态
./scripts/start-infrastructure.sh status

# 重启基础设施服务
./scripts/start-infrastructure.sh restart

# 等待服务稳定后再启动后端
sleep 30
./scripts/start-backend.sh start
```

#### 3. 前端依赖问题

**现象**: 前端服务启动失败，提示模块找不到

**解决方案**:
```bash
# 重新安装依赖
./scripts/start-frontend.sh install

# 或者手动安装
cd erp-frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. 服务启动超时

**现象**: 服务启动时间过长或超时

**解决方案**:
```bash
# 查看详细日志
./scripts/start-backend.sh logs user

# 检查系统资源
free -h
df -h

# 增加启动等待时间（修改脚本中的超时设置）
```

### 调试技巧

```bash
# 1. 检查所有服务状态
./scripts/start-services.sh status

# 2. 查看启动日志
./scripts/start-services.sh logs all

# 3. 逐步启动服务进行调试
./scripts/start-infrastructure.sh
sleep 30
./scripts/start-backend.sh start user
sleep 10
./scripts/start-backend.sh start gateway
sleep 10
./scripts/start-frontend.sh

# 4. 检查网络连接
curl http://localhost:8080/actuator/health
curl http://localhost:8001/actuator/health
```

## 🚀 最佳实践

### 开发环境启动顺序

```bash
# 推荐的开发环境启动流程
./scripts/start-services.sh start infrastructure
# 等待基础设施稳定
sleep 30

./scripts/start-services.sh start backend
# 等待后端服务稳定
sleep 10

./scripts/start-services.sh start frontend
```

### 生产环境注意事项

1. **资源监控**: 定期检查系统资源使用情况
2. **日志轮转**: 配置日志轮转避免磁盘空间不足
3. **健康检查**: 定期执行健康检查确保服务正常
4. **备份策略**: 定期备份重要数据和配置

### 脚本维护

1. **权限管理**: 确保脚本有执行权限
2. **路径配置**: 使用绝对路径避免路径问题
3. **错误处理**: 脚本包含完善的错误处理机制
4. **日志记录**: 所有操作都有详细的日志记录

## 📞 获取帮助

如果在使用启动脚本过程中遇到问题：

1. **查看帮助**: 使用 `--help` 参数查看详细帮助信息
2. **检查日志**: 查看相应的日志文件了解错误详情
3. **重置环境**: 停止所有服务后重新启动
4. **提交Issue**: 在GitHub上提交问题报告

---

通过合理使用这些启动脚本，您可以高效地管理电商ERP系统的各种服务，提高开发和运维效率。