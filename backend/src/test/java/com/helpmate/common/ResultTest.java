package com.helpmate.common;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResultTest {

    @Test
    void success_withData_returns200() {
        Result<Integer> r = Result.success(42);
        assertEquals(200, r.getCode());
        assertEquals(42, r.getData());
    }

    @Test
    void success_withMessage_returns200AndNullData() {
        Result<Void> r = Result.success("操作成功");
        assertEquals(200, r.getCode());
        assertEquals("操作成功", r.getMessage());
        assertNull(r.getData());
    }

    @Test
    void success_withMessageAndData_returns200() {
        Result<Integer> r = Result.success("发布成功", 42);
        assertEquals(200, r.getCode());
        assertEquals("发布成功", r.getMessage());
        assertEquals(42, r.getData());
    }

    @Test
    void error_withMessage_returns500() {
        Result<Void> r = Result.error("出错了");
        assertEquals(500, r.getCode());
        assertEquals("出错了", r.getMessage());
        assertNull(r.getData());
    }

    @Test
    void error_withCodeAndMessage_returnsCustomCode() {
        Result<Void> r = Result.error(404, "未找到");
        assertEquals(404, r.getCode());
        assertEquals("未找到", r.getMessage());
    }

    @Test
    void unauthorized_returns401() {
        Result<Void> r = Result.unauthorized("请先登录");
        assertEquals(401, r.getCode());
        assertEquals("请先登录", r.getMessage());
    }

    @Test
    void badRequest_returns400() {
        Result<Void> r = Result.badRequest("参数错误");
        assertEquals(400, r.getCode());
        assertEquals("参数错误", r.getMessage());
    }
}
