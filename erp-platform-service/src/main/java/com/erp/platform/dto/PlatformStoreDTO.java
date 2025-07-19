package com.erp.platform.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 平台店铺DTO
 *
 * @author ERP System
 */
@Data
public class PlatformStoreDTO {
    
    private Long id;
    
    @NotBlank(message = "店铺名称不能为空")
    private String storeName;
    
    @NotBlank(message = "平台类型不能为空")
    private String platformType;
    
    private String platformStoreId;
    
    @NotNull(message = "API凭证不能为空")
    private Map<String, Object> apiCredentials;
    
    private String status;
    
    private LocalDateTime lastSyncTime;
    
    private Boolean connectionStatus;
    
    private LocalDateTime lastConnectionCheck;
    
    private Map<String, Object> configData;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}