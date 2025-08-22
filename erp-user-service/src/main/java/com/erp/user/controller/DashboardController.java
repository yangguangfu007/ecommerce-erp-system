package com.erp.user.controller;

import com.erp.common.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Arrays;

/**
 * 仪表板控制器
 * 提供系统仪表板相关的统计数据和快捷操作
 */
@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "仪表板管理", description = "系统仪表板相关接口")
public class DashboardController {

    /**
     * 获取仪表板统计数据
     */
    @GetMapping("/stats")
    @Operation(summary = "获取仪表板统计数据", description = "获取今日订单、销售额、商品数量、库存预警等统计数据")
    public Result<Map<String, Object>> getDashboardStats() {
        log.info("获取仪表板统计数据");
        
        Map<String, Object> stats = new HashMap<>();
        
        // 今日订单统计
        stats.put("todayOrders", 1234);
        stats.put("todayOrdersChange", 12.5);
        
        // 今日销售额
        stats.put("todaySales", new BigDecimal("156789.50"));
        stats.put("todaySalesChange", 8.2);
        
        // 商品总数
        stats.put("totalProducts", 5678);
        stats.put("totalProductsChange", -2.1);
        
        // 库存预警
        stats.put("lowStockAlerts", 23);
        stats.put("lowStockAlertsChange", -15.3);
        
        return Result.success("获取统计数据成功", stats);
    }

    /**
     * 获取销售趋势数据
     */
    @GetMapping("/sales-trend")
    @Operation(summary = "获取销售趋势数据", description = "获取指定时间段的销售趋势图表数据")
    public Result<Map<String, Object>> getSalesTrend(@RequestParam(defaultValue = "30d") String period) {
        log.info("获取销售趋势数据，时间段：{}", period);
        
        Map<String, Object> trendData = new HashMap<>();
        
        // 生成模拟的销售趋势数据
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();
        
        // 生成最近30天的数据
        for (int i = 29; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minusDays(i);
            labels.add(date.toLocalDate().toString());
            data.add(5000 + (Math.random() * 10000));
        }
        
        trendData.put("labels", labels);
        trendData.put("data", data);
        trendData.put("period", period);
        
        return Result.success("获取销售趋势数据成功", trendData);
    }

    /**
     * 获取订单状态分布数据
     */
    @GetMapping("/order-status")
    @Operation(summary = "获取订单状态分布", description = "获取各种订单状态的数量分布")
    public Result<Map<String, Object>> getOrderStatusDistribution() {
        log.info("获取订单状态分布数据");
        
        Map<String, Object> statusData = new HashMap<>();
        
        List<String> labels = Arrays.asList("待支付", "待发货", "已发货", "已完成", "已取消");
        List<Integer> data = Arrays.asList(156, 234, 567, 1234, 89);
        
        statusData.put("labels", labels);
        statusData.put("data", data);
        
        return Result.success("获取订单状态分布成功", statusData);
    }

    /**
     * 获取热销商品数据
     */
    @GetMapping("/top-products")
    @Operation(summary = "获取热销商品", description = "获取销量排名前N的商品列表")
    public Result<List<Map<String, Object>>> getTopProducts(@RequestParam(defaultValue = "5") int limit) {
        log.info("获取热销商品数据，限制数量：{}", limit);
        
        List<Map<String, Object>> topProducts = new ArrayList<>();
        
        String[] productNames = {"iPhone 15 Pro", "Samsung Galaxy S24", "华为 Mate 60", "小米14 Pro", "OPPO Find X7"};
        String[] brands = {"Apple", "Samsung", "华为", "小米", "OPPO"};
        
        for (int i = 0; i < Math.min(limit, productNames.length); i++) {
            Map<String, Object> product = new HashMap<>();
            product.put("id", i + 1);
            product.put("name", productNames[i]);
            product.put("brand", brands[i]);
            product.put("sales", 1000 - (i * 150));
            product.put("revenue", new BigDecimal(String.valueOf(50000 - (i * 8000))));
            product.put("image", "https://via.placeholder.com/60x60");
            topProducts.add(product);
        }
        
        return Result.success("获取热销商品成功", topProducts);
    }

