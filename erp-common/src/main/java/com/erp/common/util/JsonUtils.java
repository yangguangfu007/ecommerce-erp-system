package com.erp.common.util;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONException;
import com.alibaba.fastjson2.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

/**
 * JSON工具类
 *
 * @author ERP System
 */
public class JsonUtils {

    private static final Logger logger = LoggerFactory.getLogger(JsonUtils.class);

    private JsonUtils() {
        // 工具类不允许实例化
    }

    /**
     * 对象转JSON字符串
     *
     * @param object 对象
     * @return JSON字符串
     */
    public static String toJsonString(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return JSON.toJSONString(object);
        } catch (JSONException e) {
            logger.error("对象转JSON字符串失败", e);
            return null;
        }
    }

    /**
     * JSON字符串转对象
     *
     * @param jsonString JSON字符串
     * @param clazz      目标类型
     * @param <T>        泛型
     * @return 对象
     */
    public static <T> T parseObject(String jsonString, Class<T> clazz) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return null;
        }
        try {
            return JSON.parseObject(jsonString, clazz);
        } catch (JSONException e) {
            logger.error("JSON字符串转对象失败: {}", jsonString, e);
            return null;
        }
    }

    /**
     * JSON字符串转对象（支持泛型）
     *
     * @param jsonString    JSON字符串
     * @param typeReference 类型引用
     * @param <T>           泛型
     * @return 对象
     */
    public static <T> T parseObject(String jsonString, TypeReference<T> typeReference) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return null;
        }
        try {
            return JSON.parseObject(jsonString, typeReference);
        } catch (JSONException e) {
            logger.error("JSON字符串转对象失败: {}", jsonString, e);
            return null;
        }
    }

    /**
     * JSON字符串转List
     *
     * @param jsonString JSON字符串
     * @param clazz      元素类型
     * @param <T>        泛型
     * @return List对象
     */
    public static <T> List<T> parseArray(String jsonString, Class<T> clazz) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return null;
        }
        try {
            return JSON.parseArray(jsonString, clazz);
        } catch (JSONException e) {
            logger.error("JSON字符串转List失败: {}", jsonString, e);
            return null;
        }
    }

    /**
     * JSON字符串转Map
     *
     * @param jsonString JSON字符串
     * @return Map对象
     */
    public static Map<String, Object> parseMap(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return null;
        }
        try {
            return JSON.parseObject(jsonString, new TypeReference<Map<String, Object>>() {});
        } catch (JSONException e) {
            logger.error("JSON字符串转Map失败: {}", jsonString, e);
            return null;
        }
    }

    /**
     * 判断字符串是否为有效的JSON
     *
     * @param jsonString JSON字符串
     * @return 是否有效
     */
    public static boolean isValidJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return false;
        }
        try {
            JSON.parse(jsonString);
            return true;
        } catch (JSONException e) {
            return false;
        }
    }

    /**
     * 格式化JSON字符串（美化输出）
     *
     * @param jsonString JSON字符串
     * @return 格式化后的JSON字符串
     */
    public static String formatJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return jsonString;
        }
        try {
            Object object = JSON.parse(jsonString);
            return JSON.toJSONString(object, com.alibaba.fastjson2.JSONWriter.Feature.PrettyFormat);
        } catch (JSONException e) {
            logger.error("JSON格式化失败: {}", jsonString, e);
            return jsonString;
        }
    }
}