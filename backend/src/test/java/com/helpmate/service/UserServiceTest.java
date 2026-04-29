package com.helpmate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.helpmate.common.JwtUtil;
import com.helpmate.dto.LoginRequest;
import com.helpmate.dto.RegisterRequest;
import com.helpmate.entity.User;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.impl.UserServiceImpl;
import com.helpmate.vo.LoginVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setPasswordHash(encoder.encode("password123"));
        mockUser.setEmail("test@example.com");
        mockUser.setBalance(BigDecimal.ZERO);
        mockUser.setStatus(1);
    }

    // ===== register =====

    @Test
    void register_success() {
        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.<User>insert(any(User.class))).thenReturn(1);

        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("password123");
        req.setEmail("new@example.com");
        req.setPhone("13800138000");

        assertDoesNotThrow(() -> userService.register(req));
        verify(userMapper).<User>insert(any(User.class));
    }

    @Test
    void register_duplicateUsername_throwsException() {
        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        RegisterRequest req = new RegisterRequest();
        req.setUsername("testuser");
        req.setPassword("password123");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.register(req));
        assertEquals("用户名已存在", ex.getMessage());
        verify(userMapper, never()).<User>insert(any(User.class));
    }

    @Test
    void register_passwordIsEncrypted() {
        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.<User>insert(any(User.class))).thenAnswer(inv -> {
            User saved = inv.getArgument(0);
            // 确保存储的是 BCrypt 哈希而非明文
            assertNotEquals("password123", saved.getPasswordHash());
            assertTrue(saved.getPasswordHash().startsWith("$2a$"));
            return 1;
        });

        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("password123");

        userService.register(req);
    }

    @Test
    void register_balanceDefaultZero() {
        when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.<User>insert(any(User.class))).thenAnswer(inv -> {
            User saved = inv.getArgument(0);
            assertEquals(BigDecimal.ZERO, saved.getBalance());
            assertEquals(1, saved.getStatus());
            return 1;
        });

        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("password123");

        userService.register(req);
    }

    // ===== login =====

    @Test
    void login_success_returnsToken() {
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(mockUser);
        when(jwtUtil.generateToken(anyLong(), anyString())).thenReturn("mock-jwt-token");

        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("password123");

        LoginVO vo = userService.login(req);

        assertNotNull(vo);
        assertEquals("mock-jwt-token", vo.getToken());
        assertEquals("testuser", vo.getUsername());
    }

    @Test
    void login_userNotFound_throwsException() {
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        LoginRequest req = new LoginRequest();
        req.setUsername("nobody");
        req.setPassword("password123");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.login(req));
        assertEquals("用户名或密码错误", ex.getMessage());
    }

    @Test
    void login_wrongPassword_throwsException() {
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(mockUser);

        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("wrongpassword");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.login(req));
        assertEquals("用户名或密码错误", ex.getMessage());
        verify(jwtUtil, never()).generateToken(anyLong(), anyString());
    }

    @Test
    void login_callsGenerateTokenWithCorrectUserId() {
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(mockUser);
        when(jwtUtil.generateToken(1L, "testuser")).thenReturn("token-for-user-1");

        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("password123");

        LoginVO vo = userService.login(req);

        verify(jwtUtil).generateToken(1L, "testuser");
        assertEquals("token-for-user-1", vo.getToken());
    }
}
