package com.erp.logistics.service;

import com.erp.logistics.dto.LogisticsOrderRequest;
import com.erp.logistics.dto.ShippingLabelResponse;

/**
 * 面单服务接口
 *
 * @author ERP System
 */
public interface ShippingLabelService {

    /**
     * 为订单生成面单
     *
     * @param orderId 订单ID
     * @return 面单响应
     */
    ShippingLabelResponse generateLabelForOrder(Long orderId);

    /**
     * 根据运单号生成面单
     *
     * @param trackingNumber 运单号
     * @return 面单响应
     */
    ShippingLabelResponse generateLabel(String trackingNumber);

    /**
     * 重新生成面单
     *
     * @param trackingNumber 运单号
     * @return 面单响应
     */
    ShippingLabelResponse regenerateLabel(String trackingNumber);

    /**
     * 获取面单PDF
     *
     * @param trackingNumber 运单号
     * @return PDF的Base64编码
     */
    String getLabelPdf(String trackingNumber);

    /**
     * 打印面单
     *
     * @param trackingNumber 运单号
     * @return 是否成功
     */
    boolean printLabel(String trackingNumber);

    /**
     * 批量生成面单
     *
     * @param trackingNumbers 运单号列表
     * @return 生成结果
     */
    java.util.Map<String, ShippingLabelResponse> batchGenerateLabels(java.util.List<String> trackingNumbers);
}