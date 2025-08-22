package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.user.dto.RoleDTO;
import com.erp.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    User selectByUsername(@Param("username") String username);

    /**
     * 根据邮箱查询用户
     *
     * @param email 邮箱
     * @return 用户信息
     */
    User selectByEmail(@Param("email") String email);

    /**
     * 根据手机号查询用户
     *
     * @param phone 手机号
     * @return 用户信息
     */
    User selectByPhone(@Param("phone") String phone);

    /**
     * 根据用户ID查询用户角色
     *
     * @param userId 用户ID
     * @return 角色列表
     */
    List<String> selectRoleCodesByUserId(@Param("userId") Long userId);

    /**
     * 根据用户ID查询用户角色详细信息
     *
     * @param userId 用户ID
     * @return 角色详细信息列表
     */
    List<RoleDTO> selectRolesByUserId(@Param("userId") Long userId);

    /**
     * 根据用户ID查询用户权限
     *
     * @param userId 用户ID
     * @return 权限列表
     */
    List<String> selectPermissionCodesByUserId(@Param("userId") Long userId);

    /**
     * 更新用户登录信息
     *
     * @param userId 用户ID
     * @param loginTime 登录时间
     * @param loginIp 登录IP
     * @return 更新结果
     */
    int updateLoginInfo(@Param("userId") Long userId, 
                       @Param("loginTime") String loginTime, 
                       @Param("loginIp") String loginIp);

    /**
     * 更新用户密码错误次数
     *
     * @param userId 用户ID
     * @param errorCount 错误次数
     * @return 更新结果
     */
    int updatePasswordErrorCount(@Param("userId") Long userId, @Param("errorCount") Integer errorCount);

    /**
     * 锁定用户账户
     *
     * @param userId 用户ID
     * @param lockTime 锁定时间
     * @return 更新结果
     */
    int lockUser(@Param("userId") Long userId, @Param("lockTime") String lockTime);

    /**
     * 解锁用户账户
     *
     * @param userId 用户ID
     * @return 更新结果
     */
    int unlockUser(@Param("userId") Long userId);
}