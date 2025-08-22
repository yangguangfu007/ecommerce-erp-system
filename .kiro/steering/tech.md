---
inclusion: always
---

# 技术栈与开发标准

## 核心技术栈

### 后端（Java/Spring）
- **Java 17 LTS** 配合 Spring Boot 3.2.0 + Spring Cloud 2023.0.0
- **数据库**: MySQL 8.0.35 + MyBatis Plus 3.5.4 (表名snake_case，Java驼峰命名)
- **缓存**: Redis 7.2.3 用于会话和缓存
- **消息队列**: Apache Kafka 3.6.0 用于异步处理
- **安全**: Spring Security + JWT认证
- **网关**: Spring Cloud Gateway (端口 8080)

### 前端（Vue/TypeScript）
- **Vue 3.4+ 组合式API** + TypeScript 5.0+
- **UI框架**: Element Plus 2.10+ (默认中文语言包)
- **状态管理**: Pinia 3.0+ stores
- **构建工具**: Vite 7.0+ 支持热重载
- **HTTP客户端**: Axios 1.10+ 配合拦截器

### 基础设施
- **开发环境**: Docker Compose 本地服务
- **生产环境**: Kubernetes + Helm charts
- **监控**: Prometheus + Grafana 技术栈

## 开发命令与标准

### 服务启动（使用启动脚本）

**推荐使用项目启动脚本：**

```bash
# 一键启动完整系统
./scripts/start-services.sh

# 分步启动
./scripts/start-infrastructure.sh    # MySQL、Redis、Kafka、Nacos
./scripts/start-backend.sh          # 用户服务、网关服务
./scripts/start-frontend.sh         # Vue.js前端

# 启动特定服务
./scripts/start-backend.sh start user      # 只启动用户服务
./scripts/start-frontend.sh build          # 构建生产版本
```

**手动启动（备用方案）：**

```bash
# 首先启动基础设施
docker-compose up -d mysql redis kafka nacos > logs/infrastructure-startup.log 2>&1

# 后端服务（后台运行并记录日志）
nohup java -jar erp-gateway/target/erp-gateway-1.0.jar --spring.profiles.active=dev > logs/gateway-startup.log 2>&1 &
nohup mvn spring-boot:run -Dspring-boot.run.profiles=dev > logs/service-startup.log 2>&1 &

# 前端（后台运行并记录日志）
cd erp-frontend && nohup npm run dev > ../logs/frontend-startup.log 2>&1 &
```

### 构建命令

**使用启动脚本（推荐）：**

```bash
# 前端构建和测试
./scripts/start-frontend.sh build    # 生产构建
./scripts/start-frontend.sh test     # 运行测试
./scripts/start-frontend.sh lint     # 代码检查

# 查看构建状态
./scripts/start-frontend.sh status
```

**手动构建：**

```bash
# 后端：Maven多模块构建
mvn clean package -DskipTests  # 跳过测试以加快构建
mvn test                       # 运行单元测试

# 前端：Vite构建
cd erp-frontend
npm install && npm run build   # 生产构建
npm run dev                    # 开发模式（热重载）
```

### 代码质量要求
- **Java**: Google Java代码风格 + Checkstyle，必须使用中文注释
- **TypeScript**: ESLint + Prettier，必须使用中文注释  
- **测试覆盖率**: 后端 >80%，前端 >70%
- **API文档**: 所有REST端点使用Swagger/OpenAPI

### 端口分配
- 网关: 8080，用户: 8001，商品: 8002，订单: 8003
- 库存: 8004，平台: 8005，物流: 8006，通知: 8007
- 前端: 3000，Nacos: 8848