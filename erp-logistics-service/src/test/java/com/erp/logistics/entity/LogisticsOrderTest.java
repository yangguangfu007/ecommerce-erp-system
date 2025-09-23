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
 *
 * @author ERP System
 */
@DisplayName("物流订单实体类测试")
class LogisticsOrderTest {

    @Test
    @DisplayName("测试物流订单实体类基本功能")
    void testLogisticsOrderBasicFunctions() {
        // 创建物流订单实例
        LogisticsOrder order = new LogisticsOrder();
        
        // 设置基本属性
        order.setLogisticsOrderNo("LO202501010001");
        order.setBusinessOrderId(1001L);
        order.setBusinessOrderNo("BO202501010001");
        order.setLogisticsType(LogisticsType.STANDARD);
        order.setStatus(LogisticsStatus.CREATED);
        order.setProviderName("云途物流");
        order.setProviderCode("YUNEXPRESS");
        order.setTrackingNumber("YE123456789CN");
        order.setShippingCost(new BigDecimal("25.50"));
        order.setCurrency("CNY");
        order.setServiceLevel("标准服务");
        order.setRequireSignature(false);
        order.setInsured(false);
        order.setRemarks("测试物流订单");

        // 设置JSON字段
        Map<String, Object> senderInfo = new HashMap<>();
        senderInfo.put("name", "张三");
        senderInfo.put("phone", "13800138000");
        senderInfo.put("address", "深圳市南山区");
        order.setSenderInfo(senderInfo);

        Map<String, Object> recipientInfo = new HashMap<>();
        recipientInfo.put("name", "李四");
        recipientInfo.put("phone", "13900139000");
        recipientInfo.put("address", "北京市朝阳区");
        order.setRecipientInfo(recipientInfo);

        Map<String, Object> packageInfo = new HashMap<>();
        packageInfo.put("weight", 1.5);
        packageInfo.put("length", 20);
        packageInfo.put("width", 15);
        packageInfo.put("height", 10);
        order.setPackageInfo(packageInfo);

        // 验证基本属性
        assertThat(order.getLogisticsOrderNo()).isEqualTo("LO202501010001");
        assertThat(order.getBusinessOrderId()).isEqualTo(1001L);
        assertThat(order.getBusinessOrderNo()).isEqualTo("BO202501010001");
        assertThat(order.getLogisticsType()).isEqualTo(LogisticsType.STANDARD);
        assertThat(order.getStatus()).isEqualTo(LogisticsStatus.CREATED);
        assertThat(order.getProviderName()).isEqualTo("云途物流");
        assertThat(order.getProviderCode()).isEqualTo("YUNEXPRESS");
        assertThat(order.getTrackingNumber()).isEqualTo("YE123456789CN");
        assertThat(order.getShippingCost()).isEqualTo(new BigDecimal("25.50"));
        assertThat(order.getCurrency()).isEqualTo("CNY");
        assertThat(order.getServiceLevel()).isEqualTo("标准服务");
        assertThat(order.getRequireSignature()).isFalse();
        assertThat(order.getInsured()).isFalse();
        assertThat(order.getRemarks()).isEqualTo("测试物流订单");

        // 验证JSON字段
        assertThat(order.getSenderInfo()).isNotNull();
        assertThat(order.getSenderInfo().get("name")).isEqualTo("张三");
        assertThat(order.getRecipientInfo()).isNotNull();
        assertThat(order.getRecipientInfo().get("name")).isEqualTo("李四");
        assertThat(order.getPackageInfo()).isNotNull();
        assertThat(order.getPackageInfo().get("weight")).isEqualTo(1.5);
    }

    @Test
    @DisplayName("测试继承BaseEntity的功能")
    void testBaseEntityFunctions() {
        LogisticsOrder order = new LogisticsOrder();
        
        // 测试新实体检查
        assertThat(order.isNew()).isTrue();
        
        // 设置ID后不再是新实体
        order.setId(1L);
        assertThat(order.isNew()).isFalse();
        
        // 测试逻辑删除检查
        assertThat(order.isLogicallyDeleted()).isFalse();
        
        order.setDeleted(1);
        assertThat(order.isLogicallyDeleted()).isTrue();
        
        // 测试实体描述
        order.setLogisticsOrderNo("LO202501010001");
        order.setTrackingNumber("YE123456789CN");
        String description = order.getEntityDescription();
        assertThat(description).contains("物流订单");
        assertThat(description).contains("LO202501010001");
        assertThat(description).contains("YE123456789CN");
    }

    @Test
    @DisplayName("测试时间字段设置")
    void testTimeFields() {
        LogisticsOrder order = new LogisticsOrder();
        LocalDateTime now = LocalDateTime.now();
        
        // 设置时间字段
        order.setEstimatedShipTime(now.plusDays(1));
        order.setActualShipTime(now.plusDays(2));
        order.setEstimatedDeliveryTime(now.plusDays(5));
        order.setActualDeliveryTime(now.plusDays(6));
        
        // 验证时间字段
        assertThat(order.getEstimatedShipTime()).isEqualTo(now.plusDays(1));
        assertThat(order.getActualShipTime()).isEqualTo(now.plusDays(2));
        assertThat(order.getEstimatedDeliveryTime()).isEqualTo(now.plusDays(5));
        assertThat(order.getActualDeliveryTime()).isEqualTo(now.plusDays(6));
    }

    @Test
    @DisplayName("测试扩展信息字段")
    void testExtendInfo() {
        LogisticsOrder order = new LogisticsOrder();
        
        // 设置扩展信息
        Map<String, Object> extendInfo = new HashMap<>();
        extendInfo.put("customField1", "自定义值1");
        extendInfo.put("customField2", 123);
        extendInfo.put("customField3", true);
        order.setExtendInfo(extendInfo);
        
        // 验证扩展信息
        assertThat(order.getExtendInfo()).isNotNull();
        assertThat(order.getExtendInfo().get("customField1")).isEqualTo("自定义值1");
        assertThat(order.getExtendInfo().get("customField2")).isEqualTo(123);
        assertThat(order.getExtendInfo().get("customField3")).isEqualTo(true);
    }
}