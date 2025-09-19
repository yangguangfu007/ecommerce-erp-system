package com.erp.common.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 分页查询结果封装类
 * 统一分页响应格式
 *
 * @param <T> 数据类型
 * @author ERP System
 */
@Data
public class PageResult<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 数据列表
     */
    private List<T> content;

    /**
     * 当前页码（从1开始）
     */
    private Long page;

    /**
     * 每页大小
     */
    private Long size;

    /**
     * 总记录数
     */
    private Long total;

    /**
     * 总页数
     */
    private Long totalPages;

    /**
     * 是否为第一页
     */
    private Boolean first;

    /**
     * 是否为最后一页
     */
    private Boolean last;

    /**
     * 是否有上一页
     */
    private Boolean hasPrevious;

    /**
     * 是否有下一页
     */
    private Boolean hasNext;

    /**
     * 查询时间戳
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    /**
     * 默认构造函数
     */
    public PageResult() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 构造函数
     *
     * @param content    数据列表
     * @param page       当前页码
     * @param size       每页大小
     * @param total      总记录数
     * @param totalPages 总页数
     */
    public PageResult(List<T> content, Long page, Long size, Long total, Long totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = totalPages;
        this.timestamp = LocalDateTime.now();
        
        // 计算分页状态
        calculatePageStatus();
    }

    /**
     * 设置分页数据并计算分页状态
     */
    public void setPageData(List<T> content, Long page, Long size, Long total, Long totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = totalPages;
        
        // 计算分页状态
        calculatePageStatus();
    }

    /**
     * 计算分页状态
     */
    private void calculatePageStatus() {
        if (page != null && totalPages != null) {
            this.first = page <= 1;
            this.last = page >= totalPages;
            this.hasPrevious = page > 1;
            this.hasNext = page < totalPages;
        } else {
            this.first = true;
            this.last = true;
            this.hasPrevious = false;
            this.hasNext = false;
        }
    }

    /**
     * 创建空的分页结果
     *
     * @param <T> 数据类型
     * @return 空的分页结果
     */
    public static <T> PageResult<T> empty() {
        PageResult<T> result = new PageResult<>();
        result.setContent(List.of());
        result.setPage(1L);
        result.setSize(10L);
        result.setTotal(0L);
        result.setTotalPages(0L);
        result.calculatePageStatus();
        return result;
    }

    /**
     * 创建分页结果
     *
     * @param content    数据列表
     * @param page       当前页码
     * @param size       每页大小
     * @param total      总记录数
     * @param totalPages 总页数
     * @param <T>        数据类型
     * @return 分页结果
     */
    public static <T> PageResult<T> of(List<T> content, Long page, Long size, Long total, Long totalPages) {
        return new PageResult<>(content, page, size, total, totalPages);
    }

    /**
     * 创建分页结果（自动计算总页数）
     *
     * @param content 数据列表
     * @param page    当前页码
     * @param size    每页大小
     * @param total   总记录数
     * @param <T>     数据类型
     * @return 分页结果
     */
    public static <T> PageResult<T> of(List<T> content, Long page, Long size, Long total) {
        Long totalPages = size > 0 ? (total + size - 1) / size : 0L;
        return new PageResult<>(content, page, size, total, totalPages);
    }

    /**
     * 获取当前页的记录数
     *
     * @return 当前页记录数
     */
    public int getCurrentPageSize() {
        return content != null ? content.size() : 0;
    }

    /**
     * 是否为空结果
     *
     * @return true-空结果，false-非空结果
     */
    public boolean isEmpty() {
        return content == null || content.isEmpty();
    }

    /**
     * 获取分页信息摘要
     *
     * @return 分页信息字符串
     */
    public String getPageSummary() {
        return String.format("第%d页，共%d页，每页%d条，总计%d条记录", 
                            page, totalPages, size, total);
    }

    /**
     * 重写toString方法
     */
    @Override
    public String toString() {
        return "PageResult{" +
                "page=" + page +
                ", size=" + size +
                ", total=" + total +
                ", totalPages=" + totalPages +
                ", currentPageSize=" + getCurrentPageSize() +
                ", first=" + first +
                ", last=" + last +
                ", hasPrevious=" + hasPrevious +
                ", hasNext=" + hasNext +
                ", timestamp=" + timestamp +
                '}';
    }
}