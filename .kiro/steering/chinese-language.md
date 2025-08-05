# 中文语言规范

## 语言使用原则

在整个电商ERP系统的开发和维护过程中，应当保持中文作为主要工作语言，以确保团队协作的一致性和本土化需求。

## 适用范围

### 代码注释
- **Java后端代码**：所有类、方法、字段的注释使用中文
- **Vue前端代码**：组件、方法、变量的注释使用中文
- **配置文件**：YAML、Properties文件中的注释使用中文

```java
/**
 * 用户服务实现类
 * 负责处理用户相关的业务逻辑
 */
@Service
public class UserServiceImpl implements UserService {
    
    /**
     * 根据用户ID获取用户信息
     * @param userId 用户ID
     * @return 用户详细信息
     */
    public UserDTO getUserById(Long userId) {
        // 从数据库查询用户信息
        return userMapper.selectById(userId);
    }
}
```

```typescript
/**
 * 用户管理组件
 * 提供用户列表展示和基本操作功能
 */
export default defineComponent({
  name: 'UserManagement',
  setup() {
    // 用户列表数据
    const userList = ref<User[]>([])
    
    /**
     * 获取用户列表
     */
    const fetchUsers = async () => {
      // 调用API获取用户数据
      const response = await userApi.getUsers()
      userList.value = response.data
    }
    
    return {
      userList,
      fetchUsers
    }
  }
})
```

### 文档内容
- **API文档**：接口描述、参数说明使用中文
- **用户手册**：操作指南、功能说明使用中文
- **开发文档**：技术文档、部署指南使用中文
- **README文件**：项目介绍、使用说明使用中文

### 数据库设计
- **表注释**：数据库表的注释使用中文
- **字段注释**：数据库字段的注释使用中文

```sql
-- 用户信息表
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱地址',
  `phone` varchar(20) COMMENT '手机号码',
  `status` tinyint DEFAULT '1' COMMENT '用户状态：1-正常，0-禁用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='用户信息表';
```

### 前端界面
- **页面标题**：使用中文标题
- **按钮文字**：操作按钮使用中文
- **表单标签**：表单字段标签使用中文
- **提示信息**：错误提示、成功提示使用中文

### 日志信息
- **业务日志**：关键业务操作的日志使用中文
- **错误日志**：异常信息的描述使用中文

```java
log.info("用户登录成功，用户ID：{}", userId);
log.error("订单创建失败，原因：库存不足，商品ID：{}", productId);
log.warn("库存预警：商品 {} 库存不足，当前库存：{}", productName, currentStock);
```

## 命名规范

### 变量和方法命名
- **Java**：使用英文驼峰命名，但注释用中文说明
- **JavaScript/TypeScript**：使用英文驼峰命名，但注释用中文说明
- **数据库**：表名和字段名使用英文下划线命名，但注释用中文

### 常量定义
```java
public class OrderConstants {
    /** 订单状态：待支付 */
    public static final int STATUS_PENDING_PAYMENT = 1;
    
    /** 订单状态：已支付 */
    public static final int STATUS_PAID = 2;
    
    /** 订单状态：已发货 */
    public static final int STATUS_SHIPPED = 3;
}
```

## 国际化支持

### 前端国际化
- 使用Vue i18n进行国际化配置
- 中文作为默认语言
- 预留英文翻译接口

```typescript
// src/locales/zh-CN.ts
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    search: '搜索'
  },
  user: {
    title: '用户管理',
    username: '用户名',
    email: '邮箱',
    phone: '手机号',
    status: '状态'
  }
}
```

## 异常处理

### 错误信息
所有用户可见的错误信息使用中文：

```java
public class BusinessException extends RuntimeException {
    public static final String USER_NOT_FOUND = "用户不存在";
    public static final String INSUFFICIENT_INVENTORY = "库存不足";
    public static final String ORDER_ALREADY_PAID = "订单已支付，无法重复支付";
}
```

## 测试用例

### 测试描述
测试方法名使用英文，但测试描述和断言信息使用中文：

```java
@Test
@DisplayName("测试用户登录功能")
void testUserLogin() {
    // 准备测试数据
    LoginRequest request = new LoginRequest("testuser", "password123");
    
    // 执行登录
    LoginResponse response = userService.login(request);
    
    // 验证结果
    assertThat(response.isSuccess()).isTrue();
    assertThat(response.getMessage()).isEqualTo("登录成功");
}
```

## 提交信息

### Git提交规范
提交信息使用中文，遵循约定式提交格式：

```
feat: 添加用户管理功能
fix: 修复订单状态更新问题
docs: 更新API文档
style: 优化代码格式
refactor: 重构库存管理模块
test: 添加用户服务单元测试
```

## 配置文件注释

### YAML配置
```yaml
server:
  port: 8080  # 服务端口
  servlet:
    context-path: /api  # 应用上下文路径

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/erp_system  # 数据库连接地址
    username: root  # 数据库用户名
    password: password  # 数据库密码
  
  redis:
    host: localhost  # Redis服务器地址
    port: 6379  # Redis端口
    database: 0  # Redis数据库索引
```

## 工具和脚本

### Shell脚本注释
```bash
#!/bin/bash

# 电商ERP系统部署脚本
# 用于快速部署开发环境

echo "开始部署电商ERP系统..."

# 启动基础设施服务
echo "启动MySQL、Redis、Kafka等基础服务..."
docker-compose up -d mysql redis kafka

# 等待服务启动完成
echo "等待基础服务启动完成..."
sleep 30

# 构建并启动微服务
echo "构建并启动微服务..."
mvn clean package -DskipTests
```

## 遵循原则

1. **一致性**：整个项目保持中文使用的一致性
2. **可读性**：中文注释和文档提高代码可读性
3. **本土化**：符合中国开发团队的使用习惯
4. **国际化准备**：在使用中文的同时，预留国际化扩展能力
5. **专业性**：使用准确的技术术语和业务术语

通过遵循这些规范，确保整个电商ERP系统的开发过程中保持中文语言的统一使用，提高团队协作效率和代码维护性。