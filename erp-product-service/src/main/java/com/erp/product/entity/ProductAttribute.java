package com.erp.product.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 商品属性模板实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_attributes")
public class ProductAttribute extends BaseEntity {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 属性名称
     */
    private String name;
    
    /**
     * 属性编码
     */
    private String code;
    
    /**
     * 属性类型
     */
    private AttributeType type;
    
    /**
     * 分类ID
     */
    private Long categoryId;
    
    /**
     * 是否必填
     */
    private Boolean required;
    
    /**
     * 默认值
     */
    private String defaultValue;
    
    /**
     * 可选值列表(JSON格式)
     */
    private String options;
    
    /**
     * 排序号
     */
    private Integer sortOrder;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 属性类型枚举
     */
    public enum AttributeType {
        TEXT("文本"),
        NUMBER("数字"),
        SELECT("单选"),
        MULTI_SELECT("多选"),
        BOOLEAN("布尔值"),
        DATE("日期"),
        IMAGE("图片");
        
        private final String description;
        
        AttributeType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}