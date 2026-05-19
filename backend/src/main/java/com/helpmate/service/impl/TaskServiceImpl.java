package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.service.NotificationService;
import com.helpmate.service.TaskService;
import com.helpmate.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired private TaskMapper taskMapper;
    @Autowired private WalletService walletService;
    @Autowired private OrderInfoMapper orderInfoMapper;
    @Autowired private NotificationService notificationService;

    @Override
    @Transactional
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

        walletService.freezeReward(publisherId, request.getReward(), task.getId());
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
    public Task getTaskById(Long taskId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) throw new RuntimeException("任务不存在");
        return task;
    }

    @Override
    @Transactional
    public void cancelTask(Long taskId, Long userId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) throw new RuntimeException("任务不存在");
        if (!task.getPublisherId().equals(userId)) throw new RuntimeException("只有发布者才能取消任务");
        if (task.getStatus() != 0) throw new RuntimeException("只有待接单的任务才能取消");

        task.setStatus(3);
        taskMapper.updateById(task);

        walletService.refundReward(userId, task.getReward(), null);
    }
}

