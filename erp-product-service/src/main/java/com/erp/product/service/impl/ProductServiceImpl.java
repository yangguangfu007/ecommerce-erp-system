package com.erp.product.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.ResultCode;
import com.erp.product.dto.ProductDTO;
import com.erp.product.dto.ProductSearchDTO;
import com.erp.product.entity.Product;
import com.erp.product.entity.ProductHistory;
import com.erp.product.mapper.ProductHistoryMapper;
import com.erp.product.mapper.ProductMapper;
import com.erp.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ProductMapper productMapper;
    private final ProductHistoryMapper productHistoryMapper;
    
    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        // 检查SKU唯一性
        if (existsBySku(productDTO.getSku())) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "SKU编码已存在: " + productDTO.getSku());
        }
        
        Product product = new Product();
        BeanUtils.copyProperties(productDTO, product);
        product.setVersion(1);
        
        int result = productMapper.insert(product);
        if (result <= 0) {
            throw new BusinessException(ResultCode.SYSTEM_ERROR, "商品创建失败");
        }
        
        // 记录历史
        recordProductHistory(product, ProductHistory.OperationType.CREATE, null, product, "创建商品");
        
        productDTO.setId(product.getId());
        return productDTO;
    }
    
    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        
        ProductDTO productDTO = new ProductDTO();
        BeanUtils.copyProperties(product, productDTO);
        return productDTO;
    }
    
    @Override
    public ProductDTO getProductBySku(String sku) {
        Product product = productMapper.selectBySku(sku);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        
        ProductDTO productDTO = new ProductDTO();
        BeanUtils.copyProperties(product, productDTO);
        return productDTO;
    }
    
    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productMapper.selectById(id);
        if (existingProduct == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        
        // 如果SKU发生变化，检查新SKU的唯一性
        if (!existingProduct.getSku().equals(productDTO.getSku()) && existsBySku(productDTO.getSku())) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "SKU编码已存在: " + productDTO.getSku());
        }
        
        Product product = new Product();
        BeanUtils.copyProperties(productDTO, product);
        product.setId(id);
        product.setVersion(existingProduct.getVersion() + 1);
        
        int result = productMapper.updateById(product);
        if (result <= 0) {
            throw new BusinessException(ResultCode.SYSTEM_ERROR, "商品更新失败");
        }
        
        // 记录历史
        recordProductHistory(product, ProductHistory.OperationType.UPDATE, existingProduct, product, "更新商品");
        
        return productDTO;
    }
    
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!canDeleteProduct(id)) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "商品存在关联数据，无法删除");
        }
        
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        
        // 软删除
        product.setStatus(Product.ProductStatus.DELETED);
        productMapper.updateById(product);
        
        // 记录历史
        recordProductHistory(product, ProductHistory.OperationType.DELETE, product, null, "删除商品");
    }
    
    @Override
    @Transactional
    public void batchDeleteProducts(List<Long> ids) {
        for (Long id : ids) {
            deleteProduct(id);
        }
    }
    
    @Override
    public IPage<ProductDTO> searchProducts(int page, int size, ProductSearchDTO searchDTO) {
        Page<Product> productPage = new Page<>(page, size);
        IPage<Product> result = productMapper.searchProducts(productPage, searchDTO);
        
        return result.convert(product -> {
            ProductDTO dto = new ProductDTO();
            BeanUtils.copyProperties(product, dto);
            return dto;
        });
    }
    
    @Override
    public boolean existsBySku(String sku) {
        return productMapper.existsBySku(sku);
    }
    
    @Override
    @Transactional
    public void updateProductStatus(Long id, Product.ProductStatus status) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        
        Product.ProductStatus oldStatus = product.getStatus();
        product.setStatus(status);
        productMapper.updateById(product);
        
        // 记录历史
        recordProductHistory(product, ProductHistory.OperationType.STATUS_CHANGE, 
                           oldStatus, status, "状态变更: " + oldStatus + " -> " + status);
    }
    
    @Override
    @Transactional
    public void batchUpdateProductStatus(List<Long> ids, Product.ProductStatus status) {
        productMapper.batchUpdateStatus(ids, status);
        
        // 记录批量操作历史
        for (Long id : ids) {
            Product product = productMapper.selectById(id);
            if (product != null) {
                recordProductHistory(product, ProductHistory.OperationType.STATUS_CHANGE, 
                                   null, status, "批量状态变更: " + status);
            }
        }
    }
    
    @Override
    public String uploadProductImage(MultipartFile file) {
        // TODO: 实现图片上传逻辑
        // 1. 验证文件类型和大小
        // 2. 生成唯一文件名
        // 3. 上传到文件存储服务
        // 4. 返回文件访问URL
        throw new BusinessException(ResultCode.NOT_IMPLEMENTED, "图片上传功能待实现");
    }
    
    @Override
    @Transactional
    public void batchImportProducts(MultipartFile file) {
        // 验证文件格式
        if (file.isEmpty()) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "上传文件不能为空");
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "文件格式不正确，请上传Excel文件");
        }
        
        // TODO: 集成ProductImportService实现完整的导入逻辑
        // 1. 解析Excel数据
        // 2. 数据验证
        // 3. 批量插入数据库
        log.info("开始批量导入商品，文件名: {}", fileName);
        throw new BusinessException(ResultCode.NOT_IMPLEMENTED, "批量导入功能正在开发中");
    }
    
    @Override
    public void exportProducts(ProductSearchDTO searchDTO) {
        // TODO: 实现商品数据导出逻辑
        throw new BusinessException(ResultCode.NOT_IMPLEMENTED, "数据导出功能待实现");
    }
    
    @Override
    public Object getProductStatistics() {
        return productMapper.getProductStatistics();
    }
    
    @Override
    public boolean canDeleteProduct(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            return false;
        }
        
        // 检查商品是否有关联的订单
        // TODO: 调用订单服务检查是否有关联订单
        // boolean hasOrders = orderServiceClient.hasOrdersByProductId(id);
        // if (hasOrders) {
        //     return false;
        // }
        
        // 检查商品是否有库存记录
        // TODO: 调用库存服务检查是否有库存记录
        // boolean hasInventory = inventoryServiceClient.hasInventoryByProductId(id);
        // if (hasInventory) {
        //     return false;
        // }
        
        // 暂时允许删除，实际项目中需要检查所有关联关系
        return true;
    }
    
    /**
     * 记录商品操作历史
     */
    private void recordProductHistory(Product product, ProductHistory.OperationType operationType,
                                    Object beforeData, Object afterData, String remark) {
        ProductHistory history = new ProductHistory();
        history.setProductId(product.getId());
        history.setSku(product.getSku());
        history.setOperationType(operationType);
        history.setBeforeData(beforeData);
        history.setAfterData(afterData);
        history.setOperator("system"); // TODO: 从上下文获取当前用户
        history.setOperationTime(LocalDateTime.now());
        history.setRemark(remark);
        
        productHistoryMapper.insert(history);
    }
}