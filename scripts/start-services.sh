#!/bin/bash

# ERP系统服务启动脚本
# 用于按顺序启动基础设施、后端和前端服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查脚本文件是否存在
check_scripts() {
    local missing_scripts=()
    
    if [ ! -f "$SCRIPTS_DIR/start-infrastructure.sh" ]; then
        missing_scripts+=("start-infrastructure.sh")
    fi
    
    if [ ! -f "$SCRIPTS_DIR/start-backend.sh" ]; then
        missing_scripts+=("start-backend.sh")
    fi
    
    if [ ! -f "$SCRIPTS_DIR/start-frontend.sh" ]; then
        missing_scripts+=("start-frontend.sh")
    fi
    
    if [ ${#missing_scripts[@]} -gt 0 ]; then
        print_message $RED "缺少启动脚本文件:"
        for script in "${missing_scripts[@]}"; do
            print_message $RED "  - $SCRIPTS_DIR/$script"
        done
        exit 1
    fi
    
    # 确保脚本有执行权限
    chmod +x "$SCRIPTS_DIR/start-infrastructure.sh"
    chmod +x "$SCRIPTS_DIR/start-backend.sh"
    chmod +x "$SCRIPTS_DIR/start-frontend.sh"
}

# 启动基础设施服务
start_infrastructure() {
    print_message $GREEN "=== 第1步: 启动基础设施服务 ==="
    print_message $BLUE "启动MySQL、Redis、Kafka、Nacos、Elasticsearch等基础服务..."
    
    "$SCRIPTS_DIR/start-infrastructure.sh" start
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "基础设施服务启动成功"
    else
        print_message $RED "基础设施服务启动失败"
        exit 1
    fi
}

# 启动后端服务
start_backend() {
    print_message $GREEN "=== 第2步: 启动后端服务 ==="
    print_message $BLUE "启动用户服务、网关服务等后端微服务..."
    
    "$SCRIPTS_DIR/start-backend.sh" start
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "后端服务启动成功"
    else
        print_message $RED "后端服务启动失败"
        exit 1
    fi
}

# 启动前端服务
start_frontend() {
    print_message $GREEN "=== 第3步: 启动前端服务 ==="
    print_message $BLUE "启动Vue.js前端应用..."
    
    "$SCRIPTS_DIR/start-frontend.sh" start
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "前端服务启动成功"
    else
        print_message $RED "前端服务启动失败"
        exit 1
    fi
}

# 显示所有服务状态
show_status() {
    print_message $BLUE "=== ERP系统完整服务状态 ==="
    
    echo ""
    print_message $BLUE "--- 基础设施服务状态 ---"
    "$SCRIPTS_DIR/start-infrastructure.sh" status
    
    echo ""
    print_message $BLUE "--- 后端服务状态 ---"
    "$SCRIPTS_DIR/start-backend.sh" status
    
    echo ""
    print_message $BLUE "--- 前端服务状态 ---"
    "$SCRIPTS_DIR/start-frontend.sh" status
    
    echo ""
    print_message $GREEN "=== 系统访问地址 ==="
    print_message $GREEN "前端应用: http://localhost:3000"
    print_message $GREEN "API网关: http://localhost:8080/api"
    print_message $GREEN "Nacos控制台: http://localhost:8848/nacos (nacos/nacos)"
}

# 停止所有服务
stop_all() {
    print_message $YELLOW "停止ERP系统所有服务..."
    
    print_message $BLUE "停止前端服务..."
    "$SCRIPTS_DIR/start-frontend.sh" stop
    
    print_message $BLUE "停止后端服务..."
    "$SCRIPTS_DIR/start-backend.sh" stop
    
    print_message $BLUE "停止基础设施服务..."
    "$SCRIPTS_DIR/start-infrastructure.sh" stop
    
    print_message $GREEN "所有服务已停止"
}

# 启动所有服务
start_all() {
    print_message $GREEN "启动ERP系统完整环境..."
    print_message $BLUE "启动顺序: 基础设施 → 后端服务 → 前端服务"
    
    # 启动基础设施服务
    start_infrastructure
    
    echo ""
    print_message $BLUE "等待基础设施服务稳定..."
    sleep 5
    
    # 启动后端服务
    start_backend
    
    echo ""
    print_message $BLUE "等待后端服务稳定..."
    sleep 3
    
    # 启动前端服务
    start_frontend
    
    echo ""
    print_message $GREEN "=== ERP系统启动完成 ==="
    show_status
}

# 重启所有服务
restart_all() {
    print_message $YELLOW "重启ERP系统所有服务..."
    stop_all
    sleep 3
    start_all
}

# 查看日志
show_logs() {
    local service=$1
    case $service in
        "infrastructure"|"基础设施")
            "$SCRIPTS_DIR/start-infrastructure.sh" logs "${2:-all}"
            ;;
        "backend"|"后端")
            "$SCRIPTS_DIR/start-backend.sh" logs "${2:-all}"
            ;;
        "frontend"|"前端")
            "$SCRIPTS_DIR/start-frontend.sh" logs "${2:-50}"
            ;;
        "all"|"所有"|"")
            print_message $BLUE "=== 基础设施服务日志 ==="
            "$SCRIPTS_DIR/start-infrastructure.sh" logs all
            echo ""
            print_message $BLUE "=== 后端服务日志 ==="
            "$SCRIPTS_DIR/start-backend.sh" logs all
            echo ""
            print_message $BLUE "=== 前端服务日志 ==="
            "$SCRIPTS_DIR/start-frontend.sh" logs 30
            ;;
        *)
            print_message $RED "未知服务类型: $service"
            print_message $BLUE "可用服务类型: infrastructure, backend, frontend, all"
            ;;
    esac
}