    /**
     * 获取快捷操作数据
     */
    @GetMapping("/quick-actions")
    @Operation(summary = "获取快捷操作", description = "获取用户常用的快捷操作列表")
    public Result<List<Map<String, Object>>> getQuickActions() {
        log.info("获取快捷操作数据");
        
        List<Map<String, Object>> actions = new ArrayList<>();
        
        // 添加商品
        Map<String, Object> addProduct = new HashMap<>();
        addProduct.put("id", "add-product");
        addProduct.put("title", "添加商品");
        addProduct.put("description", "快速添加新商品到系统");
        addProduct.put("icon", "Plus");
        addProduct.put("color", "#409eff");
        addProduct.put("route", "/products/add");
        actions.add(addProduct);
        
        // 处理订单
        Map<String, Object> processOrder = new HashMap<>();
        processOrder.put("id", "process-order");
        processOrder.put("title", "处理订单");
        processOrder.put("description", "查看和处理待处理订单");
        processOrder.put("icon", "Document");
        processOrder.put("color", "#67c23a");
        processOrder.put("route", "/orders");
        actions.add(processOrder);
        
        // 库存管理
        Map<String, Object> manageInventory = new HashMap<>();
        manageInventory.put("id", "manage-inventory");
        manageInventory.put("title", "库存管理");
        manageInventory.put("description", "查看和调整商品库存");
        manageInventory.put("icon", "Box");
        manageInventory.put("color", "#e6a23c");
        manageInventory.put("route", "/inventory");
        actions.add(manageInventory);
        
        // 数据报表
        Map<String, Object> viewReports = new HashMap<>();
        viewReports.put("id", "view-reports");
        viewReports.put("title", "数据报表");
        viewReports.put("description", "查看销售和运营报表");
        viewReports.put("icon", "DataAnalysis");
        viewReports.put("color", "#909399");
        viewReports.put("route", "/reports");
        actions.add(viewReports);
        
        return Result.success("获取快捷操作成功", actions);
    }

    /**
     * 获取待处理事项
     */
    @GetMapping("/pending-tasks")
    @Operation(summary = "获取待处理事项", description = "获取需要用户处理的待办事项列表")
    public Result<List<Map<String, Object>>> getPendingTasks(@RequestParam(defaultValue = "10") int limit) {
        log.info("获取待处理事项，限制数量：{}", limit);
        
        List<Map<String, Object>> tasks = new ArrayList<>();
        
        // 待审核订单
        Map<String, Object> pendingOrders = new HashMap<>();
        pendingOrders.put("id", "pending-orders");
        pendingOrders.put("title", "待审核订单");
        pendingOrders.put("description", "有 15 个订单等待审核");
        pendingOrders.put("type", "order");
        pendingOrders.put("priority", "high");
        pendingOrders.put("count", 15);
        pendingOrders.put("route", "/orders?status=pending");
        pendingOrders.put("createdAt", LocalDateTime.now().minusHours(2));
        tasks.add(pendingOrders);
        
        // 库存预警
        Map<String, Object> lowStock = new HashMap<>();
        lowStock.put("id", "low-stock");
        lowStock.put("title", "库存预警");
        lowStock.put("description", "有 8 个商品库存不足");
        lowStock.put("type", "inventory");
        lowStock.put("priority", "medium");
        lowStock.put("count", 8);
        lowStock.put("route", "/inventory?filter=low-stock");
        lowStock.put("createdAt", LocalDateTime.now().minusHours(4));
        tasks.add(lowStock);
        
        // 待发货订单
        Map<String, Object> toShip = new HashMap<>();
        toShip.put("id", "to-ship");
        toShip.put("title", "待发货订单");
        toShip.put("description", "有 23 个订单等待发货");
        toShip.put("type", "shipping");
        toShip.put("priority", "high");
        toShip.put("count", 23);
        toShip.put("route", "/orders?status=confirmed");
        toShip.put("createdAt", LocalDateTime.now().minusHours(1));
        tasks.add(toShip);
        
        // 客户退款申请
        Map<String, Object> refundRequests = new HashMap<>();
        refundRequests.put("id", "refund-requests");
        refundRequests.put("title", "退款申请");
        refundRequests.put("description", "有 3 个退款申请待处理");
        refundRequests.put("type", "refund");
        refundRequests.put("priority", "medium");
        refundRequests.put("count", 3);
        refundRequests.put("route", "/orders?status=refund-requested");
        refundRequests.put("createdAt", LocalDateTime.now().minusHours(6));
        tasks.add(refundRequests);
        
        return Result.success("获取待处理事项成功", tasks.subList(0, Math.min(limit, tasks.size())));
    }

