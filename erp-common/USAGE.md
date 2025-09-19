# ERP Common Module 使用指南

## 快速开始

### 1. 添加依赖

在各服务模块的 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>com.erp.system</groupId>
    <artifactId>erp-common</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>

<!-- 如果需要使用MyBatis Plus功能，还需要添加 -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
</dependency>
```

### 2. 配置扫描包

在主启动类上添加包扫描：

```java
@SpringBootApplication
@MapperScan("com.erp.*.mapper")  // 扫描Mapper接口
@ComponentScan(basePackages = {
    "com.erp.common",     // 扫描公共模块
    "com.erp.yourservice" // 扫描当前服务模块
})
public class YourServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourServiceApplication.class, args);
    }
}
```

### 3. 配置数据源

在 `application.yml` 中配置数据源：

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:mysql://localhost:3306/your_database?useUnicode=true&characterEncoding=utf8&connectionCollation=utf8mb4_unicode_ci&autoReconnect=true&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=GMT%2B8
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.erp.yourservice.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

## 核心功能使用

### 1. 实体类开发

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class User extends BaseEntity {
    
    /**
     * 用户名
     */
    @TableField("username")
    private String username;
    
    /**
     * 真实姓名
     */
    @TableField("real_name")
    private String realName;
    
    /**
     * 用户状态
     */
    @TableField("status")
    private UserStatus status;
    
    /**
     * 用户配置（JSON字段）
     */
    @TableField(value = "user_config", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> userConfig;
}
```

### 2. 枚举类开发

```java
public enum UserStatus implements EnumTypeHandler.EnumValue {
    ACTIVE(1, "启用"),
    INACTIVE(0, "禁用"),
    LOCKED(2, "锁定");
    
    private final Integer code;
    private final String description;
    
    UserStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }
    
    @Override
    public Object getValue() {
        return this.code;
    }
    
    // getter方法...
}
```

### 3. Mapper接口开发

```java
@Mapper
public interface UserMapper extends BaseMapperPlus<User> {
    
    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM sys_user WHERE username = #{username} AND deleted = 0")
    User selectByUsername(@Param("username") String username);
    
    /**
     * 查询活跃用户数量
     */
    @Select("SELECT COUNT(*) FROM sys_user WHERE status = 1 AND deleted = 0")
    Long countActiveUsers();
}
```

### 4. Service层开发

```java
public interface UserService extends BaseServicePlus<User> {
    
    /**
     * 根据用户名获取用户
     */
    User getUserByUsername(String username);
    
    /**
     * 分页查询用户
     */
    PageResult<UserDTO> pageUsers(UserQueryDTO queryDTO);
}

@Service
@Transactional(rollbackFor = Exception.class)
public class UserServiceImpl extends BaseServicePlusImpl<UserMapper, User> implements UserService {
    
    @Override
    public User getUserByUsername(String username) {
        return baseMapper.selectByUsername(username);
    }
    
    @Override
    public PageResult<UserDTO> pageUsers(UserQueryDTO queryDTO) {
        // 构建查询条件
        LambdaQueryWrapper<User> wrapper = QueryWrapperUtils.lambdaQuery(User.class);
        QueryWrapperUtils.likeIfPresent(wrapper, User::getUsername, queryDTO.getUsername());
        QueryWrapperUtils.likeIfPresent(wrapper, User::getRealName, queryDTO.getRealName());
        QueryWrapperUtils.eqIfPresent(wrapper, User::getStatus, queryDTO.getStatus());
        QueryWrapperUtils.betweenTime(wrapper, User::getCreateTime, 
                                     queryDTO.getStartTime(), queryDTO.getEndTime());
        QueryWrapperUtils.orderByDesc(wrapper, User::getCreateTime);
        
        // 创建分页对象
        Page<User> page = PageUtils.createPage(queryDTO.getPage(), queryDTO.getSize());
        
        // 执行分页查询并转换结果
        return pageQuery(page, wrapper, this::convertToDTO);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
}
```

### 5. Controller层开发

```java
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 分页查询用户
     */
    @GetMapping
    public Result<PageResult<UserDTO>> pageUsers(UserQueryDTO queryDTO) {
        PageResult<UserDTO> result = userService.pageUsers(queryDTO);
        return Result.success(result);
    }
    
    /**
     * 根据ID获取用户
     */
    @GetMapping("/{id}")
    public Result<UserDTO> getUser(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(convertToDTO(user));
    }
    
    /**
     * 创建用户
     */
    @PostMapping
    public Result<Void> createUser(@RequestBody @Valid UserCreateDTO createDTO) {
        User user = new User();
        BeanUtils.copyProperties(createDTO, user);
        
        boolean success = userService.save(user);
        return success ? Result.success() : Result.error("创建用户失败");
    }
    
    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public Result<Void> updateUser(@PathVariable Long id, @RequestBody @Valid UserUpdateDTO updateDTO) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        BeanUtils.copyProperties(updateDTO, user);
        boolean success = userService.updateById(user);
        return success ? Result.success() : Result.error("更新用户失败");
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        boolean success = userService.removeById(id);
        return success ? Result.success() : Result.error("删除用户失败");
    }
}
```

### 6. 用户上下文使用

