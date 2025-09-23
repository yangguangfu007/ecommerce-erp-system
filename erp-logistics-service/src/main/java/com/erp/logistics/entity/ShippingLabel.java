package com.erp.logistics.entity;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.logistics.enums.LabelFormat;
import com.erp.logistics.enums.LabelStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

/**
 * 面单信息实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("shipping_labels")
public class ShippingLabel extends BaseEntity {

    /**
     * 关联的物流订单ID
     */
    private Long logisticsOrderId;

    /**
     * 面单编号
     */
    private String labelNumber;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 面单状态
     */
    @EnumValue
    private LabelStatus status;

    /**
     * 面单格式
     */
    @EnumValue
    private LabelFormat format;

    /**
     * 面单内容（Base64编码的PDF或图片）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private String labelContent;

    /**
     * 面单URL（如果存储在文件服务器）
     */
    private String labelUrl;

    /**
     * 面单尺寸信息
     */
    private String labelSize;

    /**
     * 打印次数
     */
    private Integer printCount;

    /**
     * 是否已打印
     */
    private Boolean printed;

    /**
     * 面单生成参数（JSON格式存储）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> generateParams;

    /**
     * 备注信息
     */
    private String remarks;

    @Override
    public String getEntityDescription() {
        return "面单(编号=" + labelNumber + ", 运单号=" + trackingNumber + ")";
    }
}