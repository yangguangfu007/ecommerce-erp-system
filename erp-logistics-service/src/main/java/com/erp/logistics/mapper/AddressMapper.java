package com.erp.logistics.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.logistics.entity.Address;
import com.erp.logistics.enums.AddressType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 地址信息数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 *
 * @author ERP System
 */
@Mapper
public interface AddressMapper extends BaseMapperPlus<Address> {

    /**
     * 根据地址类型查询地址列表
     *
     * @param addressType 地址类型
     * @return 地址列表
     */
    @Select("SELECT * FROM addresses WHERE address_type = #{addressType} AND deleted = 0")
    List<Address> selectByAddressType(@Param("addressType") AddressType addressType);

    /**
     * 根据联系人姓名模糊查询地址列表
     *
     * @param contactName 联系人姓名
     * @return 地址列表
     */
    @Select("SELECT * FROM addresses WHERE contact_name LIKE CONCAT('%', #{contactName}, '%') AND deleted = 0")
    List<Address> selectByContactNameLike(@Param("contactName") String contactName);

    /**
     * 根据国家代码查询地址列表
     *
     * @param countryCode 国家代码
     * @return 地址列表
     */
    @Select("SELECT * FROM addresses WHERE country_code = #{countryCode} AND deleted = 0")
    List<Address> selectByCountryCode(@Param("countryCode") String countryCode);

    /**
     * 查询默认地址列表
     *
     * @param addressType 地址类型
     * @return 默认地址列表
     */
    @Select("SELECT * FROM addresses WHERE address_type = #{addressType} AND is_default = 1 AND deleted = 0")
    List<Address> selectDefaultAddresses(@Param("addressType") AddressType addressType);
}