# ERP Common Module

ERP系统公共模块，提供通用的工具类、基础配置和公共组件，供各个业务服务模块使用。

## 模块特点

- **纯工具性质**：不提供独立服务，仅作为依赖库使用
- **可选配置**：所有配置都是可选的，各服务模块可以覆盖或自定义
- **零侵入性**：不强制依赖特定的数据库或中间件
- **高度复用**：提供通用的业务基础组件

## 主要功能

### 1. MyBatis Plus 增强配置

#### 核心组件
- **BaseEntity**: 通用实体基类，包含审计字段和乐观锁支持
- **BaseMapperPlus**: 增强的Mapper接口，提供更多便捷方法
- **BaseServicePlus**: 增强的Service接口和实现类
- **MyMetaObjectHandler**: 自动填充处理器，支持创建时间、更新时间等字段

#### 插件配置
- **分页插件**: 支持MySQL分页，可配置最大限制
- **乐观锁插件**: 支持版本号乐观锁
- **防护插件**: 防止全表更新删除、SQL注入检查
- **自定义SQL注入器**: 支持批量插入、批量更新等操作

#### 使用方式
```java
// 1. 实体类继承BaseEntity
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("your_table")
public class YourEntity extends BaseEntity {
    private String name;
    // 其他字段...
}

// 2. Mapper接口继承BaseMapperPlus
@Mapper
public interface YourMapper extends BaseMapperPlus<YourEntity> {
    // 自定义方法...
}

// 3. Service继承BaseServicePlus
public interface YourService extends BaseServicePlus<YourEntity> {
    // 自定义方法...
}

@Service
public class YourServiceImpl extends BaseServicePlusImpl<YourMapper, YourEntity> 
    implements YourService {
    // 业务实现...
}
```

### 2. 工具类

#### 查询构造器工具 (QueryWrapperUtils)
```java
// 构建查询条件
LambdaQueryWrapper<User> wrapper = QueryWrapperUtils.lambdaQuery(User.class);
QueryWrapperUtils.eqIfPresent(wrapper, User::getStatus, status);
QueryWrapperUtils.likeIfPresent(wrapper, User::getName, name);
QueryWrapperUtils.betweenTime(wrapper, User::getCreateTime, startTime, endTime);
```

#### 分页工具 (PageUtils)
```java
// 创建分页对象
Page<User> page = PageUtils.createPage(1L, 10L, "create_time", "desc");

// 转换分页结果
PageResult<UserDTO> result = PageUtils.toPageResult(page, user -> convertToDTO(user));
```

#### 用户上下文 (UserContext)
```java
// 设置用户上下文（通常在拦截器中）
UserContext.setUserContext(userId, username, realName);

// 获取当前用户信息
Long currentUserId = UserContext.getCurrentUserId();
String currentUsername = UserContext.getCurrentUsername();

// 清除上下文（请求结束时）
UserContext.clear();
```

### 3. 响应封装

#### 统一响应格式 (Result)
```java
// 成功响应
return Result.success(data);

// 失败响应
return Result.error("错误信息");

// 分页响应
return Result.success(PageUtils.toPageResult(page));
```

#### 分页结果封装 (PageResult)
```java
PageResult<User> pageResult = PageResult.of(userList, 1L, 10L, 100L);
```

### 4. 异常处理

#### 业务异常 (BusinessException)
```java
// 抛出业务异常
throw new BusinessException("用户不存在");

// 带错误码的异常
throw new BusinessException(ErrorCode.USER_NOT_FOUND, "用户不存在");
```

### 5. 类型处理器

#### JSON类型处理器 (JsonTypeHandler)
```java
// 在实体类中使用
@TableField(typeHandler = JsonTypeHandler.class)
private Map<String, Object> config;
```

#### 枚举类型处理器 (EnumTypeHandler)
```java
// 枚举实现EnumValue接口
public enum Status implements EnumTypeHandler.EnumValue {
    ACTIVE(1, "启用"),
    INACTIVE(0, "禁用");
    
    @Override
    public Object getValue() {
        return this.code;
    }
}
```

## 配置说明

### 1. 各服务模块引入依赖

```xml
<dependency>
    <groupId>com.erp.system</groupId>
    <artifactId>erp-common</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### 2. 启用MyBatis Plus配置

在各服务模块的配置文件中：

```yaml
# application.yml
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

# 自定义配置
mybatis-plus:
  custom:
    page:
      enabled: true
      max-limit: 1000
    security:
      block-attack: true
      illegal-sql-check: true
```

### 3. 覆盖默认配置

如果需要自定义配置，可以在各服务模块中创建同名Bean并添加@Primary注解：

```java
@Configuration
public class CustomMyBatisPlusConfig {
    
    @Bean
    @Primary
    public MybatisPlusInterceptor customMybatisPlusInterceptor() {
        // 自定义配置
        return new MybatisPlusInterceptor();
    }
}
```

## 最佳实践

### 1. 实体类设计
- 继承BaseEntity获得审计字段
- 使用@TableName指定表名
- 使用@TableField配置字段映射
- 枚举字段实现EnumValue接口

### 2. 查询构建
- 优先使用QueryWrapperUtils构建条件
- 使用Lambda表达式避免字段名硬编码
- 合理使用分页避免大结果集

### 3. 事务管理
- Service层方法添加@Transactional注解
- 合理设置事务传播行为
- 注意异常回滚策略

### 4. 性能优化
- 使用批量操作处理大数据量
- 合理使用索引和查询条件
- 避免N+1查询问题

## 注意事项

1. **模块定位**：此模块仅提供工具和基础配置，不应包含业务逻辑
2. **依赖管理**：所有外部依赖都标记为optional，各服务模块按需引入
3. **配置覆盖**：所有Bean都使用@ConditionalOnMissingBean，支持覆盖
4. **版本兼容**：保持向后兼容，谨慎修改公共接口
5. **文档更新**：修改功能时及时更新此文档

## 版本历史

- **1.0.0**: 初始版本，提供基础的MyBatis Plus增强功能
- **1.0.1**: 添加更多工具类和类型处理器
- **1.0.2**: 优化配置结构，支持更好的模块化