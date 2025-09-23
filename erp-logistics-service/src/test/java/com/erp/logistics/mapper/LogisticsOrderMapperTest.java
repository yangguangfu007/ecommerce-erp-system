package com.erp.logistics.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.logistics.entity.LogisticsOrder;
import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 物流订单Mapper层测试
 * 测试BaseMapperPlus的增强方法和QueryWrapperUtils工具类
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/test-schema.sql")
@DisplayName("物流订单Mapper层测试")
class LogisticsOrderMapperTest {

    @Autowired
    private LogisticsOrderMapper logisticsOrderMapper;

    @Test
    @DisplayName("测试BaseMapperPlus基本CRUD操作")
    void testBasicCrudOperations() {
        // 创建物流订单
        LogisticsOrder order = createTestLogisticsOrder();
        
        // 测试插入
        int insertResult = logisticsOrderMapper.insert(order);
        assertThat(insertResult).isEqualTo(1);
        assertThat(order.getId()).isNotNull();
        
        // 测试根据ID查询
        LogisticsOrder foundOrder = logisticsOrderMapper.selectById(order.getId());
        assertThat(foundOrder).isNotNull();
        assertThat(foundOrder.getLogisticsOrderNo()).isEqualTo("LO202501010001");
        assertThat(foundOrder.getProviderName()).isEqualTo("顺丰速运");
        
        // 测试更新
        foundOrder.setRemarks("更新后的备注");
        int updateResult = logisticsOrderMapper.updateById(foundOrder);
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        LogisticsOrder updatedOrder = logisticsOrderMapper.selectById(order.getId());
        assertThat(updatedOrder.getRemarks()).isEqualTo("更新后的备注");
        
        // 测试删除
        int deleteResult = logisticsOrderMapper.deleteById(order.getId());
        assertThat(deleteResult).isEqualTo(1);
        
        // 验证逻辑删除
        LogisticsOrder deletedOrder = logisticsOrderMapper.selectById(order.getId());
        assertThat(deletedOrder).isNull(); // 逻辑删除后查询不到
    }

    @Test
    @DisplayName("测试BaseMapperPlus增强方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 插入测试数据
        LogisticsOrder order1 = createTestLogisticsOrder();
        order1.setLogisticsOrderNo("LO202501010001");
        order1.setProviderCode("SF");
        logisticsOrderMapper.insert(order1);
        
        LogisticsOrder order2 = createTestLogisticsOrder();
        order2.setLogisticsOrderNo("LO202501010002");
        order2.setProviderCode("ZTO");
        order2.setStatus(LogisticsStatus.IN_TRANSIT);
        logisticsOrderMapper.insert(order2);
        
        // 测试existsByCondition方法
        LambdaQueryWrapper<LogisticsOrder> existsWrapper = new LambdaQueryWrapper<>();
        existsWrapper.eq(LogisticsOrder::getProviderCode, "SF");
        boolean exists = logisticsOrderMapper.exists(existsWrapper);
        assertThat(exists).isTrue();
        
        // 测试selectCountByCondition方法
        LambdaQueryWrapper<LogisticsOrder> countWrapper = new LambdaQueryWrapper<>();
        countWrapper.eq(LogisticsOrder::getStatus, LogisticsStatus.PENDING);
        Long count = logisticsOrderMapper.selectCount(countWrapper);
        assertThat(count).isEqualTo(1L);
        
        // 测试selectList方法
        LambdaQueryWrapper<LogisticsOrder> listWrapper = new LambdaQueryWrapper<>();
        listWrapper.eq(LogisticsOrder::getLogisticsType, LogisticsType.STANDARD);
        List<LogisticsOrder> orders = logisticsOrderMapper.selectList(listWrapper);
        assertThat(orders).hasSize(2);
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具类")
    void testQueryWrapperUtils() {
        // 插入测试数据
        LogisticsOrder order1 = createTestLogisticsOrder();
        order1.setLogisticsOrderNo("LO202501010001");
        order1.setProviderName("顺丰速运");
        order1.setShippingCost(new BigDecimal("15.50"));
        order1.setCreateTime(LocalDateTime.of(2025, 1, 1, 10, 0));
        logisticsOrderMapper.insert(order1);
        
        LogisticsOrder order2 = createTestLogisticsOrder();
        order2.setLogisticsOrderNo("LO202501010002");
        order2.setProviderName("中通快递");
        order2.setShippingCost(new BigDecimal("12.00"));
        order2.setCreateTime(LocalDateTime.of(2025, 1, 2, 14, 0));
        logisticsOrderMapper.insert(order2);
        
        // 测试QueryWrapperUtils.lambdaQuery
        LambdaQueryWrapper<LogisticsOrder> wrapper = QueryWrapperUtils.lambdaQuery(LogisticsOrder.class);
        
        // 测试likeIfPresent方法
        QueryWrapperUtils.likeIfPresent(wrapper, LogisticsOrder::getProviderName, "顺丰");
        List<LogisticsOrder> sfOrders = logisticsOrderMapper.selectList(wrapper);
        assertThat(sfOrders).hasSize(1);
        assertThat(sfOrders.get(0).getProviderName()).contains("顺丰");
        
        // 测试eqIfPresent方法
        wrapper = QueryWrapperUtils.lambdaQuery(LogisticsOrder.class);
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getLogisticsType, LogisticsType.STANDARD);
        List<LogisticsOrder> standardOrders = logisticsOrderMapper.selectList(wrapper);
        assertThat(standardOrders).hasSize(2);
        
        // 测试betweenTime方法（如果存在）
        wrapper = QueryWrapperUtils.lambdaQuery(LogisticsOrder.class);
        LocalDateTime startTime = LocalDateTime.of(2025, 1, 1, 0, 0);
        LocalDateTime endTime = LocalDateTime.of(2025, 1, 1, 23, 59);
        wrapper.between(LogisticsOrder::getCreateTime, startTime, endTime);
        List<LogisticsOrder> todayOrders = logisticsOrderMapper.selectList(wrapper);
        assertThat(todayOrders).hasSize(1);
    }

