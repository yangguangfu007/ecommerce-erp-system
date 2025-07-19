package com.erp.user.annotation;

import java.lang.annotation.*;

/**
 * 权限校验注解
 * 用于方法级别的权限控制
 *
 * @author ERP System
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequirePermission {

    /**
     * 权限编码
     */
    String[] value() default {};

    /**
     * 权限编码（别名）
     */
    String[] permissions() default {};

    /**
     * 逻辑关系：AND-需要所有权限，OR-需要任一权限
     */
    Logical logical() default Logical.AND;

    /**
     * 逻辑关系枚举
     */
    enum Logical {
        AND, OR
    }
}