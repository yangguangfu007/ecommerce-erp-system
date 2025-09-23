package com.erp.logistics.enums;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 物流状态枚举测试
 *
 * @author ERP System
 */
@DisplayName("物流状态枚举测试")
class LogisticsStatusTest {

    @Test
    @DisplayName("测试枚举基本功能")
    void testEnumBasicFunctions() {
        // 测试枚举值
        assertThat(LogisticsStatus.PENDING.getCode()).isEqualTo(0);
        assertThat(LogisticsStatus.PENDING.getDescription()).isEqualTo("待处理");
        
        assertThat(LogisticsStatus.CREATED.getCode()).isEqualTo(1);
        assertThat(LogisticsStatus.CREATED.getDescription()).isEqualTo("已创建");
        
        assertThat(LogisticsStatus.DELIVERED.getCode()).isEqualTo(6);
        assertThat(LogisticsStatus.DELIVERED.getDescription()).isEqualTo("已签收");
        
        assertThat(LogisticsStatus.CANCELLED.getCode()).isEqualTo(9);
        assertThat(LogisticsStatus.CANCELLED.getDescription()).isEqualTo("已取消");
    }

    @Test
    @DisplayName("测试EnumValue接口实现")
    void testEnumValueInterface() {
        // 测试getValue方法
        assertThat(LogisticsStatus.PENDING.getValue()).isEqualTo(0);
        assertThat(LogisticsStatus.CREATED.getValue()).isEqualTo(1);
        assertThat(LogisticsStatus.IN_TRANSIT.getValue()).isEqualTo(3);
        assertThat(LogisticsStatus.DELIVERED.getValue()).isEqualTo(6);
    }

    @Test
    @DisplayName("测试根据代码获取枚举")
    void testGetByCode() {
        // 测试正常情况
        assertThat(LogisticsStatus.getByCode(0)).isEqualTo(LogisticsStatus.PENDING);
        assertThat(LogisticsStatus.getByCode(1)).isEqualTo(LogisticsStatus.CREATED);
        assertThat(LogisticsStatus.getByCode(6)).isEqualTo(LogisticsStatus.DELIVERED);
        assertThat(LogisticsStatus.getByCode(9)).isEqualTo(LogisticsStatus.CANCELLED);
        
        // 测试边界情况
        assertThat(LogisticsStatus.getByCode(null)).isNull();
        assertThat(LogisticsStatus.getByCode(-1)).isNull();
        assertThat(LogisticsStatus.getByCode(999)).isNull();
    }

    @Test
    @DisplayName("测试终态状态判断")
    void testIsFinalStatus() {
        // 终态状态
        assertThat(LogisticsStatus.DELIVERED.isFinalStatus()).isTrue();
        assertThat(LogisticsStatus.RETURNED.isFinalStatus()).isTrue();
        assertThat(LogisticsStatus.CANCELLED.isFinalStatus()).isTrue();
        
        // 非终态状态
        assertThat(LogisticsStatus.PENDING.isFinalStatus()).isFalse();
        assertThat(LogisticsStatus.CREATED.isFinalStatus()).isFalse();
        assertThat(LogisticsStatus.PICKED_UP.isFinalStatus()).isFalse();
        assertThat(LogisticsStatus.IN_TRANSIT.isFinalStatus()).isFalse();
        assertThat(LogisticsStatus.ARRIVED.isFinalStatus()).isFalse();
        assertThat(LogisticsStatus.OUT_FOR_DELIVERY.isFinalStatus()).isFalse();
        assertThat(LogisticsStatus.EXCEPTION.isFinalStatus()).isFalse();
    }

    @Test
    @DisplayName("测试异常状态判断")
    void testIsExceptionStatus() {
        // 异常状态
        assertThat(LogisticsStatus.EXCEPTION.isExceptionStatus()).isTrue();
        assertThat(LogisticsStatus.RETURNED.isExceptionStatus()).isTrue();
        
        // 正常状态
        assertThat(LogisticsStatus.PENDING.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.CREATED.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.PICKED_UP.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.IN_TRANSIT.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.ARRIVED.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.OUT_FOR_DELIVERY.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.DELIVERED.isExceptionStatus()).isFalse();
        assertThat(LogisticsStatus.CANCELLED.isExceptionStatus()).isFalse();
    }

    @Test
    @DisplayName("测试所有枚举值")
    void testAllEnumValues() {
        LogisticsStatus[] allStatuses = LogisticsStatus.values();
        assertThat(allStatuses).hasSize(10);
        
        // 验证所有枚举值都有对应的代码和描述
        for (LogisticsStatus status : allStatuses) {
            assertThat(status.getCode()).isNotNull();
            assertThat(status.getDescription()).isNotNull();
            assertThat(status.getDescription()).isNotEmpty();
            assertThat(status.getValue()).isEqualTo(status.getCode());
        }
    }

    @Test
    @DisplayName("测试枚举值唯一性")
    void testEnumValueUniqueness() {
        LogisticsStatus[] allStatuses = LogisticsStatus.values();
        
        // 验证代码唯一性
        for (int i = 0; i < allStatuses.length; i++) {
            for (int j = i + 1; j < allStatuses.length; j++) {
                assertThat(allStatuses[i].getCode())
                    .isNotEqualTo(allStatuses[j].getCode());
            }
        }
    }
}