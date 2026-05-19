package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.OrderInfo;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.TaskService;
import com.helpmate.vo.TaskDetailVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskMapper taskMapper;

    @Autowired
    private OrderInfoMapper orderInfoMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public Long createTask(CreateTaskRequest request, Long publisherId) {
        Task task = new Task();
        task.setPublisherId(publisherId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCategory(request.getCategory());
        task.setReward(request.getReward());
        task.setStatus(0);
        task.setLocation(request.getLocation());
        task.setDeadline(request.getDeadline());
        taskMapper.insert(task);
        return task.getId();
    }

    @Override
    public Page<Task> listTasks(Integer page, Integer size, String category) {
        Page<Task> pageObj = new Page<>(page, size);
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<Task>()
                .eq(Task::getStatus, 0)
                .eq(StringUtils.hasText(category), Task::getCategory, category)
                .orderByDesc(Task::getCreatedAt);
        return taskMapper.selectPage(pageObj, wrapper);
    }

    @Override
    public TaskDetailVO getTaskDetail(Long taskId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        TaskDetailVO vo = TaskDetailVO.from(task);

        // 发布者信息
        User publisher = userMapper.selectById(task.getPublisherId());
        if (publisher != null) {
            vo.setPublisherName(publisher.getUsername());
            vo.setPublisherPhone(publisher.getPhone());
            vo.setPublisherAvatar(publisher.getAvatarUrl());
        }

        // 接单者信息（若已被接取）
        OrderInfo order = orderInfoMapper.selectOne(
                new LambdaQueryWrapper<OrderInfo>().eq(OrderInfo::getTaskId, taskId));
        if (order != null) {
            vo.setAccepterId(order.getHelperId());
            User accepter = userMapper.selectById(order.getHelperId());
            if (accepter != null) {
                vo.setAccepterName(accepter.getUsername());
                vo.setAccepterPhone(accepter.getPhone());
            }
        }
        return vo;
    }

    @Override
    @Transactional
    public void acceptTask(Long taskId, Long helperId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        if (task.getStatus() != 0) {
            throw new RuntimeException("任务已被接取或已结束");
        }
        if (task.getPublisherId().equals(helperId)) {
            throw new RuntimeException("不能接取自己发布的任务");
        }

        OrderInfo existing = orderInfoMapper.selectOne(
                new LambdaQueryWrapper<OrderInfo>().eq(OrderInfo::getTaskId, taskId));
        if (existing != null) {
            throw new RuntimeException("任务已被接取");
        }

        OrderInfo order = new OrderInfo();
        order.setTaskId(taskId);
        order.setHelperId(helperId);
        order.setStatus(0);
        orderInfoMapper.insert(order);

        task.setStatus(1);
        taskMapper.updateById(task);
    }

    @Override
    @Transactional
    public void completeTask(Long taskId, Long helperId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        if (task.getStatus() != 1) {
            throw new RuntimeException("任务当前状态无法完成");
        }
        OrderInfo order = orderInfoMapper.selectOne(
                new LambdaQueryWrapper<OrderInfo>().eq(OrderInfo::getTaskId, taskId));
        if (order == null || !order.getHelperId().equals(helperId)) {
            throw new RuntimeException("只有接单人可以完成任务");
        }

        order.setStatus(1);
        order.setCompletedAt(LocalDateTime.now());
        orderInfoMapper.updateById(order);

        task.setStatus(2);
        taskMapper.updateById(task);
    }
}
