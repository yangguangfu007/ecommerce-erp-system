package com.erp.logistics.entity;

import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 物流订单实体类测试
 * 验证BaseEntity继承和erp-common配置
 *
 * @author ERP System
 */
@DisplayName("物流订单实体类测试")
class LogisticsOrderEntityTest {

    @Test
    @DisplayName("测试物流订单实体类基本属性")
    void testLogisticsOrderBasicProperties() {
        // 创建物流订单实例
        LogisticsOrder order = new LogisticsOrder();
        
        // 设置基本属性
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
        
        // 验证基本属性
        assertThat(order.getLogisticsOrderNo()).isEqualTo("LO202501010001");
        assertThat(order.getBusinessOrderId()).isEqualTo(1001L);
        assertThat(order.getBusinessOrderNo()).isEqualTo("BO202501010001");
        assertThat(order.getLogisticsType()).isEqualTo(LogisticsType.STANDARD);
        assertThat(order.getStatus()).isEqualTo(LogisticsStatus.PENDING);
        assertThat(order.getProviderName()).isEqualTo("顺丰速运");
        assertThat(order.getProviderCode()).isEqualTo("SF");
        assertThat(order.getTrackingNumber()).isEqualTo("SF1234567890");
        assertThat(order.getShippingCost()).isEqualByComparingTo(new BigDecimal("15.50"));
        assertThat(order.getCurrency()).isEqualTo("CNY");
        assertThat(order.getServiceLevel()).isEqualTo("标准快递");
        assertThat(order.getRequireSignature()).isTrue();
        assertThat(order.getInsured()).isFalse();
        assertThat(order.getRemarks()).isEqualTo("测试订单");
    }

    @Test
    @DisplayName("测试BaseEntity继承的通用字段")
    void testBaseEntityFields() {
        LogisticsOrder order = new LogisticsOrder();
        
        // 测试ID字段
        order.setId(1L);
        assertThat(order.getId()).isEqualTo(1L);
        
        // 测试时间字段
        LocalDateTime now = LocalDateTime.now();
        order.setCreateTime(now);
        order.setUpdateTime(now);
        assertThat(order.getCreateTime()).isEqualTo(now);
        assertThat(order.getUpdateTime()).isEqualTo(now);
        
        // 测试审计字段
        order.setCreateBy(1001L);
        order.setUpdateBy(1002L);
        assertThat(order.getCreateBy()).isEqualTo(1001L);
        assertThat(order.getUpdateBy()).isEqualTo(1002L);
        
        // 测试逻辑删除字段
        order.setDeleted(0);
        assertThat(order.getDeleted()).isEqualTo(0);
        assertThat(order.isLogicallyDeleted()).isFalse();
        
        order.setDeleted(1);
        assertThat(order.getDeleted()).isEqualTo(1);
        assertThat(order.isLogicallyDeleted()).isTrue();
        
        // 测试版本字段（乐观锁）
        order.setVersion(1);
        assertThat(order.getVersion()).isEqualTo(1);
    }

    @Test
    @DisplayName("测试新实体判断方法")
    void testIsNewEntity() {
        LogisticsOrder order = new LogisticsOrder();
        
        // 新实体（ID为空）
        assertThat(order.isNew()).isTrue();
        
        // 已存在的实体（ID不为空）
        order.setId(1L);
        assertThat(order.isNew()).isFalse();
    }

    @Test
    @DisplayName("测试实体描述方法")
    void testEntityDescription() {
        LogisticsOrder order = new LogisticsOrder();
        order.setLogisticsOrderNo("LO202501010001");
        order.setTrackingNumber("SF1234567890");
        
        String description = order.getEntityDescription();
        assertThat(description).contains("物流订单");
        assertThat(description).contains("LO202501010001");
        assertThat(description).contains("SF1234567890");
    }

