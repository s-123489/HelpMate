package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.helpmate.entity.OrderInfo;
import com.helpmate.entity.Review;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.ReviewMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.NotificationService;
import com.helpmate.service.ReviewService;
import com.helpmate.vo.ReviewVO;
import com.helpmate.vo.UserProfileVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.OptionalDouble;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired private ReviewMapper reviewMapper;
    @Autowired private OrderInfoMapper orderInfoMapper;
    @Autowired private TaskMapper taskMapper;
    @Autowired private UserMapper userMapper;
    @Autowired private NotificationService notificationService;

    @Override
    public void submitReview(Long orderId, Long reviewerId, Integer score, String content) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("订单不存在");
        if (order.getStatus() != 1) throw new RuntimeException("只能对已完成的订单评价");

        Task task = taskMapper.selectById(order.getTaskId());
        boolean isPublisher = task.getPublisherId().equals(reviewerId);
        boolean isHelper = order.getHelperId().equals(reviewerId);
        if (!isPublisher && !isHelper) throw new RuntimeException("无权评价此订单");

        Long existing = reviewMapper.selectCount(new LambdaQueryWrapper<Review>()
                .eq(Review::getOrderId, orderId)
                .eq(Review::getReviewerId, reviewerId));
        if (existing > 0) throw new RuntimeException("您已评价过此订单");

        Long revieweeId = isPublisher ? order.getHelperId() : task.getPublisherId();

        Review review = new Review();
        review.setOrderId(orderId);
        review.setReviewerId(reviewerId);
        review.setRevieweeId(revieweeId);
        review.setScore(score);
        review.setContent(content);
        reviewMapper.insert(review);

        User reviewer = userMapper.selectById(reviewerId);
        notificationService.push(revieweeId, "NEW_REVIEW",
                "您收到一条新评价", reviewer.getUsername() + " 给您打了 " + score + " 分",
                orderId);
    }

    @Override
    public List<ReviewVO> getReviewsOfUser(Long revieweeId) {
        List<Review> reviews = reviewMapper.selectList(new LambdaQueryWrapper<Review>()
                .eq(Review::getRevieweeId, revieweeId)
                .orderByDesc(Review::getCreatedAt));
        return reviews.stream().map(r -> {
            ReviewVO vo = new ReviewVO();
            vo.setId(r.getId());
            vo.setOrderId(r.getOrderId());
            vo.setReviewerId(r.getReviewerId());
            vo.setScore(r.getScore());
            vo.setContent(r.getContent());
            vo.setCreatedAt(r.getCreatedAt());
            User reviewer = userMapper.selectById(r.getReviewerId());
            if (reviewer != null) vo.setReviewerName(reviewer.getUsername());
            return vo;
        }).toList();
    }

    @Override
    public UserProfileVO getUserProfile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new RuntimeException("用户不存在");

        List<Review> reviews = reviewMapper.selectList(new LambdaQueryWrapper<Review>()
                .eq(Review::getRevieweeId, userId));

        OptionalDouble avg = reviews.stream().mapToInt(Review::getScore).average();

        UserProfileVO vo = new UserProfileVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setPhone(user.getPhone());
        vo.setEmail(user.getEmail());
        vo.setAvatarUrl(user.getAvatarUrl());
        vo.setBalance(user.getBalance());
        vo.setAvgScore(avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null);
        vo.setReviewCount((long) reviews.size());
        return vo;
    }
}
