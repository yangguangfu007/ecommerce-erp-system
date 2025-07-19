package com.erp.product.dto;

import com.erp.product.entity.Product;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 商品搜索条件DTO
 */
@Data
public class ProductSearchDTO {
    
    /**
     * 关键词搜索(SKU、标题、描述)
     */
    private String keyword;
    
    /**
     * SKU编码
     */
    private String sku;
    
    /**
     * 商品标题
     */
    private String title;
    
    /**
     * 分类ID
     */
    private Long categoryId;
    
    /**
     * 品牌
     */
    private String brand;
    
    /**
     * 最低价格
     */
    private BigDecimal minPrice;
    
    /**
     * 最高价格
     */
    private BigDecimal maxPrice;
    
    /**
     * 商品状态
     */
    private Product.ProductStatus status;
    
    /**
     * 排序字段
     */
    private String sortField;
    
    /**
     * 排序方向 ASC/DESC
     */
    private String sortDirection;
}