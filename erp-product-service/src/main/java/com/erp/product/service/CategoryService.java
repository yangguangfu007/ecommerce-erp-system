package com.erp.product.service;

import com.erp.product.dto.CategoryDTO;

import java.util.List;

/**
 * 商品分类服务接口
 */
public interface CategoryService {
    
    /**
     * 创建分类
     */
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    
    /**
     * 根据ID获取分类
     */
    CategoryDTO getCategoryById(Long id);
    
    /**
     * 更新分类
     */
    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);
    
    /**
     * 删除分类
     */
    void deleteCategory(Long id);
    
    /**
     * 获取分类树结构
     */
    List<CategoryDTO> getCategoryTree();
    
    /**
     * 根据父分类ID获取子分类列表
     */
    List<CategoryDTO> getCategoriesByParentId(Long parentId);
    
    /**
     * 检查分类编码是否存在
     */
    boolean existsByCode(String code);
    
    /**
     * 检查分类是否可以删除
     */
    boolean canDeleteCategory(Long id);
    
    /**
     * 获取所有启用的分类
     */
    List<CategoryDTO> getEnabledCategories();
}