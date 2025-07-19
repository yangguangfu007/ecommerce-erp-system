package com.erp.product.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.product.entity.ProductHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品历史记录数据访问层
 */
@Mapper
public interface ProductHistoryMapper extends BaseMapper<ProductHistory> {
    
    /**
     * 根据商品ID查询历史记录
     */
    List<ProductHistory> selectByProductId(@Param("productId") Long productId);
    
    /**
     * 分页查询商品历史记录
     */
    IPage<ProductHistory> selectHistoryPage(Page<ProductHistory> page, @Param("productId") Long productId);
    
    /**
     * 根据SKU查询历史记录
     */
    List<ProductHistory> selectBySku(@Param("sku") String sku);
    
    /**
     * 清理过期历史记录
     */
    int deleteExpiredHistory(@Param("days") int days);
}