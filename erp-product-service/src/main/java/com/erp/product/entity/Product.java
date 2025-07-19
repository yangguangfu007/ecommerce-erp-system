package com.erp.product.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 商品实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "products", autoResultMap = true)
public class Product extends BaseEntity {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * SKU编码 - 唯一标识
     */
    private String sku;
    
    /**
     * 商品标题
     */
    private String title;
    
    /**
     * 商品描述
     */
    private String description;
    
    /**
     * 分类ID
     */
    private Long categoryId;
    
    /**
     * 品牌
     */
    private String brand;
    
    /**
     * 销售价格
     */
    private BigDecimal price;
    
    /**
     * 成本价格
     */
    private BigDecimal costPrice;
    
    /**
     * 重量(kg)
     */
    private BigDecimal weight;
    
    /**
     * 尺寸规格
     */
    private String dimensions;
    
    /**
     * 商品图片列表
     */
    @com.baomidou.mybatisplus.annotation.TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> images;
    
    /**
     * 商品属性
     */
    @com.baomidou.mybatisplus.annotation.TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> attributes;
    
    /**
     * 商品状态
     */
    private ProductStatus status;
    
    /**
     * 商品版本号
     */
    private Integer version;
    
    /**
     * 商品状态枚举
     */
    public enum ProductStatus {
        ACTIVE("启用"),
        INACTIVE("禁用"),
        DELETED("已删除");
        
        private final String description;
        
        ProductStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}