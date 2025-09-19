package com.erp.common.util;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Objects;

/**
 * 查询条件构造器工具类
 * 提供常用的查询条件构造方法，简化查询条件的构建
 *
 * @author ERP System
 */
public class QueryWrapperUtils {

    /**
     * 创建Lambda查询构造器
     *
     * @param <T> 实体类型
     * @return LambdaQueryWrapper实例
     */
    public static <T> LambdaQueryWrapper<T> lambdaQuery() {
        return new LambdaQueryWrapper<>();
    }

    /**
     * 创建Lambda查询构造器（带实体类）
     *
     * @param entityClass 实体类
     * @param <T>         实体类型
     * @return LambdaQueryWrapper实例
     */
    public static <T> LambdaQueryWrapper<T> lambdaQuery(Class<T> entityClass) {
        return new LambdaQueryWrapper<>(entityClass);
    }

    /**
     * 创建Lambda更新构造器
     *
     * @param <T> 实体类型
     * @return LambdaUpdateWrapper实例
     */
    public static <T> LambdaUpdateWrapper<T> lambdaUpdate() {
        return new LambdaUpdateWrapper<>();
    }

    /**
     * 创建Lambda更新构造器（带实体类）
     *
     * @param entityClass 实体类
     * @param <T>         实体类型
     * @return LambdaUpdateWrapper实例
     */
    public static <T> LambdaUpdateWrapper<T> lambdaUpdate(Class<T> entityClass) {
        return new LambdaUpdateWrapper<>(entityClass);
    }

    /**
     * 创建普通查询构造器
     *
     * @param <T> 实体类型
     * @return QueryWrapper实例
     */
    public static <T> QueryWrapper<T> query() {
        return new QueryWrapper<>();
    }

    /**
     * 创建普通更新构造器
     *
     * @param <T> 实体类型
     * @return UpdateWrapper实例
     */
    public static <T> UpdateWrapper<T> update() {
        return new UpdateWrapper<>();
    }

    /**
     * 构建等值查询条件（非空时才添加）
     *
     * @param wrapper 查询构造器
     * @param column  字段
     * @param value   值
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> eqIfPresent(LambdaQueryWrapper<T> wrapper, 
                                                       SFunction<T, ?> column, 
                                                       Object value) {
        return wrapper.eq(Objects.nonNull(value), column, value);
    }

    /**
     * 构建模糊查询条件（非空时才添加）
     *
     * @param wrapper 查询构造器
     * @param column  字段
     * @param value   值
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> likeIfPresent(LambdaQueryWrapper<T> wrapper, 
                                                         SFunction<T, ?> column, 
                                                         String value) {
        return wrapper.like(StringUtils.isNotBlank(value), column, value);
    }

    /**
     * 构建右模糊查询条件（非空时才添加）
     *
     * @param wrapper 查询构造器
     * @param column  字段
     * @param value   值
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> likeRightIfPresent(LambdaQueryWrapper<T> wrapper, 
                                                              SFunction<T, ?> column, 
                                                              String value) {
        return wrapper.likeRight(StringUtils.isNotBlank(value), column, value);
    }

    /**
     * 构建IN查询条件（集合非空时才添加）
     *
     * @param wrapper 查询构造器
     * @param column  字段
     * @param values  值集合
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> inIfPresent(LambdaQueryWrapper<T> wrapper, 
                                                       SFunction<T, ?> column, 
                                                       Collection<?> values) {
        return wrapper.in(Objects.nonNull(values) && !values.isEmpty(), column, values);
    }

    /**
     * 构建时间范围查询条件
     *
     * @param wrapper   查询构造器
     * @param column    时间字段
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @param <T>       实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> betweenTime(LambdaQueryWrapper<T> wrapper, 
                                                       SFunction<T, ?> column, 
                                                       LocalDateTime startTime, 
                                                       LocalDateTime endTime) {
        if (Objects.nonNull(startTime) && Objects.nonNull(endTime)) {
            return wrapper.between(column, startTime, endTime);
        } else if (Objects.nonNull(startTime)) {
            return wrapper.ge(column, startTime);
        } else if (Objects.nonNull(endTime)) {
            return wrapper.le(column, endTime);
        }
        return wrapper;
    }

    /**
     * 构建大于等于查询条件（非空时才添加）
     *
     * @param wrapper 查询构造器
     * @param column  字段
     * @param value   值
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> geIfPresent(LambdaQueryWrapper<T> wrapper, 
                                                       SFunction<T, ?> column, 
                                                       Object value) {
        return wrapper.ge(Objects.nonNull(value), column, value);
    }

    /**
     * 构建小于等于查询条件（非空时才添加）
     *
     * @param wrapper 查询构造器
     * @param column  字段
     * @param value   值
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> leIfPresent(LambdaQueryWrapper<T> wrapper, 
                                                       SFunction<T, ?> column, 
                                                       Object value) {
        return wrapper.le(Objects.nonNull(value), column, value);
    }

    /**
     * 构建排序条件（多字段）
     *
     * @param wrapper 查询构造器
     * @param isAsc   是否升序
     * @param column  排序字段
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> orderBy(LambdaQueryWrapper<T> wrapper, 
                                                    boolean isAsc, 
                                                    SFunction<T, ?> column) {
        return wrapper.orderBy(true, isAsc, column);
    }

    /**
     * 构建降序排序条件
     *
     * @param wrapper 查询构造器
     * @param column  排序字段
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> orderByDesc(LambdaQueryWrapper<T> wrapper, 
                                                        SFunction<T, ?> column) {
        return wrapper.orderByDesc(column);
    }

    /**
     * 构建升序排序条件
     *
     * @param wrapper 查询构造器
     * @param column  排序字段
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> orderByAsc(LambdaQueryWrapper<T> wrapper, 
                                                       SFunction<T, ?> column) {
        return wrapper.orderByAsc(column);
    }

    /**
     * 构建分组查询条件
     *
     * @param wrapper 查询构造器
     * @param column  分组字段
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> groupBy(LambdaQueryWrapper<T> wrapper, 
                                                    SFunction<T, ?> column) {
        return wrapper.groupBy(column);
    }

    /**
     * 构建查询字段选择条件
     *
     * @param wrapper 查询构造器
     * @param column  要查询的字段
     * @param <T>     实体类型
     * @return 查询构造器
     */
    public static <T> LambdaQueryWrapper<T> select(LambdaQueryWrapper<T> wrapper, 
                                                   SFunction<T, ?> column) {
        return wrapper.select(column);
    }
}