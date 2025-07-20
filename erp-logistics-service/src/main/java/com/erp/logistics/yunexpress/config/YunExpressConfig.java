package com.erp.logistics.yunexpress.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 云途物流配置
 *
 * @author ERP System
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "yunexpress")
public class YunExpressConfig {

    /**
     * API基础URL
     */
    private String baseUrl = "https://api.yunexpress.com";

    /**
     * API密钥
     */
    private String apiKey;

    /**
     * 客户代码
     */
    private String customerCode;

    /**
     * 连接超时时间（毫秒）
     */
    private int connectTimeout = 30000;

    /**
     * 读取超时时间（毫秒）
     */
    private int readTimeout = 60000;

    /**
     * 是否启用
     */
    private boolean enabled = true;

    /**
     * 默认服务类型
     */
    private String defaultServiceType = "YE1";

    /**
     * 重试次数
     */
    private int retryCount = 3;

    /**
     * 重试间隔（毫秒）
     */
    private long retryInterval = 1000;

    /**
     * 是否启用测试模式
     */
    private boolean testMode = false;

    /**
     * 测试环境URL
     */
    private String testBaseUrl = "https://test-api.yunexpress.com";

    /**
     * 获取实际使用的API URL
     */
    public String getActualBaseUrl() {
        return testMode ? testBaseUrl : baseUrl;
    }
}