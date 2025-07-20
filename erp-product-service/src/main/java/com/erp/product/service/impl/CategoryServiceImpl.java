package com.erp.product.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.ResultCode;
import com.erp.product.dto.CategoryDTO;
import com.erp.product.entity.Category;
import com.erp.product.mapper.CategoryMapper;
import com.erp.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品分类服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryMapper categoryMapper;
    
    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        // 检查分类编码唯一性
        if (existsByCode(categoryDTO.getCode())) {
            throw new BusinessException("分类编码已存在: " + categoryDTO.getCode());
        }
        
        Category category = new Category();
        BeanUtils.copyProperties(categoryDTO, category);
        
        // 设置分类层级
        if (category.getParentId() != null && category.getParentId() > 0) {
            Category parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(1);
            category.setParentId(0L);
        }
        
        // 设置排序号
        if (category.getSortOrder() == null) {
            Integer maxSortOrder = categoryMapper.getMaxSortOrder(category.getParentId());
            category.setSortOrder(maxSortOrder == null ? 1 : maxSortOrder + 1);
        }
        
        int result = categoryMapper.insert(category);
        if (result <= 0) {
            throw new BusinessException("分类创建失败");
        }
        
        categoryDTO.setId(category.getId());
        return categoryDTO;
    }
    
    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        
        CategoryDTO categoryDTO = new CategoryDTO();
        BeanUtils.copyProperties(category, categoryDTO);
        return categoryDTO;
    }
    
    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryMapper.selectById(id);
        if (existingCategory == null) {
            throw new BusinessException("分类不存在");
        }
        
        // 如果分类编码发生变化，检查新编码的唯一性
        if (!existingCategory.getCode().equals(categoryDTO.getCode()) && existsByCode(categoryDTO.getCode())) {
            throw new BusinessException("分类编码已存在: " + categoryDTO.getCode());
        }
        
        Category category = new Category();
        BeanUtils.copyProperties(categoryDTO, category);
        category.setId(id);
        
        int result = categoryMapper.updateById(category);
        if (result <= 0) {
            throw new BusinessException("分类更新失败");
        }
        
        return categoryDTO;
    }
    
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!canDeleteCategory(id)) {
            throw new BusinessException("分类存在子分类或关联商品，无法删除");
        }
        
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        
        int result = categoryMapper.deleteById(id);
        if (result <= 0) {
            throw new BusinessException("分类删除失败");
        }
    }
    
    @Override
    public List<CategoryDTO> getCategoryTree() {
        List<Category> categories = categoryMapper.selectCategoryTree();
        return buildCategoryTree(categories, 0L);
    }
    
    @Override
    public List<CategoryDTO> getCategoriesByParentId(Long parentId) {
        List<Category> categories = categoryMapper.selectByParentId(parentId);
        return categories.stream().map(category -> {
            CategoryDTO dto = new CategoryDTO();
            BeanUtils.copyProperties(category, dto);
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    public boolean existsByCode(String code) {
        return categoryMapper.existsByCode(code);
    }
    
    @Override
    public boolean canDeleteCategory(Long id) {
        // 检查是否有子分类
        if (categoryMapper.hasChildren(id)) {
            return false;
        }
        
        // 检查是否有关联商品
        if (categoryMapper.hasProducts(id)) {
            return false;
        }
        
        return true;
    }
    
    @Override
    public List<CategoryDTO> getEnabledCategories() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getEnabled, true)
               .orderByAsc(Category::getLevel, Category::getSortOrder);
        
        List<Category> categories = categoryMapper.selectList(wrapper);
        return categories.stream().map(category -> {
            CategoryDTO dto = new CategoryDTO();
            BeanUtils.copyProperties(category, dto);
            return dto;
        }).collect(Collectors.toList());
    }
    
    /**
     * 构建分类树结构
     */
    private List<CategoryDTO> buildCategoryTree(List<Category> categories, Long parentId) {
        return categories.stream()
                .filter(category -> parentId.equals(category.getParentId()))
                .map(category -> {
                    CategoryDTO dto = new CategoryDTO();
                    BeanUtils.copyProperties(category, dto);
                    
                    // 递归构建子分类
                    List<CategoryDTO> children = buildCategoryTree(categories, category.getId());
                    dto.setChildren(children);
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
}