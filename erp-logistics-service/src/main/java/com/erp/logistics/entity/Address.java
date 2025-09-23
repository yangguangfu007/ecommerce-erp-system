package com.erp.logistics.entity;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.logistics.enums.AddressType;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 地址信息实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("addresses")
public class Address extends BaseEntity {

    /**
     * 地址类型
     */
    @EnumValue
    private AddressType addressType;

    /**
     * 联系人姓名
     */
    private String contactName;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 邮箱地址
     */
    private String email;

    /**
     * 公司名称
     */
    private String companyName;

    /**
     * 国家代码
     */
    private String countryCode;

    /**
     * 国家名称
     */
    private String countryName;

    /**
     * 省/州代码
     */
    private String stateCode;

    /**
     * 省/州名称
     */
    private String stateName;

    /**
     * 城市代码
     */
    private String cityCode;

    /**
     * 城市名称
     */
    private String cityName;

    /**
     * 区/县代码
     */
    private String districtCode;

    /**
     * 区/县名称
     */
    private String districtName;

    /**
     * 详细地址
     */
    private String detailAddress;

    /**
     * 邮政编码
     */
    private String postalCode;

    /**
     * 地址标签（如：家、公司、其他）
     */
    private String addressLabel;

    /**
     * 是否为默认地址
     */
    private Boolean isDefault;

    /**
     * 是否已验证
     */
    private Boolean verified;

    /**
     * 纬度
     */
    private Double latitude;

    /**
     * 经度
     */
    private Double longitude;

    /**
     * 备注信息
     */
    private String remarks;

    @Override
    public String getEntityDescription() {
        return "地址(联系人=" + contactName + ", 地址=" + detailAddress + ")";
    }
}