```java
@Component
public class UserContextInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 从请求中获取用户信息（如JWT Token）
        String token = request.getHeader("Authorization");
        if (StringUtils.hasText(token)) {
            // 解析token获取用户信息
            UserInfo userInfo = parseToken(token);
            if (userInfo != null) {
                // 设置用户上下文
                UserContext.setUserContext(
                    userInfo.getUserId(),
                    userInfo.getUsername(),
                    userInfo.getRealName()
                );
            }
        }
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) {
        // 清除用户上下文
        UserContext.clear();
    }
}
```

## 高级功能

### 1. 批量操作

```java
@Service
public class UserBatchService {
    
    @Autowired
    private UserService userService;
    
    /**
     * 批量创建用户
     */
    public int batchCreateUsers(List<User> users) {
        return userService.insertBatch(users);
    }
    
    /**
     * 批量更新用户
     */
    public int batchUpdateUsers(List<User> users) {
        return userService.updateBatchById(users);
    }
    
    /**
     * 批量保存或更新用户
     */
    public boolean batchSaveOrUpdateUsers(List<User> users) {
        return userService.saveOrUpdateBatchEnhanced(users);
    }
}
```

### 2. 自定义查询

```java
@Service
public class UserQueryService {
    
    @Autowired
    private UserService userService;
    
    /**
     * 复杂条件查询
     */
    public List<User> findUsersByComplexConditions(UserComplexQueryDTO queryDTO) {
        LambdaQueryWrapper<User> wrapper = QueryWrapperUtils.lambdaQuery(User.class);
        
        // 基础条件
        QueryWrapperUtils.eqIfPresent(wrapper, User::getStatus, queryDTO.getStatus());
        QueryWrapperUtils.likeIfPresent(wrapper, User::getRealName, queryDTO.getRealName());
        
        // 时间范围
        QueryWrapperUtils.betweenTime(wrapper, User::getCreateTime, 
                                     queryDTO.getStartTime(), queryDTO.getEndTime());
        
        // IN条件
        QueryWrapperUtils.inIfPresent(wrapper, User::getId, queryDTO.getUserIds());
        
        // 排序
        QueryWrapperUtils.orderByDesc(wrapper, User::getCreateTime, User::getId);
        
        return userService.listByCondition(wrapper);
    }
}
```

### 3. 事务管理

```java
@Service
@Transactional(rollbackFor = Exception.class)
public class UserTransactionService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRoleService userRoleService;
    
    /**
     * 创建用户并分配角色
     */
    @Transactional(rollbackFor = Exception.class)
    public void createUserWithRoles(User user, List<Long> roleIds) {
        // 创建用户
        userService.save(user);
        
        // 分配角色
        List<UserRole> userRoles = roleIds.stream()
            .map(roleId -> new UserRole(user.getId(), roleId))
            .collect(Collectors.toList());
        userRoleService.saveBatch(userRoles);
    }
    
    /**
     * 只读事务
     */
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        // 只读操作，提高性能
        return calculateUserStatistics();
    }
}
```

## 配置说明

### MyBatisPlusConfig
erp-common 模块提供了开箱即用的 MyBatis Plus 配置：

- **分页插件**：支持MySQL数据库，最大1000条/页，优化JOIN查询
- **乐观锁插件**：支持@Version注解的乐观锁机制
- **防攻击插件**：防止全表更新和删除操作

### 自定义配置（可选）

如果需要自定义配置，可以在各服务模块中覆盖：

```java
@Configuration
public class CustomMyBatisPlusConfig {
    
    /**
     * 自定义分页插件配置
     */
    @Bean
    @Primary
    public MybatisPlusInterceptor customMybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 自定义分页插件
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        paginationInterceptor.setMaxLimit(500L); // 自定义最大限制
        paginationInterceptor.setOverflow(true);  // 允许溢出
        interceptor.addInnerInterceptor(paginationInterceptor);
        
        return interceptor;
    }
}
```

### 2. 自定义类型处理器

```java
@MappedTypes({YourCustomType.class})
@MappedJdbcTypes({JdbcType.VARCHAR})
public class YourCustomTypeHandler extends BaseTypeHandler<YourCustomType> {
    // 实现自定义类型转换逻辑
}
```

## 常见问题

### 1. 自动填充不生效

**问题**：创建时间、更新时间等字段没有自动填充

**解决**：
- 确保实体类继承了BaseEntity
- 确保字段上有正确的@TableField注解
- 确保UserContext中有用户信息

### 2. 分页查询结果为空

**问题**：分页查询返回空结果

**解决**：
- 检查查询条件是否正确
- 检查数据库表中是否有数据
- 检查逻辑删除字段的值

### 3. 批量操作失败

**问题**：批量插入或更新操作失败

**解决**：
- 检查数据库连接是否支持批量操作
- 检查实体类字段映射是否正确
- 适当调整批次大小

### 4. 枚举类型转换错误

**问题**：枚举字段保存或查询时出现转换错误

**解决**：
- 确保枚举类实现了EnumValue接口
- 检查数据库字段类型是否匹配
- 确保getValue()方法返回正确的值

## 性能优化建议

1. **合理使用索引**：为常用查询字段创建索引
2. **避免N+1查询**：使用关联查询或批量查询
3. **控制分页大小**：避免单次查询过多数据
4. **使用批量操作**：大数据量操作时使用批量方法
5. **合理使用缓存**：对热点数据进行缓存
6. **监控慢查询**：开启SQL日志监控慢查询

## 更多示例

更多使用示例请参考各服务模块的实现代码。