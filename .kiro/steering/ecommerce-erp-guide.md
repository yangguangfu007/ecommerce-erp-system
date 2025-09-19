---
inclusion: always
---

# 电商 ERP 系统开发指南

## 系统概述

多平台电商 ERP 系统，用于管理跨市场（沃尔玛、亚马逊、eBay）的库存、订单和物流。

**架构**: 8 个微服务 + Vue 3 前端
**技术栈**: Java 17 + Spring Boot 3.2 + Vue 3 + TypeScript + MySQL + Redis + Kafka
**数据库框架**: MyBatis Plus 3.5.4 (统一数据库操作框架)

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
        // 使用MyBatis Plus的selectById方法
        User user = userMapper.selectById(userId);
        return convertToDTO(user);
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

- **ORM框架**: 统一使用 MyBatis Plus 3.5.4 进行数据库操作
- **主键**: `id` (Long 类型，自增)
- **时间戳**: `create_time`, `update_time` (必需，使用MyBatis Plus自动填充)
- **外键**: `{table}_id`
- **所有列**: 必须有中文 COMMENT
- **实体基类**: 继承 `BaseEntity` 获得通用字段和审计功能

## 服务结构（精确模式）

```
erp-{service}-service/
├── src/main/java/com/erp/{service}/
│   ├── {Service}Application.java    # @SpringBootApplication
│   ├── controller/                  # @RestController
│   ├── service/impl/               # @Service implementations
│   ├── entity/                     # MyBatis Plus 实体类 (继承BaseEntity)
│   ├── dto/                        # Data transfer objects
│   ├── mapper/                     # MyBatis Plus BaseMapper接口
│   └── config/                     # @Configuration
├── src/main/resources/
│   ├── application.yml
│   ├── mapper/                     # MyBatis Plus XML映射文件 (可选)
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

## ERP-Common 公共模块（优先使用）

### 模块概述

**erp-common** 是系统的核心公共模块，提供了完整的 MyBatis Plus 增强功能、工具类和基础组件。**所有业务服务模块必须优先使用公共模块提供的功能，避免重复实现。**

### 核心能力

#### 1. MyBatis Plus 增强配置（开箱即用）

公共模块已经提供了完整的 MyBatis Plus 配置，包括：

- **BaseEntity**: 通用实体基类，包含审计字段和乐观锁支持
- **BaseMapperPlus**: 增强的Mapper接口，提供更多便捷方法
- **BaseServicePlus**: 增强的Service接口和实现类
- **MyMetaObjectHandler**: 自动填充处理器（创建时间、更新时间等）
- **分页插件**: 支持MySQL分页，可配置最大限制
- **乐观锁插件**: 支持版本号乐观锁
- **防护插件**: 防止全表更新删除、SQL注入检查

#### 2. 工具类库（直接使用）

- **QueryWrapperUtils**: 查询构造器工具，简化条件构建
- **PageUtils**: 分页工具，统一分页处理
- **UserContext**: 用户上下文管理，线程安全
- **Result**: 统一响应格式封装
- **PageResult**: 分页结果封装
- **BusinessException**: 业务异常处理

#### 3. 类型处理器（自动支持）

- **JsonTypeHandler**: JSON字段自动序列化/反序列化
- **EnumTypeHandler**: 枚举类型自动处理

### 标准使用方式

#### 实体类开发（继承BaseEntity）

```java
/**
 * 平台信息实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("platforms")
public class Platform extends BaseEntity {
    
    /**
     * 平台名称
     */
    private String name;
    
    /**
     * 平台类型
     */
    @EnumValue
    private PlatformType type;
    
    /**
     * 平台状态
     */
    @EnumValue
    private PlatformStatus status;
    
    /**
     * API配置信息（JSON字段）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> apiConfig;
}
```

#### Mapper接口开发（继承BaseMapperPlus）

```java
/**
 * 平台信息数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 */
@Mapper
public interface PlatformMapper extends BaseMapperPlus<Platform> {
    
    /**
     * 根据平台类型查询平台列表
     */
    @Select("SELECT * FROM platforms WHERE type = #{type} AND deleted = 0")
    List<Platform> selectByType(@Param("type") PlatformType type);
}
```

#### Service层开发（继承BaseServicePlus）

```java
/**
 * 平台服务接口
 * 继承BaseServicePlus获得增强的业务方法
 */
public interface PlatformService extends BaseServicePlus<Platform> {
    Platform createPlatform(PlatformDTO platformDTO);
    PageResult<Platform> getPlatformPage(Long page, Long size, PlatformQueryDTO queryDTO);
}

