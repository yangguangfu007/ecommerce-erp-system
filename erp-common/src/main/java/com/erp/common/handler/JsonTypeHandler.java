package com.erp.common.handler;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONException;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * JSON类型处理器
 * 用于处理数据库JSON字段与Java对象之间的转换
 *
 * @param <T> 目标类型
 * @author ERP System
 */
@Slf4j
@MappedTypes({Object.class})
@MappedJdbcTypes({JdbcType.VARCHAR, JdbcType.LONGVARCHAR})
public class JsonTypeHandler<T> extends BaseTypeHandler<T> {

    private final Class<T> type;

    public JsonTypeHandler(Class<T> type) {
        if (type == null) {
            throw new IllegalArgumentException("Type argument cannot be null");
        }
        this.type = type;
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, T parameter, JdbcType jdbcType) throws SQLException {
        try {
            String json = JSON.toJSONString(parameter);
            ps.setString(i, json);
            log.debug("设置JSON参数：{}", json);
        } catch (Exception e) {
            log.error("JSON序列化失败", e);
            throw new SQLException("JSON序列化失败", e);
        }
    }

    @Override
    public T getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return parseJson(json);
    }

    @Override
    public T getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String json = rs.getString(columnIndex);
        return parseJson(json);
    }

    @Override
    public T getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String json = cs.getString(columnIndex);
        return parseJson(json);
    }

    /**
     * 解析JSON字符串为目标对象
     *
     * @param json JSON字符串
     * @return 目标对象
     */
    private T parseJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }

        try {
            T result = JSON.parseObject(json, type);
            log.debug("JSON反序列化成功：{} -> {}", json, result);
            return result;
        } catch (JSONException e) {
            log.error("JSON反序列化失败，JSON：{}，目标类型：{}", json, type.getName(), e);
            return null;
        }
    }
}