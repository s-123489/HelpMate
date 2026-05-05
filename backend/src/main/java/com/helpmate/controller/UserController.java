package com.helpmate.controller;

import com.helpmate.common.Result;
import com.helpmate.dto.LoginRequest;
import com.helpmate.dto.RegisterRequest;
import com.helpmate.service.UserService;
import com.helpmate.vo.LoginVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return Result.success("注册成功", null);
    }

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        LoginVO vo = userService.login(request);
        return Result.success("登录成功", vo);
    }
}
