---
inclusion: always
---

# 电商 ERP 系统开发指南

## 系统概述

多平台电商 ERP 系统，用于管理跨市场（沃尔玛、亚马逊、eBay）的库存、订单和物流。

**架构**: 8 个微服务 + Vue 3 前端
**技术栈**: Java 17 + Spring Boot 3.2 + Vue 3 + TypeScript + MySQL + Redis + Kafka

## 关键规则

### 1. 服务启动（使用现有启动脚本）

**推荐使用项目提供的启动脚本，自动处理后台运行和日志记录：**

```bash
# 一键启动所有服务（推荐）
./scripts/start-services.sh

# 分步启动
./scripts/start-infrastructure.sh    # 基础设施
./scripts/start-backend.sh          # 后端服务
./scripts/start-frontend.sh         # 前端服务

# 查看服务状态
./scripts/start-services.sh status

# 查看日志
./scripts/start-services.sh logs
```

**手动启动（仅在脚本不可用时使用）：**

```bash
# 首先启动基础设施
docker-compose up -d mysql redis kafka nacos > logs/infrastructure-startup.log 2>&1

# 服务（必须使用nohup + 后台运行）
nohup java -jar erp-gateway/target/erp-gateway-1.0.jar --spring.profiles.active=dev > logs/gateway-startup.log 2>&1 &

# 前端
cd erp-frontend && nohup npm run dev > ../logs/frontend-startup.log 2>&1 &
```

### 2. 中文语言（强制要求）

- **所有代码注释**: 仅使用中文
- **数据库注释**: 必须使用中文
- **日志消息**: 中文
- **UI 文本**: 中文（Element Plus 中文语言包）
- **测试@DisplayName**: 中文

```java
/**
 * 用户服务实现类
 * 负责处理用户相关的业务逻辑
 */
@Service
public class UserServiceImpl implements UserService {
    /**
     * 根据用户ID获取用户信息
     */
    public UserDTO getUserById(Long userId) {
        log.info("查询用户信息，用户ID：{}", userId);
        return userMapper.selectById(userId);
    }
}
```

### 3. 命名规范（严格遵守）

- **控制器**: `{Entity}Controller`
- **服务**: `{Entity}Service` + `{Entity}ServiceImpl`
- **实体**: `{Entity}` (驼峰命名属性)
- **表**: `snake_case` 带中文注释
- **API**: `/api/{service}/{resource}`

### 4. 数据库标准

- **主键**: `id` (Long 类型，自增)
- **时间戳**: `created_at`, `updated_at` (必需)
- **外键**: `{table}_id`
- **所有列**: 必须有中文 COMMENT

## 服务结构（精确模式）

```
erp-{service}-service/
├── src/main/java/com/erp/{service}/
│   ├── {Service}Application.java    # @SpringBootApplication
│   ├── controller/                  # @RestController
│   ├── service/impl/               # @Service implementations
│   ├── entity/                     # @Entity JPA classes
│   ├── dto/                        # Data transfer objects
│   ├── mapper/                     # MyBatis @Mapper
│   └── config/                     # @Configuration
├── src/main/resources/
│   ├── application.yml
│   ├── mapper/                     # MyBatis XML
│   └── sql/init.sql
└── Dockerfile
```

## 前端标准（Vue 3 + TypeScript）

```
src/
├── views/                          # Page components (PascalCase)
│   ├── users/UserManagement.vue
│   ├── products/ProductManagement.vue
│   └── orders/OrderManagement.vue
├── components/
│   ├── common/                     # Base components (BaseButton, BaseTable)
│   └── business/                   # Domain-specific components
├── stores/                         # Pinia stores by domain
├── api/modules/                    # API services by domain
└── types/                          # TypeScript interfaces
```

**必需模式**:

- **组合式 API**: 使用 `<script setup>` 配合 TypeScript
- **Element Plus**: 中文语言包，统一主题
- **Pinia 状态管理**: 每个业务域一个 store
- **API 层**: 使用 Axios 拦截器，按服务组织

## 端口分配（固定）

- 网关: 8080
- 用户: 8001, 商品: 8002, 订单: 8003, 库存: 8004
- 平台: 8005, 物流: 8006, 通知: 8007
- 前端: 3000

## 构建命令

**后端**:

