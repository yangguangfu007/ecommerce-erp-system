package com.erp.logistics.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.logistics.entity.ShippingLabel;
import com.erp.logistics.enums.LabelFormat;
import com.erp.logistics.enums.LabelStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 面单信息Mapper层测试
 * 测试BaseMapperPlus的增强方法和自定义查询方法
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/test-schema.sql")
@DisplayName("面单信息Mapper层测试")
class ShippingLabelMapperTest {

    @Autowired
    private ShippingLabelMapper shippingLabelMapper;

    @Test
    @DisplayName("测试BaseMapperPlus基本CRUD操作")
    void testBasicCrudOperations() {
        // 创建面单
        ShippingLabel label = createTestShippingLabel();
        
        // 测试插入
        int insertResult = shippingLabelMapper.insert(label);
        assertThat(insertResult).isEqualTo(1);
        assertThat(label.getId()).isNotNull();
        
        // 测试根据ID查询
        ShippingLabel foundLabel = shippingLabelMapper.selectById(label.getId());
        assertThat(foundLabel).isNotNull();
        assertThat(foundLabel.getLabelNumber()).isEqualTo("SL202501010001");
        assertThat(foundLabel.getTrackingNumber()).isEqualTo("SF1234567890");
        
        // 测试更新
        foundLabel.setPrintCount(1);
        foundLabel.setPrinted(true);
        int updateResult = shippingLabelMapper.updateById(foundLabel);
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        ShippingLabel updatedLabel = shippingLabelMapper.selectById(label.getId());
        assertThat(updatedLabel.getPrintCount()).isEqualTo(1);
        assertThat(updatedLabel.getPrinted()).isTrue();
        
        // 测试删除
        int deleteResult = shippingLabelMapper.deleteById(label.getId());
        assertThat(deleteResult).isEqualTo(1);
        
        // 验证逻辑删除
        ShippingLabel deletedLabel = shippingLabelMapper.selectById(label.getId());
        assertThat(deletedLabel).isNull(); // 逻辑删除后查询不到
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 插入测试数据
        ShippingLabel label1 = createTestShippingLabel();
        label1.setLogisticsOrderId(1001L);
        label1.setLabelNumber("SL202501010001");
        label1.setTrackingNumber("SF1234567890");
        shippingLabelMapper.insert(label1);
        
        ShippingLabel label2 = createTestShippingLabel();
        label2.setLogisticsOrderId(1001L);
        label2.setLabelNumber("SL202501010002");
        label2.setTrackingNumber("SF1234567891");
        shippingLabelMapper.insert(label2);
        
        ShippingLabel label3 = createTestShippingLabel();
        label3.setLogisticsOrderId(1002L);
        label3.setLabelNumber("SL202501010003");
        label3.setTrackingNumber("ZTO1234567890");
        shippingLabelMapper.insert(label3);
        
        // 测试根据物流订单ID查询面单列表
        List<ShippingLabel> orderLabels = shippingLabelMapper.selectByLogisticsOrderId(1001L);
        assertThat(orderLabels).hasSize(2);
        assertThat(orderLabels).allMatch(label -> label.getLogisticsOrderId().equals(1001L));
        
        // 测试根据运单号查询面单信息
        ShippingLabel labelByTracking = shippingLabelMapper.selectByTrackingNumber("SF1234567890");
        assertThat(labelByTracking).isNotNull();
        assertThat(labelByTracking.getLabelNumber()).isEqualTo("SL202501010001");
        
        // 测试根据面单编号查询面单信息
        ShippingLabel labelByNumber = shippingLabelMapper.selectByLabelNumber("SL202501010002");
        assertThat(labelByNumber).isNotNull();
        assertThat(labelByNumber.getTrackingNumber()).isEqualTo("SF1234567891");
        
        // 测试查询不存在的数据
        ShippingLabel notFound = shippingLabelMapper.selectByTrackingNumber("NOTEXIST");
        assertThat(notFound).isNull();
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具类")
    void testQueryWrapperUtils() {
        // 插入测试数据
        ShippingLabel label1 = createTestShippingLabel();
        label1.setLabelNumber("SL202501010001");
        label1.setStatus(LabelStatus.GENERATED);
        label1.setFormat(LabelFormat.PDF);
        shippingLabelMapper.insert(label1);
        
        ShippingLabel label2 = createTestShippingLabel();
        label2.setLabelNumber("SL202501010002");
        label2.setStatus(LabelStatus.PRINTED);
        label2.setFormat(LabelFormat.PNG);
        shippingLabelMapper.insert(label2);
        
        // 测试eqIfPresent方法
        LambdaQueryWrapper<ShippingLabel> wrapper = QueryWrapperUtils.lambdaQuery(ShippingLabel.class);
        QueryWrapperUtils.eqIfPresent(wrapper, ShippingLabel::getStatus, LabelStatus.GENERATED);
        List<ShippingLabel> generatedLabels = shippingLabelMapper.selectList(wrapper);
        assertThat(generatedLabels).hasSize(1);
        assertThat(generatedLabels.get(0).getStatus()).isEqualTo(LabelStatus.GENERATED);
        
        // 测试likeIfPresent方法
        wrapper = QueryWrapperUtils.lambdaQuery(ShippingLabel.class);
        QueryWrapperUtils.likeIfPresent(wrapper, ShippingLabel::getLabelNumber, "SL2025");
        List<ShippingLabel> matchingLabels = shippingLabelMapper.selectList(wrapper);
        assertThat(matchingLabels).hasSize(2);
        
        // 测试多条件组合查询
        wrapper = QueryWrapperUtils.lambdaQuery(ShippingLabel.class);
        QueryWrapperUtils.eqIfPresent(wrapper, ShippingLabel::getFormat, LabelFormat.PDF);
        QueryWrapperUtils.eqIfPresent(wrapper, ShippingLabel::getStatus, LabelStatus.GENERATED);
        List<ShippingLabel> pdfGeneratedLabels = shippingLabelMapper.selectList(wrapper);
        assertThat(pdfGeneratedLabels).hasSize(1);
    }

    @Test
    @DisplayName("测试JSON字段处理")
    void testJsonFieldHandling() {
        // 创建包含JSON字段的面单
        ShippingLabel label = createTestShippingLabel();
        
        // 设置面单生成参数
        Map<String, Object> generateParams = new HashMap<>();
        generateParams.put("template", "standard");
        generateParams.put("size", "100x150");
        generateParams.put("dpi", 300);
        generateParams.put("format", "PDF");
        generateParams.put("options", Map.of("border", true, "logo", true));
        label.setGenerateParams(generateParams);
        
        // 插入数据
        shippingLabelMapper.insert(label);
        
        // 查询并验证JSON字段
        ShippingLabel foundLabel = shippingLabelMapper.selectById(label.getId());
        assertThat(foundLabel.getGenerateParams()).isNotNull();
        assertThat(foundLabel.getGenerateParams().get("template")).isEqualTo("standard");
        assertThat(foundLabel.getGenerateParams().get("size")).isEqualTo("100x150");
        assertThat(foundLabel.getGenerateParams().get("dpi")).isEqualTo(300);
        
        // 验证嵌套JSON对象
        @SuppressWarnings("unchecked")
        Map<String, Object> options = (Map<String, Object>) foundLabel.getGenerateParams().get("options");
        assertThat(options.get("border")).isEqualTo(true);
        assertThat(options.get("logo")).isEqualTo(true);
    }

    @Test
    @DisplayName("测试枚举字段查询")
    void testEnumFieldQuery() {
        // 插入不同状态和格式的面单
        ShippingLabel pdfLabel = createTestShippingLabel();
        pdfLabel.setLabelNumber("SL202501010001");
        pdfLabel.setStatus(LabelStatus.GENERATED);
        pdfLabel.setFormat(LabelFormat.PDF);
        shippingLabelMapper.insert(pdfLabel);
        
        ShippingLabel pngLabel = createTestShippingLabel();
        pngLabel.setLabelNumber("SL202501010002");
        pngLabel.setStatus(LabelStatus.PRINTED);
        pngLabel.setFormat(LabelFormat.PNG);
        shippingLabelMapper.insert(pngLabel);
        
        ShippingLabel zplLabel = createTestShippingLabel();
        zplLabel.setLabelNumber("SL202501010003");
        zplLabel.setStatus(LabelStatus.USED);
        zplLabel.setFormat(LabelFormat.ZPL);
        shippingLabelMapper.insert(zplLabel);
        
        // 测试按状态查询
        LambdaQueryWrapper<ShippingLabel> statusWrapper = new LambdaQueryWrapper<>();
        statusWrapper.eq(ShippingLabel::getStatus, LabelStatus.GENERATED);
        List<ShippingLabel> generatedLabels = shippingLabelMapper.selectList(statusWrapper);
        assertThat(generatedLabels).hasSize(1);
        
        // 测试按格式查询
        LambdaQueryWrapper<ShippingLabel> formatWrapper = new LambdaQueryWrapper<>();
        formatWrapper.in(ShippingLabel::getFormat, LabelFormat.PDF, LabelFormat.PNG);
        List<ShippingLabel> imageLabels = shippingLabelMapper.selectList(formatWrapper);
        assertThat(imageLabels).hasSize(2);
        
        // 测试打印机格式查询
        LambdaQueryWrapper<ShippingLabel> printerWrapper = new LambdaQueryWrapper<>();
        printerWrapper.eq(ShippingLabel::getFormat, LabelFormat.ZPL);
        List<ShippingLabel> printerLabels = shippingLabelMapper.selectList(printerWrapper);
        assertThat(printerLabels).hasSize(1);
        assertThat(printerLabels.get(0).getFormat().isPrinterFormat()).isTrue();
    }

    @Test
    @DisplayName("测试打印相关字段查询")
    void testPrintRelatedFields() {
        // 插入不同打印状态的面单
        ShippingLabel unprintedLabel = createTestShippingLabel();
        unprintedLabel.setLabelNumber("SL202501010001");
        unprintedLabel.setPrintCount(0);
        unprintedLabel.setPrinted(false);
        shippingLabelMapper.insert(unprintedLabel);
        
        ShippingLabel printedOnceLabel = createTestShippingLabel();
        printedOnceLabel.setLabelNumber("SL202501010002");
        printedOnceLabel.setPrintCount(1);
        printedOnceLabel.setPrinted(true);
        shippingLabelMapper.insert(printedOnceLabel);
        
        ShippingLabel printedMultipleLabel = createTestShippingLabel();
        printedMultipleLabel.setLabelNumber("SL202501010003");
        printedMultipleLabel.setPrintCount(3);
        printedMultipleLabel.setPrinted(true);
        shippingLabelMapper.insert(printedMultipleLabel);
        
        // 测试查询未打印的面单
        LambdaQueryWrapper<ShippingLabel> unprintedWrapper = new LambdaQueryWrapper<>();
        unprintedWrapper.eq(ShippingLabel::getPrinted, false);
        List<ShippingLabel> unprintedLabels = shippingLabelMapper.selectList(unprintedWrapper);
        assertThat(unprintedLabels).hasSize(1);
        assertThat(unprintedLabels.get(0).getPrintCount()).isEqualTo(0);
        
        // 测试查询已打印的面单
        LambdaQueryWrapper<ShippingLabel> printedWrapper = new LambdaQueryWrapper<>();
        printedWrapper.eq(ShippingLabel::getPrinted, true);
        List<ShippingLabel> printedLabels = shippingLabelMapper.selectList(printedWrapper);
        assertThat(printedLabels).hasSize(2);
        
        // 测试查询打印次数大于1的面单
        LambdaQueryWrapper<ShippingLabel> multiPrintWrapper = new LambdaQueryWrapper<>();
        multiPrintWrapper.gt(ShippingLabel::getPrintCount, 1);
        List<ShippingLabel> multiPrintLabels = shippingLabelMapper.selectList(multiPrintWrapper);
        assertThat(multiPrintLabels).hasSize(1);
        assertThat(multiPrintLabels.get(0).getPrintCount()).isEqualTo(3);
    }

    /**
     * 创建测试用的面单
     */
    private ShippingLabel createTestShippingLabel() {
        ShippingLabel label = new ShippingLabel();
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
        return label;
    }
}