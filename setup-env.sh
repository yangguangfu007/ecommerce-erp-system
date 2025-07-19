#!/bin/bash

# ERP系统环境启动脚本
# 用于快速启动本地开发环境

set -e

echo "🚀 启动ERP系统本地开发环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查Docker Compose是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "📦 启动基础设施服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 30

echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 基础设施服务启动完成！"
echo ""
echo "📋 服务访问地址："
echo "  - MySQL:          localhost:3306 (root/root123)"
echo "  - Redis:          localhost:6379 (密码: redis123)"
echo "  - Nacos:          http://localhost:8848 (nacos/nacos)"
echo "  - Kafka:          localhost:9092"
echo "  - Elasticsearch:  http://localhost:9200"
echo "  - Kibana:         http://localhost:5601"
echo "  - Prometheus:     http://localhost:9090"
echo "  - Grafana:        http://localhost:3000 (admin/admin123)"
echo "  - Zipkin:         http://localhost:9411"
echo "  - MinIO:          http://localhost:9000 (minioadmin/minioadmin123)"
echo ""
echo "🛠️  编译和启动微服务："
echo "  mvn clean install"
echo "  java -jar erp-gateway/target/erp-gateway-1.0.0-SNAPSHOT.jar"
echo ""
echo "📚 更多信息请查看 README.md"