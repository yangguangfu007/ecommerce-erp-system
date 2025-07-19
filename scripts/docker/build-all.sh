#!/bin/bash

# 构建所有微服务Docker镜像的脚本

set -e

echo "开始构建ERP系统所有微服务Docker镜像..."

# 定义服务列表
services=(
    "erp-gateway"
    "erp-user-service"
    "erp-product-service"
    "erp-order-service"
    "erp-inventory-service"
    "erp-platform-service"
    "erp-logistics-service"
    "erp-notification-service"
)

# 构建父项目
echo "编译父项目..."
mvn clean compile -DskipTests

# 构建公共模块
echo "构建公共模块..."
cd erp-common
mvn clean install -DskipTests
cd ..

# 构建各个微服务
for service in "${services[@]}"; do
    echo "构建 $service..."
    cd $service
    mvn clean package -DskipTests
    mvn docker:build
    cd ..
    echo "$service 构建完成"
done

echo "所有微服务Docker镜像构建完成！"

# 显示构建的镜像
echo "构建的镜像列表："
docker images | grep erp-system