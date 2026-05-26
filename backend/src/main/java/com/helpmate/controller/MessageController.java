package com.helpmate.controller;

import com.helpmate.common.Result;
import com.helpmate.dto.SendMessageRequest;
import com.helpmate.entity.Message;
import com.helpmate.service.MessageService;
import com.helpmate.vo.ConversationVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    /** 发送消息 */
    @PostMapping("/send")
    public Result<Message> send(@Valid @RequestBody SendMessageRequest request,
                                HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        Message msg = messageService.sendMessage(request, userId);
        return Result.success(msg);
    }

    /** 获取与某人的聊天记录（同时标记已读） */
    @GetMapping("/conversation/{otherId}")
    public Result<List<Message>> conversation(@PathVariable Long otherId,
                                              HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.success(messageService.getConversation(userId, otherId));
    }

    /** 获取我的会话列表 */
    @GetMapping("/conversations")
    public Result<List<ConversationVO>> conversations(HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.success(messageService.getConversations(userId));
    }
}