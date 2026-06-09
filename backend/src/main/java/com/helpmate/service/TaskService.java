package com.helpmate.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.vo.TaskListVO;

import java.util.List;

public interface TaskService {
    Long createTask(CreateTaskRequest request, Long publisherId);
    Page<TaskListVO> listTasks(Integer page, Integer size, String category);
    List<TaskListVO> getMyPublishedTasks(Long userId);
    Task getTaskById(Long taskId);
    void cancelTask(Long taskId, Long userId);
}