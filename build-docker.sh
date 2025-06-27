#!/bin/bash

# CF-Workers-SUB Express Docker构建和推送脚本

set -e

# 配置变量
IMAGE_NAME="cf-workers-sub-express"
DOCKER_USERNAME="your-dockerhub-username"  # 请修改为你的Docker Hub用户名
VERSION="latest"

echo "🐳 开始构建Docker镜像..."

# 构建镜像
echo "📦 构建镜像: ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} .

# 也创建一个带版本号的标签
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:${TIMESTAMP}

echo "✅ 镜像构建完成"
echo "📋 可用标签:"
echo "  - ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo "  - ${DOCKER_USERNAME}/${IMAGE_NAME}:${TIMESTAMP}"

# 询问是否推送到Docker Hub
read -p "🚀 是否推送到Docker Hub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 登录Docker Hub..."
    docker login
    
    echo "📤 推送镜像到Docker Hub..."
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${TIMESTAMP}
    
    echo "✅ 推送完成!"
    echo "🌐 镜像地址: https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
    echo ""
    echo "📋 使用方法:"
    echo "  docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
    echo "  docker run -d -p 5555:5555 --name cf-workers-sub ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
else
    echo "⏭️  跳过推送到Docker Hub"
fi

echo ""
echo "🎉 构建完成!"
echo "💡 本地测试命令:"
echo "  docker run -d -p 5555:5555 --name cf-workers-sub-test ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
