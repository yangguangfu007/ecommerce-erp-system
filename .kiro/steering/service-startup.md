# 服务启动规范

## 后台运行原则

所有启动服务的命令都必须放到后台运行，并记录启动日志，确保服务启动过程可追踪和调试。

## 启动命令规范

### Docker Compose 服务启动
```bash
# 后台启动所有服务并记录日志
docker-compose up -d > logs/docker-startup.log 2>&1 &

# 启动特定服务组
docker-compose up -d mysql redis kafka > logs/infrastructure-startup.log 2>&1 &

# 查看启动状态
docker-compose ps
```

### Spring Boot 服务启动
```bash
# 后台启动网关服务
nohup java -jar erp-gateway/target/erp-gateway-1.0.jar \
  --spring.profiles.active=dev \
  > logs/gateway-startup.log 2>&1 &

# 后台启动用户服务
nohup java -jar erp-user-service/target/erp-user-service-1.0.jar \
  --spring.profiles.active=dev \
  > logs/user-service-startup.log 2>&1 &

# 使用Maven启动开发模式
nohup mvn spring-boot:run -Dspring-boot.run.profiles=dev \
  > logs/service-dev-startup.log 2>&1 &
```

### 前端服务启动
```bash
# 后台启动前端开发服务器
cd erp-frontend
nohup npm run dev > ../logs/frontend-startup.log 2>&1 &
```

## 日志管理

### 日志目录结构
```
logs/
├── docker-startup.log          # Docker服务启动日志
├── infrastructure-startup.log  # 基础设施服务启动日志
├── gateway-startup.log         # 网关服务启动日志
├── user-service-startup.log    # 用户服务启动日志
├── product-service-startup.log # 产品服务启动日志
├── order-service-startup.log   # 订单服务启动日志
├── inventory-service-startup.log # 库存服务启动日志
├── platform-service-startup.log  # 平台服务启动日志
├── logistics-service-startup.log # 物流服务启动日志
├── notification-service-startup.log # 通知服务启动日志
└── frontend-startup.log        # 前端服务启动日志
```

### 启动脚本模板
```bash
#!/bin/bash

# 服务启动函数模板
start_service() {
    local service_name=$1
    local service_jar=$2
    local profile=${3:-dev}
    local log_file="logs/${service_name}-startup.log"
    
    echo "正在启动 ${service_name} 服务..."
    echo "启动时间: $(date)" > ${log_file}
    
    nohup java -jar ${service_jar} \
        --spring.profiles.active=${profile} \
        >> ${log_file} 2>&1 &
    
    local pid=$!
    echo "服务 ${service_name} 已启动，PID: ${pid}"
    echo ${pid} > logs/${service_name}.pid
}

# 检查服务状态函数
check_service_status() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f ${pid_file} ]; then
        local pid=$(cat ${pid_file})
        if ps -p ${pid} > /dev/null; then
            echo "服务 ${service_name} 正在运行，PID: ${pid}"
        else
            echo "服务 ${service_name} 未运行"
            rm -f ${pid_file}
        fi
    else
        echo "服务 ${service_name} 未启动"
    fi
}
```

## 服务监控

### 启动状态检查
```bash
# 检查Docker服务状态
docker-compose ps

# 检查Java进程
ps aux | grep java

# 检查端口占用
netstat -tlnp | grep -E ':(8080|8001|8002|8003|8004|8005|8006|8007|3000)'

# 检查服务健康状态
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8001/actuator/health
```

### 日志查看命令
```bash
# 实时查看启动日志
tail -f logs/gateway-startup.log
tail -f logs/user-service-startup.log

# 查看所有服务启动日志
tail -f logs/*-startup.log

# 查看Docker服务日志
docker-compose logs -f
docker-compose logs -f gateway user-service
```

## 错误处理

### 启动失败处理
```bash
# 检查启动错误
grep -i error logs/*-startup.log
grep -i exception logs/*-startup.log

# 清理失败的服务进程
pkill -f "erp-.*-service"

# 重新启动失败的服务
./scripts/restart-service.sh gateway
./scripts/restart-service.sh user-service
```

### 端口冲突处理
```bash
# 查找占用端口的进程
lsof -i :8080
lsof -i :8001

# 终止占用端口的进程
kill -9 $(lsof -t -i :8080)
```

## 开发环境快速启动

### 一键启动脚本示例
```bash
#!/bin/bash
# 快速启动开发环境

echo "启动电商ERP系统开发环境..."

# 创建日志目录
mkdir -p logs

# 启动基础设施服务
echo "启动基础设施服务..."
docker-compose up -d mysql redis kafka nacos > logs/infrastructure-startup.log 2>&1

# 等待基础服务启动
echo "等待基础服务启动完成..."
sleep 30

# 启动后端服务
echo "启动后端微服务..."
./scripts/start-backend-services.sh

# 启动前端服务
echo "启动前端服务..."
cd erp-frontend
nohup npm run dev > ../logs/frontend-startup.log 2>&1 &
cd ..

echo "所有服务启动完成！"
echo "查看启动日志: tail -f logs/*-startup.log"
echo "检查服务状态: ./scripts/check-services.sh"
```

## 注意事项

1. **日志轮转**: 定期清理或轮转启动日志文件，避免磁盘空间不足
2. **PID管理**: 记录服务进程ID，便于后续管理和停止服务
3. **健康检查**: 启动后及时检查服务健康状态
4. **依赖顺序**: 按照服务依赖关系顺序启动（基础设施 → 网关 → 业务服务 → 前端）
5. **环境隔离**: 不同环境使用不同的日志文件和配置

通过遵循这些规范，确保所有服务启动过程都有完整的日志记录，便于问题排查和系统监控。