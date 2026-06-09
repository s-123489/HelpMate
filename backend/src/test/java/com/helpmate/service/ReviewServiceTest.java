package com.helpmate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.helpmate.entity.OrderInfo;
import com.helpmate.entity.Review;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.ReviewMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.impl.ReviewServiceImpl;
import com.helpmate.vo.ReviewVO;
import com.helpmate.vo.UserProfileVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewMapper reviewMapper;
    @Mock private OrderInfoMapper orderInfoMapper;
    @Mock private TaskMapper taskMapper;
    @Mock private UserMapper userMapper;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private OrderInfo completedOrder;
    private Task task;
    private User reviewer;

    @BeforeEach
    void setUp() {
        completedOrder = new OrderInfo();
        completedOrder.setId(1L);
        completedOrder.setTaskId(1L);
        completedOrder.setHelperId(2L);
        completedOrder.setStatus(1);

        task = new Task();
        task.setId(1L);
        task.setPublisherId(1L);
        task.setTitle("帮我取快递");

        reviewer = new User();
        reviewer.setId(1L);
        reviewer.setUsername("publisher");
    }

    // ===== submitReview =====

    @Test
    void submitReview_byPublisher_success() {
        when(orderInfoMapper.selectById(1L)).thenReturn(completedOrder);
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(reviewMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.selectById(1L)).thenReturn(reviewer);

        assertDoesNotThrow(() -> reviewService.submitReview(1L, 1L, 5, "非常好"));

        verify(reviewMapper).insert(argThat(r ->
                r.getReviewerId().equals(1L) && r.getRevieweeId().equals(2L) && r.getScore() == 5));
        verify(notificationService).push(eq(2L), eq("NEW_REVIEW"), anyString(), anyString(), anyLong());
    }

    @Test
    void submitReview_byHelper_success() {
        when(orderInfoMapper.selectById(1L)).thenReturn(completedOrder);
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(reviewMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.selectById(2L)).thenReturn(reviewer);

        assertDoesNotThrow(() -> reviewService.submitReview(1L, 2L, 4, "还行"));

        verify(reviewMapper).insert(argThat(r ->
                r.getReviewerId().equals(2L) && r.getRevieweeId().equals(1L)));
    }

    @Test
    void submitReview_orderNotFound_throws() {
        when(orderInfoMapper.selectById(99L)).thenReturn(null);
        assertThrows(RuntimeException.class, () -> reviewService.submitReview(99L, 1L, 5, "好"));
    }

    @Test
    void submitReview_orderNotCompleted_throws() {
        completedOrder.setStatus(0);
        when(orderInfoMapper.selectById(1L)).thenReturn(completedOrder);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reviewService.submitReview(1L, 1L, 5, "好"));
        assertEquals("只能对已完成的订单评价", ex.getMessage());
    }

    @Test
    void submitReview_unauthorized_throws() {
        when(orderInfoMapper.selectById(1L)).thenReturn(completedOrder);
        when(taskMapper.selectById(1L)).thenReturn(task);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reviewService.submitReview(1L, 3L, 5, "好"));
        assertEquals("无权评价此订单", ex.getMessage());
    }

    @Test
    void submitReview_alreadyReviewed_throws() {
        when(orderInfoMapper.selectById(1L)).thenReturn(completedOrder);
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(reviewMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reviewService.submitReview(1L, 1L, 5, "好"));
        assertEquals("您已评价过此订单", ex.getMessage());
    }

    // ===== getReviewsOfUser =====

    @Test
    void getReviewsOfUser_returnsVOs() {
        Review r = new Review();
        r.setId(1L);
        r.setOrderId(1L);
        r.setReviewerId(1L);
        r.setRevieweeId(2L);
        r.setScore(5);
        r.setContent("很棒");

        when(reviewMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(r));
        when(userMapper.selectById(1L)).thenReturn(reviewer);

        List<ReviewVO> result = reviewService.getReviewsOfUser(2L);

        assertEquals(1, result.size());
        assertEquals(5, result.get(0).getScore());
        assertEquals("publisher", result.get(0).getReviewerName());
    }

    @Test
    void getReviewsOfUser_noReviews_returnsEmpty() {
        when(reviewMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of());
        assertTrue(reviewService.getReviewsOfUser(1L).isEmpty());
    }

    // ===== getUserProfile =====

    @Test
    void getUserProfile_withReviews_calculatesAvgScore() {
        User user = new User();
        user.setId(1L);
        user.setUsername("user1");
        user.setBalance(new BigDecimal("100.00"));

        Review r1 = new Review(); r1.setScore(5);
        Review r2 = new Review(); r2.setScore(3);

        when(userMapper.selectById(1L)).thenReturn(user);
        when(reviewMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(r1, r2));

        UserProfileVO vo = reviewService.getUserProfile(1L);

        assertEquals(4.0, vo.getAvgScore());
        assertEquals(2L, vo.getReviewCount());
        assertEquals("user1", vo.getUsername());
    }

    @Test
    void getUserProfile_noReviews_avgScoreIsNull() {
        User user = new User();
        user.setId(1L);
        user.setUsername("user1");
        user.setBalance(BigDecimal.ZERO);

        when(userMapper.selectById(1L)).thenReturn(user);
        when(reviewMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of());

        UserProfileVO vo = reviewService.getUserProfile(1L);

        assertNull(vo.getAvgScore());
        assertEquals(0L, vo.getReviewCount());
    }

    @Test
    void getUserProfile_userNotFound_throws() {
        when(userMapper.selectById(99L)).thenReturn(null);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reviewService.getUserProfile(99L));
        assertEquals("用户不存在", ex.getMessage());
    }
}
