package com.erp.platform.dto;

import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 平台信息数据传输对象
 * 用于平台信息的创建和更新操作
 */
@Data
@Schema(description = "平台信息数据传输对象")
public class PlatformDTO {

    @Schema(description = "平台ID", example = "1")
    private Long id;

    @NotBlank(message = "平台名称不能为空")
    @Size(max = 100, message = "平台名称长度不能超过100个字符")
    @Schema(description = "平台名称", example = "沃尔玛市场", required = true)
    private String platformName;

    @NotNull(message = "平台类型不能为空")
    @Schema(description = "平台类型", example = "WALMART", required = true)
    private PlatformType platformType;

    @NotBlank(message = "平台代码不能为空")
    @Size(max = 50, message = "平台代码长度不能超过50个字符")
    @Schema(description = "平台代码", example = "walmart", required = true)
    private String platformCode;

    @NotNull(message = "平台状态不能为空")
    @Schema(description = "平台状态", example = "ACTIVE", required = true)
    private PlatformStatus status;

    @Size(max = 500, message = "平台描述长度不能超过500个字符")
    @Schema(description = "平台描述", example = "沃尔玛电商平台")
    private String description;

    @Schema(description = "配置模板", example = "{\"apiUrl\": \"https://api.walmart.com\"}")
    private String configTemplate;

    @Schema(description = "是否启用", example = "true")
    private Boolean enabled;

    @Schema(description = "排序顺序", example = "1")
    private Integer sortOrder;

    @Schema(description = "最后更新时间")
    private LocalDateTime lastUpdated;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    private LocalDateTime updateTime;
}