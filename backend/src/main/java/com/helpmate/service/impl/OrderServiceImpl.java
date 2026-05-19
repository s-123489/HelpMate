package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.helpmate.entity.OrderInfo;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.NotificationService;
import com.helpmate.service.OrderService;
import com.helpmate.service.WalletService;
import com.helpmate.vo.OrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired private OrderInfoMapper orderInfoMapper;
    @Autowired private TaskMapper taskMapper;
    @Autowired private UserMapper userMapper;
    @Autowired private WalletService walletService;
    @Autowired private NotificationService notificationService;

    @Override
    @Transactional
    public Long acceptOrder(Long taskId, Long helperId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) throw new RuntimeException("任务不存在");
        if (task.getStatus() != 0) throw new RuntimeException("任务已被接单或不可接取");
        if (task.getPublisherId().equals(helperId)) throw new RuntimeException("不能接取自己发布的任务");

        Long existing = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
                .eq(OrderInfo::getTaskId, taskId));
        if (existing > 0) throw new RuntimeException("任务已被接单");

        OrderInfo order = new OrderInfo();
        order.setTaskId(taskId);
        order.setHelperId(helperId);
        order.setStatus(0);
        orderInfoMapper.insert(order);

        task.setStatus(1);
        taskMapper.updateById(task);

        User helper = userMapper.selectById(helperId);
        notificationService.push(task.getPublisherId(), "ORDER_ACCEPTED",
                "您的任务已被接单", helper.getUsername() + " 接受了您的任务：" + task.getTitle(),
                order.getId());

        return order.getId();
    }

    @Override
    @Transactional
    public void completeOrder(Long orderId, Long userId) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("订单不存在");

        Task task = taskMapper.selectById(order.getTaskId());
        if (!task.getPublisherId().equals(userId)) throw new RuntimeException("只有发布者才能确认完成");
        if (order.getStatus() != 0) throw new RuntimeException("订单状态异常");

        order.setStatus(1);
        order.setCompletedAt(LocalDateTime.now());
        orderInfoMapper.updateById(order);

        task.setStatus(2);
        taskMapper.updateById(task);

        walletService.releaseReward(task.getPublisherId(), order.getHelperId(), task.getReward(), orderId);

        notificationService.push(order.getHelperId(), "ORDER_COMPLETED",
                "任务已完成，赏金已到账", "任务《" + task.getTitle() + "》已完成，赏金 ¥" + task.getReward() + " 已到账",
                orderId);
        notificationService.push(task.getPublisherId(), "ORDER_COMPLETED",
                "任务已完成", "任务《" + task.getTitle() + "》已成功完成",
                orderId);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("订单不存在");

        Task task = taskMapper.selectById(order.getTaskId());
        boolean isPublisher = task.getPublisherId().equals(userId);
        boolean isHelper = order.getHelperId().equals(userId);
        if (!isPublisher && !isHelper) throw new RuntimeException("无权操作此订单");
        if (order.getStatus() != 0) throw new RuntimeException("订单已结束，无法取消");

        order.setStatus(2);
        orderInfoMapper.updateById(order);

        task.setStatus(3);
        taskMapper.updateById(task);

        walletService.refundReward(task.getPublisherId(), task.getReward(), orderId);

        String cancellerName = userMapper.selectById(userId).getUsername();
        Long otherUserId = isPublisher ? order.getHelperId() : task.getPublisherId();
        notificationService.push(otherUserId, "ORDER_CANCELLED",
                "订单已取消", cancellerName + " 取消了任务《" + task.getTitle() + "》，赏金已退还",
                orderId);
    }

    @Override
    public List<OrderVO> myOrders(Long userId) {
        List<OrderInfo> orders = orderInfoMapper.selectList(new LambdaQueryWrapper<OrderInfo>()
                .eq(OrderInfo::getHelperId, userId)
                .orderByDesc(OrderInfo::getCreatedAt));
        return toVOList(orders);
    }

    @Override
    public List<OrderVO> myPublishedOrders(Long userId) {
        List<Task> tasks = taskMapper.selectList(new LambdaQueryWrapper<Task>()
                .eq(Task::getPublisherId, userId)
                .in(Task::getStatus, 1, 2, 3)
                .orderByDesc(Task::getCreatedAt));
        List<Long> taskIds = tasks.stream().map(Task::getId).toList();
        if (taskIds.isEmpty()) return List.of();

        List<OrderInfo> orders = orderInfoMapper.selectList(new LambdaQueryWrapper<OrderInfo>()
                .in(OrderInfo::getTaskId, taskIds));
        return toVOList(orders);
    }

    @Override
    public OrderVO getOrderDetail(Long orderId, Long userId) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("订单不存在");
        Task task = taskMapper.selectById(order.getTaskId());
        if (!task.getPublisherId().equals(userId) && !order.getHelperId().equals(userId)) {
            throw new RuntimeException("无权查看此订单");
        }
        return toVO(order);
    }

    private List<OrderVO> toVOList(List<OrderInfo> orders) {
        if (orders.isEmpty()) return List.of();
        List<Long> taskIds = orders.stream().map(OrderInfo::getTaskId).toList();
        List<Long> helperIds = orders.stream().map(OrderInfo::getHelperId).toList();

        Map<Long, Task> taskMap = taskMapper.selectBatchIds(taskIds).stream()
                .collect(Collectors.toMap(Task::getId, Function.identity()));
        Map<Long, User> userMap = userMapper.selectBatchIds(helperIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return orders.stream().map(o -> {
            OrderVO vo = new OrderVO();
            vo.setId(o.getId());
            vo.setTaskId(o.getTaskId());
            vo.setHelperId(o.getHelperId());
            vo.setStatus(o.getStatus());
            vo.setRemark(o.getRemark());
            vo.setCreatedAt(o.getCreatedAt());
            vo.setCompletedAt(o.getCompletedAt());
            Task t = taskMap.get(o.getTaskId());
            if (t != null) { vo.setTaskTitle(t.getTitle()); vo.setReward(t.getReward()); }
            User u = userMap.get(o.getHelperId());
            if (u != null) vo.setHelperName(u.getUsername());
            return vo;
        }).toList();
    }

    private OrderVO toVO(OrderInfo o) {
        return toVOList(List.of(o)).get(0);
    }
}
