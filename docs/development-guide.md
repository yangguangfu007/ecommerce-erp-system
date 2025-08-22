# 🛠️ 开发指南

本文档为开发人员提供详细的开发环境搭建、代码结构说明和开发流程指导。

## 📋 开发环境要求

### 必需软件

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| **JDK** | 17+ | 后端开发 |
| **Node.js** | 16+ | 前端开发 |
| **Maven** | 3.9+ | 后端构建 |
| **Docker** | 20.10+ | 容器化 |
| **Git** | 2.0+ | 版本控制 |
| **IDE** | IntelliJ IDEA / VS Code | 开发工具 |

### 推荐工具

- **Postman**: API 测试
- **DBeaver**: 数据库管理
- **Redis Desktop Manager**: Redis 管理
- **Kubernetes Dashboard**: K8s 管理

## 🏗️ 开发环境搭建

### 1. 克隆项目

```bash
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system
```

### 1.5 快速启动（推荐）

如果您想快速启动完整的开发环境，可以使用以下命令：

```bash
# 一键启动所有服务（按正确顺序）
./scripts/start-services.sh

# 这个脚本会按顺序启动：
# 1. 基础设施服务 (MySQL, Redis, Kafka, Nacos)
# 2. 后端服务 (用户服务, 网关服务)
# 3. 前端服务 (Vue.js应用)

# 查看所有服务状态
./scripts/start-services.sh status

# 查看服务日志
./scripts/start-services.sh logs all

# 停止所有服务
./scripts/start-services.sh stop
```

### 1.6 分步启动（开发调试）

如果您需要单独启动某类服务进行开发调试：

```bash
# 第1步：启动基础设施服务
./scripts/start-infrastructure.sh

# 第2步：启动后端服务
./scripts/start-backend.sh

# 第3步：启动前端服务
./scripts/start-frontend.sh

# 或者直接调用主脚本启动特定类型的服务
./scripts/start-services.sh start infrastructure  # 只启动基础设施
./scripts/start-services.sh start backend         # 只启动后端服务
./scripts/start-services.sh start frontend        # 只启动前端服务
```

### 2. 启动基础设施

```bash
# 使用基础设施启动脚本（推荐）
./scripts/start-infrastructure.sh

# 或者手动启动基础服务
docker-compose up -d mysql redis kafka nacos

# 等待服务启动完成
sleep 30

# 验证服务状态
./scripts/start-infrastructure.sh status
```

### 3. 后端开发环境

#### 3.1 配置 IDE

**IntelliJ IDEA 配置**:

1. 导入项目：`File -> Open -> 选择项目根目录`
2. 配置 JDK：`File -> Project Structure -> Project -> SDK -> 选择 JDK 17`
3. 配置 Maven：`File -> Settings -> Build -> Build Tools -> Maven`
4. 安装插件：
   - Lombok Plugin
   - MyBatis Plugin
   - Spring Boot Plugin

**VS Code 配置**:

1. 安装扩展：
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - Lombok Annotations Support

#### 3.2 配置数据库

```bash
# 连接到 MySQL
mysql -h localhost -P 3306 -u root -p

# 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS erp_system;
CREATE DATABASE IF NOT EXISTS erp_user;
CREATE DATABASE IF NOT EXISTS erp_product;
CREATE DATABASE IF NOT EXISTS erp_order;
CREATE DATABASE IF NOT EXISTS erp_inventory;

# 导入初始数据
source scripts/sql/init-schema.sql;
source scripts/sql/init-data.sql;
```

#### 3.3 启动后端服务

##### 使用后端启动脚本（推荐）

```bash
# 启动所有后端服务
./scripts/start-backend.sh

# 启动单个服务
./scripts/start-backend.sh start user      # 启动用户服务
./scripts/start-backend.sh start gateway   # 启动网关服务

# 查看服务状态
./scripts/start-backend.sh status

# 查看服务日志
./scripts/start-backend.sh logs user       # 查看用户服务日志
./scripts/start-backend.sh logs gateway    # 查看网关服务日志
```

##### 手动启动服务

```bash
# 启动用户服务
mvn spring-boot:run -f erp-user-service/pom.xml -Dspring-boot.run.profiles=dev

# 启动网关服务
mvn spring-boot:run -f erp-gateway/pom.xml -Dspring-boot.run.profiles=dev

# 验证服务启动成功
curl http://localhost:8001/actuator/health  # 用户服务
curl http://localhost:8080/actuator/health  # 网关服务
```

