package com.erp.common.util;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.response.PageResult;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 分页工具类
 * 提供分页对象的创建和转换功能
 *
 * @author ERP System
 */
public class PageUtils {

    /**
     * 默认页码
     */
    public static final long DEFAULT_PAGE_NUM = 1L;

    /**
     * 默认每页大小
     */
    public static final long DEFAULT_PAGE_SIZE = 10L;

    /**
     * 最大每页大小
     */
    public static final long MAX_PAGE_SIZE = 1000L;

    /**
     * 创建分页对象
     *
     * @param pageNum  页码（从1开始）
     * @param pageSize 每页大小
     * @param <T>      实体类型
     * @return 分页对象
     */
    public static <T> Page<T> createPage(Long pageNum, Long pageSize) {
        return createPage(pageNum, pageSize, null, null);
    }

    /**
     * 创建分页对象（带排序）
     *
     * @param pageNum   页码（从1开始）
     * @param pageSize  每页大小
     * @param sortField 排序字段
     * @param sortOrder 排序方向（asc/desc）
     * @param <T>       实体类型
     * @return 分页对象
     */
    public static <T> Page<T> createPage(Long pageNum, Long pageSize, String sortField, String sortOrder) {
        // 参数校验和默认值设置
        pageNum = pageNum == null || pageNum < 1 ? DEFAULT_PAGE_NUM : pageNum;
        pageSize = pageSize == null || pageSize < 1 ? DEFAULT_PAGE_SIZE : pageSize;
        pageSize = Math.min(pageSize, MAX_PAGE_SIZE); // 限制最大页面大小

        Page<T> page = new Page<>(pageNum, pageSize);

        // 设置排序
        if (sortField != null && !sortField.trim().isEmpty()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setColumn(sortField);
            orderItem.setAsc(!"desc".equalsIgnoreCase(sortOrder));
            page.addOrder(orderItem);
        }

        return page;
    }

    /**
     * 创建分页对象（多字段排序）
     *
     * @param pageNum    页码（从1开始）
     * @param pageSize   每页大小
     * @param orderItems 排序项列表
     * @param <T>        实体类型
     * @return 分页对象
     */
    public static <T> Page<T> createPage(Long pageNum, Long pageSize, List<OrderItem> orderItems) {
        Page<T> page = createPage(pageNum, pageSize);
        if (orderItems != null && !orderItems.isEmpty()) {
            page.setOrders(orderItems);
        }
        return page;
    }

    /**
     * 转换分页结果
     * 将一种类型的分页结果转换为另一种类型
     *
     * @param sourcePage 源分页对象
     * @param converter  转换函数
     * @param <S>        源类型
     * @param <T>        目标类型
     * @return 转换后的分页对象
     */
    public static <S, T> IPage<T> convertPage(IPage<S> sourcePage, Function<S, T> converter) {
        Page<T> targetPage = new Page<>(sourcePage.getCurrent(), sourcePage.getSize(), sourcePage.getTotal());
        targetPage.setOrders(sourcePage.orders());
        
        List<T> targetRecords = sourcePage.getRecords().stream()
                .map(converter)
                .collect(Collectors.toList());
        targetPage.setRecords(targetRecords);
        
        return targetPage;
    }

    /**
     * 转换分页结果为PageResult
     *
     * @param page 分页对象
     * @param <T>  数据类型
     * @return PageResult对象
     */
    public static <T> PageResult<T> toPageResult(IPage<T> page) {
        PageResult<T> pageResult = new PageResult<>();
        pageResult.setContent(page.getRecords());
        pageResult.setPage(page.getCurrent());
        pageResult.setSize(page.getSize());
        pageResult.setTotal(page.getTotal());
        pageResult.setTotalPages(page.getPages());
        return pageResult;
    }

    /**
     * 转换分页结果为PageResult（带数据转换）
     *
     * @param page      分页对象
     * @param converter 数据转换函数
     * @param <S>       源数据类型
     * @param <T>       目标数据类型
     * @return PageResult对象
     */
    public static <S, T> PageResult<T> toPageResult(IPage<S> page, Function<S, T> converter) {
        PageResult<T> pageResult = new PageResult<>();
        
        List<T> convertedContent = page.getRecords().stream()
                .map(converter)
                .collect(Collectors.toList());
        
        pageResult.setContent(convertedContent);
        pageResult.setPage(page.getCurrent());
        pageResult.setSize(page.getSize());
        pageResult.setTotal(page.getTotal());
        pageResult.setTotalPages(page.getPages());
        
        return pageResult;
    }

    /**
     * 创建排序项
     *
     * @param column 排序字段
     * @param isAsc  是否升序
     * @return 排序项
     */
    public static OrderItem createOrderItem(String column, boolean isAsc) {
        OrderItem orderItem = new OrderItem();
        orderItem.setColumn(column);
        orderItem.setAsc(isAsc);
        return orderItem;
    }

    /**
     * 创建升序排序项
     *
     * @param column 排序字段
     * @return 排序项
     */
    public static OrderItem asc(String column) {
        return createOrderItem(column, true);
    }

    /**
     * 创建降序排序项
     *
     * @param column 排序字段
     * @return 排序项
     */
    public static OrderItem desc(String column) {
        return createOrderItem(column, false);
    }

    /**
     * 创建多个排序项
     *
     * @param columns 排序字段数组，格式：["field1:asc", "field2:desc"]
     * @return 排序项列表
     */
    public static List<OrderItem> createOrderItems(String... columns) {
        List<OrderItem> orderItems = new ArrayList<>();
        
        if (columns != null) {
            for (String column : columns) {
                if (column != null && !column.trim().isEmpty()) {
                    String[] parts = column.split(":");
                    String field = parts[0].trim();
                    boolean isAsc = parts.length < 2 || !"desc".equalsIgnoreCase(parts[1].trim());
                    orderItems.add(createOrderItem(field, isAsc));
                }
            }
        }
        
        return orderItems;
    }

    /**
     * 检查分页参数是否有效
     *
     * @param pageNum  页码
     * @param pageSize 每页大小
     * @return true-有效，false-无效
     */
    public static boolean isValidPageParams(Long pageNum, Long pageSize) {
        return pageNum != null && pageNum > 0 && pageSize != null && pageSize > 0 && pageSize <= MAX_PAGE_SIZE;
    }

    /**
     * 计算总页数
     *
     * @param total    总记录数
     * @param pageSize 每页大小
     * @return 总页数
     */
    public static long calculateTotalPages(long total, long pageSize) {
        if (pageSize <= 0) {
            return 0;
        }
        return (total + pageSize - 1) / pageSize;
    }

    /**
     * 计算偏移量
     *
     * @param pageNum  页码（从1开始）
     * @param pageSize 每页大小
     * @return 偏移量
     */
    public static long calculateOffset(long pageNum, long pageSize) {
        return (pageNum - 1) * pageSize;
    }
}