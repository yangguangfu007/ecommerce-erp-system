package com.erp.common.response;

/**
 * 响应状态码枚举
 *
 * @author ERP System
 */
public enum ResultCode {

    // 成功
    SUCCESS(200, "操作成功"),

    // 客户端错误 4xx
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权访问"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    CONFLICT(409, "资源冲突"),
    VALIDATION_ERROR(422, "参数校验失败"),
    TOO_MANY_REQUESTS(429, "请求过于频繁"),

    // 服务器错误 5xx
    INTERNAL_SERVER_ERROR(500, "系统内部错误"),
    BAD_GATEWAY(502, "网关错误"),
    SERVICE_UNAVAILABLE(503, "服务不可用"),
    GATEWAY_TIMEOUT(504, "网关超时"),

    // 业务错误 6xxx
    BUSINESS_ERROR(6000, "业务处理失败"),
    
    // 用户相关错误 61xx
    USER_NOT_FOUND(6101, "用户不存在"),
    USER_ALREADY_EXISTS(6102, "用户已存在"),
    INVALID_PASSWORD(6103, "密码错误"),
    USER_DISABLED(6104, "用户已被禁用"),
    TOKEN_EXPIRED(6105, "令牌已过期"),
    TOKEN_INVALID(6106, "令牌无效"),

    // 商品相关错误 62xx
    PRODUCT_NOT_FOUND(6201, "商品不存在"),
    PRODUCT_ALREADY_EXISTS(6202, "商品已存在"),
    PRODUCT_SKU_DUPLICATE(6203, "商品SKU重复"),
    PRODUCT_CATEGORY_NOT_FOUND(6204, "商品分类不存在"),

    // 订单相关错误 63xx
    ORDER_NOT_FOUND(6301, "订单不存在"),
    ORDER_STATUS_ERROR(6302, "订单状态错误"),
    ORDER_CANNOT_CANCEL(6303, "订单无法取消"),
    ORDER_ALREADY_PAID(6304, "订单已支付"),

    // 库存相关错误 64xx
    INVENTORY_NOT_FOUND(6401, "库存不存在"),
    INVENTORY_INSUFFICIENT(6402, "库存不足"),
    INVENTORY_LOCKED(6403, "库存已锁定"),
    INVENTORY_ALLOCATION_FAILED(6404, "库存分配失败"),

    // 平台相关错误 65xx
    PLATFORM_API_ERROR(6501, "平台API调用失败"),
    PLATFORM_AUTH_ERROR(6502, "平台认证失败"),
    PLATFORM_RATE_LIMIT(6503, "平台API限流"),
    PLATFORM_CONFIG_ERROR(6504, "平台配置错误"),

    // 物流相关错误 66xx
    LOGISTICS_API_ERROR(6601, "物流API调用失败"),
    LOGISTICS_CREATE_ORDER_FAILED(6602, "创建物流订单失败"),
    LOGISTICS_TRACKING_ERROR(6603, "物流跟踪失败"),
    LOGISTICS_LABEL_GENERATE_FAILED(6604, "面单生成失败"),

    // 通知相关错误 67xx
    NOTIFICATION_SEND_FAILED(6701, "通知发送失败"),
    NOTIFICATION_TEMPLATE_NOT_FOUND(6702, "通知模板不存在"),
    NOTIFICATION_CONFIG_ERROR(6703, "通知配置错误");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    /**
     * 根据状态码获取枚举
     */
    public static ResultCode getByCode(Integer code) {
        for (ResultCode resultCode : values()) {
            if (resultCode.getCode().equals(code)) {
                return resultCode;
            }
        }
        return INTERNAL_SERVER_ERROR;
    }
}