##### 服务启动顺序

1. **基础设施服务** (MySQL, Redis, Nacos, Kafka) - 使用 `./scripts/start-infrastructure.sh`
2. **后端微服务** (用户服务, 网关服务) - 使用 `./scripts/start-backend.sh`
3. **前端服务** (Vue.js应用) - 使用 `./scripts/start-frontend.sh`

##### 启动验证

```bash
# 检查后端服务状态
./scripts/start-backend.sh status

# 查看 Nacos 服务注册情况
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=erp-gateway

# 测试 Gateway 路由
curl http://localhost:8080/api/users/health
```

### 4. 前端开发环境

#### 4.1 安装依赖

```bash
cd erp-frontend

# 安装依赖
npm install

# 或使用 yarn
yarn install
```

#### 4.2 配置开发环境

编辑 `erp-frontend/src/config/index.ts`：

```typescript
export const config = {
  // 开发环境 API 地址
  apiBaseUrl: 'http://localhost:8080',
  
  // 其他配置...
}
```

#### 4.3 启动前端开发服务器

```bash
# 使用前端启动脚本（推荐）
./scripts/start-frontend.sh

# 或者手动启动
cd erp-frontend
npm run dev

# 前端将在 http://localhost:3000 启动
# 支持热重载，修改代码后自动刷新

# 查看前端服务状态
./scripts/start-frontend.sh status

# 查看前端服务日志
./scripts/start-frontend.sh logs

# 构建生产版本
./scripts/start-frontend.sh build
```

## 📁 项目结构详解

### 后端项目结构

```
erp-system/
├── erp-common/                     # 公共模块
│   ├── src/main/java/
│   │   └── com/erp/common/
│   │       ├── config/            # 通用配置
│   │       ├── exception/         # 异常处理
│   │       ├── utils/             # 工具类
│   │       └── dto/               # 数据传输对象
│   └── pom.xml
├── erp-gateway/                    # API 网关
│   ├── src/main/java/
│   │   └── com/erp/gateway/
│   │       ├── config/            # 网关配置
│   │       ├── filter/            # 过滤器
│   │       └── GatewayApplication.java
│   └── src/main/resources/
│       └── application.yml        # 配置文件
└── erp-user-service/              # 用户服务
    ├── src/main/java/
    │   └── com/erp/user/
    │       ├── controller/        # 控制器
    │       ├── service/           # 业务逻辑
    │       ├── mapper/            # 数据访问
    │       ├── entity/            # 实体类
    │       └── dto/               # 数据传输对象
    ├── src/main/resources/
    │   ├── application.yml        # 配置文件
    │   └── mapper/                # MyBatis 映射文件
    └── src/test/                  # 测试代码
```

### 前端项目结构

```
erp-frontend/
├── src/
│   ├── api/                       # API 接口
│   ├── components/                # 公共组件
│   ├── views/                     # 页面组件
│   ├── router/                    # 路由配置
│   ├── stores/                    # 状态管理
│   ├── utils/                     # 工具函数
│   ├── styles/                    # 样式文件
│   ├── types/                     # TypeScript 类型定义
│   └── main.ts                    # 入口文件
├── public/                        # 静态资源
├── package.json                   # 依赖配置
└── vite.config.ts                # 构建配置
```

## 🔧 开发流程

### 1. 功能开发流程

#### 1.1 创建功能分支

```bash
# 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-management

# 功能分支命名规范：
# feature/功能名称
# bugfix/问题描述
# hotfix/紧急修复
```

#### 1.2 后端开发

**步骤 1: 创建实体类**

```java
// erp-user-service/src/main/java/com/erp/user/entity/User.java
@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    // 其他字段...
}
```

**步骤 2: 创建数据访问层**

```java
// erp-user-service/src/main/java/com/erp/user/mapper/UserMapper.java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    List<User> selectByRole(@Param("role") String role);
}
```

**步骤 3: 创建业务逻辑层**

```java
// erp-user-service/src/main/java/com/erp/user/service/UserService.java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public User createUser(CreateUserDTO dto) {
        // 业务逻辑实现
    }
}
```

**步骤 4: 创建控制器**

```java
// erp-user-service/src/main/java/com/erp/user/controller/UserController.java
@RestController
@RequestMapping("/api/users")
@Api(tags = "用户管理")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @ApiOperation("创建用户")
    public Result<User> createUser(@RequestBody @Valid CreateUserDTO dto) {
        User user = userService.createUser(dto);
        return Result.success(user);
    }
}
```

