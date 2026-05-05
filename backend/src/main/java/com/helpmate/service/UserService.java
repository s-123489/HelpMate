package com.helpmate.service;

import com.helpmate.dto.LoginRequest;
import com.helpmate.dto.RegisterRequest;
import com.helpmate.vo.LoginVO;

public interface UserService {
    void register(RegisterRequest request);
    LoginVO login(LoginRequest request);
}
