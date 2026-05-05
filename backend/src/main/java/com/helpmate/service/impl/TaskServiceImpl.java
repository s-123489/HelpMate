package com.helpmate.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.mapper.TaskMapper;
import com.helpmate.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskMapper taskMapper;

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
}
