package com.helpmate.service;

import com.helpmate.dto.SendMessageRequest;
import com.helpmate.entity.Message;
import com.helpmate.vo.ConversationVO;

import java.util.List;

public interface MessageService {

    /** 发送消息，返回完整消息对象 */
    Message sendMessage(SendMessageRequest request, Long senderId);

    /** 获取与某人的聊天记录，同时标记对方消息为已读 */
    List<Message> getConversation(Long myId, Long otherId);

    /** 获取我的会话列表（每个会话显示最新一条消息） */
    List<ConversationVO> getConversations(Long myId);
}