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
        return Result.success(taskService.listTasks(page, size, category));
    }

    @GetMapping("/{taskId}")
    public Result<Task> detail(@PathVariable Long taskId) {
        return Result.success(taskService.getTaskById(taskId));
    }

    @PostMapping("/{taskId}/cancel")
    public Result<Void> cancel(@PathVariable Long taskId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        taskService.cancelTask(taskId, userId);
        return Result.success("任务已取消，赏金已退还");
    }
}

