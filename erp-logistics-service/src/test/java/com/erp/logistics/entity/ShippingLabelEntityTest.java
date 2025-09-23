package com.erp.logistics.entity;

import com.erp.logistics.enums.LabelFormat;
import com.erp.logistics.enums.LabelStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 面单信息实体类测试
 * 验证BaseEntity继承和erp-common配置
 *
 * @author ERP System
 */
@DisplayName("面单信息实体类测试")
class ShippingLabelEntityTest {

    @Test
    @DisplayName("测试面单实体类基本属性")
    void testShippingLabelBasicProperties() {
        // 创建面单实例
        ShippingLabel label = new ShippingLabel();
        
        // 设置基本属性
        label.setLogisticsOrderId(1001L);
        label.setLabelNumber("SL202501010001");
        label.setTrackingNumber("SF1234567890");
        label.setStatus(LabelStatus.GENERATED);
        label.setFormat(LabelFormat.PDF);
        label.setLabelUrl("https://example.com/labels/SL202501010001.pdf");
        label.setLabelSize("100x150mm");
        label.setPrintCount(0);
        label.setPrinted(false);
        label.setRemarks("测试面单");
        
        // 验证基本属性
        assertThat(label.getLogisticsOrderId()).isEqualTo(1001L);
        assertThat(label.getLabelNumber()).isEqualTo("SL202501010001");
        assertThat(label.getTrackingNumber()).isEqualTo("SF1234567890");
        assertThat(label.getStatus()).isEqualTo(LabelStatus.GENERATED);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.PDF);
        assertThat(label.getLabelUrl()).isEqualTo("https://example.com/labels/SL202501010001.pdf");
        assertThat(label.getLabelSize()).isEqualTo("100x150mm");
        assertThat(label.getPrintCount()).isEqualTo(0);
        assertThat(label.getPrinted()).isFalse();
        assertThat(label.getRemarks()).isEqualTo("测试面单");
    }

    @Test
    @DisplayName("测试BaseEntity继承的通用字段")
    void testBaseEntityFields() {
        ShippingLabel label = new ShippingLabel();
        
        // 测试ID字段
        label.setId(1L);
        assertThat(label.getId()).isEqualTo(1L);
        
        // 测试时间字段
        LocalDateTime now = LocalDateTime.now();
        label.setCreateTime(now);
        label.setUpdateTime(now);
        assertThat(label.getCreateTime()).isEqualTo(now);
        assertThat(label.getUpdateTime()).isEqualTo(now);
        
        // 测试审计字段
        label.setCreateBy(1001L);
        label.setUpdateBy(1002L);
        assertThat(label.getCreateBy()).isEqualTo(1001L);
        assertThat(label.getUpdateBy()).isEqualTo(1002L);
        
        // 测试逻辑删除字段
        label.setDeleted(0);
        assertThat(label.getDeleted()).isEqualTo(0);
        assertThat(label.isLogicallyDeleted()).isFalse();
        
        label.setDeleted(1);
        assertThat(label.getDeleted()).isEqualTo(1);
        assertThat(label.isLogicallyDeleted()).isTrue();
        
        // 测试版本字段（乐观锁）
        label.setVersion(1);
        assertThat(label.getVersion()).isEqualTo(1);
    }

    @Test
    @DisplayName("测试新实体判断方法")
    void testIsNewEntity() {
        ShippingLabel label = new ShippingLabel();
        
        // 新实体（ID为空）
        assertThat(label.isNew()).isTrue();
        
        // 已存在的实体（ID不为空）
        label.setId(1L);
        assertThat(label.isNew()).isFalse();
    }

    @Test
    @DisplayName("测试实体描述方法")
    void testEntityDescription() {
        ShippingLabel label = new ShippingLabel();
        label.setLabelNumber("SL202501010001");
        label.setTrackingNumber("SF1234567890");
        
        String description = label.getEntityDescription();
        assertThat(description).contains("面单");
        assertThat(description).contains("SL202501010001");
        assertThat(description).contains("SF1234567890");
    }

    @Test
    @DisplayName("测试JSON字段处理")
    void testJsonFields() {
        ShippingLabel label = new ShippingLabel();
        
        // 测试面单生成参数JSON字段
        Map<String, Object> generateParams = new HashMap<>();
        generateParams.put("template", "standard");
        generateParams.put("size", "100x150");
        generateParams.put("dpi", 300);
        generateParams.put("format", "PDF");
        label.setGenerateParams(generateParams);
        
        assertThat(label.getGenerateParams()).isNotNull();
        assertThat(label.getGenerateParams().get("template")).isEqualTo("standard");
        assertThat(label.getGenerateParams().get("size")).isEqualTo("100x150");
        assertThat(label.getGenerateParams().get("dpi")).isEqualTo(300);
        assertThat(label.getGenerateParams().get("format")).isEqualTo("PDF");
    }

    @Test
    @DisplayName("测试枚举字段处理")
    void testEnumFields() {
        ShippingLabel label = new ShippingLabel();
        
        // 测试面单状态枚举
        label.setStatus(LabelStatus.GENERATED);
        assertThat(label.getStatus()).isEqualTo(LabelStatus.GENERATED);
        assertThat(label.getStatus().getCode()).isEqualTo(1);
        assertThat(label.getStatus().getDescription()).isEqualTo("已生成");
        
        // 测试面单格式枚举
        label.setFormat(LabelFormat.PDF);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.PDF);
        assertThat(label.getFormat().getCode()).isEqualTo(1);
        assertThat(label.getFormat().getDescription()).isEqualTo("PDF");
        
        // 测试其他格式
        label.setFormat(LabelFormat.PNG);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.PNG);
        assertThat(label.getFormat().getCode()).isEqualTo(2);
        assertThat(label.getFormat().getDescription()).isEqualTo("PNG");
    }

    @Test
    @DisplayName("测试面单内容处理")
    void testLabelContent() {
        ShippingLabel label = new ShippingLabel();
        
        // 模拟Base64编码的PDF内容
        String base64Content = "JVBERi0xLjQKJcOkw7zDtsO4DQo..."; // 简化的Base64内容
        label.setLabelContent(base64Content);
        
        assertThat(label.getLabelContent()).isEqualTo(base64Content);
        assertThat(label.getLabelContent()).isNotEmpty();
    }

    @Test
    @DisplayName("测试打印相关字段")
    void testPrintFields() {
        ShippingLabel label = new ShippingLabel();
        
        // 初始状态
        label.setPrintCount(0);
        label.setPrinted(false);
        assertThat(label.getPrintCount()).isEqualTo(0);
        assertThat(label.getPrinted()).isFalse();
        
        // 打印后状态
        label.setPrintCount(1);
        label.setPrinted(true);
        assertThat(label.getPrintCount()).isEqualTo(1);
        assertThat(label.getPrinted()).isTrue();
        
        // 多次打印
        label.setPrintCount(3);
        assertThat(label.getPrintCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("测试面单尺寸信息")
    void testLabelSize() {
        ShippingLabel label = new ShippingLabel();
        
        // 测试不同尺寸格式
        label.setLabelSize("100x150mm");
        assertThat(label.getLabelSize()).isEqualTo("100x150mm");
        
        label.setLabelSize("4x6inch");
        assertThat(label.getLabelSize()).isEqualTo("4x6inch");
        
        label.setLabelSize("A4");
        assertThat(label.getLabelSize()).isEqualTo("A4");
    }
}