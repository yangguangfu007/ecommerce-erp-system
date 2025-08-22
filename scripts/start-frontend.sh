#!/bin/bash

# ERP系统前端服务启动脚本
# 用于启动Vue.js前端应用

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
FRONTEND_DIR="$PROJECT_ROOT/erp-frontend"

# 创建日志目录
mkdir -p "$LOGS_DIR"

# 日志文件路径
FRONTEND_LOG="$LOGS_DIR/frontend.log"

# PID文件路径
PIDS_DIR="$PROJECT_ROOT/pids"
mkdir -p "$PIDS_DIR"

FRONTEND_PID="$PIDS_DIR/frontend.pid"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查Node.js和npm是否安装
check_nodejs() {
    if ! command -v node > /dev/null 2>&1; then
        print_message $RED "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    if ! command -v npm > /dev/null 2>&1; then
        print_message $RED "npm未安装，请先安装npm"
        exit 1
    fi
    
    local node_version=$(node --version)
    print_message $BLUE "Node.js版本: $node_version"
}

# 检查前端目录是否存在
check_frontend_dir() {
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_message $RED "前端目录不存在: $FRONTEND_DIR"
        exit 1
    fi
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        print_message $RED "package.json文件不存在: $FRONTEND_DIR/package.json"
        exit 1
    fi
}

# 检查服务是否运行
check_service() {
    if [ -f "$FRONTEND_PID" ]; then
        local pid=$(cat "$FRONTEND_PID")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # 服务正在运行
        else
            rm -f "$FRONTEND_PID"  # 清理无效的PID文件
            return 1  # 服务未运行
        fi
    else
        return 1  # PID文件不存在
    fi
}

# 停止前端服务
stop_frontend() {
    if check_service; then
        local pid=$(cat "$FRONTEND_PID")
        print_message $YELLOW "停止前端服务 (PID: $pid)..."
        
        # 尝试优雅停止
        kill "$pid" 2>/dev/null || true
        sleep 3
        
        # 强制杀死如果还在运行
        if ps -p "$pid" > /dev/null 2>&1; then
            print_message $YELLOW "强制停止前端服务..."
            kill -9 "$pid" 2>/dev/null || true
        fi
        
        rm -f "$FRONTEND_PID"
        print_message $GREEN "前端服务已停止"
    else
        print_message $BLUE "前端服务未运行"
    fi
}

# 安装依赖
install_dependencies() {
    print_message $BLUE "检查并安装前端依赖..."
    
    cd "$FRONTEND_DIR"
    
    # 检查node_modules是否存在
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        print_message $BLUE "安装前端依赖..."
        npm install
        
        if [ $? -eq 0 ]; then
            print_message $GREEN "前端依赖安装成功"
        else
            print_message $RED "前端依赖安装失败"
            exit 1
        fi
    else
        print_message $GREEN "前端依赖已存在"
    fi
}

# 检查后端服务是否运行
check_backend() {
    print_message $BLUE "检查后端服务状态..."
    
    # 检查网关服务
    if ! curl -s "http://localhost:8080/actuator/health" > /dev/null 2>&1; then
        print_message $YELLOW "警告: 网关服务未运行，前端可能无法正常访问API"
        print_message $BLUE "建议先启动后端服务: ./scripts/start-backend.sh"
    else
        print_message $GREEN "后端服务运行正常"
    fi
}

# 启动前端服务
start_frontend() {
    if check_service; then
        print_message $GREEN "前端服务已经运行，跳过启动"
        return 0
    fi
    
    print_message $BLUE "启动前端服务..."
    
    cd "$FRONTEND_DIR"
    
    # 清理旧日志
    > "$FRONTEND_LOG"
    
    # 启动开发服务器
    nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$FRONTEND_PID"
    
    print_message $GREEN "前端服务已启动 (PID: $pid)"
    print_message $BLUE "日志文件: $FRONTEND_LOG"
}

# 等待前端服务启动
wait_for_frontend() {
    local max_attempts=30
    local attempt=1
    
    print_message $BLUE "等待前端服务启动..."
    
    while [ $attempt -le $max_attempts ]; do
        # 检查多个可能的端口（优先检查3000）
        for port in 3000 5174 8080; do
            if curl -s "http://localhost:$port" > /dev/null 2>&1; then
                print_message $GREEN "前端服务启动成功! (端口: $port)"
                return 0
            fi
        done
        
        print_message $YELLOW "等待前端服务启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    print_message $RED "前端服务启动超时!"
    print_message $BLUE "请查看日志文件: $FRONTEND_LOG"
    return 1
}

