package com.helpmate.controller;

import com.helpmate.common.Result;
import com.helpmate.dto.AcceptOrderRequest;
import com.helpmate.service.OrderService;
import com.helpmate.vo.OrderVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /** 接单 */
    @PostMapping("/accept")
    public Result<Long> accept(@Valid @RequestBody AcceptOrderRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long orderId = orderService.acceptOrder(req.getTaskId(), userId);
        return Result.success("接单成功", orderId);
    }

    /** 确认完成（发布者操作） */
    @PostMapping("/{orderId}/complete")
    public Result<Void> complete(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        orderService.completeOrder(orderId, userId);
        return Result.success("任务已完成，赏金已发放");
    }

    /** 取消订单 */
    @PostMapping("/{orderId}/cancel")
    public Result<Void> cancel(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        orderService.cancelOrder(orderId, userId);
        return Result.success("订单已取消");
    }

    /** 我接的单 */
    @GetMapping("/my-orders")
    public Result<List<OrderVO>> myOrders(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(orderService.myOrders(userId));
    }

    /** 我发布的任务的订单 */
    @GetMapping("/my-published")
    public Result<List<OrderVO>> myPublished(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(orderService.myPublishedOrders(userId));
    }

    /** 订单详情 */
    @GetMapping("/{orderId}")
    public Result<OrderVO> detail(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(orderService.getOrderDetail(orderId, userId));
    }
}