    @Test
    @DisplayName("测试JSON字段处理")
    void testJsonFields() {
        LogisticsOrder order = new LogisticsOrder();
        
        // 测试发件人信息JSON字段
        Map<String, Object> senderInfo = new HashMap<>();
        senderInfo.put("name", "张三");
        senderInfo.put("phone", "13800138000");
        senderInfo.put("address", "北京市朝阳区");
        order.setSenderInfo(senderInfo);
        
        assertThat(order.getSenderInfo()).isNotNull();
        assertThat(order.getSenderInfo().get("name")).isEqualTo("张三");
        assertThat(order.getSenderInfo().get("phone")).isEqualTo("13800138000");
        assertThat(order.getSenderInfo().get("address")).isEqualTo("北京市朝阳区");
        
        // 测试收件人信息JSON字段
        Map<String, Object> recipientInfo = new HashMap<>();
        recipientInfo.put("name", "李四");
        recipientInfo.put("phone", "13900139000");
        recipientInfo.put("address", "上海市浦东新区");
        order.setRecipientInfo(recipientInfo);
        
        assertThat(order.getRecipientInfo()).isNotNull();
        assertThat(order.getRecipientInfo().get("name")).isEqualTo("李四");
        assertThat(order.getRecipientInfo().get("phone")).isEqualTo("13900139000");
        assertThat(order.getRecipientInfo().get("address")).isEqualTo("上海市浦东新区");
        
        // 测试包裹信息JSON字段
        Map<String, Object> packageInfo = new HashMap<>();
        packageInfo.put("weight", 1.5);
        packageInfo.put("length", 20);
        packageInfo.put("width", 15);
        packageInfo.put("height", 10);
        order.setPackageInfo(packageInfo);
        
        assertThat(order.getPackageInfo()).isNotNull();
        assertThat(order.getPackageInfo().get("weight")).isEqualTo(1.5);
        assertThat(order.getPackageInfo().get("length")).isEqualTo(20);
        assertThat(order.getPackageInfo().get("width")).isEqualTo(15);
        assertThat(order.getPackageInfo().get("height")).isEqualTo(10);
    }

    @Test
    @DisplayName("测试枚举字段处理")
    void testEnumFields() {
        LogisticsOrder order = new LogisticsOrder();
        
        // 测试物流类型枚举
        order.setLogisticsType(LogisticsType.EXPRESS);
        assertThat(order.getLogisticsType()).isEqualTo(LogisticsType.EXPRESS);
        assertThat(order.getLogisticsType().getCode()).isEqualTo(2);
        assertThat(order.getLogisticsType().getDescription()).isEqualTo("特快专递");
        
        // 测试物流状态枚举
        order.setStatus(LogisticsStatus.IN_TRANSIT);
        assertThat(order.getStatus()).isEqualTo(LogisticsStatus.IN_TRANSIT);
        assertThat(order.getStatus().getCode()).isEqualTo(3);
        assertThat(order.getStatus().getDescription()).isEqualTo("运输中");
        assertThat(order.getStatus().isFinalStatus()).isFalse();
        assertThat(order.getStatus().isExceptionStatus()).isFalse();
        
        // 测试终态状态
        order.setStatus(LogisticsStatus.DELIVERED);
        assertThat(order.getStatus().isFinalStatus()).isTrue();
        
        // 测试异常状态
        order.setStatus(LogisticsStatus.EXCEPTION);
        assertThat(order.getStatus().isExceptionStatus()).isTrue();
    }

    @Test
    @DisplayName("测试时间字段处理")
    void testTimeFields() {
        LogisticsOrder order = new LogisticsOrder();
        
        LocalDateTime estimatedShipTime = LocalDateTime.of(2025, 1, 15, 10, 0);
        LocalDateTime actualShipTime = LocalDateTime.of(2025, 1, 15, 14, 30);
        LocalDateTime estimatedDeliveryTime = LocalDateTime.of(2025, 1, 17, 18, 0);
        LocalDateTime actualDeliveryTime = LocalDateTime.of(2025, 1, 17, 16, 45);
        
        order.setEstimatedShipTime(estimatedShipTime);
        order.setActualShipTime(actualShipTime);
        order.setEstimatedDeliveryTime(estimatedDeliveryTime);
        order.setActualDeliveryTime(actualDeliveryTime);
        
        assertThat(order.getEstimatedShipTime()).isEqualTo(estimatedShipTime);
        assertThat(order.getActualShipTime()).isEqualTo(actualShipTime);
        assertThat(order.getEstimatedDeliveryTime()).isEqualTo(estimatedDeliveryTime);
        assertThat(order.getActualDeliveryTime()).isEqualTo(actualDeliveryTime);
    }
}