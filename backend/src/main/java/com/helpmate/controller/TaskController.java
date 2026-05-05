package com.helpmate.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.helpmate.common.Result;
import com.helpmate.dto.CreateTaskRequest;
import com.helpmate.entity.Task;
import com.helpmate.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/task")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping("/create")
    public Result<Long> createTask(@Valid @RequestBody CreateTaskRequest request,
                                   HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        Long taskId = taskService.createTask(request, userId);
        return Result.success("发布成功", taskId);
    }

    @GetMapping("/list")
    public Result<Page<Task>> listTasks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String category) {
        Page<Task> result = taskService.listTasks(page, size, category);
        return Result.success(result);
    }
}
