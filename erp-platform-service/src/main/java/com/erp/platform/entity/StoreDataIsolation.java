package com.erp.platform.entity;

import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.persistence.*;

/**
 * 店铺数据隔离配置实体
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "store_data_isolation")
public class StoreDataIsolation extends BaseEntity {
    
    /**
     * 主键ID (JPA需要显式声明)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    /**
     * 店铺ID
     */
    @Column(name = "store_id", nullable = false)
    private Long storeId;
    
    /**
     * 数据类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private DataType dataType;
    
    /**
     * 隔离级别
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "isolation_level", nullable = false)
    private IsolationLevel isolationLevel;
    
    /**
     * 是否启用
     */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;
    
    /**
     * 配置参数(JSON格式)
     */
    @Column(name = "config_params", columnDefinition = "TEXT")
    private String configParams;
    
    /**
     * 数据类型枚举
     */
    public enum DataType {
        ORDER,      // 订单数据
        PRODUCT,    // 商品数据
        INVENTORY,  // 库存数据
        CUSTOMER,   // 客户数据
        REPORT      // 报表数据
    }
    
    /**
     * 隔离级别枚举
     */
    public enum IsolationLevel {
        STRICT,     // 严格隔离
        MODERATE,   // 中等隔离
        LOOSE       // 宽松隔离
    }
}