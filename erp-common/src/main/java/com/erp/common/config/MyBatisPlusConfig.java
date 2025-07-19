package com.erp.common.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * MyBatis Plus配置
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
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        return interceptor;
    }

    /**
     * 自动填充处理器
     */
    @Component
    public static class MyMetaObjectHandler implements MetaObjectHandler {

        @Override
        public void insertFill(MetaObject metaObject) {
            LocalDateTime now = LocalDateTime.now();
            
            // 填充创建时间
            this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
            // 填充更新时间
            this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
            // 填充逻辑删除标志
            this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
            // 填充版本号
            this.strictInsertFill(metaObject, "version", Integer.class, 1);
            
            // TODO: 从当前登录用户获取用户ID
            // 填充创建人ID
            this.strictInsertFill(metaObject, "createBy", Long.class, getCurrentUserId());
            // 填充更新人ID
            this.strictInsertFill(metaObject, "updateBy", Long.class, getCurrentUserId());
        }

        @Override
        public void updateFill(MetaObject metaObject) {
            // 填充更新时间
            this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
            
            // TODO: 从当前登录用户获取用户ID
            // 填充更新人ID
            this.strictUpdateFill(metaObject, "updateBy", Long.class, getCurrentUserId());
        }

        /**
         * 获取当前用户ID
         * TODO: 实现从SecurityContext或ThreadLocal获取当前用户ID
         */
        private Long getCurrentUserId() {
            // 暂时返回系统用户ID，后续集成用户认证后修改
            return 1L;
        }
    }
}