package com.erp.logistics.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.logistics.entity.Address;
import com.erp.logistics.enums.AddressType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 地址信息Mapper层测试
 * 测试BaseMapperPlus的增强方法和自定义查询方法
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/test-schema.sql")
@DisplayName("地址信息Mapper层测试")
class AddressMapperTest {

    @Autowired
    private AddressMapper addressMapper;

    @Test
    @DisplayName("测试BaseMapperPlus基本CRUD操作")
    void testBasicCrudOperations() {
        // 创建地址
        Address address = createTestAddress();
        
        // 测试插入
        int insertResult = addressMapper.insert(address);
        assertThat(insertResult).isEqualTo(1);
        assertThat(address.getId()).isNotNull();
        
        // 测试根据ID查询
        Address foundAddress = addressMapper.selectById(address.getId());
        assertThat(foundAddress).isNotNull();
        assertThat(foundAddress.getContactName()).isEqualTo("张三");
        assertThat(foundAddress.getDetailAddress()).isEqualTo("王府井大街1号");
        
        // 测试更新
        foundAddress.setContactPhone("13800138001");
        foundAddress.setVerified(true);
        int updateResult = addressMapper.updateById(foundAddress);
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        Address updatedAddress = addressMapper.selectById(address.getId());
        assertThat(updatedAddress.getContactPhone()).isEqualTo("13800138001");
        assertThat(updatedAddress.getVerified()).isTrue();
        
        // 测试删除
        int deleteResult = addressMapper.deleteById(address.getId());
        assertThat(deleteResult).isEqualTo(1);
        
        // 验证逻辑删除
        Address deletedAddress = addressMapper.selectById(address.getId());
        assertThat(deletedAddress).isNull(); // 逻辑删除后查询不到
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 插入测试数据
        Address senderAddress1 = createTestAddress();
        senderAddress1.setAddressType(AddressType.SENDER);
        senderAddress1.setContactName("张三");
        senderAddress1.setCountryCode("CN");
        senderAddress1.setIsDefault(true);
        addressMapper.insert(senderAddress1);
        
        Address senderAddress2 = createTestAddress();
        senderAddress2.setAddressType(AddressType.SENDER);
        senderAddress2.setContactName("李四");
        senderAddress2.setCountryCode("CN");
        senderAddress2.setIsDefault(false);
        addressMapper.insert(senderAddress2);
        
        Address recipientAddress = createTestAddress();
        recipientAddress.setAddressType(AddressType.RECIPIENT);
        recipientAddress.setContactName("王五");
        recipientAddress.setCountryCode("US");
        recipientAddress.setIsDefault(true);
        addressMapper.insert(recipientAddress);
        
        // 测试根据地址类型查询
        List<Address> senderAddresses = addressMapper.selectByAddressType(AddressType.SENDER);
        assertThat(senderAddresses).hasSize(2);
        assertThat(senderAddresses).allMatch(addr -> addr.getAddressType() == AddressType.SENDER);
        
        List<Address> recipientAddresses = addressMapper.selectByAddressType(AddressType.RECIPIENT);
        assertThat(recipientAddresses).hasSize(1);
        assertThat(recipientAddresses.get(0).getContactName()).isEqualTo("王五");
        
        // 测试根据联系人姓名模糊查询
        List<Address> zhangAddresses = addressMapper.selectByContactNameLike("张");
        assertThat(zhangAddresses).hasSize(1);
        assertThat(zhangAddresses.get(0).getContactName()).isEqualTo("张三");
        
        List<Address> allNameAddresses = addressMapper.selectByContactNameLike("");
        assertThat(allNameAddresses).hasSize(3); // 空字符串应该匹配所有
        
        // 测试根据国家代码查询
        List<Address> cnAddresses = addressMapper.selectByCountryCode("CN");
        assertThat(cnAddresses).hasSize(2);
        assertThat(cnAddresses).allMatch(addr -> "CN".equals(addr.getCountryCode()));
        
        List<Address> usAddresses = addressMapper.selectByCountryCode("US");
        assertThat(usAddresses).hasSize(1);
        assertThat(usAddresses.get(0).getCountryCode()).isEqualTo("US");
        
        // 测试查询默认地址
        List<Address> defaultSenderAddresses = addressMapper.selectDefaultAddresses(AddressType.SENDER);
        assertThat(defaultSenderAddresses).hasSize(1);
        assertThat(defaultSenderAddresses.get(0).getContactName()).isEqualTo("张三");
        assertThat(defaultSenderAddresses.get(0).getIsDefault()).isTrue();
        
        List<Address> defaultRecipientAddresses = addressMapper.selectDefaultAddresses(AddressType.RECIPIENT);
        assertThat(defaultRecipientAddresses).hasSize(1);
        assertThat(defaultRecipientAddresses.get(0).getContactName()).isEqualTo("王五");
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具类")
    void testQueryWrapperUtils() {
        // 插入测试数据
        Address address1 = createTestAddress();
        address1.setContactName("张三");
        address1.setAddressType(AddressType.SENDER);
        address1.setCityName("北京市");
        address1.setIsDefault(true);
        addressMapper.insert(address1);
        
        Address address2 = createTestAddress();
        address2.setContactName("李四");
        address2.setAddressType(AddressType.RECIPIENT);
        address2.setCityName("上海市");
        address2.setIsDefault(false);
        addressMapper.insert(address2);
        
        // 测试eqIfPresent方法
        LambdaQueryWrapper<Address> wrapper = QueryWrapperUtils.lambdaQuery(Address.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Address::getAddressType, AddressType.SENDER);
        List<Address> senderAddresses = addressMapper.selectList(wrapper);
        assertThat(senderAddresses).hasSize(1);
        assertThat(senderAddresses.get(0).getAddressType()).isEqualTo(AddressType.SENDER);
        
        // 测试likeIfPresent方法
        wrapper = QueryWrapperUtils.lambdaQuery(Address.class);
        QueryWrapperUtils.likeIfPresent(wrapper, Address::getContactName, "张");
        List<Address> zhangAddresses = addressMapper.selectList(wrapper);
        assertThat(zhangAddresses).hasSize(1);
        assertThat(zhangAddresses.get(0).getContactName()).contains("张");
        
        // 测试多条件组合查询
        wrapper = QueryWrapperUtils.lambdaQuery(Address.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Address::getAddressType, AddressType.SENDER);
        QueryWrapperUtils.eqIfPresent(wrapper, Address::getIsDefault, true);
        List<Address> defaultSenderAddresses = addressMapper.selectList(wrapper);
        assertThat(defaultSenderAddresses).hasSize(1);
        assertThat(defaultSenderAddresses.get(0).getContactName()).isEqualTo("张三");
        
        // 测试空值条件（不应该添加到查询中）
        wrapper = QueryWrapperUtils.lambdaQuery(Address.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Address::getContactName, null);
        QueryWrapperUtils.likeIfPresent(wrapper, Address::getCityName, "");
        List<Address> allAddresses = addressMapper.selectList(wrapper);
        assertThat(allAddresses).hasSize(2); // 空条件应该返回所有数据
    }

    @Test
    @DisplayName("测试地理坐标字段")
    void testGeographicFields() {
        // 创建包含地理坐标的地址
        Address beijingAddress = createTestAddress();
        beijingAddress.setContactName("北京用户");
        beijingAddress.setCityName("北京市");
        beijingAddress.setLatitude(39.909187);
        beijingAddress.setLongitude(116.397451);
        addressMapper.insert(beijingAddress);
        
        Address shanghaiAddress = createTestAddress();
        shanghaiAddress.setContactName("上海用户");
        shanghaiAddress.setCityName("上海市");
        shanghaiAddress.setLatitude(31.230416);
        shanghaiAddress.setLongitude(121.473701);
        addressMapper.insert(shanghaiAddress);
        
        Address noCoordAddress = createTestAddress();
        noCoordAddress.setContactName("无坐标用户");
        noCoordAddress.setCityName("广州市");
        // 不设置坐标
        addressMapper.insert(noCoordAddress);
        
        // 查询并验证坐标
        Address foundBeijing = addressMapper.selectById(beijingAddress.getId());
        assertThat(foundBeijing.getLatitude()).isEqualTo(39.909187);
        assertThat(foundBeijing.getLongitude()).isEqualTo(116.397451);
        
        Address foundShanghai = addressMapper.selectById(shanghaiAddress.getId());
        assertThat(foundShanghai.getLatitude()).isEqualTo(31.230416);
        assertThat(foundShanghai.getLongitude()).isEqualTo(121.473701);
        
        Address foundNoCoord = addressMapper.selectById(noCoordAddress.getId());
        assertThat(foundNoCoord.getLatitude()).isNull();
        assertThat(foundNoCoord.getLongitude()).isNull();
        
        // 测试坐标范围查询
        LambdaQueryWrapper<Address> coordWrapper = new LambdaQueryWrapper<>();
        coordWrapper.isNotNull(Address::getLatitude)
                   .isNotNull(Address::getLongitude);
        List<Address> coordAddresses = addressMapper.selectList(coordWrapper);
        assertThat(coordAddresses).hasSize(2);
        
        // 测试纬度范围查询（北京纬度范围）
        LambdaQueryWrapper<Address> latWrapper = new LambdaQueryWrapper<>();
        latWrapper.between(Address::getLatitude, 39.0, 40.0);
        List<Address> beijingAreaAddresses = addressMapper.selectList(latWrapper);
        assertThat(beijingAreaAddresses).hasSize(1);
        assertThat(beijingAreaAddresses.get(0).getCityName()).isEqualTo("北京市");
    }

    @Test
    @DisplayName("测试国际地址处理")
    void testInternationalAddresses() {
        // 创建中国地址
        Address cnAddress = createTestAddress();
        cnAddress.setContactName("中国用户");
        cnAddress.setCountryCode("CN");
        cnAddress.setCountryName("中国");
        cnAddress.setStateName("北京市");
        cnAddress.setCityName("北京市");
        cnAddress.setDistrictName("东城区");
        cnAddress.setPostalCode("100006");
        addressMapper.insert(cnAddress);
        
        // 创建美国地址
        Address usAddress = createTestAddress();
        usAddress.setContactName("John Smith");
        usAddress.setCountryCode("US");
        usAddress.setCountryName("United States");
        usAddress.setStateCode("CA");
        usAddress.setStateName("California");
        usAddress.setCityName("Los Angeles");
        usAddress.setDistrictName(null); // 美国可能没有区县概念
        usAddress.setPostalCode("90210");
        addressMapper.insert(usAddress);
        
        // 创建英国地址
        Address ukAddress = createTestAddress();
        ukAddress.setContactName("Jane Doe");
        ukAddress.setCountryCode("GB");
        ukAddress.setCountryName("United Kingdom");
        ukAddress.setStateName("England");
        ukAddress.setCityName("London");
        ukAddress.setPostalCode("SW1A 1AA");
        addressMapper.insert(ukAddress);
        
        // 测试按国家查询
        List<Address> cnAddresses = addressMapper.selectByCountryCode("CN");
        assertThat(cnAddresses).hasSize(1);
        assertThat(cnAddresses.get(0).getCountryName()).isEqualTo("中国");
        
        List<Address> usAddresses = addressMapper.selectByCountryCode("US");
        assertThat(usAddresses).hasSize(1);
        assertThat(usAddresses.get(0).getStateName()).isEqualTo("California");
        
        // 测试邮编格式
        LambdaQueryWrapper<Address> postalWrapper = new LambdaQueryWrapper<>();
        postalWrapper.like(Address::getPostalCode, "SW1A");
        List<Address> ukAddresses = addressMapper.selectList(postalWrapper);
        assertThat(ukAddresses).hasSize(1);
        assertThat(ukAddresses.get(0).getCountryCode()).isEqualTo("GB");
        
        // 测试联系人姓名查询（支持中英文）
        List<Address> johnAddresses = addressMapper.selectByContactNameLike("John");
        assertThat(johnAddresses).hasSize(1);
        assertThat(johnAddresses.get(0).getCountryCode()).isEqualTo("US");
        
        List<Address> chineseAddresses = addressMapper.selectByContactNameLike("中国");
        assertThat(chineseAddresses).hasSize(1);
        assertThat(chineseAddresses.get(0).getCountryCode()).isEqualTo("CN");
    }

    @Test
    @DisplayName("测试地址验证和默认标志")
    void testAddressVerificationAndDefault() {
        // 创建不同验证状态的地址
        Address verifiedAddress = createTestAddress();
        verifiedAddress.setContactName("已验证用户");
        verifiedAddress.setVerified(true);
        verifiedAddress.setIsDefault(true);
        addressMapper.insert(verifiedAddress);
        
        Address unverifiedAddress = createTestAddress();
        unverifiedAddress.setContactName("未验证用户");
        unverifiedAddress.setVerified(false);
        unverifiedAddress.setIsDefault(false);
        addressMapper.insert(unverifiedAddress);
        
        // 测试查询已验证地址
        LambdaQueryWrapper<Address> verifiedWrapper = new LambdaQueryWrapper<>();
        verifiedWrapper.eq(Address::getVerified, true);
        List<Address> verifiedAddresses = addressMapper.selectList(verifiedWrapper);
        assertThat(verifiedAddresses).hasSize(1);
        assertThat(verifiedAddresses.get(0).getContactName()).isEqualTo("已验证用户");
        
        // 测试查询未验证地址
        LambdaQueryWrapper<Address> unverifiedWrapper = new LambdaQueryWrapper<>();
        unverifiedWrapper.eq(Address::getVerified, false);
        List<Address> unverifiedAddresses = addressMapper.selectList(unverifiedWrapper);
        assertThat(unverifiedAddresses).hasSize(1);
        assertThat(unverifiedAddresses.get(0).getContactName()).isEqualTo("未验证用户");
        
        // 测试查询默认地址
        LambdaQueryWrapper<Address> defaultWrapper = new LambdaQueryWrapper<>();
        defaultWrapper.eq(Address::getIsDefault, true);
        List<Address> defaultAddresses = addressMapper.selectList(defaultWrapper);
        assertThat(defaultAddresses).hasSize(1);
        assertThat(defaultAddresses.get(0).getVerified()).isTrue();
        
        // 测试组合查询：已验证且为默认的地址
        LambdaQueryWrapper<Address> combinedWrapper = new LambdaQueryWrapper<>();
        combinedWrapper.eq(Address::getVerified, true)
                     .eq(Address::getIsDefault, true);
        List<Address> verifiedDefaultAddresses = addressMapper.selectList(combinedWrapper);
        assertThat(verifiedDefaultAddresses).hasSize(1);
        assertThat(verifiedDefaultAddresses.get(0).getContactName()).isEqualTo("已验证用户");
    }

    /**
     * 创建测试用的地址
     */
    private Address createTestAddress() {
        Address address = new Address();
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
        address.setIsDefault(false);
        address.setVerified(false);
        address.setRemarks("测试地址");
        return address;
    }
}