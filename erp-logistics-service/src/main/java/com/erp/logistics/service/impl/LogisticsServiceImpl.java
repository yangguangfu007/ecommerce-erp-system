package com.erp.logistics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.response.PageResult;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.util.PageUtils;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.logistics.dto.*;
import com.erp.logistics.entity.LogisticsOrder;
import com.erp.logistics.entity.ShippingLabel;
import com.erp.logistics.entity.LogisticsException;
import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.ExceptionStatus;
import com.erp.logistics.mapper.LogisticsOrderMapper;
import com.erp.logistics.mapper.ShippingLabelMapper;
import com.erp.logistics.service.LogisticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * 物流服务实现类
 * 继承BaseServicePlusImpl获得增强的业务方法
 *
 * @author ERP System
 */
@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class LogisticsServiceImpl extends BaseServicePlusImpl<LogisticsOrderMapper, LogisticsOrder> 
    implements LogisticsService {

    @Autowired
    private ShippingLabelMapper shippingLabelMapper;

    @Override
    public LogisticsOrder createLogisticsOrder(LogisticsOrderDTO logisticsOrderDTO) {
        log.info("创建物流订单，业务订单ID：{}", logisticsOrderDTO.getBusinessOrderId());
        
        // 检查业务订单是否已存在物流订单
        LogisticsOrder existingOrder = getLogisticsOrderByBusinessOrderId(logisticsOrderDTO.getBusinessOrderId());
        if (existingOrder != null) {
            log.warn("业务订单已存在物流订单，业务订单ID：{}", logisticsOrderDTO.getBusinessOrderId());
            throw new RuntimeException("业务订单已存在物流订单");
        }
        
        // 创建物流订单
        LogisticsOrder logisticsOrder = new LogisticsOrder();
        BeanUtils.copyProperties(logisticsOrderDTO, logisticsOrder);
        
        // 生成物流订单号
        if (!StringUtils.hasText(logisticsOrder.getLogisticsOrderNo())) {
            logisticsOrder.setLogisticsOrderNo(generateLogisticsOrderNo());
        }
        
        // 设置默认状态
        if (logisticsOrder.getStatus() == null) {
            logisticsOrder.setStatus(LogisticsStatus.PENDING);
        }
        
        // 设置默认币种
        if (!StringUtils.hasText(logisticsOrder.getCurrency())) {
            logisticsOrder.setCurrency("CNY");
        }
        
        // 保存物流订单
        save(logisticsOrder);
        
        log.info("物流订单创建成功，订单号：{}", logisticsOrder.getLogisticsOrderNo());
        return logisticsOrder;
    }

    @Override
    public LogisticsOrder updateLogisticsOrder(Long id, LogisticsOrderDTO logisticsOrderDTO) {
        log.info("更新物流订单，ID：{}", id);
        
        // 查询现有订单
        LogisticsOrder existingOrder = getById(id);
        if (existingOrder == null) {
            log.error("物流订单不存在，ID：{}", id);
            throw new RuntimeException("物流订单不存在");
        }
        
        // 更新订单信息
        BeanUtils.copyProperties(logisticsOrderDTO, existingOrder, "id", "logisticsOrderNo", "createTime");
        
        // 更新订单
        updateById(existingOrder);
        
        log.info("物流订单更新成功，订单号：{}", existingOrder.getLogisticsOrderNo());
        return existingOrder;
    }

    @Override
    public PageResult<LogisticsOrder> getLogisticsOrderPage(Long page, Long size, LogisticsOrderQueryDTO queryDTO) {
        log.debug("分页查询物流订单，页码：{}，大小：{}", page, size);
        
        // 创建分页对象
        Page<LogisticsOrder> pageObj = PageUtils.createPage(page, size);
        
        // 构建查询条件
        LambdaQueryWrapper<LogisticsOrder> wrapper = buildQueryWrapper(queryDTO);
        
        // 执行分页查询
        Page<LogisticsOrder> result = page(pageObj, wrapper);
        
        log.debug("物流订单分页查询完成，总数：{}", result.getTotal());
        return PageUtils.toPageResult(result);
    }

    @Override
    public LogisticsOrder getLogisticsOrderByBusinessOrderId(Long businessOrderId) {
        log.debug("根据业务订单ID查询物流订单，业务订单ID：{}", businessOrderId);
        
        LambdaQueryWrapper<LogisticsOrder> wrapper = QueryWrapperUtils.lambdaQuery(LogisticsOrder.class);
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getBusinessOrderId, businessOrderId);
        
        return getOne(wrapper);
    }

    @Override
    public LogisticsOrder getLogisticsOrderByTrackingNumber(String trackingNumber) {
        log.debug("根据运单号查询物流订单，运单号：{}", trackingNumber);
        
        LambdaQueryWrapper<LogisticsOrder> wrapper = QueryWrapperUtils.lambdaQuery(LogisticsOrder.class);
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getTrackingNumber, trackingNumber);
        
        return getOne(wrapper);
    }

    @Override
    public int batchUpdateStatus(List<String> trackingNumbers, LogisticsStatus status) {
        log.info("批量更新物流状态，运单数量：{}，新状态：{}", trackingNumbers.size(), status);
        
        if (trackingNumbers == null || trackingNumbers.isEmpty()) {
            log.warn("运单号列表为空，跳过批量更新");
            return 0;
        }
        
        // 构建更新条件
        LambdaUpdateWrapper<LogisticsOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.set(LogisticsOrder::getStatus, status)
                    .set(LogisticsOrder::getUpdateTime, LocalDateTime.now())
                    .in(LogisticsOrder::getTrackingNumber, trackingNumbers);
        
        // 执行批量更新
        boolean result = update(updateWrapper);
        int updateCount = result ? trackingNumbers.size() : 0;
        
        log.info("批量更新物流状态完成，更新数量：{}", updateCount);
        return updateCount;
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<LogisticsOrder> buildQueryWrapper(LogisticsOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<LogisticsOrder> wrapper = QueryWrapperUtils.lambdaQuery(LogisticsOrder.class);
        
        if (queryDTO == null) {
            return wrapper.orderByDesc(LogisticsOrder::getCreateTime);
        }
        
        // 精确匹配条件
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getLogisticsOrderNo, queryDTO.getLogisticsOrderNo());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getBusinessOrderId, queryDTO.getBusinessOrderId());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getBusinessOrderNo, queryDTO.getBusinessOrderNo());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getLogisticsType, queryDTO.getLogisticsType());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getStatus, queryDTO.getStatus());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getProviderCode, queryDTO.getProviderCode());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsOrder::getTrackingNumber, queryDTO.getTrackingNumber());
        
        // 时间范围条件
        QueryWrapperUtils.betweenTime(wrapper, LogisticsOrder::getCreateTime, 
            queryDTO.getCreateTimeStart(), queryDTO.getCreateTimeEnd());
        QueryWrapperUtils.betweenTime(wrapper, LogisticsOrder::getEstimatedShipTime, 
            queryDTO.getEstimatedShipTimeStart(), queryDTO.getEstimatedShipTimeEnd());
        QueryWrapperUtils.betweenTime(wrapper, LogisticsOrder::getActualShipTime, 
            queryDTO.getActualShipTimeStart(), queryDTO.getActualShipTimeEnd());
        
        // 关键词搜索
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(LogisticsOrder::getLogisticsOrderNo, queryDTO.getKeyword())
                            .or().like(LogisticsOrder::getBusinessOrderNo, queryDTO.getKeyword())
                            .or().like(LogisticsOrder::getTrackingNumber, queryDTO.getKeyword()));
        }
        
        // 默认按创建时间倒序
        return wrapper.orderByDesc(LogisticsOrder::getCreateTime);
    }

    @Override
    public List<ShippingLabel> batchGenerateLabels(List<ShippingLabelDTO> shippingLabelDTOs) {
        log.info("批量生成面单，数量：{}", shippingLabelDTOs.size());
        
        if (shippingLabelDTOs == null || shippingLabelDTOs.isEmpty()) {
            log.warn("面单DTO列表为空，跳过批量生成");
            return new ArrayList<>();
        }
        
        List<ShippingLabel> shippingLabels = new ArrayList<>();
        
        for (ShippingLabelDTO dto : shippingLabelDTOs) {
            // 验证物流订单是否存在
            LogisticsOrder logisticsOrder = getById(dto.getLogisticsOrderId());
            if (logisticsOrder == null) {
                log.error("物流订单不存在，ID：{}", dto.getLogisticsOrderId());
                throw new RuntimeException("物流订单不存在，ID：" + dto.getLogisticsOrderId());
            }
            
            // 创建面单
            ShippingLabel shippingLabel = new ShippingLabel();
            shippingLabel.setLogisticsOrderId(dto.getLogisticsOrderId());
            
            // 生成面单编号
            shippingLabel.setLabelNumber(generateLabelNumber());
            
            // 设置运单号（从物流订单获取，如果没有则生成一个临时的）
            String trackingNumber = logisticsOrder.getTrackingNumber();
            if (!StringUtils.hasText(trackingNumber)) {
                // 如果物流订单还没有运单号，生成一个临时的
                trackingNumber = generateTrackingNumber();
                // 同时更新物流订单的运单号
                logisticsOrder.setTrackingNumber(trackingNumber);
                updateById(logisticsOrder);
            }
            shippingLabel.setTrackingNumber(trackingNumber);
            
            // 设置面单格式
            if (StringUtils.hasText(dto.getLabelFormat())) {
                // 这里需要根据字符串转换为枚举，简化处理
                shippingLabel.setFormat(com.erp.logistics.enums.LabelFormat.PDF);
            } else {
                shippingLabel.setFormat(com.erp.logistics.enums.LabelFormat.PDF);
            }
            
            // 设置面单尺寸
            if (StringUtils.hasText(dto.getLabelSize())) {
                shippingLabel.setLabelSize(dto.getLabelSize());
            } else {
                shippingLabel.setLabelSize("100x150");
            }
            
            // 设置打印次数
            if (dto.getCopies() != null) {
                shippingLabel.setPrintCount(dto.getCopies());
            } else {
                shippingLabel.setPrintCount(1);
            }
            
            // 设置默认状态
            shippingLabel.setStatus(com.erp.logistics.enums.LabelStatus.GENERATED);
            shippingLabel.setPrinted(false);
            
            // 模拟生成面单URL
            shippingLabel.setLabelUrl(generateLabelUrl(shippingLabel.getLabelNumber()));
            
            // 设置生成参数
            if (dto.getExtendParams() != null) {
                shippingLabel.setGenerateParams(dto.getExtendParams());
            }
            
            shippingLabels.add(shippingLabel);
        }
        
        // 使用ShippingLabelMapper的批量插入方法
        for (ShippingLabel label : shippingLabels) {
            shippingLabelMapper.insert(label);
        }
        
        log.info("批量生成面单完成，成功数量：{}", shippingLabels.size());
        return shippingLabels;
    }

    @Override
    public Map<String, Object> getTrackingInfo(String trackingNumber) {
        log.debug("获取物流跟踪信息，运单号：{}", trackingNumber);
        
        // 查询物流订单
        LogisticsOrder logisticsOrder = getLogisticsOrderByTrackingNumber(trackingNumber);
        if (logisticsOrder == null) {
            log.warn("未找到对应的物流订单，运单号：{}", trackingNumber);
            throw new RuntimeException("未找到对应的物流订单");
        }
        
        // 构建跟踪信息
        Map<String, Object> trackingInfo = new HashMap<>();
        trackingInfo.put("trackingNumber", trackingNumber);
        trackingInfo.put("status", logisticsOrder.getStatus());
        trackingInfo.put("providerName", logisticsOrder.getProviderName());
        trackingInfo.put("providerCode", logisticsOrder.getProviderCode());
        trackingInfo.put("estimatedDeliveryTime", logisticsOrder.getEstimatedDeliveryTime());
        trackingInfo.put("actualDeliveryTime", logisticsOrder.getActualDeliveryTime());
        
        // 模拟跟踪轨迹
        List<Map<String, Object>> trackingEvents = new ArrayList<>();
        
        Map<String, Object> event1 = new HashMap<>();
        event1.put("time", logisticsOrder.getCreateTime());
        event1.put("location", "发货仓库");
        event1.put("description", "包裹已发出");
        event1.put("status", "已发货");
        trackingEvents.add(event1);
        
        if (logisticsOrder.getActualShipTime() != null) {
            Map<String, Object> event2 = new HashMap<>();
            event2.put("time", logisticsOrder.getActualShipTime());
            event2.put("location", "运输中");
            event2.put("description", "包裹运输中");
            event2.put("status", "运输中");
            trackingEvents.add(event2);
        }
        
        if (logisticsOrder.getActualDeliveryTime() != null) {
            Map<String, Object> event3 = new HashMap<>();
            event3.put("time", logisticsOrder.getActualDeliveryTime());
            event3.put("location", "目的地");
            event3.put("description", "包裹已送达");
            event3.put("status", "已送达");
            trackingEvents.add(event3);
        }
        
        trackingInfo.put("trackingEvents", trackingEvents);
        
        log.debug("物流跟踪信息获取完成，运单号：{}", trackingNumber);
        return trackingInfo;
    }

    @Override
    public PageResult<LogisticsException> getLogisticsExceptionPage(Long page, Long size, LogisticsExceptionQueryDTO queryDTO) {
        log.debug("分页查询物流异常，页码：{}，大小：{}", page, size);
        
        // 构建查询条件
        LambdaQueryWrapper<LogisticsException> wrapper = buildExceptionQueryWrapper(queryDTO);
        log.debug("构建查询条件完成，条件数量：{}", wrapper.getExpression().getNormal().size());
        
        // 这里简化处理，实际应该有专门的ExceptionMapper
        // 暂时返回空结果，但保持分页结构
        Page<LogisticsException> result = PageUtils.createPage(page, size);
        result.setTotal(0);
        result.setRecords(new ArrayList<>());
        
        log.debug("物流异常分页查询完成，总数：{}", result.getTotal());
        return PageUtils.toPageResult(result);
    }

    @Override
    public LogisticsException createLogisticsException(LogisticsExceptionDTO exceptionDTO) {
        log.info("创建物流异常，运单号：{}", exceptionDTO.getTrackingNumber());
        
        // 验证物流订单是否存在
        LogisticsOrder logisticsOrder = getById(exceptionDTO.getLogisticsOrderId());
        if (logisticsOrder == null) {
            log.error("物流订单不存在，ID：{}", exceptionDTO.getLogisticsOrderId());
            throw new RuntimeException("物流订单不存在");
        }
        
        // 创建异常记录
        LogisticsException exception = new LogisticsException();
        BeanUtils.copyProperties(exceptionDTO, exception);
        
        // 设置默认状态
        if (exception.getStatus() == null) {
            exception.setStatus(ExceptionStatus.PENDING);
        }
        
        // 设置发生时间
        if (exception.getOccurredTime() == null) {
            exception.setOccurredTime(LocalDateTime.now());
        }
        
        // 这里简化处理，实际应该保存到数据库
        // exceptionMapper.insert(exception);
        
        log.info("物流异常创建成功，异常ID：{}", exception.getId());
        return exception;
    }

    @Override
    public LogisticsException handleLogisticsException(Long exceptionId, String solution, String handler) {
        log.info("处理物流异常，异常ID：{}，处理人：{}", exceptionId, handler);
        
        // 这里简化处理，实际应该从数据库查询和更新
        LogisticsException exception = new LogisticsException();
        exception.setId(exceptionId);
        exception.setSolution(solution);
        exception.setHandler(handler);
        exception.setHandledTime(LocalDateTime.now());
        exception.setStatus(ExceptionStatus.RESOLVED);
        
        log.info("物流异常处理完成，异常ID：{}", exceptionId);
        return exception;
    }

    /**
     * 构建异常查询条件
     */
    private LambdaQueryWrapper<LogisticsException> buildExceptionQueryWrapper(LogisticsExceptionQueryDTO queryDTO) {
        LambdaQueryWrapper<LogisticsException> wrapper = QueryWrapperUtils.lambdaQuery(LogisticsException.class);
        
        if (queryDTO == null) {
            return wrapper.orderByDesc(LogisticsException::getCreateTime);
        }
        
        // 精确匹配条件
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsException::getLogisticsOrderId, queryDTO.getLogisticsOrderId());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsException::getTrackingNumber, queryDTO.getTrackingNumber());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsException::getExceptionType, queryDTO.getExceptionType());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsException::getStatus, queryDTO.getStatus());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsException::getResponsibleParty, queryDTO.getResponsibleParty());
        QueryWrapperUtils.eqIfPresent(wrapper, LogisticsException::getHandler, queryDTO.getHandler());
        
        // 时间范围条件
        QueryWrapperUtils.betweenTime(wrapper, LogisticsException::getOccurredTime, 
            queryDTO.getOccurredTimeStart(), queryDTO.getOccurredTimeEnd());
        QueryWrapperUtils.betweenTime(wrapper, LogisticsException::getHandledTime, 
            queryDTO.getHandledTimeStart(), queryDTO.getHandledTimeEnd());
        
        // 关键词搜索
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(LogisticsException::getTitle, queryDTO.getKeyword())
                            .or().like(LogisticsException::getDescription, queryDTO.getKeyword())
                            .or().like(LogisticsException::getTrackingNumber, queryDTO.getKeyword()));
        }
        
        // 默认按创建时间倒序
        return wrapper.orderByDesc(LogisticsException::getCreateTime);
    }

    /**
     * 生成物流订单号
     */
    private String generateLogisticsOrderNo() {
        // 简单的订单号生成逻辑：LO + 时间戳 + 随机数
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return String.format("LO%d%03d", timestamp, random);
    }

    /**
     * 生成面单编号
     */
    private String generateLabelNumber() {
        // 简单的面单编号生成逻辑：SL + 时间戳 + 随机数
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return String.format("SL%d%03d", timestamp, random);
    }

    /**
     * 生成面单URL
     */
    private String generateLabelUrl(String labelNumber) {
        // 模拟面单URL
        return String.format("https://labels.example.com/%s.pdf", labelNumber);
    }

    /**
     * 生成运单号
     */
    private String generateTrackingNumber() {
        // 简单的运单号生成逻辑：TN + 时间戳 + 随机数
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return String.format("TN%d%03d", timestamp, random);
    }
}