```bash
mvn clean package -DskipTests    # 快速构建
mvn test                         # 单元测试
```

**前端**:

```bash
cd erp-frontend
npm install && npm run build     # 生产构建
npm run dev                      # 开发模式（热重载）
npm run test:ci                  # 执行单元测试
```

## 代码质量

- **Java**: Google Java 代码风格 + Checkstyle
- **TypeScript**: ESLint + Prettier
- **测试覆盖率**: 后端 >80%, 前端 >70%
- **API 文档**: 所有端点使用 Swagger/OpenAPI

## 业务上下文

**关键工作流**:

1. 商品同步 → 平台 → 库存更新
2. 平台订单 → 内部订单 → 履约
3. 库存水平 → 通知 → 补货
4. 订单 → 物流供应商 → 跟踪更新

**用户角色**:

- **管理员**: 系统配置，用户管理
- **库存管理员**: 库存控制，预警，调整
- **订单管理员**: 订单处理，状态更新
- **平台管理员**: 电商平台集成
- **物流协调员**: 发货，跟踪，标签

## 健康监控

**使用启动脚本进行监控：**

```bash
# 查看所有服务状态
./scripts/start-services.sh status

# 查看特定服务状态
./scripts/start-backend.sh status
./scripts/start-frontend.sh status

# 查看日志
./scripts/start-services.sh logs all
./scripts/start-backend.sh logs user
./scripts/start-frontend.sh logs 100

# 实时查看日志
./scripts/start-frontend.sh follow
```

**手动监控命令：**

```bash
# 检查服务端口
netstat -tlnp | grep -E ':(8080|8001|8002|8003|8004|8005|8006|8007|3000)'

# 健康检查端点
curl -f http://localhost:8080/actuator/health

# 日志监控
tail -f logs/*.log
grep -i error logs/*.log
```

## 常见问题排查

### 登录异常问题

**症状**：出现"检测到异常登录行为，请稍后再试"或"用户名或密码错误"

**原因**：多次登录失败导致Redis中存储了锁定信息

**解决方案**：
```bash
# 方法1：清除所有Redis数据（推荐用于开发环境）
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 方法2：只清除特定用户的锁定信息
docker exec erp-redis redis-cli -a redis123 DEL "user:lock:admin"
docker exec erp-redis redis-cli -a redis123 DEL "user:error:admin"

# 重启用户服务
./scripts/start-backend.sh restart user
```

### 中文乱码问题

**症状**：API返回的中文数据显示为乱码，如 `ç³»ç»Ÿç®¡çå'˜`

**原因**：数据库连接字符编码配置不正确，导致UTF-8数据被错误存储

**解决方案**：

1. **检查数据库字符集**：
```bash
# 检查MySQL字符集设置
docker exec erp-mysql mysql -u root -proot123 -e "SHOW VARIABLES LIKE 'character_set%';"

# 检查表结构字符集
docker exec erp-mysql mysql -u root -proot123 -e "USE erp_user; SHOW CREATE TABLE sys_user;"
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
UPDATE sys_user SET real_name = '系统管理员' WHERE username = 'admin';
UPDATE sys_user SET real_name = '测试用户' WHERE username = 'test';
UPDATE sys_role SET role_name = '系统管理员' WHERE id = 1;
UPDATE sys_role SET role_name = '普通用户' WHERE id = 2;
"

# 重启用户服务
./scripts/start-backend.sh restart user
```

4. **验证修复结果**：
```bash
# 测试登录接口
curl -s -X POST "http://localhost:8001/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.userInfo.realName'

# 应该返回：系统管理员
```
## 快速启动参考

### 常用启动命令
```bash
# 一键启动完整系统
./scripts/start-services.sh

# 查看所有服务状态
./scripts/start-services.sh status

# 查看日志
./scripts/start-services.sh logs

# 停止所有服务
./scripts/start-services.sh stop
```

### 开发调试命令
```bash
# 启动特定服务
./scripts/start-backend.sh start user
./scripts/start-frontend.sh build

# 查看特定日志
./scripts/start-backend.sh logs user
./scripts/start-frontend.sh follow
```

## 访问地址

- **前端应用**: http://localhost:3000
- **API网关**: http://localhost:8080/api
- **用户服务**: http://localhost:8001
- **Nacos控制台**: http://localhost:8848/nacos (nacos/nacos)

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