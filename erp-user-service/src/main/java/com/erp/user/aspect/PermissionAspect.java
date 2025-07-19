package com.erp.user.aspect;

import com.erp.common.exception.BusinessException;
import com.erp.user.annotation.RequirePermission;
import com.erp.user.service.UserService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

/**
 * 权限校验切面
 *
 * @author ERP System
 */
@Aspect
@Component
public class PermissionAspect {

    private static final Logger logger = LoggerFactory.getLogger(PermissionAspect.class);

    @Autowired
    private UserService userService;

    /**
     * 权限校验
     */
    @Before("@annotation(com.erp.user.annotation.RequirePermission) || @within(com.erp.user.annotation.RequirePermission)")
    public void checkPermission(JoinPoint joinPoint) {
        try {
            // 获取当前用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new BusinessException("用户未登录");
            }

            String username = authentication.getName();
            if ("anonymousUser".equals(username)) {
                throw new BusinessException("用户未登录");
            }

            // 获取用户信息
            com.erp.user.entity.User user = userService.getUserByUsername(username);
            if (user == null) {
                throw new BusinessException("用户不存在");
            }

            // 获取方法上的权限注解
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            RequirePermission requirePermission = method.getAnnotation(RequirePermission.class);
            
            // 如果方法上没有注解，检查类上的注解
            if (requirePermission == null) {
                requirePermission = method.getDeclaringClass().getAnnotation(RequirePermission.class);
            }

            if (requirePermission == null) {
                return; // 没有权限要求
            }

            // 获取需要的权限
            String[] requiredPermissions = getRequiredPermissions(requirePermission);
            if (requiredPermissions.length == 0) {
                return; // 没有指定权限
            }

            // 获取用户权限
            List<String> userPermissions = userService.getUserPermissions(user.getId());

            // 检查权限
            boolean hasPermission = checkUserPermissions(userPermissions, requiredPermissions, requirePermission.logical());
            
            if (!hasPermission) {
                logger.warn("用户 {} 访问方法 {} 权限不足，需要权限: {}, 用户权限: {}", 
                    username, method.getName(), Arrays.toString(requiredPermissions), userPermissions);
                throw new BusinessException("权限不足");
            }

            logger.debug("用户 {} 权限校验通过，访问方法: {}", username, method.getName());

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("权限校验异常", e);
            throw new BusinessException("权限校验失败");
        }
    }

    /**
     * 获取需要的权限
     */
    private String[] getRequiredPermissions(RequirePermission requirePermission) {
        String[] permissions = requirePermission.permissions();
        if (permissions.length == 0) {
            permissions = requirePermission.value();
        }
        return permissions;
    }

    /**
     * 检查用户权限
     */
    private boolean checkUserPermissions(List<String> userPermissions, String[] requiredPermissions, RequirePermission.Logical logical) {
        if (userPermissions == null || userPermissions.isEmpty()) {
            return false;
        }

        if (logical == RequirePermission.Logical.AND) {
            // 需要所有权限
            for (String requiredPermission : requiredPermissions) {
                if (!userPermissions.contains(requiredPermission)) {
                    return false;
                }
            }
            return true;
        } else {
            // 需要任一权限
            for (String requiredPermission : requiredPermissions) {
                if (userPermissions.contains(requiredPermission)) {
                    return true;
                }
            }
            return false;
        }
    }
}