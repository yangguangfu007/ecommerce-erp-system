# 电商ERP系统故障排除指南

本文档提供了电商ERP系统开发和运行过程中常见问题的解决方案。

## 🚨 紧急问题快速解决

### 登录异常问题

**症状**：
- "检测到异常登录行为，请稍后再试"
- "用户名或密码错误"（但密码确实正确）
- 登录接口返回500错误

**原因**：
多次登录失败导致Redis中存储了用户锁定信息，或者用户服务出现异常。

**快速解决方案**：
```bash
# 1. 清除Redis中的所有数据（开发环境推荐）
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 2. 重启用户服务
./scripts/start-backend.sh restart user

# 3. 验证修复结果
curl -s -X POST "http://localhost:8001/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**精确解决方案**（只清除特定用户锁定）：
```bash
# 清除特定用户的锁定信息
docker exec erp-redis redis-cli -a redis123 DEL "user:lock:admin"
docker exec erp-redis redis-cli -a redis123 DEL "user:error:admin"

# 查看Redis中的相关键
docker exec erp-redis redis-cli -a redis123 KEYS "user:*"
```

### 中文乱码问题

**症状**：
- API返回的中文数据显示为 `ç³»ç»Ÿç®¡çå'˜` 等乱码
- 前端页面显示中文异常
- 数据库查询结果中文显示不正确

**原因**：
数据库连接字符编码配置不正确，导致UTF-8数据被错误存储或读取。

**解决方案**：

1. **检查问题根源**：
```bash
# 检查MySQL字符集设置
docker exec erp-mysql mysql -u root -proot123 -e "SHOW VARIABLES LIKE 'character_set%';"

# 检查表结构字符集
docker exec erp-mysql mysql -u root -proot123 -e "USE erp_user; SHOW CREATE TABLE sys_user;"

# 检查数据的十六进制表示
docker exec erp-mysql mysql -u root -proot123 -e "USE erp_user; SELECT id, HEX(real_name), real_name FROM sys_user WHERE id = 1;"
```

2. **修复应用配置**：
确保 `erp-user-service/src/main/resources/application.yml` 中的数据库连接URL正确：
```yaml
datasource:
  url: jdbc:mysql://localhost:3306/erp_user?useUnicode=true&characterEncoding=utf8&connectionCollation=utf8mb4_unicode_ci&autoReconnect=true&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=GMT%2B8
```

3. **修复数据库数据**：
```bash
# 使用正确的字符集重新插入数据
docker exec erp-mysql mysql -u root -proot123 --default-character-set=utf8mb4 -e "
USE erp_user;
-- 清理错误数据
DELETE FROM sys_user WHERE id IN (1, 2);
DELETE FROM sys_user_role WHERE user_id IN (1, 2);

-- 重新插入正确的用户数据
INSERT INTO sys_user (id, username, password, real_name, email, phone, status, locked, create_by) VALUES
(1, 'admin', '\$2a\$10\$N.zmdr9k7uOCQb07XjVqSOBFDAK0LXSyYy2FkFcoGLUxDdmLHJWw6', '系统管理员', 'admin@erp.com', '13800138000', 1, 0, 1),
(2, 'test', '\$2a\$10\$N.zmdr9k7uOCQb07XjVqSOBFDAK0LXSyYy2FkFcoGLUxDdmLHJWw6', '测试用户', 'test@erp.com', '13800138001', 1, 0, 1);

-- 重新插入用户角色关联
INSERT INTO sys_user_role (id, user_id, role_id, create_by) VALUES
(1, 1, 1, 1),
(2, 2, 2, 1);

-- 修复角色数据
UPDATE sys_role SET role_name = '系统管理员', description = '系统管理员角色，拥有所有权限' WHERE id = 1;
UPDATE sys_role SET role_name = '普通用户', description = '普通用户角色，拥有基本权限' WHERE id = 2;
UPDATE sys_role SET role_name = '运营人员', description = '运营人员角色，负责订单和商品管理' WHERE id = 3;
UPDATE sys_role SET role_name = '仓库管理员', description = '仓库管理员角色，负责库存和物流管理' WHERE id = 4;
"
```

4. **重启服务并验证**：
```bash
# 重启用户服务
./scripts/start-backend.sh restart user

# 验证修复结果
curl -s -X POST "http://localhost:8001/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.userInfo.realName'

# 应该返回：系统管理员
```

## 🔧 服务相关问题

### 服务启动失败

**症状**：
- 服务无法启动
- 端口被占用
- 数据库连接失败

**解决方案**：

1. **检查端口占用**：
```bash
# 查看端口占用情况
netstat -tlnp | grep -E ':(8080|8001|8002|8003|8004|8005|8006|8007|3000)'

# 终止占用端口的进程
kill -9 $(lsof -t -i :8080)
```

