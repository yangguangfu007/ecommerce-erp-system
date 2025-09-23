package com.erp.logistics.entity;

import com.erp.logistics.enums.AddressType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 地址信息实体类测试
 *
 * @author ERP System
 */
@DisplayName("地址信息实体类测试")
class AddressTest {

    @Test
    @DisplayName("测试地址实体类基本功能")
    void testAddressBasicFunctions() {
        // 创建地址实例
        Address address = new Address();
        
        // 设置基本属性
        address.setAddressType(AddressType.SENDER);
        address.setContactName("张三");
        address.setContactPhone("13800138000");
        address.setEmail("zhangsan@example.com");
        address.setCompanyName("测试公司");
        address.setCountryCode("CN");
        address.setCountryName("中国");
        address.setStateCode("GD");
        address.setStateName("广东省");
        address.setCityCode("SZ");
        address.setCityName("深圳市");
        address.setDistrictCode("NS");
        address.setDistrictName("南山区");
        address.setDetailAddress("科技园南区");
        address.setPostalCode("518000");
        address.setAddressLabel("公司");
        address.setIsDefault(true);
        address.setVerified(true);
        address.setLatitude(22.5431);
        address.setLongitude(113.9434);
        address.setRemarks("发件人默认地址");

        // 验证基本属性
        assertThat(address.getAddressType()).isEqualTo(AddressType.SENDER);
        assertThat(address.getContactName()).isEqualTo("张三");
        assertThat(address.getContactPhone()).isEqualTo("13800138000");
        assertThat(address.getEmail()).isEqualTo("zhangsan@example.com");
        assertThat(address.getCompanyName()).isEqualTo("测试公司");
        assertThat(address.getCountryCode()).isEqualTo("CN");
        assertThat(address.getCountryName()).isEqualTo("中国");
        assertThat(address.getStateCode()).isEqualTo("GD");
        assertThat(address.getStateName()).isEqualTo("广东省");
        assertThat(address.getCityCode()).isEqualTo("SZ");
        assertThat(address.getCityName()).isEqualTo("深圳市");
        assertThat(address.getDistrictCode()).isEqualTo("NS");
        assertThat(address.getDistrictName()).isEqualTo("南山区");
        assertThat(address.getDetailAddress()).isEqualTo("科技园南区");
        assertThat(address.getPostalCode()).isEqualTo("518000");
        assertThat(address.getAddressLabel()).isEqualTo("公司");
        assertThat(address.getIsDefault()).isTrue();
        assertThat(address.getVerified()).isTrue();
        assertThat(address.getLatitude()).isEqualTo(22.5431);
        assertThat(address.getLongitude()).isEqualTo(113.9434);
        assertThat(address.getRemarks()).isEqualTo("发件人默认地址");
    }

    @Test
    @DisplayName("测试继承BaseEntity的功能")
    void testBaseEntityFunctions() {
        Address address = new Address();
        
        // 测试新实体检查
        assertThat(address.isNew()).isTrue();
        
        // 设置ID后不再是新实体
        address.setId(1L);
        assertThat(address.isNew()).isFalse();
        
        // 测试逻辑删除检查
        assertThat(address.isLogicallyDeleted()).isFalse();
        
        address.setDeleted(1);
        assertThat(address.isLogicallyDeleted()).isTrue();
        
        // 测试实体描述
        address.setContactName("张三");
        address.setDetailAddress("深圳市南山区科技园");
        String description = address.getEntityDescription();
        assertThat(description).contains("地址");
        assertThat(description).contains("张三");
        assertThat(description).contains("深圳市南山区科技园");
    }

    @Test
    @DisplayName("测试不同地址类型")
    void testAddressTypes() {
        Address address = new Address();
        
        // 测试发件人地址
        address.setAddressType(AddressType.SENDER);
        assertThat(address.getAddressType()).isEqualTo(AddressType.SENDER);
        
        // 测试收件人地址
        address.setAddressType(AddressType.RECIPIENT);
        assertThat(address.getAddressType()).isEqualTo(AddressType.RECIPIENT);
        
        // 测试退货地址
        address.setAddressType(AddressType.RETURN);
        assertThat(address.getAddressType()).isEqualTo(AddressType.RETURN);
        
        // 测试仓库地址
        address.setAddressType(AddressType.WAREHOUSE);
        assertThat(address.getAddressType()).isEqualTo(AddressType.WAREHOUSE);
        
        // 测试门店地址
        address.setAddressType(AddressType.STORE);
        assertThat(address.getAddressType()).isEqualTo(AddressType.STORE);
    }

    @Test
    @DisplayName("测试国际地址")
    void testInternationalAddress() {
        Address address = new Address();
        
        // 设置美国地址
        address.setAddressType(AddressType.RECIPIENT);
        address.setContactName("John Smith");
        address.setContactPhone("+1-555-0123");
        address.setEmail("john.smith@example.com");
        address.setCompanyName("Test Company");
        address.setCountryCode("US");
        address.setCountryName("美国");
        address.setStateName("California");
        address.setCityName("Los Angeles");
        address.setDetailAddress("123 Main Street");
        address.setPostalCode("90210");
        address.setAddressLabel("家");
        address.setIsDefault(false);
        address.setVerified(true);

        // 验证国际地址属性
        assertThat(address.getContactName()).isEqualTo("John Smith");
        assertThat(address.getContactPhone()).isEqualTo("+1-555-0123");
        assertThat(address.getCountryCode()).isEqualTo("US");
        assertThat(address.getCountryName()).isEqualTo("美国");
        assertThat(address.getStateName()).isEqualTo("California");
        assertThat(address.getCityName()).isEqualTo("Los Angeles");
        assertThat(address.getDetailAddress()).isEqualTo("123 Main Street");
        assertThat(address.getPostalCode()).isEqualTo("90210");
    }

    @Test
    @DisplayName("测试地址验证状态")
    void testAddressVerification() {
        Address address = new Address();
        
        // 初始状态未验证
        address.setVerified(false);
        assertThat(address.getVerified()).isFalse();
        
        // 验证地址
        address.setVerified(true);
        assertThat(address.getVerified()).isTrue();
    }

    @Test
    @DisplayName("测试默认地址设置")
    void testDefaultAddress() {
        Address address = new Address();
        
        // 初始状态非默认
        address.setIsDefault(false);
        assertThat(address.getIsDefault()).isFalse();
        
        // 设置为默认地址
        address.setIsDefault(true);
        assertThat(address.getIsDefault()).isTrue();
    }
}