#### 1.3 前端开发

**步骤 1: 创建 API 接口**

```typescript
// erp-frontend/src/api/user.ts
import { request } from '@/utils/request'

export interface User {
  id: number
  username: string
  email: string
  // 其他字段...
}

export const userApi = {
  // 获取用户列表
  getUsers: (params?: any) => 
    request.get<User[]>('/api/users', { params }),
    
  // 创建用户
  createUser: (data: Partial<User>) => 
    request.post<User>('/api/users', data),
    
  // 更新用户
  updateUser: (id: number, data: Partial<User>) => 
    request.put<User>(`/api/users/${id}`, data),
    
  // 删除用户
  deleteUser: (id: number) => 
    request.delete(`/api/users/${id}`)
}
```

**步骤 2: 创建状态管理**

```typescript
// erp-frontend/src/stores/user.ts
import { defineStore } from 'pinia'
import { userApi, type User } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    loading: false,
    currentUser: null as User | null
  }),
  
  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await userApi.getUsers()
        this.users = response.data
      } finally {
        this.loading = false
      }
    },
    
    async createUser(userData: Partial<User>) {
      const response = await userApi.createUser(userData)
      this.users.push(response.data)
      return response.data
    }
  }
})
```

**步骤 3: 创建页面组件**

```vue
<!-- erp-frontend/src/views/user/UserList.vue -->
<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showCreateDialog">
            新增用户
          </el-button>
        </div>
      </template>
      
      <el-table :data="userStore.users" :loading="userStore.loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteUser(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUsers()
})

// 其他方法实现...
</script>
```

### 2. 测试开发

#### 2.1 后端单元测试

```java
// erp-user-service/src/test/java/com/erp/user/service/UserServiceTest.java
@SpringBootTest
@Transactional
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateUser() {
        CreateUserDTO dto = new CreateUserDTO();
        dto.setUsername("testuser");
        dto.setEmail("test@example.com");
        
        User user = userService.createUser(dto);
        
        assertThat(user).isNotNull();
        assertThat(user.getUsername()).isEqualTo("testuser");
    }
}
```

#### 2.2 前端单元测试

```typescript
// erp-frontend/src/components/__tests__/UserForm.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '../UserForm.vue'

describe('UserForm', () => {
  it('renders properly', () => {
    const wrapper = mount(UserForm, {
      props: { user: { id: 1, username: 'test' } }
    })
    expect(wrapper.text()).toContain('test')
  })
})
```

#### 2.3 集成测试

```bash
# 运行后端集成测试
cd scripts/testing
./test-orchestrator.sh test integration

# 运行前端 E2E 测试
cd erp-frontend
npm run test:e2e
```

### 3. 代码规范

#### 3.1 后端代码规范

- **命名规范**: 使用驼峰命名法
- **注释规范**: 使用 JavaDoc 注释
- **异常处理**: 统一异常处理机制
- **日志规范**: 使用 SLF4J + Logback

```java
/**
 * 用户服务类
 * 
 * @author yangguangfu007
 * @since 1.0.0
 */
@Service
@Slf4j
public class UserService {
    
    /**
     * 创建用户
     * 
     * @param dto 用户创建请求
     * @return 创建的用户信息
     * @throws BusinessException 业务异常
     */
    public User createUser(CreateUserDTO dto) throws BusinessException {
        log.info("Creating user with username: {}", dto.getUsername());
        
        try {
            // 业务逻辑
            return user;
        } catch (Exception e) {
            log.error("Failed to create user", e);
            throw new BusinessException("用户创建失败");
        }
    }
}
```

#### 3.2 前端代码规范

- **命名规范**: 组件使用 PascalCase，变量使用 camelCase
- **文件组织**: 按功能模块组织文件
- **类型定义**: 使用 TypeScript 严格类型检查
- **代码格式**: 使用 Prettier + ESLint

```typescript
// 接口定义
export interface CreateUserRequest {
  username: string
  email: string
  password: string
}

// 组件定义
export default defineComponent({
  name: 'UserForm',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props, { emit }) {
    // 组件逻辑
  }
})
```

## 🔍 调试技巧

### 1. 后端调试

#### 1.1 IDE 调试

1. 在 IDE 中设置断点
2. 以 Debug 模式启动应用
3. 发送请求触发断点
4. 逐步调试代码

#### 1.2 日志调试

