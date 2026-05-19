package com.helpmate.controller;

import com.helpmate.common.Result;
import com.helpmate.dto.SubmitReviewRequest;
import com.helpmate.service.ReviewService;
import com.helpmate.vo.ReviewVO;
import com.helpmate.vo.UserProfileVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /** 提交评价 */
    @PostMapping("/submit")
    public Result<Void> submit(@Valid @RequestBody SubmitReviewRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        reviewService.submitReview(req.getOrderId(), userId, req.getScore(), req.getContent());
        return Result.success("评价成功");
    }

    /** 查看某用户收到的评价 */
    @GetMapping("/user/{userId}")
    public Result<List<ReviewVO>> userReviews(@PathVariable Long userId) {
        return Result.success(reviewService.getReviewsOfUser(userId));
    }

    /** 获取用户主页（含评分） */
    @GetMapping("/profile/{userId}")
    public Result<UserProfileVO> profile(@PathVariable Long userId) {
        return Result.success(reviewService.getUserProfile(userId));
    }

    /** 获取自己的主页 */
    @GetMapping("/profile/me")
    public Result<UserProfileVO> myProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(reviewService.getUserProfile(userId));
    }
}
