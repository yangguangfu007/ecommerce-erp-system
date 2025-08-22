#!/bin/bash

# ERP系统基础设施服务启动脚本
# 用于启动MySQL、Redis、Kafka、Nacos等基础服务

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
INFRASTRUCTURE_LOG="$LOGS_DIR/infrastructure.log"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查Docker是否运行
check_docker() {
    print_message $BLUE "检查Docker状态..."
    
    # 尝试多次检查Docker状态
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker info > /dev/null 2>&1; then
            print_message $GREEN "Docker运行正常"
            return 0
        fi
        
        print_message $YELLOW "Docker未运行，尝试启动Docker... ($attempt/$max_attempts)"
        
        # 在macOS上尝试启动Docker Desktop
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open -a Docker > /dev/null 2>&1
            print_message $BLUE "正在启动Docker Desktop，请稍候..."
            sleep 10
        fi
        
        ((attempt++))
    done
    
    # 最后一次检查
    if docker info > /dev/null 2>&1; then
        print_message $GREEN "Docker启动成功"
        return 0
    else
        print_message $RED "Docker未运行，请手动启动Docker后重试"
        print_message $BLUE "macOS用户可以运行: open -a Docker"
        print_message $BLUE "Linux用户可以运行: sudo systemctl start docker"
        exit 1
    fi
}

# 检查docker-compose文件是否存在
check_compose_file() {
    if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        print_message $RED "docker-compose.yml文件不存在"
        exit 1
    fi
}

# 检查服务是否已经运行
check_services_running() {
    print_message $BLUE "检查基础设施服务状态..."
    
    cd "$PROJECT_ROOT"
    
    local running_services=()
    local stopped_services=()
    
    # 检查各个服务状态
    for service in mysql redis kafka nacos elasticsearch; do
        # 使用docker ps直接检查容器状态
        local container_name="erp-$service"
        if docker ps --filter "name=$container_name" --filter "status=running" --format "{{.Names}}" | grep -q "$container_name"; then
            running_services+=($service)
        else
            stopped_services+=($service)
        fi
    done
    
    if [ ${#running_services[@]} -gt 0 ]; then
        print_message $GREEN "已运行的服务: ${running_services[*]}"
    fi
    
    if [ ${#stopped_services[@]} -gt 0 ]; then
        print_message $YELLOW "需要启动的服务: ${stopped_services[*]}"
        return 1
    else
        print_message $GREEN "所有基础设施服务都已运行"
        return 0
    fi
}

# 启动基础设施服务
start_infrastructure() {
    print_message $GREEN "启动ERP系统基础设施服务..."
    
    cd "$PROJECT_ROOT"
    
    # 检查服务是否已经运行
    if check_services_running; then
        print_message $GREEN "基础设施服务已经全部运行，跳过启动步骤"
        return 0
    fi
    
    # 清理旧日志
    > "$INFRASTRUCTURE_LOG"
    
    print_message $BLUE "启动MySQL、Redis、Kafka、Nacos、Elasticsearch等基础服务..."
    
    # 启动基础设施服务
    docker-compose up -d mysql redis zookeeper kafka nacos elasticsearch >> "$INFRASTRUCTURE_LOG" 2>&1
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "基础设施服务启动成功"
        print_message $BLUE "日志文件: $INFRASTRUCTURE_LOG"
    else
        print_message $RED "基础设施服务启动失败，请查看日志: $INFRASTRUCTURE_LOG"
        exit 1
    fi
}

# 等待服务启动
wait_for_services() {
    print_message $BLUE "等待基础服务启动完成..."
    
    local max_attempts=60
    local attempt=1
    
    # 等待MySQL启动
    print_message $BLUE "等待MySQL启动..."
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost --silent > /dev/null 2>&1; then
            print_message $GREEN "MySQL启动成功!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_message $RED "MySQL启动超时!"
            return 1
        fi
        
        print_message $YELLOW "等待MySQL启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    # 等待Redis启动
    attempt=1
    print_message $BLUE "等待Redis启动..."
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            print_message $GREEN "Redis启动成功!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_message $RED "Redis启动超时!"
            return 1
        fi
        
        print_message $YELLOW "等待Redis启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    # 等待Kafka启动
    attempt=1
    print_message $BLUE "等待Kafka启动..."
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
            print_message $GREEN "Kafka启动成功!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_message $RED "Kafka启动超时!"
            return 1
        fi
        
        print_message $YELLOW "等待Kafka启动... ($attempt/$max_attempts)"
        sleep 3
        ((attempt++))
    done
    
    # 等待Nacos启动
    attempt=1
    print_message $BLUE "等待Nacos启动..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:8848/nacos" > /dev/null 2>&1; then
            print_message $GREEN "Nacos启动成功!"
            
            # 创建ERP系统命名空间
            print_message $BLUE "创建ERP系统命名空间..."
            sleep 2  # 等待Nacos完全就绪
            
            # 检查命名空间是否已存在
            local namespaces_response=$(curl -s "http://localhost:8848/nacos/v1/console/namespaces" 2>/dev/null)
            if echo "$namespaces_response" | grep -q "erp-system"; then
                print_message $GREEN "ERP系统命名空间已存在"
            else
                # 创建命名空间
                local create_response=$(curl -s -X POST "http://localhost:8848/nacos/v1/console/namespaces" \
                    -H "Content-Type: application/x-www-form-urlencoded" \
                    -d "customNamespaceId=erp-system&namespaceName=erp-system&namespaceDesc=ERP系统命名空间" 2>/dev/null)
                
                if [ "$create_response" = "true" ]; then
                    print_message $GREEN "ERP系统命名空间创建成功!"
                else
                    print_message $YELLOW "ERP系统命名空间创建失败，可能已存在或网络问题"
                fi
            fi
            
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_message $RED "Nacos启动超时!"
            return 1
        fi
        
        print_message $YELLOW "等待Nacos启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    # 等待Elasticsearch启动
    attempt=1
    print_message $BLUE "等待Elasticsearch启动..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:9200/_cluster/health" > /dev/null 2>&1; then
            print_message $GREEN "Elasticsearch启动成功!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_message $RED "Elasticsearch启动超时!"
            return 1
        fi
        
        print_message $YELLOW "等待Elasticsearch启动... ($attempt/$max_attempts)"
        sleep 3
        ((attempt++))
    done
    
    print_message $GREEN "所有基础服务启动完成!"
}

# 显示服务状态
show_status() {
    print_message $BLUE "=== 基础设施服务状态 ==="
    
    cd "$PROJECT_ROOT"
    docker-compose ps mysql redis zookeeper kafka nacos elasticsearch
    
    echo ""
    print_message $BLUE "=== 服务访问地址 ==="
    print_message $BLUE "MySQL: localhost:3306"
    print_message $BLUE "Redis: localhost:6379"
    print_message $BLUE "Kafka: localhost:9092"
    print_message $BLUE "Nacos: http://localhost:8848/nacos (用户名/密码: nacos/nacos)"
    print_message $BLUE "Elasticsearch: http://localhost:9200"
    
    echo ""
    print_message $BLUE "=== 日志文件 ==="
    print_message $BLUE "基础设施日志: $INFRASTRUCTURE_LOG"
}

# 停止基础设施服务
stop_infrastructure() {
    print_message $YELLOW "停止基础设施服务..."
    
    cd "$PROJECT_ROOT"
    docker-compose stop mysql redis zookeeper kafka nacos elasticsearch >> "$INFRASTRUCTURE_LOG" 2>&1
    
    print_message $GREEN "基础设施服务已停止"
}

# 重启基础设施服务
restart_infrastructure() {
    print_message $YELLOW "重启基础设施服务..."
    stop_infrastructure
    sleep 3
    start_infrastructure
    wait_for_services
    show_status
}

# 查看日志
show_logs() {
    local service=$1
    case $service in
        "mysql")
            print_message $BLUE "=== MySQL日志 ==="
            docker-compose logs --tail=50 mysql
            ;;
        "redis")
            print_message $BLUE "=== Redis日志 ==="
            docker-compose logs --tail=50 redis
            ;;
        "kafka")
            print_message $BLUE "=== Kafka日志 ==="
            docker-compose logs --tail=50 kafka
            ;;
        "nacos")
            print_message $BLUE "=== Nacos日志 ==="
            docker-compose logs --tail=50 nacos
            ;;
        "elasticsearch"|"es")
            print_message $BLUE "=== Elasticsearch日志 ==="
            docker-compose logs --tail=50 elasticsearch
            ;;
        "all"|"")
            print_message $BLUE "=== 基础设施启动日志 (最后50行) ==="
            tail -n 50 "$INFRASTRUCTURE_LOG" 2>/dev/null || echo "日志文件不存在"
            echo ""
            docker-compose logs --tail=20 mysql redis zookeeper kafka nacos elasticsearch
            ;;
        *)
            print_message $RED "未知服务: $service"
            print_message $BLUE "可用服务: mysql, redis, kafka, nacos, elasticsearch, all"
            ;;
    esac
}

