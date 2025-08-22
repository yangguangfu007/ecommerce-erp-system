#!/bin/bash

# ERP系统后端服务启动脚本
# 用于启动用户服务、网关服务等后端微服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/logs"

# 创建日志目录
mkdir -p "$LOGS_DIR"

# 日志文件路径
USER_SERVICE_LOG="$LOGS_DIR/user-service.log"
GATEWAY_LOG="$LOGS_DIR/gateway.log"
PRODUCT_SERVICE_LOG="$LOGS_DIR/product-service.log"
ORDER_SERVICE_LOG="$LOGS_DIR/order-service.log"
INVENTORY_SERVICE_LOG="$LOGS_DIR/inventory-service.log"
PLATFORM_SERVICE_LOG="$LOGS_DIR/platform-service.log"
LOGISTICS_SERVICE_LOG="$LOGS_DIR/logistics-service.log"
NOTIFICATION_SERVICE_LOG="$LOGS_DIR/notification-service.log"

# PID文件路径
PIDS_DIR="$PROJECT_ROOT/pids"
mkdir -p "$PIDS_DIR"

USER_SERVICE_PID="$PIDS_DIR/user-service.pid"
GATEWAY_PID="$PIDS_DIR/gateway.pid"
PRODUCT_SERVICE_PID="$PIDS_DIR/product-service.pid"
ORDER_SERVICE_PID="$PIDS_DIR/order-service.pid"
INVENTORY_SERVICE_PID="$PIDS_DIR/inventory-service.pid"
PLATFORM_SERVICE_PID="$PIDS_DIR/platform-service.pid"
LOGISTICS_SERVICE_PID="$PIDS_DIR/logistics-service.pid"
NOTIFICATION_SERVICE_PID="$PIDS_DIR/notification-service.pid"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查服务是否运行
check_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # 服务正在运行
        else
            rm -f "$pid_file"  # 清理无效的PID文件
            return 1  # 服务未运行
        fi
    else
        return 1  # PID文件不存在
    fi
}

# 停止服务
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if check_service "$service_name" "$pid_file"; then
        local pid=$(cat "$pid_file")
        print_message $YELLOW "停止 $service_name (PID: $pid)..."
        kill "$pid" 2>/dev/null || true
        sleep 2
        
        # 强制杀死如果还在运行
        if ps -p "$pid" > /dev/null 2>&1; then
            print_message $YELLOW "强制停止 $service_name..."
            kill -9 "$pid" 2>/dev/null || true
        fi
        
        rm -f "$pid_file"
        print_message $GREEN "$service_name 已停止"
    else
        print_message $BLUE "$service_name 未运行"
    fi
}

# 检查基础设施服务是否运行
check_infrastructure() {
    print_message $BLUE "检查基础设施服务状态..."
    
    cd "$PROJECT_ROOT"
    
    # 检查Docker Compose是否运行
    if ! command -v docker-compose >/dev/null 2>&1 && ! command -v docker >/dev/null 2>&1; then
        print_message $RED "Docker或Docker Compose未安装，请先安装Docker"
        return 1
    fi
    
    # 检查MySQL
    if ! docker-compose exec -T mysql mysqladmin ping -h localhost --silent > /dev/null 2>&1; then
        print_message $RED "MySQL未运行，请先启动基础设施服务: ./scripts/start-infrastructure.sh"
        return 1
    fi
    
    # 检查Redis
    if ! docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_message $RED "Redis未运行，请先启动基础设施服务: ./scripts/start-infrastructure.sh"
        return 1
    fi
    
    # 检查Nacos（使用通用方法）
    local nacos_check=false
    
    # 方法1：使用curl
    if command -v curl >/dev/null 2>&1; then
        if curl -s --connect-timeout 5 --max-time 10 "http://localhost:8848/nacos" > /dev/null 2>&1; then
            nacos_check=true
        fi
    # 方法2：使用wget
    elif command -v wget >/dev/null 2>&1; then
        if wget -q --timeout=5 --tries=1 "http://localhost:8848/nacos" -O /dev/null 2>/dev/null; then
            nacos_check=true
        fi
    # 方法3：使用端口检查
    else
        if check_port 8848; then
            nacos_check=true
        fi
    fi
    
    if [ "$nacos_check" = false ]; then
        print_message $RED "Nacos未运行，请先启动基础设施服务: ./scripts/start-infrastructure.sh"
        return 1
    fi
    
    print_message $GREEN "基础设施服务运行正常"
    return 0
}

