package com.erp.user.dto;

import java.util.List;

/**
 * 分页响应DTO
 * 与前端PageResponse接口保持一致
 *
 * @author ERP System
 */
public class PageResponse<T> {
    
    /**
     * 数据列表
     */
    private List<T> list;
    
    /**
     * 总记录数
     */
    private int total;
    
    /**
     * 当前页码
     */
    private int page;
    
    /**
     * 每页大小
     */
    private int size;
    
    /**
     * 总页数
     */
    private int pages;
    
    public PageResponse() {
    }
    
    public PageResponse(List<T> list, int total, int page, int size, int pages) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.pages = pages;
    }
    
    public List<T> getList() {
        return list;
    }
    
    public void setList(List<T> list) {
        this.list = list;
    }
    
    public int getTotal() {
        return total;
    }
    
    public void setTotal(int total) {
        this.total = total;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public int getPages() {
        return pages;
    }
    
    public void setPages(int pages) {
        this.pages = pages;
    }
}