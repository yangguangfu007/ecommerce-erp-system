package com.erp.product.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.product.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品分类数据访问层
 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    
    /**
     * 根据父分类ID查询子分类列表
     */
    List<Category> selectByParentId(@Param("parentId") Long parentId);
    
    /**
     * 查询分类树结构
     */
    List<Category> selectCategoryTree();
    
    /**
     * 检查分类编码是否存在
     */
    boolean existsByCode(@Param("code") String code);
    
    /**
     * 检查分类是否有子分类
     */
    boolean hasChildren(@Param("categoryId") Long categoryId);
    
    /**
     * 检查分类是否有关联商品
     */
    boolean hasProducts(@Param("categoryId") Long categoryId);
    
    /**
     * 获取分类的最大排序号
     */
    Integer getMaxSortOrder(@Param("parentId") Long parentId);
}