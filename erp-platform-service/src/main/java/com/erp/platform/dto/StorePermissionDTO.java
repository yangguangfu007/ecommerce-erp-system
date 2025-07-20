package com.erp.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotNull;

/**
 * 店铺权限DTO
 *
 * @author ERP System
 */
@Data
@Schema(description = "店铺权限信息")
public class StorePermissionDTO {
    
    @Schema(description = "权限ID")
    private Long id;
    
    @NotNull(message = "用户ID不能为空")
    @Schema(description = "用户ID", required = true)
    private Long userId;
    
    @NotNull(message = "店铺ID不能为空")
    @Schema(description = "店铺ID", required = true)
    private Long storeId;
    
    @Schema(description = "店铺名称")
    private String storeName;
    
    @Schema(description = "用户名称")
    private String userName;
    
    @NotNull(message = "权限类型不能为空")
    @Schema(description = "权限类型", required = true, allowableValues = {"OWNER", "ADMIN", "OPERATOR", "VIEWER"})
    private String permissionType;
    
    @Schema(description = "是否可读", defaultValue = "true")
    private Boolean canRead = true;
    
    @Schema(description = "是否可写", defaultValue = "false")
    private Boolean canWrite = false;
    
    @Schema(description = "是否可删除", defaultValue = "false")
    private Boolean canDelete = false;
    
    @Schema(description = "是否可管理", defaultValue = "false")
    private Boolean canManage = false;
    
    @Schema(description = "创建时间")
    private String createdAt;
    
    @Schema(description = "更新时间")
    private String updatedAt;
}