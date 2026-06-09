package com.helpmate.service;

import com.helpmate.vo.OrderVO;

import java.util.List;

public interface OrderService {

    Long acceptOrder(Long taskId, Long helperId);

    void completeOrder(Long orderId, Long userId);

    void cancelOrder(Long orderId, Long userId);

    List<OrderVO> myOrders(Long userId);

    List<OrderVO> myPublishedOrders(Long userId);

    OrderVO getOrderDetail(Long orderId, Long userId);
}
