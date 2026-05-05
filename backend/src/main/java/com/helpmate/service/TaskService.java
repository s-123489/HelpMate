package com.helpmate.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;

public interface TaskService {
    Long createTask(CreateTaskRequest request, Long publisherId);
    Page<Task> listTasks(Integer page, Integer size, String category);
}