    @Test
    @DisplayName("测试JSON字段处理")
    void testJsonFieldHandling() {
        // 创建包含JSON字段的物流订单
        LogisticsOrder order = createTestLogisticsOrder();
        
        // 设置发件人信息
        Map<String, Object> senderInfo = new HashMap<>();
        senderInfo.put("name", "张三");
        senderInfo.put("phone", "13800138000");
        senderInfo.put("address", "北京市朝阳区");
        order.setSenderInfo(senderInfo);
        
        // 设置收件人信息
        Map<String, Object> recipientInfo = new HashMap<>();
        recipientInfo.put("name", "李四");
        recipientInfo.put("phone", "13900139000");
        recipientInfo.put("address", "上海市浦东新区");
        order.setRecipientInfo(recipientInfo);
        
        // 设置包裹信息
        Map<String, Object> packageInfo = new HashMap<>();
        packageInfo.put("weight", 1.5);
        packageInfo.put("length", 20);
        packageInfo.put("width", 15);
        packageInfo.put("height", 10);
        order.setPackageInfo(packageInfo);
        
        // 插入数据
        logisticsOrderMapper.insert(order);
        
        // 查询并验证JSON字段
        LogisticsOrder foundOrder = logisticsOrderMapper.selectById(order.getId());
        assertThat(foundOrder.getSenderInfo()).isNotNull();
        assertThat(foundOrder.getSenderInfo().get("name")).isEqualTo("张三");
        assertThat(foundOrder.getRecipientInfo().get("name")).isEqualTo("李四");
        assertThat(foundOrder.getPackageInfo().get("weight")).isEqualTo(1.5);
    }

    @Test
    @DisplayName("测试复杂查询条件")
    void testComplexQueryConditions() {
        // 插入多条测试数据
        for (int i = 1; i <= 5; i++) {
            LogisticsOrder order = createTestLogisticsOrder();
            order.setLogisticsOrderNo("LO20250101000" + i);
            order.setStatus(i % 2 == 0 ? LogisticsStatus.IN_TRANSIT : LogisticsStatus.PENDING);
            order.setShippingCost(new BigDecimal(10 + i));
            logisticsOrderMapper.insert(order);
        }
        
        // 测试状态统计
        LambdaQueryWrapper<LogisticsOrder> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(LogisticsOrder::getStatus, LogisticsStatus.PENDING);
        Long pendingCount = logisticsOrderMapper.selectCount(pendingWrapper);
        assertThat(pendingCount).isEqualTo(3L);
        
        LambdaQueryWrapper<LogisticsOrder> transitWrapper = new LambdaQueryWrapper<>();
        transitWrapper.eq(LogisticsOrder::getStatus, LogisticsStatus.IN_TRANSIT);
        Long transitCount = logisticsOrderMapper.selectCount(transitWrapper);
        assertThat(transitCount).isEqualTo(2L);
        
        // 测试费用范围查询
        LambdaQueryWrapper<LogisticsOrder> costWrapper = new LambdaQueryWrapper<>();
        costWrapper.between(LogisticsOrder::getShippingCost, new BigDecimal("12"), new BigDecimal("14"));
        List<LogisticsOrder> costOrders = logisticsOrderMapper.selectList(costWrapper);
        assertThat(costOrders).hasSize(3);
        
        // 测试排序
        LambdaQueryWrapper<LogisticsOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.orderByDesc(LogisticsOrder::getShippingCost);
        List<LogisticsOrder> orderedList = logisticsOrderMapper.selectList(orderWrapper);
        assertThat(orderedList).hasSize(5);
        assertThat(orderedList.get(0).getShippingCost()).isGreaterThan(orderedList.get(1).getShippingCost());
    }

    /**
     * 创建测试用的物流订单
     */
    private LogisticsOrder createTestLogisticsOrder() {
        LogisticsOrder order = new LogisticsOrder();
        order.setLogisticsOrderNo("LO202501010001");
        order.setBusinessOrderId(1001L);
        order.setBusinessOrderNo("BO202501010001");
        order.setLogisticsType(LogisticsType.STANDARD);
        order.setStatus(LogisticsStatus.PENDING);
        order.setProviderName("顺丰速运");
        order.setProviderCode("SF");
        order.setTrackingNumber("SF1234567890");
        order.setShippingCost(new BigDecimal("15.50"));
        order.setCurrency("CNY");
        order.setServiceLevel("标准快递");
        order.setRequireSignature(true);
        order.setInsured(false);
        order.setRemarks("测试订单");
        return order;
    }
}