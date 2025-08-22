package com.erp.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;

import java.util.List;

/**
 * 权限实体类
 *
 * @author ERP System
 */
@TableName("sys_permission")
public class Permission extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 权限编码
     */
    private String permissionCode;

    /**
     * 权限名称
     */
    private String permissionName;

    /**
     * 权限类型：1-菜单，2-按钮，3-接口
     */
    private Integer type;

    /**
     * 父权限ID
     */
    private Long parentId;

    /**
     * 权限路径
     */
    private String path;

    /**
     * 权限描述
     */
    private String description;

    /**
     * 权限状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 图标
     */
    private String icon;

    /**
     * 备注
     */
    private String remark;

    /**
     * 子权限列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<Permission> children;

    public String getPermissionCode() {
        return permissionCode;
    }

    public void setPermissionCode(String permissionCode) {
        this.permissionCode = permissionCode;
    }

    public String getPermissionName() {
        return permissionName;
    }

    public void setPermissionName(String permissionName) {
        this.permissionName = permissionName;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public List<Permission> getChildren() {
        return children;
    }

    public void setChildren(List<Permission> children) {
        this.children = children;
    }

    @Override
    public String toString() {
        return "Permission{" +
                "permissionCode='" + permissionCode + '\'' +
                ", permissionName='" + permissionName + '\'' +
                ", type=" + type +
                ", parentId=" + parentId +
                ", path='" + path + '\'' +
                ", description='" + description + '\'' +
                ", status=" + status +
                ", sort=" + sort +
                ", icon='" + icon + '\'' +
                ", remark='" + remark + '\'' +
                "} " + super.toString();
    }
}