2. **检查服务日志**：
```bash
# 查看服务启动日志
tail -f logs/user-service.log
tail -f logs/gateway.log
tail -f logs/frontend.log

# 查找错误信息
grep -i error logs/*.log
grep -i exception logs/*.log
```

3. **重启服务**：
```bash
# 重启特定服务
./scripts/start-backend.sh restart user
./scripts/start-backend.sh restart gateway
./scripts/start-frontend.sh restart

# 重启所有服务
./scripts/start-services.sh restart
```

### 数据库连接问题

**症状**：
- 服务启动时报数据库连接错误
- API调用返回数据库相关错误

**解决方案**：

1. **检查数据库容器状态**：
```bash
# 查看Docker容器状态
docker ps | grep mysql
docker ps | grep redis

# 查看容器日志
docker logs erp-mysql
docker logs erp-redis
```

2. **重启基础设施服务**：
```bash
# 重启基础设施
./scripts/start-infrastructure.sh restart

# 等待服务就绪
sleep 30

# 重启应用服务
./scripts/start-backend.sh restart
```

3. **手动测试数据库连接**：
```bash
# 测试MySQL连接
docker exec erp-mysql mysql -u root -proot123 -e "SELECT 1;"

# 测试Redis连接
docker exec erp-redis redis-cli -a redis123 ping
```

## 🌐 前端相关问题

### 前端页面无法加载数据

**症状**：
- 页面显示空白或加载中状态
- 控制台显示API请求错误
- 网络请求返回401或500错误

**解决方案**：

1. **检查API服务状态**：
```bash
# 检查后端服务是否运行
./scripts/start-services.sh status

# 测试API接口
curl -s http://localhost:8080/actuator/health
curl -s http://localhost:8001/actuator/health
```

2. **检查前端服务**：
```bash
# 查看前端服务状态
./scripts/start-frontend.sh status

# 查看前端日志
./scripts/start-frontend.sh logs

# 重启前端服务
./scripts/start-frontend.sh restart
```

3. **清理前端缓存**：
```bash
cd erp-frontend

# 清理依赖
rm -rf node_modules
rm package-lock.json

# 重新安装依赖
npm install

# 重新启动
npm run dev
```

### 前端构建失败

**症状**：
- `npm run build` 失败
- TypeScript编译错误
- 依赖包版本冲突

**解决方案**：

1. **清理并重新安装依赖**：
```bash
cd erp-frontend

# 清理缓存
npm cache clean --force

# 删除依赖
rm -rf node_modules
rm package-lock.json

# 重新安装
npm install
```

2. **检查Node.js版本**：
```bash
# 检查版本
node --version
npm --version

# 推荐使用Node.js 18+
```

3. **修复TypeScript错误**：
```bash
# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 自动修复部分问题
npm run lint:fix
```

## 🔄 环境重置

### 完全重置开发环境

当遇到复杂问题时，可以使用以下步骤完全重置开发环境：

```bash
# 1. 停止所有服务
./scripts/start-services.sh stop

# 2. 清理Docker容器和数据
docker-compose down -v
docker system prune -f

# 3. 重新启动基础设施
./scripts/start-infrastructure.sh

# 4. 等待基础设施就绪
sleep 60

# 5. 重新初始化数据库
docker exec erp-mysql mysql -u root -proot123 < erp-user-service/src/main/resources/sql/init.sql

# 6. 清除Redis数据
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 7. 重新编译后端服务
cd erp-user-service && mvn clean compile
cd ../erp-gateway && mvn clean compile

# 8. 重新安装前端依赖
cd ../erp-frontend
rm -rf node_modules
npm install

# 9. 启动所有服务
cd ..
./scripts/start-services.sh

# 10. 验证系统状态
./scripts/start-services.sh status
```

## 📞 获取帮助

如果以上解决方案都无法解决问题，请：

1. **收集错误信息**：
```bash
# 收集所有日志
mkdir -p debug-logs
cp logs/*.log debug-logs/
./scripts/start-services.sh status > debug-logs/service-status.txt
docker ps > debug-logs/docker-status.txt
```

2. **检查系统环境**：
```bash
# 系统信息
uname -a > debug-logs/system-info.txt
docker --version >> debug-logs/system-info.txt
node --version >> debug-logs/system-info.txt
java --version >> debug-logs/system-info.txt
```

3. **联系开发团队**：
   - 提交Issue到项目仓库
   - 附上错误日志和系统信息
   - 描述复现步骤

---

**注意**：本文档中的命令主要适用于开发环境。生产环境请谨慎操作，特别是涉及数据清理的命令。