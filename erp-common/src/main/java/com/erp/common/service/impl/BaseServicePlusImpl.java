package com.erp.common.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.exception.BusinessException;
import com.erp.common.mapper.BaseMapperPlus;
import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.common.util.PageUtils;
import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;

/**
 * 增强的Service基实现类
 * 提供通用的CRUD操作和业务方法
 *
 * @param <M> Mapper类型
 * @param <T> 实体类型
 * @author ERP System
 */
@Slf4j
public class BaseServicePlusImpl<M extends BaseMapper<T>, T> extends ServiceImpl<M, T> implements BaseServicePlus<T> {



    @Override
    public T getOneByCondition(Wrapper<T> queryWrapper) {
        try {
            return getOne(queryWrapper, false);
        } catch (Exception e) {
            log.error("根据条件查询单条记录失败", e);
            throw new BusinessException("查询数据失败");
        }
    }

    @Override
    public T getOneByConditionThrowEx(Wrapper<T> queryWrapper) {
        try {
            return getOne(queryWrapper, true);
        } catch (Exception e) {
            log.error("根据条件查询单条记录失败（严格模式）", e);
            throw new BusinessException("查询数据失败或存在多条记录");
        }
    }

    @Override
    public boolean existsByCondition(Wrapper<T> queryWrapper) {
        try {
            return count(queryWrapper) > 0;
        } catch (Exception e) {
            log.error("根据条件检查记录是否存在失败", e);
            return false;
        }
    }

    @Override
    public long countByCondition(Wrapper<T> queryWrapper) {
        try {
            return count(queryWrapper);
        } catch (Exception e) {
            log.error("根据条件统计记录数失败", e);
            throw new BusinessException("统计数据失败");
        }
    }

    @Override
    public PageResult<T> pageQuery(IPage<T> page, Wrapper<T> queryWrapper) {
        try {
            IPage<T> result = page(page, queryWrapper);
            return PageUtils.toPageResult(result);
        } catch (Exception e) {
            log.error("分页查询失败", e);
            throw new BusinessException("分页查询失败");
        }
    }

    @Override
    public <R> PageResult<R> pageQuery(IPage<T> page, Wrapper<T> queryWrapper, Function<T, R> converter) {
        try {
            IPage<T> result = page(page, queryWrapper);
            return PageUtils.toPageResult(result, converter);
        } catch (Exception e) {
            log.error("分页查询并转换数据失败", e);
            throw new BusinessException("分页查询失败");
        }
    }

    @Override
    public int insertBatch(Collection<T> entityList) {
        return insertBatch(entityList, 1000);
    }

    @Override
    public int insertBatch(Collection<T> entityList, int batchSize) {
        if (CollectionUtils.isEmpty(entityList)) {
            return 0;
        }
        
        try {
            // 使用MyBatis Plus默认的批量保存
            boolean success = saveBatch(entityList, batchSize);
            return success ? entityList.size() : 0;
        } catch (Exception e) {
            log.error("批量插入失败，数据量：{}", entityList.size(), e);
            throw new BusinessException("批量插入数据失败");
        }
    }

    @Override
    public int updateBatchByIdEnhanced(Collection<T> entityList) {
        return updateBatchByIdEnhanced(entityList, 1000);
    }

    @Override
    public int updateBatchByIdEnhanced(Collection<T> entityList, int batchSize) {
        if (CollectionUtils.isEmpty(entityList)) {
            return 0;
        }
        
        try {
            // 使用MyBatis Plus默认的批量更新
            boolean success = super.updateBatchById(entityList, batchSize);
            return success ? entityList.size() : 0;
        } catch (Exception e) {
            log.error("批量更新失败，数据量：{}", entityList.size(), e);
            throw new BusinessException("批量更新数据失败");
        }
    }

    @Override
    public boolean saveOrUpdateEnhanced(T entity) {
        try {
            return saveOrUpdate(entity);
        } catch (Exception e) {
            log.error("保存或更新数据失败", e);
            throw new BusinessException("保存数据失败");
        }
    }

    @Override
    public boolean saveOrUpdateBatchEnhanced(Collection<T> entityList) {
        if (CollectionUtils.isEmpty(entityList)) {
            return true;
        }
        
        try {
            return saveOrUpdateBatch(entityList);
        } catch (Exception e) {
            log.error("批量保存或更新数据失败，数据量：{}", entityList.size(), e);
            throw new BusinessException("批量保存数据失败");
        }
    }

    @Override
    public int removeByCondition(Wrapper<T> queryWrapper) {
        try {
            return baseMapper.delete(queryWrapper);
        } catch (Exception e) {
            log.error("根据条件删除数据失败", e);
            throw new BusinessException("删除数据失败");
        }
    }

    @Override
    public int removeByIdsEnhanced(Collection<? extends Serializable> idList) {
        if (CollectionUtils.isEmpty(idList)) {
            return 0;
        }
        
        try {
            return baseMapper.deleteBatchIds(idList);
        } catch (Exception e) {
            log.error("根据ID集合删除数据失败，ID数量：{}", idList.size(), e);
            throw new BusinessException("批量删除数据失败");
        }
    }

    @Override
    public List<T> listByCondition(Wrapper<T> queryWrapper) {
        try {
            return list(queryWrapper);
        } catch (Exception e) {
            log.error("根据条件查询列表失败", e);
            throw new BusinessException("查询数据列表失败");
        }
    }

    @Override
    public List<T> listByConditionWithLimit(Wrapper<T> queryWrapper, int limit) {
        try {
            // 使用分页方式实现限制
            Page<T> page = new Page<>(1, limit);
            IPage<T> result = page(page, queryWrapper);
            return result.getRecords();
        } catch (Exception e) {
            log.error("根据条件查询限制数量的列表失败，限制数量：{}", limit, e);
            throw new BusinessException("查询数据列表失败");
        }
    }

    @Override
    public List<T> listByField(String column, Object value) {
        try {
            QueryWrapper<T> queryWrapper = Wrappers.query();
            queryWrapper.eq(column, value);
            return list(queryWrapper);
        } catch (Exception e) {
            log.error("根据字段查询列表失败，字段：{}，值：{}", column, value, e);
            throw new BusinessException("查询数据列表失败");
        }
    }

    @Override
    public T getByField(String column, Object value) {
        try {
            QueryWrapper<T> queryWrapper = Wrappers.query();
            queryWrapper.eq(column, value);
            return getOne(queryWrapper, false);
        } catch (Exception e) {
            log.error("根据字段查询单条记录失败，字段：{}，值：{}", column, value, e);
            throw new BusinessException("查询数据失败");
        }
    }

    @Override
    public boolean existsByField(String column, Object value) {
        try {
            QueryWrapper<T> queryWrapper = Wrappers.query();
            queryWrapper.eq(column, value);
            return count(queryWrapper) > 0;
        } catch (Exception e) {
            log.error("根据字段检查记录是否存在失败，字段：{}，值：{}", column, value, e);
            return false;
        }
    }

    @Override
    public long countByField(String column, Object value) {
        try {
            QueryWrapper<T> queryWrapper = Wrappers.query();
            queryWrapper.eq(column, value);
            return count(queryWrapper);
        } catch (Exception e) {
            log.error("根据字段统计记录数失败，字段：{}，值：{}", column, value, e);
            throw new BusinessException("统计数据失败");
        }
    }
}