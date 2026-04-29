package com.helpmate.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.service.AIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AIServiceImpl implements AIService {

    @Value("${ai.api-key}")
    private String apiKey;

    @Value("${ai.base-url}")
    private String baseUrl;

    @Value("${ai.model}")
    private String model;

    private static final String SYSTEM_PROMPT =
            "你是 HelpMate 校园跑腿互助平台的智能客服。平台功能：发布跑腿任务（取快递、送餐、代购等）、接单赚钱、钱包充值提现。" +
            "请用简洁友好的语言回答用户问题，如果是与平台无关的话题，礼貌引导用户回到平台相关问题。";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String chat(String message) {
        try {
            String requestBody = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
                put("model", model);
                put("messages", new Object[]{
                        new java.util.HashMap<>() {{
                            put("role", "system");
                            put("content", SYSTEM_PROMPT);
                        }},
                        new java.util.HashMap<>() {{
                            put("role", "user");
                            put("content", message);
                        }}
                });
            }});

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("AI 服务请求失败，状态码：" + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("AI 服务调用失败：" + e.getMessage());
        }
    }
}
