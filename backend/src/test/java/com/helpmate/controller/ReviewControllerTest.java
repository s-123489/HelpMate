package com.helpmate.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helpmate.common.AuthInterceptor;
import com.helpmate.dto.SubmitReviewRequest;
import com.helpmate.service.ReviewService;
import com.helpmate.vo.ReviewVO;
import com.helpmate.vo.UserProfileVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReviewController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@Import(com.helpmate.common.GlobalExceptionHandler.class)
class ReviewControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private ReviewService reviewService;
    @MockBean private com.helpmate.common.JwtUtil jwtUtil;
    @MockBean private AuthInterceptor authInterceptor;
    @Autowired private ObjectMapper objectMapper;

    @BeforeEach
    void bypassInterceptor() throws Exception {
        when(authInterceptor.preHandle(
                any(HttpServletRequest.class),
                any(HttpServletResponse.class),
                any()
        )).thenAnswer(inv -> {
            HttpServletRequest req = inv.getArgument(0);
            req.setAttribute("userId", 1L);
            return true;
        });
    }

    // ===== POST /api/review/submit =====

    @Test
    void submit_success_returns200() throws Exception {
        doNothing().when(reviewService).submitReview(1L, 1L, 5, "很棒");

        SubmitReviewRequest req = new SubmitReviewRequest();
        req.setOrderId(1L);
        req.setScore(5);
        req.setContent("很棒");

        mockMvc.perform(post("/api/review/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("评价成功"));
    }

    @Test
    void submit_missingOrderId_returns400() throws Exception {
        SubmitReviewRequest req = new SubmitReviewRequest();
        req.setScore(5);

        mockMvc.perform(post("/api/review/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
        verify(reviewService, never()).submitReview(any(), any(), any(), any());
    }

    @Test
    void submit_scoreTooHigh_returns400() throws Exception {
        SubmitReviewRequest req = new SubmitReviewRequest();
        req.setOrderId(1L);
        req.setScore(6);

        mockMvc.perform(post("/api/review/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void submit_scoreTooLow_returns400() throws Exception {
        SubmitReviewRequest req = new SubmitReviewRequest();
        req.setOrderId(1L);
        req.setScore(0);

        mockMvc.perform(post("/api/review/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void submit_serviceThrows_returns500() throws Exception {
        doThrow(new RuntimeException("您已评价过此订单"))
                .when(reviewService).submitReview(any(), any(), any(), any());

        SubmitReviewRequest req = new SubmitReviewRequest();
        req.setOrderId(1L);
        req.setScore(5);

        mockMvc.perform(post("/api/review/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("您已评价过此订单"));
    }

    // ===== GET /api/review/user/{userId} =====

    @Test
    void userReviews_returnsReviewList() throws Exception {
        ReviewVO vo = new ReviewVO();
        vo.setId(1L);
        vo.setScore(5);
        vo.setReviewerName("张三");

        when(reviewService.getReviewsOfUser(2L)).thenReturn(List.of(vo));

        mockMvc.perform(get("/api/review/user/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].score").value(5))
                .andExpect(jsonPath("$.data[0].reviewerName").value("张三"));
    }

    // ===== GET /api/review/profile/{userId} =====

    @Test
    void profile_returnsUserProfileVO() throws Exception {
        UserProfileVO vo = new UserProfileVO();
        vo.setId(2L);
        vo.setUsername("李四");
        vo.setBalance(new BigDecimal("100.00"));
        vo.setAvgScore(4.5);
        vo.setReviewCount(10L);

        when(reviewService.getUserProfile(2L)).thenReturn(vo);

        mockMvc.perform(get("/api/review/profile/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("李四"))
                .andExpect(jsonPath("$.data.avgScore").value(4.5));
    }

    @Test
    void profile_userNotFound_returns500() throws Exception {
        when(reviewService.getUserProfile(99L)).thenThrow(new RuntimeException("用户不存在"));

        mockMvc.perform(get("/api/review/profile/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    // ===== GET /api/review/profile/me =====

    @Test
    void myProfile_returnsCurrentUserProfile() throws Exception {
        UserProfileVO vo = new UserProfileVO();
        vo.setId(1L);
        vo.setUsername("自己");

        when(reviewService.getUserProfile(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/review/profile/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("自己"));
    }
}