# 主函数
main() {
    case "${1:-start}" in
        "help"|"-h"|"--help")
            echo "ERP系统基础设施服务管理脚本"
            echo ""
            echo "用法: $0 [命令] [参数]"
            echo ""
            echo "命令:"
            echo "  start     启动基础设施服务 (默认)"
            echo "  stop      停止基础设施服务"
            echo "  restart   重启基础设施服务"
            echo "  status    显示服务状态"
            echo "  logs      显示日志 [mysql|redis|kafka|nacos|elasticsearch|all]"
            echo "  help      显示此帮助信息"
            echo ""
            echo "基础设施服务包括:"
            echo "  - MySQL 8.0.35 (端口: 3306)"
            echo "  - Redis 7.2.3 (端口: 6379)"
            echo "  - Apache Kafka 3.6.0 (端口: 9092)"
            echo "  - Nacos 2.3.0 (端口: 8848)"
            echo "  - Elasticsearch 8.10.4 (端口: 9200)"
            echo ""
            echo "示例:"
            echo "  $0 start          # 启动所有基础设施服务"
            echo "  $0 status         # 查看服务状态"
            echo "  $0 logs mysql     # 查看MySQL日志"
            echo "  $0 logs elasticsearch # 查看Elasticsearch日志"
            echo "  $0 logs all       # 查看所有服务日志"
            return 0
            ;;
    esac
    
    # 检查Docker环境（帮助命令不需要检查）
    check_docker
    check_compose_file
    
    case "${1:-start}" in
        "start")
            start_infrastructure
            wait_for_services
            show_status
            ;;
        "stop")
            stop_infrastructure
            ;;
        "restart")
            restart_infrastructure
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-all}"
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
