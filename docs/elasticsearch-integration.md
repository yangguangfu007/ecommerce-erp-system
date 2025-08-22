# Elasticsearch 集成文档

## 概述

Elasticsearch 已成功集成到 ERP 系统的基础设施服务中，作为搜索引擎和日志分析工具。

## 配置详情

### Docker Compose 配置

Elasticsearch 服务已从 `monitoring` profile 移至默认基础设施服务：

```yaml
elasticsearch:
  image: elasticsearch:8.10.4
  container_name: erp-elasticsearch
  restart: always
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ports:
    - "9200:9200"
    - "9300:9300"
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
  networks:
    - erp-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9200/_cluster/health"]
    timeout: 10s
    retries: 5
```

### 启动脚本更新

#### 基础设施启动脚本 (`scripts/start-infrastructure.sh`)

- 添加 Elasticsearch 到服务检查列表
- 添加 Elasticsearch 健康检查等待逻辑
- 添加 Elasticsearch 日志查看功能
- 更新服务状态显示，包含 Elasticsearch 访问地址

#### 主启动脚本 (`scripts/start-services.sh`)

- 更新基础设施服务描述，包含 Elasticsearch
- 更新帮助信息中的服务列表

## 服务信息

### 访问地址
- **Elasticsearch API**: http://localhost:9200
- **Elasticsearch 传输端口**: localhost:9300

### 健康检查
```bash
curl -s "http://localhost:9200/_cluster/health"
```

### 基本信息查询
```bash
curl -s "http://localhost:9200/"
```

## 启动命令

### 使用启动脚本（推荐）

```bash
# 启动所有基础设施服务（包括 Elasticsearch）
./scripts/start-infrastructure.sh start

# 查看 Elasticsearch 状态
./scripts/start-infrastructure.sh status

# 查看 Elasticsearch 日志
./scripts/start-infrastructure.sh logs elasticsearch
```

### 手动启动

```bash
# 启动 Elasticsearch
docker-compose up -d elasticsearch

# 检查状态
docker ps --filter "name=erp-elasticsearch"
```

## 日志管理

### 查看日志
```bash
# 使用启动脚本查看日志
./scripts/start-infrastructure.sh logs elasticsearch

# 直接使用 Docker Compose
docker-compose logs elasticsearch

# 实时查看日志
docker-compose logs -f elasticsearch
```

## 配置说明

### 内存配置
- 堆内存设置为 512MB (`ES_JAVA_OPTS=-Xms512m -Xmx512m`)
- 适合开发环境使用，生产环境建议增加内存

### 安全配置
- X-Pack 安全功能已禁用 (`xpack.security.enabled=false`)
- 适合开发环境，生产环境建议启用安全功能

### 集群配置
- 单节点模式 (`discovery.type=single-node`)
- 适合开发和测试环境

## 使用场景

### 1. 日志搜索和分析
- 应用程序日志存储和搜索
- 系统监控日志分析
- 错误日志聚合和查询

### 2. 商品搜索
- 商品全文搜索
- 商品分类和过滤
- 搜索建议和自动完成

### 3. 订单数据分析
- 订单历史数据查询
- 销售数据统计分析
- 客户行为分析

## 故障排除

### 常见问题

1. **内存不足**
   - 症状：容器启动失败或频繁重启
   - 解决：增加 Docker 内存限制或调整 ES_JAVA_OPTS

2. **端口冲突**
   - 症状：容器无法启动，端口被占用
   - 解决：检查端口 9200 和 9300 是否被其他服务占用

3. **磁盘空间不足**
   - 症状：索引创建失败或集群状态为 red
   - 解决：清理磁盘空间或调整数据保留策略

### 健康检查命令

```bash
# 检查集群健康状态
curl -s "http://localhost:9200/_cluster/health?pretty"

# 检查节点信息
curl -s "http://localhost:9200/_nodes?pretty"

# 检查索引列表
curl -s "http://localhost:9200/_cat/indices?v"
```

## 下一步计划

1. **集成应用日志**
   - 配置应用程序将日志发送到 Elasticsearch
   - 设置日志索引模板和生命周期策略

2. **商品搜索功能**
   - 实现商品数据同步到 Elasticsearch
   - 开发商品搜索 API

3. **监控和告警**
   - 配置 Elasticsearch 监控指标
   - 设置集群健康状态告警

4. **性能优化**
   - 根据使用情况调整内存和磁盘配置
   - 优化索引设置和映射

## 相关文档

- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Docker Compose 配置](../docker-compose.yml)
- [启动脚本使用指南](startup-scripts-guide.md)