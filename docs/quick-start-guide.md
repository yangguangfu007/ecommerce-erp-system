# 🚀 快速启动指南

本指南将帮助您在 5 分钟内启动完整的电商 ERP 系统。

## 📋 前置条件

### 必需软件
- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+
- **Git**: 任意版本

### 系统要求
- **内存**: 最少 8GB，推荐 16GB
- **磁盘**: 最少 20GB 可用空间
- **CPU**: 最少 4 核，推荐 8 核

## ⚡ 一键启动

### 方式一：开发环境启动脚本（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 执行一键启动脚本
./scripts/start-services.sh

# 3. 等待启动完成（约 3-5 分钟）
# 脚本会按顺序自动启动：
# - 基础设施服务（MySQL、Redis、Kafka、Nacos）
# - 后端微服务（用户服务、网关服务）
# - 前端应用（Vue.js开发服务器）

# 4. 查看服务状态
./scripts/start-services.sh status
```

### 方式二：生产环境部署脚本

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 执行生产部署脚本
chmod +x scripts/deploy/deploy.sh
./scripts/deploy/deploy.sh local

# 3. 等待部署完成（约 3-5 分钟）
# 脚本会自动：
# - 拉取所有必需的 Docker 镜像
# - 启动基础设施服务（数据库、缓存、消息队列等）
# - 启动微服务应用
# - 启动前端应用
# - 初始化测试数据
# - 执行健康检查
```

### 方式三：Docker Compose

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 启动所有服务
docker-compose up -d

# 3. 等待所有服务启动完成
docker-compose ps

# 4. 初始化数据（可选）
docker-compose exec mysql mysql -uroot -proot123 -e "source /docker-entrypoint-initdb.d/init.sql"
```

### 方式四：分步启动（开发调试）

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 分步启动服务
# 第一步：启动基础设施服务
./scripts/start-infrastructure.sh

# 第二步：启动后端服务
./scripts/start-backend.sh

# 第三步：启动前端服务
./scripts/start-frontend.sh

# 3. 查看各服务状态
./scripts/start-infrastructure.sh status
./scripts/start-backend.sh status
./scripts/start-frontend.sh status
```

## 🎯 验证部署

### 1. 检查服务状态

```bash
# 检查 Docker 容器状态
docker-compose ps

# 所有服务应该显示为 "Up" 状态
```

### 2. 访问系统界面

打开浏览器访问以下地址：

- **前端管理界面**: http://localhost:3000 (开发模式) 或 http://localhost:5174 (备用端口)
- **API 网关**: http://localhost:8080/api
- **API 文档**: http://localhost:8080/swagger-ui.html
- **Nacos 控制台**: http://localhost:8848/nacos (nacos/nacos)
- **监控面板**: http://localhost:3001 (admin/admin123)

### 3. 登录测试

使用以下账号登录前端系统：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 系统管理员 |
| manager | manager123 | 业务经理 |
| user | user123 | 普通用户 |

### 4. 功能验证

登录后可以测试以下功能：

- ✅ 用户管理：创建、编辑、删除用户
- ✅ 商品管理：添加商品、管理分类
- ✅ 订单管理：创建订单、查看订单状态
- ✅ 库存管理：查看库存、调整库存
- ✅ 系统监控：查看系统运行状态

## 🔧 常见问题

### 问题 1：端口冲突

**现象**: 启动失败，提示端口被占用

**解决方案**:
```bash
# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# 停止占用端口的进程
sudo kill -9 <PID>

# 或者修改 docker-compose.yml 中的端口映射
```

### 问题 2：内存不足

**现象**: 容器启动后自动退出

**解决方案**:
```bash
# 检查系统内存
free -h

# 增加 Docker 内存限制
# 在 Docker Desktop 设置中增加内存分配

# 或者减少并发启动的服务
docker-compose up -d mysql redis
sleep 30
docker-compose up -d
```

### 问题 3：数据库连接失败

**现象**: 应用启动失败，数据库连接错误

**解决方案**:
```bash
# 检查 MySQL 容器状态
docker-compose logs mysql

# 重启 MySQL 服务
docker-compose restart mysql

# 等待 MySQL 完全启动后再启动应用服务
docker-compose up -d mysql
sleep 60
docker-compose up -d
```

### 问题 4：前端页面无法访问

**现象**: 浏览器无法打开前端页面

**解决方案**:
```bash
# 检查前端服务状态
./scripts/start-frontend.sh status

# 查看前端服务日志
./scripts/start-frontend.sh logs

# 重启前端服务
./scripts/start-frontend.sh restart

# 如果使用Docker方式，检查前端容器状态
docker-compose logs erp-frontend
docker-compose restart erp-frontend
```

## 🛠️ 高级配置

### 自定义配置

如需修改默认配置，可以编辑以下文件：

```bash
# 修改数据库配置
vim docker-compose.yml

# 修改应用配置
vim helm/erp-system/values.yaml

# 修改前端配置
vim erp-frontend/src/config/index.ts
```

### 开发模式

如果需要进行开发调试：

```bash
# 方式一：使用启动脚本（推荐）
./scripts/start-infrastructure.sh    # 启动基础设施
./scripts/start-backend.sh          # 启动后端服务
./scripts/start-frontend.sh         # 启动前端开发服务器

# 方式二：手动启动
# 启动基础设施服务
docker-compose up -d mysql redis kafka nacos

# 本地启动前端开发服务器
cd erp-frontend
npm install
npm run dev

# 前端开发服务器会在 http://localhost:3000 启动
```

### 生产部署

生产环境部署请参考：
- [部署指南](deployment-guide.md)
- [Kubernetes 部署](../k8s/README.md)
- [Helm Charts](../helm/README.md)

## 📞 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

1. **查看日志**: `docker-compose logs [service-name]`
2. **健康检查**: `./scripts/deploy/health-check.sh`
3. **重置环境**: `docker-compose down -v && docker-compose up -d`
4. **提交 Issue**: [GitHub Issues](https://github.com/yangguangfu007/ecommerce-erp-system/issues)

## 🎉 下一步

系统启动成功后，您可以：

1. 📖 阅读 [用户指南](user-guide.md) 了解详细功能
2. 🔧 查看 [开发文档](development-guide.md) 进行二次开发
3. 📊 配置 [监控告警](monitoring-guide.md) 
4. 🚀 部署到 [生产环境](deployment-guide.md)

---

**🎯 目标**: 让您在 5 分钟内体验完整的电商 ERP 系统！

如有任何问题，欢迎联系我们：yangguangfu007@foxmail.com