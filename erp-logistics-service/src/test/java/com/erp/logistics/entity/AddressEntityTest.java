package com.erp.logistics.entity;

import com.erp.logistics.enums.AddressType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 地址信息实体类测试
 * 验证BaseEntity继承和erp-common配置
 *
 * @author ERP System
 */
@DisplayName("地址信息实体类测试")
class AddressEntityTest {

    @Test
    @DisplayName("测试地址实体类基本属性")
    void testAddressBasicProperties() {
        // 创建地址实例
        Address address = new Address();
        
        // 设置基本属性
        address.setAddressType(AddressType.RECIPIENT);
        address.setContactName("张三");
        address.setContactPhone("13800138000");
        address.setEmail("zhangsan@example.com");
        address.setCompanyName("测试公司");
        address.setCountryCode("CN");
        address.setCountryName("中国");
        address.setStateCode("11");
        address.setStateName("北京市");
        address.setCityCode("1101");
        address.setCityName("北京市");
        address.setDistrictCode("110101");
        address.setDistrictName("东城区");
        address.setDetailAddress("王府井大街1号");
        address.setPostalCode("100006");
        address.setAddressLabel("公司");
        address.setIsDefault(true);
        address.setVerified(true);
        address.setLatitude(39.909187);
        address.setLongitude(116.397451);
        address.setRemarks("测试地址");
        
        // 验证基本属性
        assertThat(address.getAddressType()).isEqualTo(AddressType.RECIPIENT);
        assertThat(address.getContactName()).isEqualTo("张三");
        assertThat(address.getContactPhone()).isEqualTo("13800138000");
        assertThat(address.getEmail()).isEqualTo("zhangsan@example.com");
        assertThat(address.getCompanyName()).isEqualTo("测试公司");
        assertThat(address.getCountryCode()).isEqualTo("CN");
        assertThat(address.getCountryName()).isEqualTo("中国");
        assertThat(address.getStateCode()).isEqualTo("11");
        assertThat(address.getStateName()).isEqualTo("北京市");
        assertThat(address.getCityCode()).isEqualTo("1101");
        assertThat(address.getCityName()).isEqualTo("北京市");
        assertThat(address.getDistrictCode()).isEqualTo("110101");
        assertThat(address.getDistrictName()).isEqualTo("东城区");
        assertThat(address.getDetailAddress()).isEqualTo("王府井大街1号");
        assertThat(address.getPostalCode()).isEqualTo("100006");
        assertThat(address.getAddressLabel()).isEqualTo("公司");
        assertThat(address.getIsDefault()).isTrue();
        assertThat(address.getVerified()).isTrue();
        assertThat(address.getLatitude()).isEqualTo(39.909187);
        assertThat(address.getLongitude()).isEqualTo(116.397451);
        assertThat(address.getRemarks()).isEqualTo("测试地址");
    }

    @Test
    @DisplayName("测试BaseEntity继承的通用字段")
    void testBaseEntityFields() {
        Address address = new Address();
        
        // 测试ID字段
        address.setId(1L);
        assertThat(address.getId()).isEqualTo(1L);
        
        // 测试时间字段
        LocalDateTime now = LocalDateTime.now();
        address.setCreateTime(now);
        address.setUpdateTime(now);
        assertThat(address.getCreateTime()).isEqualTo(now);
        assertThat(address.getUpdateTime()).isEqualTo(now);
        
        // 测试审计字段
        address.setCreateBy(1001L);
        address.setUpdateBy(1002L);
        assertThat(address.getCreateBy()).isEqualTo(1001L);
        assertThat(address.getUpdateBy()).isEqualTo(1002L);
        
        // 测试逻辑删除字段
        address.setDeleted(0);
        assertThat(address.getDeleted()).isEqualTo(0);
        assertThat(address.isLogicallyDeleted()).isFalse();
        
        address.setDeleted(1);
        assertThat(address.getDeleted()).isEqualTo(1);
        assertThat(address.isLogicallyDeleted()).isTrue();
        
        // 测试版本字段（乐观锁）
        address.setVersion(1);
        assertThat(address.getVersion()).isEqualTo(1);
    }

    @Test
    @DisplayName("测试新实体判断方法")
    void testIsNewEntity() {
        Address address = new Address();
        
        // 新实体（ID为空）
        assertThat(address.isNew()).isTrue();
        
        // 已存在的实体（ID不为空）
        address.setId(1L);
        assertThat(address.isNew()).isFalse();
    }

    @Test
    @DisplayName("测试实体描述方法")
    void testEntityDescription() {
        Address address = new Address();
        address.setContactName("张三");
        address.setDetailAddress("王府井大街1号");
        
        String description = address.getEntityDescription();
        assertThat(description).contains("地址");
        assertThat(description).contains("张三");
        assertThat(description).contains("王府井大街1号");
    }

