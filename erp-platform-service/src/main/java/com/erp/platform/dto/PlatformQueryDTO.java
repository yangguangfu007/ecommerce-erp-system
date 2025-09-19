package com.erp.platform.dto;

import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 平台查询条件数据传输对象
 * 用于平台列表查询的条件筛选
 */
@Data
@Schema(description = "平台查询条件数据传输对象")
public class PlatformQueryDTO {

    @Schema(description = "平台类型", example = "WALMART")
    private PlatformType platformType;

    @Schema(description = "平台状态", example = "ACTIVE")
    private PlatformStatus status;

    @Schema(description = "是否启用", example = "true")
    private Boolean enabled;

    @Schema(description = "搜索关键词", example = "沃尔玛")
    private String keyword;

    @Schema(description = "页码", example = "1")
    private Integer page = 1;

    @Schema(description = "每页大小", example = "10")
    private Integer size = 10;

    @Schema(description = "排序字段", example = "createTime")
    private String sortField;

    @Schema(description = "排序方向", example = "desc")
    private String sortDirection = "desc";
}