/**
 * 平台服务实现类
 * 继承BaseServicePlusImpl获得完整的业务实现
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class PlatformServiceImpl extends BaseServicePlusImpl<PlatformMapper, Platform> 
    implements PlatformService {
    
    @Override
    public Platform createPlatform(PlatformDTO platformDTO) {
        Platform platform = new Platform();
        BeanUtils.copyProperties(platformDTO, platform);
        
        // 使用公共模块的save方法，自动处理审计字段
        save(platform);
        return platform;
    }
    
    @Override
    public PageResult<Platform> getPlatformPage(Long page, Long size, PlatformQueryDTO queryDTO) {
        // 使用公共模块的分页工具
        Page<Platform> pageObj = PageUtils.createPage(page, size);
        
        // 使用公共模块的查询构造器工具
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.likeIfPresent(wrapper, Platform::getName, queryDTO.getName());
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getType, queryDTO.getType());
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getStatus, queryDTO.getStatus());
        wrapper.orderByDesc(Platform::getCreateTime);
        
        Page<Platform> result = page(pageObj, wrapper);
        return PageUtils.toPageResult(result);
    }
}
```

#### Controller层开发（使用统一响应）

```java
/**
 * 平台管理控制器
 * 使用公共模块的Result进行响应封装
 */
@RestController
@RequestMapping("/api/platforms")
public class PlatformController {
    
    @Autowired
    private PlatformService platformService;
    
    /**
     * 创建平台
     */
    @PostMapping
    public Result<Platform> createPlatform(@RequestBody @Valid PlatformDTO platformDTO) {
        try {
            Platform platform = platformService.createPlatform(platformDTO);
            return Result.success(platform);
        } catch (BusinessException e) {
            return Result.error(e.getMessage());
        }
    }
    
    /**
     * 分页查询平台列表
     */
    @GetMapping
    public Result<PageResult<Platform>> getPlatformPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            PlatformQueryDTO queryDTO) {
        
        PageResult<Platform> result = platformService.getPlatformPage(page, size, queryDTO);
        return Result.success(result);
    }
}
```

### 依赖引入

各业务服务模块只需在pom.xml中引入公共模块依赖：

```xml
<dependency>
    <groupId>com.erp.system</groupId>
    <artifactId>erp-common</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### 配置说明

公共模块提供默认配置，各服务模块可选择性覆盖：

```yaml
# 使用公共模块的默认配置（推荐）
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
  mapper-locations: classpath*:mapper/**/*.xml
```

### 开发原则

1. **优先使用公共模块**: 所有通用功能必须使用公共模块提供的实现
2. **避免重复开发**: 不要在业务模块中重复实现公共模块已有的功能
3. **统一标准**: 所有实体类继承BaseEntity，所有Service继承BaseServicePlus
4. **配置复用**: 使用公共模块的默认配置，特殊需求时才自定义覆盖

## 代码质量

- **Java**: Google Java 代码风格 + Checkstyle
- **TypeScript**: ESLint + Prettier
- **测试覆盖率**: 后端 >80%, 前端 >70%
- **API 文档**: 所有端点使用 Swagger/OpenAPI
- **数据库操作**: 统一使用 MyBatis Plus，禁止直接使用 JDBC 或其他 ORM

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

## API 接口开发标准

### API 基本信息

- **Base URL**: `http://localhost:8080/api` (开发环境)
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API 版本**: v1.0

### 重要字段标准

#### 时间字段统一规范
- **createTime**: 创建时间字段（后端返回格式，ISO 8601格式）
- **updateTime**: 更新时间字段（后端返回格式，ISO 8601格式）
- **lastLoginTime**: 最后登录时间
- **orderDate**: 订单日期
- **shippedAt**: 发货时间
- **deliveredAt**: 送达时间

#### 用户相关字段
- **realName**: 用户真实姓名（统一字段名，后端返回字段，前端直接使用）
- **status**: 用户状态，数字类型（0-禁用，1-启用）
- **locked**: 锁定状态，数字类型（0-未锁定，1-锁定）
- **roleNames**: 角色名称数组（后端返回字段）

#### 商品相关字段
- **name**: 商品名称（统一字段名，后端返回字段，前端直接使用）
- **categoryId**: 分类ID，数字类型（后端返回格式）
- **categoryName**: 分类名称，字符串类型（用于显示）
- **dimensions**: 商品尺寸，字符串格式（如："147.6x71.6x7.8"）
- **status**: 商品状态，枚举类型（ACTIVE/INACTIVE/DELETED）

