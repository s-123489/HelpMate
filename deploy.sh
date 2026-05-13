#!/bin/bash
set -e

echo "开始部署..."

# 重新构建并启动（开发环境）
docker compose up -d --build

echo "等待服务就绪..."
sleep 10

# 显示服务状态
docker compose ps

echo "部署完成，后端访问地址：http://localhost:8080"
