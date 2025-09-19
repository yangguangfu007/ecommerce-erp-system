package com.erp.common.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.context.UserContext;
import com.erp.common.entity.BaseEntity;
import com.erp.common.util.PageUtils;
import com.erp.common.util.QueryWrapperUtils;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 公共工具类测试
 * 测试各种工具类和基础功能
 *
 * @author ERP System
 */
@DisplayName("公共工具类测试")
class MyBatisPlusConfigTest {

    /**
     * 测试实体类
     */
    @Data
    @EqualsAndHashCode(callSuper = true)
    static class TestEntity extends BaseEntity {
        private String name;
        private Integer status;
        private String description;
    }

    @BeforeEach
    @DisplayName("设置测试环境")
    void setUp() {
        // 设置用户上下文
        UserContext.setUserContext(1L, "testuser", "测试用户");
    }

    @AfterEach
    @DisplayName("清理测试环境")
    void tearDown() {
        // 清除用户上下文
        UserContext.clear();
    }

    @Test
    @DisplayName("测试用户上下文功能")
    void testUserContext() {
        // 测试设置和获取用户信息
        assertEquals(1L, UserContext.getCurrentUserId());
        assertEquals("testuser", UserContext.getCurrentUsername());
        assertEquals("测试用户", UserContext.getCurrentRealName());
        assertTrue(UserContext.hasUserContext());

        // 测试用户信息字符串
        String userInfo = UserContext.getCurrentUserInfo();
        assertNotNull(userInfo);
        assertTrue(userInfo.contains("testuser"));

        // 测试清除上下文
        UserContext.clear();
        assertNull(UserContext.getCurrentUserId());
        assertFalse(UserContext.hasUserContext());
    }

    @Test
    @DisplayName("测试查询构造器工具类")
    void testQueryWrapperUtils() {
        // 测试创建Lambda查询构造器
        LambdaQueryWrapper<TestEntity> wrapper = QueryWrapperUtils.lambdaQuery(TestEntity.class);
        assertNotNull(wrapper);

        // 测试条件构造
        String name = "测试名称";
        Integer status = 1;
        LocalDateTime startTime = LocalDateTime.now().minusDays(1);
        LocalDateTime endTime = LocalDateTime.now();

        QueryWrapperUtils.eqIfPresent(wrapper, TestEntity::getName, name);
        QueryWrapperUtils.eqIfPresent(wrapper, TestEntity::getStatus, status);
        QueryWrapperUtils.betweenTime(wrapper, TestEntity::getCreateTime, startTime, endTime);
        QueryWrapperUtils.orderByDesc(wrapper, TestEntity::getCreateTime);

        // 验证构造器不为空
        assertNotNull(wrapper);
    }

    @Test
    @DisplayName("测试分页工具类")
    void testPageUtils() {
        // 测试创建分页对象
        Page<TestEntity> page = PageUtils.createPage(1L, 10L);
        assertNotNull(page);
        assertEquals(1L, page.getCurrent());
        assertEquals(10L, page.getSize());

        // 测试带排序的分页对象
        Page<TestEntity> pageWithSort = PageUtils.createPage(1L, 10L, "create_time", "desc");
        assertNotNull(pageWithSort);
        assertFalse(pageWithSort.orders().isEmpty());

        // 测试分页参数验证
        assertTrue(PageUtils.isValidPageParams(1L, 10L));
        assertFalse(PageUtils.isValidPageParams(0L, 10L));
        assertFalse(PageUtils.isValidPageParams(1L, 0L));

        // 测试计算总页数
        assertEquals(10L, PageUtils.calculateTotalPages(100L, 10L));
        assertEquals(11L, PageUtils.calculateTotalPages(101L, 10L));

        // 测试计算偏移量
        assertEquals(0L, PageUtils.calculateOffset(1L, 10L));
        assertEquals(10L, PageUtils.calculateOffset(2L, 10L));
    }

    @Test
    @DisplayName("测试BaseEntity功能")
    void testBaseEntity() {
        TestEntity entity = new TestEntity();
        entity.setName("测试实体");
        entity.setStatus(1);
        entity.setDescription("这是一个测试实体");

        // 测试新实体检查
        assertTrue(entity.isNew());

        // 设置ID后不再是新实体
        entity.setId(1L);
        assertFalse(entity.isNew());

        // 测试逻辑删除检查
        assertFalse(entity.isLogicallyDeleted());
        entity.setDeleted(1);
        assertTrue(entity.isLogicallyDeleted());

        // 测试实体描述
        String description = entity.getEntityDescription();
        assertNotNull(description);
        assertTrue(description.contains("TestEntity"));
        assertTrue(description.contains("id=1"));
    }

    @Test
    @DisplayName("测试排序项创建")
    void testOrderItemCreation() {
        // 测试创建升序排序项
        OrderItem ascOrder = PageUtils.asc("create_time");
        assertNotNull(ascOrder);
        assertTrue(ascOrder.isAsc());
        assertEquals("create_time", ascOrder.getColumn());

        // 测试创建降序排序项
        OrderItem descOrder = PageUtils.desc("update_time");
        assertNotNull(descOrder);
        assertFalse(descOrder.isAsc());
        assertEquals("update_time", descOrder.getColumn());

        // 测试创建多个排序项
        List<OrderItem> orderItems = PageUtils.createOrderItems("name:asc", "create_time:desc", "status");
        assertEquals(3, orderItems.size());
        
        assertTrue(orderItems.get(0).isAsc());
        assertEquals("name", orderItems.get(0).getColumn());
        
        assertFalse(orderItems.get(1).isAsc());
        assertEquals("create_time", orderItems.get(1).getColumn());
        
        assertTrue(orderItems.get(2).isAsc()); // 默认升序
        assertEquals("status", orderItems.get(2).getColumn());
    }

    @Test
    @DisplayName("测试空值处理")
    void testNullValueHandling() {
        LambdaQueryWrapper<TestEntity> wrapper = QueryWrapperUtils.lambdaQuery(TestEntity.class);

        // 测试空值不会添加条件
        QueryWrapperUtils.eqIfPresent(wrapper, TestEntity::getName, null);
        QueryWrapperUtils.likeIfPresent(wrapper, TestEntity::getDescription, null);
        QueryWrapperUtils.inIfPresent(wrapper, TestEntity::getStatus, null);

        // 验证构造器仍然可用
        assertNotNull(wrapper);

        // 测试非空值会添加条件
        QueryWrapperUtils.eqIfPresent(wrapper, TestEntity::getStatus, 1);
        assertNotNull(wrapper);
    }

    @Test
    @DisplayName("测试集合条件处理")
    void testCollectionConditions() {
        LambdaQueryWrapper<TestEntity> wrapper = QueryWrapperUtils.lambdaQuery(TestEntity.class);

        // 测试空集合不会添加条件
        QueryWrapperUtils.inIfPresent(wrapper, TestEntity::getStatus, Arrays.asList());
        assertNotNull(wrapper);

        // 测试非空集合会添加条件
        QueryWrapperUtils.inIfPresent(wrapper, TestEntity::getStatus, Arrays.asList(1, 2, 3));
        assertNotNull(wrapper);
    }
}