# 🚀 电商 ERP 系统部署指南

## 📖 概述

本文档提供了电商 ERP 系统的完整部署指南，涵盖从本地开发环境到生产环境的全套部署方案。系统采用云原生架构，支持 Docker、Kubernetes 和 Helm 多种部署方式，确保高可用性和可扩展性。

### 🎯 部署目标

- ✅ **快速部署**: 5分钟内完成本地环境搭建
- ✅ **生产就绪**: 企业级生产环境部署方案
- ✅ **高可用性**: 多节点集群部署，故障自动恢复
- ✅ **可观测性**: 完整的监控、日志和链路追踪
- ✅ **安全性**: 企业级安全配置和最佳实践

## 目录

1. [环境要求](#环境要求)
2. [部署前准备](#部署前准备)
3. [开发环境部署](#开发环境部署)
4. [生产环境部署](#生产环境部署)
5. [配置管理](#配置管理)
6. [监控和告警](#监控和告警)
7. [备份和恢复](#备份和恢复)
8. [故障排除](#故障排除)
9. [运维最佳实践](#运维最佳实践)

## 环境要求

### 硬件要求

#### 开发环境
- **节点数量**: 1个节点
- **CPU**: 4核心
- **内存**: 8GB
- **存储**: 100GB SSD
- **网络**: 1Gbps

#### 生产环境
- **节点数量**: 5个节点（3个Master + 2个Worker）
- **CPU**: 8核心/节点
- **内存**: 16GB/节点
- **存储**: 500GB SSD/节点
- **网络**: 10Gbps

### 软件要求

#### 必需软件
- **Kubernetes**: v1.33.3+
- **Docker**: v24.0.7+
- **Helm**: v3.13.2+
- **kubectl**: v1.33.3+

#### 可选软件
- **Prometheus**: v2.47.2
- **Grafana**: v10.2.2
- **ELK Stack**: v8.11.1

### 网络要求

#### 端口配置
```
# Kubernetes API Server
6443/tcp

# etcd
2379-2380/tcp

# Kubelet API
10250/tcp

# NodePort Services
30000-32767/tcp

# 应用服务端口
8001-8007/tcp (微服务)
8080/tcp (网关)
3306/tcp (MySQL)
6379/tcp (Redis)
9092/tcp (Kafka)
```

#### 域名配置
```
# 生产环境
erp.yourdomain.com -> API网关
grafana.yourdomain.com -> Grafana监控
prometheus.yourdomain.com -> Prometheus

# 开发环境
erp-dev.local -> API网关
```

## 部署前准备

### 1. 环境检查

```bash
# 检查Kubernetes集群状态
kubectl cluster-info
kubectl get nodes

# 检查存储类
kubectl get storageclass

# 检查网络插件
kubectl get pods -n kube-system
```

### 2. 创建命名空间

```bash
# 创建生产命名空间
kubectl create namespace erp-system

# 创建开发命名空间
kubectl create namespace erp-system-dev
```

### 3. 配置镜像仓库

```bash
# 创建镜像拉取密钥（如果使用私有仓库）
kubectl create secret docker-registry registry-secret \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@example.com \
  -n erp-system
```

### 4. 配置存储

```bash
# 创建存储类（示例）
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  fsType: ext4
reclaimPolicy: Retain
allowVolumeExpansion: true
EOF
```

## 开发环境部署

### 🔥 热重载开发环境（推荐）

最佳的开发体验，支持代码修改后自动生效，无需重启服务：

```bash
# 1. 克隆项目
git clone https://github.com/yangguangfu007/ecommerce-erp-system.git
cd ecommerce-erp-system

# 2. 启动热重载开发环境
make dev-hot

# 3. 特性说明
# - 后端：Spring DevTools 自动重启（2-3秒）
# - 前端：Vite HMR 热模块替换（毫秒级）
# - 配置文件修改自动重载
# - 依赖变更自动检测

# 4. 访问系统
echo "前端界面: http://localhost:3000"
echo "API 网关: http://localhost:8080"
echo "Nacos 控制台: http://localhost:8848/nacos"
```

### 🎯 选择性服务开发

支持只启动需要的服务，提高开发效率：

```bash
# 只启动特定服务（热重载模式）
make dev-gateway     # 只启动网关服务
make dev-user        # 只启动用户服务
make dev-product     # 只启动产品服务
make dev-order       # 只启动订单服务
make dev-inventory   # 只启动库存服务

# 使用环境变量启动多个服务
SERVICES="gateway,user,product" ./scripts/dev-hot-reload.sh

# 只启动前端
SERVICES=frontend ./scripts/dev-hot-reload.sh
```

### 🔨 选择性构建和部署

支持只构建和部署特定服务：

```bash
# 构建特定服务
make build-gateway      # 只构建网关服务
make build-user         # 只构建用户服务
make build-product      # 只构建产品服务

# 使用选择性构建脚本
SERVICES=gateway ./scripts/build-selective.sh
SERVICES="gateway,user,product" ./scripts/build-selective.sh

# 生产环境构建
BUILD_TYPE=prod SERVICES=all ./scripts/build-selective.sh

# 构建并推送到镜像仓库
PUSH=true REGISTRY=your-registry.com ./scripts/build-selective.sh
```

### 🐳 Docker Compose 开发环境

适合传统的容器化开发：

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f

# 4. 重启特定服务
docker-compose restart erp-user-service

# 5. 停止服务
docker-compose down
```

### 🛠️ 开发环境配置

#### 环境变量配置

```bash
# 开发环境配置
export SPRING_PROFILES_ACTIVE=dev
export NODE_ENV=development

# 数据库配置
export DB_HOST=localhost
export DB_PORT=3306
export DB_USERNAME=root
export DB_PASSWORD=root123

# Redis 配置
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=redis123

# Kafka 配置
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

#### IDE 配置

**IntelliJ IDEA 配置**:
```bash
# VM Options
-Dspring.profiles.active=dev
-Dspring.devtools.restart.enabled=true
-Dspring.devtools.livereload.enabled=true

# Program Arguments
--server.port=8081
```

**VS Code 配置**:
```json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-17",
      "path": "/path/to/jdk-17"
    }
  ],
  "spring-boot.ls.java.home": "/path/to/jdk-17"
}
```

### 📊 开发环境监控

开发环境也包含完整的监控栈：

```bash
# 访问监控服务
echo "Grafana: http://localhost:3001 (admin/admin123)"
echo "Prometheus: http://localhost:9090"
echo "Kibana: http://localhost:5601"
echo "Zipkin: http://localhost:9411"

# 健康检查
./scripts/deploy/health-check.sh

# 查看服务状态
make status
```

### 🧪 开发环境测试

```bash
# 运行所有测试
make test

# 运行特定测试
make test-backend       # 后端测试
make test-frontend      # 前端测试
make test-e2e          # 端到端测试

# 运行集成测试
cd scripts/testing
./test-orchestrator.sh test all
```

## 生产环境部署

### 方式一：使用部署脚本（推荐）

#### 1. 开发环境部署

```bash
# 克隆代码仓库
git clone https://github.com/your-org/erp-system.git
cd erp-system

# 部署开发环境
./scripts/deploy/deploy.sh dev latest

# 检查部署状态
./scripts/deploy/health-check.sh erp-system-dev
```

#### 2. 生产环境部署

```bash
# 构建生产镜像
./scripts/docker/build-all.sh v1.0.0

# 部署生产环境
./scripts/deploy/deploy.sh prod v1.0.0

# 检查部署状态
./scripts/deploy/health-check.sh erp-system
```

### 方式二：使用Helm手动部署

#### 1. 添加Helm仓库

```bash
# 添加依赖仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

#### 2. 部署基础设施

```bash
# 部署MySQL
helm install mysql bitnami/mysql \
  --namespace erp-system \
  --set auth.rootPassword=root123 \
  --set auth.database=erp_system

# 部署Redis
helm install redis bitnami/redis \
  --namespace erp-system \
  --set auth.enabled=false

# 部署Kafka
helm install kafka bitnami/kafka \
  --namespace erp-system \
  --set zookeeper.enabled=true
```

#### 3. 部署应用

```bash
# 部署ERP系统
helm install erp-system ./helm/erp-system \
  --namespace erp-system \
  --values ./helm/erp-system/values-prod.yaml
```

### 方式三：使用Kubernetes原生YAML

```bash
# 部署基础设施
kubectl apply -f k8s/infrastructure/

# 等待基础设施就绪
kubectl wait --for=condition=ready pod -l app=mysql -n erp-system --timeout=300s

# 部署应用服务
kubectl apply -f k8s/services/

# 部署监控系统
kubectl apply -f k8s/monitoring/
```

## 配置管理

### 1. 环境变量配置

#### ConfigMap配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: erp-config
  namespace: erp-system
data:
  # 数据库配置
  DB_HOST: "mysql"
  DB_PORT: "3306"
  DB_NAME: "erp_system"
  
  # Redis配置
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
  
  # Kafka配置
  KAFKA_BROKERS: "kafka:9092"
```

#### Secret配置
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: erp-secrets
  namespace: erp-system
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  WALMART_API_KEY: <base64-encoded-api-key>
```

### 2. 应用配置

#### Spring Boot配置
```yaml
# application-k8s.yml
spring:
  profiles:
    active: k8s
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT}
  kafka:
    bootstrap-servers: ${KAFKA_BROKERS}
```

### 3. 外部服务配置

#### 沃尔玛API配置
```yaml
walmart:
  api:
    base-url: "https://marketplace.walmartapis.com"
    client-id: ${WALMART_CLIENT_ID}
    client-secret: ${WALMART_CLIENT_SECRET}
    timeout: 30000
```

#### 云途物流配置
```yaml
yunexpress:
  api:
    base-url: "https://api.yunexpress.com"
    customer-code: ${YUNEXPRESS_CUSTOMER_CODE}
    api-key: ${YUNEXPRESS_API_KEY}
    timeout: 30000
```

## 监控和告警

### 1. Prometheus配置

#### 监控目标配置
```yaml
scrape_configs:
  - job_name: 'erp-services'
    kubernetes_sd_configs:
      - role: service
        namespaces:
          names:
            - erp-system
    relabel_configs:
      - source_labels: [__meta_kubernetes_service_label_component]
        action: keep
        regex: (microservice|gateway)
```

#### 告警规则配置
```yaml
groups:
  - name: erp-system.rules
    rules:
    - alert: ERPServiceDown
      expr: up{job=~"erp-.*"} == 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "ERP服务下线"
        description: "服务 {{ $labels.job }} 已下线超过2分钟"
```

### 2. Grafana仪表板

#### 系统概览仪表板
- 服务健康状态
- 请求速率和响应时间
- 错误率统计
- 资源使用情况

#### 业务监控仪表板
- 订单处理量
- 库存变化趋势
- 平台同步状态
- 物流处理状态

### 3. 日志收集

#### ELK配置
```yaml
# Filebeat配置
filebeat.inputs:
- type: container
  paths:
    - /var/log/containers/*erp*.log
  processors:
  - add_kubernetes_metadata:
      host: ${NODE_NAME}
      matchers:
      - logs_path:
          logs_path: "/var/log/containers/"
```

## 备份和恢复

### 1. 数据库备份

#### 自动备份
```bash
# 设置定时备份（每天凌晨2点）
0 2 * * * /path/to/scripts/backup/backup-mysql.sh erp-system /backup/mysql
```

#### 手动备份
```bash
# 执行备份
./scripts/backup/backup-mysql.sh erp-system /backup/mysql

# 验证备份
ls -la /backup/mysql/
```

### 2. 数据恢复

#### 恢复步骤
```bash
# 1. 停止应用服务
kubectl scale deployment --all --replicas=0 -n erp-system

# 2. 执行恢复
./scripts/backup/restore-mysql.sh /backup/mysql/backup.sql.gz erp-system

# 3. 启动应用服务
kubectl scale deployment --all --replicas=2 -n erp-system
```

### 3. 配置备份

#### 备份Kubernetes配置
```bash
# 备份所有配置
kubectl get all,configmap,secret,pvc -n erp-system -o yaml > erp-system-backup.yaml

# 备份Helm配置
helm get values erp-system -n erp-system > erp-system-values-backup.yaml
```

## 故障排除

### 1. 常见问题

#### 服务启动失败
```bash
# 检查Pod状态
kubectl get pods -n erp-system

# 查看Pod日志
kubectl logs <pod-name> -n erp-system

# 查看Pod详细信息
kubectl describe pod <pod-name> -n erp-system
```

#### 数据库连接问题
```bash
# 检查MySQL服务状态
kubectl get svc mysql -n erp-system

# 测试数据库连接
kubectl exec -it <app-pod> -n erp-system -- mysql -h mysql -u root -p

# 检查数据库日志
kubectl logs <mysql-pod> -n erp-system
```

#### 网络连接问题
```bash
# 检查服务端点
kubectl get endpoints -n erp-system

# 测试服务连接
kubectl exec -it <pod> -n erp-system -- curl http://service-name:port/health

# 检查网络策略
kubectl get networkpolicy -n erp-system
```

### 2. 性能问题

#### 资源使用监控
```bash
# 查看资源使用情况
kubectl top pods -n erp-system
kubectl top nodes

# 检查资源限制
kubectl describe pod <pod-name> -n erp-system | grep -A 5 "Limits\|Requests"
```

#### 应用性能分析
```bash
# 查看应用指标
curl http://service-name:port/actuator/metrics

# 查看JVM信息
curl http://service-name:port/actuator/info
```

### 3. 数据一致性问题

#### 检查数据同步状态
```bash
# 检查Kafka消费者状态
kubectl exec -it kafka-pod -n erp-system -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# 检查消息积压
kubectl exec -it kafka-pod -n erp-system -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group erp-group
```

## 运维最佳实践

### 1. 部署最佳实践

#### 滚动更新
```bash
# 设置滚动更新策略
kubectl patch deployment app-name -n erp-system -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'

# 执行滚动更新
kubectl set image deployment/app-name container-name=new-image:tag -n erp-system

# 监控更新进度
kubectl rollout status deployment/app-name -n erp-system
```

#### 蓝绿部署
```bash
# 创建新版本部署
kubectl apply -f app-v2-deployment.yaml

# 切换流量
kubectl patch service app-service -p '{"spec":{"selector":{"version":"v2"}}}'

# 清理旧版本
kubectl delete deployment app-v1 -n erp-system
```

### 2. 监控最佳实践

#### 关键指标监控
- **可用性**: 服务正常运行时间
- **性能**: 响应时间、吞吐量
- **错误率**: 4xx/5xx错误比例
- **资源使用**: CPU、内存、磁盘、网络

#### 告警设置
- **严重告警**: 服务下线、数据库连接失败
- **警告告警**: 高错误率、高响应时间
- **信息告警**: 部署完成、备份完成

### 3. 安全最佳实践

#### 网络安全
```yaml
# 网络策略示例
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: erp-network-policy
spec:
  podSelector:
    matchLabels:
      app: erp-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: erp-gateway
    ports:
    - protocol: TCP
      port: 8080
```

#### 密钥管理
```bash
# 使用外部密钥管理系统
# 例如：AWS Secrets Manager, HashiCorp Vault

# 定期轮换密钥
kubectl create secret generic new-secret --from-literal=key=value
kubectl patch deployment app-name -p '{"spec":{"template":{"spec":{"containers":[{"name":"container-name","env":[{"name":"SECRET_KEY","valueFrom":{"secretKeyRef":{"name":"new-secret","key":"key"}}}]}]}}}}'
```

### 4. 容量规划

#### 资源预估
```bash
# 基于历史数据预估资源需求
# CPU: 基线 + 峰值处理能力
# 内存: 应用内存 + 缓存 + 缓冲区
# 存储: 数据增长 + 日志 + 备份
# 网络: 峰值流量 + 冗余
```

#### 自动扩缩容
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: erp-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: erp-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 联系信息

如有问题，请联系：
- **运维团队**: ops@company.com
- **开发团队**: dev@company.com
- **紧急联系**: +86-xxx-xxxx-xxxx

## 更新日志

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2024-01-01 | 初始版本 | 运维团队 |
| 1.1.0 | 2024-02-01 | 添加监控配置 | 运维团队 |
| 1.2.0 | 2024-03-01 | 添加故障排除指南 | 运维团队 |