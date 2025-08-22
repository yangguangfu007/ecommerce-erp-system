# 语言设置

## 会话语言规范

所有与用户的交互和会话都必须使用中文进行。这包括：

- 所有回复和解释
- 代码注释（前后端代码都必须使用中文注释）
- 文档和说明
- 错误信息和提示
- 用户界面相关的文本

## 例外情况

以下情况可以使用英文：
- 代码本身（变量名、函数名、类名等）
- 技术术语的英文原名（可在括号中提供）
- 配置文件和系统文件名
- API端点和URL
- 第三方库和框架的名称

## 实施要求

- 优先使用简洁明了的中文表达
- 技术术语可以中英文并用，如"用户服务 (User Service)"
- 保持专业性和准确性
- 确保中文表达的技术准确性

## 代码注释示例

### Java后端注释示例

```java
/**
 * 用户服务控制器
 * 处理用户相关的HTTP请求
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    /**
     * 根据用户ID获取用户信息
     * @param userId 用户唯一标识
     * @return 用户详细信息
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        // 验证用户ID是否有效
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID不能为空或小于等于0");
        }
        
        // 从数据库查询用户信息
        User user = userService.findById(userId);
        
        // 转换为DTO并返回
        return ResponseEntity.ok(userMapper.toDTO(user));
    }
}
```

### TypeScript/Vue前端注释示例

```typescript
/**
 * 用户管理页面组件
 * 提供用户列表展示、搜索、编辑等功能
 */
export default defineComponent({
  name: 'UserManagement',
  
  setup() {
    // 用户列表数据
    const userList = ref<User[]>([])
    
    // 加载状态
    const loading = ref(false)
    
    /**
     * 获取用户列表
     * @param params 查询参数
     */
    const fetchUsers = async (params?: UserQueryParams) => {
      try {
        loading.value = true
        // 调用API获取用户数据
        const response = await userApi.getUsers(params)
        userList.value = response.data
      } catch (error) {
        // 处理错误情况
        ElMessage.error('获取用户列表失败')
        console.error('用户列表加载错误:', error)
      } finally {
        loading.value = false
      }
    }
    
    return {
      userList,
      loading,
      fetchUsers
    }
  }
})
```

### CSS/SCSS注释示例

```scss
/* 用户管理页面样式 */
.user-management {
  padding: 20px;
  
  /* 搜索区域样式 */
  .search-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;
    
    /* 搜索按钮组 */
    .search-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
  }
  
  /* 用户表格样式 */
  .user-table {
    /* 表格操作列 */
    .action-column {
      width: 200px;
      text-align: center;
    }
  }
}
```

### SQL注释示例

```sql
-- 用户表结构
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户唯一标识',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱地址',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    status TINYINT DEFAULT 1 COMMENT '用户状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='用户基础信息表';

-- 创建用户名索引
CREATE INDEX idx_users_username ON users(username) COMMENT '用户名索引';

-- 创建邮箱索引  
CREATE INDEX idx_users_email ON users(email) COMMENT '邮箱索引';
```