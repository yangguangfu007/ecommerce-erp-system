package com.erp.common.response;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Result类测试
 *
 * @author ERP System
 */
class ResultTest {

    @Test
    void testSuccessResult() {
        Result<String> result = Result.success("test data");
        
        assertEquals(ResultCode.SUCCESS.getCode(), result.getCode());
        assertEquals(ResultCode.SUCCESS.getMessage(), result.getMessage());
        assertEquals("test data", result.getData());
        assertNotNull(result.getTimestamp());
    }

    @Test
    void testErrorResult() {
        Result<Void> result = Result.error("error message");
        
        assertEquals(ResultCode.INTERNAL_SERVER_ERROR.getCode(), result.getCode());
        assertEquals("error message", result.getMessage());
        assertNull(result.getData());
        assertNotNull(result.getTimestamp());
    }

    @Test
    void testErrorResultWithCode() {
        Result<Void> result = Result.error(ResultCode.BAD_REQUEST);
        
        assertEquals(ResultCode.BAD_REQUEST.getCode(), result.getCode());
        assertEquals(ResultCode.BAD_REQUEST.getMessage(), result.getMessage());
        assertNull(result.getData());
        assertNotNull(result.getTimestamp());
    }
}