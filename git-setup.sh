#!/bin/bash

# CF-Workers-SUB Express Git仓库初始化脚本

set -e

echo "📁 初始化Git仓库..."

# 初始化Git仓库
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git仓库初始化完成"
else
    echo "ℹ️  Git仓库已存在"
fi

# 添加所有文件
echo "📋 添加文件到Git..."
git add .

# 创建初始提交
echo "💾 创建初始提交..."
git commit -m "Initial commit: CF-Workers-SUB Express版本

功能特性:
- ✅ 订阅聚合和格式转换
- ✅ 支持多种订阅格式 (base64, clash, singbox, surge, quanx, loon)
- ✅ Token访问控制
- ✅ Web管理界面
- ✅ Telegram通知
- ✅ Docker化部署
- ✅ 文件存储系统

部署方式:
- Docker Compose一键部署
- 支持环境变量配置
- 包含Nginx反向代理配置"

echo "✅ 初始提交完成"

# 显示仓库状态
echo ""
echo "📊 仓库状态:"
git status

echo ""
echo "🎉 Git仓库设置完成!"
echo ""
echo "📋 下一步操作:"
echo "1. 在GitHub/GitLab创建新仓库"
echo "2. 添加远程仓库: git remote add origin <仓库URL>"
echo "3. 推送代码: git push -u origin main"
echo ""
echo "💡 示例命令:"
echo "  git remote add origin https://github.com/username/cf-workers-sub-express.git"
echo "  git branch -M main"
echo "  git push -u origin main"
