package com.erp.logistics.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.logistics.enums.ExceptionStatus;
import com.erp.logistics.enums.ExceptionType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 物流异常实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("logistics_exceptions")
public class LogisticsException extends BaseEntity {

    /**
     * 关联的物流订单ID
     */
    @TableField("logistics_order_id")
    private Long logisticsOrderId;

    /**
     * 运单号
     */
    @TableField("tracking_number")
    private String trackingNumber;

    /**
     * 异常类型
     */
    @TableField("exception_type")
    private ExceptionType exceptionType;

    /**
     * 异常状态
     */
    @TableField("status")
    private ExceptionStatus status;

    /**
     * 异常标题
     */
    @TableField("title")
    private String title;

    /**
     * 异常描述
     */
    @TableField("description")
    private String description;

    /**
     * 发生时间
     */
    @TableField("occurred_time")
    private LocalDateTime occurredTime;

    /**
     * 发生地点
     */
    @TableField("location")
    private String location;

    /**
     * 责任方
     */
    @TableField("responsible_party")
    private String responsibleParty;

    /**
     * 处理方案
     */
    @TableField("solution")
    private String solution;

    /**
     * 处理人员
     */
    @TableField("handler")
    private String handler;

    /**
     * 处理时间
     */
    @TableField("handled_time")
    private LocalDateTime handledTime;

    /**
     * 处理结果
     */
    @TableField("result")
    private String result;

    /**
     * 备注信息
     */
    @TableField("remarks")
    private String remarks;

    /**
     * 扩展信息（JSON格式存储）
     */
    @TableField(value = "extend_info", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> extendInfo;
}