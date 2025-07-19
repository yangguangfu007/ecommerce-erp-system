package com.erp.product.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 商品修改历史记录实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "product_history", autoResultMap = true)
public class ProductHistory extends BaseEntity {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 商品ID
     */
    private Long productId;
    
    /**
     * SKU编码
     */
    private String sku;
    
    /**
     * 操作类型
     */
    private OperationType operationType;
    
    /**
     * 修改前数据(JSON格式)
     */
    @com.baomidou.mybatisplus.annotation.TableField(typeHandler = JacksonTypeHandler.class)
    private Object beforeData;
    
    /**
     * 修改后数据(JSON格式)
     */
    @com.baomidou.mybatisplus.annotation.TableField(typeHandler = JacksonTypeHandler.class)
    private Object afterData;
    
    /**
     * 修改字段列表
     */
    private String changedFields;
    
    /**
     * 操作人员
     */
    private String operator;
    
    /**
     * 操作时间
     */
    private LocalDateTime operationTime;
    
    /**
     * 操作备注
     */
    private String remark;
    
    /**
     * 操作类型枚举
     */
    public enum OperationType {
        CREATE("创建"),
        UPDATE("更新"),
        DELETE("删除"),
        STATUS_CHANGE("状态变更");
        
        private final String description;
        
        OperationType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}