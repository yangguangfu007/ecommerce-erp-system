---
inclusion: always
---

# Chinese Language Standards (中文语言规范)

## Mandatory Chinese Usage

ALL code comments, documentation, and user-facing text MUST use Chinese as the primary language.

## Required Chinese Usage Areas

### Code Comments (Mandatory)
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
  }
})
```

### Database Schema (Chinese Comments Required)
```sql
-- 用户信息表
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱地址',
  `status` tinyint DEFAULT '1' COMMENT '用户状态：1-正常，0-禁用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='用户信息表';
```

### Frontend UI (Chinese Text Required)
- Page titles, button text, form labels: Chinese
- Error messages, success notifications: Chinese
- Element Plus components: Chinese locale

### Logging (Chinese Messages Required)
```java
log.info("用户登录成功，用户ID：{}", userId);
log.error("订单创建失败，原因：库存不足，商品ID：{}", productId);
log.warn("库存预警：商品 {} 库存不足，当前库存：{}", productName, currentStock);
```

## Naming Conventions (English Code, Chinese Comments)

### Constants & Error Messages
```java
public class OrderConstants {
    /** 订单状态：待支付 */
    public static final int STATUS_PENDING_PAYMENT = 1;
    
    /** 订单状态：已支付 */
    public static final int STATUS_PAID = 2;
}

public class BusinessException extends RuntimeException {
    public static final String USER_NOT_FOUND = "用户不存在";
    public static final String INSUFFICIENT_INVENTORY = "库存不足";
    public static final String ORDER_ALREADY_PAID = "订单已支付，无法重复支付";
}
```

### Test Cases (Chinese @DisplayName Required)
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

### Configuration Files (Chinese Comments)
```yaml
server:
  port: 8080  # 服务端口
  servlet:
    context-path: /api  # 应用上下文路径

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/erp_system  # 数据库连接地址
    username: root  # 数据库用户名
```

### Frontend Internationalization
```typescript
// src/locales/zh-CN.ts (Default locale)
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除'
  },
  user: {
    title: '用户管理',
    username: '用户名',
    email: '邮箱'
  }
}
```

## Git Commit Messages (Chinese Required)
```
feat: 添加用户管理功能
fix: 修复订单状态更新问题
docs: 更新API文档
refactor: 重构库存管理模块
test: 添加用户服务单元测试
```