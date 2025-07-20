package com.erp.product.dto;

import com.erp.product.entity.Product;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 商品数据传输对象
 */
@Data
public class ProductDTO {
    
    private Long id;
    
    @NotBlank(message = "SKU编码不能为空")
    @Size(max = 100, message = "SKU编码长度不能超过100个字符")
    private String sku;
    
    @NotBlank(message = "商品标题不能为空")
    @Size(max = 500, message = "商品标题长度不能超过500个字符")
    private String title;
    
    @Size(max = 2000, message = "商品描述长度不能超过2000个字符")
    private String description;
    
    @NotNull(message = "商品分类不能为空")
    private Long categoryId;
    
    @Size(max = 100, message = "品牌长度不能超过100个字符")
    private String brand;
    
    @NotNull(message = "销售价格不能为空")
    @DecimalMin(value = "0.01", message = "销售价格必须大于0")
    private BigDecimal price;
    
    @DecimalMin(value = "0.00", message = "成本价格不能为负数")
    private BigDecimal costPrice;
    
    @DecimalMin(value = "0.001", message = "重量必须大于0")
    private BigDecimal weight;
    
    @Size(max = 100, message = "尺寸规格长度不能超过100个字符")
    private String dimensions;
    
    private List<String> images;
    
    private Map<String, Object> attributes;
    
    @NotNull(message = "商品状态不能为空")
    private Product.ProductStatus status;
    
    private String categoryName;
    
    private Integer version;
}