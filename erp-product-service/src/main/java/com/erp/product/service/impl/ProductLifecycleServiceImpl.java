package com.erp.product.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.common.response.ResultCode;
import com.erp.product.entity.Product;
import com.erp.product.entity.ProductHistory;
import com.erp.product.mapper.ProductHistoryMapper;
import com.erp.product.mapper.ProductMapper;
import com.erp.product.service.ProductLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品生命周期管理服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductLifecycleServiceImpl implements ProductLifecycleService {
    
    private final ProductMapper productMapper;
    private final ProductHistoryMapper productHistoryMapper;
    
    @Override
    @Transactional
    public void activateProduct(Long productId) {
        Product product = getProductById(productId);
        
        if (product.getStatus() == Product.ProductStatus.ACTIVE) {
            throw new BusinessException("商品已经是激活状态");
        }
        
        if (!canChangeStatus(productId, product.getStatus(), Product.ProductStatus.ACTIVE)) {
            throw new BusinessException("当前状态不允许激活商品");
        }
        
        Product.ProductStatus oldStatus = product.getStatus();
        product.setStatus(Product.ProductStatus.ACTIVE);
        productMapper.updateById(product);
        
        // 记录状态变更历史
        recordStatusChange(product, oldStatus, Product.ProductStatus.ACTIVE, "激活商品");
        
        log.info("商品已激活: {}", product.getSku());
    }
    
    @Override
    @Transactional
    public void deactivateProduct(Long productId) {
        Product product = getProductById(productId);
        
        if (product.getStatus() == Product.ProductStatus.INACTIVE) {
            throw new BusinessException("商品已经是停用状态");
        }
        
        if (!canChangeStatus(productId, product.getStatus(), Product.ProductStatus.INACTIVE)) {
            throw new BusinessException("当前状态不允许停用商品");
        }
        
        Product.ProductStatus oldStatus = product.getStatus();
        product.setStatus(Product.ProductStatus.INACTIVE);
        productMapper.updateById(product);
        
        // 记录状态变更历史
        recordStatusChange(product, oldStatus, Product.ProductStatus.INACTIVE, "停用商品");
        
        log.info("商品已停用: {}", product.getSku());
    }
    
    @Override
    @Transactional
    public void discontinueProduct(Long productId) {
        Product product = getProductById(productId);
        
        if (product.getStatus() == Product.ProductStatus.DELETED) {
            throw new BusinessException("商品已经是下架状态");
        }
        
        // 检查依赖关系
        ProductDependencyInfo dependencyInfo = checkProductDependencies(productId);
        if (!dependencyInfo.canDelete()) {
            throw new BusinessException(
                "商品存在依赖关系，无法下架: " + dependencyInfo.getMessage());
        }
        
        Product.ProductStatus oldStatus = product.getStatus();
        product.setStatus(Product.ProductStatus.DELETED);
        productMapper.updateById(product);
        
        // 记录状态变更历史
        recordStatusChange(product, oldStatus, Product.ProductStatus.DELETED, "下架商品");
        
        log.info("商品已下架: {}", product.getSku());
    }
    
    @Override
    public boolean canChangeStatus(Long productId, Product.ProductStatus fromStatus, Product.ProductStatus toStatus) {
        // 定义状态转换规则
        switch (fromStatus) {
            case ACTIVE:
                // 激活状态可以转换为停用或删除
                return toStatus == Product.ProductStatus.INACTIVE || toStatus == Product.ProductStatus.DELETED;
            case INACTIVE:
                // 停用状态可以转换为激活或删除
                return toStatus == Product.ProductStatus.ACTIVE || toStatus == Product.ProductStatus.DELETED;
            case DELETED:
                // 删除状态不能转换为其他状态
                return false;
            default:
                return false;
        }
    }
    
    @Override
    @Transactional
    public void batchUpdateProductStatus(List<Long> productIds, Product.ProductStatus status) {
        for (Long productId : productIds) {
            try {
                switch (status) {
                    case ACTIVE:
                        activateProduct(productId);
                        break;
                    case INACTIVE:
                        deactivateProduct(productId);
                        break;
                    case DELETED:
                        discontinueProduct(productId);
                        break;
                    default:
                        throw new BusinessException("不支持的状态: " + status);
                }
            } catch (Exception e) {
                log.error("批量更新商品状态失败, 商品ID: {}, 状态: {}, 错误: {}", 
                         productId, status, e.getMessage());
                // 继续处理其他商品，不中断整个批量操作
            }
        }
    }
    
    @Override
    public ProductDependencyInfo checkProductDependencies(Long productId) {
        ProductDependencyInfo info = new ProductDependencyInfo();
        
        // TODO: 检查订单关联
        // 调用订单服务检查是否有关联订单
        // OrderDependencyInfo orderInfo = orderServiceClient.checkOrderDependency(productId);
        // info.setHasOrders(orderInfo.hasOrders());
        // info.setOrderCount(orderInfo.getOrderCount());
        
        // TODO: 检查库存关联
        // 调用库存服务检查是否有库存记录
        // InventoryDependencyInfo inventoryInfo = inventoryServiceClient.checkInventoryDependency(productId);
        // info.setHasInventory(inventoryInfo.hasInventory());
        // info.setInventoryCount(inventoryInfo.getInventoryCount());
        
        // TODO: 检查促销活动关联
        // 调用促销服务检查是否有活跃的促销活动
        // PromotionDependencyInfo promotionInfo = promotionServiceClient.checkPromotionDependency(productId);
        // info.setHasActivePromotions(promotionInfo.hasActivePromotions());
        
        // 暂时设置为无依赖，实际项目中需要调用相关服务
        info.setHasOrders(false);
        info.setHasInventory(false);
        info.setHasActivePromotions(false);
        info.setOrderCount(0);
        info.setInventoryCount(0);
        info.setMessage("暂无依赖关系检查");
        
        return info;
    }
    
    /**
     * 根据ID获取商品
     */
    private Product getProductById(Long productId) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new BusinessException("商品不存在");
        }
        return product;
    }
    
    /**
     * 记录状态变更历史
     */
    private void recordStatusChange(Product product, Product.ProductStatus fromStatus, 
                                  Product.ProductStatus toStatus, String remark) {
        ProductHistory history = new ProductHistory();
        history.setProductId(product.getId());
        history.setSku(product.getSku());
        history.setOperationType(ProductHistory.OperationType.STATUS_CHANGE);
        history.setBeforeData(fromStatus);
        history.setAfterData(toStatus);
        history.setChangedFields("status");
        history.setOperator("system"); // TODO: 从上下文获取当前用户
        history.setOperationTime(LocalDateTime.now());
        history.setRemark(remark + ": " + fromStatus + " -> " + toStatus);
        
        productHistoryMapper.insert(history);
    }
}