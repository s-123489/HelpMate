package com.helpmate.service;

import com.helpmate.vo.ReviewVO;
import com.helpmate.vo.UserProfileVO;

import java.util.List;

public interface ReviewService {

    void submitReview(Long orderId, Long reviewerId, Integer score, String content);

    List<ReviewVO> getReviewsOfUser(Long revieweeId);

    UserProfileVO getUserProfile(Long userId);
}
