package com.erp.order.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单查询DTO
 *
 * @author ERP System
 */
@Data
public class OrderQueryDTO {

    /**
     * 订单编号
     */
    private String orderId;

    /**
     * 平台订单ID
     */
    private String platformOrderId;

    /**
     * 店铺ID
     */
    private Long storeId;

    /**
     * 店铺ID列表
     */
    private List<Long> storeIds;

    /**
     * 客户姓名
     */
    private String customerName;

    /**
     * 客户邮箱
     */
    private String customerEmail;

    /**
     * 订单状态
     */
    private String status;

    /**
     * 订单状态列表
     */
    private List<String> statuses;

    /**
     * 平台名称
     */
    private String platform;

    /**
     * 支付状态
     */
    private String paymentStatus;

    /**
     * 支付状态列表
     */
    private List<String> paymentStatuses;

    /**
     * 物流单号
     */
    private String trackingNumber;

    /**
     * 下单开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startDate;

    /**
     * 下单结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endDate;

    /**
     * 发货开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime shipDateStart;

    /**
     * 发货结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime shipDateEnd;

    /**
     * SKU编码
     */
    private String sku;

    /**
     * 商品标题关键词
     */
    private String productTitle;

    /**
     * 页码
     */
    private Integer pageNum = 1;

    /**
     * 页大小
     */
    private Integer pageSize = 20;

    /**
     * 最小金额
     */
    private java.math.BigDecimal minAmount;

    /**
     * 最大金额
     */
    private java.math.BigDecimal maxAmount;

    /**
     * 排序字段
     */
    private String orderBy = "order_date";

    /**
     * 排序方向
     */
    private String orderDirection = "DESC";

    /**
     * 查询限制数量
     */
    private Integer limit;
}