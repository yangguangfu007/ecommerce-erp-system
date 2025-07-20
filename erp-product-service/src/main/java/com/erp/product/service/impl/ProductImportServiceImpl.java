package com.erp.product.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.common.response.ResultCode;
import com.erp.product.dto.ProductImportDTO;
import com.erp.product.entity.Category;
import com.erp.product.entity.Product;
import com.erp.product.mapper.CategoryMapper;
import com.erp.product.mapper.ProductMapper;
import com.erp.product.service.ProductImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 商品导入服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImportServiceImpl implements ProductImportService {
    
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    
    @Override
    public List<ProductImportDTO> parseExcelFile(MultipartFile file) {
        List<ProductImportDTO> importData = new ArrayList<>();
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // 跳过标题行
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                ProductImportDTO importDTO = parseRow(row, i + 1);
                if (importDTO != null) {
                    importData.add(importDTO);
                }
            }
        } catch (IOException e) {
            log.error("解析Excel文件失败", e);
            throw new BusinessException("Excel文件解析失败: " + e.getMessage());
        }
        
        return importData;
    }
    
    @Override
    public List<ProductImportDTO> validateImportData(List<ProductImportDTO> importData) {
        for (ProductImportDTO dto : importData) {
            List<String> errors = new ArrayList<>();
            
            // 验证必填字段
            if (!StringUtils.hasText(dto.getSku())) {
                errors.add("SKU编码不能为空");
            } else if (dto.getSku().length() > 100) {
                errors.add("SKU编码长度不能超过100个字符");
            } else if (productMapper.existsBySku(dto.getSku())) {
                errors.add("SKU编码已存在: " + dto.getSku());
            }
            
            if (!StringUtils.hasText(dto.getTitle())) {
                errors.add("商品标题不能为空");
            } else if (dto.getTitle().length() > 500) {
                errors.add("商品标题长度不能超过500个字符");
            }
            
            if (!StringUtils.hasText(dto.getCategoryCode())) {
                errors.add("分类编码不能为空");
            } else if (!categoryMapper.existsByCode(dto.getCategoryCode())) {
                errors.add("分类编码不存在: " + dto.getCategoryCode());
            }
            
            if (dto.getPrice() == null) {
                errors.add("销售价格不能为空");
            } else if (dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                errors.add("销售价格必须大于0");
            }
            
            // 验证可选字段
            if (dto.getDescription() != null && dto.getDescription().length() > 2000) {
                errors.add("商品描述长度不能超过2000个字符");
            }
            
            if (dto.getBrand() != null && dto.getBrand().length() > 100) {
                errors.add("品牌长度不能超过100个字符");
            }
            
            if (dto.getCostPrice() != null && dto.getCostPrice().compareTo(BigDecimal.ZERO) < 0) {
                errors.add("成本价格不能为负数");
            }
            
            if (dto.getWeight() != null && dto.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
                errors.add("重量必须大于0");
            }
            
            if (dto.getDimensions() != null && dto.getDimensions().length() > 100) {
                errors.add("尺寸规格长度不能超过100个字符");
            }
            
            // 验证状态
            if (StringUtils.hasText(dto.getStatus())) {
                try {
                    Product.ProductStatus.valueOf(dto.getStatus().toUpperCase());
                } catch (IllegalArgumentException e) {
                    errors.add("商品状态无效: " + dto.getStatus());
                }
            }
            
            dto.setErrors(errors);
            dto.setValid(errors.isEmpty());
        }
        
        return importData;
    }
    
    @Override
    @Transactional
    public void batchImportProducts(List<ProductImportDTO> validData) {
        for (ProductImportDTO dto : validData) {
            if (!dto.getValid()) {
                continue;
            }
            
            try {
                Product product = convertToProduct(dto);
                productMapper.insert(product);
                log.info("成功导入商品: {}", dto.getSku());
            } catch (Exception e) {
                log.error("导入商品失败: {}, 错误: {}", dto.getSku(), e.getMessage());
                throw new BusinessException(
                    "导入商品失败: " + dto.getSku() + ", " + e.getMessage());
            }
        }
    }
    
    @Override
    public byte[] generateImportTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("商品导入模板");
            
            // 创建标题行
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "SKU编码*", "商品标题*", "商品描述", "分类编码*", "品牌", 
                "销售价格*", "成本价格", "重量(kg)", "尺寸规格", "状态"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // 创建示例数据行
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("EXAMPLE-001");
            exampleRow.createCell(1).setCellValue("示例商品");
            exampleRow.createCell(2).setCellValue("这是一个示例商品描述");
            exampleRow.createCell(3).setCellValue("ELECTRONICS");
            exampleRow.createCell(4).setCellValue("示例品牌");
            exampleRow.createCell(5).setCellValue(99.99);
            exampleRow.createCell(6).setCellValue(50.00);
            exampleRow.createCell(7).setCellValue(1.5);
            exampleRow.createCell(8).setCellValue("10x5x2cm");
            exampleRow.createCell(9).setCellValue("ACTIVE");
            
            // 自动调整列宽
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("生成导入模板失败", e);
            throw new BusinessException("生成导入模板失败");
        }
    }
    
    @Override
    public byte[] exportValidationResult(List<ProductImportDTO> importData) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("验证结果");
            
            // 创建标题行
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "行号", "SKU编码", "商品标题", "分类编码", "销售价格", "验证状态", "错误信息"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // 填充数据
            for (int i = 0; i < importData.size(); i++) {
                ProductImportDTO dto = importData.get(i);
                Row row = sheet.createRow(i + 1);
                
                row.createCell(0).setCellValue(dto.getRowNumber());
                row.createCell(1).setCellValue(dto.getSku());
                row.createCell(2).setCellValue(dto.getTitle());
                row.createCell(3).setCellValue(dto.getCategoryCode());
                if (dto.getPrice() != null) {
                    row.createCell(4).setCellValue(dto.getPrice().doubleValue());
                }
                row.createCell(5).setCellValue(dto.getValid() ? "通过" : "失败");
                if (dto.getErrors() != null && !dto.getErrors().isEmpty()) {
                    row.createCell(6).setCellValue(String.join("; ", dto.getErrors()));
                }
            }
            
            // 自动调整列宽
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("导出验证结果失败", e);
            throw new BusinessException("导出验证结果失败");
        }
    }
    
    /**
     * 解析Excel行数据
     */
    private ProductImportDTO parseRow(Row row, int rowNumber) {
        ProductImportDTO dto = new ProductImportDTO();
        dto.setRowNumber(rowNumber);
        
        try {
            dto.setSku(getCellStringValue(row.getCell(0)));
            dto.setTitle(getCellStringValue(row.getCell(1)));
            dto.setDescription(getCellStringValue(row.getCell(2)));
            dto.setCategoryCode(getCellStringValue(row.getCell(3)));
            dto.setBrand(getCellStringValue(row.getCell(4)));
            
            Cell priceCell = row.getCell(5);
            if (priceCell != null && priceCell.getCellType() == CellType.NUMERIC) {
                dto.setPrice(BigDecimal.valueOf(priceCell.getNumericCellValue()));
            }
            
            Cell costPriceCell = row.getCell(6);
            if (costPriceCell != null && costPriceCell.getCellType() == CellType.NUMERIC) {
                dto.setCostPrice(BigDecimal.valueOf(costPriceCell.getNumericCellValue()));
            }
            
            Cell weightCell = row.getCell(7);
            if (weightCell != null && weightCell.getCellType() == CellType.NUMERIC) {
                dto.setWeight(BigDecimal.valueOf(weightCell.getNumericCellValue()));
            }
            
            dto.setDimensions(getCellStringValue(row.getCell(8)));
            dto.setStatus(getCellStringValue(row.getCell(9)));
            
            return dto;
        } catch (Exception e) {
            log.warn("解析第{}行数据失败: {}", rowNumber, e.getMessage());
            return null;
        }
    }
    
    /**
     * 获取单元格字符串值
     */
    private String getCellStringValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }
    
    /**
     * 转换为商品实体
     */
    private Product convertToProduct(ProductImportDTO dto) {
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setBrand(dto.getBrand());
        product.setPrice(dto.getPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setWeight(dto.getWeight());
        product.setDimensions(dto.getDimensions());
        product.setVersion(1);
        
        // 根据分类编码查找分类ID
        Category category = categoryMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                .eq(Category::getCode, dto.getCategoryCode())
        );
        if (category != null) {
            product.setCategoryId(category.getId());
        }
        
        // 设置状态
        if (StringUtils.hasText(dto.getStatus())) {
            product.setStatus(Product.ProductStatus.valueOf(dto.getStatus().toUpperCase()));
        } else {
            product.setStatus(Product.ProductStatus.ACTIVE);
        }
        
        return product;
    }
}