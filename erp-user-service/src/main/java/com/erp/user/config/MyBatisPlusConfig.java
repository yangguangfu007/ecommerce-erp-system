package com.erp.user.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

/**
 * MyBatis Plus配置类
 *
 * @author ERP System
 */
@Configuration
public class MyBatisPlusConfig {

    /**
     * MyBatis Plus插件配置
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        return interceptor;
    }

    /**
     * 自动填充处理器
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                LocalDateTime now = LocalDateTime.now();
                
                // 填充创建时间
                this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
                // 填充更新时间
                this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
                // 填充逻辑删除字段
                this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
                // 填充版本号
                this.strictInsertFill(metaObject, "version", Integer.class, 1);
                
                // TODO: 从安全上下文获取当前用户ID
                // Long currentUserId = getCurrentUserId();
                // this.strictInsertFill(metaObject, "createBy", Long.class, currentUserId);
                // this.strictInsertFill(metaObject, "updateBy", Long.class, currentUserId);
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                // 填充更新时间
                this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
                
                // TODO: 从安全上下文获取当前用户ID
                // Long currentUserId = getCurrentUserId();
                // this.strictUpdateFill(metaObject, "updateBy", Long.class, currentUserId);
            }
        };
    }
}