    /**
     * 获取最近活动
     */
    @GetMapping("/recent-activities")
    @Operation(summary = "获取最近活动", description = "获取系统最近的操作活动记录")
    public Result<List<Map<String, Object>>> getRecentActivities(@RequestParam(defaultValue = "10") int limit) {
        log.info("获取最近活动，限制数量：{}", limit);
        
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // 模拟最近活动数据
        String[] descriptions = {"创建了新订单", "更新了商品信息", "处理了退款申请", "调整了库存", "发送了通知"};
        String[] details = {"详细信息 1", "详细信息 2", "详细信息 3", "详细信息 4", "详细信息 5"};
        String[] users = {"张三", "李四", "王五", "赵六", "钱七"};
        String[] types = {"order", "product", "refund", "inventory", "notification"};
        
        for (int i = 0; i < limit; i++) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", i + 1);
            activity.put("user", users[i % users.length]);
            activity.put("description", descriptions[i % descriptions.length]);
            activity.put("details", details[i % details.length]);
            activity.put("type", types[i % types.length]);
            activity.put("time", LocalDateTime.now().minusMinutes(i * 15).toString());
            activities.add(activity);
        }
        
        return Result.success("获取最近活动成功", activities);
    }

    /**
     * 获取系统通知
     */
    @GetMapping("/notifications")
    @Operation(summary = "获取系统通知", description = "获取系统通知消息列表")
    public Result<List<Map<String, Object>>> getNotifications(@RequestParam(defaultValue = "5") int limit) {
        log.info("获取系统通知，限制数量：{}", limit);
        
        List<Map<String, Object>> notifications = new ArrayList<>();
        
        // 系统维护通知
        Map<String, Object> maintenance = new HashMap<>();
        maintenance.put("id", 1);
        maintenance.put("title", "系统维护通知");
        maintenance.put("content", "系统将于今晚23:00-01:00进行维护升级");
        maintenance.put("type", "system");
        maintenance.put("priority", "high");
        maintenance.put("read", false);
        maintenance.put("createdAt", LocalDateTime.now().minusHours(2));
        notifications.add(maintenance);
        
        // 新功能发布
        Map<String, Object> newFeature = new HashMap<>();
        newFeature.put("id", 2);
        newFeature.put("title", "新功能发布");
        newFeature.put("content", "库存预警功能已上线，支持自定义预警阈值");
        newFeature.put("type", "feature");
        newFeature.put("priority", "medium");
        newFeature.put("read", false);
        newFeature.put("createdAt", LocalDateTime.now().minusHours(8));
        notifications.add(newFeature);
        
        // 安全提醒
        Map<String, Object> security = new HashMap<>();
        security.put("id", 3);
        security.put("title", "安全提醒");
        security.put("content", "建议定期更换密码以保障账户安全");
        security.put("type", "security");
        security.put("priority", "low");
        security.put("read", true);
        security.put("createdAt", LocalDateTime.now().minusDays(1));
        notifications.add(security);
        
        return Result.success("获取系统通知成功", notifications.subList(0, Math.min(limit, notifications.size())));
    }
}