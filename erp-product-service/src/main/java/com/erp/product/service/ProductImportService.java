package com.erp.product.service;

import com.erp.product.dto.ProductImportDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 商品导入服务接口
 */
public interface ProductImportService {
    
    /**
     * 解析Excel文件
     */
    List<ProductImportDTO> parseExcelFile(MultipartFile file);
    
    /**
     * 验证导入数据
     */
    List<ProductImportDTO> validateImportData(List<ProductImportDTO> importData);
    
    /**
     * 批量导入商品
     */
    void batchImportProducts(List<ProductImportDTO> validData);
    
    /**
     * 生成导入模板
     */
    byte[] generateImportTemplate();
    
    /**
     * 导出验证结果
     */
    byte[] exportValidationResult(List<ProductImportDTO> importData);
}