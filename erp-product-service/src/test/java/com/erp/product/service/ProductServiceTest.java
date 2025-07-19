package com.erp.product.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.product.dto.ProductDTO;
import com.erp.product.dto.ProductSearchDTO;
import com.erp.product.entity.Product;
import com.erp.product.mapper.ProductHistoryMapper;
import com.erp.product.mapper.ProductMapper;
import com.erp.product.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 商品服务测试类
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductMapper productMapper;
    
    @Mock
    private ProductHistoryMapper productHistoryMapper;
    
    @InjectMocks
    private ProductServiceImpl productService;
    
    private ProductDTO productDTO;
    private Product product;
    
    @BeforeEach
    void setUp() {
        productDTO = new ProductDTO();
        productDTO.setSku("TEST-SKU-001");
        productDTO.setTitle("测试商品");
        productDTO.setDescription("这是一个测试商品");
        productDTO.setCategoryId(1L);
        productDTO.setBrand("测试品牌");
        productDTO.setPrice(new BigDecimal("99.99"));
        productDTO.setCostPrice(new BigDecimal("50.00"));
        productDTO.setWeight(new BigDecimal("1.5"));
        productDTO.setStatus(Product.ProductStatus.ACTIVE);
        
        product = new Product();
        product.setId(1L);
        product.setSku("TEST-SKU-001");
        product.setTitle("测试商品");
        product.setDescription("这是一个测试商品");
        product.setCategoryId(1L);
        product.setBrand("测试品牌");
        product.setPrice(new BigDecimal("99.99"));
        product.setCostPrice(new BigDecimal("50.00"));
        product.setWeight(new BigDecimal("1.5"));
        product.setStatus(Product.ProductStatus.ACTIVE);
        product.setVersion(1);
    }
    
    @Test
    void testCreateProduct_Success() {
        // Given
        when(productMapper.existsBySku(anyString())).thenReturn(false);
        when(productMapper.insert(any(Product.class))).thenReturn(1);
        when(productHistoryMapper.insert(any())).thenReturn(1);
        
        // When
        ProductDTO result = productService.createProduct(productDTO);
        
        // Then
        assertNotNull(result);
        assertEquals(productDTO.getSku(), result.getSku());
        assertEquals(productDTO.getTitle(), result.getTitle());
        verify(productMapper).existsBySku(productDTO.getSku());
        verify(productMapper).insert(any(Product.class));
        verify(productHistoryMapper).insert(any());
    }
    
    @Test
    void testCreateProduct_SkuExists() {
        // Given
        when(productMapper.existsBySku(anyString())).thenReturn(true);
        
        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> productService.createProduct(productDTO));
        
        assertTrue(exception.getMessage().contains("SKU编码已存在"));
        verify(productMapper).existsBySku(productDTO.getSku());
        verify(productMapper, never()).insert(any(Product.class));
    }
    
    @Test
    void testGetProductById_Success() {
        // Given
        when(productMapper.selectById(1L)).thenReturn(product);
        
        // When
        ProductDTO result = productService.getProductById(1L);
        
        // Then
        assertNotNull(result);
        assertEquals(product.getSku(), result.getSku());
        assertEquals(product.getTitle(), result.getTitle());
        verify(productMapper).selectById(1L);
    }
    
    @Test
    void testGetProductById_NotFound() {
        // Given
        when(productMapper.selectById(1L)).thenReturn(null);
        
        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> productService.getProductById(1L));
        
        assertTrue(exception.getMessage().contains("商品不存在"));
        verify(productMapper).selectById(1L);
    }
    
    @Test
    void testGetProductBySku_Success() {
        // Given
        when(productMapper.selectBySku("TEST-SKU-001")).thenReturn(product);
        
        // When
        ProductDTO result = productService.getProductBySku("TEST-SKU-001");
        
        // Then
        assertNotNull(result);
        assertEquals(product.getSku(), result.getSku());
        assertEquals(product.getTitle(), result.getTitle());
        verify(productMapper).selectBySku("TEST-SKU-001");
    }
    
    @Test
    void testUpdateProduct_Success() {
        // Given
        when(productMapper.selectById(1L)).thenReturn(product);
        when(productMapper.existsBySku(anyString())).thenReturn(false);
        when(productMapper.updateById(any(Product.class))).thenReturn(1);
        when(productHistoryMapper.insert(any())).thenReturn(1);
        
        productDTO.setTitle("更新后的商品标题");
        
        // When
        ProductDTO result = productService.updateProduct(1L, productDTO);
        
        // Then
        assertNotNull(result);
        assertEquals(productDTO.getTitle(), result.getTitle());
        verify(productMapper).selectById(1L);
        verify(productMapper).updateById(any(Product.class));
        verify(productHistoryMapper).insert(any());
    }
    
    @Test
    void testDeleteProduct_Success() {
        // Given
        when(productMapper.selectById(1L)).thenReturn(product);
        when(productMapper.updateById(any(Product.class))).thenReturn(1);
        when(productHistoryMapper.insert(any())).thenReturn(1);
        
        // When
        productService.deleteProduct(1L);
        
        // Then
        verify(productMapper).selectById(1L);
        verify(productMapper).updateById(any(Product.class));
        verify(productHistoryMapper).insert(any());
    }
    
    @Test
    void testBatchDeleteProducts_Success() {
        // Given
        List<Long> ids = Arrays.asList(1L, 2L, 3L);
        when(productMapper.selectById(anyLong())).thenReturn(product);
        when(productMapper.updateById(any(Product.class))).thenReturn(1);
        when(productHistoryMapper.insert(any())).thenReturn(1);
        
        // When
        productService.batchDeleteProducts(ids);
        
        // Then
        verify(productMapper, times(3)).selectById(anyLong());
        verify(productMapper, times(3)).updateById(any(Product.class));
        verify(productHistoryMapper, times(3)).insert(any());
    }
    
    @Test
    void testSearchProducts_Success() {
        // Given
        ProductSearchDTO searchDTO = new ProductSearchDTO();
        searchDTO.setKeyword("测试");
        
        Page<Product> mockPage = new Page<>(1, 10);
        mockPage.setRecords(Arrays.asList(product));
        mockPage.setTotal(1);
        
        when(productMapper.searchProducts(any(Page.class), any(ProductSearchDTO.class)))
            .thenReturn(mockPage);
        
        // When
        IPage<ProductDTO> result = productService.searchProducts(1, 10, searchDTO);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getRecords().size());
        verify(productMapper).searchProducts(any(Page.class), eq(searchDTO));
    }
    
    @Test
    void testExistsBySku() {
        // Given
        when(productMapper.existsBySku("TEST-SKU-001")).thenReturn(true);
        
        // When
        boolean exists = productService.existsBySku("TEST-SKU-001");
        
        // Then
        assertTrue(exists);
        verify(productMapper).existsBySku("TEST-SKU-001");
    }
    
    @Test
    void testUpdateProductStatus_Success() {
        // Given
        when(productMapper.selectById(1L)).thenReturn(product);
        when(productMapper.updateById(any(Product.class))).thenReturn(1);
        when(productHistoryMapper.insert(any())).thenReturn(1);
        
        // When
        productService.updateProductStatus(1L, Product.ProductStatus.INACTIVE);
        
        // Then
        verify(productMapper).selectById(1L);
        verify(productMapper).updateById(any(Product.class));
        verify(productHistoryMapper).insert(any());
    }
    
    @Test
    void testBatchUpdateProductStatus_Success() {
        // Given
        List<Long> ids = Arrays.asList(1L, 2L);
        when(productMapper.batchUpdateStatus(anyList(), any(Product.ProductStatus.class))).thenReturn(2);
        when(productMapper.selectById(anyLong())).thenReturn(product);
        when(productHistoryMapper.insert(any())).thenReturn(1);
        
        // When
        productService.batchUpdateProductStatus(ids, Product.ProductStatus.INACTIVE);
        
        // Then
        verify(productMapper).batchUpdateStatus(ids, Product.ProductStatus.INACTIVE);
        verify(productMapper, times(2)).selectById(anyLong());
        verify(productHistoryMapper, times(2)).insert(any());
    }
    
    @Test
    void testCanDeleteProduct() {
        // When
        boolean canDelete = productService.canDeleteProduct(1L);
        
        // Then
        assertTrue(canDelete); // 当前实现总是返回true
    }
    
    @Test
    void testGetProductStatistics() {
        // Given
        ProductMapper.ProductStatistics mockStats = new ProductMapper.ProductStatistics();
        mockStats.setTotalCount(100L);
        mockStats.setActiveCount(80L);
        mockStats.setInactiveCount(20L);
        
        when(productMapper.getProductStatistics()).thenReturn(mockStats);
        
        // When
        Object result = productService.getProductStatistics();
        
        // Then
        assertNotNull(result);
        verify(productMapper).getProductStatistics();
    }
}