# Gateway 服务指南

## 概述

ERP Gateway 是系统的统一入口，基于 Spring Cloud Gateway 构建，提供路由转发、负载均衡、限流、熔断等功能。

## 🚀 快速启动

### 前置条件

确保以下基础设施服务已启动：

```bash
# 启动基础设施
docker-compose up -d mysql redis nacos kafka
```

### 启动 Gateway

```bash
# 开发环境启动
mvn spring-boot:run -f erp-gateway/pom.xml -Dspring-boot.run.profiles=dev

# 或使用脚本启动
./scripts/dev-backend.sh gateway
```

## 📊 服务验证

### 基础健康检查

```bash
# 检查服务状态
curl http://localhost:8080/actuator/health

# 预期响应
{
  "status": "UP",
  "components": {
    "diskSpace": {"status": "UP"},
    "ping": {"status": "UP"},
    "redis": {"status": "UP"}
  }
}
```

### 查看所有监控端点

```bash
curl http://localhost:8080/actuator
```

### 路由配置验证

```bash
# 查看所有路由
curl http://localhost:8080/actuator/gateway/routes

# 查看特定路由
curl http://localhost:8080/actuator/gateway/routes/user-service
```

## 🛣️ 路由配置

Gateway 配置了以下服务路由：

| 服务名称 | 路径匹配 | 目标服务 | 说明 |
|---------|---------|---------|------|
| 用户服务 | `/api/users/**` | `lb://erp-user-service` | 用户管理和认证 |
| 商品服务 | `/api/products/**` | `lb://erp-product-service` | 商品管理 |
| 订单服务 | `/api/orders/**` | `lb://erp-order-service` | 订单处理 |
| 库存服务 | `/api/inventory/**` | `lb://erp-inventory-service` | 库存管理 |
| 平台服务 | `/api/platforms/**` | `lb://erp-platform-service` | 平台对接 |
| 物流服务 | `/api/logistics/**` | `lb://erp-logistics-service` | 物流管理 |
| 通知服务 | `/api/notifications/**` | `lb://erp-notification-service` | 消息通知 |

## 🔧 核心功能

### 1. 负载均衡

Gateway 使用 Spring Cloud LoadBalancer 实现负载均衡：

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
```

### 2. 重试机制

配置了自动重试功能：

```yaml
default-filters:
  - name: Retry
    args:
      retries: 3
      statuses: BAD_GATEWAY,GATEWAY_TIMEOUT
      methods: GET,POST
```

### 3. 服务发现

集成 Nacos 服务发现：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: erp-system
```

## 📈 监控指标

### 关键指标

```bash
# 查看所有指标
curl http://localhost:8080/actuator/metrics

# 查看特定指标
curl http://localhost:8080/actuator/metrics/gateway.requests
curl http://localhost:8080/actuator/metrics/jvm.memory.used
curl http://localhost:8080/actuator/metrics/system.cpu.usage
```

### 重要监控指标

| 指标名称 | 描述 | 监控建议 |
|---------|------|---------|
| `gateway.requests` | 网关请求统计 | 监控请求量和响应时间 |
| `jvm.memory.used` | JVM 内存使用 | 设置内存使用率告警 |
| `system.cpu.usage` | CPU 使用率 | 监控系统负载 |
| `resilience4j.circuitbreaker.calls` | 熔断器调用统计 | 监控熔断状态 |

## 🔒 安全配置

### 认证过滤器

Gateway 配置了统一的认证过滤器：

```yaml
filters:
  - StripPrefix=2
  - name: AuthenticationFilter
```

### CORS 配置

支持跨域请求配置：

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
```

## 🚨 故障排查

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   lsof -ti:8080
   
   # 杀死占用进程
   kill -9 <PID>
   ```

2. **Nacos 连接失败**
   ```bash
   # 检查 Nacos 状态
   curl http://localhost:8848/nacos/v1/ns/operator/metrics
   ```

3. **Redis 连接失败**
   ```bash
   # 检查 Redis 状态
   docker-compose ps redis
   redis-cli ping
   ```

### 日志查看

```bash
# 查看 Gateway 日志
docker-compose logs -f gateway

# 或查看应用日志
tail -f logs/gateway.log
```

## 🔧 配置调优

### JVM 参数优化

```bash
# 生产环境 JVM 参数
export JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### 连接池配置

```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 20
          max-idle: 10
          min-idle: 5
```

## 📚 相关文档

- [Spring Cloud Gateway 官方文档](https://spring.io/projects/spring-cloud-gateway)
- [Nacos 服务发现](https://nacos.io/zh-cn/docs/discovery.html)
- [Resilience4j 熔断器](https://resilience4j.readme.io/docs)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)