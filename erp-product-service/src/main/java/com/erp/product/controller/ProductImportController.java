package com.erp.product.controller;

import com.erp.common.response.Result;
import com.erp.product.dto.ProductImportDTO;
import com.erp.product.service.ProductImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 商品导入控制器
 */
@Tag(name = "商品导入", description = "商品批量导入相关接口")
@RestController
@RequestMapping("/api/products/import")
@RequiredArgsConstructor
public class ProductImportController {
    
    private final ProductImportService productImportService;
    
    @Operation(summary = "下载导入模板")
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = productImportService.generateImportTemplate();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product_import_template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(template);
    }
    
    @Operation(summary = "预览导入数据")
    @PostMapping("/preview")
    public Result<List<ProductImportDTO>> previewImportData(@RequestParam("file") MultipartFile file) {
        // 解析Excel文件
        List<ProductImportDTO> importData = productImportService.parseExcelFile(file);
        
        // 验证数据
        List<ProductImportDTO> validatedData = productImportService.validateImportData(importData);
        
        return Result.success(validatedData);
    }
    
    @Operation(summary = "确认导入商品")
    @PostMapping("/confirm")
    public Result<Void> confirmImport(@RequestParam("file") MultipartFile file) {
        // 解析Excel文件
        List<ProductImportDTO> importData = productImportService.parseExcelFile(file);
        
        // 验证数据
        List<ProductImportDTO> validatedData = productImportService.validateImportData(importData);
        
        // 过滤出有效数据
        List<ProductImportDTO> validData = validatedData.stream()
                .filter(ProductImportDTO::getValid)
                .toList();
        
        if (validData.isEmpty()) {
            return Result.error("没有有效的数据可以导入");
        }
        
        // 批量导入
        productImportService.batchImportProducts(validData);
        
        return Result.success();
    }
    
    @Operation(summary = "导出验证结果")
    @PostMapping("/export-validation")
    public ResponseEntity<byte[]> exportValidationResult(@RequestParam("file") MultipartFile file) {
        // 解析Excel文件
        List<ProductImportDTO> importData = productImportService.parseExcelFile(file);
        
        // 验证数据
        List<ProductImportDTO> validatedData = productImportService.validateImportData(importData);
        
        // 导出验证结果
        byte[] result = productImportService.exportValidationResult(validatedData);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=validation_result.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(result);
    }
}