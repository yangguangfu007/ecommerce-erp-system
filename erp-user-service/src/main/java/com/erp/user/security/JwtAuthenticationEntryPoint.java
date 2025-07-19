package com.erp.user.security;

import com.erp.common.response.Result;
import com.erp.common.response.ResultCode;
import com.erp.common.util.JsonUtils;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * JWT认证入口点
 * 处理未认证的请求
 *
 * @author ERP System
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        Result<String> result = Result.error(ResultCode.UNAUTHORIZED, "未认证或认证已过期");
        response.getWriter().write(JsonUtils.toJsonString(result));
    }
}