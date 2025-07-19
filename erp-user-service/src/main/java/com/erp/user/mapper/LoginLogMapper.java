package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.user.entity.LoginLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 登录日志Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface LoginLogMapper extends BaseMapper<LoginLog> {

    /**
     * 根据用户ID查询登录日志
     *
     * @param userId 用户ID
     * @param limit 限制条数
     * @return 登录日志列表
     */
    List<LoginLog> selectByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 根据IP查询登录日志
     *
     * @param loginIp 登录IP
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 登录日志列表
     */
    List<LoginLog> selectByIpAndTime(@Param("loginIp") String loginIp, 
                                   @Param("startTime") LocalDateTime startTime, 
                                   @Param("endTime") LocalDateTime endTime);

    /**
     * 统计用户登录次数
     *
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 登录次数
     */
    int countLoginByUserId(@Param("userId") Long userId, 
                          @Param("startTime") LocalDateTime startTime, 
                          @Param("endTime") LocalDateTime endTime);

    /**
     * 统计IP登录次数
     *
     * @param loginIp 登录IP
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 登录次数
     */
    int countLoginByIp(@Param("loginIp") String loginIp, 
                      @Param("startTime") LocalDateTime startTime, 
                      @Param("endTime") LocalDateTime endTime);

    /**
     * 查询异常登录记录
     *
     * @param hours 时间范围（小时）
     * @return 异常登录记录
     */
    List<LoginLog> selectAbnormalLogins(@Param("hours") Integer hours);

    /**
     * 删除过期日志
     *
     * @param beforeTime 时间点
     * @return 删除条数
     */
    int deleteExpiredLogs(@Param("beforeTime") LocalDateTime beforeTime);
}