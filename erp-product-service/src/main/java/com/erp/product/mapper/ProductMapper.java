package com.erp.product.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.product.dto.ProductSearchDTO;
import com.erp.product.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品数据访问层
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    
    /**
     * 根据SKU查询商品
     */
    Product selectBySku(@Param("sku") String sku);
    
    /**
     * 检查SKU是否存在
     */
    boolean existsBySku(@Param("sku") String sku);
    
    /**
     * 分页搜索商品
     */
    IPage<Product> searchProducts(Page<Product> page, @Param("search") ProductSearchDTO searchDTO);
    
    /**
     * 根据分类ID查询商品列表
     */
    List<Product> selectByCategoryId(@Param("categoryId") Long categoryId);
    
    /**
     * 批量更新商品状态
     */
    int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("status") Product.ProductStatus status);
    
    /**
     * 获取商品统计信息
     */
    ProductStatistics getProductStatistics();
    
    /**
     * 商品统计信息内部类
     */
    class ProductStatistics {
        private Long totalCount;
        private Long activeCount;
        private Long inactiveCount;
        
        // getters and setters
        public Long getTotalCount() { return totalCount; }
        public void setTotalCount(Long totalCount) { this.totalCount = totalCount; }
        public Long getActiveCount() { return activeCount; }
        public void setActiveCount(Long activeCount) { this.activeCount = activeCount; }
        public Long getInactiveCount() { return inactiveCount; }
        public void setInactiveCount(Long inactiveCount) { this.inactiveCount = inactiveCount; }
    }
}