package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.entity.User;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.mapper.UserMapper;
import com.helpmate.service.NotificationService;
import com.helpmate.service.TaskService;
import com.helpmate.service.WalletService;
import com.helpmate.vo.TaskListVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired private TaskMapper taskMapper;
    @Autowired private UserMapper userMapper;
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
    public Page<TaskListVO> listTasks(Integer page, Integer size, String category) {
        Page<Task> taskPage = new Page<>(page, size);
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<Task>()
                .eq(Task::getStatus, 0)
                .eq(StringUtils.hasText(category), Task::getCategory, category)
                .orderByDesc(Task::getCreatedAt);
        taskMapper.selectPage(taskPage, wrapper);

        List<TaskListVO> voList = enrichWithPublisher(taskPage.getRecords());

        Page<TaskListVO> voPage = new Page<>(taskPage.getCurrent(), taskPage.getSize(), taskPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    public List<TaskListVO> getMyPublishedTasks(Long userId) {
        // 查当前用户发布的所有任务（所有状态）
        List<Task> tasks = taskMapper.selectList(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getPublisherId, userId)
                        .orderByDesc(Task::getCreatedAt)
        );
        return enrichWithPublisher(tasks);
    }

    // 公共方法：批量补充发布者信息，转换为 VO
    private List<TaskListVO> enrichWithPublisher(List<Task> tasks) {
        List<Long> publisherIds = tasks.stream()
                .map(Task::getPublisherId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, User> userMap = publisherIds.isEmpty()
                ? Map.of()
                : userMapper.selectBatchIds(publisherIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return tasks.stream().map(task -> {
            User publisher = userMap.get(task.getPublisherId());
            String name = publisher != null ? publisher.getUsername() : "未知用户";
            return TaskListVO.from(task, name, null);
        }).collect(Collectors.toList());
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