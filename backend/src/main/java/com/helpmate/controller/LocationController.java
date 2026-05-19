package com.helpmate.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.helpmate.common.Result;
import com.helpmate.dto.LocationReportRequest;
import com.helpmate.entity.LocationRecord;
import com.helpmate.entity.OrderInfo;
import com.helpmate.entity.Task;
import com.helpmate.mapper.LocationRecordMapper;
import com.helpmate.mapper.OrderInfoMapper;
import com.helpmate.mapper.TaskMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private LocationRecordMapper locationRecordMapper;

    @Autowired
    private OrderInfoMapper orderInfoMapper;

    @Autowired
    private TaskMapper taskMapper;

    /** HTTP 方式上报位置（备用，WebSocket 为主） */
    @PostMapping("/report")
    public Result<Void> report(@Valid @RequestBody LocationReportRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        OrderInfo order = orderInfoMapper.selectById(req.getOrderId());
        if (order == null || !order.getHelperId().equals(userId)) throw new RuntimeException("无权上报此订单位置");
        if (order.getStatus() != 0) throw new RuntimeException("订单已结束");

        LocationRecord record = new LocationRecord();
        record.setOrderId(req.getOrderId());
        record.setUserId(userId);
        record.setLatitude(req.getLatitude());
        record.setLongitude(req.getLongitude());
        locationRecordMapper.insert(record);
        return Result.success("位置已更新");
    }

    /** 查询某订单最新位置（发布者可查） */
    @GetMapping("/latest/{orderId}")
    public Result<LocationRecord> latest(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("订单不存在");
        Task task = taskMapper.selectById(order.getTaskId());
        if (!task.getPublisherId().equals(userId) && !order.getHelperId().equals(userId)) {
            throw new RuntimeException("无权查看此位置");
        }

        LocationRecord record = locationRecordMapper.selectOne(new LambdaQueryWrapper<LocationRecord>()
                .eq(LocationRecord::getOrderId, orderId)
                .orderByDesc(LocationRecord::getCreatedAt)
                .last("LIMIT 1"));
        return Result.success(record);
    }
}
