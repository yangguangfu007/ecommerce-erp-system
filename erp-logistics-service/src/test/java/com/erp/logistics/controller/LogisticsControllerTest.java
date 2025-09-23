package com.erp.logistics.controller;

import com.erp.common.response.PageResult;
import com.erp.logistics.dto.LogisticsOrderDTO;
import com.erp.logistics.dto.LogisticsOrderQueryDTO;
import com.erp.logistics.entity.LogisticsOrder;
import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import com.erp.logistics.service.LogisticsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 物流管理控制器测试
 * 验证BaseServicePlus的批量操作和PageResult分页响应
 *
 * @author ERP System
 */
@WebMvcTest(LogisticsController.class)
@DisplayName("物流管理控制器测试")
class LogisticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LogisticsService logisticsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("测试分页查询物流订单接口")
    void testGetLogisticsOrderPage() throws Exception {
        // 准备测试数据
        List<LogisticsOrder> orders = Arrays.asList(
            createTestLogisticsOrder("LO001", "SF", LogisticsStatus.PENDING),
            createTestLogisticsOrder("LO002", "ZTO", LogisticsStatus.CREATED)
        );
        
        PageResult<LogisticsOrder> pageResult = new PageResult<>();
        pageResult.setContent(orders);
        pageResult.setPage(1L);
        pageResult.setSize(10L);
        pageResult.setTotal(2L);
        pageResult.setTotalPages(1L);
        
        // Mock service行为
        when(logisticsService.getLogisticsOrderPage(anyLong(), anyLong(), any(LogisticsOrderQueryDTO.class)))
            .thenReturn(pageResult);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders")
                .param("page", "1")
                .param("size", "10")
                .param("status", "PENDING")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.total").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(1));
    }

    @Test
    @DisplayName("测试根据ID查询物流订单接口")
    void testGetLogisticsOrderById() throws Exception {
        // 准备测试数据
        Long orderId = 1L;
        LogisticsOrder order = createTestLogisticsOrder("LO001", "SF", LogisticsStatus.PENDING);
        order.setId(orderId);
        
        // Mock service行为
        when(logisticsService.getById(orderId)).thenReturn(order);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/{id}", orderId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(orderId))
                .andExpect(jsonPath("$.data.logisticsOrderNo").value("LO001"))
                .andExpect(jsonPath("$.data.providerCode").value("SF"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @DisplayName("测试根据业务订单ID查询物流订单接口")
    void testGetLogisticsOrderByBusinessOrderId() throws Exception {
        // 准备测试数据
        Long businessOrderId = 1001L;
        LogisticsOrder order = createTestLogisticsOrder("LO001", "SF", LogisticsStatus.PENDING);
        order.setBusinessOrderId(businessOrderId);
        
        // Mock service行为
        when(logisticsService.getLogisticsOrderByBusinessOrderId(businessOrderId)).thenReturn(order);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/business/{businessOrderId}", businessOrderId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.businessOrderId").value(businessOrderId))
                .andExpect(jsonPath("$.data.logisticsOrderNo").value("LO001"));
    }

    @Test
    @DisplayName("测试根据运单号查询物流订单接口")
    void testGetLogisticsOrderByTrackingNumber() throws Exception {
        // 准备测试数据
        String trackingNumber = "SF1234567890";
        LogisticsOrder order = createTestLogisticsOrder("LO001", "SF", LogisticsStatus.IN_TRANSIT);
        order.setTrackingNumber(trackingNumber);
        
        // Mock service行为
        when(logisticsService.getLogisticsOrderByTrackingNumber(trackingNumber)).thenReturn(order);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/tracking/{trackingNumber}", trackingNumber)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.trackingNumber").value(trackingNumber))
                .andExpect(jsonPath("$.data.status").value("IN_TRANSIT"));
    }

    @Test
    @DisplayName("测试创建物流订单接口")
    void testCreateLogisticsOrder() throws Exception {
        // 准备测试数据
        LogisticsOrderDTO dto = createTestLogisticsOrderDTO();
        LogisticsOrder createdOrder = createTestLogisticsOrder("LO001", "SF", LogisticsStatus.PENDING);
        createdOrder.setId(1L);
        
        // Mock service行为
        when(logisticsService.createLogisticsOrder(any(LogisticsOrderDTO.class))).thenReturn(createdOrder);
        
        // 执行请求
        mockMvc.perform(post("/api/logistics/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.logisticsOrderNo").value("LO001"))
                .andExpect(jsonPath("$.data.businessOrderId").value(dto.getBusinessOrderId()))
                .andExpect(jsonPath("$.data.providerCode").value("SF"));
    }

    @Test
    @DisplayName("测试更新物流订单接口")
    void testUpdateLogisticsOrder() throws Exception {
        // 准备测试数据
        Long orderId = 1L;
        LogisticsOrderDTO dto = createTestLogisticsOrderDTO();
        dto.setRemarks("更新后的备注");
        
        LogisticsOrder updatedOrder = createTestLogisticsOrder("LO001", "SF", LogisticsStatus.CREATED);
        updatedOrder.setId(orderId);
        updatedOrder.setRemarks("更新后的备注");
        
        // Mock service行为
        when(logisticsService.updateLogisticsOrder(eq(orderId), any(LogisticsOrderDTO.class)))
            .thenReturn(updatedOrder);
        
        // 执行请求
        mockMvc.perform(put("/api/logistics/orders/{id}", orderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(orderId))
                .andExpect(jsonPath("$.data.remarks").value("更新后的备注"));
    }

    @Test
    @DisplayName("测试删除物流订单接口")
    void testDeleteLogisticsOrder() throws Exception {
        // 准备测试数据
        Long orderId = 1L;
        
        // Mock service行为
        when(logisticsService.removeById(orderId)).thenReturn(true);
        
        // 执行请求
        mockMvc.perform(delete("/api/logistics/orders/{id}", orderId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));
    }

    @Test
    @DisplayName("测试批量更新物流状态接口")
    void testBatchUpdateStatus() throws Exception {
        // 准备测试数据
        List<String> trackingNumbers = Arrays.asList("SF1111111111", "ZTO2222222222", "YTO3333333333");
        LogisticsStatus newStatus = LogisticsStatus.IN_TRANSIT;
        int updateCount = 3;
        
        // Mock service行为
        when(logisticsService.batchUpdateStatus(trackingNumbers, newStatus)).thenReturn(updateCount);
        
        // 执行请求
        mockMvc.perform(put("/api/logistics/orders/status/batch")
                .param("trackingNumbers", "SF1111111111", "ZTO2222222222", "YTO3333333333")
                .param("status", "IN_TRANSIT")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(3));
    }

    @Test
    @DisplayName("测试获取物流状态统计接口")
    void testGetStatusStatistics() throws Exception {
        // Mock service行为
        when(logisticsService.countByField("status", LogisticsStatus.PENDING.getCode())).thenReturn(5L);
        when(logisticsService.countByField("status", LogisticsStatus.CREATED.getCode())).thenReturn(3L);
        when(logisticsService.countByField("status", LogisticsStatus.IN_TRANSIT.getCode())).thenReturn(8L);
        when(logisticsService.countByField("status", LogisticsStatus.DELIVERED.getCode())).thenReturn(12L);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/statistics/status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isMap());
    }

    @Test
    @DisplayName("测试获取物流服务商统计接口")
    void testGetProviderStatistics() throws Exception {
        // Mock service行为
        when(logisticsService.countByField("provider_code", "SF")).thenReturn(10L);
        when(logisticsService.countByField("provider_code", "ZTO")).thenReturn(8L);
        when(logisticsService.countByField("provider_code", "YTO")).thenReturn(6L);
        when(logisticsService.countByField("provider_code", "STO")).thenReturn(4L);
        when(logisticsService.countByField("provider_code", "YD")).thenReturn(2L);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/statistics/provider")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isMap())
                .andExpect(jsonPath("$.data.SF").value(10))
                .andExpect(jsonPath("$.data.ZTO").value(8));
    }

    @Test
    @DisplayName("测试创建物流订单参数验证")
    void testCreateLogisticsOrderValidation() throws Exception {
        // 准备无效的测试数据（缺少必填字段）
        LogisticsOrderDTO invalidDto = new LogisticsOrderDTO();
        // 不设置必填字段
        
        // 执行请求
        mockMvc.perform(post("/api/logistics/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest()); // 参数验证失败
    }

    @Test
    @DisplayName("测试查询不存在的物流订单")
    void testGetNonExistentLogisticsOrder() throws Exception {
        // 准备测试数据
        Long nonExistentId = 999L;
        
        // Mock service行为 - 返回null表示不存在
        when(logisticsService.getById(nonExistentId)).thenReturn(null);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("物流订单不存在"));
    }

    @Test
    @DisplayName("测试服务异常处理")
    void testServiceExceptionHandling() throws Exception {
        // 准备测试数据
        Long orderId = 1L;
        
        // Mock service行为 - 抛出异常
        when(logisticsService.getById(orderId)).thenThrow(new RuntimeException("数据库连接异常"));
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/orders/{id}", orderId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("查询物流订单失败：数据库连接异常"));
    }

    @Test
    @DisplayName("测试批量生成面单接口")
    void testBatchGenerateLabels() throws Exception {
        // 准备测试数据
        List<com.erp.logistics.dto.ShippingLabelDTO> labelDTOs = Arrays.asList(
            createTestShippingLabelDTO(1L),
            createTestShippingLabelDTO(2L)
        );
        
        List<com.erp.logistics.entity.ShippingLabel> labels = Arrays.asList(
            createTestShippingLabel("SL001", "SF1111111111"),
            createTestShippingLabel("SL002", "ZTO2222222222")
        );
        
        // Mock service行为
        when(logisticsService.batchGenerateLabels(anyList())).thenReturn(labels);
        
        // 执行请求
        mockMvc.perform(post("/api/logistics/labels")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(labelDTOs)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].labelNumber").value("SL001"))
                .andExpect(jsonPath("$.data[1].labelNumber").value("SL002"));
    }

    @Test
    @DisplayName("测试获取物流跟踪信息接口")
    void testGetTrackingInfo() throws Exception {
        // 准备测试数据
        String trackingNumber = "SF1234567890";
        Map<String, Object> trackingInfo = new HashMap<>();
        trackingInfo.put("trackingNumber", trackingNumber);
        trackingInfo.put("status", LogisticsStatus.IN_TRANSIT);
        trackingInfo.put("providerName", "顺丰速运");
        trackingInfo.put("trackingEvents", Arrays.asList(
            Map.of("time", "2024-01-01T10:00:00", "location", "发货仓库", "description", "包裹已发出"),
            Map.of("time", "2024-01-01T14:00:00", "location", "运输中", "description", "包裹运输中")
        ));
        
        // Mock service行为
        when(logisticsService.getTrackingInfo(trackingNumber)).thenReturn(trackingInfo);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/tracking/{trackingNumber}", trackingNumber)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.trackingNumber").value(trackingNumber))
                .andExpect(jsonPath("$.data.status").value("IN_TRANSIT"))
                .andExpect(jsonPath("$.data.trackingEvents").isArray());
    }

    @Test
    @DisplayName("测试分页查询物流异常接口")
    void testGetLogisticsExceptionPage() throws Exception {
        // 准备测试数据
        List<com.erp.logistics.entity.LogisticsException> exceptions = Arrays.asList(
            createTestLogisticsException("EX001", "包裹丢失"),
            createTestLogisticsException("EX002", "地址错误")
        );
        
        PageResult<com.erp.logistics.entity.LogisticsException> pageResult = new PageResult<>();
        pageResult.setContent(exceptions);
        pageResult.setPage(1L);
        pageResult.setSize(10L);
        pageResult.setTotal(2L);
        pageResult.setTotalPages(1L);
        
        // Mock service行为
        when(logisticsService.getLogisticsExceptionPage(anyLong(), anyLong(), any()))
            .thenReturn(pageResult);
        
        // 执行请求
        mockMvc.perform(get("/api/logistics/exceptions")
                .param("page", "1")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.total").value(2));
    }

    @Test
    @DisplayName("测试创建物流异常接口")
    void testCreateLogisticsException() throws Exception {
        // 准备测试数据
        com.erp.logistics.dto.LogisticsExceptionDTO exceptionDTO = createTestLogisticsExceptionDTO();
        com.erp.logistics.entity.LogisticsException exception = createTestLogisticsException("EX001", "包裹丢失");
        exception.setId(1L);
        
        // Mock service行为
        when(logisticsService.createLogisticsException(any())).thenReturn(exception);
        
        // 执行请求
        mockMvc.perform(post("/api/logistics/exceptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exceptionDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("包裹丢失"));
    }

    @Test
    @DisplayName("测试处理物流异常接口")
    void testHandleLogisticsException() throws Exception {
        // 准备测试数据
        Long exceptionId = 1L;
        String solution = "重新发货";
        String handler = "张三";
        
        com.erp.logistics.entity.LogisticsException handledException = createTestLogisticsException("EX001", "包裹丢失");
        handledException.setId(exceptionId);
        handledException.setSolution(solution);
        handledException.setHandler(handler);
        handledException.setStatus(com.erp.logistics.enums.ExceptionStatus.RESOLVED);
        
        // Mock service行为
        when(logisticsService.handleLogisticsException(exceptionId, solution, handler))
            .thenReturn(handledException);
        
        // 执行请求
        mockMvc.perform(put("/api/logistics/exceptions/{exceptionId}/handle", exceptionId)
                .param("solution", solution)
                .param("handler", handler)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.solution").value(solution))
                .andExpect(jsonPath("$.data.handler").value(handler))
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));
    }

    /**
     * 创建测试用的LogisticsOrderDTO
     */
    private LogisticsOrderDTO createTestLogisticsOrderDTO() {
        LogisticsOrderDTO dto = new LogisticsOrderDTO();
        dto.setBusinessOrderId(1001L);
        dto.setBusinessOrderNo("BO202501010001");
        dto.setLogisticsType(LogisticsType.STANDARD);
        dto.setProviderName("顺丰速运");
        dto.setProviderCode("SF");
        dto.setShippingCost(new BigDecimal("15.50"));
        dto.setServiceLevel("标准快递");
        dto.setRequireSignature(true);
        dto.setInsured(false);
        dto.setRemarks("测试订单");
        return dto;
    }

    /**
     * 创建测试用的LogisticsOrder
     */
    private LogisticsOrder createTestLogisticsOrder(String orderNo, String providerCode, LogisticsStatus status) {
        LogisticsOrder order = new LogisticsOrder();
        order.setLogisticsOrderNo(orderNo);
        order.setBusinessOrderId(1001L);
        order.setBusinessOrderNo("BO202501010001");
        order.setLogisticsType(LogisticsType.STANDARD);
        order.setStatus(status);
        order.setProviderName("测试物流商");
        order.setProviderCode(providerCode);
        order.setShippingCost(new BigDecimal("15.50"));
        order.setCurrency("CNY");
        order.setServiceLevel("标准快递");
        order.setRequireSignature(true);
        order.setInsured(false);
        order.setRemarks("测试订单");
        return order;
    }

    /**
     * 创建测试用的ShippingLabelDTO
     */
    private com.erp.logistics.dto.ShippingLabelDTO createTestShippingLabelDTO(Long logisticsOrderId) {
        com.erp.logistics.dto.ShippingLabelDTO dto = new com.erp.logistics.dto.ShippingLabelDTO();
        dto.setLogisticsOrderId(logisticsOrderId);
        dto.setLabelType("STANDARD");
        dto.setLabelFormat("PDF");
        dto.setLabelSize("100x150");
        dto.setCopies(1);
        dto.setNeedReceipt(false);
        return dto;
    }

    /**
     * 创建测试用的ShippingLabel
     */
    private com.erp.logistics.entity.ShippingLabel createTestShippingLabel(String labelNumber, String trackingNumber) {
        com.erp.logistics.entity.ShippingLabel label = new com.erp.logistics.entity.ShippingLabel();
        label.setLabelNumber(labelNumber);
        label.setTrackingNumber(trackingNumber);
        label.setLogisticsOrderId(1L);
        label.setFormat(com.erp.logistics.enums.LabelFormat.PDF);
        label.setLabelSize("100x150");
        label.setPrintCount(1);
        label.setStatus(com.erp.logistics.enums.LabelStatus.GENERATED);
        label.setPrinted(false);
        label.setLabelUrl("https://labels.example.com/" + labelNumber + ".pdf");
        return label;
    }

    /**
     * 创建测试用的LogisticsExceptionDTO
     */
    private com.erp.logistics.dto.LogisticsExceptionDTO createTestLogisticsExceptionDTO() {
        com.erp.logistics.dto.LogisticsExceptionDTO dto = new com.erp.logistics.dto.LogisticsExceptionDTO();
        dto.setLogisticsOrderId(1L);
        dto.setTrackingNumber("SF1234567890");
        dto.setExceptionType(com.erp.logistics.enums.ExceptionType.PACKAGE_LOST);
        dto.setTitle("包裹丢失");
        dto.setDescription("包裹在运输过程中丢失");
        dto.setLocation("中转站");
        dto.setResponsibleParty("物流公司");
        return dto;
    }

    /**
     * 创建测试用的LogisticsException
     */
    private com.erp.logistics.entity.LogisticsException createTestLogisticsException(String exceptionId, String title) {
        com.erp.logistics.entity.LogisticsException exception = new com.erp.logistics.entity.LogisticsException();
        exception.setLogisticsOrderId(1L);
        exception.setTrackingNumber("SF1234567890");
        exception.setExceptionType(com.erp.logistics.enums.ExceptionType.PACKAGE_LOST);
        exception.setStatus(com.erp.logistics.enums.ExceptionStatus.PENDING);
        exception.setTitle(title);
        exception.setDescription("测试异常描述");
        exception.setLocation("测试地点");
        exception.setResponsibleParty("物流公司");
        return exception;
    }
}