# 显示服务状态
show_status() {
    print_message $BLUE "=== ERP系统前端服务状态 ==="
    
    if check_service; then
        local pid=$(cat "$FRONTEND_PID")
        print_message $GREEN "✓ 前端服务运行中 (PID: $pid)"
        
        # 尝试检测端口（优先检查3000）
        local port=""
        for p in 3000 5174 8080; do
            if curl -s "http://localhost:$p" > /dev/null 2>&1; then
                port=$p
                break
            fi
        done
        
        if [ -n "$port" ]; then
            print_message $GREEN "  访问地址: http://localhost:$port"
        else
            print_message $YELLOW "  端口检测失败，请查看日志确认访问地址"
        fi
    else
        print_message $RED "✗ 前端服务未运行"
    fi
    
    echo ""
    print_message $BLUE "=== 常用访问地址 ==="
    print_message $BLUE "开发服务器: http://localhost:3000 (当前运行端口)"
    print_message $BLUE "备用地址: http://localhost:5174 (Vite默认)"
    
    echo ""
    print_message $BLUE "=== 日志文件 ==="
    print_message $BLUE "前端服务日志: $FRONTEND_LOG"
}

# 构建生产版本
build_production() {
    print_message $BLUE "构建生产版本..."
    
    cd "$FRONTEND_DIR"
    
    # 安装依赖
    install_dependencies
    
    # 构建
    npm run build
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "生产版本构建成功"
        print_message $BLUE "构建文件位置: $FRONTEND_DIR/dist"
    else
        print_message $RED "生产版本构建失败"
        exit 1
    fi
}

# 运行测试
run_tests() {
    print_message $BLUE "运行前端测试..."
    
    cd "$FRONTEND_DIR"
    
    # 安装依赖
    install_dependencies
    
    # 运行测试
    npm run test:unit
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "测试通过"
    else
        print_message $RED "测试失败"
        exit 1
    fi
}

# 代码检查和格式化
lint_and_format() {
    print_message $BLUE "执行代码检查和格式化..."
    
    cd "$FRONTEND_DIR"
    
    # 安装依赖
    install_dependencies
    
    # 代码检查
    print_message $BLUE "执行ESLint检查..."
    npm run lint
    
    # 代码格式化
    if npm run format > /dev/null 2>&1; then
        print_message $BLUE "执行Prettier格式化..."
        npm run format
    fi
    
    print_message $GREEN "代码检查和格式化完成"
}

# 查看日志
show_logs() {
    local lines=${1:-50}
    
    print_message $BLUE "=== 前端服务日志 (最后${lines}行) ==="
    
    if [ -f "$FRONTEND_LOG" ]; then
        tail -n "$lines" "$FRONTEND_LOG"
    else
        print_message $YELLOW "日志文件不存在: $FRONTEND_LOG"
    fi
}

# 实时查看日志
follow_logs() {
    print_message $BLUE "=== 实时查看前端服务日志 (按Ctrl+C退出) ==="
    
    if [ -f "$FRONTEND_LOG" ]; then
        tail -f "$FRONTEND_LOG"
    else
        print_message $YELLOW "日志文件不存在: $FRONTEND_LOG"
        print_message $BLUE "等待日志文件创建..."
        
        # 等待日志文件创建
        while [ ! -f "$FRONTEND_LOG" ]; do
            sleep 1
        done
        
        tail -f "$FRONTEND_LOG"
    fi
}

# 主函数
main() {
    # 检查环境
    check_nodejs
    check_frontend_dir
    
    case "${1:-start}" in
        "start")
            # 检查服务是否已经运行
            if check_service; then
                print_message $GREEN "前端服务已经运行"
                show_status
                return 0
            fi
            
            # 检查后端服务
            check_backend
            
            # 安装依赖
            install_dependencies
            
            # 启动服务
            start_frontend
            
            # 等待启动完成
            if ! check_service; then
                wait_for_frontend
            fi
            
            # 显示状态
            show_status
            ;;
        "stop")
            stop_frontend
            ;;
        "restart")
            stop_frontend
            sleep 2
            main "start"
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-50}"
            ;;
        "follow")
            follow_logs
            ;;
        "build")
            build_production
            ;;
        "test")
            run_tests
            ;;
        "lint")
            lint_and_format
            ;;
        "install")
            install_dependencies
            ;;
        "help"|"-h"|"--help")
            echo "ERP系统前端服务管理脚本"
            echo ""
            echo "用法: $0 [命令] [参数]"
            echo ""
            echo "命令:"
            echo "  start     启动前端开发服务器 (默认)"
            echo "  stop      停止前端服务"
            echo "  restart   重启前端服务"
            echo "  status    显示服务状态"
            echo "  logs      显示日志 [行数，默认50]"
            echo "  follow    实时查看日志"
            echo "  build     构建生产版本"
            echo "  test      运行单元测试"
            echo "  lint      代码检查和格式化"
            echo "  install   安装/更新依赖"
            echo "  help      显示此帮助信息"
            echo ""
            echo "前端技术栈:"
            echo "  - Vue 3.4+ with TypeScript 5.0+"
            echo "  - Element Plus 2.10+"
            echo "  - Vite 7.0+ (开发服务器)"
            echo "  - Pinia 3.0+ (状态管理)"
            echo ""
            echo "示例:"
            echo "  $0 start          # 启动前端开发服务器"
            echo "  $0 status         # 查看服务状态"
            echo "  $0 logs 100       # 查看最后100行日志"
            echo "  $0 follow         # 实时查看日志"
            echo "  $0 build          # 构建生产版本"
            echo "  $0 test           # 运行测试"
            echo ""
            echo "注意: 前端服务通常运行在 http://localhost:3000"
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
