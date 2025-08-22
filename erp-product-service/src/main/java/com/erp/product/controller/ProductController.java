package com.erp.product.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.response.Result;
import com.erp.product.dto.ProductDTO;
import com.erp.product.dto.ProductSearchDTO;
import com.erp.product.entity.Product;
import com.erp.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 商品管理控制器
 */
@Tag(name = "商品管理", description = "商品相关接口")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
public class ProductController {
    
    private final ProductService productService;
    
    @Operation(summary = "创建商品")
    @PostMapping
    public Result<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        ProductDTO result = productService.createProduct(productDTO);
        return Result.success(result);
    }
    
    @Operation(summary = "根据ID获取商品")
    @GetMapping("/{id}")
    public Result<ProductDTO> getProductById(@Parameter(description = "商品ID") @PathVariable Long id) {
        ProductDTO result = productService.getProductById(id);
        return Result.success(result);
    }
    
    @Operation(summary = "根据SKU获取商品")
    @GetMapping("/sku/{sku}")
    public Result<ProductDTO> getProductBySku(@Parameter(description = "SKU编码") @PathVariable String sku) {
        ProductDTO result = productService.getProductBySku(sku);
        return Result.success(result);
    }
    
    @Operation(summary = "更新商品")
    @PutMapping("/{id}")
    public Result<ProductDTO> updateProduct(
            @Parameter(description = "商品ID") @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO result = productService.updateProduct(id, productDTO);
        return Result.success(result);
    }
    
    @Operation(summary = "删除商品")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProduct(@Parameter(description = "商品ID") @PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success();
    }
    
    @Operation(summary = "批量删除商品")
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteProducts(@RequestBody @NotEmpty List<Long> ids) {
        productService.batchDeleteProducts(ids);
        return Result.success();
    }
    
    @Operation(summary = "获取商品列表")
    @GetMapping
    public Result<IPage<ProductDTO>> getProducts(
            @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(value = "size", defaultValue = "10") int size,
            @Parameter(description = "搜索关键词") @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "商品名称") @RequestParam(value = "name", required = false) String name,
            @Parameter(description = "分类ID") @RequestParam(value = "categoryId", required = false) Long categoryId,
            @Parameter(description = "品牌") @RequestParam(value = "brand", required = false) String brand,
            @Parameter(description = "商品状态") @RequestParam(value = "status", required = false) Product.ProductStatus status) {
        
        // 构建搜索条件
        ProductSearchDTO searchDTO = new ProductSearchDTO();
        searchDTO.setKeyword(keyword);
        searchDTO.setTitle(name);
        searchDTO.setCategoryId(categoryId);
        searchDTO.setBrand(brand);
        searchDTO.setStatus(status);
        
        IPage<ProductDTO> result = productService.searchProducts(page, size, searchDTO);
        return Result.success(result);
    }
    
    @Operation(summary = "分页搜索商品")
    @PostMapping("/search")
    public Result<IPage<ProductDTO>> searchProducts(
            @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestBody ProductSearchDTO searchDTO) {
        IPage<ProductDTO> result = productService.searchProducts(page, size, searchDTO);
        return Result.success(result);
    }
    
    @Operation(summary = "检查SKU是否存在")
    @GetMapping("/exists/{sku}")
    public Result<Boolean> existsBySku(@Parameter(description = "SKU编码") @PathVariable String sku) {
        boolean exists = productService.existsBySku(sku);
        return Result.success(exists);
    }
    
    @Operation(summary = "更新商品状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateProductStatus(
            @Parameter(description = "商品ID") @PathVariable Long id,
            @Parameter(description = "商品状态") @RequestParam Product.ProductStatus status) {
        productService.updateProductStatus(id, status);
        return Result.success();
    }
    
    @Operation(summary = "批量更新商品状态")
    @PutMapping("/batch/status")
    public Result<Void> batchUpdateProductStatus(
            @RequestBody @NotEmpty List<Long> ids,
            @Parameter(description = "商品状态") @RequestParam Product.ProductStatus status) {
        productService.batchUpdateProductStatus(ids, status);
        return Result.success();
    }
    
    @Operation(summary = "上传商品图片")
    @PostMapping("/upload/image")
    public Result<String> uploadProductImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = productService.uploadProductImage(file);
        return Result.success(imageUrl);
    }
    
    @Operation(summary = "批量导入商品")
    @PostMapping("/import")
    public Result<Void> batchImportProducts(@RequestParam("file") MultipartFile file) {
        productService.batchImportProducts(file);
        return Result.success();
    }
    
    @Operation(summary = "导出商品数据")
    @PostMapping("/export")
    public Result<Void> exportProducts(@RequestBody ProductSearchDTO searchDTO) {
        productService.exportProducts(searchDTO);
        return Result.success();
    }
    
    @Operation(summary = "获取商品统计信息")
    @GetMapping("/statistics")
    public Result<Object> getProductStatistics() {
        Object statistics = productService.getProductStatistics();
        return Result.success(statistics);
    }
    
    @Operation(summary = "检查商品是否可以删除")
    @GetMapping("/{id}/can-delete")
    public Result<Boolean> canDeleteProduct(@Parameter(description = "商品ID") @PathVariable Long id) {
        boolean canDelete = productService.canDeleteProduct(id);
        return Result.success(canDelete);
    }
}