package com.erp.order.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 地址DTO
 *
 * @author ERP System
 */
@Data
public class AddressDTO {

    /**
     * 街道地址
     */
    @NotBlank(message = "街道地址不能为空")
    @Size(max = 200, message = "街道地址长度不能超过200个字符")
    private String street;

    /**
     * 城市
     */
    @NotBlank(message = "城市不能为空")
    @Size(max = 100, message = "城市长度不能超过100个字符")
    private String city;

    /**
     * 州/省
     */
    @Size(max = 100, message = "州/省长度不能超过100个字符")
    private String state;

    /**
     * 邮政编码
     */
    @Size(max = 20, message = "邮政编码长度不能超过20个字符")
    private String zipCode;

    /**
     * 国家
     */
    @NotBlank(message = "国家不能为空")
    @Size(max = 100, message = "国家长度不能超过100个字符")
    private String country;
}