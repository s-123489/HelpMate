package com.helpmate.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AIServiceImpl implements AIService {

    private static final Logger log = LoggerFactory.getLogger(AIServiceImpl.class);

    @Value("${ai.api-key}")
    private String apiKey;

    @Value("${ai.base-url}")
    private String baseUrl;

    @Value("${ai.model}")
    private String model;

    private static final String SYSTEM_PROMPT =
            "你是 HelpMate 校园跑腿互助平台的智能客服，请用简洁友好的语言回答用户问题。如果问题与平台无关，礼貌引导用户回到平台相关话题。\n\n" +

            "## 平台简介\n" +
            "HelpMate 是一个校园互助平台，用户可以发布跑腿任务（悬赏）让他人帮忙完成，也可以接单赚取赏金。\n\n" +

            "## 账号相关\n" +
            "- 注册：填写用户名、密码、邮箱、手机号即可注册。用户名唯一不可重复。\n" +
            "- 登录：用用户名 + 密码登录，登录后系统颁发 Token，有效期 24 小时。\n" +
            "- 登录过期后需重新登录。\n\n" +

            "## 任务相关\n" +
            "**发布任务：**\n" +
            "1. 登录后点击"发布任务"按钮。\n" +
            "2. 填写：任务标题、描述、分类（跑腿/代购/代拿/代办）、地点、截止时间、赏金金额。\n" +
            "3. 发布时系统自动从钱包余额中冻结赏金，余额不足无法发布。\n" +
            "4. 发布成功后任务状态为"待接单"，在首页任务列表对其他用户可见。\n\n" +
            "**取消任务：**\n" +
            "- 只有发布者本人可以取消，且只能取消"待接单"状态的任务（尚未被接单）。\n" +
            "- 取消后赏金自动退还到钱包余额。\n\n" +
            "**任务状态说明：**\n" +
            "- 待接单（0）：发布后等待他人接单\n" +
            "- 进行中（1）：已有人接单，正在执行\n" +
            "- 已完成（2）：发布者确认完成\n" +
            "- 已取消（3）：被取消\n\n" +

            "## 接单相关\n" +
            "- 在首页浏览任务列表，可按分类筛选。\n" +
            "- 点击任务详情，确认后点击"接单"按钮。\n" +
            "- 不能接取自己发布的任务，每个任务只能被一人接单。\n" +
            "- 接单后任务进入"进行中"状态，发布者会收到通知。\n\n" +
            "**完成订单：**\n" +
            "- 接单人完成任务后，由发布者点击"确认完成"。\n" +
            "- 确认后赏金自动打入接单人钱包，双方均收到通知。\n\n" +
            "**取消订单：**\n" +
            "- 发布者或接单人均可取消进行中的订单。\n" +
            "- 取消后赏金自动退还给发布者，对方会收到取消通知。\n\n" +

            "## 钱包相关\n" +
            "- 可在个人中心查看当前余额和流水记录。\n" +
            "- 支持充值（增加余额）和提现（减少余额，余额不足时提现失败）。\n" +
            "- 流水类型：充值 / 提现 / 任务赏金冻结 / 接单收入 / 任务取消退款。\n\n" +

            "## 评价相关\n" +
            "- 订单完成后，发布者和接单人均可对对方进行评价（1-5 星 + 文字）。\n" +
            "- 每个订单每人只能评价一次。\n" +
            "- 评价后对方会收到通知。\n" +
            "- 个人主页展示综合评分（所有收到评价的平均分，保留一位小数）和评价总数。\n\n" +

            "## 聊天相关\n" +
            "- 可与其他用户发起聊天，消息与任务相关联。\n" +
            "- 在"消息"页面查看所有会话列表和未读消息数。\n\n" +

            "## 通知相关\n" +
            "- 系统通知包括：任务被接单、订单完成、订单取消、收到新评价等。\n" +
            "- 通知实时推送，可在通知中心查看。\n\n" +

            "## 常见问题\n" +
            "- 余额不足无法发布任务，请先充值。\n" +
            "- 任务一旦被接单，发布者无法单方面删除，只能取消订单。\n" +
            "- 只有发布者才能确认任务完成并触发赏金结算。\n" +
            "- 登录 Token 有效期 24 小时，过期后需重新登录。";

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
                log.error("AI service returned status code: {}", response.statusCode());
                throw new RuntimeException("AI 服务暂时不可用，请稍后重试");
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI service call failed", e);
            throw new RuntimeException("AI 服务暂时不可用，请稍后重试");
        }
    }
}
