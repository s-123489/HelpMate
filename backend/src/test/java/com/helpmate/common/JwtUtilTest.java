package com.helpmate.common;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "helpmate-super-secret-key-for-test-at-least-32-bytes");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken(1L, "testuser");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void parseToken_returnsCorrectSubject() {
        String token = jwtUtil.generateToken(42L, "alice");
        Claims claims = jwtUtil.parseToken(token);
        assertEquals("42", claims.getSubject());
    }

    @Test
    void parseToken_returnsCorrectUsername() {
        String token = jwtUtil.generateToken(1L, "bob");
        Claims claims = jwtUtil.parseToken(token);
        assertEquals("bob", claims.get("username", String.class));
    }

    @Test
    void getUserIdFromToken_returnsCorrectId() {
        String token = jwtUtil.generateToken(99L, "charlie");
        assertEquals(99L, jwtUtil.getUserIdFromToken(token));
    }

    @Test
    void parseToken_invalidToken_throws() {
        assertThrows(Exception.class, () -> jwtUtil.parseToken("invalid.token.here"));
    }

    @Test
    void generateToken_differentUsers_differentTokens() {
        String t1 = jwtUtil.generateToken(1L, "user1");
        String t2 = jwtUtil.generateToken(2L, "user2");
        assertNotEquals(t1, t2);
    }
}
