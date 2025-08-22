package com.erp.common.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BaseEntity 基础实体类测试
 * 测试基础实体类的字段映射和注解配置
 *
 * @author ERP System
 */
@DisplayName("基础实体类测试")
class BaseEntityTest {

    @Test
    @DisplayName("测试BaseEntity字段存在性")
    void testBaseEntityFields() throws NoSuchFieldException {
        // 验证id字段存在
        Field idField = BaseEntity.class.getDeclaredField("id");
        assertNotNull(idField, "id字段应该存在");
        assertEquals(Long.class, idField.getType(), "id字段类型应该是Long");

        // 验证createTime字段存在
        Field createTimeField = BaseEntity.class.getDeclaredField("createTime");
        assertNotNull(createTimeField, "createTime字段应该存在");
        assertEquals(LocalDateTime.class, createTimeField.getType(), "createTime字段类型应该是LocalDateTime");

        // 验证updateTime字段存在
        Field updateTimeField = BaseEntity.class.getDeclaredField("updateTime");
        assertNotNull(updateTimeField, "updateTime字段应该存在");
        assertEquals(LocalDateTime.class, updateTimeField.getType(), "updateTime字段类型应该是LocalDateTime");
    }

    @Test
    @DisplayName("测试createTime字段的数据库映射注解")
    void testCreateTimeTableFieldAnnotation() throws NoSuchFieldException {
        Field createTimeField = BaseEntity.class.getDeclaredField("createTime");
        
        // 验证@TableField注解存在
        assertTrue(createTimeField.isAnnotationPresent(TableField.class), 
                "createTime字段应该有@TableField注解");
        
        TableField tableField = createTimeField.getAnnotation(TableField.class);
        
        // 验证数据库字段名映射
        assertEquals("create_time", tableField.value(), 
                "createTime字段应该映射到数据库的create_time字段");
        
        // 验证自动填充策略
        assertEquals(FieldFill.INSERT, tableField.fill(), 
                "createTime字段应该在插入时自动填充");
    }

    @Test
    @DisplayName("测试updateTime字段的数据库映射注解")
    void testUpdateTimeTableFieldAnnotation() throws NoSuchFieldException {
        Field updateTimeField = BaseEntity.class.getDeclaredField("updateTime");
        
        // 验证@TableField注解存在
        assertTrue(updateTimeField.isAnnotationPresent(TableField.class), 
                "updateTime字段应该有@TableField注解");
        
        TableField tableField = updateTimeField.getAnnotation(TableField.class);
        
        // 验证数据库字段名映射
        assertEquals("update_time", tableField.value(), 
                "updateTime字段应该映射到数据库的update_time字段");
        
        // 验证自动填充策略
        assertEquals(FieldFill.INSERT_UPDATE, tableField.fill(), 
                "updateTime字段应该在插入和更新时自动填充");
    }

    @Test
    @DisplayName("测试时间字段的JSON格式化注解")
    void testTimeFieldsJsonFormatAnnotation() throws NoSuchFieldException {
        Field createTimeField = BaseEntity.class.getDeclaredField("createTime");
        Field updateTimeField = BaseEntity.class.getDeclaredField("updateTime");
        
        // 验证createTime的@JsonFormat注解
        assertTrue(createTimeField.isAnnotationPresent(JsonFormat.class), 
                "createTime字段应该有@JsonFormat注解");
        JsonFormat createTimeFormat = createTimeField.getAnnotation(JsonFormat.class);
        assertEquals("yyyy-MM-dd HH:mm:ss", createTimeFormat.pattern(), 
                "createTime字段的JSON格式应该是yyyy-MM-dd HH:mm:ss");
        
        // 验证updateTime的@JsonFormat注解
        assertTrue(updateTimeField.isAnnotationPresent(JsonFormat.class), 
                "updateTime字段应该有@JsonFormat注解");
        JsonFormat updateTimeFormat = updateTimeField.getAnnotation(JsonFormat.class);
        assertEquals("yyyy-MM-dd HH:mm:ss", updateTimeFormat.pattern(), 
                "updateTime字段的JSON格式应该是yyyy-MM-dd HH:mm:ss");
    }

    @Test
    @DisplayName("测试BaseEntity实例化和基本功能")
    void testBaseEntityInstantiation() {
        // 创建一个继承BaseEntity的测试类实例
        TestEntity testEntity = new TestEntity();
        
        // 验证初始状态
        assertNull(testEntity.getId(), "新创建的实体id应该为null");
        assertNull(testEntity.getCreateTime(), "新创建的实体createTime应该为null");
        assertNull(testEntity.getUpdateTime(), "新创建的实体updateTime应该为null");
        
        // 设置值并验证
        testEntity.setId(1L);
        LocalDateTime now = LocalDateTime.now();
        testEntity.setCreateTime(now);
        testEntity.setUpdateTime(now);
        
        assertEquals(1L, testEntity.getId(), "设置的id值应该正确");
        assertEquals(now, testEntity.getCreateTime(), "设置的createTime值应该正确");
        assertEquals(now, testEntity.getUpdateTime(), "设置的updateTime值应该正确");
    }

    @Test
    @DisplayName("测试BaseEntity的toString方法")
    void testBaseEntityToString() {
        TestEntity testEntity = new TestEntity();
        testEntity.setId(1L);
        testEntity.setCreateTime(LocalDateTime.of(2024, 1, 1, 12, 0, 0));
        testEntity.setUpdateTime(LocalDateTime.of(2024, 1, 1, 12, 30, 0));
        
        String toString = testEntity.toString();
        assertNotNull(toString, "toString方法不应该返回null");
        assertTrue(toString.contains("id=1"), "toString应该包含id信息");
    }

    /**
     * 测试用的BaseEntity子类
     */
    private static class TestEntity extends BaseEntity {
        // 测试用的简单实体类
    }
}