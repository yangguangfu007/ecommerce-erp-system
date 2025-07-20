package com.erp.logistics.controller;

import com.erp.common.result.Result;
import com.erp.logistics.dto.ShippingLabelResponse;
import com.erp.logistics.service.ShippingLabelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * 面单管理控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/logistics/labels")
@RequiredArgsConstructor
public class ShippingLabelController {

    private final ShippingLabelService shippingLabelService;

    /**
     * 为订单生成面单
     */
    @PostMapping("/generate/order/{orderId}")
    public Result<ShippingLabelResponse> generateLabelForOrder(@PathVariable @NotNull Long orderId) {
        log.info("接收到为订单生成面单请求，订单ID: {}", orderId);
        
        try {
            ShippingLabelResponse response = shippingLabelService.generateLabelForOrder(orderId);
            
            if (response.isSuccess()) {
                return Result.success(response);
            } else {
                return Result.error(500, response.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("为订单生成面单异常，订单ID: {}", orderId, e);
            return Result.error(500, "面单生成异常: " + e.getMessage());
        }
    }

    /**
     * 根据运单号生成面单
     */
    @PostMapping("/generate/{trackingNumber}")
    public Result<ShippingLabelResponse> generateLabel(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到生成面单请求，运单号: {}", trackingNumber);
        
        try {
            ShippingLabelResponse response = shippingLabelService.generateLabel(trackingNumber);
            
            if (response.isSuccess()) {
                return Result.success(response);
            } else {
                return Result.error(500, response.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("生成面单异常，运单号: {}", trackingNumber, e);
            return Result.error(500, "面单生成异常: " + e.getMessage());
        }
    }

    /**
     * 重新生成面单
     */
    @PostMapping("/regenerate/{trackingNumber}")
    public Result<ShippingLabelResponse> regenerateLabel(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到重新生成面单请求，运单号: {}", trackingNumber);
        
        try {
            ShippingLabelResponse response = shippingLabelService.regenerateLabel(trackingNumber);
            
            if (response.isSuccess()) {
                return Result.success(response);
            } else {
                return Result.error(500, response.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("重新生成面单异常，运单号: {}", trackingNumber, e);
            return Result.error(500, "重新生成面单异常: " + e.getMessage());
        }
    }

    /**
     * 获取面单PDF
     */
    @GetMapping("/pdf/{trackingNumber}")
    public ResponseEntity<byte[]> getLabelPdf(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到获取面单PDF请求，运单号: {}", trackingNumber);
        
        try {
            String labelPdfBase64 = shippingLabelService.getLabelPdf(trackingNumber);
            
            if (labelPdfBase64 == null) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] pdfBytes = Base64.getDecoder().decode(labelPdfBase64);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "label_" + trackingNumber + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            log.error("获取面单PDF异常，运单号: {}", trackingNumber, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 下载面单PDF
     */
    @GetMapping("/download/{trackingNumber}")
    public ResponseEntity<byte[]> downloadLabelPdf(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到下载面单PDF请求，运单号: {}", trackingNumber);
        
        try {
            String labelPdfBase64 = shippingLabelService.getLabelPdf(trackingNumber);
            
            if (labelPdfBase64 == null) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] pdfBytes = Base64.getDecoder().decode(labelPdfBase64);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "label_" + trackingNumber + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            log.error("下载面单PDF异常，运单号: {}", trackingNumber, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 打印面单
     */
    @PostMapping("/print/{trackingNumber}")
    public Result<Boolean> printLabel(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到打印面单请求，运单号: {}", trackingNumber);
        
        try {
            boolean success = shippingLabelService.printLabel(trackingNumber);
            
            if (success) {
                return Result.success(true);
            } else {
                return Result.error(500, "面单打印失败");
            }
        } catch (Exception e) {
            log.error("打印面单异常，运单号: {}", trackingNumber, e);
            return Result.error(500, "面单打印异常: " + e.getMessage());
        }
    }

    /**
     * 批量生成面单
     */
    @PostMapping("/batch/generate")
    public Result<Map<String, ShippingLabelResponse>> batchGenerateLabels(
            @RequestBody @NotEmpty List<String> trackingNumbers) {
        log.info("接收到批量生成面单请求，数量: {}", trackingNumbers.size());
        
        try {
            Map<String, ShippingLabelResponse> results = shippingLabelService.batchGenerateLabels(trackingNumbers);
            return Result.success(results);
        } catch (Exception e) {
            log.error("批量生成面单异常", e);
            return Result.error(500, "批量生成面单异常: " + e.getMessage());
        }
    }

    /**
     * 批量打印面单
     */
    @PostMapping("/batch/print")
    public Result<Map<String, Boolean>> batchPrintLabels(
            @RequestBody @NotEmpty List<String> trackingNumbers) {
        log.info("接收到批量打印面单请求，数量: {}", trackingNumbers.size());
        
        try {
            Map<String, Boolean> results = new java.util.HashMap<>();
            
            for (String trackingNumber : trackingNumbers) {
                boolean success = shippingLabelService.printLabel(trackingNumber);
                results.put(trackingNumber, success);
            }
            
            return Result.success(results);
        } catch (Exception e) {
            log.error("批量打印面单异常", e);
            return Result.error(500, "批量打印面单异常: " + e.getMessage());
        }
    }
}