### 请求格式标准

#### 认证请求头
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### GET 请求格式
```http
GET /api/{service}/{resource}?page=1&size=10&keyword=搜索词
Authorization: Bearer your_token
```

#### POST 请求格式
```http
POST /api/{service}/{resource}
Authorization: Bearer your_token
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

#### PUT 请求格式
```http
PUT /api/{service}/{resource}/{id}
Authorization: Bearer your_token
Content-Type: application/json

{
  "field1": "updated_value1",
  "field2": "updated_value2"
}
```

#### DELETE 请求格式
```http
DELETE /api/{service}/{resource}/{id}
Authorization: Bearer your_token
```

### 响应格式标准

#### 成功响应格式
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 分页响应格式
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      // 数据列表
    ],
    "page": 1,
    "size": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 错误响应格式
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "INVALID_PARAMETER",
  "details": [
    {
      "field": "fieldName",
      "message": "字段错误描述"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 分页参数标准

#### 通用分页参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1，从1开始 |
| size | int | 否 | 每页大小，默认 10 |

#### 分页响应信息
- **content**: 数据列表数组
- **page**: 当前页码（从1开始）
- **size**: 每页大小
- **total**: 总记录数
- **totalPages**: 总页数

### HTTP 状态码标准

| 状态码 | 说明           | 使用场景 |
| ------ | -------------- | -------- |
| 200    | 请求成功       | GET、PUT、DELETE成功 |
| 201    | 创建成功       | POST创建资源成功 |
| 400    | 请求参数错误   | 参数验证失败 |
| 401    | 未授权         | Token无效或过期 |
| 403    | 禁止访问       | 权限不足 |
| 404    | 资源不存在     | 请求的资源不存在 |
| 409    | 冲突           | 资源冲突（如重复创建） |
| 500    | 服务器内部错误 | 系统异常 |

### 业务错误码标准

#### 通用错误码
- **SUCCESS**: 操作成功
- **INVALID_PARAMETER**: 请求参数错误
- **UNAUTHORIZED**: 未授权访问
- **FORBIDDEN**: 禁止访问
- **NOT_FOUND**: 资源不存在
- **INTERNAL_ERROR**: 服务器内部错误

#### 业务错误码
- **USER_NOT_FOUND**: 用户不存在
- **INVALID_CREDENTIALS**: 用户名或密码错误
- **TOKEN_EXPIRED**: Token已过期
- **PRODUCT_NOT_FOUND**: 商品不存在
- **SKU_ALREADY_EXISTS**: SKU已存在
- **INSUFFICIENT_INVENTORY**: 库存不足
- **ORDER_NOT_FOUND**: 订单不存在
- **PLATFORM_API_ERROR**: 平台API调用失败

### API 命名规范

#### RESTful API 路径规范
- **资源集合**: `/api/{service}/{resources}` (复数形式)
- **单个资源**: `/api/{service}/{resources}/{id}`
- **子资源**: `/api/{service}/{resources}/{id}/{sub-resources}`
- **操作**: `/api/{service}/{resources}/{id}/{action}`

#### 示例
```
GET    /api/users              # 获取用户列表
GET    /api/users/{id}         # 获取用户详情
POST   /api/users              # 创建用户
PUT    /api/users/{id}         # 更新用户
DELETE /api/users/{id}         # 删除用户
POST   /api/users/{id}/reset-password  # 重置密码
```

### 数据验证标准

#### 必填字段验证
- 所有必填字段必须进行非空验证
- 返回具体的字段错误信息

#### 数据格式验证
- 邮箱格式验证
- 手机号格式验证
- 日期格式验证（ISO 8601）
- 数值范围验证

#### 业务规则验证
- 唯一性验证（如用户名、SKU）
- 关联性验证（如外键存在性）
- 状态转换验证

### 接口文档标准

#### 每个接口必须包含
1. **接口描述**: 简要说明接口功能
2. **请求方法**: GET/POST/PUT/DELETE
3. **请求路径**: 完整的API路径
4. **请求参数**: 参数表格，包含类型、必填、说明
5. **请求示例**: 完整的请求示例
6. **响应示例**: 成功和失败的响应示例
7. **错误码说明**: 可能的错误码及说明

#### 参数文档格式
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 资源ID |
| name | string | 是 | 资源名称 |
| status | int | 否 | 状态：0-禁用，1-启用 |

更多详细信息请参考：
- [ERP-Common模块文档](../erp-common/README.md)
- [API接口文档](../docs/api-documentation.md)
