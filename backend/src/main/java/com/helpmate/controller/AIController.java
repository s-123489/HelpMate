package com.helpmate.controller;

import com.helpmate.common.Result;
import com.helpmate.dto.AIChatRequest;
import com.helpmate.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public Result<String> chat(@Valid @RequestBody AIChatRequest request) {
        String reply = aiService.chat(request.getMessage());
        return Result.success(reply);
    }
}
