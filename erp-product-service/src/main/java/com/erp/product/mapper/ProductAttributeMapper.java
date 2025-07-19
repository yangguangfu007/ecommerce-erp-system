package com.erp.product.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.product.entity.ProductAttribute;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品属性模板数据访问层
 */
@Mapper
public interface ProductAttributeMapper extends BaseMapper<ProductAttribute> {
    
    /**
     * 根据分类ID查询属性模板列表
     */
    List<ProductAttribute> selectByCategoryId(@Param("categoryId") Long categoryId);
    
    /**
     * 检查属性编码是否存在
     */
    boolean existsByCode(@Param("code") String code, @Param("categoryId") Long categoryId);
    
    /**
     * 获取分类下属性的最大排序号
     */
    Integer getMaxSortOrder(@Param("categoryId") Long categoryId);
    
    /**
     * 批量更新属性状态
     */
    int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("enabled") Boolean enabled);
}