package com.helpmate.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.helpmate.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface MessageMapper extends BaseMapper<Message> {

    /** 获取两人之间的聊天记录（按时间升序） */
    @Select("""
        SELECT * FROM message
        WHERE (sender_id = #{userId} AND receiver_id = #{otherId})
           OR (sender_id = #{otherId} AND receiver_id = #{userId})
        ORDER BY created_at ASC
        """)
    List<Message> findConversation(@Param("userId") Long userId,
                                   @Param("otherId") Long otherId);

    /** 标记对方发给我的消息为已读 */
    @Update("""
        UPDATE message SET is_read = true
        WHERE sender_id = #{senderId} AND receiver_id = #{receiverId} AND is_read = false
        """)
    void markAsRead(@Param("senderId") Long senderId,
                    @Param("receiverId") Long receiverId);

    /** 获取我所有会话的最新一条消息（用于生成会话列表） */
    @Select("""
        SELECT * FROM message
        WHERE id IN (
            SELECT MAX(id) FROM message
            WHERE sender_id = #{userId} OR receiver_id = #{userId}
            GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
        )
        ORDER BY created_at DESC
        """)
    List<Message> findLatestMessagesPerConversation(@Param("userId") Long userId);

    /** 统计某人发给我的未读消息数 */
    @Select("""
        SELECT COUNT(*) FROM message
        WHERE sender_id = #{senderId} AND receiver_id = #{receiverId} AND is_read = false
        """)
    Integer countUnread(@Param("senderId") Long senderId,
                        @Param("receiverId") Long receiverId);
}