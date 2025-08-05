#!/bin/bash

# ERP系统服务启动脚本
# 用于后台启动所有服务并记录日志

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
FRONTEND_LOG="$LOGS_DIR/frontend.log"

# PID文件路径
PIDS_DIR="$PROJECT_ROOT/pids"
mkdir -p "$PIDS_DIR"

USER_SERVICE_PID="$PIDS_DIR/user-service.pid"
GATEWAY_PID="$PIDS_DIR/gateway.pid"
FRONTEND_PID="$PIDS_DIR/frontend.pid"

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

# 启动用户服务
start_user_service() {
    print_message $BLUE "启动用户服务..."
    
    cd "$PROJECT_ROOT"
    nohup mvn -f erp-user-service/pom.xml spring-boot:run > "$USER_SERVICE_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$USER_SERVICE_PID"
    
    print_message $GREEN "用户服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $USER_SERVICE_LOG"
}

# 启动网关服务
start_gateway() {
    print_message $BLUE "启动网关服务..."
    
    cd "$PROJECT_ROOT"
    nohup mvn -f erp-gateway/pom.xml spring-boot:run > "$GATEWAY_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$GATEWAY_PID"
    
    print_message $GREEN "网关服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $GATEWAY_LOG"
}

# 启动前端服务
start_frontend() {
    print_message $BLUE "启动前端服务..."
    
    cd "$PROJECT_ROOT/erp-frontend"
    nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$FRONTEND_PID"
    
    print_message $GREEN "前端服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $FRONTEND_LOG"
}

# 等待服务启动
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_message $BLUE "等待 $service_name 启动 (端口: $port)..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1 || \
           curl -s "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
            print_message $GREEN "$service_name 启动成功!"
            return 0
        fi
        
        print_message $YELLOW "等待 $service_name 启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    print_message $RED "$service_name 启动超时!"
    return 1
}

# 显示服务状态
show_status() {
    print_message $BLUE "=== ERP系统服务状态 ==="
    
    if check_service "用户服务" "$USER_SERVICE_PID"; then
        local pid=$(cat "$USER_SERVICE_PID")
        print_message $GREEN "✓ 用户服务运行中 (PID: $pid, 端口: 8001)"
    else
        print_message $RED "✗ 用户服务未运行"
    fi
    
    if check_service "网关服务" "$GATEWAY_PID"; then
        local pid=$(cat "$GATEWAY_PID")
        print_message $GREEN "✓ 网关服务运行中 (PID: $pid, 端口: 8080)"
    else
        print_message $RED "✗ 网关服务未运行"
    fi
    
    if check_service "前端服务" "$FRONTEND_PID"; then
        local pid=$(cat "$FRONTEND_PID")
        print_message $GREEN "✓ 前端服务运行中 (PID: $pid, 端口: 5174)"
    else
        print_message $RED "✗ 前端服务未运行"
    fi
    
    echo ""
    print_message $BLUE "=== 访问地址 ==="
    print_message $BLUE "前端页面: http://localhost:5174"
    print_message $BLUE "网关API: http://localhost:8080/api"
    print_message $BLUE "用户服务: http://localhost:8001"
    
    echo ""
    print_message $BLUE "=== 日志文件 ==="
    print_message $BLUE "用户服务日志: $USER_SERVICE_LOG"
    print_message $BLUE "网关服务日志: $GATEWAY_LOG"
    print_message $BLUE "前端服务日志: $FRONTEND_LOG"
}

# 停止所有服务
stop_all() {
    print_message $YELLOW "停止所有服务..."
    stop_service "前端服务" "$FRONTEND_PID"
    stop_service "网关服务" "$GATEWAY_PID"
    stop_service "用户服务" "$USER_SERVICE_PID"
    print_message $GREEN "所有服务已停止"
}

# 启动所有服务
start_all() {
    print_message $GREEN "启动ERP系统所有服务..."
    
    # 首先停止已运行的服务
    stop_all
    
    # 清理旧日志
    > "$USER_SERVICE_LOG"
    > "$GATEWAY_LOG"
    > "$FRONTEND_LOG"
    
    # 启动服务
    start_user_service
    sleep 5
    
    start_gateway
    sleep 5
    
    start_frontend
    sleep 3
    
    # 等待服务启动完成
    wait_for_service "用户服务" "8001"
    wait_for_service "网关服务" "8080"
    wait_for_service "前端服务" "5174"
    
    show_status
}

# 重启所有服务
restart_all() {
    print_message $YELLOW "重启所有服务..."
    stop_all
    sleep 2
    start_all
}

# 查看日志
show_logs() {
    local service=$1
    case $service in
        "user"|"用户")
            print_message $BLUE "=== 用户服务日志 (最后50行) ==="
            tail -n 50 "$USER_SERVICE_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "gateway"|"网关")
            print_message $BLUE "=== 网关服务日志 (最后50行) ==="
            tail -n 50 "$GATEWAY_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "frontend"|"前端")
            print_message $BLUE "=== 前端服务日志 (最后50行) ==="
            tail -n 50 "$FRONTEND_LOG" 2>/dev/null || echo "日志文件不存在"
            ;;
        "all"|"所有"|"")
            show_logs "user"
            echo ""
            show_logs "gateway"
            echo ""
            show_logs "frontend"
            ;;
        *)
            print_message $RED "未知服务: $service"
            print_message $BLUE "可用服务: user, gateway, frontend, all"
            ;;
    esac
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            start_all
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            restart_all
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-all}"
            ;;
        "help"|"-h"|"--help")
            echo "ERP系统服务管理脚本"
            echo ""
            echo "用法: $0 [命令] [参数]"
            echo ""
            echo "命令:"
            echo "  start     启动所有服务 (默认)"
            echo "  stop      停止所有服务"
            echo "  restart   重启所有服务"
            echo "  status    显示服务状态"
            echo "  logs      显示日志 [user|gateway|frontend|all]"
            echo "  help      显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 start          # 启动所有服务"
            echo "  $0 status         # 查看服务状态"
            echo "  $0 logs user      # 查看用户服务日志"
            echo "  $0 logs all       # 查看所有服务日志"
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