```yaml
# application-dev.yml
logging:
  level:
    com.erp: DEBUG
    org.springframework.web: DEBUG
    org.mybatis: DEBUG
```

#### 1.3 远程调试

```bash
# 启动应用时添加 JVM 参数
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar app.jar

# 在 IDE 中配置远程调试连接到 localhost:5005
```

### 2. 前端调试

#### 2.1 浏览器调试

1. 打开浏览器开发者工具
2. 在 Sources 面板设置断点
3. 刷新页面触发断点
4. 使用 Console 面板查看变量

#### 2.2 Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 在开发者工具中查看组件状态
3. 监控 Vuex/Pinia 状态变化

#### 2.3 网络请求调试

```typescript
// 在 axios 拦截器中添加调试信息
request.interceptors.request.use(config => {
  console.log('Request:', config)
  return config
})

request.interceptors.response.use(
  response => {
    console.log('Response:', response)
    return response
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)
```

## 📦 构建和部署

### 1. 本地构建

```bash
# 后端构建
mvn clean package -DskipTests

# 前端构建
cd erp-frontend
npm run build

# Docker 镜像构建
docker build -t erp-system:latest .
```

### 2. 持续集成

项目配置了 GitHub Actions，每次提交代码会自动：

1. 运行单元测试
2. 代码质量检查
3. 构建 Docker 镜像
4. 部署到测试环境

### 3. 生产部署

详细部署流程请参考 [部署指南](deployment-guide.md)。

## 🤝 贡献指南

### 1. 提交代码

```bash
# 1. 确保代码符合规范
mvn checkstyle:check
npm run lint

# 2. 运行测试
mvn test
npm run test

# 3. 提交代码
git add .
git commit -m "feat: 添加用户管理功能"
git push origin feature/user-management

# 4. 创建 Pull Request
```

### 2. 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. 代码审查

所有代码变更都需要经过 Code Review：

1. 创建 Pull Request
2. 指定审查人员
3. 根据反馈修改代码
4. 审查通过后合并

## 📚 学习资源

### 官方文档

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Vue.js 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Kubernetes 文档](https://kubernetes.io/docs/)

### 推荐书籍

- 《Spring Boot 实战》
- 《Vue.js 设计与实现》
- 《微服务架构设计模式》
- 《Kubernetes 权威指南》

## 🆘 常见问题

### Q1: 如何添加新的微服务？

A: 参考现有服务结构，创建新的 Maven 模块，配置数据库连接和服务注册。

### Q2: 如何修改数据库结构？

A: 使用 Flyway 数据库迁移工具，在 `src/main/resources/db/migration` 目录下添加迁移脚本。

### Q3: 如何添加新的前端页面？

A: 在 `src/views` 目录下创建新组件，在 `src/router` 中配置路由。

### Q4: 如何处理跨域问题？

A: 在网关配置中添加 CORS 配置，或在前端配置代理。

### Q5: 登录时出现"检测到异常登录行为，请稍后再试"怎么办？

A: 这通常是由于多次登录失败导致Redis中存储了锁定信息。解决方案：

```bash
# 清除Redis中的登录锁定信息
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 重启用户服务
./scripts/start-backend.sh restart user
```

### Q6: API返回的中文数据显示为乱码怎么办？

A: 这是数据库字符编码问题。解决方案：

```bash
# 1. 检查数据库字符集
docker exec erp-mysql mysql -u root -proot123 -e "SHOW VARIABLES LIKE 'character_set%';"

# 2. 修复数据库数据
docker exec erp-mysql mysql -u root -proot123 --default-character-set=utf8mb4 -e "
USE erp_user;
UPDATE sys_user SET real_name = '系统管理员' WHERE username = 'admin';
UPDATE sys_user SET real_name = '测试用户' WHERE username = 'test';
UPDATE sys_role SET role_name = '系统管理员' WHERE id = 1;
UPDATE sys_role SET role_name = '普通用户' WHERE id = 2;
"

# 3. 重启用户服务
./scripts/start-backend.sh restart user
```

### Q7: 如何快速重置开发环境？

A: 使用以下命令快速重置：

```bash
# 停止所有服务
./scripts/start-services.sh stop

# 清除Redis数据
docker exec erp-redis redis-cli -a redis123 FLUSHALL

# 重启所有服务
./scripts/start-services.sh restart

# 查看服务状态
./scripts/start-services.sh status
```

---

如有其他问题，欢迎提交 Issue 或联系开发团队。