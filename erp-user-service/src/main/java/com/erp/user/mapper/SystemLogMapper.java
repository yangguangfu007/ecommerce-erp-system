package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.mapper.BaseMapperPlus;
import com.erp.user.entity.SystemLog;
import com.erp.user.enums.LogLevel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 系统日志数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 * 
 * @author ERP System
 */
@Mapper
public interface SystemLogMapper extends BaseMapperPlus<SystemLog> {
    
    /**
     * 根据日志级别查询日志列表
     * 
     * @param logLevel 日志级别
     * @param limit 限制数量
     * @return 日志列表
     */
    @Select("SELECT * FROM system_logs WHERE log_level = #{logLevel} AND deleted = 0 ORDER BY create_time DESC LIMIT #{limit}")
    List<SystemLog> selectByLogLevel(@Param("logLevel") LogLevel logLevel, @Param("limit") Integer limit);
    
    /**
     * 根据模块名称查询日志列表
     * 
     * @param moduleName 模块名称
     * @param limit 限制数量
     * @return 日志列表
     */
    @Select("SELECT * FROM system_logs WHERE module_name = #{moduleName} AND deleted = 0 ORDER BY create_time DESC LIMIT #{limit}")
    List<SystemLog> selectByModuleName(@Param("moduleName") String moduleName, @Param("limit") Integer limit);
    
    /**
     * 根据用户ID查询日志列表
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 日志列表
     */
    @Select("SELECT * FROM system_logs WHERE user_id = #{userId} AND deleted = 0 ORDER BY create_time DESC LIMIT #{limit}")
    List<SystemLog> selectByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);
    
    /**
     * 统计指定时间范围内的日志数量
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日志数量
     */
    @Select("SELECT COUNT(*) FROM system_logs WHERE create_time BETWEEN #{startTime} AND #{endTime} AND deleted = 0")
    Long countByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    /**
     * 根据日志级别统计数量
     * 
     * @param logLevel 日志级别
     * @return 日志数量
     */
    @Select("SELECT COUNT(*) FROM system_logs WHERE log_level = #{logLevel} AND deleted = 0")
    Long countByLogLevel(@Param("logLevel") LogLevel logLevel);
    
    /**
     * 查询所有日志级别及其数量统计
     * 
     * @return 级别统计结果
     */
    @Select("SELECT log_level, COUNT(*) as count FROM system_logs WHERE deleted = 0 GROUP BY log_level ORDER BY log_level")
    List<java.util.Map<String, Object>> selectLogLevelStats();
    
    /**
     * 查询所有模块及其日志数量统计
     * 
     * @return 模块统计结果
     */
    @Select("SELECT module_name, COUNT(*) as count FROM system_logs WHERE deleted = 0 GROUP BY module_name ORDER BY count DESC")
    List<java.util.Map<String, Object>> selectModuleStats();
    
    /**
     * 分页查询系统日志（支持时间范围、级别、模块筛选）
     * 使用BaseMapperPlus的增强分页方法
     * 
     * @param page 分页对象
     * @param queryWrapper 查询条件
     * @return 分页结果
     */
    default IPage<SystemLog> selectLogPage(IPage<SystemLog> page, LambdaQueryWrapper<SystemLog> queryWrapper) {
        return selectPageByCondition(page, queryWrapper);
    }
    
    /**
     * 查询最近的错误日志
     * 
     * @param limit 限制数量
     * @return 错误日志列表
     */
    @Select("SELECT * FROM system_logs WHERE log_level = 'ERROR' AND deleted = 0 ORDER BY create_time DESC LIMIT #{limit}")
    List<SystemLog> selectRecentErrors(@Param("limit") Integer limit);
    
    /**
     * 查询指定时间范围内的异常日志数量
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 异常日志数量
     */
    @Select("SELECT COUNT(*) FROM system_logs WHERE log_level IN ('WARN', 'ERROR') AND create_time BETWEEN #{startTime} AND #{endTime} AND deleted = 0")
    Long countExceptionsByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    /**
     * 删除指定时间之前的日志（物理删除，用于日志清理）
     * 
     * @param beforeTime 时间点
     * @return 删除的记录数
     */
    @Select("DELETE FROM system_logs WHERE create_time < #{beforeTime}")
    int deleteLogsBefore(@Param("beforeTime") LocalDateTime beforeTime);
    
    /**
     * 查询慢查询日志（执行时间超过指定阈值）
     * 
     * @param executionTimeThreshold 执行时间阈值（毫秒）
     * @param limit 限制数量
     * @return 慢查询日志列表
     */
    @Select("SELECT * FROM system_logs WHERE execution_time > #{executionTimeThreshold} AND deleted = 0 ORDER BY execution_time DESC LIMIT #{limit}")
    List<SystemLog> selectSlowLogs(@Param("executionTimeThreshold") Long executionTimeThreshold, @Param("limit") Integer limit);
}