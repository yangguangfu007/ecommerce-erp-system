package com.erp.common.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 增强的BaseMapper接口
 * 在MyBatis Plus原有功能基础上增加了更多便捷方法
 *
 * @param <T> 实体类型
 * @author ERP System
 */
public interface BaseMapperPlus<T> extends BaseMapper<T> {

    /**
     * 根据条件查询一条记录（如果查询结果超过1条会抛异常）
     *
     * @param queryWrapper 查询条件
     * @return 实体对象
     */
    default T selectOneByCondition(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper) {
        return selectOne(queryWrapper);
    }

    /**
     * 根据条件查询记录数
     *
     * @param queryWrapper 查询条件
     * @return 记录数
     */
    default Long selectCountByCondition(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper) {
        return selectCount(queryWrapper);
    }

    /**
     * 根据条件判断是否存在记录
     *
     * @param queryWrapper 查询条件
     * @return true-存在，false-不存在
     */
    default boolean existsByCondition(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper) {
        return selectCountByCondition(queryWrapper) > 0;
    }

    /**
     * 根据条件分页查询
     *
     * @param page         分页对象
     * @param queryWrapper 查询条件
     * @return 分页结果
     */
    default IPage<T> selectPageByCondition(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper) {
        return selectPage(page, queryWrapper);
    }

    /**
     * 根据条件物理删除
     *
     * @param queryWrapper 删除条件
     * @return 删除的记录数
     */
    default int deleteByCondition(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper) {
        return delete(queryWrapper);
    }

    /**
     * 根据条件查询所有记录（不分页）
     *
     * @param queryWrapper 查询条件
     * @return 记录列表
     */
    default List<T> selectAllByCondition(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper) {
        return selectList(queryWrapper);
    }
}