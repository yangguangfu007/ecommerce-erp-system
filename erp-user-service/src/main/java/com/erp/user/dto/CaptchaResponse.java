package com.erp.user.dto;

/**
 * 验证码响应DTO
 *
 * @author ERP System
 */
public class CaptchaResponse {

    private String captchaId;
    private String imageUrl;
    private String imageBase64;

    public CaptchaResponse() {}

    public CaptchaResponse(String captchaId, String imageUrl, String imageBase64) {
        this.captchaId = captchaId;
        this.imageUrl = imageUrl;
        this.imageBase64 = imageBase64;
    }

    public String getCaptchaId() {
        return captchaId;
    }

    public void setCaptchaId(String captchaId) {
        this.captchaId = captchaId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}