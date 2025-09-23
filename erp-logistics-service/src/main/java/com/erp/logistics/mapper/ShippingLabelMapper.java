package com.erp.logistics.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.logistics.entity.ShippingLabel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 面单信息数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 *
 * @author ERP System
 */
@Mapper
public interface ShippingLabelMapper extends BaseMapperPlus<ShippingLabel> {

    /**
     * 根据物流订单ID查询面单列表
     *
     * @param logisticsOrderId 物流订单ID
     * @return 面单列表
     */
    @Select("SELECT * FROM shipping_labels WHERE logistics_order_id = #{logisticsOrderId} AND deleted = 0")
    List<ShippingLabel> selectByLogisticsOrderId(@Param("logisticsOrderId") Long logisticsOrderId);

    /**
     * 根据运单号查询面单信息
     *
     * @param trackingNumber 运单号
     * @return 面单信息
     */
    @Select("SELECT * FROM shipping_labels WHERE tracking_number = #{trackingNumber} AND deleted = 0 LIMIT 1")
    ShippingLabel selectByTrackingNumber(@Param("trackingNumber") String trackingNumber);

    /**
     * 根据面单编号查询面单信息
     *
     * @param labelNumber 面单编号
     * @return 面单信息
     */
    @Select("SELECT * FROM shipping_labels WHERE label_number = #{labelNumber} AND deleted = 0 LIMIT 1")
    ShippingLabel selectByLabelNumber(@Param("labelNumber") String labelNumber);
}