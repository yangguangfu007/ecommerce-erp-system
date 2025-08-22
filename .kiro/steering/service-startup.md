---
inclusion: always
---

# 服务启动标准

## 关键规则：使用项目启动脚本

项目提供了完整的启动脚本套件，位于 `scripts/` 目录，**强烈推荐使用这些脚本**来管理服务启动、停止和监控。

## 推荐启动方式（使用项目脚本）

### 一键启动所有服务

```bash
# 启动完整系统（推荐）
./scripts/start-services.sh

# 查看所有服务状态
./scripts/start-services.sh status

# 停止所有服务
./scripts/start-services.sh stop

# 重启所有服务
./scripts/start-services.sh restart
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

### 启动特定服务

```bash
# 启动特定后端服务
./scripts/start-backend.sh start user      # 用户服务
./scripts/start-backend.sh start gateway   # 网关服务

# 前端相关操作
./scripts/start-frontend.sh build          # 构建生产版本
./scripts/start-frontend.sh test           # 运行测试
./scripts/start-frontend.sh lint           # 代码检查
```

## 启动脚本功能

### start-services.sh - 统一管理脚本

- **功能**: 统一管理所有服务，按正确顺序启动
- **特点**: 自动处理服务依赖关系，等待服务稳定
- **日志**: 集中管理所有服务日志

### start-infrastructure.sh - 基础设施服务

- **服务**: MySQL 8.0.35, Redis 7.2.3, Kafka 3.6.0, Nacos 2.3.0
- **端口**: 3306, 6379, 9092, 8848
- **特点**: 自动等待服务启动完成，健康检查

### start-backend.sh - 后端服务

- **服务**: 用户服务(8001), 网关服务(8080)
- **特点**: 自动检查基础设施依赖，PID 管理
- **日志**: 独立日志文件，实时监控

### start-frontend.sh - 前端服务

- **服务**: Vue.js 开发服务器(3000)
- **特点**: 自动安装依赖，支持构建和测试
- **功能**: 开发、构建、测试、代码检查

## 日志文件结构

### 启动脚本生成的日志文件

```
logs/
├── infrastructure.log          # 基础设施服务（Docker）
├── user-service.log           # 用户服务 (端口 8001)
├── gateway.log                # 网关服务 (端口 8080)
└── frontend.log               # 前端服务 (端口 3000)
```

### PID 文件（进程管理）

```
pids/
├── user-service.pid           # 用户服务进程ID
├── gateway.pid                # 网关服务进程ID
└── frontend.pid               # 前端服务进程ID
```

## 服务健康监控

### 使用启动脚本监控（推荐）

```bash
# 查看所有服务状态
./scripts/start-services.sh status

# 查看特定服务状态
./scripts/start-infrastructure.sh status
./scripts/start-backend.sh status
./scripts/start-frontend.sh status

# 查看日志
./scripts/start-services.sh logs all
./scripts/start-backend.sh logs user
./scripts/start-frontend.sh logs 100

# 实时查看日志
./scripts/start-frontend.sh follow
```

### 手动状态检查命令

```bash
# 检查Docker服务
docker-compose ps

# 检查服务端口
netstat -tlnp | grep -E ':(8080|8001|8002|8003|8004|8005|8006|8007|3000)'

# 健康检查端点（Spring Actuator）
curl -f http://localhost:8080/actuator/health  # 网关
curl -f http://localhost:8001/actuator/health  # 用户服务
```

## 启动顺序（关键顺序）

### 使用启动脚本（自动处理顺序）

```bash
# 一键启动，自动按正确顺序启动
./scripts/start-services.sh
```

### 手动启动顺序

1. **基础设施**: `./scripts/start-infrastructure.sh`
2. **等待 30 秒** 基础设施就绪
3. **后端服务**: `./scripts/start-backend.sh` 启动用户服务和网关
4. **前端**: `./scripts/start-frontend.sh` 启动 Vue.js 开发服务器

## 错误恢复

### 使用启动脚本恢复（推荐）

```bash
# 停止所有服务
./scripts/start-services.sh stop

# 重启所有服务
./scripts/start-services.sh restart

# 重启特定服务
./scripts/start-backend.sh restart user
./scripts/start-frontend.sh restart
```

### 手动错误恢复

#### 端口冲突

```bash
# 查找使用端口的进程
lsof -i :8080

# 终止进程
kill -9 $(lsof -t -i :8080)
```

#### 失败的服务

```bash
# 清理失败的进程
pkill -f "erp-.*-service"

# 使用脚本重启
./scripts/start-backend.sh restart gateway
```

#### 登录异常问题

当出现"检测到异常登录行为，请稍后再试"或"用户名或密码错误"等登录问题时：

```bash
# 清除Redis中的登录锁定信息
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 或者只清除特定的锁定键
docker exec erp-redis redis-cli -a redis123 DEL "user:lock:admin"
docker exec erp-redis redis-cli -a redis123 DEL "user:error:admin"

# 重启用户服务
./scripts/start-backend.sh restart user
```

#### 中文乱码问题

如果API返回的中文数据出现乱码：

1. **检查数据库字符集**：
```bash
# 检查数据库字符集设置
docker exec erp-mysql mysql -u root -proot123 -e "SHOW VARIABLES LIKE 'character_set%';"

# 检查表字符集
docker exec erp-mysql mysql -u root -proot123 -e "USE erp_user; SHOW CREATE TABLE sys_user;"
```

2. **修复数据库连接字符集**：
确保 `application.yml` 中的数据库连接URL包含正确的字符编码：
```yaml
url: jdbc:mysql://localhost:3306/erp_user?useUnicode=true&characterEncoding=utf8&connectionCollation=utf8mb4_unicode_ci&autoReconnect=true&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=GMT%2B8
```

3. **重新插入正确的中文数据**：
```bash
# 使用正确的字符集连接数据库并更新数据
docker exec erp-mysql mysql -u root -proot123 --default-character-set=utf8mb4 -e "
USE erp_user;
UPDATE sys_user SET real_name = '系统管理员' WHERE username = 'admin';
UPDATE sys_user SET real_name = '测试用户' WHERE username = 'test';
UPDATE sys_role SET role_name = '系统管理员' WHERE id = 1;
UPDATE sys_role SET role_name = '普通用户' WHERE id = 2;
"
```

## 服务管理最佳实践

### 开发环境启动

```bash
# 完整开发环境启动
./scripts/start-services.sh

# 查看启动状态
./scripts/start-services.sh status

# 查看日志确认启动成功
./scripts/start-services.sh logs
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

## 访问地址

- **前端应用**: http://localhost:3000
- **API 网关**: http://localhost:8080/api
- **用户服务**: http://localhost:8001
- **Nacos 控制台**: http://localhost:8848/nacos (nacos/nacos)

## 获取帮助

每个脚本都支持 `help` 命令：

```bash
./scripts/start-services.sh help
./scripts/start-infrastructure.sh help
./scripts/start-backend.sh help
./scripts/start-frontend.sh help
```

更多详细信息请参考：

- [启动脚本使用指南](../docs/startup-scripts-guide.md)
- [scripts/README.md](../scripts/README.md)
