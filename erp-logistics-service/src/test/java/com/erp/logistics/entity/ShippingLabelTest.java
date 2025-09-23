package com.erp.logistics.entity;

import com.erp.logistics.enums.LabelFormat;
import com.erp.logistics.enums.LabelStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 面单信息实体类测试
 *
 * @author ERP System
 */
@DisplayName("面单信息实体类测试")
class ShippingLabelTest {

    @Test
    @DisplayName("测试面单实体类基本功能")
    void testShippingLabelBasicFunctions() {
        // 创建面单实例
        ShippingLabel label = new ShippingLabel();
        
        // 设置基本属性
        label.setLogisticsOrderId(1L);
        label.setLabelNumber("LB202501010001");
        label.setTrackingNumber("YE123456789CN");
        label.setStatus(LabelStatus.GENERATED);
        label.setFormat(LabelFormat.PDF);
        label.setLabelContent("base64encodedcontent");
        label.setLabelUrl("http://example.com/labels/LB202501010001.pdf");
        label.setLabelSize("10x15cm");
        label.setPrintCount(0);
        label.setPrinted(false);
        label.setRemarks("标准面单");

        // 设置生成参数
        Map<String, Object> generateParams = new HashMap<>();
        generateParams.put("template", "standard");
        generateParams.put("dpi", 300);
        generateParams.put("color", "black");
        label.setGenerateParams(generateParams);

        // 验证基本属性
        assertThat(label.getLogisticsOrderId()).isEqualTo(1L);
        assertThat(label.getLabelNumber()).isEqualTo("LB202501010001");
        assertThat(label.getTrackingNumber()).isEqualTo("YE123456789CN");
        assertThat(label.getStatus()).isEqualTo(LabelStatus.GENERATED);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.PDF);
        assertThat(label.getLabelContent()).isEqualTo("base64encodedcontent");
        assertThat(label.getLabelUrl()).isEqualTo("http://example.com/labels/LB202501010001.pdf");
        assertThat(label.getLabelSize()).isEqualTo("10x15cm");
        assertThat(label.getPrintCount()).isEqualTo(0);
        assertThat(label.getPrinted()).isFalse();
        assertThat(label.getRemarks()).isEqualTo("标准面单");

        // 验证生成参数
        assertThat(label.getGenerateParams()).isNotNull();
        assertThat(label.getGenerateParams().get("template")).isEqualTo("standard");
        assertThat(label.getGenerateParams().get("dpi")).isEqualTo(300);
        assertThat(label.getGenerateParams().get("color")).isEqualTo("black");
    }

    @Test
    @DisplayName("测试继承BaseEntity的功能")
    void testBaseEntityFunctions() {
        ShippingLabel label = new ShippingLabel();
        
        // 测试新实体检查
        assertThat(label.isNew()).isTrue();
        
        // 设置ID后不再是新实体
        label.setId(1L);
        assertThat(label.isNew()).isFalse();
        
        // 测试逻辑删除检查
        assertThat(label.isLogicallyDeleted()).isFalse();
        
        label.setDeleted(1);
        assertThat(label.isLogicallyDeleted()).isTrue();
        
        // 测试实体描述
        label.setLabelNumber("LB202501010001");
        label.setTrackingNumber("YE123456789CN");
        String description = label.getEntityDescription();
        assertThat(description).contains("面单");
        assertThat(description).contains("LB202501010001");
        assertThat(description).contains("YE123456789CN");
    }

    @Test
    @DisplayName("测试面单状态变更")
    void testLabelStatusChange() {
        ShippingLabel label = new ShippingLabel();
        
        // 初始状态为待生成
        label.setStatus(LabelStatus.PENDING);
        assertThat(label.getStatus()).isEqualTo(LabelStatus.PENDING);
        
        // 生成面单
        label.setStatus(LabelStatus.GENERATED);
        label.setPrinted(false);
        label.setPrintCount(0);
        assertThat(label.getStatus()).isEqualTo(LabelStatus.GENERATED);
        assertThat(label.getPrinted()).isFalse();
        assertThat(label.getPrintCount()).isEqualTo(0);
        
        // 打印面单
        label.setStatus(LabelStatus.PRINTED);
        label.setPrinted(true);
        label.setPrintCount(1);
        assertThat(label.getStatus()).isEqualTo(LabelStatus.PRINTED);
        assertThat(label.getPrinted()).isTrue();
        assertThat(label.getPrintCount()).isEqualTo(1);
        
        // 使用面单
        label.setStatus(LabelStatus.USED);
        assertThat(label.getStatus()).isEqualTo(LabelStatus.USED);
    }

    @Test
    @DisplayName("测试不同面单格式")
    void testLabelFormats() {
        ShippingLabel label = new ShippingLabel();
        
        // 测试PDF格式
        label.setFormat(LabelFormat.PDF);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.PDF);
        
        // 测试PNG格式
        label.setFormat(LabelFormat.PNG);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.PNG);
        
        // 测试ZPL格式
        label.setFormat(LabelFormat.ZPL);
        assertThat(label.getFormat()).isEqualTo(LabelFormat.ZPL);
    }
}