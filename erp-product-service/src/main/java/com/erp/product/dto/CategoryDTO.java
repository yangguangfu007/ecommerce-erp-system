package com.erp.product.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 商品分类数据传输对象
 */
@Data
public class CategoryDTO {
    
    private Long id;
    
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称长度不能超过100个字符")
    private String name;
    
    @NotBlank(message = "分类编码不能为空")
    @Size(max = 50, message = "分类编码长度不能超过50个字符")
    private String code;
    
    private Long parentId;
    
    private Integer level;
    
    private Integer sortOrder;
    
    @Size(max = 500, message = "分类描述长度不能超过500个字符")
    private String description;
    
    @Size(max = 200, message = "分类图标长度不能超过200个字符")
    private String icon;
    
    private Boolean enabled;
    
    private String parentName;
    
    private List<CategoryDTO> children;
    
    private Long productCount;
}