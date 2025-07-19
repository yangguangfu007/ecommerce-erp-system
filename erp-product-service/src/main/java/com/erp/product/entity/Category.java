package com.erp.product.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 商品分类实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_categories")
public class Category extends BaseEntity {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 分类名称
     */
    private String name;
    
    /**
     * 分类编码
     */
    private String code;
    
    /**
     * 父分类ID
     */
    private Long parentId;
    
    /**
     * 分类层级
     */
    private Integer level;
    
    /**
     * 排序号
     */
    private Integer sortOrder;
    
    /**
     * 分类描述
     */
    private String description;
    
    /**
     * 分类图标
     */
    private String icon;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
}