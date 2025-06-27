#!/bin/bash

# CF-Workers-SUB Express 一键部署脚本
# 适用于 Debian 12 系统

set -e

echo "🚀 开始部署 CF-Workers-SUB Express 服务..."

# 检查系统
if [ ! -f /etc/debian_version ]; then
    echo "❌ 此脚本仅支持 Debian 系统"
    exit 1
fi

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装必要软件
echo "🔧 安装必要软件..."
sudo apt install -y curl wget git unzip

# 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
else
    echo "✅ Docker 已安装"
fi

# 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose 已安装"
fi

# 创建项目目录
PROJECT_DIR="/opt/cf-workers-sub"
echo "📁 创建项目目录: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# 复制项目文件（假设当前目录有项目文件）
echo "📋 复制项目文件..."
if [ -f "../sub-express/package.json" ]; then
    cp -r ../sub-express/* .
else
    echo "❌ 未找到项目文件，请确保在正确的目录运行此脚本"
    exit 1
fi

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "⚙️ 创建环境变量文件..."
    cp .env.example .env
    
    # 生成随机token
    RANDOM_TOKEN=$(openssl rand -hex 16)
    sed -i "s/TOKEN=auto/TOKEN=$RANDOM_TOKEN/" .env
    
    echo "🔑 已生成随机TOKEN: $RANDOM_TOKEN"
    echo "📝 请编辑 .env 文件配置其他参数"
fi

# 创建数据目录
mkdir -p data logs

# 构建并启动服务
echo "🏗️ 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🎉 部署完成！"
    echo "📍 服务地址: http://$(curl -s ifconfig.me):3000"
    echo "🔑 访问令牌: $(grep TOKEN= .env | cut -d'=' -f2)"
    echo "🌐 管理界面: http://$(curl -s ifconfig.me):3000/$(grep TOKEN= .env | cut -d'=' -f2)"
    echo ""
    echo "📋 常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo "  更新服务: docker-compose pull && docker-compose up -d"
    echo ""
    echo "⚠️ 注意事项:"
    echo "  1. 请确保防火墙开放 3000 端口"
    echo "  2. 生产环境建议配置域名和SSL证书"
    echo "  3. 定期备份 data 目录"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker-compose logs
    exit 1
fi
