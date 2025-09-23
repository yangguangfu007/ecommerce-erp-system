#!/bin/bash

# 快速端到端测试检查脚本
# 只运行前几个核心测试用例进行快速验证

set -e

echo "=========================================="
echo "快速端到端测试检查"
echo "=========================================="

# 进入前端目录
cd "$(dirname "$0")/../.."

echo "当前工作目录: $(pwd)"

# 检查服务状态
echo "检查服务状态..."

# 检查前端服务
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务运行正常 (http://localhost:3000)"
else
    echo "❌ 前端服务未运行"
    echo "请运行: ./scripts/start-frontend.sh"
    exit 1
fi

# 检查后端服务
if curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "✅ 后端服务运行正常 (http://localhost:8080)"
else
    echo "❌ 后端服务未运行"
    echo "请运行: ./scripts/start-backend.sh"
    exit 1
fi

# 检查Redis服务
if docker ps | grep -q erp-redis; then
    echo "✅ Redis服务运行正常"
else
    echo "❌ Redis服务未运行"
    echo "请运行: ./scripts/start-infrastructure.sh"
    exit 1
fi

echo ""
echo "⚠️  注意：为确保登录测试正常，建议清除Redis中的用户登录缓存"
echo "这将清除所有用户的登录锁定状态和错误计数"
echo ""
read -p "是否清除Redis中的用户登录缓存？(y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在清除Redis缓存..."
    
    # 尝试清除Redis缓存
    if docker exec erp-redis redis-cli -a redis123 FLUSHALL > /dev/null 2>&1; then
        echo "✅ Redis缓存清除成功"
    else
        echo "❌ Redis缓存清除失败，但继续执行测试"
        echo "如果登录失败，请手动执行: docker exec erp-redis redis-cli -a redis123 FLUSHALL"
    fi
    
    # 等待一下让Redis操作完成
    sleep 1
else
    echo "跳过Redis缓存清除"
    echo "如果遇到登录异常错误，请重新运行并选择清除缓存"
fi

echo ""
echo "开始快速测试检查..."

# 运行测试（只运行前3个测试用例进行快速验证）
npx playwright test tests/e2e/basic-e2e.spec.ts --grep "1\.|2\.|3\." --reporter=html

echo ""
echo "=========================================="
echo "快速检查完成"
echo "=========================================="
echo ""
echo "📊 测试报告已生成："
echo "  HTML报告: test-reports/playwright-report/index.html"
echo "  截图视频: test-results/"
echo ""
echo "🔍 查看报告: npx playwright show-report"
echo "📁 打开目录: open test-reports/playwright-report/"
echo ""
echo "如需运行完整测试: ./tests/e2e/e2e-full-test.sh"