# 启动特定类型的服务
start_specific() {
    local service_type=$1
    case $service_type in
        "infrastructure"|"基础设施")
            start_infrastructure
            ;;
        "backend"|"后端")
            start_backend
            ;;
        "frontend"|"前端")
            start_frontend
            ;;
        *)
            print_message $RED "未知服务类型: $service_type"
            print_message $BLUE "可用服务类型: infrastructure, backend, frontend"
            exit 1
            ;;
    esac
}

# 主函数
main() {
    # 检查必要的脚本文件
    check_scripts
    
    case "${1:-start}" in
        "start")
            if [ -n "$2" ]; then
                start_specific "$2"
            else
                start_all
            fi
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
            show_logs "${2:-all}" "${3}"
            ;;
        "infrastructure"|"backend"|"frontend")
            # 直接调用子脚本
            case "$1" in
                "infrastructure")
                    "$SCRIPTS_DIR/start-infrastructure.sh" "${2:-start}" "$3"
                    ;;
                "backend")
                    "$SCRIPTS_DIR/start-backend.sh" "${2:-start}" "$3"
                    ;;
                "frontend")
                    "$SCRIPTS_DIR/start-frontend.sh" "${2:-start}" "$3"
                    ;;
            esac
            ;;
        "help"|"-h"|"--help")
            echo "ERP系统服务管理脚本"
            echo ""
            echo "用法: $0 [命令] [服务类型] [参数]"
            echo ""
            echo "主要命令:"
            echo "  start     启动服务 (默认启动所有服务)"
            echo "  stop      停止所有服务"
            echo "  restart   重启所有服务"
            echo "  status    显示所有服务状态"
            echo "  logs      显示日志 [服务类型] [参数]"
            echo "  help      显示此帮助信息"
            echo ""
            echo "服务类型:"
            echo "  infrastructure  基础设施服务 (MySQL, Redis, Kafka, Nacos, Elasticsearch)"
            echo "  backend         后端服务 (用户服务, 网关服务)"
            echo "  frontend        前端服务 (Vue.js应用)"
            echo ""
            echo "直接调用子脚本:"
            echo "  infrastructure [命令] [参数]  # 调用基础设施脚本"
            echo "  backend [命令] [参数]         # 调用后端服务脚本"
            echo "  frontend [命令] [参数]        # 调用前端服务脚本"
            echo ""
            echo "启动顺序:"
            echo "  1. 基础设施服务 (MySQL, Redis, Kafka, Nacos, Elasticsearch)"
            echo "  2. 后端服务 (用户服务, 网关服务)"
            echo "  3. 前端服务 (Vue.js开发服务器)"
            echo ""
            echo "示例:"
            echo "  $0 start                    # 启动所有服务"
            echo "  $0 start backend            # 只启动后端服务"
            echo "  $0 status                   # 查看所有服务状态"
            echo "  $0 logs backend user        # 查看后端用户服务日志"
            echo "  $0 logs frontend 100        # 查看前端服务最后100行日志"
            echo "  $0 infrastructure status    # 查看基础设施服务状态"
            echo "  $0 backend start user       # 启动用户服务"
            echo "  $0 frontend build           # 构建前端生产版本"
            echo ""
            echo "访问地址:"
            echo "  前端应用: http://localhost:3000"
            echo "  API网关: http://localhost:8080/api"
            echo "  Nacos控制台: http://localhost:8848/nacos (nacos/nacos)"
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
