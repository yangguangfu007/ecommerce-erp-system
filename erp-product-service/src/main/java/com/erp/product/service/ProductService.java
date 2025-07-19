package com.erp.product.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.product.dto.ProductDTO;
import com.erp.product.dto.ProductSearchDTO;
import com.erp.product.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 商品服务接口
 */
public interface ProductService {
    
    /**
     * 创建商品
     */
    ProductDTO createProduct(ProductDTO productDTO);
    
    /**
     * 根据ID获取商品
     */
    ProductDTO getProductById(Long id);
    
    /**
     * 根据SKU获取商品
     */
    ProductDTO getProductBySku(String sku);
    
    /**
     * 更新商品
     */
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    
    /**
     * 删除商品
     */
    void deleteProduct(Long id);
    
    /**
     * 批量删除商品
     */
    void batchDeleteProducts(List<Long> ids);
    
    /**
     * 分页搜索商品
     */
    IPage<ProductDTO> searchProducts(int page, int size, ProductSearchDTO searchDTO);
    
    /**
     * 检查SKU是否存在
     */
    boolean existsBySku(String sku);
    
    /**
     * 更新商品状态
     */
    void updateProductStatus(Long id, Product.ProductStatus status);
    
    /**
     * 批量更新商品状态
     */
    void batchUpdateProductStatus(List<Long> ids, Product.ProductStatus status);
    
    /**
     * 上传商品图片
     */
    String uploadProductImage(MultipartFile file);
    
    /**
     * 批量导入商品
     */
    void batchImportProducts(MultipartFile file);
    
    /**
     * 导出商品数据
     */
    void exportProducts(ProductSearchDTO searchDTO);
    
    /**
     * 获取商品统计信息
     */
    Object getProductStatistics();
    
    /**
     * 检查商品是否可以删除
     */
    boolean canDeleteProduct(Long id);
}