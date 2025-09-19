package com.erp.common.handler;

import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * 枚举类型处理器
 * 支持枚举与数据库字段之间的转换
 *
 * @param <E> 枚举类型
 * @author ERP System
 */
@Slf4j
public class EnumTypeHandler<E extends Enum<E>> extends BaseTypeHandler<E> {

    private final Class<E> enumType;
    private final E[] enums;

    public EnumTypeHandler(Class<E> enumType) {
        if (enumType == null) {
            throw new IllegalArgumentException("Type argument cannot be null");
        }
        this.enumType = enumType;
        this.enums = enumType.getEnumConstants();
        if (this.enums == null) {
            throw new IllegalArgumentException(enumType.getSimpleName() + " does not represent an enum type.");
        }
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, E parameter, JdbcType jdbcType) throws SQLException {
        try {
            // 如果枚举实现了特定接口，可以使用自定义的值
            if (parameter instanceof EnumValue) {
                ps.setObject(i, ((EnumValue) parameter).getValue());
                log.debug("设置枚举参数（自定义值）：{} -> {}", parameter, ((EnumValue) parameter).getValue());
            } else {
                // 默认使用枚举的name()
                ps.setString(i, parameter.name());
                log.debug("设置枚举参数（名称）：{}", parameter.name());
            }
        } catch (Exception e) {
            log.error("设置枚举参数失败", e);
            throw new SQLException("设置枚举参数失败", e);
        }
    }

    @Override
    public E getNullableResult(ResultSet rs, String columnName) throws SQLException {
        Object value = rs.getObject(columnName);
        return parseEnum(value);
    }

    @Override
    public E getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        Object value = rs.getObject(columnIndex);
        return parseEnum(value);
    }

    @Override
    public E getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        Object value = cs.getObject(columnIndex);
        return parseEnum(value);
    }

    /**
     * 解析数据库值为枚举
     *
     * @param value 数据库值
     * @return 枚举值
     */
    private E parseEnum(Object value) {
        if (value == null) {
            return null;
        }

        try {
            // 首先尝试通过自定义值匹配
            for (E enumConstant : enums) {
                if (enumConstant instanceof EnumValue) {
                    if (value.equals(((EnumValue) enumConstant).getValue())) {
                        log.debug("枚举解析成功（自定义值）：{} -> {}", value, enumConstant);
                        return enumConstant;
                    }
                }
            }

            // 然后尝试通过名称匹配
            String stringValue = value.toString();
            for (E enumConstant : enums) {
                if (enumConstant.name().equals(stringValue)) {
                    log.debug("枚举解析成功（名称）：{} -> {}", stringValue, enumConstant);
                    return enumConstant;
                }
            }

            // 最后尝试通过ordinal匹配
            if (value instanceof Number) {
                int ordinal = ((Number) value).intValue();
                if (ordinal >= 0 && ordinal < enums.length) {
                    E enumConstant = enums[ordinal];
                    log.debug("枚举解析成功（序号）：{} -> {}", ordinal, enumConstant);
                    return enumConstant;
                }
            }

            log.warn("无法解析枚举值：{}，枚举类型：{}", value, enumType.getName());
            return null;
        } catch (Exception e) {
            log.error("枚举解析失败，值：{}，枚举类型：{}", value, enumType.getName(), e);
            return null;
        }
    }

    /**
     * 枚举值接口
     * 枚举类可以实现此接口来提供自定义的数据库存储值
     */
    public interface EnumValue {
        /**
         * 获取枚举的数据库存储值
         *
         * @return 数据库存储值
         */
        Object getValue();
    }
}