# 检查后端服务运行状态
check_backend_services() {
    print_message $BLUE "检查后端服务状态..."
    
    local running_services=()
    local stopped_services=()
    
    # 检查各个服务状态
    if check_service "用户服务" "$USER_SERVICE_PID"; then
        running_services+=("用户服务")
    else
        stopped_services+=("用户服务")
    fi
    
    if check_service "网关服务" "$GATEWAY_PID"; then
        running_services+=("网关服务")
    else
        stopped_services+=("网关服务")
    fi
    
    if check_service "商品服务" "$PRODUCT_SERVICE_PID"; then
        running_services+=("商品服务")
    else
        stopped_services+=("商品服务")
    fi
    
    if check_service "订单服务" "$ORDER_SERVICE_PID"; then
        running_services+=("订单服务")
    else
        stopped_services+=("订单服务")
    fi
    
    if check_service "库存服务" "$INVENTORY_SERVICE_PID"; then
        running_services+=("库存服务")
    else
        stopped_services+=("库存服务")
    fi
    
    if check_service "平台服务" "$PLATFORM_SERVICE_PID"; then
        running_services+=("平台服务")
    else
        stopped_services+=("平台服务")
    fi
    
    if check_service "物流服务" "$LOGISTICS_SERVICE_PID"; then
        running_services+=("物流服务")
    else
        stopped_services+=("物流服务")
    fi
    
    if check_service "通知服务" "$NOTIFICATION_SERVICE_PID"; then
        running_services+=("通知服务")
    else
        stopped_services+=("通知服务")
    fi
    
    if [ ${#running_services[@]} -gt 0 ]; then
        print_message $GREEN "已运行的服务: ${running_services[*]}"
    fi
    
    if [ ${#stopped_services[@]} -gt 0 ]; then
        print_message $YELLOW "需要启动的服务: ${stopped_services[*]}"
        return 1
    else
        print_message $GREEN "所有后端服务都已运行"
        return 0
    fi
}

# 启动用户服务
start_user_service() {
    if check_service "用户服务" "$USER_SERVICE_PID"; then
        print_message $GREEN "用户服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动用户服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$USER_SERVICE_LOG"
    
    nohup mvn -f erp-user-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$USER_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$USER_SERVICE_PID"
    
    print_message $GREEN "用户服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $USER_SERVICE_LOG"
}

# 启动网关服务
start_gateway() {
    if check_service "网关服务" "$GATEWAY_PID"; then
        print_message $GREEN "网关服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动网关服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$GATEWAY_LOG"
    
    nohup mvn -f erp-gateway/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$GATEWAY_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$GATEWAY_PID"
    
    print_message $GREEN "网关服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $GATEWAY_LOG"
}

# 启动商品服务
start_product_service() {
    if check_service "商品服务" "$PRODUCT_SERVICE_PID"; then
        print_message $GREEN "商品服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动商品服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$PRODUCT_SERVICE_LOG"
    
    nohup mvn -f erp-product-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$PRODUCT_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$PRODUCT_SERVICE_PID"
    
    print_message $GREEN "商品服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $PRODUCT_SERVICE_LOG"
}

# 启动订单服务
start_order_service() {
    if check_service "订单服务" "$ORDER_SERVICE_PID"; then
        print_message $GREEN "订单服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动订单服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$ORDER_SERVICE_LOG"
    
    nohup mvn -f erp-order-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$ORDER_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$ORDER_SERVICE_PID"
    
    print_message $GREEN "订单服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $ORDER_SERVICE_LOG"
}

# 启动库存服务
start_inventory_service() {
    if check_service "库存服务" "$INVENTORY_SERVICE_PID"; then
        print_message $GREEN "库存服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动库存服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$INVENTORY_SERVICE_LOG"
    
    nohup mvn -f erp-inventory-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$INVENTORY_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$INVENTORY_SERVICE_PID"
    
    print_message $GREEN "库存服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $INVENTORY_SERVICE_LOG"
}

# 启动平台服务
start_platform_service() {
    if check_service "平台服务" "$PLATFORM_SERVICE_PID"; then
        print_message $GREEN "平台服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动平台服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$PLATFORM_SERVICE_LOG"
    
    nohup mvn -f erp-platform-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$PLATFORM_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$PLATFORM_SERVICE_PID"
    
    print_message $GREEN "平台服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $PLATFORM_SERVICE_LOG"
}

# 启动物流服务
start_logistics_service() {
    if check_service "物流服务" "$LOGISTICS_SERVICE_PID"; then
        print_message $GREEN "物流服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动物流服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$LOGISTICS_SERVICE_LOG"
    
    nohup mvn -f erp-logistics-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$LOGISTICS_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$LOGISTICS_SERVICE_PID"
    
    print_message $GREEN "物流服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $LOGISTICS_SERVICE_LOG"
}

# 启动通知服务
start_notification_service() {
    if check_service "通知服务" "$NOTIFICATION_SERVICE_PID"; then
        print_message $GREEN "通知服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动通知服务..."
    
    cd "$PROJECT_ROOT"
    
    # 清理旧日志
    > "$NOTIFICATION_SERVICE_LOG"
    
    nohup mvn -f erp-notification-service/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dspring.profiles.active=dev > "$NOTIFICATION_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$NOTIFICATION_SERVICE_PID"
    
    print_message $GREEN "通知服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $NOTIFICATION_SERVICE_LOG"
}

# 检查端口是否开放（通用方法）
check_port() {
    local port=$1
    local timeout=3
    
    # 方法1：尝试使用/dev/tcp（bash内置，最通用）
    if timeout "$timeout" bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null; then
        return 0
    fi
    
    # 方法2：如果有curl，使用curl检查
    if command -v curl >/dev/null 2>&1; then
        if curl -s --connect-timeout "$timeout" --max-time "$timeout" "http://localhost:$port" >/dev/null 2>&1; then
            return 0
        fi
    fi
    
    # 方法3：如果有wget，使用wget检查
    if command -v wget >/dev/null 2>&1; then
        if wget -q --timeout="$timeout" --tries=1 "http://localhost:$port" -O /dev/null 2>/dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# 等待服务启动
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=40
    local attempt=1
    
    print_message $BLUE "等待 $service_name 启动 (端口: $port)..."
    
    while [ $attempt -le $max_attempts ]; do
        # 首先检查端口是否开放
        if check_port "$port"; then
            # 如果有curl，尝试检查健康检查端点
            if command -v curl >/dev/null 2>&1; then
                if curl -s --connect-timeout 3 --max-time 5 "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
                    print_message $GREEN "$service_name 启动成功!"
                    return 0
                fi
            else
                # 没有curl的情况下，端口开放就认为服务启动成功
                print_message $GREEN "$service_name 启动成功! (端口已开放)"
                return 0
            fi
        fi
        
        # 每5次尝试显示一次进度，减少日志噪音
        if [ $((attempt % 5)) -eq 0 ]; then
            print_message $YELLOW "等待 $service_name 启动... ($attempt/$max_attempts)"
        fi
        
        sleep 3
        ((attempt++))
    done
    
    print_message $RED "$service_name 启动超时!"
    print_message $YELLOW "请检查日志文件获取详细错误信息"
    return 1
}

# 显示服务状态
show_status() {
    print_message $BLUE "=== ERP系统后端服务状态 ==="
    
    local running_count=0
    local total_count=8
    
    # 检查用户服务
    if check_service "用户服务" "$USER_SERVICE_PID"; then
        local pid=$(cat "$USER_SERVICE_PID")
        print_message $GREEN "✓ 用户服务运行中 (PID: $pid, 端口: 8001)"
        ((running_count++))
    else
        print_message $RED "✗ 用户服务未运行 (端口: 8001)"
    fi
    
    # 检查网关服务
    if check_service "网关服务" "$GATEWAY_PID"; then
        local pid=$(cat "$GATEWAY_PID")
        print_message $GREEN "✓ 网关服务运行中 (PID: $pid, 端口: 8080)"
        ((running_count++))
    else
        print_message $RED "✗ 网关服务未运行 (端口: 8080)"
    fi
    
    # 检查商品服务
    if check_service "商品服务" "$PRODUCT_SERVICE_PID"; then
        local pid=$(cat "$PRODUCT_SERVICE_PID")
        print_message $GREEN "✓ 商品服务运行中 (PID: $pid, 端口: 8002)"
        ((running_count++))
    else
        print_message $RED "✗ 商品服务未运行 (端口: 8002)"
    fi
    
    # 检查订单服务
    if check_service "订单服务" "$ORDER_SERVICE_PID"; then
        local pid=$(cat "$ORDER_SERVICE_PID")
        print_message $GREEN "✓ 订单服务运行中 (PID: $pid, 端口: 8003)"
        ((running_count++))
    else
        print_message $RED "✗ 订单服务未运行 (端口: 8003)"
    fi
    
    # 检查库存服务
    if check_service "库存服务" "$INVENTORY_SERVICE_PID"; then
        local pid=$(cat "$INVENTORY_SERVICE_PID")
        print_message $GREEN "✓ 库存服务运行中 (PID: $pid, 端口: 8004)"
        ((running_count++))
    else
        print_message $RED "✗ 库存服务未运行 (端口: 8004)"
    fi
    
    # 检查平台服务
    if check_service "平台服务" "$PLATFORM_SERVICE_PID"; then
        local pid=$(cat "$PLATFORM_SERVICE_PID")
        print_message $GREEN "✓ 平台服务运行中 (PID: $pid, 端口: 8005)"
        ((running_count++))
    else
        print_message $RED "✗ 平台服务未运行 (端口: 8005)"
    fi
    
    # 检查物流服务
    if check_service "物流服务" "$LOGISTICS_SERVICE_PID"; then
        local pid=$(cat "$LOGISTICS_SERVICE_PID")
        print_message $GREEN "✓ 物流服务运行中 (PID: $pid, 端口: 8006)"
        ((running_count++))
    else
        print_message $RED "✗ 物流服务未运行 (端口: 8006)"
    fi
    
    # 检查通知服务
    if check_service "通知服务" "$NOTIFICATION_SERVICE_PID"; then
        local pid=$(cat "$NOTIFICATION_SERVICE_PID")
        print_message $GREEN "✓ 通知服务运行中 (PID: $pid, 端口: 8007)"
        ((running_count++))
    else
        print_message $RED "✗ 通知服务未运行 (端口: 8007)"
    fi
    
    echo ""
    print_message $BLUE "=== 服务统计 ==="
    print_message $BLUE "运行中: $running_count/$total_count 个服务"
    
    echo ""
    print_message $BLUE "=== 主要访问地址 ==="
    print_message $BLUE "网关API: http://localhost:8080/api"
    print_message $BLUE "用户服务: http://localhost:8001"
    print_message $BLUE "商品服务: http://localhost:8002"
    print_message $BLUE "订单服务: http://localhost:8003"
    print_message $BLUE "库存服务: http://localhost:8004"
    
    echo ""
    print_message $BLUE "=== 健康检查地址 ==="
    print_message $BLUE "网关服务: http://localhost:8080/actuator/health"
    print_message $BLUE "用户服务: http://localhost:8001/actuator/health"
    print_message $BLUE "商品服务: http://localhost:8002/actuator/health"
    print_message $BLUE "订单服务: http://localhost:8003/actuator/health"
    print_message $BLUE "库存服务: http://localhost:8004/actuator/health"
    
    echo ""
    print_message $BLUE "=== 日志文件 ==="
    print_message $BLUE "用户服务: $USER_SERVICE_LOG"
    print_message $BLUE "网关服务: $GATEWAY_LOG"
    print_message $BLUE "商品服务: $PRODUCT_SERVICE_LOG"
    print_message $BLUE "订单服务: $ORDER_SERVICE_LOG"
    print_message $BLUE "库存服务: $INVENTORY_SERVICE_LOG"
    print_message $BLUE "平台服务: $PLATFORM_SERVICE_LOG"
    print_message $BLUE "物流服务: $LOGISTICS_SERVICE_LOG"
    print_message $BLUE "通知服务: $NOTIFICATION_SERVICE_LOG"
}

# 停止所有后端服务
stop_all() {
    print_message $YELLOW "停止所有后端服务..."
    
    # 按相反顺序停止服务（先停止依赖服务）
    stop_service "网关服务" "$GATEWAY_PID"
    stop_service "通知服务" "$NOTIFICATION_SERVICE_PID"
    stop_service "物流服务" "$LOGISTICS_SERVICE_PID"
    stop_service "平台服务" "$PLATFORM_SERVICE_PID"
    stop_service "库存服务" "$INVENTORY_SERVICE_PID"
    stop_service "订单服务" "$ORDER_SERVICE_PID"
    stop_service "商品服务" "$PRODUCT_SERVICE_PID"
    stop_service "用户服务" "$USER_SERVICE_PID"
    
    print_message $GREEN "所有后端服务已停止"
}

# 启动所有后端服务
start_all() {
    print_message $GREEN "启动ERP系统后端服务..."
    
    # 检查基础设施服务
    if ! check_infrastructure; then
        exit 1
    fi
    
    # 检查后端服务是否已经运行
    if check_backend_services; then
        print_message $GREEN "所有后端服务已经运行，跳过启动步骤"
        show_status
        return 0
    fi
    
    print_message $BLUE "按依赖顺序顺序启动所有后端服务..."
    
    # 第一层：基础服务（用户服务）
    print_message $BLUE "启动基础服务..."
    start_user_service
    wait_for_service "用户服务" "8001"
    
    # 第二层：核心业务服务（顺序启动避免Maven冲突）
    print_message $BLUE "启动核心业务服务..."
    start_product_service
    wait_for_service "商品服务" "8002"
    
    start_inventory_service
    wait_for_service "库存服务" "8004"
    
    start_order_service
    wait_for_service "订单服务" "8003"
    
    # 第三层：集成服务（顺序启动）
    print_message $BLUE "启动集成服务..."
    start_platform_service
    wait_for_service "平台服务" "8005"
    
    start_logistics_service
    wait_for_service "物流服务" "8006"
    
    start_notification_service
    wait_for_service "通知服务" "8007"
    
    # 最后启动网关服务
    print_message $BLUE "启动网关服务..."
    start_gateway
    wait_for_service "网关服务" "8080"
    
    print_message $GREEN "所有后端服务启动完成!"
    show_status
}

# 重启所有后端服务
restart_all() {
    print_message $YELLOW "重启所有后端服务..."
    stop_all
    sleep 3
    start_all
}

# 查看日志
show_logs() {
    local service=$1
    local lines=${2:-50}
    
    case $service in
        "user"|"用户")
            print_message $BLUE "=== 用户服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$USER_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "gateway"|"网关")
            print_message $BLUE "=== 网关服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$GATEWAY_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "product"|"商品")
            print_message $BLUE "=== 商品服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$PRODUCT_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "order"|"订单")
            print_message $BLUE "=== 订单服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$ORDER_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "inventory"|"库存")
            print_message $BLUE "=== 库存服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$INVENTORY_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "platform"|"平台")
            print_message $BLUE "=== 平台服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$PLATFORM_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "logistics"|"物流")
            print_message $BLUE "=== 物流服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$LOGISTICS_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "notification"|"通知")
            print_message $BLUE "=== 通知服务日志 (最后${lines}行) ==="
            tail -n "$lines" "$NOTIFICATION_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "all"|"所有"|"")
            local short_lines=$((lines / 4))  # 每个服务显示较少行数
            show_logs "user" "$short_lines"
            echo ""
            show_logs "gateway" "$short_lines"
            echo ""
            show_logs "product" "$short_lines"
            echo ""
            show_logs "order" "$short_lines"
            echo ""
            show_logs "inventory" "$short_lines"
            ;;
        *)
            print_message $RED "未知服务: $service"
            print_message $BLUE "可用服务: user, gateway, product, order, inventory, platform, logistics, notification, all"
            ;;
    esac
}

# 启动单个服务
start_single() {
    local service=$1
    
    if ! check_infrastructure; then
        exit 1
    fi
    
    case $service in
        "user"|"用户")
            stop_service "用户服务" "$USER_SERVICE_PID"
            start_user_service
            wait_for_service "用户服务" "8001"
            ;;
        "gateway"|"网关")
            stop_service "网关服务" "$GATEWAY_PID"
            start_gateway
            wait_for_service "网关服务" "8080"
            ;;
        "product"|"商品")
            stop_service "商品服务" "$PRODUCT_SERVICE_PID"
            start_product_service
            wait_for_service "商品服务" "8002"
            ;;
        "order"|"订单")
            stop_service "订单服务" "$ORDER_SERVICE_PID"
            start_order_service
            wait_for_service "订单服务" "8003"
            ;;
        "inventory"|"库存")
            stop_service "库存服务" "$INVENTORY_SERVICE_PID"
            start_inventory_service
            wait_for_service "库存服务" "8004"
            ;;
        "platform"|"平台")
            stop_service "平台服务" "$PLATFORM_SERVICE_PID"
            start_platform_service
            wait_for_service "平台服务" "8005"
            ;;
        "logistics"|"物流")
            stop_service "物流服务" "$LOGISTICS_SERVICE_PID"
            start_logistics_service
            wait_for_service "物流服务" "8006"
            ;;
        "notification"|"通知")
            stop_service "通知服务" "$NOTIFICATION_SERVICE_PID"
            start_notification_service
            wait_for_service "通知服务" "8007"
            ;;
        *)
            print_message $RED "未知服务: $service"
            print_message $BLUE "可用服务: user, gateway, product, order, inventory, platform, logistics, notification"
            exit 1
            ;;
    esac
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            if [ -n "$2" ]; then
                start_single "$2"
            else
                start_all
            fi
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            if [ -n "$2" ]; then
                start_single "$2"
            else
                restart_all
            fi
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-all}"
            ;;
        "help"|"-h"|"--help")
            echo "ERP系统后端服务管理脚本"
            echo ""
            echo "用法: $0 [命令] [服务名]"
            echo ""
            echo "命令:"
            echo "  start     启动后端服务 (默认启动所有服务)"
            echo "  stop      停止所有后端服务"
            echo "  restart   重启后端服务 (默认重启所有服务)"
            echo "  status    显示服务状态"
            echo "  logs      显示日志 [user|gateway|all]"
            echo "  help      显示此帮助信息"
            echo ""
            echo "后端服务包括:"
            echo "  - user         用户服务 (端口: 8001)"
            echo "  - gateway      网关服务 (端口: 8080)"
            echo "  - product      商品服务 (端口: 8002)"
            echo "  - order        订单服务 (端口: 8003)"
            echo "  - inventory    库存服务 (端口: 8004)"
            echo "  - platform     平台服务 (端口: 8005)"
            echo "  - logistics    物流服务 (端口: 8006)"
            echo "  - notification 通知服务 (端口: 8007)"
            echo ""
            echo "示例:"
            echo "  $0 start              # 启动所有后端服务"
            echo "  $0 start user         # 只启动用户服务"
            echo "  $0 start product      # 只启动商品服务"
            echo "  $0 restart gateway    # 重启网关服务"
            echo "  $0 status             # 查看服务状态"
            echo "  $0 logs user          # 查看用户服务日志"
            echo "  $0 logs all 100       # 查看所有服务日志(每个服务25行)"
            echo ""
            echo "注意: 启动后端服务前请确保基础设施服务已启动"
            echo "      使用 ./scripts/start-infrastructure.sh 启动基础设施服务"
            ;;
        *)
            print_message $RED "未知命令: $1"
            print_message $BLUE "使用 '$0 help' 查看帮助信息"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