    @Test
    @DisplayName("测试枚举字段处理")
    void testEnumFields() {
        Address address = new Address();
        
        // 测试地址类型枚举
        address.setAddressType(AddressType.SENDER);
        assertThat(address.getAddressType()).isEqualTo(AddressType.SENDER);
        assertThat(address.getAddressType().getCode()).isEqualTo(1);
        assertThat(address.getAddressType().getDescription()).isEqualTo("发件人地址");
        
        // 测试收件人地址
        address.setAddressType(AddressType.RECIPIENT);
        assertThat(address.getAddressType()).isEqualTo(AddressType.RECIPIENT);
        assertThat(address.getAddressType().getCode()).isEqualTo(2);
        assertThat(address.getAddressType().getDescription()).isEqualTo("收件人地址");
        
        // 测试仓库地址
        address.setAddressType(AddressType.WAREHOUSE);
        assertThat(address.getAddressType()).isEqualTo(AddressType.WAREHOUSE);
        assertThat(address.getAddressType().getCode()).isEqualTo(4);
        assertThat(address.getAddressType().getDescription()).isEqualTo("仓库地址");
    }

    @Test
    @DisplayName("测试地理坐标字段")
    void testGeographicFields() {
        Address address = new Address();
        
        // 测试北京坐标
        address.setLatitude(39.909187);
        address.setLongitude(116.397451);
        assertThat(address.getLatitude()).isEqualTo(39.909187);
        assertThat(address.getLongitude()).isEqualTo(116.397451);
        
        // 测试上海坐标
        address.setLatitude(31.230416);
        address.setLongitude(121.473701);
        assertThat(address.getLatitude()).isEqualTo(31.230416);
        assertThat(address.getLongitude()).isEqualTo(121.473701);
        
        // 测试空坐标
        address.setLatitude(null);
        address.setLongitude(null);
        assertThat(address.getLatitude()).isNull();
        assertThat(address.getLongitude()).isNull();
    }

    @Test
    @DisplayName("测试布尔字段处理")
    void testBooleanFields() {
        Address address = new Address();
        
        // 测试默认地址标志
        address.setIsDefault(true);
        assertThat(address.getIsDefault()).isTrue();
        
        address.setIsDefault(false);
        assertThat(address.getIsDefault()).isFalse();
        
        // 测试验证状态
        address.setVerified(true);
        assertThat(address.getVerified()).isTrue();
        
        address.setVerified(false);
        assertThat(address.getVerified()).isFalse();
    }

    @Test
    @DisplayName("测试完整地址信息")
    void testCompleteAddressInfo() {
        Address address = new Address();
        
        // 设置完整的国内地址
        address.setAddressType(AddressType.RECIPIENT);
        address.setContactName("李四");
        address.setContactPhone("13900139000");
        address.setCountryCode("CN");
        address.setCountryName("中国");
        address.setStateCode("31");
        address.setStateName("上海市");
        address.setCityCode("3101");
        address.setCityName("上海市");
        address.setDistrictCode("310101");
        address.setDistrictName("黄浦区");
        address.setDetailAddress("南京东路100号");
        address.setPostalCode("200001");
        
        // 验证完整地址
        assertThat(address.getContactName()).isEqualTo("李四");
        assertThat(address.getCountryName()).isEqualTo("中国");
        assertThat(address.getStateName()).isEqualTo("上海市");
        assertThat(address.getCityName()).isEqualTo("上海市");
        assertThat(address.getDistrictName()).isEqualTo("黄浦区");
        assertThat(address.getDetailAddress()).isEqualTo("南京东路100号");
        assertThat(address.getPostalCode()).isEqualTo("200001");
    }

    @Test
    @DisplayName("测试国际地址信息")
    void testInternationalAddress() {
        Address address = new Address();
        
        // 设置美国地址
        address.setAddressType(AddressType.RECIPIENT);
        address.setContactName("John Smith");
        address.setContactPhone("+1-555-123-4567");
        address.setEmail("john.smith@example.com");
        address.setCountryCode("US");
        address.setCountryName("United States");
        address.setStateCode("CA");
        address.setStateName("California");
        address.setCityName("Los Angeles");
        address.setDetailAddress("123 Main Street");
        address.setPostalCode("90210");
        
        // 验证国际地址
        assertThat(address.getContactName()).isEqualTo("John Smith");
        assertThat(address.getContactPhone()).isEqualTo("+1-555-123-4567");
        assertThat(address.getCountryCode()).isEqualTo("US");
        assertThat(address.getCountryName()).isEqualTo("United States");
        assertThat(address.getStateCode()).isEqualTo("CA");
        assertThat(address.getStateName()).isEqualTo("California");
        assertThat(address.getCityName()).isEqualTo("Los Angeles");
        assertThat(address.getDetailAddress()).isEqualTo("123 Main Street");
        assertThat(address.getPostalCode()).isEqualTo("90210");
    }
}