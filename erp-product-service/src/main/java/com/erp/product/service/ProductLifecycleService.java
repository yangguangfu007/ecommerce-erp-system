package com.erp.product.service;

import com.erp.product.entity.Product;

/**
 * 商品生命周期管理服务接口
 */
public interface ProductLifecycleService {
    
    /**
     * 激活商品
     */
    void activateProduct(Long productId);
    
    /**
     * 停用商品
     */
    void deactivateProduct(Long productId);
    
    /**
     * 下架商品
     */
    void discontinueProduct(Long productId);
    
    /**
     * 检查商品状态变更是否允许
     */
    boolean canChangeStatus(Long productId, Product.ProductStatus fromStatus, Product.ProductStatus toStatus);
    
    /**
     * 批量更新商品状态
     */
    void batchUpdateProductStatus(java.util.List<Long> productIds, Product.ProductStatus status);
    
    /**
     * 检查商品依赖关系
     */
    ProductDependencyInfo checkProductDependencies(Long productId);
    
    /**
     * 商品依赖信息
     */
    class ProductDependencyInfo {
        private boolean hasOrders;
        private boolean hasInventory;
        private boolean hasActivePromotions;
        private long orderCount;
        private long inventoryCount;
        private String message;
        
        // getters and setters
        public boolean isHasOrders() { return hasOrders; }
        public void setHasOrders(boolean hasOrders) { this.hasOrders = hasOrders; }
        public boolean isHasInventory() { return hasInventory; }
        public void setHasInventory(boolean hasInventory) { this.hasInventory = hasInventory; }
        public boolean isHasActivePromotions() { return hasActivePromotions; }
        public void setHasActivePromotions(boolean hasActivePromotions) { this.hasActivePromotions = hasActivePromotions; }
        public long getOrderCount() { return orderCount; }
        public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
        public long getInventoryCount() { return inventoryCount; }
        public void setInventoryCount(long inventoryCount) { this.inventoryCount = inventoryCount; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public boolean canDelete() {
            return !hasOrders && !hasInventory && !hasActivePromotions;
        }
    }
}