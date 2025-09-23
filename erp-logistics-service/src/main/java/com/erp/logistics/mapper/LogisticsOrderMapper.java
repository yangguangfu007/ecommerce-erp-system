package com.erp.logistics.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.logistics.entity.LogisticsOrder;
import org.apache.ibatis.annotations.Mapper;

/**
 * 物流订单数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 *
 * @author ERP System
 */
@Mapper
public interface LogisticsOrderMapper extends BaseMapperPlus<LogisticsOrder> {

}