package com.erp.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 商品导入数据传输对象
 */
@Data
public class ProductImportDTO {
    
    /**
     * 行号
     */
    private Integer rowNumber;
    
    /**
     * SKU编码
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
     * 分类编码
     */
    private String categoryCode;
    
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
     * 重量
     */
    private BigDecimal weight;
    
    /**
     * 尺寸规格
     */
    private String dimensions;
    
    /**
     * 商品状态
     */
    private String status;
    
    /**
     * 验证错误信息
     */
    private List<String> errors;
    
    /**
     * 是否验证通过
     */
    private Boolean valid;
}