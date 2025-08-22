# 技术栈与构建系统

## 后端技术栈

- **Java**: OpenJDK 17 LTS
- **框架**: Spring Boot 3.1.5, Spring Cloud 2022.0.4
- **架构**: 基于Spring Cloud Gateway的微服务架构
- **数据库**: MySQL 8.0.33 + MyBatis Plus 3.5.4
- **缓存**: Redis 7.2.3 + Jedis客户端
- **消息队列**: Apache Kafka 3.6.0
- **服务发现**: Nacos 2.3.0
- **熔断器**: Sentinel 1.8.6 + Resilience4j
- **安全**: Spring Security + JWT (JJWT 0.12.3)
- **文档**: SpringDoc OpenAPI 2.2.0

## 前端技术栈

- **框架**: Vue.js 3.5.17 + TypeScript 5.8+
- **构建工具**: Vite 7.0.0
- **UI组件库**: Element Plus 2.10.4
- **状态管理**: Pinia 3.0.3 + 持久化
- **路由**: Vue Router 4.x
- **HTTP客户端**: Axios 1.10.0
- **图表**: ECharts 6.0.0 + Chart.js 4.5.0
- **测试**: Vitest 3.2.4 + Playwright 1.55.0

## 基础设施与运维

- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes + Helm 3.8+
- **监控**: Prometheus + Grafana + ELK Stack
- **链路追踪**: Zipkin + Spring Cloud Sleuth
- **CI/CD**: Maven 3.9+ 多阶段构建流水线

## 构建系统

### Maven (后端)
```bash
# 构建所有服务
mvn clean package -DskipTests

# 运行特定服务
mvn spring-boot:run -f erp-gateway/pom.xml

# 运行测试
mvn test

# 代码质量检查
mvn checkstyle:check
mvn spotbugs:check
```

### NPM (前端)
```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 生产构建
npm run build

# 运行测试
npm run test:unit
npm run test:e2e
```

### Make命令 (编排)
```bash
# 一键部署
make deploy

# 开发环境
make dev-hot          # 热重载开发
make dev-backend      # 仅后端服务
make dev-frontend     # 仅前端

# 特定服务开发
make dev-gateway      # 仅网关服务
make dev-user         # 仅用户服务

# 测试
make test             # 所有测试
make test-backend     # 后端测试
make test-frontend    # 前端测试
make test-e2e         # 端到端测试

# 维护
make clean            # 清理构建产物
make health           # 健康检查
make logs             # 查看日志
```

### Docker Compose (本地开发)
```bash
# 启动所有基础设施
docker-compose up -d

# 启动监控服务
docker-compose --profile monitoring up -d

# 查看日志
docker-compose logs -f [service-name]
```

## 开发规范

- **Java**: 遵循Google Java代码规范，使用Checkstyle强制执行
- **TypeScript**: ESLint + Prettier配置
- **API**: RESTful设计，使用OpenAPI 3.0文档
- **测试**: 最低80%代码覆盖率要求
- **Git**: 遵循Conventional Commits规范
- **版本**: 语义化版本控制 (SemVer)