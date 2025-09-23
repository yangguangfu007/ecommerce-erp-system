package com.erp.logistics.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.logistics.dto.*;
import com.erp.logistics.entity.LogisticsOrder;
import com.erp.logistics.entity.ShippingLabel;
import com.erp.logistics.entity.LogisticsException;

import java.util.List;

/**
 * 物流服务接口
 * 继承BaseServicePlus获得增强的业务方法
 *
 * @author ERP System
 */
public interface LogisticsService extends BaseServicePlus<LogisticsOrder> {

    /**
     * 创建物流订单
     *
     * @param logisticsOrderDTO 物流订单DTO
     * @return 创建的物流订单
     */
    LogisticsOrder createLogisticsOrder(LogisticsOrderDTO logisticsOrderDTO);

    /**
     * 更新物流订单
     *
     * @param id 物流订单ID
     * @param logisticsOrderDTO 物流订单DTO
     * @return 更新后的物流订单
     */
    LogisticsOrder updateLogisticsOrder(Long id, LogisticsOrderDTO logisticsOrderDTO);

    /**
     * 分页查询物流订单
     *
     * @param page 页码
     * @param size 每页大小
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<LogisticsOrder> getLogisticsOrderPage(Long page, Long size, LogisticsOrderQueryDTO queryDTO);

    /**
     * 根据业务订单ID查询物流订单
     *
     * @param businessOrderId 业务订单ID
     * @return 物流订单列表
     */
    LogisticsOrder getLogisticsOrderByBusinessOrderId(Long businessOrderId);

    /**
     * 根据运单号查询物流订单
     *
     * @param trackingNumber 运单号
     * @return 物流订单
     */
    LogisticsOrder getLogisticsOrderByTrackingNumber(String trackingNumber);

    /**
     * 批量更新物流状态
     *
     * @param trackingNumbers 运单号列表
     * @param status 新状态
     * @return 更新数量
     */
    int batchUpdateStatus(java.util.List<String> trackingNumbers, com.erp.logistics.enums.LogisticsStatus status);

    /**
     * 批量生成面单
     *
     * @param shippingLabelDTOs 面单DTO列表
     * @return 生成的面单列表
     */
    List<ShippingLabel> batchGenerateLabels(List<ShippingLabelDTO> shippingLabelDTOs);

    /**
     * 获取物流跟踪信息
     *
     * @param trackingNumber 运单号
     * @return 物流跟踪信息
     */
    java.util.Map<String, Object> getTrackingInfo(String trackingNumber);

    /**
     * 分页查询物流异常
     *
     * @param page 页码
     * @param size 每页大小
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<LogisticsException> getLogisticsExceptionPage(Long page, Long size, LogisticsExceptionQueryDTO queryDTO);

    /**
     * 创建物流异常
     *
     * @param exceptionDTO 异常DTO
     * @return 创建的异常记录
     */
    LogisticsException createLogisticsException(LogisticsExceptionDTO exceptionDTO);

    /**
     * 处理物流异常
     *
     * @param exceptionId 异常ID
     * @param solution 处理方案
     * @param handler 处理人员
     * @return 处理结果
     */
    LogisticsException handleLogisticsException(Long exceptionId, String solution, String handler);
}