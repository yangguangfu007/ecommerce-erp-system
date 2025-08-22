package com.erp.user.dto;

import java.io.Serializable;

/**
 * 权限信息DTO
 *
 * @author ERP System
 */
public class PermissionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 权限ID
     */
    private Long id;

    /**
     * 权限名称
     */
    private String name;

    /**
     * 权限代码
     */
    private String code;

    /**
     * 权限描述
     */
    private String description;

    /**
     * 权限类型：menu-菜单，button-按钮，api-接口
     */
    private String type;

    /**
     * 资源
     */
    private String resource;

    /**
     * 操作
     */
    private String action;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    @Override
    public String toString() {
        return "PermissionDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", code='" + code + '\'' +
                ", description='" + description + '\'' +
                ", type='" + type + '\'' +
                ", resource='" + resource + '\'' +
                ", action='" + action + '\'' +
                '}';
    }
}