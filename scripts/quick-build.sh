#!/bin/bash

# ERP系统快速构建脚本
# 用于修改代码后快速重新构建和部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 快速构建后端服务
build_backend() {
    local service=$1
    print_message $BLUE "快速构建后端服务: $service"
    
    case $service in
        "user"|"用户")
            cd "$PROJECT_ROOT/erp-user-service"
            print_message $BLUE "编译用户服务..."
            mvn clean compile -DskipTests -q
            print_message $GREEN "用户服务编译完成"
            ;;
        "gateway"|"网关")
            cd "$PROJECT_ROOT/erp-gateway"
            print_message $BLUE "编译网关服务..."
            mvn clean compile -DskipTests -q
            print_message $GREEN "网关服务编译完成"
            ;;
        "all"|"所有"|"")
            print_message $BLUE "编译所有后端服务..."
            cd "$PROJECT_ROOT"
            mvn clean compile -DskipTests -q
            print_message $GREEN "所有后端服务编译完成"
            ;;
        *)
            print_message $RED "未知服务: $service"
            print_message $BLUE "可用服务: user, gateway, all"
            exit 1
            ;;
    esac
}

# 快速构建前端
build_frontend() {
    print_message $BLUE "快速构建前端..."
    cd "$PROJECT_ROOT/erp-frontend"
    
    # 检查是否需要安装依赖
    if [ ! -d "node_modules" ]; then
        print_message $BLUE "安装前端依赖..."
        npm install
    fi
    
    print_message $BLUE "编译前端代码..."
    npm run build:dev 2>/dev/null || npm run build
    print_message $GREEN "前端构建完成"
}

# 快速重启服务
restart_service() {
    local service=$1
    print_message $BLUE "重启服务: $service"
    
    case $service in
        "user"|"用户")
            "$PROJECT_ROOT/scripts/start-backend.sh" restart user
            ;;
        "gateway"|"网关")
            "$PROJECT_ROOT/scripts/start-backend.sh" restart gateway
            ;;
        "frontend"|"前端")
            "$PROJECT_ROOT/scripts/start-frontend.sh" restart
            ;;
        "backend"|"后端")
            "$PROJECT_ROOT/scripts/start-backend.sh" restart
            ;;
        "all"|"所有"|"")
            "$PROJECT_ROOT/scripts/start-services.sh" restart
            ;;
        *)
            print_message $RED "未知服务: $service"
            print_message $BLUE "可用服务: user, gateway, frontend, backend, all"
            exit 1
            ;;
    esac
}

# 构建并重启服务
build_and_restart() {
    local service=$1
    print_message $GREEN "=== 快速构建并重启: $service ==="
    
    case $service in
        "user"|"用户")
            build_backend "user"
            restart_service "user"
            ;;
        "gateway"|"网关")
            build_backend "gateway"
            restart_service "gateway"
            ;;
        "frontend"|"前端")
            build_frontend
            restart_service "frontend"
            ;;
        "backend"|"后端")
            build_backend "all"
            restart_service "backend"
            ;;
        "all"|"所有"|"")
            build_backend "all"
            build_frontend
            restart_service "all"
            ;;
        *)
            print_message $RED "未知服务: $service"
            exit 1
            ;;
    esac
    
    print_message $GREEN "=== 构建并重启完成: $service ==="
}

# 显示服务日志
show_logs() {
    local service=$1
    local lines=${2:-50}
    
    case $service in
        "user"|"用户")
            "$PROJECT_ROOT/scripts/start-backend.sh" logs user
            ;;
        "gateway"|"网关")
            "$PROJECT_ROOT/scripts/start-backend.sh" logs gateway
            ;;
        "frontend"|"前端")
            "$PROJECT_ROOT/scripts/start-frontend.sh" logs $lines
            ;;
        "all"|"所有"|"")
            "$PROJECT_ROOT/scripts/start-services.sh" logs all
            ;;
        *)
            print_message $RED "未知服务: $service"
            exit 1
            ;;
    esac
}

# 实时查看日志
follow_logs() {
    local service=$1
    
    case $service in
        "user"|"用户")
            print_message $BLUE "实时查看用户服务日志 (按Ctrl+C退出)..."
            tail -f "$PROJECT_ROOT/logs/user-service.log"
            ;;
        "gateway"|"网关")
            print_message $BLUE "实时查看网关服务日志 (按Ctrl+C退出)..."
            tail -f "$PROJECT_ROOT/logs/gateway.log"
            ;;
        "frontend"|"前端")
            "$PROJECT_ROOT/scripts/start-frontend.sh" follow
            ;;
        *)
            print_message $RED "未知服务: $service"
            exit 1
            ;;
    esac
}

# 主函数
main() {
    case "${1:-help}" in
        "build")
            if [ -n "$2" ]; then
                build_backend "$2" 2>/dev/null || build_frontend
            else
                build_backend "all"
                build_frontend
            fi
            ;;
        "restart")
            restart_service "${2:-all}"
            ;;
        "quick"|"q")
            build_and_restart "${2:-all}"
            ;;
        "logs")
            show_logs "${2:-all}" "${3:-50}"
            ;;
        "follow"|"f")
            follow_logs "${2:-user}"
            ;;
        "status"|"s")
            "$PROJECT_ROOT/scripts/start-services.sh" status
            ;;
        "help"|"-h"|"--help")
            echo "ERP系统快速构建和调试脚本"
            echo ""
            echo "用法: $0 [命令] [服务] [参数]"
            echo ""
            echo "命令:"
            echo "  build     构建服务 [user|gateway|frontend|all]"
            echo "  restart   重启服务 [user|gateway|frontend|backend|all]"
            echo "  quick|q   快速构建并重启 [user|gateway|frontend|backend|all]"
            echo "  logs      显示日志 [user|gateway|frontend|all] [行数]"
            echo "  follow|f  实时查看日志 [user|gateway|frontend]"
            echo "  status|s  显示服务状态"
            echo "  help      显示此帮助信息"
            echo ""
            echo "快速开发工作流示例:"
            echo "  $0 q user           # 修改用户服务代码后快速重新部署"
            echo "  $0 q frontend       # 修改前端代码后快速重新部署"
            echo "  $0 f user           # 实时查看用户服务日志进行调试"
            echo "  $0 logs gateway 100 # 查看网关服务最后100行日志"
            echo "  $0 s                # 查看所有服务状态"
            echo ""
            echo "开发调试流程:"
            echo "  1. 修改代码"
            echo "  2. 运行 $0 q [服务名] 快速重新部署"
            echo "  3. 运行 $0 f [服务名] 查看日志调试"
            echo "  4. 重复步骤1-3直到问题解决"
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