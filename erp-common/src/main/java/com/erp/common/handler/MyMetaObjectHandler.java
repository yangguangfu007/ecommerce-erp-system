package com.erp.common.handler;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.erp.common.context.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * MyBatis Plus自动填充处理器
 * 负责在插入和更新时自动填充审计字段
 *
 * @author ERP System
 */
@Slf4j
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    /**
     * 插入时自动填充
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        log.debug("开始插入填充...");
        
        LocalDateTime now = LocalDateTime.now();
        Long currentUserId = getCurrentUserId();
        
        // 填充创建时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
        // 填充更新时间
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
        // 填充逻辑删除标志
        this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
        // 填充版本号（乐观锁）
        this.strictInsertFill(metaObject, "version", Integer.class, 1);
        
        // 填充创建人ID
        if (currentUserId != null) {
            this.strictInsertFill(metaObject, "createBy", Long.class, currentUserId);
            this.strictInsertFill(metaObject, "updateBy", Long.class, currentUserId);
        }
        
        log.debug("插入填充完成，创建时间：{}，创建人：{}", now, currentUserId);
    }

    /**
     * 更新时自动填充
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        log.debug("开始更新填充...");
        
        LocalDateTime now = LocalDateTime.now();
        Long currentUserId = getCurrentUserId();
        
        // 填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, now);
        
        // 填充更新人ID
        if (currentUserId != null) {
            this.strictUpdateFill(metaObject, "updateBy", Long.class, currentUserId);
        }
        
        log.debug("更新填充完成，更新时间：{}，更新人：{}", now, currentUserId);
    }

    /**
     * 获取当前用户ID
     * 优先从UserContext获取，如果获取不到则返回系统用户ID
     *
     * @return 当前用户ID
     */
    private Long getCurrentUserId() {
        try {
            // 尝试从用户上下文获取当前用户ID
            Long userId = UserContext.getCurrentUserId();
            if (userId != null) {
                return userId;
            }
        } catch (Exception e) {
            log.debug("获取当前用户ID失败，使用系统默认用户ID", e);
        }
        
        // 如果获取不到当前用户，返回系统用户ID
        return 1L;
    }

    /**
     * 获取当前用户名
     * 用于日志记录等场景
     *
     * @return 当前用户名
     */
    private String getCurrentUsername() {
        try {
            String username = UserContext.getCurrentUsername();
            if (username != null) {
                return username;
            }
        } catch (Exception e) {
            log.debug("获取当前用户名失败", e);
        }
        
        return "system";
    }
}