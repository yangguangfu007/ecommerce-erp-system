package com.erp.notification.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.notification.entity.NotificationRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通知记录Mapper
 *
 * @author ERP System
 */
@Mapper
public interface NotificationRecordMapper extends BaseMapper<NotificationRecord> {

    /**
     * 分页查询通知记录
     *
     * @param page 分页参数
     * @param notificationType 通知类型
     * @param status 状态
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 通知记录分页
     */
    IPage<NotificationRecord> selectRecordPage(
            Page<NotificationRecord> page,
            @Param("notificationType") String notificationType,
            @Param("status") String status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * 查询需要重试的记录
     *
     * @param maxRetryTime 最大重试时间
     * @return 需要重试的记录列表
     */
    List<NotificationRecord> selectRetryRecords(@Param("maxRetryTime") LocalDateTime maxRetryTime);

    /**
     * 统计发送状态
     *
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计结果
     */
    List<NotificationRecord> selectSendStatistics(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * 根据业务信息查询记录
     *
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @return 通知记录列表
     */
    List<NotificationRecord> selectByBusiness(
            @Param("businessType") String businessType,
            @Param("businessId") String businessId
    );
}