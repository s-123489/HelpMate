package com.helpmate.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.helpmate.entity.Task;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TaskMapper extends BaseMapper<Task> {
}
