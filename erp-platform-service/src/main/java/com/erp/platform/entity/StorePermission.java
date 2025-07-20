package com.erp.platform.entity;

import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.persistence.*;

/**
 * 店铺权限实体
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "store_permissions")
public class StorePermission extends BaseEntity {
    
    /**
     * 主键ID (JPA需要显式声明)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    /**
     * 店铺ID
     */
    @Column(name = "store_id", nullable = false)
    private Long storeId;
    
    /**
     * 权限类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type", nullable = false)
    private PermissionType permissionType;
    
    /**
     * 是否可读
     */
    @Column(name = "can_read", nullable = false)
    private Boolean canRead = true;
    
    /**
     * 是否可写
     */
    @Column(name = "can_write", nullable = false)
    private Boolean canWrite = false;
    
    /**
     * 是否可删除
     */
    @Column(name = "can_delete", nullable = false)
    private Boolean canDelete = false;
    
    /**
     * 是否可管理
     */
    @Column(name = "can_manage", nullable = false)
    private Boolean canManage = false;
    
    /**
     * 权限类型枚举
     */
    public enum PermissionType {
        OWNER,      // 所有者
        ADMIN,      // 管理员
        OPERATOR,   // 操作员
        VIEWER      // 查看者
    }
}