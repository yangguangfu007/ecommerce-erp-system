package com.erp.platform.walmart.service;

import java.util.List;
import java.util.Map;

/**
 * 沃尔玛商品服务接口
 *
 * @author ERP System
 */
public interface WalmartProductService {
    
    /**
     * 验证商品信息
     *
     * @param productData 商品数据
     * @return 验证结果
     */
    Map<String, Object> validateProduct(Map<String, Object> productData);
    
    /**
     * 转换商品格式
     *
     * @param productData 标准商品数据
     * @return 沃尔玛格式商品数据
     */
    Map<String, Object> convertToWalmartFormat(Map<String, Object> productData);
    
    /**
     * 上传单个商品
     *
     * @param storeId 店铺ID
     * @param productData 商品数据
     * @return 上传结果
     */
    Map<String, Object> uploadProduct(String storeId, Map<String, Object> productData);
    
    /**
     * 批量上传商品
     *
     * @param storeId 店铺ID
     * @param productsData 商品数据列表
     * @return 批量上传结果
     */
    Map<String, Object> batchUploadProducts(String storeId, List<Map<String, Object>> productsData);
    
    /**
     * 跟踪上传进度
     *
     * @param storeId 店铺ID
     * @param batchId 批次ID
     * @return 进度信息
     */
    Map<String, Object> trackUploadProgress(String storeId, String batchId);
    
    /**
     * 更新商品状态
     *
     * @param storeId 店铺ID
     * @param sku SKU
     * @param status 状态
     * @return 更新结果
     */
    boolean updateProductStatus(String storeId, String sku, String status);
    
    /**
     * 处理上传失败的商品
     *
     * @param storeId 店铺ID
     * @param failedProducts 失败的商品列表
     * @return 重试结果
     */
    Map<String, Object> retryFailedProducts(String storeId, List<Map<String, Object>> failedProducts);
}