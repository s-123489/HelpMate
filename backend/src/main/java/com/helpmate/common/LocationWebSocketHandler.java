package com.helpmate.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.entity.LocationRecord;
import com.helpmate.mapper.LocationRecordMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket 接单人位置上报
 * 客户端连接时在 URL 中带 ?token=xxx&orderId=xxx
 * 发送消息格式: {"latitude": 39.9, "longitude": 116.4}
 */
@Slf4j
@Component
public class LocationWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Autowired
    private LocationRecordMapper locationRecordMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : "";
        String token = extractParam(query, "token");
        String orderId = extractParam(query, "orderId");

        if (token == null || orderId == null) {
            closeSession(session, "缺少 token 或 orderId 参数");
            return;
        }

        try {
            Long userId = jwtUtil.getUserIdFromToken(token);
            session.getAttributes().put("userId", userId);
            session.getAttributes().put("orderId", Long.parseLong(orderId));
            sessions.put(orderId + ":" + userId, session);
            log.info("位置WebSocket已连接, orderId={}, userId={}", orderId, userId);
        } catch (Exception e) {
            closeSession(session, "token 无效");
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        Long orderId = (Long) session.getAttributes().get("orderId");
        if (userId == null || orderId == null) return;

        @SuppressWarnings("unchecked")
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        BigDecimal lat = new BigDecimal(payload.get("latitude").toString());
        BigDecimal lng = new BigDecimal(payload.get("longitude").toString());

        LocationRecord record = new LocationRecord();
        record.setOrderId(orderId);
        record.setUserId(userId);
        record.setLatitude(lat);
        record.setLongitude(lng);
        locationRecordMapper.insert(record);

        session.sendMessage(new TextMessage("{\"status\":\"ok\"}"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = (Long) session.getAttributes().get("userId");
        Long orderId = (Long) session.getAttributes().get("orderId");
        if (userId != null && orderId != null) {
            sessions.remove(orderId + ":" + userId);
        }
    }

    private String extractParam(String query, String key) {
        if (query == null) return null;
        for (String part : query.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key)) return kv[1];
        }
        return null;
    }

    private void closeSession(WebSocketSession session, String reason) {
        try {
            session.close(CloseStatus.BAD_DATA.withReason(reason));
        } catch (Exception ignored) {}
    }
}
