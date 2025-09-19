package com.erp.common.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.erp.common.response.PageResult;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;

/**
 * 增强的Service基接口
 * 在MyBatis Plus IService基础上增加了更多便捷方法
 *
 * @param <T> 实体类型
 * @author ERP System
 */
public interface BaseServicePlus<T> extends IService<T> {

    /**
     * 根据条件查询一条记录
     *
     * @param queryWrapper 查询条件
     * @return 实体对象
     */
    T getOneByCondition(Wrapper<T> queryWrapper);

    /**
     * 根据条件查询一条记录（如果查询结果超过1条会抛异常）
     *
     * @param queryWrapper 查询条件
     * @return 实体对象
     */
    T getOneByConditionThrowEx(Wrapper<T> queryWrapper);

    /**
     * 根据条件判断是否存在记录
     *
     * @param queryWrapper 查询条件
     * @return true-存在，false-不存在
     */
    boolean existsByCondition(Wrapper<T> queryWrapper);

    /**
     * 根据条件查询记录数
     *
     * @param queryWrapper 查询条件
     * @return 记录数
     */
    long countByCondition(Wrapper<T> queryWrapper);

    /**
     * 分页查询并转换为PageResult
     *
     * @param page         分页对象
     * @param queryWrapper 查询条件
     * @return PageResult对象
     */
    PageResult<T> pageQuery(IPage<T> page, Wrapper<T> queryWrapper);

    /**
     * 分页查询并转换数据类型
     *
     * @param page         分页对象
     * @param queryWrapper 查询条件
     * @param converter    数据转换函数
     * @param <R>          目标数据类型
     * @return PageResult对象
     */
    <R> PageResult<R> pageQuery(IPage<T> page, Wrapper<T> queryWrapper, Function<T, R> converter);

    /**
     * 批量插入（支持所有数据库）
     *
     * @param entityList 实体列表
     * @return 插入成功的记录数
     */
    int insertBatch(Collection<T> entityList);

    /**
     * 批量插入（支持所有数据库，指定批次大小）
     *
     * @param entityList 实体列表
     * @param batchSize  批次大小
     * @return 插入成功的记录数
     */
    int insertBatch(Collection<T> entityList, int batchSize);

    /**
     * 批量更新（根据ID）
     *
     * @param entityList 实体列表
     * @return 更新成功的记录数
     */
    int updateBatchByIdEnhanced(Collection<T> entityList);

    /**
     * 批量更新（根据ID，指定批次大小）
     *
     * @param entityList 实体列表
     * @param batchSize  批次大小
     * @return 更新成功的记录数
     */
    int updateBatchByIdEnhanced(Collection<T> entityList, int batchSize);

    /**
     * 插入或更新（存在则更新，不存在则插入）
     *
     * @param entity 实体对象
     * @return 是否成功
     */
    boolean saveOrUpdateEnhanced(T entity);

    /**
     * 批量插入或更新
     *
     * @param entityList 实体列表
     * @return 是否成功
     */
    boolean saveOrUpdateBatchEnhanced(Collection<T> entityList);

    /**
     * 根据条件物理删除
     *
     * @param queryWrapper 删除条件
     * @return 删除的记录数
     */
    int removeByCondition(Wrapper<T> queryWrapper);

    /**
     * 根据ID集合批量物理删除
     *
     * @param idList ID集合
     * @return 删除的记录数
     */
    int removeByIdsEnhanced(Collection<? extends Serializable> idList);

    /**
     * 根据条件查询所有记录（不分页）
     *
     * @param queryWrapper 查询条件
     * @return 记录列表
     */
    List<T> listByCondition(Wrapper<T> queryWrapper);

    /**
     * 根据条件查询指定数量的记录
     *
     * @param queryWrapper 查询条件
     * @param limit        限制数量
     * @return 记录列表
     */
    List<T> listByConditionWithLimit(Wrapper<T> queryWrapper, int limit);

    /**
     * 根据字段值查询记录列表
     *
     * @param column 字段名
     * @param value  字段值
     * @return 记录列表
     */
    List<T> listByField(String column, Object value);

    /**
     * 根据字段值查询一条记录
     *
     * @param column 字段名
     * @param value  字段值
     * @return 实体对象
     */
    T getByField(String column, Object value);

    /**
     * 根据字段值判断是否存在记录
     *
     * @param column 字段名
     * @param value  字段值
     * @return true-存在，false-不存在
     */
    boolean existsByField(String column, Object value);

    /**
     * 根据字段值统计记录数
     *
     * @param column 字段名
     * @param value  字段值
     * @return 记录数
     */
    long countByField(String column, Object value);
}